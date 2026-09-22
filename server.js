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

// mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => {
//     console.error('MongoDB connection error:', err.message);
//     console.error('Check: 1) Atlas Network Access allows 0.0.0.0/0  2) MONGODB_URI is set correctly on this host  3) username/password are correct');
//     process.exit(1);
//   });

// mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));

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

// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

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
//     console.error('Upload failed:', err.message);
//     res.status(500).json({ error: err.message || 'upload failed' });
//   }
// });

// app.listen(PORT, () => console.log('Chat running on http://localhost:' + PORT));




// Simple chat server — Node + Express, plain HTTP polling (no websocket).
// Storage: MongoDB (users + messages) + Cloudinary (uploaded files).
//
// This version is hardened so bad input, wrong users, missing files, or
// unexpected errors return a clean JSON error instead of crashing the
// whole server.
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
// // SAFETY NET — catch anything that slips past our own try/catch blocks so
// // the process never dies from one bad request. We log it and keep running.
// // =============================================================================
// process.on('uncaughtException', err => {
//   console.error('[uncaughtException] server kept running:', err);
// });
// process.on('unhandledRejection', err => {
//   console.error('[unhandledRejection] server kept running:', err);
// });

// // =============================================================================
// // 1. MONGODB CONNECTION  <-- paste your connection string in .env, not here
// // =============================================================================
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.error('Missing MONGODB_URI in .env — see .env.example');
//   process.exit(1); // can't run at all without a DB, so exit before listening
// }

// mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => {
//     console.error('MongoDB connection error:', err.message);
//     console.error('Check: 1) Atlas Network Access allows 0.0.0.0/0  2) MONGODB_URI is correct  3) username/password are correct');
//     process.exit(1);
//   });

// // after the initial connect succeeds, don't crash the whole app if the
// // connection drops later — just log it. Mongoose auto-reconnects.
// mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
// mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected — mongoose will try to reconnect'));

// // ---- schemas ----------------------------------------------------------------
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true, trim: true }
// });
// const messageSchema = new mongoose.Schema({
//   user: { type: String, required: true, trim: true },
//   text: { type: String, trim: true, maxlength: 4000 },
//   file: {
//     url: String,
//     name: String,
//     type: String
//   },
//   ts: { type: Number, default: () => Date.now() }
// });

// const User = mongoose.model('User', userSchema);
// const Message = mongoose.model('Message', messageSchema);

// async function seedUsers() {
//   try {
//     const count = await User.countDocuments();
//     if (count === 0) {
//       await User.insertMany([{ name: 'admin' }, { name: 'alice' }, { name: 'bob' }, { name: 'raj' }]);
//       console.log('Seeded default users: admin, alice, bob, raj');
//     }
//   } catch (err) {
//     console.error('Seeding users failed (non-fatal):', err.message);
//   }
// }
// mongoose.connection.once('open', seedUsers);

// // helper: does this username exist in the DB? used to reject spoofed/garbage
// // usernames on every message + upload, not just at login time.
// async function userExists(name) {
//   if (!name || typeof name !== 'string') return false;
//   const clean = name.trim();
//   if (!clean) return false;
//   const found = await User.findOne({ name: { $regex: new RegExp('^' + escapeRegex(clean) + '$', 'i') } });
//   return !!found;
// }
// function escapeRegex(s) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// // =============================================================================
// // 2. CLOUDINARY  <-- paste your cloud name / api key / api secret in .env
// // =============================================================================
// const CLOUDINARY_READY = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
// if (!CLOUDINARY_READY) {
//   console.warn('Cloudinary env vars missing — file uploads will fail until CLOUDINARY_* is set in .env');
// }
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// function uploadToCloudinary(fileBuffer, filename) {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { resource_type: 'auto', folder: 'chat-app', public_id: Date.now() + '-' + filename.replace(/[^\w.\-]/g, '_') },
//       (err, result) => {
//         if (err) {
//           // log the FULL Cloudinary error so the real cause shows up in the
//           // server logs (invalid key, blocked account, wrong permissions, etc.)
//           console.error('Cloudinary rejected the upload:', {
//             http_code: err.http_code,
//             message: err.message,
//             name: err.name
//           });
//           return reject(err);
//         }
//         resolve(result);
//       }
//     );
//     stream.on('error', reject);
//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// }

// const ALLOWED_MIME = /^image\/|^application\/pdf$|^application\/msword$|^application\/vnd\.openxmlformats|^text\/plain$/;

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — safe for free hosting timeouts
//   fileFilter: (req, file, cb) => {
//     if (!ALLOWED_MIME.test(file.mimetype)) {
//       return cb(new Error('UNSUPPORTED_TYPE'));
//     }
//     cb(null, true);
//   }
// });

