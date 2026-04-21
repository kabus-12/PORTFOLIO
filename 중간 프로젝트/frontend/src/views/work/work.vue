<script setup>
// import MaterialButton from "@/components/MaterialButton.vue";
import { ref, onBeforeMount } from "vue";
import axios from "axios";
import { useDocStore } from "@/store/doc";
import { useMemberStore } from "@/store/member";
import { useRoute, useRouter } from "vue-router";
const docStore = useDocStore();
const memberStore = useMemberStore();
// console.log("----------------------");
// console.log(docStore.doc_num);
// console.log(memberStore.grade);
const router = useRouter();
const route = useRoute();

const isActiveTab = (tab) => {
  const path = route.path || "";
  if (tab === "record") return path.startsWith("/work/record");
  if (tab === "plan") return path.startsWith("/work/plan");
  if (tab === "result") return path.startsWith("/work/result");
  if (tab === "representative") return path.startsWith("/work/representative");
  if (tab === "priority") return path.startsWith("/work/priority");
  return false;
};

const goplan = () => {
  if (memberStore.grade == "a3") {
    router.push("/work/plan_manager");
  } else {
    router.push("/work/plan");
  }
};

const gopriority = () => {
  if (memberStore.grade == "a3") {
    router.push("/work/priority_manager");
  } else {
    router.push("/work/priority");
  }
};

const gorecord = () => {
  router.push("/work/record");
};

const goresult = () => {
  router.push("/work/result");
};

const gorepresentative = () => {
  router.push("/work/representative");
};
let prioritydb = ref({});
//get으로 데이터 당겨오기
const priorityData = async () => {
  let doc = docStore.doc_num;
  let result = await axios
    .get(`/api/document/pri/${doc}`)
    .catch((err) => console.log(err));
  prioritydb.value = result.data.result[0];
  // console.log(result.data.result);
  console.log(prioritydb.value);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ko-KR");
  // 결과: "2026. 2. 22."
};
const doc = ref({});
const formData = ref([]);
const userAnswers = ref({});

//신청서 받아오기
const getDoc = async () => {
  // console.log(docStore.doc_num);
  let result = await axios(
    `/api/document/getDoc/${docStore.doc_num}`,
  ).catch((err) => console.error(err));
  doc.value = result.data.result[0];
  // console.log(result.data);
  docStore.setInfo({ doc_num: doc.value.doc_num, writer: doc.value.writer_id });
};

//신청서 양식받아오기
const getForm = async () => {
  // console.log(doc.value);
  const result = await axios.get(
    `/api/form/getForm/${doc.value.form_ver}`,
  );
  // console.log(result);
  formData.value = result.data.form;

  // formData.value.forEach((bcategory) => {
  //   // console.group(bcategory);
  //   bcategory.scategory.forEach((scategory) => {
  //     // console.log(scategory);
  //     scategory.questions.forEach((question) => {
  //       // console.log(question);
  //       userAnswers.value[question.question_num] = {
  //         type: question.response,
  //         response: "",
  //       };
  //     });
  //   });
  // });
};
//신청서 응답 받아오기
const getResp = async () => {
  const result = await axios.get(
    `/api/document/getResp/${doc.value.doc_num}`,
  );
  // console.log(result.data.response);
  for (const key in result.data.response) {
    if (!Object.hasOwn(result.data.response, key)) continue;

    userAnswers.value[key] = result.data.response[key];
  }
};
// const gotodoc = async (docno) => {
//   router.push({ path: "info", query: { no: docno } });
// };

onBeforeMount(async () => {
  //비정상접근(서류번호를 안가져 온 경우)돌려보낸다
  if (!docStore.doc_num) {
    router.back();
    return;
  }
  await getDoc();
  await getForm();
  await getResp();
  priorityData();
});
</script>

