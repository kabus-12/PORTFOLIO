const router = require("express").Router();
const ctrl = require("../controllers/mypage_controller");

router.post("/check", ctrl.checkPassword);
router.get("/info", ctrl.getUserInfo);
router.put("/update", ctrl.updateInfo);
router.get("/admin/users/pending", ctrl.getPendingUsers); // 목록 불러오기
router.post("/admin/users/approve", ctrl.approveUser); // 승인하기
module.exports = router;
