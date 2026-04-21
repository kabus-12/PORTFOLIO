const pool = require("../db/mapper");

const service = {
  getList: async function name(filter) {
    console.log("서비스 시작함:", filter);
    try {
      const query = `select * from center`;
      const result = await pool.query(query);
      console.log("기관목록 조회성공:", result);
      return result;
    } catch (error) {
      console.log("기관목록 조회에러:", error);
      return [];
    }
  },
  addCenter: async function (data) {
    console.log("기관 데이터 확인:", data);

    try {
      const query = `insert into center (registernum, center_name, repname, center_email, center_addr, runed, center_tel, reg_date)
      values(?,?,?,?,?,?,?,NOW()) `;

      const values = [
        data.registernum,
        data.center_name,
        data.repname,
        data.center_email,
        data.center_addr,
        data.runed,
        data.center_tel,
      ];
      const result = await pool.query(query, values);
      console.log("DB 연결 완료", result);
      return result;
    } catch (err) {
      console.log("DB 연결 안됨:", err);
      throw err;
    }
  },
  // center_service.js 수정
  updateCenter: async function (centerData) {
    const {
      registernum, // 실제 PK 이름
      center_name,
      center_tel,
      center_addr, // DB 컬럼명에 맞춤
      center_email,
    } = centerData;

    // 테이블명을 centers에서 center로 수정
    const query = `
    UPDATE center 
    SET center_name = ?, 
        center_tel = ?, 
        center_addr = ?, 
        center_email = ?
    WHERE registernum = ?
  `;

    try {
      const result = await pool.query(query, [
        center_name,
        center_tel,
        center_addr,
        center_email,
        registernum,
      ]);
      return result;
    } catch (error) {
      console.error("기관 정보 수정 DB 에러:", error);
      throw error;
    }
  },
};
module.exports = service;
