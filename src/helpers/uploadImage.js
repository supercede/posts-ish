const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { config } = require('dotenv');
const multer = require('multer');

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    format: async (req, file) => 'png',
    use_filename: true,
    folder: 'img-repository',
  },
  allowedFormats: ['jpg', 'png', 'jpeg'],
});

module.exports = multer({ storage: photoStorage, limits: 8000000 });
