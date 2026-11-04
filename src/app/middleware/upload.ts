import multer from 'multer'

import { Request } from 'express'
import { Cloudinary } from '../utils/cloudinary'
import CloudinaryStorage from 'multer-storage-cloudinary'
// keep your existing import

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'mp3', 'wav']
const DOC_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip']

const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || ''

const storage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const originalUrl = (req.originalUrl || '').toLowerCase()
    let folder = 'grow-backend'
    if (originalUrl.includes('/company')) folder = 'company'
    else if (originalUrl.includes('/user') || originalUrl.includes('/me')) folder = 'user'

    const ext = getExt(file.originalname)
    const baseName = file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')

    let resource_type: 'image' | 'video' | 'raw' = 'raw'
    if (IMAGE_EXT.includes(ext) || ext === 'pdf') resource_type = 'image'
    else if (VIDEO_EXT.includes(ext)) resource_type = 'video'

    // raw files need the extension kept in public_id, or the download has no extension
    const public_id = resource_type === 'raw'
      ? `${Date.now()}-${baseName}.${ext}`
      : `${Date.now()}-${baseName}`

    return { folder, resource_type, public_id }
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ext = getExt(file.originalname)
    if ([...IMAGE_EXT, ...VIDEO_EXT, ...DOC_EXT].includes(ext)) cb(null, true)
    else cb(new Error(`File type .${ext} is not allowed`))
  },
})