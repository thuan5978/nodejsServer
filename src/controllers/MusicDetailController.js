const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class MusicDetailController {
    constructor(musicDetailDataFile, secretKey) {
        this.musicDetailDataFile = musicDetailDataFile;
        this.secretKey = secretKey;
    }

    loadMusicDetailData() {
        try {
            const data = fs.readFileSync(this.musicDetailDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            return [];
        }
    }

    saveMusicDetailData(data) {
        try {
            fs.writeFileSync(this.musicDetailDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
        }
    }

    async addMusicDetail(req, res) {
        const { MusicName, Musician, Duration, Listen, Date, Resolution, GenreName } = req.body;
        console.log('Nội dung yêu cầu:', req.body);  // Ghi log nội dung yêu cầu

        if (!MusicName || !Musician || !Duration || !Listen || !Date || !Resolution || !GenreName) {
            console.log('Nội dung yêu cầu:', req.body);
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }

        try {
            const musicDetails = this.loadMusicDetailData();

            const newMusicDetail = { MusicName, Musician, Duration, Listen, Date, Resolution, GenreName };
            musicDetails.push(newMusicDetail);
            this.saveMusicDetailData(musicDetails);

            res.json({ message: 'Tạo thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm chi tiết âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async getMusicDetailByMusicName(req, res) {
        const { MusicName } = req.body; // Lấy tham số từ body của yêu cầu
    
        if (!MusicName) {
            return res.status(400).json({ message: 'Tên âm nhạc là bắt buộc' });
        }
    
        try {
            const musicDetails = this.loadMusicDetailData();
            const filteredMusicDetails = musicDetails.filter(musicDetail => musicDetail.MusicName === MusicName);
    
            if (filteredMusicDetails.length === 0) {
                return res.status(404).json({ musicDetails: [], message: 'Không tìm thấy chi tiết âm nhạc cho tên âm nhạc này' });
            }
    
            res.json({ musicDetails: filteredMusicDetails, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }   
}

module.exports = MusicDetailController;
