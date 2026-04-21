<script setup>
import MaterialButton from "@/components/MaterialButton.vue";
import { ref, onBeforeMount } from "vue";
import Modal from "./modal.vue";
import MaterialInput from "@/components/MaterialInput.vue";
import MaterialTextarea from "@/components/MaterialTextarea.vue";
import axios from "axios";
import { useMemberStore } from "@/store/member";
import { useDocStore } from "../../store/doc";

const memberStore = useMemberStore();
const docStore = useDocStore();

const Plans = ref([]);
const listPlan = async () => {
  let doc = docStore.doc_num;
  let result = await axios
    .get(`/api/document/planlist/${doc}`)
    .catch((err) => console.log(err));
  Plans.value = (result.data.result || []).map((r) => ({
    ...r,
    file: r.file || [],
    showPlanDelete: false,
    modifyPlan: false,
    showRevision: false,
    returnPlan: false,
    revision: [],
  }));
  // console.log(result.data.result);
};
onBeforeMount(() => {
  listPlan();
  filelist();
});

//지원계획 추가
const addPlanName = ref(""); //목표
const addPlanContent = ref(""); //내용
const addPlan = async () => {
  console.log(addPlanName.value, addPlanContent.value);
  if (!addPlanName.value) {
    alert("제목을 입력해주세요");
    return;
  } else if (!addPlanContent.value) {
    alert("내용을 입력해주세요");
    return;
  }

  let add = {
    doc_num: docStore.doc_num,
    plan_manager: memberStore.id,
    plan_approved: "d1",
    plan_title: addPlanName.value,
    plan_content: addPlanContent.value,
  };

  const result = ref(null);
  try {
    const res = await axios.post("/api/document/plan", add);
    console.log(res.data);
    result.value = res.data;
    addPlanName.value = "";
    addPlanContent.value = "";
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
  newPlan.value = false;
};
//임시저장
const draft = async () => {
  let savedate = {
    plan_num: "plan-9999999",
    doc_num: docStore.doc_num,
    plan_title: addPlanName.value,
    plan_content: addPlanContent.value,
  };
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/saveplan",
      savedate,
    );
    console.log(res.data);
    result.value = res.data;
    addPlanName.value = "";
    addPlanContent.value = "";
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//임시저장 불러오기
const sevedate = async () => {
  let result = await axios
    .post(`/api/document/bringplan`)
    .catch((err) => console.log(err));

  const data = result.data[0];
  if (!data) {
    alert("저장된 데이터가 없습니다");
    return;
  }
  newPlan.value = true;
  addPlanName.value = data.result.plan_title;
  addPlanContent.value = data.result.plan_content;
  console.log(data.result[0]);
};

//승인 재요청
const restart = async (id) => {
  console.log(id);
  let res = {
    plan_num: id,
  };
  let result = await axios
    .post(`/api/document/restartplan/`, res)
    .catch((err) => console.log(err));

  const data = result.data;
  console.log(data);
  location.reload();
};
//승인 취소
const cancel = async (id) => {
  console.log(id);
  let res = {
    plan_num: id,
  };
  let result = await axios
    .post(`/api/document/cancelplan/`, res)
    .catch((err) => console.log(err));

  const data = result.data;
  console.log(data);
  location.reload();
};

//수정완료
const original = ref([]);
const openresmodal = (res) => {
  original.value = { ...res };
  res.modifyPlan = true;
};
const plancomment = ref("");
const Update = async (id) => {
  const columns = [];
  console.log(id);
  for (let key of Object.keys(id)) {
    // 수정 가능한 필드만 체크
    if (["plan_title", "plan_content"].includes(key)) {
      // console.log(id);
      if (id[key] !== original.value[key]) {
        columns.push(key);
      }
    }
  }

  let updatedate = {
    plan_title: id.plan_title,
    plan_content: id.plan_content,
    plan_num: id.plan_num,
    plan_modified_by: memberStore.id,
    plan_modified_comment: plancomment.value,
    plan_modified_title: columns.join(","),
    plan_modified_content: id.plan_content,
  };
  console.log(plancomment.value);
  console.log(id);
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/updateplan",
      updatedate,
    );
    console.log(res.data);
    result.value = res.data;
    id.modifyPlan = false;
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//수정 내역 출력
const revisions = async (id) => {
  // console.log(id);
  try {
    let result = await axios
      .get(`/api/document/modifyPlanlist/${id.plan_num}`)
      .catch((err) => console.log(err));
    id.revision = Array.isArray(result.data.result) ? result.data.result : [];
    id.showRevision = true;
  } catch {
    id.revision = [];
    id.showRevision = true;
  }
};

//삭제
const delplan = async (id) => {
  let del = {
    plan_num: id.plan_num,
  };
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/deleteplan",
      del,
    );
    console.log(res.data);
    result.value = res.data;
    Plans.value.showPlanDelete = false;
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//시간 2026-02-27식으로 출력하기
const timedate = (id) => {
  const today = new Date(id);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
//지원기획서 추가 모달
const newPlan = ref(false);
//파일리스트
const filename = ref([]);
console.log(filename);
const filelist = async () => {
  let result = await axios
    .get(`/api/document/planFile`)
    .catch((err) => console.log(err));
  console.log(result.data.result);
  filename.value = Array.isArray(result.data.result) ? result.data.result : [];
};
</script>
<template>
  <div class="work-section-card card shadow-lg border-0 border-radius-xl">
    <div
      class="work-section-header d-flex justify-content-between align-items-center mb-3"
    >
      <h4 class="mb-0 fw-bold text-dark">지원계획서</h4>
      <div class="work-section-header-actions">
        <material-button type="button" size="sm" @click="sevedate()"
          >임시저장 내용</material-button
        >
        <material-button
          type="button"
          size="sm"
          color="info"
          @click="newPlan = true"
          >지원계획서 추가</material-button
        >
      </div>
    </div>

    <!-- 지원계획서 추가 모달 -->
    <Modal v-if="newPlan" class="plan-add-modal" @close="newPlan = false">
      <template #content>
        <div class="add-modal-draft-row">
          <p class="mb-0 text-secondary add-modal-draft-date">
            {{ timedate(new Date()) }}
          </p>
          <material-button
            type="button"
            size="sm"
            class="btn-draft"
            @click="draft()"
            >임시저장</material-button
          >
        </div>
        <material-input
          id="text"
          placeholder="목표입력"
          v-model="addPlanName"
        />
        <material-textarea
          id="text"
          placeholder="내용입력"
          v-model="addPlanContent"
        />
        <div class="add-modal-file-row">
          <material-button type="button">첨부파일 등록</material-button>
          <p class="mb-0">파일이름</p>
        </div>
      </template>
      <template #actions="{ close }">
        <material-button
          type="button"
          color="success"
          class="btn-register"
          @click="addPlan()"
          >승인 요청</material-button
        >
        <material-button
          type="button"
          class="btn-cancel"
          @click="
            () => {
              addPlanName = '';
              addPlanContent = '';
              close();
            }
          "
          >취소</material-button
        >
      </template>
    </Modal>

    <!-- 지원계획서 출력 -->
    <div
      v-for="Plan in Plans"
      :key="Plan.plan_num"
      class="record-item border rounded-3 p-3 mb-3 bg-white"
    >
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p class="mb-0 text-sm text-secondary">
          {{ timedate(Plan.plan_date) }} · 지원계획 {{ Plan.row_num }}
        </p>
        <div class="d-flex gap-2">
          <material-button
            type="button"
            size="sm"
            color="info"
            @click="openresmodal(Plan)"
            >수정</material-button
          >
          <material-button
            type="button"
            size="sm"
            color="danger"
            @click="Plan.showPlanDelete = true"
            >삭제</material-button
          >
        </div>
      </div>

      <!-- 수정 모달 -->
      <modal
        v-if="Plan.modifyPlan"
        class="plan-edit-modal"
        @close="Plan.modifyPlan = false"
      >
        <template #content>
          <material-input
            id="text"
            placeholder="제목입력"
            v-model="Plan.plan_title"
          />
          <material-input
            id="text"
            placeholder="내용입력"
            v-model="Plan.plan_content"
          />
          <material-input
            id="text"
            placeholder="수정사유"
            v-model="plancomment"
          />
        </template>
        <template #actions="{ close }">
          <material-button
            type="button"
            color="success"
            class="btn-register"
            @click="Update(Plan)"
            >수정 완료</material-button
          >
          <material-button type="button" class="btn-cancel" @click="close"
            >취소</material-button
          >
        </template>
      </modal>

      <!-- 삭제 모달 -->
      <Modal
        v-if="Plan.showPlanDelete"
        class="plan-delete-modal"
        @close="Plan.showPlanDelete = false"
      >
        <template #content>
          <p class="mb-3">해당 지원계획서를 <br />삭제하시겠습니까?</p>
        </template>
        <template #actions="{ close }">
          <material-button
            type="button"
            color="danger"
            class="btn-register"
            @click="delplan(Plan)"
            >예</material-button
          >
          <material-button type="button" class="btn-cancel" @click="close"
            >아니오</material-button
          >
        </template>
      </Modal>

      <div class="doc-display mt-2">
        <div class="doc-section">
          <div class="doc-label">제목</div>
          <h5 class="doc-title mb-1">{{ Plan.plan_title }}</h5>
        </div>

        <div class="doc-section">
          <div class="doc-label">내용</div>
          <p class="doc-content mb-0">{{ Plan.plan_content }}</p>
        </div>

        <div class="doc-section">
          <div class="doc-label">첨부파일</div>
          <div class="doc-files">
            <div
              v-for="file in filename.filter(
                (f) => f.plan_num === Plan.plan_num,
              )"
              :key="file.file_num"
              class="doc-file"
            >
              {{ file.origin_name }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-2 plan-action-row">
        <!-- 수정내역 -->
        <div class="plan-revision-actions">
          <material-button type="button" size="sm" @click="revisions(Plan)"
            >수정내역 확인</material-button
          >
          <Modal v-if="Plan.showRevision" @close="Plan.showRevision = false">
            <template #actions="{ close }">
              <material-button type="button" @click="close">X</material-button>
            </template>
            <template #content>
              <table class="table table-bordered table-sm mb-0">
                <thead>
                  <tr>
                    <th>수정날짜</th>
                    <th>이름</th>
                    <th>수정내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="revisions in Plan.revision"
                    :key="revisions.plan_modifi_num"
                  >
                    <td>{{ timedate(revisions.plan_modified_date) }}</td>
                    <td>{{ revisions.plan_modified_by }}</td>
                    <td>{{ revisions.plan_modified_comment }}</td>
                  </tr>
                </tbody>
              </table>
            </template>
          </Modal>
        </div>

        <!-- 승인 상태 버튼 -->
        <div class="plan-status-actions">
          <p v-if="Plan.plan_approved == 'd2'">
            <material-button type="button" color="warning" disabled
              >승인 완료</material-button
            >
          </p>
          <p v-else-if="Plan.plan_approved == 'd1'">
            <material-button type="button" color="warning"
              >승인 대기 중</material-button
            >
            <material-button
              type="button"
              color="danger"
              @click="cancel(Plan.plan_num)"
              >승인 요청 취소</material-button
            >
          </p>
          <p v-else-if="Plan.plan_approved == 'd3'">
            <material-button
              type="button"
              color="warning"
              @click="Plan.returnPlan = true"
              >반려</material-button
            >
          </p>
          <p v-else>
            <material-button
              type="button"
              color="warning"
              @click="restart(Plan.plan_num)"
              >승인 재요청</material-button
            >
          </p>
        </div>
      </div>

      <!-- 반려 사유 모달: 카드 전체 가로 사용 -->
      <div v-if="Plan.returnPlan" class="plan-return-modal-wrapper">
        <Modal class="plan-return-modal" @close="Plan.returnPlan = false">
          <template #content>
            <h4>반려 사유</h4>
            <p class="mb-0">{{ Plan.plan_return_reason }}</p>
          </template>
          <template #actions="{ close }">
            <material-button type="button" @click="close"
              >닫기</material-button
            >
          </template>
        </Modal>
      </div>
    </div>
  </div>
</template>
<style scoped>
.work-section-card {
  background: var(--app-surface);
  padding: 18px 18px 20px;
}

.work-section-header-actions {
  display: flex;
  gap: 8px;
}

.record-item {
  border-color: var(--app-border-muted);
}

.doc-display {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--app-border-muted);
  border-radius: 12px;
  padding: 12px;
}

.doc-section + .doc-section {
  margin-top: 10px;
}

.doc-label {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: #6c757d;
  margin-bottom: 4px;
}

.doc-title {
  font-weight: 700;
  color: #212529;
}

.doc-content {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 10px 12px;
  white-space: pre-wrap;
  color: #212529;
}

.doc-files {
  background: #ffffff;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 10px 12px;
}

.doc-file + .doc-file {
  margin-top: 4px;
}

.doc-file {
  font-size: 0.875rem;
  color: #343a40;
}

.plan-action-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.plan-revision-actions {
  flex: 0 0 auto;
}

.plan-status-actions {
  flex: 1 1 auto;
  display: flex;
  justify-content: flex-end;
}

.plan-status-actions > p {
  margin: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.plan-edit-modal :deep(.mt-3) .btn-register,
.plan-edit-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.plan-edit-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.plan-edit-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}

.plan-delete-modal :deep(.mt-3) .btn-register,
.plan-delete-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.plan-delete-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.plan-delete-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}

.plan-return-modal-wrapper {
  width: 100%;
  margin-top: 8px;
}

.plan-return-modal-wrapper :deep(.work-modal) {
  width: 100%;
  max-width: 100%;
}

.add-modal-file-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-modal-draft-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.add-modal-draft-row :deep(.btn-draft) {
  width: 20%;
  min-width: 80px;
}

.add-modal-draft-row .add-modal-draft-date {
  font-size: 0.875rem;
}

/* 지원계획서 추가 모달: 버튼 같은 크기, 취소 회색 */
.plan-add-modal :deep(.mt-3) .btn-register,
.plan-add-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.plan-add-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.plan-add-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}
</style>
