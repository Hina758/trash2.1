const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/fileHandler");

const USERS_FILE = "users.json";

// 회원가입
router.post("/signup", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
    }

    let users = readJSON(USERS_FILE);
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
    }

    const newUser = { username, password, scores: { classic: 0, infinite: 0, online: 0 } };
    users.push(newUser);
    writeJSON(USERS_FILE, users);

    res.json({ message: "회원가입 성공!" });
});

// 로그인
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    let users = readJSON(USERS_FILE);

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    res.json({ message: "로그인 성공", user });
});

module.exports = router;
