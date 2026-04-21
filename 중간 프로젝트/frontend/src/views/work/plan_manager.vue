<script setup>
import MaterialButton from "@/components/MaterialButton.vue";
import { ref, onBeforeMount } from "vue";
import Modal from "./modal.vue";
import MaterialInput from "@/components/MaterialInput.vue";
import MaterialTextarea from "@/components/MaterialTextarea.vue";
import axios from "axios";
// import { useMemberStore } from "@/store/member";
import { useDocStore } from "../../store/doc";

// const memberStore = useMemberStore();
const docStore = useDocStore();

//지원기획서 승인 리스트
const Plans = ref([]);
console.log(Plans);
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
    returnplan: false,
    revision: [],
  }));
  console.log(result.data.result);
};
onBeforeMount(() => {
  filelist();
  listPlan();
});

//승인
const appPlan = async (id) => {
  let appPlan = {
    doc_num: docStore.doc_num,
    plan_num: id.plan_num,
  };
  const result = ref(null);
  try {
    const res = await axios.post("/api/document/appplan", appPlan);
    result.value = res.data;
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//반려
const returnReason = ref("");
const returnplan = async (id) => {
  let appPlan = {
    plan_return_reason: returnReason.value,
    plan_num: id,
  };
  const result = ref(null);
  try {
    const res = await axios.post("/api/document/returnplan", appPlan);
    result.value = res.data;
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};

//시간 2026-02-27식으로 출력하기
const timedate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const newPlan = ref(false);

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
      <h4 class="mb-0 fw-bold text-dark">지원계획서 승인</h4>
      <div class="work-section-header-actions">
        <material-button type="button" size="sm" disabled
          >임시저장 내용</material-button
        >
        <material-button type="button" size="sm" @click="newPlan = true"
          >지원계획서 추가</material-button
        >
      </div>
    </div>

    <!-- 지원계획서 추가 모달 (관리자용 작성 기능) -->
    <Modal v-if="newPlan" class="plan-add-modal" @close="newPlan = false">
      <template #content>
        <div class="add-modal-draft-row">
          <p class="mb-0 text-secondary add-modal-draft-date">
            {{ timedate(new Date()) }}
          </p>
          <material-button type="button" size="sm" class="btn-draft" disabled
            >임시저장</material-button
          >
        </div>
        <material-input id="text" placeholder="목표입력" />
        <material-textarea id="text-content" placeholder="내용입력" />
        <div class="add-modal-file-row">
          <material-button type="button">첨부파일 등록</material-button>
          <p class="mb-0">파일이름</p>
        </div>
      </template>
      <template #actions="{ close }">
        <material-button type="button" color="success" class="btn-register"
          >등록</material-button
        >
        <material-button type="button" class="btn-cancel" @click="close"
          >취소</material-button
        >
      </template>
    </Modal>

    <!-- 지원기획서 출력 -->
    <div
      v-for="Plan in Plans"
      :key="Plan.doc_num"
      class="record-item border rounded-3 p-3 mb-3 bg-white"
    >
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p class="mb-0 text-sm text-secondary">
          {{ timedate(Plan.plan_date) }} · 지원계획 {{ Plan.row_num }}
        </p>
      </div>

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

      <div class="mt-3 plan-action-row">
        <!-- 수정내역 -->
        <div class="plan-revision-actions">
          <material-button type="button" size="sm" @click="revisions(Plan)"
            >수정내역</material-button
          >
        </div>

        <!-- 승인 / 반려 -->
        <div class="plan-status-actions">
          <p v-if="Plan.plan_approved == 'd1'">
            <material-button
              type="button"
              color="warning"
              @click="appPlan(Plan)"
              >승인</material-button
            >
            <material-button
              type="button"
              color="danger"
              @click="Plan.returnplan = true"
              >반려</material-button
            >
          </p>
          <p v-else-if="Plan.plan_approved == 'd2'">
            <material-button type="button" color="warning" disabled
              >승인 완료</material-button
            >
          </p>
          <p v-else>
            <material-button type="button" color="warning" disabled
              >반려</material-button
            >
          </p>
        </div>
      </div>

      <!-- 수정내역 모달: 수정내역 버튼 아래에 표시 -->
      <div v-if="Plan.showRevision" class="plan-manager-revision-modal-wrapper">
        <Modal @close="Plan.showRevision = false">
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

      <!-- 반려 사유 모달: 수정내역~오른쪽 끝 가로 전체, [반려][취소] 버튼 -->
      <div v-if="Plan.returnplan" class="plan-manager-return-modal-wrapper">
        <Modal
          class="plan-manager-return-modal"
          @close="Plan.returnplan = false"
        >
          <template #content>
            <h4>반려사유</h4>
            <material-textarea
              id="return-reason"
              placeholder="반려사유작성"
              v-model="returnReason"
            />
          </template>
          <template #actions="{ close }">
            <material-button
              type="button"
              color="danger"
              class="btn-register"
              @click="returnplan(Plan.plan_num)"
              >반려</material-button
            >
            <material-button type="button" class="btn-cancel" @click="close"
              >취소</material-button
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

.plan-manager-revision-modal-wrapper {
  width: 100%;
  margin-top: 8px;
}

.plan-manager-revision-modal-wrapper :deep(.work-modal) {
  width: 100%;
  max-width: 100%;
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

/* 반려 사유 모달: 가로 전체, [반려][취소] 동일 크기·취소 회색 */
.plan-manager-return-modal-wrapper {
  width: 100%;
  margin-top: 8px;
}

.plan-manager-return-modal-wrapper :deep(.work-modal) {
  width: 100%;
  max-width: 100%;
}

.plan-manager-return-modal :deep(.mt-3) .btn-register,
.plan-manager-return-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.plan-manager-return-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.plan-manager-return-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}
</style>
