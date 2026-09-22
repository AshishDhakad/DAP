// // Simple chat server — Node + Express, plain HTTP polling (no websocket),
// // same behavior as the very first version — but storage is now real:
// //   - MongoDB   -> users + messages
// //   - Cloudinary -> uploaded images/PDFs/docs
// require('dotenv').config();

// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const mongoose = require('mongoose');
// const cloudinary = require('cloudinary').v2;
// const streamifier = require('streamifier');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // =============================================================================
// // 1. MONGODB CONNECTION  <-- paste your connection string in .env, not here
// // =============================================================================
// const MONGODB_URI = process.env.MONGODB_URI; // e.g. mongodb+srv://user:pass@cluster.mongodb.net/chatapp

// if (!MONGODB_URI) {
//   console.error('Missing MONGODB_URI in .env — see .env.example');
//   process.exit(1);
// }

// mongoose.connect(MONGODB_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

// // ---- schemas ----------------------------------------------------------------
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true }
// });
// const messageSchema = new mongoose.Schema({
//   user: { type: String, required: true },
//   text: String,
//   file: {
//     url: String,
//     name: String,
//     type: String
//   },
//   ts: { type: Number, default: () => Date.now() }
// });

// const User = mongoose.model('User', userSchema);
// const Message = mongoose.model('Message', messageSchema);

// // seed default users the first time the app connects to an empty DB
// async function seedUsers() {
//   const count = await User.countDocuments();
//   if (count === 0) {
//     await User.insertMany([{ name: 'admin' }, { name: 'alice' }, { name: 'bob' }, { name: 'raj' }]);
//     console.log('Seeded default users: admin, alice, bob, raj');
//   }
// }
// mongoose.connection.once('open', seedUsers);

// // =============================================================================
// // 2. CLOUDINARY  <-- paste your cloud name / api key / api secret in .env
// // =============================================================================
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// function uploadToCloudinary(fileBuffer, filename) {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { resource_type: 'auto', folder: 'chat-app', public_id: Date.now() + '-' + filename.replace(/[^\w.\-]/g, '_') },
//       (err, result) => (err ? reject(err) : resolve(result))
//     );
//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// }

// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 } });

// // =============================================================================
// // 3. APP / ROUTES  (same endpoints and behavior as the original version)
// // =============================================================================
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // verify username against MongoDB
// app.post('/api/login', async (req, res) => {
//   const name = String(req.body.name || '').trim().toLowerCase();
//   const found = await User.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
//   res.json({ ok: !!found, name });
// });

// // list allowed users (shown as a hint on the login screen)
// app.get('/api/users', async (req, res) => {
//   const users = await User.find().sort({ name: 1 });
//   res.json({ users: users.map(u => u.name) });
// });

// // all messages (polling reads this repeatedly — same as original)
// app.get('/api/messages', async (req, res) => {
//   const messages = await Message.find().sort({ ts: 1 }).limit(500);
//   res.json({ messages });
// });

// // send a text message
// app.post('/api/messages', async (req, res) => {
//   const { user, text } = req.body;
//   if (!user || !text) return res.status(400).json({ error: 'bad request' });
//   const m = await Message.create({ user, text, ts: Date.now() });
//   res.json(m);
// });

// // send a file (image / pdf / doc) — goes straight to Cloudinary
// app.post('/api/upload', upload.single('file'), async (req, res) => {
//   const user = req.body.user;
//   if (!user || !req.file) return res.status(400).json({ error: 'bad request' });

//   try {
//     const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
//     const m = await Message.create({
//       user,
//       ts: Date.now(),
//       file: { url: result.secure_url, name: req.file.originalname, type: req.file.mimetype }
//     });
//     res.json(m);
//   } catch (err) {
//     console.error('Upload failed:', err);
//     res.status(500).json({ error: 'upload failed' });
//   }
// });

// app.listen(PORT, () => console.log('Chat running on http://localhost:' + PORT));











// Simple chat server — Node + Express, plain HTTP polling (no websocket),
// same behavior as the very first version — but storage is now real:
//   - MongoDB   -> users + messages
//   - Cloudinary -> uploaded images/PDFs/docs
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// 1. MONGODB CONNECTION  <-- paste your connection string in .env, not here
// =============================================================================
const MONGODB_URI = process.env.MONGODB_URI; // e.g. mongodb+srv://user:pass@cluster.mongodb.net/chatapp

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env — see .env.example');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Check: 1) Atlas Network Access allows 0.0.0.0/0  2) MONGODB_URI is set correctly on this host  3) username/password are correct');
    process.exit(1);
  });

mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));

// ---- schemas ----------------------------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: String,
  file: {
    url: String,
    name: String,
    type: String
  },
  ts: { type: Number, default: () => Date.now() }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// seed default users the first time the app connects to an empty DB
async function seedUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany([{ name: 'admin' }, { name: 'alice' }, { name: 'bob' }, { name: 'raj' }]);
    console.log('Seeded default users: admin, alice, bob, raj');
  }
}
mongoose.connection.once('open', seedUsers);

// =============================================================================
// 2. CLOUDINARY  <-- paste your cloud name / api key / api secret in .env
// =============================================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadToCloudinary(fileBuffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'chat-app', public_id: Date.now() + '-' + filename.replace(/[^\w.\-]/g, '_') },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// =============================================================================
// 3. APP / ROUTES  (same endpoints and behavior as the original version)
// =============================================================================
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// verify username against MongoDB
app.post('/api/login', async (req, res) => {
  const name = String(req.body.name || '').trim().toLowerCase();
  const found = await User.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
  res.json({ ok: !!found, name });
});

// list allowed users (shown as a hint on the login screen)
app.get('/api/users', async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.json({ users: users.map(u => u.name) });
});

// all messages (polling reads this repeatedly — same as original)
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ ts: 1 }).limit(500);
  res.json({ messages });
});

// send a text message
app.post('/api/messages', async (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: 'bad request' });
  const m = await Message.create({ user, text, ts: Date.now() });
  res.json(m);
});

// send a file (image / pdf / doc) — goes straight to Cloudinary
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const user = req.body.user;
  if (!user || !req.file) return res.status(400).json({ error: 'bad request' });

  try {
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const m = await Message.create({
      user,
      ts: Date.now(),
      file: { url: result.secure_url, name: req.file.originalname, type: req.file.mimetype }
    });
    res.json(m);
  } catch (err) {
    console.error('Upload failed:', err.message);
    res.status(500).json({ error: err.message || 'upload failed' });
  }
});

app.listen(PORT, () => console.log('Chat running on http://localhost:' + PORT));