// // small helper so every async route auto-forwards errors to our error
// // handler instead of crashing the process if a promise rejects
// const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

// // =============================================================================
// // 3. APP / ROUTES
// // =============================================================================
// app.use(express.json({ limit: '1mb' }));
// app.use(express.static(path.join(__dirname, 'public')));

// // verify username against MongoDB
// app.post('/api/login', wrap(async (req, res) => {
//   const name = String(req.body?.name || '').trim();
//   if (!name) return res.status(400).json({ ok: false, error: 'name is required' });
//   const ok = await userExists(name);
//   res.json({ ok, name });
// }));

// // list allowed users (shown as a hint on the login screen)
// app.get('/api/users', wrap(async (req, res) => {
//   const users = await User.find().sort({ name: 1 });
//   res.json({ users: users.map(u => u.name) });
// }));

// // all messages (polling reads this repeatedly)
// app.get('/api/messages', wrap(async (req, res) => {
//   const messages = await Message.find().sort({ ts: 1 }).limit(500);
//   res.json({ messages });
// }));

// // send a text message — rejects unknown/garbage users directly
// app.post('/api/messages', wrap(async (req, res) => {
//   const user = String(req.body?.user || '').trim();
//   const text = String(req.body?.text || '').trim();

//   if (!user) return res.status(400).json({ error: 'user is required' });
//   if (!text) return res.status(400).json({ error: 'text is required' });
//   if (text.length > 4000) return res.status(400).json({ error: 'message too long' });

//   const valid = await userExists(user);
//   if (!valid) return res.status(403).json({ error: 'unknown user — please log in again' });

//   const m = await Message.create({ user, text, ts: Date.now() });
//   res.json(m);
// }));

// // send a file (image / pdf / doc) — goes straight to Cloudinary
// app.post('/api/upload', (req, res, next) => {
//   upload.single('file')(req, res, err => {
//     if (err) return next(err); // let the multer-specific handler below format this
//     next();
//   });
// }, wrap(async (req, res) => {
//   const user = String(req.body?.user || '').trim();
//   if (!user) return res.status(400).json({ error: 'user is required' });
//   if (!req.file) return res.status(400).json({ error: 'no file received' });

//   const valid = await userExists(user);
//   if (!valid) return res.status(403).json({ error: 'unknown user — please log in again' });

//   if (!CLOUDINARY_READY) {
//     return res.status(500).json({ error: 'file storage is not configured on the server (missing CLOUDINARY_* env vars)' });
//   }

//   const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
//   const m = await Message.create({
//     user,
//     ts: Date.now(),
//     file: { url: result.secure_url, name: req.file.originalname, type: req.file.mimetype }
//   });
//   res.json(m);
// }));

// // ---- unknown route (bad path / wrong method) -------------------------------
// app.use((req, res) => {
//   res.status(404).json({ error: 'not found' });
// });

// // ---- central error handler — every error in the app ends up here instead
// // of crashing the process. multer errors get friendly messages.
// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(413).json({ error: 'file too large — max 20MB' });
//     }
//     return res.status(400).json({ error: 'upload error: ' + err.message });
//   }
//   if (err && err.message === 'UNSUPPORTED_TYPE') {
//     return res.status(415).json({ error: 'unsupported file type' });
//   }
//   if (err && err.type === 'entity.parse.failed') {
//     return res.status(400).json({ error: 'malformed JSON in request body' });
//   }
//   console.error('Unhandled route error:', err);
//   res.status(500).json({ error: 'something went wrong on the server' });
// });

// app.listen(PORT, () => console.log('Chat running on http://localhost:' + PORT));

// Simple chat server — Node + Express, plain HTTP polling (no websocket).
// Storage: MongoDB (users + messages) + Cloudinary (uploaded files).
//
// This version is hardened so bad input, wrong users, missing files, or
// unexpected errors return a clean JSON error instead of crashing the
// whole server.
// require('dotenv').config();

// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const mongoose = require('mongoose');
// const cloudinary = require('cloudinary').v2;

// const app = express();
// const PORT = process.env.PORT || 3000;

// // =============================================================================
// // SAFETY NET — catch anything that slips past our own try/catch blocks so
// // the process never dies from one bad request. We log it and keep running.
// // =============================================================================
// process.on('uncaughtException', err => {
//   console.error('[uncaughtException] server kept running:', err);
// });
// process.on('unhandledRejection', err => {
//   console.error('[unhandledRejection] server kept running:', err);
// });

