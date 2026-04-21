<script setup>
import axios from "axios";
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useDocStore } from "../../store/doc";
const managers = ref(["정찬우", "장수연", "이민호", "안형주", "김진환"]);
const selectedManager = ref("");
const docStore = useDocStore();
const router = useRouter();
const handleRegister = async () => {
  if (!selectedManager.value) {
    alert("담당자를 먼저 선택해주세요.");
    return;
  }
  const result = await axios.patch(
    `/api/document/manager/${docStore.doc_num}/${selectedManager.value}`,
  );
  if (result.data.retCode == "OK") {
    alert(`${selectedManager.value} 담당자로 등록되었습니다.`);
    router.go(0);
  } else {
    alert("오류발생 관리자에게 문의해주세요");
  }
};
//작성자의 센터의 기관담당자 또는 관리자 가져오기
const getManagerList = async () => {
  console.log(docStore.writer);
  const result = await axios.get(`/api/user/getManager/${docStore.writer}`);
  managers.value = result.data.result;
};
const getManager = async () => {
  const result = await axios.get(`/api/document/manager/${docStore.doc_num}`);
  console.log(result.data);
  selectedManager.value = result.data.result.manager || "";
};
const handleCancel = () => {
  selectedManager.value = "";
};
onBeforeMount(async () => {
  await getManagerList();
  await getManager();
});
</script>
<template>
  <div class="work-right-center">
    <div class="representative-card card shadow-lg border-0 border-radius-xl">
      <h4 class="mb-3 fw-bold text-dark">담당자 지정</h4>
      <div class="sentence-area mb-4">
        <span class="text-label">담당자는</span>
        <div class="select-container">
          <select v-model="selectedManager" class="standard-select">
            <option value="" disabled selected>담당자를 선택하세요</option>
            <option
              v-for="manager in managers"
              :key="manager.user_id"
              :value="manager.user_id"
            >
              {{ manager.user_name }}
            </option>
          </select>
        </div>
        <span class="text-label">입니다.</span>
      </div>

      <div class="button-area mt-4">
        <button
          class="btn bg-gradient-success text-white px-4"
          @click="handleRegister"
        >
          등 록
        </button>
        <button class="btn btn-outline-secondary px-4" @click="handleCancel">
          취 소
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.work-right-center {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.representative-card {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 18px 18px 20px;
  background-color: var(--app-surface);
}

/* 문장 가로 배치 */
.sentence-area {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: nowrap;
}

.text-label {
  font-size: 24px;
  color: #333;
  white-space: nowrap;
}

.name-point {
  color: #ff9800;
  font-weight: bold;
}

/* Select 박스 스타일링 */
.select-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 250px;
}

.standard-select {
  width: 100%;
  height: 50px;
  padding: 0 15px;
  font-size: 18px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  appearance: none; /* 기본 화살표 숨김 */
  background-color: white;
  cursor: pointer;
}

.arrow-indicator {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 50px;
  background-color: #8da9d4;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* 클릭 이벤트가 select에 전달되도록 설정 */
}

/* 하단 버튼 가로 배치 */
.button-area {
  display: flex;
  gap: 20px;
}

.action-btn {
  width: 140px;
  height: 50px;
  background-color: #547cc4;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background-color: #4365a3;
}
</style>
