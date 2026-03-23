import multer from 'multer';

// Usamos memoryStorage para no llenar el disco del servidor de Render
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;