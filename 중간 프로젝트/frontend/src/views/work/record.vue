<script setup>
import MaterialButton from "@/components/MaterialButton.vue";
import { ref, onBeforeMount } from "vue";
import Modal from "./modal.vue";
import MaterialInput from "@/components/MaterialInput.vue";
import MaterialTextarea from "@/components/MaterialTextarea.vue";
import axios from "axios";
// import { useRoute } from "vue-router";
// export default { components: { MaterialInput } };
// const route = useRoute();
import { useMemberStore } from "@/store/member";
import { useDocStore } from "../../store/doc";

const memberStore = useMemberStore();
const docStore = useDocStore();
//상담기록 출력
const records = ref([]);
console.log(records);
const listrecord = async () => {
  let doc = docStore.doc_num;
  let result = await axios
    .get(`/api/document/recordlist/${doc}`)
    .catch((err) => console.log(err));
  records.value = (result.data.result || []).map((r) => ({
    ...r,
    file: r.file || [],
    showrecordDelete: false,
    modifyrecord: false,
    showRevision: false,
    revision: [],
  }));
};

//수정 내역 출력
const revisions = async (id) => {
  // console.log(id);
  try {
    let result = await axios
      .get(`/api/document/modifyRecordlist/${id.counsel_num}`)
      .catch((err) => console.log(err));
    id.revision = Array.isArray(result.data.result) ? result.data.result : [];
    id.showRevision = true;
  } catch {
    id.revision = [];
    id.showRevision = true;
  }
};

onBeforeMount(() => {
  listrecord();
  filelist();
  // let searchId = route.query.no;
  // revisions(searchId);
});

