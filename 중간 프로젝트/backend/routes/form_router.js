const router = require("express").Router();
const ctrl = require("../controllers/form_controller");

router.get("/list", ctrl.getList);
router.post("/write", ctrl.writeForm);
router.get("/usageForm", ctrl.usageForm);
router.get("/getForm/:num", ctrl.getForm);
router.get("/getInfo/:num", ctrl.getInfo);
router.patch("/usage/:ver", ctrl.changeUsage);
router.get("/count", ctrl.count);
router.get("/vers", ctrl.getVers);
module.exports = router;
