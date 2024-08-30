const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class HistoryController {
    constructor(historyDataFile) {
        this.historyDataFile = historyDataFile;
    }

    loadHistoryData() {
        try {
            const data = fs.readFileSync(this.historyDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading history data:', error);
            return [];
        }
    }

    saveHistoryData(data) {
        try {
            fs.writeFileSync(this.historyDataFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving history data:', error);
        }
    }

    async addHistory(req, res) {
        const { HISDATE, HISDURATION, HISTYPE } = req.body;

        if (!HISDATE || !HISDURATION || !HISTYPE) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            const histories = this.loadHistoryData();
            const newHistory = { ID: uuidv4(), HISDATE, HISDURATION, HISTYPE };
            histories.push(newHistory);
            this.saveHistoryData(histories);
            res.json({ message: 'History entry created successfully' });
        } catch (error) {
            console.error('Error adding history:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAllHistories(req, res) {
        try {
            const histories = this.loadHistoryData();
            res.json({ histories, message: 'Success' });
        } catch (error) {
            console.error('Error fetching histories:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getHistoryById(req, res) {
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).json({ message: 'ID is required' });
        }

        try {
            const histories = this.loadHistoryData();
            const history = histories.find(entry => entry.ID === ID);

            if (!history) {
                return res.status(404).json({ message: 'History entry not found' });
            }

            res.json({ history, message: 'Success' });
        } catch (error) {
            console.error('Error fetching history by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async removeHistoryById(req, res) {
        const { ID } = req.body;

        if (!ID) {
            return res.status(400).json({ message: 'ID is required' });
        }

        try {
            const histories = this.loadHistoryData();
            const index = histories.findIndex(entry => entry.ID === ID);

            if (index === -1) {
                return res.status(404).json({ message: 'History entry not found' });
            }

            histories.splice(index, 1);
            this.saveHistoryData(histories);
            res.json({ message: 'History entry removed successfully' });
        } catch (error) {
            console.error('Error removing history entry:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = HistoryController;
