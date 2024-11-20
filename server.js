// server.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Body Parser Middleware 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static('front'));

// 간단한 사용자 데이터 저장소 (메모리 기반)
const users = [
    { userId: 'admin', userPassword: 'admin123' }
];

// 회원가입 처리 라우트
app.post('/signup', (req, res) => {
    const { userId, userPassword } = req.body;

    // 입력 값 유효성 검사
    if (!userId || !userPassword) {
        return res.status(400).send('아이디와 비밀번호를 입력하세요.');
    }

    // 중복 아이디 확인
    const existingUser = users.find(user => user.userId === userId);
    if (existingUser) {
        return res.status(409).send('이미 존재하는 아이디입니다.');
    }

    // 새 사용자 추가
    users.push({ userId, userPassword });
    console.log('회원가입 완료:', users);

    return res.status(200).send('회원가입 성공!');
});

// 로그인 처리 라우트
app.post('/login', (req, res) => {
    const { userId, userPassword } = req.body;

    // 입력 값 유효성 검사
    if (!userId || !userPassword) {
        return res.status(400).send('아이디와 비밀번호를 입력하세요.');
    }

    // 사용자 확인
    const user = users.find(user => user.userId === userId && user.userPassword === userPassword);
    if (!user) {
        return res.status(401).send('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    console.log('로그인 성공:', user);
    return res.status(200).send('로그인 성공!');
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 실행 중입니다. http://localhost:${port}`);
});
