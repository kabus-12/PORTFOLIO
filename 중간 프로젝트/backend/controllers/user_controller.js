const service = require("../services/user_service");

const checkId = async (req, res) => {
  try {
    const { user_id } = req.body;
    console.log("받은 아이디:", user_id);

    const result = await service.check(user_id);

    if (result && result.count > 0) {
      return res.status(200).json({ isDuplicate: true });
    } else {
      return res.status(200).json({ isDuplicate: false });
    }
  } catch (error) {
    console.error("CheckID Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const findId = async (req, res) => {
  try {
    const result = await service.findId(req.body);

    if (result.success) {
      return res.status(200).json({ success: true, userId: result.userId });
    } else {
      return res.status(200).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("FindId Controller Error:", error);
    return res.status(500).json({ success: false, message: "서버 내부 오류" });
  }
};

const signup = async (req, res) => {};
const login = async (req, res) => {};
const getManager = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await service.getManager(id);
    res.json({ retCode: "OK", result });
  } catch (error) {
    console.log(error);
    res.json({ retCode: "NG", error });
  }
};
module.exports = {
  signup,
  checkId,
  login,
  findId,
  getManager,
};
