const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/** 비밀번호를 bcrypt로 해시 (회원가입·비밀번호 변경 시 사용) */
const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("비밀번호가 필요합니다.");
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/** 평문 비밀번호와 해시된 비밀번호 비교 (로그인·본인확인 시 사용) */
const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
};

/** 이미 bcrypt 해시인지 확인 (예: $2b$10$...) */
const isBcryptHash = (str) => {
  return typeof str === "string" && /^\$2[aby]\$\d{2}\$/.test(str);
};

module.exports = {
  hashPassword,
  comparePassword,
  isBcryptHash,
};
