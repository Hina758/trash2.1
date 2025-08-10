const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');
const matchRoutes = require('./routes/match.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/match', matchRoutes);

app.listen(PORT, () => {
    console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
});