const timedate = (id) => {
  const today = id ? new Date(id) : new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const today = ref(timedate(new Date()));

const newrecord = ref(false);

//상담기록 추가
const addRecordName = ref("");
const addRecordContent = ref("");
const addrecord = async () => {
  console.log(addRecordName.value, addRecordContent.value);
  if (!addRecordName.value) {
    alert("제목을 입력해주세요");
    return;
  } else if (!addRecordContent.value) {
    alert("내용을 입력해주세요");
    return;
  }

  let add = {
    doc_num: docStore.doc_num,
    counsel_title: addRecordName.value,
    counsel_content: addRecordContent.value,
    counsel_manager: memberStore.id,
  };

  const result = ref(null);
  try {
    const res = await axios.post("/api/document/record", add);
    console.log(res.data);
    result.value = res.data;
    addRecordName.value = "";
    addRecordContent.value = "";
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
  newrecord.value = false;
};
//임시저장
const draft = async () => {
  let savedate = {
    counsel_num: "coun-9999999",
    doc_num: docStore.doc_num,
    counsel_title: addRecordName.value,
    counsel_content: addRecordContent.value,
  };
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/saverecord",
      savedate,
    );
    console.log(res.data);
    result.value = res.data;
    addRecordName.value = "";
    addRecordContent.value = "";
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};

//임시저장 불러오기
const sevedate = async () => {
  let result = await axios
    .post(`/api/document/bringrecord`)
    .catch((err) => console.log(err));

  const data = result.data[0];
  if (!data) {
    alert("저장된 데이터가 없습니다");
    return;
  }

  newrecord.value = true;
  addRecordName.value = data.result.counsel_title;
  addRecordContent.value = data.result.counsel_content;
  console.log(data.result);
};

const closeModal = () => {
  newrecord.value = false;
  addRecordName.value = "";
  addRecordContent.value = "";
};
//수정완료
const original = ref([]);
const openresmodal = (res) => {
  original.value = { ...res };
  res.modifyrecord = true;
};
const recordcomment = ref("");
const Update = async (id) => {
  const columns = [];
  console.log(id);
  for (let key of Object.keys(id)) {
    // 수정 가능한 필드만 체크
    if (["counsel_title", "counsel_content"].includes(key)) {
      // console.log(id);
      if (id[key] !== original.value[key]) {
        columns.push(key);
      }
    }
  }

  let updatedate = {
    counsel_title: id.counsel_title,
    counsel_content: id.counsel_content,
    counsel_num: id.counsel_num,
    counsel_modified_by: memberStore.id,
    counsel_modified_comment: recordcomment.value,
    counsel_modified_title: columns.join(","),
    counsel_modified_content: id.counsel_content,
  };
  console.log(id);
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/Updaterecord",
      updatedate,
    );
    console.log(res.data);
    result.value = res.data;
    id.modifyrecord = false;
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//삭제
const delRecord = async (id) => {
  let del = {
    counsel_num: id.counsel_num,
  };
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/deleterecord",
      del,
    );
    console.log(res.data);
    result.value = res.data;
    records.value.showrecordDelete = false;
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
//파일리스트
const filename = ref([]);
console.log(filename);
const filelist = async () => {
  let result = await axios
    .get(`/api/document/recordFile`)
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
      <h4 class="mb-0 fw-bold text-dark">상담기록</h4>
      <div class="work-section-header-actions">
        <material-button type="button" size="sm" @click="sevedate()"
          >임시저장 내용</material-button
        >
        <material-button
          type="button"
          size="sm"
          color="info"
          @click="newrecord = true"
          >상담기록 추가</material-button
        >
      </div>
    </div>

    <!-- 상담기록 추가 모달 -->
    <Modal v-if="newrecord" class="record-add-modal" @close="closeModal()">
      <template #content>
        <div class="add-modal-draft-row">
          <material-input
            id="date"
            type="date"
            placeholder="내용입력"
            v-model="today"
          />
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
          placeholder="제목입력"
          v-model="addRecordName"
        />
        <material-textarea
          id="text"
          placeholder="내용입력"
          v-model="addRecordContent"
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
          @click="addrecord()"
          >등록</material-button
        >
        <material-button
          type="button"
          class="btn-cancel"
          @click="
            () => {
              addRecordName = '';
              addRecordContent = '';
              close();
            }
          "
          >취소</material-button
        >
      </template>
    </Modal>

    <!-- 상담기록 내역 -->
    <div
      v-for="record in records"
      :key="record.counsel_num"
      class="record-item border rounded-3 p-3 mb-3 bg-white"
    >
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p class="mb-0 text-sm text-secondary">
          {{ timedate(record.counsel_date) }} · {{ record.row_num }}번째
          상담기록
        </p>
        <div class="d-flex gap-2">
          <material-button
            type="button"
            size="sm"
            color="info"
            @click="openresmodal(record)"
            >수정</material-button
          >
          <material-button
            type="button"
            size="sm"
            color="danger"
            @click="record.showrecordDelete = true"
            >삭제</material-button
          >
        </div>
      </div>

      <!-- 수정 모달 -->
      <Modal
        v-if="record.modifyrecord"
        class="record-edit-modal"
        @close="record.modifyrecord = false"
      >
        <template #content>
          <material-input
            id="text"
            placeholder="제목입력"
            v-model="record.counsel_title"
          />
          <material-input
            id="text"
            placeholder="내용입력"
            v-model="record.counsel_content"
          />
          <material-input
            id="text"
            placeholder="수정사유"
            v-model="recordcomment"
          />
        </template>
        <template #actions="{ close }">
          <material-button
            type="button"
            color="success"
            class="btn-register"
            @click="Update(record)"
            >수정 완료</material-button
          >
          <material-button type="button" class="btn-cancel" @click="close"
            >취소</material-button
          >
        </template>
      </Modal>

      <!-- 삭제 모달 -->
      <Modal
        v-if="record.showrecordDelete"
        class="record-delete-modal"
        @close="record.showrecordDelete = false"
      >
        <template #content>
          <p class="mb-3">해당 상담내용을 <br />삭제하시겠습니까?</p>
        </template>
        <template #actions="{ close }">
          <material-button
            type="button"
            color="danger"
            class="btn-register"
            @click="delRecord(record)"
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
          <h5 class="doc-title mb-1">{{ record.counsel_title }}</h5>
        </div>

        <div class="doc-section">
          <div class="doc-label">내용</div>
          <p class="doc-content mb-0">{{ record.counsel_content }}</p>
        </div>

        <div class="doc-section">
          <div class="doc-label">첨부파일</div>
          <div class="doc-files">
            <div
              v-for="file in filename.filter(
                (f) => f.counsel_num === record.counsel_num,
              )"
              :key="file.file_num"
              class="doc-file"
            >
              {{ file.origin_name }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <material-button type="button" size="sm" @click="revisions(record)"
          >수정내역 확인</material-button
        >
        <Modal v-if="record.showRevision" @close="record.showRevision = false">
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
                  v-for="revisions in record.revision"
                  :key="revisions.counsel_modifi_num"
                >
                  <td>{{ timedate(revisions.counsel_modified_date) }}</td>
                  <td>{{ revisions.counsel_modified_by }}</td>
                  <td>{{ revisions.counsel_modified_comment }}</td>
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

.record-edit-modal :deep(.mt-3) .btn-register,
.record-edit-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.record-edit-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.record-edit-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}

.record-delete-modal :deep(.mt-3) .btn-register,
.record-delete-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.record-delete-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.record-delete-modal :deep(.btn-cancel:hover) {
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

/* 상담기록 추가 모달: 버튼 같은 크기, 취소 회색 */
.record-add-modal :deep(.mt-3) .btn-register,
.record-add-modal :deep(.mt-3) .btn-cancel {
  min-width: 100px;
}

.record-add-modal :deep(.btn-cancel) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.record-add-modal :deep(.btn-cancel:hover) {
  background-color: #5a6268;
  border-color: #545b62;
  color: #fff;
}
</style>
