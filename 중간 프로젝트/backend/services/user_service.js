const pool = require("../db/mapper");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { hashPassword, comparePassword, isBcryptHash } = require("../util/auth");

const service = {
  // 아이디 중복 확인
  check: async function (id) {
    try {
      console.log("받은 아이디:", id);
      const query = `SELECT COUNT(*) AS count FROM member WHERE user_id = ?`;
      const rows = await pool.query(query, [id]);
      console.log("DB 확인 결과:", rows[0]);
      return rows[0];
    } catch (error) {
      console.error("중복 확인 서비스 에러:", error);
      throw error;
    }
  },

  // 회원가입 (비밀번호 bcrypt 해시 후 저장)
  signUp: async function (member) {
    try {
      console.log("가입 요청 데이터 상세:", member);
      const hashedPw = await hashPassword(member.user_password || "");
      const query = `
        INSERT INTO member 
        (user_id, user_password, user_name, user_tel, user_email, registernum, grade, actived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        member.user_id || null,
        hashedPw,
        member.user_name || null,
        member.user_tel || null,
        member.user_email || null,
        member.registernum || null,
        member.grade || "a1",
        member.actived || "i1",
      ];

      const result = await pool.query(query, params);
      console.log("가입 완료! 결과:", result);
      return { success: true, result };
    } catch (error) {
      console.error("회원가입 서비스 에러 상세:", error.message);
      throw error;
    }
  },

  // 로그인 (user_id로 조회 후 bcrypt로 비밀번호 비교)
  login: async function (id, pw) {
    try {
      const query = `SELECT * FROM member WHERE user_id = ?`;
      const rows = await pool.query(query, [id]);
      if (!rows || rows.length === 0) return null;

      const user = rows[0];
      const match = await comparePassword(pw, user.user_password || "");
      if (match) return user;
      return null;
    } catch (error) {
      console.error("로그인 서비스 에러:", error);
      throw error;
    }
  },

  getManager: async function (id) {
    try {
      const query = `select * from member where grade in ("a2","a3") 
      and registernum =(select registernum from member where user_id=?) and approve="k1"`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (error) {
      console.log(error);
    }
  },

  // 아이디 찾기
  findId: async function (name, email) {
    try {
      const query = `SELECT user_id FROM member WHERE user_name = ? AND user_email = ?`;
      const rows = await pool.query(query, [name, email]);

      if (rows && rows.length > 0) {
        return rows[0].user_id;
      }
      return null;
    } catch (error) {
      console.error("아이디 찾기 서비스 에러:", error);
      throw error;
    }
  },

  requestPasswordReset: async function (userId, userEmail) {
    try {
      // 정보 일치 확인
      const checkQuery = `SELECT * FROM member WHERE user_id = ? AND user_email = ?`;
      const rows = await pool.query(checkQuery, [userId, userEmail]);

      if (!rows || rows.length === 0) {
        return { success: false, message: "일치하는 회원 정보가 없습니다." };
      }

      // 인증 번호생성
      const token = crypto.randomBytes(32).toString("hex");

      const insertCertQuery = `
        INSERT INTO certification (certnum, user_id, token) 
        VALUES (?, ?, ?)`;

      const certNum = Math.random().toString(36).substr(2, 6).toUpperCase();
      await pool.query(insertCertQuery, [certNum, userId, token]);

      // 이메일 발송 설정
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bu881843@gmail.com",
          pass: "vrunhyamzbnpqvdb",
        },
      });

      const resetLink = `http://localhost:8080/reset-password?token=${token}`;

      await transporter.sendMail({
        from: '"보안팀" <bu881843@gmail.com>',
        to: userEmail,
        subject: "비밀번호 재설정 인증 링크입니다.",
        html: `<p>아래 링크를 클릭하여 비밀번호를 재설정하세요. (5분 내 유효)</p>
               <a href="${resetLink}">${resetLink}</a>`,
      });

      return { success: true };
    } catch (error) {
      console.error("비밀번호 재설정 메일 발송 에러:", error);
      throw error;
    }
  },

  updatePasswordWithToken: async function (token, newPassword) {
    try {
      //  certification 테이블에서 유효한 토큰인지 확인
      const query = `SELECT user_id FROM certification WHERE token = ? AND \`limit\` > NOW()`;
      const rows = await pool.query(query, [token]);

      if (!rows || rows.length === 0) {
        return {
          success: false,
          message: "유효하지 않거나 만료된 링크입니다.",
        };
      }

      const userId = rows[0].user_id;
      const hashedPw = await hashPassword(newPassword);

      // member 테이블의 비밀번호 업데이트 (해시 저장)
      const updateQuery = `UPDATE member SET user_password = ? WHERE user_id = ?`;
      await pool.query(updateQuery, [hashedPw, userId]);

      // 사용된 인증 정보 삭제
      const deleteQuery = `DELETE FROM certification WHERE user_id = ?`;
      await pool.query(deleteQuery, [userId]);

      return { success: true };
    } catch (error) {
      console.error("비밀번호 업데이트 서비스 에러:", error);
      throw error;
    }
  },

  /**
   * DB에 저장된 평문 비밀번호를 모두 bcrypt 해시로 변환.
   * 이미 해시된 값($2a$, $2b$...)은 건너뛰고, 그 외는 평문으로 간주해 해시 후 업데이트.
   */
  // migratePasswordsToHash: async function () {
  //   try {
  //     const query = `SELECT user_id, user_password FROM member WHERE user_password IS NOT NULL AND user_password != ''`;
  //     const rows = await pool.query(query);
  //     let updated = 0;
  //     let skipped = 0;

  //     for (const row of rows) {
  //       const { user_id, user_password } = row;
  //       if (isBcryptHash(user_password)) {
  //         skipped += 1;
  //         continue;
  //       }
  //       const hashedPw = await hashPassword(user_password);
  //       await pool.query(
  //         `UPDATE member SET user_password = ? WHERE user_id = ?`,
  //         [hashedPw, user_id],
  //       );
  //       updated += 1;
  //     }

  //     return { success: true, updated, skipped, total: rows.length };
  //   } catch (error) {
  //     console.error("비밀번호 마이그레이션 에러:", error);
  //     throw error;
  //   }
  // },
};

module.exports = service;
