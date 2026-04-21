<script setup>
import { ref } from "vue";
import MaterialButton from "@/components/MaterialButton.vue";
import { useMemberStore } from "@/store/member";
import { useDocStore } from "../../store/doc";
import axios from "axios";

// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const docStore = useDocStore();
const memberStore = useMemberStore();

const selected = ref(null);
const items = [
  { id: 1, label: "계획", color: "blue", cord: "c3" },
  { id: 2, label: "중점", color: "green", cord: "c4" },
  { id: 3, label: "긴급", color: "red", cord: "c5" },
];
const reason = ref("");
const select = (id) => {
  selected.value = id;
};
const activeStyle = (color) => ({
  backgroundColor: color,
  borderColor: color,
  color: "#fff",
});
const count = ref(0);
const appSign = async () => {
  console.log(selected.value, reason.value);
  if (!selected.value) {
    alert("우선순위를 선택해주세요");
    return;
  } else if (!reason.value) {
    alert("사유를 적어주세요");
    return;
  }
  let appcontent = {
    doc_num: docStore.doc_num,
    priority_reason: reason.value,
    priority: selected.value,
    priority_app_manager: memberStore.id,
    priority_approved: "d1",
  };
  count.value = 1;
  const result = ref(null);

  try {
    const res = await axios.post("/api/document/priority", appcontent);
    console.log(res.data);
    result.value = res.data;
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
const appSigncancel = async () => {
  count.value = 0;
};
</script>
<template>
  <div class="work-right-center">
    <div class="priority-card card shadow-lg border-0 border-radius-xl">
      <h4 class="mb-3 fw-bold text-dark">우선순위 설정</h4>
      <p class="text-sm text-secondary mb-4">
        {{ memberStore.id }}님의 대기단계를 선택하고 사유를 입력하세요.
      </p>
      <div class="mb-4 text-center">
        <div class="wrapper">
          <div
            v-for="item in items"
            :key="item.id"
            class="circle"
            :style="selected === item.cord ? activeStyle(item.color) : {}"
            @click="select(item.cord)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="mb-3">
        <textarea
          name="reason"
          id="reason"
          placeholder="우선순위 요청 사유를 입력하세요."
          v-model="reason"
        ></textarea>
      </div>
      <div class="text-center mt-3">
        <p v-if="count == 0">
          <material-button type="button" color="success" @click="appSign()"
            >승인 요청</material-button
          >
        </p>
        <p v-else>
          <material-button type="button" disabled>승인 요청 중</material-button>
          <material-button type="button" @click="appSigncancel()" color="danger"
            >승인 취소</material-button
          >
        </p>
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

.priority-card {
  width: 100%;
  max-width: none;
  margin: 0;
  background-color: var(--app-surface);
  padding: 18px 18px 20px;
}

.wrapper {
  display: flex;
  gap: 20px;
}

.circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: white;
  font-weight: bold;
  transition: all 0.2s ease;
  margin: 0 auto;
}

#reason {
  width: 100%;
  min-height: 180px;
  vertical-align: top;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  padding: 12px 14px;
}
</style>
