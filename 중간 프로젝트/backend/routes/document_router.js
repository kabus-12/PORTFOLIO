const router = require("express").Router();
const ctrl = require("../controllers/document_controller");

router.get("/list", ctrl.getList);
router.get("/getDoc/:num", ctrl.getDoc);

router.post("/write", ctrl.writeDoc); //신청서 작성
router.get("/getForm/:num", ctrl.getForm); //신청서 양식 받아오기
router.delete("/delDoc/:num", ctrl.delDoc); //문서삭제
router.get("/getResp/:num", ctrl.getResp); //응답받아오기
router.get("/manager/:num", ctrl.getManager);
router.patch("/manager/:doc_num/:manager_id", ctrl.handleManager); //담당자 변경하기
router.get("/pri/:id", ctrl.pri); //우선순위 승인여부 확인
router.post("/priority", ctrl.prioritySetting); //우선순위 신청
router.get("/priority/:id", ctrl.priorityApp); //우선순위 신청 데이터 당겨오기
router.post("/priority_manager", ctrl.appPriority); //우선순위 승인
router.post("/returnPriority_manager", ctrl.returnPriority); //우선순위 반려
router.post("/record", ctrl.addrecord); //상담기록 추가
router.get("/recordlist/:id", ctrl.recordList); //상담기록 출력
router.get("/modifyRecordlist/:id", ctrl.modifyRecordList); //상담기록 수정내역 출력
router.post("/saverecord", ctrl.saveRecord); //상담기록 임시저장
router.post("/bringrecord", ctrl.saveRecordBring); //상담기록 임시저장 불러오기
router.post("/Updaterecord", ctrl.UpdateRecord); //상담기록 수정
router.post("/plan", ctrl.addplan); //지원계획서 추가
router.get("/planlist/:id", ctrl.planList); //지원계획서 출력
router.post("/updateplan", ctrl.updatePlan); //지원계획서 수정
router.post("/saveplan", ctrl.savePlan); //지원계획서 임시저장
router.post("/bringplan", ctrl.savePlanBring); //지원계획서 임시저장 불러오기
router.post("/appplan", ctrl.appPlan); //지원계획서 승인(관리자)
router.post("/returnplan", ctrl.returnPlan); //지원계획서 반려(관리자)
router.post("/restartplan", ctrl.restartPlan); //지원계획서 재승인
router.get("/resultlist/:id", ctrl.resultList); //지원결과서 출력
router.post("/result", ctrl.addResult); //지원결과서 추가
router.post("/updateresult", ctrl.updateresult); //지원결과서 수정
router.post("/saveresult", ctrl.saveResult); //지원결과서 임시저장
router.post("/bringresult", ctrl.saveResultBring); //지원결과서 임시저장 불러오기
router.post("/deleterecord", ctrl.deleteRecord); //상담기록 삭제
router.get("/priReqList/:num", ctrl.priReqList);
router.get("/planReqList/:num", ctrl.planReqList);
router.post("/deleteplan", ctrl.deletePlan); //지원기획서 삭제
router.post("/deleteresult", ctrl.deleteResult); //지원결과서 삭제
router.get("/modifyResultlist/:id", ctrl.modifyResultList); //지원결과서 수정내역 출력
router.get("/modifyPlanlist/:id", ctrl.modifyPlanList); //지원기획서 수정내역 출력
router.get("/recordFile", ctrl.recordFile); //상담기록 파일
router.get("/planFile", ctrl.planFile); //상담기록 파일
router.get("/resultFile", ctrl.resultFile); //상담기록 파일
router.post("/cancelplan", ctrl.cancelPlan); //지원계획서 재승인

module.exports = router;
