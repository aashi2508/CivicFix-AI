import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isImageMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';
    const isImageExt = /\.(jpe?g|png|webp|gif|heic|bmp)$/i.test(file.originalname);
    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
