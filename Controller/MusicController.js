const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class MusicController {
    constructor(MusicDataFile, GenreDataFile, secretKey, createMusicHistoryFile) {
        this.MusicDataFile = MusicDataFile;
        this.GenreDataFile = GenreDataFile;
        this.secretKey = secretKey;
        this.createMusicHistoryFile = createMusicHistoryFile; 
    }

    loadMusicData() {
        try {
            const data = fs.readFileSync(this.MusicDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu âm nhạc:', error);
            return [];
        }
    }

    loadGenreData() {
        try {
            const data = fs.readFileSync(this.GenreDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu thể loại:', error);
            return [];
        }
    }

    saveMusicData(data) {
        try {
            fs.writeFileSync(this.MusicDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu âm nhạc:', error);
        }
    }

    loadHistoryData(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu lịch sử:', error);
            return [];
        }
    }

    saveHistoryData(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu lịch sử:', error);
        }
    }

    async addMusic(req, res) {
        const { MusicName, Img, GenreName } = req.body;
        console.log('Nội dung yêu cầu:', req.body);  // Ghi log nội dung yêu cầu
    
        if (!MusicName || !Img || !GenreName) {
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }
    
        try {
            const Genres = this.loadGenreData();
            const existingGenre = Genres.find(genre => genre.Name === GenreName);
            if (!existingGenre) {
                return res.status(400).json({ message: 'Thể loại không tồn tại' });
            }
    
            const Musics = this.loadMusicData();
            const existingMusic = Musics.find(music => music.MusicName === MusicName);
            if (existingMusic) {
                return res.status(400).json({ message: 'Âm nhạc đã tồn tại' });
            }
    
            const newMusic = { id: uuidv4(), MusicName, Img, GenreName };
            Musics.push(newMusic);
            this.saveMusicData(Musics);

            // Ghi lịch sử tạo nhạc
            const createMusicHistory = this.loadHistoryData(this.createMusicHistoryFile);
            const newMusicHistory = {
                id: uuidv4(),
                MusicID: newMusic.id,
                MusicName: newMusic.MusicName,
                Img: newMusic.Img,
                GenreName: newMusic.GenreName,
                createdAt: new Date().toISOString()
            };
            createMusicHistory.push(newMusicHistory);
            this.saveHistoryData(this.createMusicHistoryFile, createMusicHistory);
    
            res.json({ message: 'Tạo âm nhạc thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

}

module.exports = MusicController;
