import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuración para el manejo de archivos de perfil
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'data/uploads/profiles');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Acepta solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

export default upload;