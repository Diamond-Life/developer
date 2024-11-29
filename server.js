// // server.js
// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 3000;

// // Body Parser Middleware 설정
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // 정적 파일 제공 (HTML, CSS, JS)
// app.use(express.static('front'));

// // 간단한 사용자 데이터 저장소 (메모리 기반)
// const users = [
//     { userId: 'admin', userPassword: 'admin123' }
// ];

// // 회원가입 처리 라우트
// app.post('/signup', (req, res) => {
//     const { userId, userPassword } = req.body;

//     // 입력 값 유효성 검사
//     if (!userId || !userPassword) {
//         return res.status(400).send('아이디와 비밀번호를 입력하세요.');
//     }

//     // 중복 아이디 확인
//     const existingUser = users.find(user => user.userId === userId);
//     if (existingUser) {
//         return res.status(409).send('이미 존재하는 아이디입니다.');
//     }

//     // 새 사용자 추가
//     users.push({ userId, userPassword });
//     console.log('회원가입 완료:', users);

//     return res.status(200).send('회원가입 성공!');
// });

// // 로그인 처리 라우트
// app.post('/login', (req, res) => {
//     const { userId, userPassword } = req.body;

//     // 입력 값 유효성 검사
//     if (!userId || !userPassword) {
//         return res.status(400).send('아이디와 비밀번호를 입력하세요.');
//     }

//     // 사용자 확인
//     const user = users.find(user => user.userId === userId && user.userPassword === userPassword);
//     if (!user) {
//         return res.status(401).send('아이디 또는 비밀번호가 일치하지 않습니다.');
//     }

//     console.log('로그인 성공:', user);
//     return res.status(200).send('로그인 성공!');
// });

// // 서버 시작
// app.listen(port, () => {
//     console.log(`서버가 실행 중입니다. http://localhost:${port}`);
// });
const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');

// Express 애플리케이션 생성
const app = express();
const port = 3000;

// Body Parser Middleware 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static('front'));

// MariaDB 연결 풀 생성
const pool = mariadb.createPool({
    host: '211.183.3.136',      // MariaDB 호스트
    user: 'testuser',       // MariaDB 사용자 이름
    password: 'password',   // MariaDB 비밀번호
    database: 'testdb',     // 사용할 데이터베이스 이름
    connectionLimit: 5      // 최대 연결 수
});

// 테이블 없으면 만들기
const initDB = async () => {
    try {
        const conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(50) NOT NULL UNIQUE,
                userPassword VARCHAR(255) NOT NULL
            );
        `);
        console.log("users 테이블 확인 및 생성 완료.");
        conn.release();
    } catch (err) {
        console.error("DB 초기화 오류:", err);
    }
};

initDB();



// 회원가입 처리 라우트
app.post('/signup', async (req, res) => {
    const { userId, userPassword } = req.body;

    // 입력 값 유효성 검사
    if (!userId || !userPassword) {
        return res.status(400).send('아이디와 비밀번호를 입력하세요.');
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 중복 아이디 확인
        const existingUser = await connection.query('SELECT * FROM users WHERE userId = ?', [userId]);
        if (existingUser.length > 0) {
            return res.status(409).send('이미 존재하는 아이디입니다.');
        }

        // 새 사용자 추가
        await connection.query('INSERT INTO users (userId, userPassword) VALUES (?, ?)', [userId, userPassword]);
        console.log('회원가입 완료:', { userId, userPassword });

        return res.status(200).send('회원가입 성공!');
    } catch (err) {
        console.error('회원가입 중 오류 발생:', err);
        return res.status(500).send('서버 오류');
    } finally {
        if (connection) connection.release();
    }
});

// 로그인 처리 라우트
app.post('/login', async (req, res) => {
    const { userId, userPassword } = req.body;

    // 입력 값 유효성 검사
    if (!userId || !userPassword) {
        return res.status(400).send('아이디와 비밀번호를 입력하세요.');
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 사용자 확인
        const user = await connection.query(
            'SELECT * FROM users WHERE userId = ? AND userPassword = ?', 
            [userId, userPassword]
        );

        if (user.length === 0) {
            return res.status(401).send('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        console.log('로그인 성공:', user[0]);
        return res.status(200).send('로그인 성공!');
    } catch (err) {
        console.error('로그인 중 오류 발생:', err);
        return res.status(500).send('서버 오류');
    } finally {
        if (connection) connection.release();
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 실행 중입니다. http://localhost:${port}`);
});
