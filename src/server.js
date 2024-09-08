const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it does not exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for handling multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Save uploaded files to 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4(); // Generate unique file name using UUID
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn kích thước tệp
});

// Middleware to authenticate user based on JWT
const secretKey = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const userDataFile = process.env.USER_DATA_FILE || path.join(__dirname, 'userData.json');
const GenreDataFile = process.env.GENRE_DATA_FILE || path.join(__dirname, 'GenreData.json');
const HistoryDataFile = process.env.HISTORY_DATA_FILE|| path.join(__dirname,'HistoryData.json');
const CreateMusicHistoryFile = process.env.CREATE_MUSIC_HISTORY_FILE || path.join(__dirname,'createMusicHistoryFile.json');
const ListenMusicHistoryFile = process.env.LISTEN_MUSIC_HISTORY_FILE || path.join(__dirname,'listenMusicHistoryFile.json');
const MusicDataFile = process.env.MUSIC_DATA_FILE || path.join(__dirname,'MusicData.json');
const MusicDetailDataFile = process.env.MUSIC_DETAIL_DATA_FILE || path.join(__dirname,'MusicDetailData.json');
const PlaylistDataFile = process.env.PLAYLIST_DATA_FILE || path.join(__dirname,'PlaylistData.json');

// AuthController
const AuthController = require('./src/controllers/authController');
const authController = new AuthController(userDataFile, secretKey);

app.post('/api/Auth/signUp', upload.none(), (req, res) => authController.signUp(req, res));
app.post('/api/Auth/signIn', upload.none(), (req, res) => authController.signIn(req, res));
app.get('/api/Auth/current', authenticateToken, (req, res) => authController.getCurrentUser(req, res));
app.post('/api/Auth/updateProfile', authenticateToken, (req, res) => authController.updateProfile(req, res));
app.post('/api/Auth/changePassword', authenticateToken, (req, res) => authController.changePassword(req, res));

// MusicController
const MusicController = require('./src/controllers/MusicController');
const musicController = new MusicController(MusicDataFile, GenreDataFile, secretKey);

app.post('/api/music/addMusic', authenticateToken, (req, res) => musicController.addMusic(req, res));
app.get('/api/music/getListAll', authenticateToken, (req, res) => musicController.getListAll(req, res));
app.post('/api/music/getListByGenreName', authenticateToken, (req, res) => musicController.getListByGenreName(req, res));
app.delete('/api/music/removeMusicByID', authenticateToken, (req, res) => musicController.removeMusicByID(req, res));
app.put('/api/music/updateMusicByID', authenticateToken, (req, res) => musicController.updateMusicByID(req, res));

// MusicDetailController
const MusicDetailController = require('./src/controllers/MusicDetailController');
const musicDetailController = new MusicDetailController(MusicDetailDataFile, secretKey);

app.post('/api/musicdetail/addMusicDetail', authenticateToken, (req, res) => musicDetailController.addMusicDetail(req, res));
app.post('/api/musicdetail/getMusicDetailByMusicName', authenticateToken, (req, res) => musicDetailController.getMusicDetailByMusicName(req, res));

// PlaylistController
const PlaylistController = require('./src/controllers/PlaylistController');
const playlistController = new PlaylistController(userDataFile, PlaylistDataFile, MusicDataFile, secretKey);

app.post('/api/playlist/addPlaylist', authenticateToken, (req, res) => playlistController.addPlaylist(req, res));
app.post('/api/playlist/addSongToPlaylist', authenticateToken, (req, res) => playlistController.addSongToPlaylist(req, res));
app.post('/api/playlist/getPlaylistByName', authenticateToken, (req, res) => playlistController.getPlaylist(req, res));

// HistoryController
const HistoryController = require('./src/controllers/HistoryController');
const historyController = new HistoryController(HistoryDataFile, CreateMusicHistoryFile, ListenMusicHistoryFile, secretKey);

app.post('/api/history/addHistory', authenticateToken, (req, res) => historyController.addHistory(req, res));
app.get('/api/history/getAllHistories', authenticateToken, (req, res) => historyController.getAllHistories(req, res));
app.post('/api/history/getHistoryById', authenticateToken, (req, res) => historyController.getHistoryById(req, res));
app.post('/api/history/removeHistoryById', authenticateToken, (req, res) => historyController.removeHistoryById(req, res));

// GenreController
const GenreController = require('./src/controllers/GenreController');
const genreController = new GenreController(GenreDataFile, secretKey);

app.post('/api/genre/addGenre', authenticateToken, (req, res) => genreController.addGenre(req, res));
app.get('/api/genre/getListAll', authenticateToken, (req, res) => genreController.getListAll(req, res));
app.delete('/api/genre/removeGenreById', authenticateToken, (req, res) => genreController.removeGenreById(req, res));
