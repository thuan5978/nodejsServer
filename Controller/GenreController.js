const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const token = "";

class GenreController {

    constructor(GenreDataFile, secretKey) {
        this.GenreDataFile = GenreDataFile;
        this.secretKey = secretKey;
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

    saveGenreData(data) {
        try {
            fs.writeFileSync(this.GenreDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving genre data:', error);
        }
    }

    async addGenre(req, res) {
        const { Name } = req.body;
        console.log('Request body:', req.body);  // Debug: Log the request body

        if (!Name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            const genres = this.loadGenreData();

            const existingGenre = genres.find(genre => genre.Name === Name);
            if (existingGenre) {
                return res.status(400).json({ message: 'Genre already exists' });
            }

            const newGenre = { id: uuidv4(), Name };
            genres.push(newGenre);
            this.saveGenreData(genres);

            res.json({ message: 'Create successful', genre: newGenre });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getListAll(req, res) {
        try {
            const Genres = this.loadGenreData();
            res.json({ Genres, message: 'Genres retrieved successfully' });
        } catch (error) {
            console.error('Error retrieving genres:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async removeGenreById(req, res) {
        const { GenreID } = req.body;

        if (!GenreID) {
            return res.status(400).json({ message: 'Genre ID is required' });
        }

        try {
            const Genres = this.loadGenreData();
            const index = Genres.findIndex(genre => genre.id === GenreID);

            if (index === -1) {
                return res.status(404).json({ message: 'Genre not found' });
            }

            Genres.splice(index, 1);
            this.saveGenreData(Genres);

            res.json({ message: 'Genre removed successfully' });
        } catch (error) {
            console.error('Error removing genre:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = GenreController;
