const service = require("../services/center_service");
const ctrl = {
  // 기존 목록
  getList: async function (req, res) {
    try {
      const result = await service.getList(req.query);
      // console.log(result);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },

  addCenter: async function (req, res) {
    try {
      const data = req.body;
      console.log("등록요청 데이터", data);
      const result = await service.addCenter(data);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  updateCenter: async (req, res) => {
    try {
      const centerData = req.body;
      const result = await service.updateCenter(centerData);

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "수정 성공" });
      } else {
        res.status(404).json({ error: "기관을 찾을 수 없습니다." });
      }
    } catch (err) {
      res.status(500).json({ error: "서버 오류" });
    }
  },
};
module.exports = ctrl;
