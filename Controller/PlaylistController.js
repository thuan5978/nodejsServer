const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PlaylistController {
    constructor(UserDataFile, PlaylistDataFile, MusicDataFile) {
        this.UserDataFile = UserDataFile;
        this.PlaylistDataFile = PlaylistDataFile;
        this.MusicDataFile = MusicDataFile;
    }

    loadUserData() {
        try {
            const data = fs.readFileSync(this.UserDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu người dùng:', error);
            return [];
        }
    }

    saveUserData(data) {
        try {
            fs.writeFileSync(this.UserDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu người dùng:', error);
        }
    }

    loadPlaylistData() {
        try {
            const data = fs.readFileSync(this.PlaylistDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu playlist:', error);
            return [];
        }
    }

    savePlaylistData(data) {
        try {
            fs.writeFileSync(this.PlaylistDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu playlist:', error);
        }
    }

    loadMusicData() {
        try {
            const data = fs.readFileSync(this.MusicDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu bài hát:', error);
            return [];
        }
    }

    saveMusicData(data) {
        try {
            fs.writeFileSync(this.MusicDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu bài hát:', error);
        }
    }

    async addPlaylist(req, res) {
        const { UserID, PlaylistName, PlaylistType, Date } = req.body;
        
        if (!UserID || !PlaylistName || !PlaylistType || !Date) {
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }

        try {
            const Playlists = this.loadPlaylistData();
            const existingPlaylist = Playlists.find(playlist => playlist.PlaylistName === PlaylistName && playlist.UserID === UserID);
            if (existingPlaylist) {
                return res.status(400).json({ message: 'Playlist đã tồn tại' });
            }

            const newPlaylist = { id: uuidv4(), PlaylistName, PlaylistType, Date, UserID, songs: [] };
            Playlists.push(newPlaylist);
            this.savePlaylistData(Playlists);

            res.json({ message: 'Tạo playlist thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm playlist:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async addSongToPlaylist(req, res) {
        const { PlaylistName, MusicName } = req.body;
    
        if (!PlaylistName || !MusicName) {
            return res.status(400).json({ message: 'Tên playlist và tên bài hát là bắt buộc' });
        }
    
        try {
            const Playlists = this.loadPlaylistData();
            const playlist = Playlists.find(playlist => playlist.PlaylistName === PlaylistName);
    
            if (!playlist) {
                return res.status(404).json({ message: 'Playlist không tìm thấy' });
            }
    
            const Musics = this.loadMusicData();
            const song = Musics.find(m => m.SongName === MusicName);
    
            if (!song) {
                return res.status(404).json({ message: 'Bài hát không tìm thấy' });
            }
    
            if (playlist.songs.includes(song.id)) {
                return res.status(400).json({ message: 'Bài hát đã tồn tại trong playlist' });
            }
    
            playlist.songs.push(song.id);
            this.savePlaylistData(Playlists);
    
            const safePlaylistName = PlaylistName.replace(/\s+/g, '_');
            const playlistFilePath = path.join(__dirname, 'playlists', `${safePlaylistName}.txt`);
    
            if (!fs.existsSync(path.join(__dirname, 'playlists'))) {
                fs.mkdirSync(path.join(__dirname, 'playlists'));
            }
    
            fs.appendFileSync(playlistFilePath, `${song.SongName}\n`, 'utf8');
    
            res.json({ message: `Bài hát đã được thêm vào playlist '${PlaylistName}' và ghi vào file ${safePlaylistName}.txt` });
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào playlist:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
    
    async getPlaylistByName(req, res) {
        const { PlaylistName } = req.body;
    
        if (!PlaylistName) {
            return res.status(400).json({ message: 'Tên playlist là bắt buộc' });
        }
    
        try {
            const Playlists = this.loadPlaylistData();
            const playlist = Playlists.find(playlist => playlist.PlaylistName === PlaylistName);
    
            if (!playlist) {
                return res.status(404).json({ message: 'Playlist không tìm thấy' });
            }
    
            const Musics = this.loadMusicData();
            const songs = playlist.songs.map(songId => Musics.find(m => m.id === songId)).filter(song => song);
    
            res.json({ playlist: { ...playlist, songs }, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy playlist:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }    
}

module.exports = PlaylistController;
