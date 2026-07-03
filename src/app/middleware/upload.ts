import multer from 'multer';
import type { Request } from 'express';
import CloudinaryStorage from 'multer-storage-cloudinary';
import { Cloudinary } from '../utils/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
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
