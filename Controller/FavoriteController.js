const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FavoriteController {
    constructor(FavoriteDataFile, MusicDataFile) {
        this.FavoriteDataFile = FavoriteDataFile;
        this.MusicDataFile = MusicDataFile;
    }

    loadFavoriteData() {
        try {
            const data = fs.readFileSync(this.FavoriteDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu yêu thích:', error);
            return [];
        }
    }

    saveFavoriteData(data) {
        try {
            fs.writeFileSync(this.FavoriteDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu yêu thích:', error);
        }
    }

    async addFavorite(req, res) {
        const { userId, MusicID, FCAPACITY, FQUANTITY } = req.body;

        if (!userId || !MusicID || !FCAPACITY || !FQUANTITY) {
            return res.status(400).json({ message: 'ID người dùng, ID âm nhạc, FCAPACITY, và FQUANTITY là bắt buộc' });
        }

        try {
            const favorites = this.loadFavoriteData();
            const existingFavorite = favorites.find(fav => fav.userId === userId && fav.musicId === MusicID);

            if (existingFavorite) {
                return res.status(400).json({ message: 'Âm nhạc đã có trong danh sách yêu thích' });
            }

            const newFavorite = { id: uuidv4(), userId, musicId: MusicID, FCAPACITY, FQUANTITY };
            favorites.push(newFavorite);
            this.saveFavoriteData(favorites);

            res.json({ message: 'Thêm âm nhạc vào danh sách yêu thích thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm yêu thích:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async getFavoritesByUser(req, res) {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'ID người dùng là bắt buộc' });
        }

        try {
            const favorites = this.loadFavoriteData();
            const userFavorites = favorites.filter(fav => fav.userId === userId);

            if (userFavorites.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy âm nhạc yêu thích cho người dùng này' });
            }

            const musicData = JSON.parse(fs.readFileSync(this.MusicDataFile, 'utf8'));
            const favoriteMusicDetails = userFavorites.map(fav => {
                const music = musicData.find(music => music.id === fav.musicId);
                return { ...music, FCAPACITY: fav.FCAPACITY, FQUANTITY: fav.FQUANTITY };
            });

            res.json({ favorites: favoriteMusicDetails, message: 'Thành công' });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu thích của người dùng:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async removeFavorite(req, res) {
        const { userId, MusicID } = req.body;

        if (!userId || !MusicID) {
            return res.status(400).json({ message: 'ID người dùng và ID âm nhạc là bắt buộc' });
        }

        try {
            const favorites = this.loadFavoriteData();
            const index = favorites.findIndex(fav => fav.userId === userId && fav.musicId === MusicID);

            if (index === -1) {
                return res.status(404).json({ message: 'Yêu thích không tìm thấy' });
            }

            favorites.splice(index, 1);
            this.saveFavoriteData(favorites);

            res.json({ message: 'Xóa âm nhạc khỏi danh sách yêu thích thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa yêu thích:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }
}

module.exports = FavoriteController;
