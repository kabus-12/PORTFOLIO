// .env 파일에 정의된 환경 변수를 process.env로 불러옵니다.
require("dotenv").config();

// Express 프레임워크와 필요한 모듈들을 불러옵니다.
const express = require("express");
const pool = require("./db/mapper.js"); // DB 연결을 위한 마이바티스(또는 커스텀) 매퍼
const cors = require("cors"); // 교차 출처 리소스 공유(CORS) 허용을 위한 미들웨어
const path = require("path");
const app = express();

// 각 기능별 라우터 모듈들을 불러옵니다.
const user_route = require("./routes/user_router.js"); // 유저 관련 로직
const center_route = require("./routes/center_router.js"); // 센터 관련 로직
const doc_route = require("./routes/document_router.js"); // 문서 관련 로직
const sup_route = require("./routes/support_router.js"); // 지원/고객센터 관련 로직
const form_route = require("./routes/form_router.js"); // 양식 관련 로직
const mypage_route = require("./routes/mypage_router.js"); // 마이페이지 관련 로직

// BigInt 타입 데이터를 JSON으로 변환할 때 에러가 나지 않도록 문자열로 변환하는 설정입니다.
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// 미들웨어 설정
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 해석
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터를 해석
app.use(cors()); // 모든 도메인에서의 API 요청을 허용
app.use("/center", center_route); // /center 경로로 오는 요청은 center_route에서 처리
app.use("/user", user_route); // /user 경로로 오는 요청은 user_route에서 처리
app.use("/document", doc_route); // /document 경로 처리
app.use("/form", form_route); // /form 경로 처리
app.use("/support", sup_route); // /support 경로 처리
app.use("/mypage", mypage_route); // /mypage 경로 처리
// 각 경로(Path)별로 라우터를 연결합니다.
app.use("/api/center", center_route); // /center 경로로 오는 요청은 center_route에서 처리
app.use("/api/user", user_route); // /user 경로로 오는 요청은 user_route에서 처리
app.use("/api/document", doc_route); // /document 경로 처리
app.use("/api/form", form_route); // /form 경로 처리
app.use("/api/support", sup_route); // /support 경로 처리
app.use("/api/mypage", mypage_route); // /mypage 경로 처리

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

// 서버를 3000번 포트에서 실행합니다.
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
