const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class HistoryController {
    constructor(historyDataFile, createMusicHistoryFile, listenMusicHistoryFile, songDataFile) {
        this.historyDataFile = historyDataFile;
        this.createMusicHistoryFile = createMusicHistoryFile;
        this.listenMusicHistoryFile = listenMusicHistoryFile;
        this.songDataFile = songDataFile; 
    }

    loadHistoryData(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${filePath}:`, error);
            return [];
        }
    }

    saveHistoryData(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error(`Lỗi khi lưu dữ liệu vào ${filePath}:`, error);
        }
    }

    async addHistory(req, res) {
        const { HISDATE, HISDURATION, HISTYPE, SOLUONG, songID } = req.body;

        if (!HISDATE || !HISDURATION || !HISTYPE || !SOLUONG || !songID) {
            return res.status(400).json({ message: 'Tất cả các trường đều bắt buộc' });
        }

        try {
            // Tải dữ liệu bài hát
            const songs = this.loadHistoryData(this.songDataFile);
            const song = songs.find(s => s.id === songID);

            if (!song) {
                return res.status(404).json({ message: 'Không tìm thấy bài hát' });
            }

            // Thêm lịch sử chính
            const histories = this.loadHistoryData(this.historyDataFile);
            const newHistory = { ID: uuidv4(), HISDATE, HISDURATION, HISTYPE, songName: song.name };
            histories.push(newHistory);
            this.saveHistoryData(this.historyDataFile, histories);

            // Thêm vào lịch sử tạo hoặc nghe nhạc
            if (HISTYPE === 'create') {
                const createMusicHistory = this.loadHistoryData(this.createMusicHistoryFile);
                const newCreateHistory = { IDLSTAO: newHistory.ID, SOLUONG, songName: song.name };
                createMusicHistory.push(newCreateHistory);
                this.saveHistoryData(this.createMusicHistoryFile, createMusicHistory);
            } else if (HISTYPE === 'listen') {
                const listenMusicHistory = this.loadHistoryData(this.listenMusicHistoryFile);
                const newListenHistory = { IDLSNGHE: newHistory.ID, SOLUONG, songName: song.name };
                listenMusicHistory.push(newListenHistory);
                this.saveHistoryData(this.listenMusicHistoryFile, listenMusicHistory);
            } else {
                return res.status(400).json({ message: 'Loại lịch sử không hợp lệ' });
            }

            res.json({ message: 'Thêm lịch sử thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm lịch sử:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async getAllHistories(req, res) {
        try {
            const histories = this.loadHistoryData(this.historyDataFile);
            res.json({ histories, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async getHistoryById(req, res) {
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).json({ message: 'ID là bắt buộc' });
        }

        try {
            const histories = this.loadHistoryData(this.historyDataFile);
            const history = histories.find(entry => entry.ID === ID);

            if (!history) {
                return res.status(404).json({ message: 'Không tìm thấy lịch sử' });
            }

            res.json({ history, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử theo ID:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async removeHistoryById(req, res) {
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).json({ message: 'ID là bắt buộc' });
        }

        try {
            const histories = this.loadHistoryData(this.historyDataFile);
            const index = histories.findIndex(entry => entry.ID === ID);

            if (index === -1) {
                return res.status(404).json({ message: 'Không tìm thấy lịch sử' });
            }

            histories.splice(index, 1);
            this.saveHistoryData(this.historyDataFile, histories);
            res.json({ message: 'Xóa lịch sử thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa lịch sử:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
}

module.exports = HistoryController;
