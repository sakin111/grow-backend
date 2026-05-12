import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Cloudinary } from '../utils/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: async (req, file) => {
    return {
      folder: 'grow-backend',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

export const upload = multer({ storage });
