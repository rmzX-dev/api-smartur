const parseNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const parseBoolean = (value) => {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase().trim();
    if (v === 'true' || v === '1' || v === 'yes') return true;
    if (v === 'false' || v === '0' || v === 'no') return false;
    return null;
};

const validateCreatePOI = (req, res, next) => {
    const errors = [];
    const name = String(req.body?.name || '').trim();
    const categoriesRaw = String(req.body?.categories_raw || '').trim();

    if (!name) errors.push('name is required');
    if (!categoriesRaw) errors.push('categories_raw is required');

    const priceLevel = parseNumber(req.body?.price_level);
    if (priceLevel !== null && (priceLevel < 1 || priceLevel > 4)) {
        errors.push('price_level must be between 1 and 4');
    }

    const latitude = parseNumber(req.body?.latitude);
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
        errors.push('latitude must be between -90 and 90');
    }

    const longitude = parseNumber(req.body?.longitude);
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
        errors.push('longitude must be between -180 and 180');
    }

    const isAccessible = parseBoolean(req.body?.is_accessible);
    if (isAccessible === null && req.body?.is_accessible !== undefined) {
        errors.push('is_accessible must be a boolean');
    }

    const outdoor = parseBoolean(req.body?.outdoor);
    if (outdoor === null && req.body?.outdoor !== undefined) {
        errors.push('outdoor must be a boolean');
    }

    if (errors.length) {
        return res.status(400).json({ message: 'Validation error', errors });
    }

    return next();
};

const validateUpdatePOI = (req, res, next) => {
    const errors = [];
    const hasAnyField =
        req.body?.name !== undefined ||
        req.body?.categories_raw !== undefined ||
        req.body?.price_level !== undefined ||
        req.body?.is_accessible !== undefined ||
        req.body?.outdoor !== undefined ||
        req.body?.latitude !== undefined ||
        req.body?.longitude !== undefined;

    if (!hasAnyField) {
        errors.push('at least one field must be provided');
    }

    if (req.body?.name !== undefined && !String(req.body.name).trim()) {
        errors.push('name must be a non-empty string');
    }

    if (req.body?.categories_raw !== undefined && !String(req.body.categories_raw).trim()) {
        errors.push('categories_raw must be a non-empty string');
    }

    const priceLevel = parseNumber(req.body?.price_level);
    if (priceLevel !== null && (priceLevel < 1 || priceLevel > 4)) {
        errors.push('price_level must be between 1 and 4');
    }

    const latitude = parseNumber(req.body?.latitude);
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
        errors.push('latitude must be between -90 and 90');
    }

    const longitude = parseNumber(req.body?.longitude);
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
        errors.push('longitude must be between -180 and 180');
    }

    const isAccessible = parseBoolean(req.body?.is_accessible);
    if (isAccessible === null && req.body?.is_accessible !== undefined) {
        errors.push('is_accessible must be a boolean');
    }

    const outdoor = parseBoolean(req.body?.outdoor);
    if (outdoor === null && req.body?.outdoor !== undefined) {
        errors.push('outdoor must be a boolean');
    }

    if (errors.length) {
        return res.status(400).json({ message: 'Validation error', errors });
    }

    return next();
};

export { validateCreatePOI, validateUpdatePOI };