<template>
  <div class="container-fluid pt-3 pb-3 work-layout">
    <div class="work-container">
      <div class="left">
        <!-- <RouterView name="left" /> -->
        <div class="top-actions" v-if="prioritydb?.priority_approved == 'd2'">
          <button
            @click="gorepresentative()"
            class="tab-pill action-pill"
            :class="{ active: isActiveTab('representative') }"
          >
            담당자 변경
          </button>
          <button
            @click="gopriority()"
            class="tab-pill action-pill"
            :class="{ active: isActiveTab('priority') }"
          >
            우선순위 선택
          </button>
        </div>
        <div class="top-actions" v-else>
          <button
            @click="gorepresentative()"
            class="tab-pill action-pill"
            :class="{ active: isActiveTab('representative') }"
          >
            담당자 변경
          </button>
          <button
            @click="gopriority()"
            class="tab-pill action-pill"
            :class="{ active: isActiveTab('priority') }"
          >
            우선순위 선택
          </button>
        </div>

        <div class="tab-menu">
          <button
            @click="gorecord()"
            class="tab-pill"
            :class="{ active: isActiveTab('record') }"
          >
            상담기록
          </button>
          <button
            @click="goplan()"
            class="tab-pill"
            :class="{ active: isActiveTab('plan') }"
          >
            지원 계획서
          </button>
          <button
            @click="goresult()"
            class="tab-pill"
            :class="{ active: isActiveTab('result') }"
          >
            지원 결과서
          </button>
        </div>

        <div class="application-card card shadow-lg border-0 border-radius-xl">
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex justify-content-between align-items-center"
          >
            <span class="title text-white fw-bold">지원신청서</span>
            <span class="text-xs text-white opacity-8">
              {{ formatDate(doc.write_date) }} 작성
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">이름:{{ doc.sup_name }}</div>
            <div class="info-item">보호자:{{ doc.writer_name }}</div>
            <div class="info-item">장애유형: 발달장애</div>
            <div class="info-item">성별:{{ doc.gender }}</div>
            <div class="info-item">대기 단계: {{ doc.progress }}</div>
            <div class="info-item">생년월일:{{ formatDate(doc.birthday) }}</div>
            <div class="info-item">담당자:{{ doc.manager_name }}</div>
          </div>
          <div class="date-stamp text-xs text-secondary mt-2">
            작성자: {{ doc.writer_name }} · 담당자:
            {{ doc.manager_name || "-" }}
          </div>

          <div class="content-area mt-4">
            <div v-if="Object.keys(userAnswers).length" class="form-sections">
              <section
                v-for="(big, bIdx) in formData"
                :key="big.bcategory"
                class="big-section"
              >
                <h2 class="big-title">
                  <span class="big-title-num">{{ bIdx + 1 }}</span>
                  {{ big.bcategory }}
                </h2>

                <div
                  v-for="(small, sIdx) in big.scategory"
                  :key="small.scategory"
                  class="small-group"
                >
                  <h3 class="small-title">
                    <span class="small-title-badge"
                      >{{ bIdx + 1 }}-{{ sIdx + 1 }}</span
                    >
                    {{ small.scategory }}
                  </h3>

                  <div
                    v-for="(q, qIdx) in small.questions"
                    :key="q.question_num"
                    class="question-card"
                  >
                    <p class="question-text">
                      <span class="q-num">{{ qIdx + 1 }}.</span>
                      {{ q.question }}
                    </p>

                    <div class="answer-area">
                      <div v-if="q.options.length > 0" class="radio-group">
                        <label
                          v-for="opt in q.options"
                          :key="opt.exam_num"
                          class="radio-item"
                        >
                          <input
                            type="radio"
                            :name="'q-' + q.question_num"
                            :value="opt.exam_num"
                            v-model="userAnswers[q.question_num]"
                            :disabled="true"
                          />
                          <span class="radio-label">{{ opt.value }}</span>
                        </label>
                      </div>

                      <div v-else class="text-group">
                        <textarea
                          v-model="userAnswers[q.question_num]"
                          placeholder="답변을 입력해주세요."
                          readonly
                          class="answer-textarea"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <div class="bottom-actions mt-3">
            <button class="btn btn-sm bg-gradient-dark text-white px-3">
              수정기록
            </button>
            <div class="right-group">
              <button class="btn btn-sm bg-gradient-info text-white px-3">
                수정
              </button>
              <button class="btn btn-sm bg-gradient-danger text-white px-3">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <RouterView name="right" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.work-layout {
  background-color: var(--app-surface-muted);
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.work-container {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.left,
.right {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 500px;
}

.top-actions,
.tab-menu {
  display: flex;
  gap: 8px;
}

.top-actions {
  margin-bottom: 10px;
}

.tab-menu {
  margin-bottom: 16px;
}

.action-pill {
  flex: 0 0 auto;
  white-space: nowrap;
}

.tab-pill {
  flex: 1;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background-color: var(--app-surface);
  font-size: 0.85rem;
  font-weight: 600;
  color: #67748e;
  text-align: center;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  border-color: var(--app-accent);
  color: var(--app-accent);
  background-color: rgba(var(--app-accent-rgb), 0.06);
}

.tab-pill.active {
  border-color: var(--app-accent);
  background-color: rgba(var(--app-accent-rgb), 0.12);
  color: var(--app-accent);
}
.application-card {
  background: var(--app-surface);
  padding: 18px 18px 20px;
  flex-grow: 1;
  position: relative;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.content-area {
  padding: 1rem;
  border: 1px solid var(--app-border-muted);
  border-radius: 12px;
  background: var(--app-surface-muted);
  max-height: 60vh;
  overflow-y: auto;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 대분류 섹션 */
.big-section {
  background: var(--app-surface);
  border: 1px solid var(--app-border-muted);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--app-shadow-sm);
}

.big-title {
  margin: 0;
  padding: 0.75rem 1.25rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--app-surface);
  background: var(--app-gradient-success);
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.big-title-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.35rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6px;
}

/* 소분류 그룹 */
.small-group {
  padding: 0 1.25rem 1rem;
  border-bottom: 1px solid var(--app-border-muted);
}

.small-group:last-child {
  border-bottom: none;
  padding-bottom: 0.5rem;
}

.small-title {
  margin: 0.5rem 0 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--app-text);
  background: var(--app-success-bg);
  border-left: 4px solid var(--app-accent);
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.small-title-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--app-accent);
  background: var(--app-surface);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}

