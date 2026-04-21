const service = require("../services/document_service");
const ctrl = {
  getList: async (req, res) => {
    console.log(req.query);
    const info = {
      id: req.query.id ? req.query.id : "",
      centerCode: req.query.centerCode ? req.query.centerCode : "",
      grade: req.query.grade ? req.query.grade : "",
    };
    const filter = {
      writer_name: req.query.writer ? req.query.writer : "",
      maneger_name: req.query.maneger ? req.query.maneger : "",
      sup_name: req.query.sup ? req.query.sup : "",
    };
    try {
      const result = await service.getList(info, filter);
      console.log("contr");
      console.log(result);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  getForm: async (req, res) => {
    try {
      const { ver, form } = await service.getForm();

      const result = form.reduce((acc, row) => {
        // 1. 대분류(Big Category) 처리
        let big = acc.find((b) => b.bcategory === row.bcategory);
        if (!big) {
          big = {
            bcategory: row.bcategory,
            scategory: [],
          };
          acc.push(big);
        }

        // 2. 소분류(Small Category) 처리
        let small = big.scategory.find((s) => s.scategory === row.scategory);
        if (!small) {
          small = {
            scategory: row.scategory,
            questions: [],
          };
          big.scategory.push(small);
        }

        // 3. 질문(Question) 처리
        let question = small.questions.find(
          (q) => q.question_num === row.question_num,
        );
        if (!question) {
          question = {
            question_num: row.question_num,
            question: row.question,
            response: row.response,
            options: [],
          };
          small.questions.push(question);
        }

        // 4. 보기(Options) 처리 (객관식일 경우에만)
        if (row.number) {
          question.options.push({
            number: row.number,
            value: row.value,
          });
        }

        return acc;
      }, []);

      res.json({ retCode: "OK", ver: ver.form_ver, form: result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  delDoc: async (req, res) => {
    try {
      const num = req.params.num;
      const result = await service.delDoc(num);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  writeDoc: async (req, res) => {
    try {
      const form_ver = req.body.formVer;
      const sup_num = req.body.sup_num;
      const response = req.body.response;
      const user_id = req.body.user_id;
      // console.log(req.body);
      const result = await service.writeDoc(
        form_ver,
        sup_num,
        user_id,
        response,
      );
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  pri: async (req, res) => {
    const priority = req.params.id;
    try {
      const result = await service.pri(priority);
      console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  prioritySetting: async (req, res) => {
    const priority = req.body;
    try {
      const result = await service.prioritySetting(priority);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  priorityApp: async (req, res) => {
    const priority = req.params.id;
    try {
      const result = await service.priorityApp(priority);
      console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  appPriority: async (req, res) => {
    const priority = req.body;
    try {
      const result = await service.appPriority(priority);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  returnPriority: async (req, res) => {
    const returnPri = req.body;
    try {
      const result = await service.returnPriority(returnPri);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  addrecord: async (req, res) => {
    const add = req.body;
    try {
      const result = await service.addrecord(add);
      // console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  recordList: async (req, res) => {
    const list = req.params.id;
    try {
      const result = await service.recordList(list);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  modifyRecordList: async (req, res) => {
    const list = req.params.id;
    try {
      const result = await service.modifyRecordList(list);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  saveRecord: async (req, res) => {
    const save = req.body;
    try {
      const result = await service.saveRecord(save);
      // console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  saveRecordBring: async (req, res) => {
    const bring = req.body;
    try {
      const result = await service.saveRecordBring(bring);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  UpdateRecord: async (req, res) => {
    const update = req.body;
    try {
      const result = await service.UpdateRecord(update);
      // console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  addplan: async (req, res) => {
    const add = req.body;
    try {
      const result = await service.addplan(add);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  getDoc: async (req, res) => {
    const num = req.params.num;
    // console.log(num);
    try {
      const result = await service.getDoc(num);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  planList: async (req, res) => {
    const list = req.params.id;
    try {
      const result = await service.planList(list);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  updatePlan: async (req, res) => {
    const update = req.body;
    try {
      const result = await service.updatePlan(update);
      // console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  savePlan: async (req, res) => {
    const save = req.body;
    try {
      const result = await service.savePlan(save);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  savePlanBring: async (req, res) => {
    const bring = req.body;
    try {
      const result = await service.savePlanBring(bring);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  appPlan: async (req, res) => {
    const app = req.body;
    try {
      const result = await service.appPlan(app);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  returnPlan: async (req, res) => {
    const returnplan = req.body;
    try {
      const result = await service.returnPlan(returnplan);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  restartPlan: async (req, res) => {
    const restartplan = req.body;
    try {
      const result = await service.restartPlan(restartplan);
      console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  getResp: async (req, res) => {
    const num = req.params.num;
    console.log(num);
    try {
      const result = await service.getResp(num);
      const retVal = {};
      for (const row of result) {
        retVal[row.question_num] = row.select_answer
          ? row.select_answer
          : row.answer_text;
      }
      res.json({ retCode: "OK", response: retVal });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  resultList: async (req, res) => {
    const list = req.params.id;
    try {
      const result = await service.resultList(list);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  handleManager: async (req, res) => {
    try {
      const managerId = req.params.manager_id;
      const doc_num = req.params.doc_num;
      console.log(doc_num, managerId);
      const result = await service.handleManager(doc_num, managerId);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  addResult: async (req, res) => {
    const add = req.body;
    try {
      const result = await service.addResult(add);
      // console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  updateresult: async (req, res) => {
    const update = req.body;
    // console.log(req.body);
    try {
      const result = await service.updateresult(update);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  saveResult: async (req, res) => {
    const save = req.body;
    try {
      const result = await service.saveResult(save);
      console.log(result);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  saveResultBring: async (req, res) => {
    const bring = req.body;
    try {
      const result = await service.saveResultBring(bring);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  deleteRecord: async (req, res) => {
    const del = req.body;
    try {
      const result = await service.deleteRecord(del);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  priReqList: async (req, res) => {
    try {
      const center_num = req.params.num;
      const filters = {
        sup: req.query.sup || "",
        writer: req.query.writer || "",
        maneger: req.query.maneger || "",
      };
      const result = await service.priReqList(center_num, filters);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  planReqList: async (req, res) => {
    try {
      const center_num = req.params.num;
      const filters = {
        sup: req.query.sup || "",
        writer: req.query.writer || "",
        maneger: req.query.maneger || "",
      };
      const result = await service.planReqList(center_num, filters);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  deletePlan: async (req, res) => {
    const del = req.body;
    try {
      const result = await service.deletePlan(del);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  deleteResult: async (req, res) => {
    const del = req.body;
    try {
      const result = await service.deleteResult(del);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  modifyResultList: async (req, res) => {
    const list = req.params.id;
    try {
      const result = await service.modifyResultList(list);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  modifyPlanList: async (req, res) => {
    const list = req.params.id;
    try {
      const result = await service.modifyPlanList(list);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  getManager: async (req, res) => {
    try {
      const doc_num = req.params.num;
      const result = await service.getManager(doc_num);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  recordFile: async (req, res) => {
    const filename = req.params.id;
    try {
      const result = await service.recordFile(filename);
      // console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  planFile: async (req, res) => {
    const filename = req.params.id;
    try {
      const result = await service.planFile(filename);
      console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  resultFile: async (req, res) => {
    const filename = req.params.id;
    try {
      const result = await service.resultFile(filename);
      console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  cancelPlan: async (req, res) => {
    const cancelplan = req.body;
    try {
      const result = await service.cancelPlan(cancelplan);
      console.log(result);
      res.json({ result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
};
module.exports = ctrl;
