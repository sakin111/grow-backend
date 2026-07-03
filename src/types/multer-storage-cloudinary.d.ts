declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';
  import { Request } from 'express';

  export interface CloudinaryStorageOptions {
    cloudinary: any;
    params?: (req: Request, file: Express.Multer.File) => Promise<Record<string, any>> | Record<string, any>;
    folder?: string;
    allowed_formats?: string[];
    filename?: string | ((req: Request, file: Express.Multer.File) => string);
    transformation?: any;
    type?: string;
    format?: string;
    allowedFormats?: string[];
  }

  class CloudinaryStorage implements StorageEngine {
    constructor(opts: CloudinaryStorageOptions);
    _handleFile(req: Request, file: Express.Multer.File, cb: (error?: any, info?: any) => void): void;
    _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void;
  }

  export default CloudinaryStorage;
}