// // =============================================================================
// // 1. MONGODB CONNECTION  <-- paste your connection string in .env, not here
// // =============================================================================
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.error('Missing MONGODB_URI in .env — see .env.example');
//   process.exit(1); // can't run at all without a DB, so exit before listening
// }

// mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => {
//     console.error('MongoDB connection error:', err.message);
//     console.error('Check: 1) Atlas Network Access allows 0.0.0.0/0  2) MONGODB_URI is correct  3) username/password are correct');
//     process.exit(1);
//   });

// // after the initial connect succeeds, don't crash the whole app if the
// // connection drops later — just log it. Mongoose auto-reconnects.
// mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
// mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected — mongoose will try to reconnect'));

// // ---- schemas ----------------------------------------------------------------
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true, trim: true }
// });
// const messageSchema = new mongoose.Schema({
//   user: { type: String, required: true, trim: true },
//   text: { type: String, trim: true, maxlength: 4000 },
//   file: {
//     url: String,
//     name: String,
//     type: String
//   },
//   ts: { type: Number, default: () => Date.now() }
// });

// const User = mongoose.model('User', userSchema);
// const Message = mongoose.model('Message', messageSchema);

// async function seedUsers() {
//   try {
//     const count = await User.countDocuments();
//     if (count === 0) {
//       await User.insertMany([{ name: 'admin' }, { name: 'alice' }, { name: 'bob' }, { name: 'raj' }]);
//       console.log('Seeded default users: admin, alice, bob, raj');
//     }
//   } catch (err) {
//     console.error('Seeding users failed (non-fatal):', err.message);
//   }
// }
// mongoose.connection.once('open', seedUsers);

// // helper: does this username exist in the DB? used to reject spoofed/garbage
// // usernames on every message + upload, not just at login time.
// async function userExists(name) {
//   if (!name || typeof name !== 'string') return false;
//   const clean = name.trim();
//   if (!clean) return false;
//   const found = await User.findOne({ name: { $regex: new RegExp('^' + escapeRegex(clean) + '$', 'i') } });
//   return !!found;
// }
// function escapeRegex(s) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// // =============================================================================
// // 2. CLOUDINARY  <-- paste your cloud name / api key / api secret in .env
// // =============================================================================
// const CLOUDINARY_READY = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
// if (!CLOUDINARY_READY) {
//   console.warn('Cloudinary env vars missing — file uploads will fail until CLOUDINARY_* is set in .env');
// }
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// function uploadToCloudinary(fileBuffer, filename, mimetype) {
//   // Sending as a base64 data URI instead of a streamed request avoids
//   // "chunked transfer encoding" — some antivirus/corporate networks
//   // intercept or mangle chunked HTTPS uploads, which shows up as a
//   // generic 403 "UnexpectedResponse" even though credentials are fine.
//   const dataUri = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
//   return cloudinary.uploader.upload(dataUri, {
//     resource_type: 'auto',
//     folder: 'chat-app',
//     public_id: Date.now() + '-' + filename.replace(/[^\w.\-]/g, '_')
//   }).catch(err => {
//     console.error('Cloudinary rejected the upload:', {
//       http_code: err.http_code,
//       message: err.message,
//       name: err.name
//     });
//     throw err;
//   });
// }

// const ALLOWED_MIME = /^image\/|^application\/pdf$|^application\/msword$|^application\/vnd\.openxmlformats|^text\/plain$/;

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — safe for free hosting timeouts
//   fileFilter: (req, file, cb) => {
//     if (!ALLOWED_MIME.test(file.mimetype)) {
//       return cb(new Error('UNSUPPORTED_TYPE'));
//     }
//     cb(null, true);
//   }
// });

// // small helper so every async route auto-forwards errors to our error
// // handler instead of crashing the process if a promise rejects
// const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

// // =============================================================================
// // 3. APP / ROUTES
// // =============================================================================
// app.use(express.json({ limit: '1mb' }));
// app.use(express.static(path.join(__dirname, 'public')));

// // verify username against MongoDB
// app.post('/api/login', wrap(async (req, res) => {
//   const name = String(req.body?.name || '').trim();
//   if (!name) return res.status(400).json({ ok: false, error: 'name is required' });
//   const ok = await userExists(name);
//   res.json({ ok, name });
// }));

// // list allowed users (shown as a hint on the login screen)
// app.get('/api/users', wrap(async (req, res) => {
//   const users = await User.find().sort({ name: 1 });
//   res.json({ users: users.map(u => u.name) });
// }));

