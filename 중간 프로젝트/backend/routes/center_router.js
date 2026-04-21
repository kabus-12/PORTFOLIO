const router = require("express").Router();
const ctrl = require("../controllers/center_controller.js");
console.log("route");
router.get("/list", ctrl.getList);
router.post("/addCenter", ctrl.addCenter);
router.put("/update", ctrl.updateCenter);

module.exports = router;
