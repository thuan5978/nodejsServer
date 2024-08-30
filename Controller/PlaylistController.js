const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class PlaylistController {
    constructor(PlaylistDataFile, MusicDataFile) {
        this.PlaylistDataFile = PlaylistDataFile;
        this.MusicDataFile = MusicDataFile;
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
        const { PlaylistName, PlaylistType, Date, Listen } = req.body;
        console.log('Nội dung yêu cầu:', req.body);

        if (!PlaylistName || !PlaylistType || !Date || !Listen) {
            return res.status(400).json({ message: 'Tất cả các trường đều yêu cầu' });
        }

        try {
            const Playlists = this.loadPlaylistData();
            const existingPlaylist = Playlists.find(playlist => playlist.PlaylistName === PlaylistName);
            if (existingPlaylist) {
                return res.status(400).json({ message: 'Playlist đã tồn tại' });
            }

            const newPlaylist = { id: uuidv4(), PlaylistName, PlaylistType, Date, Listen, songs: [] };
            Playlists.push(newPlaylist);
            this.savePlaylistData(Playlists);

            res.json({ message: 'Tạo playlist thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm playlist:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async addSongToPlaylist(req, res) {
        const { playlistId, songId } = req.body;

        if (!playlistId || !songId) {
            return res.status(400).json({ message: 'ID playlist và ID bài hát là bắt buộc' });
        }

        try {
            const Playlists = this.loadPlaylistData();
            const playlist = Playlists.find(playlist => playlist.id === playlistId);

            if (!playlist) {
                return res.status(404).json({ message: 'Playlist không tìm thấy' });
            }

            const Musics = this.loadMusicData();
            const song = Musics.find(m => m.id === songId);

            if (!song) {
                return res.status(404).json({ message: 'Bài hát không tìm thấy' });
            }

            if (playlist.songs.includes(songId)) {
                return res.status(400).json({ message: 'Bài hát đã tồn tại trong playlist' });
            }

            playlist.songs.push(songId);
            this.savePlaylistData(Playlists);

            res.json({ message: 'Bài hát đã được thêm vào playlist thành công' });
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào playlist:', error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
        }
    }

    async getPlaylistByID(req, res) {
        const { id } = req.params; // Sử dụng req.params thay vì req.body

        if (!id) {
            return res.status(400).json({ message: 'ID playlist là bắt buộc' });
        }

        try {
            const Playlists = this.loadPlaylistData();
            const playlist = Playlists.find(playlist => playlist.id === id);

            if (!playlist) {
                return res.status(404).json({ message: 'Playlist không tìm thấy' });
            }

            // Lấy thông tin bài hát cho playlist
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
