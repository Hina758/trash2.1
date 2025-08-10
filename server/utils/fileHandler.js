const fs = require('fs').promises;
const path = require('path');

const dbDirectory = path.join(__dirname, '..', 'db');

const readJSONFile = async (filename) => {
    const filePath = path.join(dbDirectory, filename);
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dbDirectory, { recursive: true });
            await fs.writeFile(filePath, '[]', 'utf8');
            return [];
        }
        throw error;
    }
};

const writeJSONFile = async (filename, data) => {
    const filePath = path.join(dbDirectory, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readJSONFile, writeJSONFile };