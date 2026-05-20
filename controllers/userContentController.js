import * as UserContent from '../models/userContentModel.js';
import User from '../models/userModel.js';
import cloudinary from '../config/cloudinary.js';
import { ensureImagePassesModeration } from '../services/imageModerationService.js';

function parseKind(raw) {
    if (raw === 'svc' || raw === 'poi') return raw;
    return null;
}

/** Multer / clientes a veces dejan req.body undefined; evita fallos al leer campos. */
function safeBody(req) {
    const b = req.body;
    if (b != null && typeof b === 'object' && !Array.isArray(b)) return b;
    return {};
}

export class UserContentController {
    static async getFavorites(req, res) {
        try {
            const userId = req.user.id;
            const rows = await UserContent.listFavorites(userId);
            const enriched = await UserContent.enrichPlaceRows(
                rows.map((r) => ({ ...r, created_at: r.created_at })),
            );
            res.json({ message: 'Favoritos', favorites: enriched });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al listar favoritos', error: e.message });
        }
    }

    static async postFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { place_kind, place_id } = safeBody(req);
            const kind = parseKind(place_kind);
            const pid = parseInt(place_id, 10);
            if (!kind || Number.isNaN(pid)) {
                return res.status(400).json({ message: 'place_kind debe ser svc o poi y place_id numérico' });
            }
            const exists = await UserContent.placeExists(kind, pid);
            if (!exists) {
                return res.status(404).json({ message: 'Lugar no encontrado' });
            }
            await UserContent.addFavorite(userId, kind, pid);
            const enriched = await UserContent.enrichPlaceRows([
                { place_kind: kind, place_id: pid, created_at: new Date() },
            ]);
            res.status(201).json({ message: 'Agregado a favoritos', favorite: enriched[0] || { place_kind: kind, place_id: pid } });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al guardar favorito', error: e.message });
        }
    }

    static async deleteFavorite(req, res) {
        try {
            const userId = req.user.id;
            const kind = parseKind(req.params.kind);
            const pid = parseInt(req.params.placeId, 10);
            if (!kind || Number.isNaN(pid)) {
                return res.status(400).json({ message: 'Parámetros inválidos' });
            }
            const ok = await UserContent.removeFavorite(userId, kind, pid);
            if (!ok) {
                return res.status(404).json({ message: 'Favorito no encontrado' });
            }
            res.json({ message: 'Eliminado de favoritos' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al eliminar favorito', error: e.message });
        }
    }

    static async getVisits(req, res) {
        try {
            const userId = req.user.id;
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
            const rows = await UserContent.listVisits(userId, limit);
            const enriched = await UserContent.enrichPlaceRows(rows);
            res.json({ message: 'Historial de visitas', visits: enriched });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al listar visitas', error: e.message });
        }
    }

    static async postVisit(req, res) {
        try {
            const userId = req.user.id;
            const { place_kind, place_id } = safeBody(req);
            const kind = parseKind(place_kind);
            const pid = parseInt(place_id, 10);
            if (!kind || Number.isNaN(pid)) {
                return res.status(400).json({ message: 'place_kind debe ser svc o poi y place_id numérico' });
            }
            const exists = await UserContent.placeExists(kind, pid);
            if (!exists) {
                return res.status(404).json({ message: 'Lugar no encontrado' });
            }
            const row = await UserContent.addVisit(userId, kind, pid);
            const enriched = await UserContent.enrichPlaceRows([row]);
            res.status(201).json({ message: 'Visita registrada', visit: enriched[0] });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al registrar visita', error: e.message });
        }
    }

    static async getCommunityPosts(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
            const { total, posts, page: p, limit: l } = await UserContent.listCommunityPosts(page, limit);
            res.json({
                message: 'Publicaciones',
                totalRecords: total,
                currentPage: p,
                limit: l,
                posts: posts.map((row) => ({
                    id: row.id_post,
                    user_id: row.user_id,
                    caption: row.caption,
                    image_url: row.image_url,
                    place_kind: row.place_kind,
                    place_id: row.place_id,
                    place_name: row.place_name,
                    created_at: row.created_at,
                    author: {
                        name: row.author_name,
                        photo_url: row.author_photo_url,
                        avatar_icon_key: row.author_avatar_icon_key,
                        created_at: row.author_created_at,
                        interests: row.author_interests || [],
                    },
                })),
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al listar publicaciones', error: e.message });
        }
    }

    static async postCommunityPost(req, res) {
        try {
            const userId = req.user.id;
            const body = safeBody(req);
            const kind = parseKind(body.place_kind);
            const pid = parseInt(body.place_id, 10);
            if (!kind || Number.isNaN(pid)) {
                return res.status(400).json({ message: 'place_kind debe ser svc o poi y place_id numérico' });
            }
            const placeRow = await UserContent.placeExists(kind, pid);
            if (!placeRow) {
                return res.status(404).json({ message: 'Lugar no encontrado' });
            }

            let caption = body.caption;
            if (caption === undefined || caption === null) caption = '';
            if (typeof caption !== 'string') {
                return res.status(400).json({ message: 'caption debe ser texto' });
            }
            if (caption.length > 2000) {
                return res.status(400).json({ message: 'caption demasiado largo' });
            }
            const trimmed = caption.trim();
            const hasFile = req.file && req.file.buffer;
            if (!trimmed && !hasFile) {
                return res.status(400).json({ message: 'Escribe un texto o adjunta una imagen' });
            }

            let imageUrl = null;
            if (hasFile) {
                const allowed = /^image\/(jpeg|png|gif|webp|heic|heif)$/i;
                if (!allowed.test(req.file.mimetype)) {
                    return res.status(400).json({
                        message: 'Solo imágenes JPEG, PNG, GIF, WebP, HEIC o HEIF',
                    });
                }
                if (req.file.size > 5 * 1024 * 1024) {
                    return res.status(400).json({ message: 'Imagen demasiado grande (máx. 5 MB)' });
                }

                const allowedImage = await ensureImagePassesModeration(req, res);
                if (!allowedImage) return;

                const folder = `smartur/community/${userId}`;
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder, resource_type: 'image' },
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        },
                    );
                    stream.end(req.file.buffer);
                });
                imageUrl = uploadResult.secure_url;
            }

            const row = await UserContent.createCommunityPost(userId, trimmed, imageUrl, kind, pid);
            const u = await User.findById(userId);
            res.status(201).json({
                message: 'Publicación creada',
                post: {
                    id: row.id_post,
                    user_id: row.user_id,
                    caption: row.caption,
                    image_url: row.image_url,
                    place_kind: row.place_kind,
                    place_id: row.place_id,
                    place_name: placeRow.name,
                    created_at: row.created_at,
                    author: {
                        name: u?.name,
                        photo_url: u?.photo_url ?? null,
                        avatar_icon_key: u?.avatar_icon_key ?? null,
                    },
                },
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al crear publicación', error: e.message });
        }
    }

    static async deleteCommunityPost(req, res) {
        try {
            const userId = req.user.id;
            const postId = parseInt(req.params.postId, 10);
            if (Number.isNaN(postId)) return res.status(400).json({ message: 'ID de publicación inválido' });
            const deleted = await UserContent.deleteCommunityPost(userId, postId);
            if (!deleted) return res.status(404).json({ message: 'Publicación no encontrada o no tienes permisos para eliminarla' });
            res.json({ message: 'Publicación eliminada correctamente' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al eliminar la publicación', error: e.message });
        }
    }

    static async adminDeleteCommunityPost(req, res) {
        try {
            const postId = parseInt(req.params.postId, 10);
            if (Number.isNaN(postId)) return res.status(400).json({ message: 'ID de publicación inválido' });
            const deleted = await UserContent.adminDeleteCommunityPost(postId);
            if (!deleted) return res.status(404).json({ message: 'Publicación no encontrada' });
            res.json({ message: 'Publicación eliminada por administrador' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error al eliminar la publicación', error: e.message });
        }
    }
}

export default UserContentController;
