<script setup>
import { ref, onBeforeMount } from "vue";
import { useMemberStore } from "@/store/member";
import axios from "axios";

// import { useRoute } from "vue-router";
import { useDocStore } from "../../store/doc";

const docStore = useDocStore();

// const route = useRoute();

const memberStore = useMemberStore();

let prioritydb = ref({});
// console.log(prioritydb);
//get으로 데이터 당겨오기
const priorityData = async () => {
  let doc = docStore.doc_num;
  let result = await axios
    .get(`/api/document/priority/${doc}`)
    .catch((err) => console.log(err));
  prioritydb.value = result.data.result;
  console.log(result.data.result);
  console.log(prioritydb.value);
};
onBeforeMount(() => {
  priorityData();
});

const items = [
  { id: 1, label: "계획", color: "blue", cord: "c3" },
  { id: 2, label: "중점", color: "green", cord: "c4" },
  { id: 3, label: "긴급", color: "red", cord: "c5" },
];

const box = ref(null);

const display = () => {
  if (box.value) {
    box.value.style.display = "block";
  }
};
const nonedisplay = () => {
  if (box.value) {
    box.value.style.display = "none";
  }
};
//승인요청
const appPri = async () => {
  let appcontent = {
    priority_req_num: prioritydb.value.priority_req_num,
    doc_num: docStore.doc_num,
    priority: prioritydb.value.priority,
  };
  console.log(appcontent);
  const result = ref(null);
  try {
    const res = await axios.post("/api/document/priority_manager", appcontent);
    console.log(res.data);
    result.value = res.data;
    location.reload();
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};

const returnReason = ref("");

//반려
const returnPri = async () => {
  let returncontent = {
    priority_req_num: prioritydb.value.priority_req_num,
    priority_return_reason: returnReason.value,
    priority_approved: "d3",
  };
  const result = ref(null);
  try {
    const res = await axios.post(
      "/api/document/returnPriority_manager",
      returncontent,
    );
    console.log(res.data);
    result.value = res.data;
  } catch (err) {
    console.error(err);
    result.value = "서버 에러 발생";
  }
};
</script>
<template>
  <div class="work-right-center">
    <div class="priority-card card shadow-lg border-0 border-radius-xl">
      <h4 class="mb-3 fw-bold text-dark">우선순위 승인</h4>
      <p class="text-sm text-secondary mb-4">
        {{ memberStore.id }}님의 요청 우선순위를 확인하고 승인 또는 반려를
        선택하세요.
      </p>
      <div class="text-center mb-4">
        <div class="wrapper" v-if="prioritydb?.priority == 'c3'">
          <div
            class="circle"
            :style="{ backgroundColor: items[0].color, color: '#fff' }"
            disabled
          >
            {{ items[0].label }}
          </div>
        </div>
        <div class="wrapper" v-else-if="prioritydb?.priority == 'c4'">
          <div
            class="circle"
            :style="{ backgroundColor: items[1].color, color: '#fff' }"
            disabled
          >
            {{ items[1].label }}
          </div>
        </div>
        <div class="wrapper" v-else>
          <div
            class="circle"
            :style="{ backgroundColor: items[2].color, color: '#fff' }"
            disabled
          >
            {{ items[2].label }}
          </div>
        </div>
      </div>
      <div id="reasonbox" class="mb-3">
        <p class="reason-view">{{ prioritydb.priority_reason }}</p>
        <!-- 반려 사유 작성 모달창 -->
        <div class="return" ref="box">
          <h6 class="fw-bold mb-2">반려 사유</h6>
          <textarea
            name="return"
            id="return"
            placeholder="반려 사유를 작성하세요."
            v-model="returnReason"
          ></textarea>
          <div class="mt-3 d-flex gap-2 justify-content-center">
            <material-button type="button" class="app" @click="returnPri()"
              >반려</material-button
            >
            <material-button
              type="button"
              class="app"
              @click="nonedisplay()"
              color="danger"
              >취소</material-button
            >
          </div>
        </div>
      </div>

      <div
        v-if="prioritydb?.priority_approved === 'd3'"
        class="mb-2 text-center"
      >
        <material-button type="button" class="app" disabled
          >반려</material-button
        >
      </div>
      <div id="btnmargin" class="text-center mt-2">
        <div v-if="prioritydb?.priority_approved === 'd2'">
          <material-button type="button" class="app" disabled
            >승인완료</material-button
          >
        </div>
        <div v-else>
          <material-button type="button" class="app" @click="appPri()"
            >승인</material-button
          >
          <material-button
            type="button"
            class="app"
            @click="display()"
            color="danger"
            >반려</material-button
          >
        </div>
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
  transition: all 0.3s ease;
  margin: 0 auto;
}
.return {
  display: none;
  text-align: center;
  background-color: var(--app-surface);
  padding: 5px;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  width: 100%;
  margin: 0 auto;
}
#return {
  margin: 0 auto;
  width: 100%;
  min-height: 220px;
  vertical-align: top;
  resize: none;
  border: 1px solid black;
}
.app {
  margin: 6px 8px;
  min-width: 120px;
}
#btnmargin {
  margin: 10px;
}
#reasonbox {
  margin: 0 auto;
  vertical-align: top;
  color: black;
  text-align: left;
}
.reason-view {
  margin: 0 auto 12px;
  width: 100%;
  min-height: 120px;
  font-size: 0.95rem;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  background-color: var(--app-surface-muted);
  padding: 10px 12px;
}
</style>
<script>
import MaterialButton from "@/components/MaterialButton.vue";
export default {
  components: { MaterialButton },
};
</script>
