// Standalone test — tries a REAL upload (not just ping) using a tiny
// built-in 1x1 pixel image, completely separate from Express/Multer.
// Run with: node test-upload.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// a real, valid 1x1 transparent PNG, base64-encoded
const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

console.log('Attempting a real upload to Cloudinary...');

cloudinary.uploader.upload(TINY_PNG, { folder: 'chat-app-test' })
  .then(res => {
    console.log('\n✅ UPLOAD SUCCESS:', res.secure_url);
  })
  .catch(err => {
    console.log('\n❌ UPLOAD FAILED — full raw error below:');
    console.log(JSON.stringify(err, null, 2));
  });