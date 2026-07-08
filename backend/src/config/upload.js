const multer = require('multer');
const path = require('path');
const fs = require('fs');
const log = require('./logger');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${unique}.jpg`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    log.warn(`Rejected: ${file.mimetype}`);
    return cb(new Error('Only images are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
          return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

const getFileUrl = (req, filename) => {
  if (!filename) return null;
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl}/uploads/${filename}`;
};

const validateFiles = (req) => {
  const files = req.files || [];
  const valid = [];
  const invalid = [];

  for (const file of files) {
    if (!file.path || !fs.existsSync(file.path)) {
      log.warn(`File not found: ${file.originalname}`);
      invalid.push(file);
      continue;
    }
    try {
      const fd = fs.openSync(file.path, 'r');
      const buffer = Buffer.alloc(12);
      fs.readSync(fd, buffer, 0, 12, 0);
      fs.closeSync(fd);

      const hex = buffer.toString('hex');
      const isImage = (
        hex.startsWith('89504e47') || // PNG
        hex.startsWith('ffd8ff') ||    // JPEG
        hex.startsWith('474946') ||    // GIF
        hex.startsWith('52494646')     // WebP or RIFF
      );

      if (isImage) {
        valid.push(file);
      } else {
        log.warn(`Invalid image signature: ${file.originalname}`);
        fs.unlinkSync(file.path);
        invalid.push(file);
      }
    } catch (err) {
      log.error(`Validation error: ${err.message}`);
      invalid.push(file);
    }
  }

  return { valid, invalid };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  getFileUrl,
  validateFiles,
  uploadDir,
};