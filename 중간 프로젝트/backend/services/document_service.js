const pool = require("../db/mapper");

const service = {
  //목록받아오기
  getList: async (info, searchFilters) => {
    try {
      let query = `select doc_num,sup_name,writer_name,write_date,manager_name,progress,writer_id,form_ver from getDocumentList `;
      const conditions = [];
      const values = [];
      if (info.grade == "a1") {
        conditions.push("writer_id = ?");
        values.push(info.id);
      }
      if (info.grade == "a2" || info.grade == "a3") {
        conditions.push("registernum = ?");
        values.push(info.centerCode);
      }

      for (const key in searchFilters) {
        if (!searchFilters[key]) continue;

        conditions.push(`${key} = ?`);
        values.push(searchFilters[key]);
      }
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      query += `ORDER BY CAST(SUBSTRING_INDEX(doc_num, '-', -1) AS UNSIGNED) DESC`;
      const result = await pool.query(query, values);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  //작성
  writeDoc: async (form_ver, sup_num, user_id, response) => {
    // console.log(form_ver);
    // console.log(sup_num);
    // console.log(user_id);
    // console.log(response);

    const con = await pool.getConnection();
    try {
      //중간에 에러나면 다 돌리기 위해 트랜잭션으로 진행
      await con.beginTransaction();
      //신청서 작성하고, 작성된 신청서 번호 받아오기
      let query = `insert into documents (doc_num,form_ver,sup_num,user_id) values
      (concat("doc-",NEXT VALUE FOR create_doc_num_seq),?,?,?) RETURNING doc_num`;
      let result = await con.query(query, [form_ver, sup_num, user_id]);
      let wrtiedDoc = result[0].doc_num;
      // console.log(wrtiedDoc);
      //응답 버전 기록하고, 버전넘버 받아오기
      query =
        'insert into doc_version(doc_ver,doc_num,modified_by,`comment`) values(?,?,?,"최초 설문 응답 제출") RETURNING doc_ver';
      result = await con.query(query, [wrtiedDoc + "-1", wrtiedDoc, user_id]);
      // console.log(result);
      let doc_ver = result[0].doc_ver;
      for (const question_num in response) {
        let column_name = "";
        //응답방식에 따라 들어가는 칼럼명이 다름
        if (response[question_num].type == "자유응답형") {
          column_name = "answer_text";
        } else {
          column_name = "select_answer";
        }
        //칼럼명은 ? 사용불가
        query = `insert into responce (responce_num,doc_ver,question_num,${column_name})
        values(concat("resp-",NEXT VALUE FOR create_responce_num_seq),?,?,?)`;
        await con.query(query, [
          doc_ver,
          question_num,
          response[question_num].response,
        ]);
      }
      // await con.rollback();
      await con.commit();
      return { success: true };
    } catch (error) {
      console.log(error);
      return error;
    } finally {
      con.release();
    }
  },
  //문서 삭제
  delDoc: async (num) => {
    const con = await pool.getConnection();
    try {
      await con.beginTransaction();
      let query = `delete from responce where doc_ver LIKE CONCAT(?, '-%') `;
      await con.query(query, [num]);
      query = `delete from doc_version where doc_num =? `;
      await con.query(query, [num]);
      query = `delete from documents where doc_num = ?;`;
      await con.query(query, [num]);
      await con.commit();
    } catch (error) {
      await con.rollback();
      console.log(error);
      throw error;
    } finally {
      await con.release();
    }
  },
  //정보 받아오기
  getDoc: async (num) => {
    try {
      let query = `select doc_num,sup_name,writer_name,write_date,manager_name,progress,form_ver,writer_id,gender,birthday from getDocumentList where doc_num=?`;
      const result = await pool.query(query, [num]);
      // console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  //양식받아오기
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
  //응답받아오기
  getResp: async (num) => {
    try {
      const query = `select responce_num,doc_ver,question_num,select_answer,answer_text from responce 
      where doc_ver = (select doc_ver from recent_doc_ver where doc_num=? )`;
      const result = await pool.query(query, [num]);
      // console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  //담당자변경
  handleManager: async (doc_num, manager_id) => {
    const con = await pool.getConnection();
    try {
      await con.beginTransaction();
      const query = `update documents set manager = ? , priority=if(priority="c1","c2",priority) where doc_num=?`;
      const result = await con.query(query, [manager_id, doc_num]);
      await con.query(
        `UPDATE documents SET progress = 'b2' WHERE doc_num = ? and progress='b1'`,
        [doc_num],
      );
      await con.commit();
      return result;
    } catch (error) {
      console.log(error);
      await con.rollback();
      throw error;
    } finally {
      await con.release();
    }
  },
  pri: async (id) => {
    try {
      const query = `select doc_num,priority_approved from priority_req where doc_num=?`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //우선순위 셋팅
  prioritySetting: async (id) => {
    try {
      const query = `insert into priority_req ( priority_req_num, doc_num, priority_reason, priority, priority_app_manager, priority_approved) values (concat("prireq-",NEXT VALUE FOR create_pri_req_num_seq),?,?,?,?,?) `;
      const result = await pool.query(query, [
        id.doc_num,
        id.priority_reason,
        id.priority,
        id.priority_app_manager,
        id.priority_approved,
      ]);
      return result[0];
    } catch (error) {
      console.log(error);
      return;
    }
  },
  //우선순위 승인
  priorityApp: async (id) => {
    try {
      const query = `SELECT p.priority_req_num, p.doc_num, p.priority_reason, p.priority, p.priority_approved,d.sup_num
                    FROM priority_req p
                    JOIN documents d ON p.doc_num = d.doc_num
                    WHERE p.doc_num = ?`;
      const result = await pool.query(query, [id]);
      return result[0];
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    }
  },
  //우선순위 승인
  appPriority: async (id) => {
    const conn = await pool.getConnection();
    console.log(id);
    try {
      await conn.beginTransaction();
      await conn.query(
        `update documents set priority=? ,progress="b3" where doc_num = ? `,
        [id.priority, id.doc_num],
      );
      await conn.query(
        `update priority_req set priority_approved="d2" where priority_req_num = ?`,
        [id.priority_req_num],
      );
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //우선순위 반려
  returnPriority: async (id) => {
    try {
      const query = `update priority_req set priority_return_reason=?,priority_approved=? where priority_req_num = ?`;
      const result = await pool.query(query, [
        id.priority_return_reason,
        id.priority_approved,
        id.priority_req_num,
      ]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //상담기록 추가
  addrecord: async (id) => {
    try {
      const query = `insert into counsels (counsel_num, doc_num, counsel_title, counsel_content, counsel_manager)
                    values (concat("coun-",NEXT VALUE FOR create_counsel_num_seq),?,?,?,?);`;
      const result = await pool.query(query, [
        id.doc_num,
        id.counsel_title,
        id.counsel_content,
        id.counsel_manager,
      ]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //상담내역 목록
  recordList: async (id) => {
    try {
      const query = `SELECT ROW_NUMBER() OVER(ORDER BY CAST(SUBSTRING_INDEX(counsel_num, '-', -1) AS UNSIGNED) ASC) AS row_num, counsel_num, doc_num, counsel_date, counsel_title, counsel_content, counsel_manager 
                    FROM counsels where doc_num=? ORDER BY CAST(SUBSTRING_INDEX(counsel_num, '-', -1) AS UNSIGNED) DESC`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //상담내역 수정내역
  modifyRecordList: async (id) => {
    try {
      const query = `select counsel_modifi_num,counsel_num,counsel_modified_by,counsel_modified_date,counsel_modified_comment,counsel_modified_title,counsel_modified_content
                    from counsel_modifi where counsel_num = ?`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //상담내역 등록
  saveRecord: async (id) => {
    try {
      const query = `insert into counsel_draft (counsel_num,doc_num,counsel_title,counsel_content,counsel_dissavedate)
                    values(?,?,?,?,DATE_ADD(CURDATE(), INTERVAL 30 DAY));`;
      const result = await pool.query(query, [
        id.counsel_num,
        id.doc_num,
        id.counsel_title,
        id.counsel_content,
      ]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //상담내역 임시저장 불러오기
  saveRecordBring: async () => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query(
        `select counsel_num, counsel_title,counsel_content from counsel_draft`,
      );

      await conn.query(`delete from counsel_draft where counsel_num=?`, [
        "coun-9999999",
      ]);

      await conn.commit();
      return [rows];
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //상담내역 수정
  UpdateRecord: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `update counsels set counsel_title=?,counsel_content=? where counsel_num=?`,
        [id.counsel_title, id.counsel_content, id.counsel_num],
      );

      await conn.query(
        `insert into counsel_modifi (counsel_modifi_num, counsel_num, counsel_modified_by, counsel_modified_comment, counsel_modified_title, counsel_modified_content)
                        values (concat("coucoun-",NEXT VALUE FOR create_res_file_num_seq),?,?,?,?,?)`,
        [
          id.counsel_num,
          id.counsel_modified_by,
          id.counsel_modified_comment,
          id.counsel_modified_title,
          id.counsel_modified_content,
        ],
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //지원계획 추가하기
  addplan: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const seqResult = await conn.query(
        `SELECT NEXT VALUE FOR create_plan_num_seq AS seq`,
      );

      const seq = seqResult[0].seq;
      const planNum = `plan-${seq}`;
      const planReqNum = `planreq-${seq}`;
      await conn.query(
        `insert into plans(plan_num,doc_num,plan_manager,plan_title,plan_content)
                    values(?,?,?,?,?)`,
        [planNum, id.doc_num, id.plan_manager, id.plan_title, id.plan_content],
      );

      await conn.query(
        `insert into plan_req (plan_req_num,plan_num,plan_manager,plan_approved,plan_title,plan_content)
                    values (?,?,?,?,?,?)`,
        [
          planReqNum,
          planNum,
          id.plan_manager,
          id.plan_approved,
          id.plan_title,
          id.plan_content,
        ],
      );
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //계획 목록 조회
  planList: async (id) => {
    try {
      const query = `select ROW_NUMBER() OVER(ORDER BY CAST(SUBSTRING_INDEX(p.plan_num, '-', -1) AS UNSIGNED) ASC) AS row_num ,p.plan_num,p.doc_num,p.plan_date,p.plan_manager,p.plan_title,p.plan_content,r.plan_approved,r.plan_return_reason
                    from plans p join plan_req r on p.plan_num = r.plan_num where p.doc_num = ? ORDER BY CAST(SUBSTRING_INDEX(p.plan_num, '-', -1) AS UNSIGNED) DESC`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //계획 수정
  updatePlan: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `update plans set plan_title=?,plan_content=? where plan_num=?`,
        [id.plan_title, id.plan_content, id.plan_num],
      );

      await conn.query(
        `insert into plan_modifi (plan_modifi_num, plan_num, plan_modified_by, plan_modified_comment, plan_modified_title, plan_modified_content)
                        values (concat("couplan-",NEXT VALUE FOR create_res_file_num_seq),?,?,?,?,?)`,
        [
          id.plan_num,
          id.plan_modified_by,
          id.plan_modified_comment,
          id.plan_modified_title,
          id.plan_modified_content,
        ],
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //계획 등록
  savePlan: async (id) => {
    try {
      const query = `insert into plan_draft (plan_num,doc_num,plan_title,plan_content,plan_dissavedate)
                    values(?,?,?,?,DATE_ADD(CURDATE(), INTERVAL 30 DAY));`;
      const result = await pool.query(query, [
        id.plan_num,
        id.doc_num,
        id.plan_title,
        id.plan_content,
      ]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //계획 임시저장 불러오기
  savePlanBring: async () => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query(
        `select plan_num, plan_title,plan_content from plan_draft`,
      );

      await conn.query(`delete from plan_draft where plan_num=?`, [
        "plan-9999999",
      ]);

      await conn.commit();
      return [rows];
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //계획 승인하기
  appPlan: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `update documents set progress="b4" where doc_num = ?; `,
        [id.doc_num],
      );
      await conn.query(
        `update plan_req set plan_approved="d2",plan_appdate=current_date where plan_num=?`,
        [id.plan_num],
      );
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //계획 반려
  returnPlan: async (id) => {
    try {
      const query = `update plan_req set plan_approved="d3",plan_return_reason=? where plan_num=?`;
      const result = await pool.query(query, [
        id.plan_return_reason,
        id.plan_num,
      ]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //계획 승인요청
  restartPlan: async (id) => {
    try {
      const query = `update plan_req set plan_approved="d1" where plan_num=?`;
      const result = await pool.query(query, [id.plan_num]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //지원결과 목록
  resultList: async (id) => {
    try {
      const query = `SELECT ROW_NUMBER() OVER(ORDER BY CAST(SUBSTRING_INDEX(result_num, '-', -1) AS UNSIGNED) ASC) AS row_num, result_num, doc_num, result_manager, result_title, result_contnet, result_date 
                      FROM results where doc_num=? ORDER BY CAST(SUBSTRING_INDEX(result_num, '-', -1) AS UNSIGNED) DESC;`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //지원결과 추가
  addResult: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `update documents set progress="b5" where doc_num = ?; `,
        [id.doc_num],
      );
      await conn.query(
        `insert into results (result_num,doc_num,result_manager,result_title,result_contnet)
                    values (concat("result-",NEXT VALUE FOR create_result_num_seq),?,?,?,?)`,
        [id.doc_num, id.result_manager, id.result_title, id.result_contnet],
      );
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //지원결과 수정
  updateresult: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `update results set result_title=?,result_contnet=? where result_num=?`,
        [id.result_title, id.result_contnet, id.result_num],
      );

      await conn.query(
        `insert into result_modifi (result_modifi_num, result_num, result_modified_by, result_modified_comment, result_modified_title, result_modified_content)
                        values (concat("resresult-",NEXT VALUE FOR create_res_file_num_seq),?,?,?,?,?)`,
        [
          id.result_num,
          id.result_modified_by,
          id.result_modified_comment,
          id.result_modified_title,
          id.result_modified_content,
        ],
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //지원결과 임시저장
  saveResult: async (id) => {
    try {
      const query = `insert into result_draft (result_num,doc_num,result_title,result_content,result_dissavedate)
                    values(?,?,?,?,DATE_ADD(CURDATE(), INTERVAL 30 DAY));`;
      const result = await pool.query(query, [
        id.result_num,
        id.doc_num,
        id.result_title,
        id.result_content,
      ]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //지원결과 임시저장 불러오기
  saveResultBring: async () => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query(
        `select result_num, result_title,result_content from result_draft`,
      );

      await conn.query(`delete from result_draft where result_num=?`, [
        "result-9999999",
      ]);

      await conn.commit();
      return [rows];
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //상담 삭제
  deleteRecord: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`delete from counsel_modifi where counsel_num = ?`, [
        id.counsel_num,
      ]);

      await conn.query(`  delete from counsels where counsel_num = ?`, [
        id.counsel_num,
      ]);

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //지원계획 삭제
  deletePlan: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`delete from plan_modifi where plan_num = ?`, [
        id.plan_num,
      ]);

      await conn.query(`delete from plans where plan_num = ?`, [id.plan_num]);

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //지원결과 삭제
  deleteResult: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`delete from result_modifi where result_num = ?`, [
        id.result_num,
      ]);

      await conn.query(`delete from results where result_num=?`, [
        id.result_num,
      ]);

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.log(err);
      return;
    } finally {
      conn.release();
    }
  },
  //지원결과 수정내역
  modifyResultList: async (id) => {
    try {
      const query = `select result_modifi_num,result_num,result_modified_by,result_modified_date,result_modified_comment,result_modified_title,result_modified_content
                    from result_modifi where result_num = ?`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //지원계획 수정내역
  modifyPlanList: async (id) => {
    try {
      const query = `select plan_modifi_num, plan_num, plan_modified_by, plan_modified_date, plan_modified_comment, plan_modified_title,plan_modified_content
                    from plan_modifi where plan_num = ?`;
      const result = await pool.query(query, [id]);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //우선순위 승인 목록
  priReqList: async (center_num, filters = {}) => {
    try {
      let query = `SELECT 
          pr.priority_req_num,
          d.doc_num,
          -- 지원자 정보 (supported)
          s.sup_name AS sup_name,
          -- 보호자 정보 (member - 일반 사용자)
          m.user_name AS writer_name,
          -- 담당자 정보 (member - 관리자)
          mgr.user_name AS manager_name,
          d.write_date,
          c.detail_name AS progress
      FROM 
          priority_req pr
      JOIN 
          documents d ON pr.doc_num = d.doc_num
      JOIN 
          supported s ON d.sup_num = s.sup_num
      JOIN 
          member m ON d.user_id = m.user_id
      LEFT JOIN 
          member mgr ON d.manager = mgr.user_id  -- 담당자가 지정되지 않았을 수도 있으므로 LEFT JOIN 권장
      JOIN 
          code_detail c ON c.detail_code = d.progress 
      where pr.priority_approved = "d1"
      and m.registernum =?`;

      const params = [center_num];
      if (filters.sup) {
        query += ` AND s.sup_name LIKE ?`;
        params.push(`%${filters.sup}%`);
      }
      if (filters.writer) {
        query += ` AND m.user_name LIKE ?`;
        params.push(`%${filters.writer}%`);
      }
      if (filters.maneger) {
        // 담당자 이름 검색 시, NULL은 제외하고 이름이 매칭되는 것만
        query += ` AND mgr.user_name LIKE ?`;
        params.push(`%${filters.maneger}%`);
      }

      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  //계획 승인 목록
  planReqList: async (center_num, filters = {}) => {
    try {
      let query = `SELECT 
          pr.plan_req_num,
          d.doc_num,
          -- 지원자 정보 (supported)
          s.sup_name AS sup_name,
          -- 보호자 정보 (member - 일반 사용자)
          m.user_name AS writer_name,
          -- 담당자 정보 (member - 관리자)
          mgr.user_name AS manager_name,
          d.write_date,
          c.detail_name AS progress
      FROM 
          plan_req pr
      JOIN 
          plans p ON pr.plan_num = p.plan_num
      JOIN 
          documents d ON p.doc_num = d.doc_num
      JOIN 
          supported s ON d.sup_num = s.sup_num
      JOIN 
          member m ON d.user_id = m.user_id
      LEFT JOIN 
          member mgr ON d.manager = mgr.user_id
      JOIN 
          code_detail c ON c.detail_code = d.progress 
      WHERE 
          m.registernum =? 
      and 
          plan_approved ='d1'`;

      const params = [center_num];
      if (filters.sup) {
        query += ` AND s.sup_name LIKE ?`;
        params.push(`%${filters.sup}%`);
      }
      if (filters.writer) {
        query += ` AND m.user_name LIKE ?`;
        params.push(`%${filters.writer}%`);
      }
      if (filters.maneger) {
        query += ` AND mgr.user_name LIKE ?`;
        params.push(`%${filters.maneger}%`);
      }

      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  //매니저 불러오기
  getManager: async (doc_num) => {
    const query = `select manager from documents where doc_num=?`;
    const result = await pool.query(query, [doc_num]);
    return result[0];
  },
  //상담내역 첨부파일 조회
  recordFile: async () => {
    try {
      const query = `select file_num, counsel_num, path, origin_name, filetype, upload_date,file_byte
                    from counsel_file`;
      const result = await pool.query(query);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //계획 첨부파일 조회
  planFile: async () => {
    try {
      const query = `select file_num, plan_num, path, origin_name, filetype, upload_date,file_byte
                    from plan_file`;
      const result = await pool.query(query);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  //결과 첨부파일 조회
  resultFile: async () => {
    try {
      const query = `select file_num, result_num, path, origin_name, filetype, upload_date,file_byte
                    from result_file`;
      const result = await pool.query(query);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  },
  cancelPlan: async (id) => {
    try {
      const query = `update plan_req set plan_approved="d4" where plan_num=?`;
      const result = await pool.query(query, [id.plan_num]);
      return result[0];
    } catch (err) {
      console.log(err);
      return;
    }
  },
};
module.exports = service;
