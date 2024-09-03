const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class MusicController {
    constructor(MusicDataFile, GenreDataFile, secretKey) {
        this.MusicDataFile = MusicDataFile;
        this.GenreDataFile = GenreDataFile;
        this.secretKey = secretKey;
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
    
            res.json({ message: 'Tạo âm nhạc thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
    async getListAll(req, res) {
        try {
            const Musics = this.loadMusicData();
            res.json({ Musics, message: 'Danh sách âm nhạc đã được lấy thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
    

    async getListByGenreName(req, res) {
        const { GenreName } = req.body;
    
        if (!GenreName) {
            return res.status(400).json({ message: 'Tên thể loại là bắt buộc' });
        }
    
        try {
            const Musics = this.loadMusicData();
            const filteredMusics = Musics.filter(music => music.GenreName === GenreName);
    
            if (filteredMusics.length === 0) {
                return res.status(404).json({ Musics: [], message: 'Không tìm thấy âm nhạc cho thể loại này' });
            }
    
            res.json({ Musics: filteredMusics, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách âm nhạc theo thể loại:', error);
            res.status(500).json({ Musics: [], message: 'Lỗi máy chủ nội bộ' });
        }
    }
    

    async removeMusicByID(req, res) {
        const { MusicID } = req.body;

        if (!MusicID) {
            return res.status(400).json({ message: 'ID âm nhạc là bắt buộc' });
        }

        try {
            const Musics = this.loadMusicData();
            const index = Musics.findIndex(music => music.id === MusicID);

            if (index === -1) {
                return res.status(404).json({ message: 'Âm nhạc không tìm thấy' });
            }

            Musics.splice(index, 1);
            this.saveMusicData(Musics);

            res.json({ message: 'Âm nhạc đã được xóa thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async updateMusicByID(req, res) {
        const { Id, MusicName, Img, GenreID, GenreName } = req.body;

        if (!Id || !MusicName || !Img || !GenreID || !GenreName) {
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }

        try {
            const Musics = this.loadMusicData();
            const MusicIndex = Musics.findIndex(music => music.id === Id);

            if (MusicIndex === -1) {
                return res.status(404).json({ message: 'Âm nhạc không tìm thấy' });
            }

            const Genres = this.loadGenreData();
            const existingGenre = Genres.find(genre => genre.Name === GenreName);
            if (!existingGenre) {
                return res.status(400).json({ message: 'Thể loại không tồn tại' });
            }

            Musics[MusicIndex] = { id: Id, MusicName, Img, GenreID, GenreName };
            this.saveMusicData(Musics);

            res.json({ Musics, message: 'Cập nhật âm nhạc thành công' });
        } catch (error) {
            console.error('Lỗi khi cập nhật âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
}

module.exports = MusicController;
