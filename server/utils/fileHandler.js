const fs = require('fs');
const path = require('path');

// db 폴더의 경로를 미리 지정
const dbDirectory = path.join(__dirname, '..', 'db');

/**
 * JSON 파일을 읽어와 객체로 변환하는 함수
 * @param {string} filename - 읽어올 파일 이름 (예: 'users.json')
 * @returns {Promise<any>} - 파싱된 JSON 데이터
 */
const readJSONFile = (filename) => {
    const filePath = path.join(dbDirectory, filename);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                // 파일이 없으면 빈 배열을 반환하여 오류 방지
                if (err.code === 'ENOENT') {
                    return resolve([]);
                }
                return reject(err);
            }
            try {
                // 파일 내용이 비어있으면 빈 배열 반환
                if (!data) {
                    return resolve([]);
                }
                resolve(JSON.parse(data));
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
};

/**
 * 데이터를 JSON 파일로 저장하는 함수
 * @param {string} filename - 저장할 파일 이름
 * @param {any} data - 저장할 데이터
 * @returns {Promise<void>}
 */
const writeJSONFile = (filename, data) => {
    const filePath = path.join(dbDirectory, filename);
    return new Promise((resolve, reject) => {
        // JSON.stringify의 세 번째 인자는 가독성을 위해 들여쓰기(2칸)를 추가하는 옵션
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

// 다른 파일에서 이 함수들을 사용할 수 있도록 export
module.exports = {
    readJSONFile,
    writeJSONFile
};