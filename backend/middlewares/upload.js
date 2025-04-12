// middlewares/upload.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

// Configuration for different upload types
const configs = {
  roomImage: {
    folder: 'rooms/covers',
    formats: ['jpg', 'jpeg', 'png'],
    transformations: [{ width: 1000, crop: 'limit' }],
    sizeLimit: 5 * 1024 * 1024 // 5MB
  },
  productImage: {
    folder: 'products',
    resource_type: 'auto',
    formats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mov', 'doc', 'docx', 'ppt', 'pptx'],
    transformations: [], // Remove fixed transformations since we'll handle different file types
    sizeLimit: 100 * 1024 * 1024 // 100MB to accommodate larger files
  },
  postImage: {
    folder: 'posts/images',
    formats: ['jpg', 'jpeg', 'png'],
    transformations: [{ width: 1000, crop: 'limit' }],
    sizeLimit: 5 * 1024 * 1024 // 5MB
  },
  postVideo: {
    folder: 'posts/videos',
    formats: ['mp4', 'mov'],
    transformations: [],
    sizeLimit: 50 * 1024 * 1024 // 50MB
  }
};

// Create multer instances for each type
const uploaders = {
  roomImage: multer({
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: configs.roomImage
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
    limits: { fileSize: configs.roomImage.sizeLimit }
  }).single('roomImage'),

  productImage: multer({
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        ...configs.productImage,
        resource_type: 'auto'
      }
    }),
    fileFilter: (req, file, cb) => {
      // Accept images, videos, and documents
      if (
        file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('video/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/vnd.ms-powerpoint' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Supported types: images, videos, PDF, DOC, DOCX, PPT, PPTX'), false);
      }
    },
    limits: { fileSize: configs.productImage.sizeLimit }
  }).single('file'),

  // Create a single uploader for all post types
  postFile: multer({
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'posts',
        resource_type: 'auto'
      }
    }),
    fileFilter: (req, file, cb) => {
      // Accept both images and videos
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image and video files are allowed'), false);
      }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for all post files
  }).fields([
    { name: 'file', maxCount: 1 },
    { name: 'content', maxCount: 1 },
    { name: 'type', maxCount: 1 },
    { name: 'roomId', maxCount: 1 },
    { name: 'userId', maxCount: 1 }
  ])
};

export default uploaders;