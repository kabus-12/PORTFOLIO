const pool = require("../db/mapper");
const { comparePassword } = require("../util/auth");

const service = {
  // 마이페이지 접속 전 본인확인 (bcrypt 비교)
  checkPassword: async (user_id, password) => {
    const query = "select user_password from member where user_id = ?";
    const rows = await pool.query(query, [user_id]);
    if (!rows || rows.length === 0) return false;
    return comparePassword(password, rows[0].user_password || "");
  },
  getUserInfo: async (user_id) => {
    if (!user_id || user_id === "null") return null; // 아이디가 없으면 즉시 종료
    const query =
      "SELECT user_id, user_name, user_email, user_tel FROM member WHERE user_id = ?";
    const rows = await pool.query(query, [user_id]);
    return rows.length > 0 ? rows[0] : null;
  },
  updateInfo: async (updateData) => {
    const { hashPassword } = require("../util/auth");
    const { user_password, user_email, user_tel, user_id } = updateData;
    const wantChangePw =
      user_password != null && String(user_password).trim() !== "";
    const hashedPw = wantChangePw ? await hashPassword(user_password) : null;

    let query, params;
    if (hashedPw) {
      query = `update member set user_password = ?, user_email = ?, user_tel = ? where user_id = ?`;
      params = [hashedPw, user_email, user_tel, user_id];
    } else {
      query = `update member set user_email = ?, user_tel = ? where user_id = ?`;
      params = [user_email, user_tel, user_id];
    }
    const result = await pool.query(query, params);
    return result.affectedRows > 0;
  },
  // 1. 일반 회원 승인 신청 목록 조회 (센터 기준)
  getPendingUsers: async (centerCode) => {
    let query = `SELECT user_id, user_name, user_email, user_reg_date, user_tel 
                 FROM member 
                 WHERE approve = 'k2'`;
    const params = [];

    if (centerCode) {
      query += " AND registernum = ?";
      params.push(centerCode);
    }

    query += " ORDER BY user_reg_date ASC";

    const rows = await pool.query(query, params);
    return rows;
  },

  // 2. 일반 회원 승인 처리 (상태 변경)
  approveUser: async (user_id) => {
    // user_status를 '1'(승인완료)로 변경
    console.log(`${user_id}`);
    const query = "UPDATE member SET approve = 'k1' WHERE user_id = ?";
    const result = await pool.query(query, [user_id]);
    return result.affectedRows > 0;
  },
};
module.exports = service;