/* 질문 카드 */
.question-card {
  margin-top: 0.75rem;
  padding: 1rem 1rem 1rem 1.25rem;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border-muted);
  border-radius: 10px;
  border-left: 4px solid var(--app-scrollbar-thumb);
}

.question-text {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--app-text-muted);
  line-height: 1.5;
}

.q-num {
  display: inline-block;
  min-width: 1.5em;
  font-weight: 700;
  color: var(--app-accent);
}

.answer-area {
  margin-left: 0.25rem;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
}

.radio-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--app-text-muted);
  cursor: default;
}

.radio-item input {
  margin: 0;
  accent-color: var(--app-accent);
}

.radio-label {
  user-select: none;
}

.text-group .answer-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid var(--app-border-muted);
  border-radius: 8px;
  background: var(--app-surface);
  resize: vertical;
}

.text-group .answer-textarea:focus {
  outline: none;
  border-color: var(--app-accent);
  box-shadow: var(--app-focus-ring-sm);
}

.content-area::-webkit-scrollbar {
  width: 6px;
}
.content-area::-webkit-scrollbar-thumb {
  background-color: var(--app-scrollbar-thumb);
  border-radius: 10px;
}
.content-area::-webkit-scrollbar-track {
  background-color: var(--app-scrollbar-track);
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

/* 오른쪽 패널 스타일 */
.right-panel {
  flex: 1;
  background-color: var(--app-scrollbar-track);
  border: 1px solid var(--app-scrollbar-thumb);
  padding: 20px;
}

/* 공통 버튼 스타일 */
button {
  cursor: pointer;
}

.badge {
  background: var(--app-warning-end);
  color: white;
  padding: 0 4px;
  font-size: 0.7rem;
  border-radius: 2px;
}
</style>
