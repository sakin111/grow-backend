import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Cloudinary } from '../utils/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: async (req, file) => {
    
    const originalUrl = (req.originalUrl || '').toLowerCase();
    let folder = 'grow-backend';
    if (originalUrl.includes('/company')) folder = 'company';
    else if (originalUrl.includes('/user') || originalUrl.includes('/me')) folder = 'user';

    return {
      folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

export const upload = multer({ storage });
