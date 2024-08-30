const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class MusicDetailController {
    constructor(MusicDetailDataFile, secretKey) {
        this.MusicDetailDataFile = MusicDetailDataFile;
        this.secretKey = secretKey;
    }

    loadBillDetailData() {
        try {
            const data = fs.readFileSync(this.MusicDetailDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            return [];
        }
    }

    saveBillDetailData(data) {
        try {
            fs.writeFileSync(this.MusicDetailDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
        }
    }

    async addBillDetail(req, res) {
        const { MusicID, Musician, Duration, Listen, Date, Resolution, GenreID } = req.body;
        console.log('Nội dung yêu cầu:', req.body);  // Ghi log nội dung yêu cầu

        if (!MusicID || !Musician || !Duration || !Listen || !Date || !Resolution || !GenreID) {
            console.log('Nội dung yêu cầu:', req.body);
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }

        try {
            const MusicDetails = this.loadBillDetailData();

            const newMusicDetail = { MusicID, Musician, Duration, Listen, Date, Resolution, GenreID };
            MusicDetails.push(newMusicDetail);
            this.saveBillDetailData(MusicDetails);

            res.json({ message: 'Tạo thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm chi tiết hóa đơn:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async getMusicDetailByMusicID(req, res) {
        const { MusicID } = req.body;

        if (!MusicID) {
            return res.status(400).json({ message: 'Music ID là bắt buộc' });
        }

        try {
            const MusicDetails = this.loadBillDetailData();
            const filteredMusicDetail = MusicDetails.filter(MusicDetail => MusicDetail.MusicID === MusicID);

            res.json({ MusicDetails: filteredMusicDetail, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết âm nhạc:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
}

module.exports = MusicDetailController;
