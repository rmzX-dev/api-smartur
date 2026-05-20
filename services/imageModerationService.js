/**
 * Moderación de imágenes subidas por usuarios (comunidad, avatares, registro).
 *
 * Proveedor por defecto: sightengine
 * Variables: IMAGE_MODERATION_* (alias legacy COMMUNITY_MODERATION_*)
 */

const LIKELY_LEVELS = new Set(['LIKELY', 'VERY_LIKELY']);

const REJECT_MESSAGE =
    'La imagen no cumple las normas de la comunidad. Elige otra foto apta para todos los públicos.';

function envMode() {
    const raw = (
        process.env.IMAGE_MODERATION_MODE ||
        process.env.COMMUNITY_MODERATION_MODE ||
        'required'
    ).toLowerCase();
    if (raw === 'off' || raw === 'disabled' || raw === 'false') return 'off';
    if (raw === 'optional') return 'optional';
    return 'required';
}

function envProvider() {
    const explicit = (
        process.env.IMAGE_MODERATION_PROVIDER ||
        process.env.COMMUNITY_MODERATION_PROVIDER ||
        'sightengine'
    )
        .toLowerCase()
        .trim();
    if (explicit === 'off' || explicit === 'none') return 'off';
    if (explicit === 'google_vision' || explicit === 'vision') return 'google_vision';
    if (explicit === 'sightengine') return 'sightengine';
    if (process.env.SIGHTENGINE_API_USER?.trim() && process.env.SIGHTENGINE_API_SECRET?.trim()) {
        return 'sightengine';
    }
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY?.trim()) return 'google_vision';
    return 'sightengine';
}

function hasProviderCredentials(provider) {
    if (provider === 'google_vision') {
        return Boolean(process.env.GOOGLE_CLOUD_VISION_API_KEY?.trim());
    }
    if (provider === 'sightengine') {
        return Boolean(
            process.env.SIGHTENGINE_API_USER?.trim() &&
                process.env.SIGHTENGINE_API_SECRET?.trim(),
        );
    }
    return false;
}

function isUnsafeGoogleSafeSearch(safe) {
    if (!safe || typeof safe !== 'object') return false;
    const keys = ['adult', 'violence', 'racy'];
    return keys.some((k) => LIKELY_LEVELS.has(String(safe[k] || '').toUpperCase()));
}

async function moderateWithGoogleVision(buffer) {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('GOOGLE_CLOUD_VISION_API_KEY no configurada');
    }
    const base64 = buffer.toString('base64');
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requests: [
                {
                    image: { content: base64 },
                    features: [{ type: 'SAFE_SEARCH_DETECTION', maxResults: 1 }],
                },
            ],
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error?.message || res.statusText || 'Vision API error';
        throw new Error(msg);
    }
    const safe = data?.responses?.[0]?.safeSearchAnnotation;
    if (data?.responses?.[0]?.error) {
        throw new Error(data.responses[0].error.message || 'Vision API error');
    }
    return {
        provider: 'google_vision',
        safe,
        rejected: isUnsafeGoogleSafeSearch(safe),
    };
}

async function moderateWithSightengine(buffer, mimetype) {
    const apiUser = process.env.SIGHTENGINE_API_USER?.trim();
    const apiSecret = process.env.SIGHTENGINE_API_SECRET?.trim();
    if (!apiUser || !apiSecret) {
        throw new Error('Sightengine no configurado (SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET)');
    }
    const form = new FormData();
    const blob = new Blob([buffer], { type: mimetype || 'image/jpeg' });
    form.append('media', blob, 'upload.jpg');
    form.append('models', 'nudity-2.1,offensive,wad');
    form.append('api_user', apiUser);
    form.append('api_secret', apiSecret);

    const res = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Sightengine error');
    }
    const nudityRaw = Number(data?.nudity?.raw ?? 0);
    const nudityPartial = Number(data?.nudity?.partial ?? 0);
    const offensiveProb = Number(data?.offensive?.prob ?? 0);
    const weaponProb = Number(data?.weapon?.prob ?? 0);
    const alcoholProb = Number(data?.alcohol?.prob ?? 0);
    const drugsProb = Number(data?.drugs?.prob ?? 0);

    const nudityThreshold = Number(process.env.SIGHTENGINE_NUDITY_THRESHOLD || 0.55);
    const offensiveThreshold = Number(process.env.SIGHTENGINE_OFFENSIVE_THRESHOLD || 0.6);
    const substanceThreshold = Number(process.env.SIGHTENGINE_SUBSTANCE_THRESHOLD || 0.75);

    const rejected =
        nudityRaw >= nudityThreshold ||
        nudityPartial >= nudityThreshold ||
        offensiveProb >= offensiveThreshold ||
        weaponProb >= offensiveThreshold ||
        alcoholProb >= substanceThreshold ||
        drugsProb >= substanceThreshold;

    return {
        provider: 'sightengine',
        scores: { nudityRaw, nudityPartial, offensiveProb, weaponProb, alcoholProb, drugsProb },
        rejected,
    };
}

/**
 * @param {Buffer} buffer
 * @param {{ mimetype?: string }} [opts]
 */
export async function moderateImage(buffer, opts = {}) {
    const mode = envMode();
    if (mode === 'off') {
        return { skipped: true, rejected: false };
    }

    const provider = envProvider();
    if (provider === 'off' || !hasProviderCredentials(provider)) {
        if (mode === 'required') {
            throw new Error(
                'Moderación obligatoria: configura SIGHTENGINE_API_USER y SIGHTENGINE_API_SECRET',
            );
        }
        return { skipped: true, rejected: false };
    }

    let result;
    if (provider === 'google_vision') {
        result = await moderateWithGoogleVision(buffer);
    } else if (provider === 'sightengine') {
        result = await moderateWithSightengine(buffer, opts.mimetype);
    } else {
        return { skipped: true, rejected: false };
    }

    if (result.rejected) {
        return {
            skipped: false,
            rejected: true,
            provider: result.provider,
            reason: 'content_policy',
        };
    }
    return { skipped: false, rejected: false, provider: result.provider };
}

/** @deprecated alias */
export const moderateCommunityImage = moderateImage;

/**
 * Responde 422/503 si no pasa. @returns {Promise<boolean>} true si puede continuar
 */
export async function ensureImagePassesModeration(req, res) {
    if (!req.file?.buffer) return true;
    try {
        const moderation = await moderateImage(req.file.buffer, {
            mimetype: req.file.mimetype,
        });
        if (moderation.rejected) {
            res.status(422).json({
                message: REJECT_MESSAGE,
                code: 'IMAGE_MODERATION_REJECTED',
            });
            return false;
        }
        return true;
    } catch (modErr) {
        console.error('image moderation error:', modErr);
        res.status(503).json({
            message: 'No se pudo verificar la imagen en este momento. Inténtalo más tarde.',
            code: 'IMAGE_MODERATION_UNAVAILABLE',
        });
        return false;
    }
}

export function imageModerationStatus() {
    const mode = envMode();
    const provider = envProvider();
    return {
        mode,
        provider: mode === 'off' ? 'off' : provider,
        configured: provider !== 'off' && hasProviderCredentials(provider),
    };
}

/** @deprecated alias */
export const communityModerationStatus = imageModerationStatus;
