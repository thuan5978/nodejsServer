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
            console.log('Saving playlist data:', data);
            console.log('To file:', this.PlaylistDataFile);
            fs.writeFileSync(this.PlaylistDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving playlist data:', error);
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
            console.log('Saving music data:', data);
            console.log('To file:', this.MusicDataFile);
            fs.writeFileSync(this.MusicDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving music data:', error);
        }
    }
    
    loadUserData() {
        try {
            const data = fs.readFileSync(this.UserDataFile, 'utf8');
            // Nếu dữ liệu trống, trả về mảng rỗng
            if (!data.trim()) {
                console.log('Dữ liệu người dùng trống.');
                return [];
            }
            const parsedData = JSON.parse(data);
            console.log('Dữ liệu người dùng:', parsedData);
            return parsedData;
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu người dùng:', error);
            return [];
        }
    }      
    
    async addPlaylist(req, res) {
        const { UserID, PlaylistName, PlaylistType, Date } = req.body;
    
        if (!UserID || !PlaylistName || !PlaylistType || !Date) {
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }
    
        try {
            // Kiểm tra người dùng
            const Users = this.loadUserData();
            console.log('Người dùng:', Users); // Thêm dòng này để kiểm tra dữ liệu người dùng
            const userExists = Users.some(user => user.id === UserID);
            if (!userExists) {
                return res.status(404).json({ message: 'UserID không tồn tại' });
            }
    
            // Kiểm tra playlist đã tồn tại
            const Playlists = this.loadPlaylistData();
            const existingPlaylist = Playlists.find(playlist => playlist.PlaylistName === PlaylistName && playlist.UserID === UserID);
            if (existingPlaylist) {
                return res.status(400).json({ message: 'Playlist đã tồn tại' });
            }
    
            // Thêm playlist mới
            const newPlaylist = { id: uuidv4(), PlaylistName, PlaylistType, Date, UserID, songs: [] };
            Playlists.push(newPlaylist);
            this.savePlaylistData(Playlists);
    
            res.json({ message: 'Tạo playlist thành công', id: newPlaylist.id });
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

    async playRandomSong(req, res) {
        const { PlaylistName } = req.body;
    
        if (!PlaylistName) {
            return res.status(400).json({ message: 'Tên playlist là bắt buộc' });
        }

        try {
            const Playlists = this.loadPlaylistData();
            const playlist = Playlists.find(p => p.PlaylistName === PlaylistName);

            if (!playlist || playlist.songs.length === 0) {
                return res.status(404).json({ message: 'Playlist không tìm thấy hoặc trống' });
            }

            const Musics = this.loadMusicData();
            const randomIndex = Math.floor(Math.random() * playlist.songs.length);
            const randomSongId = playlist.songs[randomIndex];
            const randomSong = Musics.find(m => m.id === randomSongId);

            if (!randomSong) {
                return res.status(404).json({ message: 'Bài hát không tìm thấy' });
            }

            res.json({ song: randomSong, message: `Phát ngẫu nhiên bài hát: ${randomSong.SongName}` });
        } catch (error) {
            console.error('Lỗi khi phát ngẫu nhiên:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async playNextSong(req, res) {
        const { PlaylistName, currentSongId, repeat } = req.body;

        if (!PlaylistName || !currentSongId) {
            return res.status(400).json({ message: 'Tên playlist và ID bài hát hiện tại là bắt buộc' });
        }

        try {
            const Playlists = this.loadPlaylistData();
            const playlist = Playlists.find(p => p.PlaylistName === PlaylistName);

            if (!playlist || playlist.songs.length === 0) {
                return res.status(404).json({ message: 'Playlist không tìm thấy hoặc trống' });
            }

            const Musics = this.loadMusicData();
            const currentIndex = playlist.songs.indexOf(currentSongId);

            if (currentIndex === -1) {
                return res.status(404).json({ message: 'Bài hát hiện tại không tìm thấy trong playlist' });
            }

            let nextIndex;
            if (repeat) {
                nextIndex = currentIndex; // Phát lại bài hiện tại nếu repeat được bật
            } else {
                nextIndex = (currentIndex + 1) % playlist.songs.length; // Lặp lại từ đầu nếu đến cuối playlist
            }

            const nextSongId = playlist.songs[nextIndex];
            const nextSong = Musics.find(m => m.id === nextSongId);

            if (!nextSong) {
                return res.status(404).json({ message: 'Bài hát tiếp theo không tìm thấy' });
            }

            res.json({ song: nextSong, message: `Phát bài hát tiếp theo: ${nextSong.SongName}` });
        } catch (error) {
            console.error('Lỗi khi phát bài hát tiếp theo:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
}

module.exports = PlaylistController;
