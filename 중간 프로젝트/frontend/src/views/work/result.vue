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
// console.log(docStore.doc_num);
//지원결과서 출력
const results = ref([]);
const listresult = async () => {
  let doc = docStore.doc_num;
  let result = await axios
    .get(`/api/document/resultlist/${doc}`)
    .catch((err) => console.log(err));

  results.value = (result.data.result || []).map((r) => ({
    ...r,
    file: r.file || [],
    showResultDelete: false,
    modifyResult: false,
    showRevision: false,
    revision: [],
  }));
  console.log(results.value);
};

onBeforeMount(() => {
  listresult();
  filelist();
});
const revisions = async (id) => {
  // console.log(id);
  try {
    let result = await axios
      .get(`/api/document/modifyResultlist/${id.result_num}`)
      .catch((err) => console.log(err));
    id.revision = Array.isArray(result.data.result) ? result.data.result : [];
    id.showRevision = true;
  } catch {
    id.revision = [];
    id.showRevision = true;
  }
};
//지원결과서 추가
const addresultsName = ref("");
const addresultsContent = ref("");
const addresults = async () => {
  console.log(addresultsName.value, addresultsContent.value);
  if (!addresultsName.value) {
    alert("제목을 입력해주세요");
    return;
  } else if (!addresultsContent.value) {
    alert("내용을 입력해주세요");
    return;
  }

  let add = {
    doc_num: docStore.doc_num,
    result_manager: memberStore.id,
    result_title: addresultsName.value,
    result_contnet: addresultsContent.value,
  };

  const result = ref(null);
  try {
    const res = await axios.post("/api/document/result", add);
    console.log(res.data);
    result.value = res.data;
    addresultsName.value = "";
    addresultsContent.value = "";
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
  newresult.value = false;
};

//지원결과서 수정
const original = ref([]);
const openresmodal = (res) => {
  original.value = { ...res };
  res.modifyResult = true;
};
const resreason = ref("");
const Update = async (id) => {
  const columns = [];

  for (let key of Object.keys(id)) {
    // 수정 가능한 필드만 체크
    if (["result_title", "result_contnet"].includes(key)) {
      console.log(key);
      if (id[key] !== original.value[key]) {
        columns.push(key);
      }
    }
  }

  let updatedate = {
    result_title: id.result_title,
    result_contnet: id.result_contnet,
    result_num: id.result_num,
    result_modified_by: memberStore.id,
    result_modified_comment: resreason.value,
    result_modified_title: columns.join(","),
    result_modified_content: id.result_contnet,
  };
  console.log(id);
  const result = ref(null);
  try {
    const res = await axios.post("/api/document/updateresult", updatedate);
    console.log(res.data);
    result.value = res.data;
    id.modifyResult = false;
    // location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//임시저장
const draft = async () => {
  let savedate = {
    result_num: "result-9999999",
    doc_num: docStore.doc_num,
    result_title: addresultsName.value,
    result_content: addresultsContent.value,
  };
  const result = ref(null);
  try {
    const res = await axios.post("/api/document/saveresult", savedate);
    console.log(res.data);
    result.value = res.data;
    addresultsName.value = "";
    addresultsContent.value = "";
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//임시저장 불러오기
const sevedate = async () => {
  let result = await axios
    .post(`/api/document/bringresult`)
    .catch((err) => console.log(err));
  const data = result.data[0];
  if (!data) {
    alert("저장된 데이터가 없습니다");
    return;
  }
  newresult.value = true;
  addresultsName.value = data.result.result_title;
  addresultsContent.value = data.result.result_content;
  console.log(data.result[0]);
};

const timedate = (id) => {
  const today = id ? new Date(id) : new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
//삭제
const delresult = async (id) => {
  let del = {
    result_num: id.result_num,
  };
  const result = ref(null);
  try {
    const res = await axios.post("/api/document/deleteresult", del);
    console.log(res.data);
    result.value = res.data;
    results.value.showResultDelete = false;
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
const newresult = ref(false);
//파일리스트
const filename = ref([]);
console.log(filename);
const filelist = async () => {
  let result = await axios
    .get(`/api/document/resultFile`)
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
      <h4 class="mb-0 fw-bold text-dark">지원결과서</h4>
      <div class="work-section-header-actions">
        <material-button type="button" size="sm" @click="sevedate()"
          >임시저장 내용</material-button
        >
        <material-button
          type="button"
          size="sm"
          color="info"
          @click="newresult = true"
          >지원결과서 추가</material-button
        >
      </div>
    </div>

    <!-- 지원결과서 추가 모달 -->
    <Modal v-if="newresult" class="result-add-modal" @close="newresult = false">
      <template #content>
        <div class="add-modal-draft-row">
          <p class="mb-0 text-secondary add-modal-draft-date">
            {{ timedate() }}
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
          placeholder="결과제목"
          v-model="addresultsName"
        />
        <material-textarea
          id="text"
          placeholder="내용입력"
          v-model="addresultsContent"
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
          @click="addresults()"
          >등록</material-button
        >
        <material-button
          type="button"
          class="btn-cancel"
          @click="
            () => {
              addresultsName = '';
              addresultsContent = '';
              close();
            }
          "
          >취소</material-button
        >
      </template>
    </Modal>

    <!-- 지원결과서 출력 -->
    <div
      v-for="result in results"
      :key="result.result_num"
      class="record-item border rounded-3 p-3 mb-3 bg-white"
    >
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p class="mb-0 text-sm text-secondary">
          {{ timedate(result.result_date) }} · 지원결과 {{ result.row_num }}
        </p>
        <div class="d-flex gap-2">
          <material-button
            type="button"
            size="sm"
            color="info"
            @click="openresmodal(result)"
            >수정</material-button
          >
          <material-button
            type="button"
            size="sm"
            color="danger"
            @click="result.showResultDelete = true"
            >삭제</material-button
          >
        </div>
      </div>

      <!-- 수정 모달 -->
      <modal
        v-if="result.modifyResult"
        class="result-edit-modal"
        @close="result.modifyResult = false"
      >
        <template #content>
          <material-input
            id="text"
            placeholder="제목입력"
            v-model="result.result_title"
          />
          <material-input
            id="text"
            placeholder="내용입력"
            v-model="result.result_contnet"
          />
          <material-input
            id="text"
            placeholder="수정사유"
            v-model="resreason"
          />
        </template>
        <template #actions="{ close }">
          <material-button
            type="button"
            color="success"
            class="btn-register"
            @click="Update(result)"
            >수정 완료</material-button
          >
          <material-button type="button" class="btn-cancel" @click="close"
            >취소</material-button
          >
        </template>
      </modal>

      <!-- 삭제 모달 -->
      <Modal
        v-if="result.showResultDelete"
        class="result-delete-modal"
        @close="result.showResultDelete = false"
      >
        <template #content>
          <p class="mb-3">해당 지원결과서를 <br />삭제하시겠습니까?</p>
        </template>
        <template #actions="{ close }">
          <material-button
            type="button"
            color="danger"
            class="btn-register"
            @click="delresult(result)"
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
          <h5 class="doc-title mb-1">{{ result.result_title }}</h5>
        </div>

        <div class="doc-section">
          <div class="doc-label">내용</div>
          <p class="doc-content mb-0">{{ result.result_contnet }}</p>
        </div>

        <div class="doc-section">
          <div class="doc-label">첨부파일</div>
          <div class="doc-files">
            <div
              v-for="file in filename.filter(
                (f) => f.result_num === result.result_num,
              )"
              :key="file.result_num"
              class="doc-file"
            >
              {{ file.origin_name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 수정내역 -->
      <div class="mt-2">
        <material-button type="button" size="sm" @click="revisions(result)"
          >수정내역 확인</material-button
        >
        <Modal v-if="result.showRevision" @close="result.showRevision = false">
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
                  v-for="revisions in result.revision"
                  :key="revisions.result_modifi_num"
                >
                  <td>{{ timedate(revisions.result_modified_date) }}</td>
                  <td>{{ revisions.result_modified_by }}</td>
                  <td>{{ revisions.result_modified_comment }}</td>
                </tr>
              </tbody>
            </table>
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

.result-edit-modal :deep(.mt-3) .btn-register,
.result-edit-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.result-edit-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.result-edit-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}

.result-delete-modal :deep(.mt-3) .btn-register,
.result-delete-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.result-delete-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.result-delete-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
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

/* 지원결과서 추가 모달: 버튼 같은 크기, 취소 회색 */
.result-add-modal :deep(.mt-3) .btn-register,
.result-add-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.result-add-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.result-add-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}
</style>
