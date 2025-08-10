const fs = require('fs').promises;
const path =require('path');

const dbDirectory = path.join(__dirname, '..', 'db');

// 파일 경로를 반환하고, db 폴더가 없으면 생성하는 함수
async function ensureDbDirectory(filename) {
    try {
        await fs.access(dbDirectory);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dbDirectory);
        } else {
            throw error;
        }
    }
    return path.join(dbDirectory, filename);
}

const readJSONFile = async (filename) => {
    const filePath = await ensureDbDirectory(filename);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(filePath, '[]', 'utf8');
            return [];
        }
        // 파일 내용이 비어있거나 잘못된 JSON일 경우 빈 배열 반환
        if (error instanceof SyntaxError) {
             await fs.writeFile(filePath, '[]', 'utf8');
            return [];
        }
        throw error;
    }
};

const writeJSONFile = async (filename, data) => {
    const filePath = await ensureDbDirectory(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readJSONFile, writeJSONFile };