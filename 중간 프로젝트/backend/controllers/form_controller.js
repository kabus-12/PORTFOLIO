const service = require("../services/form_service");
//db에서 받아온 정보를 계층형으로 정리
const reducing = (array) => {
  return array.reduce((acc, row) => {
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
        exam_num: row.exam_num,
      });
    }

    return acc;
  }, []);
};

const ctrl = {
  getList: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);
      const result = await service.getList(page, limit);
      console.log("contr");
      console.log(result);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  getForm: async (req, res) => {
    const num = req.params.num;
    // console.log(num);
    try {
      const result = await service.getForm(num);
      // console.log("contr");
      // console.log(result);
      const retVal = reducing(result);
      res.json({ retCode: "OK", form: retVal });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG" });
    }
  },
  writeForm: async (req, res) => {
    try {
      const form = req.body.form;
      const comment = req.body.comment;
      console.log("con");
      console.log(req.body);
      // console.log(form);
      console.log(comment);
      const result = await service.writeForm(form, comment);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  usageForm: async (req, res) => {
    try {
      const result = await service.usageForm();
      // console.log(result);
      const retVal = reducing(result);

      res.json({ retCode: "OK", ver: result[0].form_ver, form: retVal });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  getInfo: async (req, res) => {
    try {
      console.log(req.params.num);
      const num = req.params.num;
      const result = await service.getInfo(num);
      res.json({ retCode: "OK", info: result });
    } catch (error) {}
  },
  changeUsage: async (req, res) => {
    try {
      console.log(req.params.ver);
      const ver = req.params.ver;
      const result = await service.changeUsage(ver);
      res.json({ retCode: "OK" });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  count: async (req, res) => {
    try {
      const result = await service.count();
      console.log(result);
      res.json({ retCode: "OK", count: result.count });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
  getVers: async (req, res) => {
    try {
      const result = await service.getVers();
      console.log(result);
      res.json({ retCode: "OK", result });
    } catch (error) {
      console.log(error);
      res.json({ retCode: "NG", error });
    }
  },
};
module.exports = ctrl;
