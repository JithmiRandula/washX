const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Provider images
const providerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'washx/providers', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Resize large images
      { quality: 'auto' } // Automatic quality optimization
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `provider-${uniqueSuffix}`;
    }
  }
});

// Configure Cloudinary storage for User avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'washx/avatars', // Folder for user avatars
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focused on face
      { quality: 'auto' } // Automatic quality optimization
    ],
    public_id: (req, file) => {
      // Generate unique filename with user ID
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `avatar-${req.user.id}-${uniqueSuffix}`;
    }
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for provider images
const providerUpload = multer({
  storage: providerStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for user avatars
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/washx/providers/provider-123.jpg
  const matches = url.match(/\/([^\/]+)\.[^\.\/]+$/);
  if (matches && matches[1]) {
    // Include folder path if present for providers
    const providerMatch = url.match(/washx\/providers\/([^\/]+)\.[^\.\/]+$/);
    if (providerMatch) {
      return `washx/providers/${providerMatch[1]}`;
    }
    // Include folder path if present for avatars
    const avatarMatch = url.match(/washx\/avatars\/([^\/]+)\.[^\.\/]+$/);
    if (avatarMatch) {
      return `washx/avatars/${avatarMatch[1]}`;
    }
    return matches[1];
  }
  return null;
};

module.exports = {
  upload: providerUpload, // Default export for provider images (backward compatibility)
  avatarUpload, // Export for user avatars
  cloudinary,
  deleteImage,
  getPublicIdFromUrl
};