// // all messages (polling reads this repeatedly)
// app.get('/api/messages', wrap(async (req, res) => {
//   const messages = await Message.find().sort({ ts: 1 }).limit(500);
//   res.json({ messages });
// }));

// // send a text message — rejects unknown/garbage users directly
// app.post('/api/messages', wrap(async (req, res) => {
//   const user = String(req.body?.user || '').trim();
//   const text = String(req.body?.text || '').trim();

//   if (!user) return res.status(400).json({ error: 'user is required' });
//   if (!text) return res.status(400).json({ error: 'text is required' });
//   if (text.length > 4000) return res.status(400).json({ error: 'message too long' });

//   const valid = await userExists(user);
//   if (!valid) return res.status(403).json({ error: 'unknown user — please log in again' });

//   const m = await Message.create({ user, text, ts: Date.now() });
//   res.json(m);
// }));

// // send a file (image / pdf / doc) — goes straight to Cloudinary
// app.post('/api/upload', (req, res, next) => {
//   upload.single('file')(req, res, err => {
//     if (err) return next(err); // let the multer-specific handler below format this
//     next();
//   });
// }, wrap(async (req, res) => {
//   const user = String(req.body?.user || '').trim();
//   if (!user) return res.status(400).json({ error: 'user is required' });
//   if (!req.file) return res.status(400).json({ error: 'no file received' });

//   const valid = await userExists(user);
//   if (!valid) return res.status(403).json({ error: 'unknown user — please log in again' });

//   if (!CLOUDINARY_READY) {
//     return res.status(500).json({ error: 'file storage is not configured on the server (missing CLOUDINARY_* env vars)' });
//   }

//   const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
//   const m = await Message.create({
//     user,
//     ts: Date.now(),
//     file: { url: result.secure_url, name: req.file.originalname, type: req.file.mimetype }
//   });
//   res.json(m);
// }));

// // ---- unknown route (bad path / wrong method) -------------------------------
// app.use((req, res) => {
//   res.status(404).json({ error: 'not found' });
// });

// // ---- central error handler — every error in the app ends up here instead
// // of crashing the process. multer errors get friendly messages.
// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(413).json({ error: 'file too large — max 20MB' });
//     }
//     return res.status(400).json({ error: 'upload error: ' + err.message });
//   }
//   if (err && err.message === 'UNSUPPORTED_TYPE') {
//     return res.status(415).json({ error: 'unsupported file type' });
//   }
//   if (err && err.type === 'entity.parse.failed') {
//     return res.status(400).json({ error: 'malformed JSON in request body' });
//   }
//   console.error('Unhandled route error:', err);
//   res.status(500).json({ error: 'something went wrong on the server' });
// });

// app.listen(PORT, () => console.log('Chat running on http://localhost:' + PORT));


// Simple chat server — Node + Express, plain HTTP polling (no websocket).
// Storage: MongoDB (users + messages) + Cloudinary (uploaded files).
//
// This version is hardened so bad input, wrong users, missing files, or
// unexpected errors return a clean JSON error instead of crashing the
// whole server.
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// SAFETY NET — catch anything that slips past our own try/catch blocks so
// the process never dies from one bad request. We log it and keep running.
// =============================================================================
process.on('uncaughtException', err => {
  console.error('[uncaughtException] server kept running:', err);
});
process.on('unhandledRejection', err => {
  console.error('[unhandledRejection] server kept running:', err);
});

// =============================================================================
// 1. MONGODB CONNECTION  <-- paste your connection string in .env, not here
// =============================================================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env — see .env.example');
  process.exit(1); // can't run at all without a DB, so exit before listening
}

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Check: 1) Atlas Network Access allows 0.0.0.0/0  2) MONGODB_URI is correct  3) username/password are correct');
    process.exit(1);
  });

// after the initial connect succeeds, don't crash the whole app if the
// connection drops later — just log it. Mongoose auto-reconnects.
mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected — mongoose will try to reconnect'));

// ---- schemas ----------------------------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
});
// Defined as its own Schema (not a plain object) on purpose — Mongoose
// gets confused when a nested object literal has a field literally named
// "type" (like our file.type), because "type" is also the special keyword
// Mongoose uses to declare a field's own type. Wrapping it in a real
// mongoose.Schema removes that ambiguity.
const fileSchema = new mongoose.Schema({
  url: String,
  name: String,
  type: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true, trim: true },
  text: { type: String, trim: true, maxlength: 4000 },
  file: fileSchema,
  ts: { type: Number, default: () => Date.now() }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

async function seedUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany([{ name: 'admin' }, { name: 'alice' }, { name: 'bob' }, { name: 'raj' }]);
      console.log('Seeded default users: admin, alice, bob, raj');
    }
  } catch (err) {
    console.error('Seeding users failed (non-fatal):', err.message);
  }
}
mongoose.connection.once('open', seedUsers);

