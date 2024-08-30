const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
const upload = multer({ storage: storage });

// Middleware to authenticate user based on JWT

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

const userDataFile = path.join(__dirname, 'userData.json');
const FavoriteDataFile = path.join(__dirname,'FavoriteData.json');
const GenreDataFile = path.join(__dirname,'GenreData.json');
const HistoryDataFile = path.join(__dirname,'HistoryData.json');
const MusicDataFile = path.join(__dirname,'MusicData.json');
const PlaylistDataFile = path.join(__dirname,'PlaylistData.json');
const secretKey = 'abc123'; 

const AuthController = require('./Controller/authController');
const authController = new AuthController(userDataFile, secretKey);

app.post('/api/Auth/signUp', upload.none(), (req, res) => authController.signUp(req, res));
app.post('/api/Auth/signIn', upload.none(), (req, res) => authController.signIn(req, res));
app.get('/api/Auth/current', upload.none(), (req, res) => authController.getCurrentUser(req, res));
app.post('/api/Auth/updateProfile', upload.none(), (req, res) => authController.updateProfile(req, res));
app.post('/api/Auth/changePassword', upload.none(), (req, res) => authController.changePassword(req, res));

const MusicController = require('./Controller/MusicController');
const musicController = new MusicController(MusicDataFile, GenreDataFile, secretKey);

app.post('/api/music/addMusic', authenticateToken, (req, res) => musicController.addMusic(req, res));
app.get('/api/music/getListAll', authenticateToken, (req, res) => musicController.getListAll(req, res));
app.post('/api/music/getListByGenreName', authenticateToken, (req, res) => musicController.getListByGenreName(req, res));
app.delete('/api/music/removeMusicByID', authenticateToken, (req, res) => musicController.removeMusicByID(req, res));
app.put('/api/music/updateMusicByID', authenticateToken, (req, res) => musicController.updateMusicByID(req, res));

const MusicDetailController = require('./Controller/MusicDetailController');
const musicDetailController = new MusicDetailController(MusicDataFile, secretKey);

app.post('/api/musicdetail/addBillDetail', authenticateToken, (req, res) => musicDetailController.addBillDetail(req, res));
app.post('/api/musicdetail/getMusicDetailByMusicID', authenticateToken, (req, res) => musicDetailController.getMusicDetailByMusicID(req, res));

const PlaylistController = require('./Controller/PlaylistController');
const playlistController = new PlaylistController(PlaylistDataFile, MusicDataFile,secretKey);

app.post('/api/playlist/addPlaylist', authenticateToken, (req, res) => playlistController.addPlaylist(req, res));
app.post('/api/playlist/addSongToPlaylist', authenticateToken, (req, res) => playlistController.addSongToPlaylist(req, res));
app.get('/api/playlist/getPlaylistByID', authenticateToken, (req, res) => playlistController.getPlaylistByID(req, res));

const FavoriteController = require('./Controller/FavoriteController');
const favoriteController = new FavoriteController(FavoriteDataFile, MusicDataFile,secretKey);

app.post('/api/favorite/addFavorite', authenticateToken, (req, res) => favoriteController.addFavorite(req, res));
app.get('/api/favorite/getFavoritesByUser', authenticateToken, (req, res) => favoriteController.getFavoritesByUser(req, res));
app.delete('/api/favorite/removeFavorite', authenticateToken, (req, res) => favoriteController.removeFavorite(req, res));

const HistoryController = require('./Controller/HistoryController');
const historyController = new HistoryController(HistoryDataFile,secretKey);

app.post('/api/history/addHistory', authenticateToken, (req, res) => historyController.addHistory(req, res));
app.get('/api/history/getHistoryByUser', authenticateToken, (req, res) => historyController.getHistoryByUser(req, res));

const GenreController = require('./Controller/GenreController');
const genreController = new GenreController(GenreDataFile,secretKey);

app.post('/api/genre/addGenre', authenticateToken, (req, res) => genreController.addGenre(req, res));
app.get('/api/genre/getListAll', authenticateToken, (req, res) => genreController.getListAll(req, res));
app.delete('/api/genre/removeGenreById', authenticateToken, (req, res) => genreController.removeGenreById(req, res));
