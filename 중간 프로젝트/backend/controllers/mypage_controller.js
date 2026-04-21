const MypageService = require("../services/mypage_service");
const ctrl = {
  checkPassword: async (req, res) => {
    try {
      const { user_id, password } = req.body;
      const result = await MypageService.checkPassword(user_id, password);
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res
          .status(401)
          .json({ success: false, message: "비밀번호가 틀렸습니다" });
      }
    } catch (err) {
      res.status(500).json({ Error: err.message });
    }
  },
  getUserInfo: async (req, res) => {
    try {
      const { user_id } = req.query;
      // user_id가 제대로 넘어왔는지 확인 로그 추가
      console.log("요청된 user_id:", user_id);

      const userInfo = await MypageService.getUserInfo(user_id);

      if (userInfo) {
        res.status(200).json(userInfo);
      } else {
        // 데이터가 없을 때 빈 응답이 아닌 JSON 에러 메시지를 보냄
        res
          .status(404)
          .json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  updateInfo: async (req, res) => {
    try {
      const updateData = req.body;
      const result = await MypageService.updateInfo(updateData);
      res.status(200).json({ success: true, message: "수정완료" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getPendingUsers: async (req, res) => {
    try {
      const centerCode = req.query.centerCode || "";
      const users = await MypageService.getPendingUsers(centerCode);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 2. 일반 회원 승인 처리
  approveUser: async (req, res) => {
    try {
      const { user_id } = req.body;
      console.log(`con:${user_id}`);
      const result = await MypageService.approveUser(user_id);
      if (result) {
        res.status(200).json({ success: true, message: "승인 완료" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "승인 처리에 실패했습니다" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
module.exports = ctrl;