// helper: does this username exist in the DB? used to reject spoofed/garbage
// usernames on every message + upload, not just at login time.
async function userExists(name) {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim();
  if (!clean) return false;
  const found = await User.findOne({ name: { $regex: new RegExp('^' + escapeRegex(clean) + '$', 'i') } });
  return !!found;
}
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =============================================================================
// 2. CLOUDINARY  <-- paste your cloud name / api key / api secret in .env
// =============================================================================
const CLOUDINARY_READY = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (!CLOUDINARY_READY) {
  console.warn('Cloudinary env vars missing — file uploads will fail until CLOUDINARY_* is set in .env');
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadToCloudinary(fileBuffer, filename, mimetype) {
  // Sending as a base64 data URI instead of a streamed request avoids
  // "chunked transfer encoding" — some antivirus/corporate networks
  // intercept or mangle chunked HTTPS uploads, which shows up as a
  // generic 403 "UnexpectedResponse" even though credentials are fine.
  const dataUri = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
  return cloudinary.uploader.upload(dataUri, {
    resource_type: 'auto',
    folder: 'chat-app',
    public_id: Date.now() + '-' + filename.replace(/[^\w.\-]/g, '_')
  }).catch(err => {
    console.error('Cloudinary rejected the upload:', {
      http_code: err.http_code,
      message: err.message,
      name: err.name
    });
    throw err;
  });
}

const ALLOWED_MIME = /^image\/|^application\/pdf$|^application\/msword$|^application\/vnd\.openxmlformats|^text\/plain$/;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — safe for free hosting timeouts
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.test(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_TYPE'));
    }
    cb(null, true);
  }
});

// small helper so every async route auto-forwards errors to our error
// handler instead of crashing the process if a promise rejects
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

// =============================================================================
// 3. APP / ROUTES
// =============================================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// verify username against MongoDB
app.post('/api/login', wrap(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'name is required' });
  const ok = await userExists(name);
  res.json({ ok, name });
}));

// list allowed users (shown as a hint on the login screen)
app.get('/api/users', wrap(async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.json({ users: users.map(u => u.name) });
}));

// all messages (polling reads this repeatedly)
app.get('/api/messages', wrap(async (req, res) => {
  const messages = await Message.find().sort({ ts: 1 }).limit(500);
  res.json({ messages });
}));

// send a text message — rejects unknown/garbage users directly
app.post('/api/messages', wrap(async (req, res) => {
  const user = String(req.body?.user || '').trim();
  const text = String(req.body?.text || '').trim();

  if (!user) return res.status(400).json({ error: 'user is required' });
  if (!text) return res.status(400).json({ error: 'text is required' });
  if (text.length > 4000) return res.status(400).json({ error: 'message too long' });

  const valid = await userExists(user);
  if (!valid) return res.status(403).json({ error: 'unknown user — please log in again' });

  const m = await Message.create({ user, text, ts: Date.now() });
  res.json(m);
}));

// send a file (image / pdf / doc) — goes straight to Cloudinary
app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) return next(err); // let the multer-specific handler below format this
    next();
  });
}, wrap(async (req, res) => {
  const user = String(req.body?.user || '').trim();
  if (!user) return res.status(400).json({ error: 'user is required' });
  if (!req.file) return res.status(400).json({ error: 'no file received' });

  const valid = await userExists(user);
  if (!valid) return res.status(403).json({ error: 'unknown user — please log in again' });

  if (!CLOUDINARY_READY) {
    return res.status(500).json({ error: 'file storage is not configured on the server (missing CLOUDINARY_* env vars)' });
  }

  const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
  const m = await Message.create({
    user,
    ts: Date.now(),
    file: { url: result.secure_url, name: req.file.originalname, type: req.file.mimetype }
  });
  res.json(m);
}));

// ---- unknown route (bad path / wrong method) -------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// ---- central error handler — every error in the app ends up here instead
// of crashing the process. multer errors get friendly messages.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'file too large — max 20MB' });
    }
    return res.status(400).json({ error: 'upload error: ' + err.message });
  }
  if (err && err.message === 'UNSUPPORTED_TYPE') {
    return res.status(415).json({ error: 'unsupported file type' });
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'malformed JSON in request body' });
  }
  console.error('Unhandled route error:', err);
  res.status(500).json({ error: 'something went wrong on the server' });
});

app.listen(PORT, () => console.log('Chat running on http://localhost:' + PORT));