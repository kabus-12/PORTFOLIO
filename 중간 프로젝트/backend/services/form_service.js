const pool = require("../db/mapper");

const service = {
  getList: async (page, limit) => {
    try {
      console.log("ser");
      // console.log(id);
      const query = `select form_ver,writedate,ifnull(begindate,"미사용") as begindate,
      if(enddate is null ,if(begindate is null,'미사용','사용중'),enddate) as enddate,
      \`comment\`,
      c.detail_name as 'usage'
      from form_version f
      join code_detail c
      on f.\`usage\`=c.detail_code
      ORDER BY CAST(REGEXP_REPLACE(form_ver, '[^0-9]', '') AS UNSIGNED) desc
      limit ? offset ? `;
      const result = await pool.query(query, [limit, (page - 1) * limit]);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  writeForm: async (form, comment) => {
    //커넥션 받아오기
    const con = await pool.getConnection();

    try {
      //트랜잭션 시작
      await con.beginTransaction();
      //버전 등록
      let query = `insert into form_version (form_ver,\`comment\`,\`usage\`) 
      values(concat('v.',NEXT VALUE FOR create_form_ver_seq),?,"h2") returning form_ver`;
      let result = await con.query(query, [comment]);
      //버전넘버 저장
      const form_ver = result[0].form_ver;
      // console.log(form_ver);
      //대분류 작업
      for (const big of form) {
        query = `insert into bigcategory (bcategory_code,form_ver,bname) 
        values(concat('bc-',next value for create_bcategory_num_seq),?,?) 
        returning bcategory_code`;
        result = await con.query(query, [form_ver, big.name]);
        const b_code = result[0].bcategory_code;
        // console.log(b_code);
        //소분류 작업
        for (const small of big.scategory) {
          query = `insert into smallcategory (scategory_code,bcategory_code,sname)
           values(concat('sc-',next value for create_scategory_num_seq),?,?) 
           returning scategory_code`;
          result = await con.query(query, [b_code, small.name]);
          const s_code = result[0].scategory_code;
          // console.log(s_code);
          //질문 작업
          for (const question of small.questions) {
            query = `insert into question (question_num,scategory_code,question,responce)
             values(concat('que-',next value for create_question_num_seq),?,?,?)
             returning question_num`;
            result = await con.query(query, [
              s_code,
              question.question,
              question.type,
            ]);
            console.log(result);
            //보기 작업
            if (question.options && question.options.length > 0) {
              const question_num = result[0].question_num;
              // console.log(question_num);
              for (let i = 0; i < question.options.length; i++) {
                query = `insert into examples (item_code,question_code,\`number\`,\`value\`)
                 values(concat('exam-',next value for create_item_code_seq),?,?,?)`;
                result = await con.query(query, [
                  question_num,
                  i + 1,
                  question.options[i],
                ]);
                console.log(result);
              }
            }
          }
        }
      }
      await con.commit();
      return form_ver;
    } catch (error) {
      con.rollback();
      console.log(error);
      throw error;
    } finally {
      con.release();
    }
  },
  usageForm: async () => {
    try {
      const query1 = `select bcategory,scategory,question,response,number,value,question_num,exam_num,form_ver from getForm
      where form_ver in (select form_ver from form_version where \`usage\`='h1')`;
      const form = await pool.query(query1);
      return form;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  getForm: async (num) => {
    try {
      let query = `select bcategory,scategory,question,response,number,value,question_num,exam_num,form_ver from getForm where form_ver=?`;
      const result = await pool.query(query, [num]);
      // console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  getInfo: async (num) => {
    try {
      console.log("ser");
      console.log(num);
      const query = `select form_ver,writedate,ifnull(begindate,"미사용") as begindate,
      if(enddate is null ,if(begindate is null,'미사용','사용중'),enddate) as enddate,
      \`comment\`,
      c.detail_name as 'usage'
      from form_version f
      join code_detail c
      on f.\`usage\`=c.detail_code
      where form_ver=?`;
      const result = await pool.query(query, [num]);
      console.log(result);
      return result[0];
    } catch (error) {
      console.log(error);
    }
  },
  changeUsage: async (ver) => {
    const con = await pool.getConnection();
    try {
      await con.beginTransaction();
      let query = `update form_version set enddate = current_date(),\`usage\`='h2' where \`usage\`='h1'`;
      await con.query(query);
      query = `update form_version set begindate= current_date,\`usage\`='h1' where form_ver=?`;
      const result = await con.query(query, [ver]);
      console.log(result);
      await con.commit();
      return result;
    } catch (error) {
      await con.rollback();
      console.log(error);
      throw error;
    } finally {
      await con.release();
    }
  },
  count: async () => {
    try {
      const query = `select count(*) as count from form_version`;
      const result = await pool.query(query);
      return result[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getVers: async () => {
    try {
      console.log("ser");
      // console.log(id);
      const query = `select form_ver from form_version`;

      const result = await pool.query(query);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  },
};
module.exports = service;
