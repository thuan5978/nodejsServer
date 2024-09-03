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
        const genresToAdd = req.body;  
        console.log('Request body:', genresToAdd);
    
        if (!Array.isArray(genresToAdd) || genresToAdd.length === 0) {
            return res.status(400).json({ message: 'A non-empty array of genres is required' });
        }
    
        try {
            const genres = this.loadGenreData();
    
            genresToAdd.forEach(genre => {
                const { Name } = genre;
                if (!Name) {
                    throw new Error('Each genre must have a Name field');
                }
    
                const existingGenre = genres.find(g => g.Name === Name);
                if (!existingGenre) {
                    const newGenre = { id: uuidv4(), Name };
                    genres.push(newGenre);
                }
            });
    
            this.saveGenreData(genres);
            res.json({ message: 'Genres created successfully', genres });
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
