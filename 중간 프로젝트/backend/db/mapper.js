const mysql = require("mariadb");
require("dotenv").config();

// 1. DB 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "dev", // 사용 중인 DB 이름

  // [최적화 설정]
  waitForConnections: true, // 연결이 꽉 찼을 때 대기 여부
  connectionLimit: 10, // 동시에 유지할 최대 연결 수
  queueLimit: 0, // 대기 줄 제한 없음
  connectTimeout: 10000, // 10초 동안 연결 안 되면 실패 처리
  enableKeepAlive: true, // 유휴 상태일 때 연결 유지 (벽돌 방지)
  keepAliveInitialDelay: 10000, // 10초마다 연결 상태 확인
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
