const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// public 폴더를 정적 파일 제공 경로로 설정합니다.
// 이렇게 하면 public 폴더 안의 모든 파일에 직접 접근할 수 있습니다.
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
    console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
});