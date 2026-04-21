<script setup>
import { ref, onBeforeMount, computed } from "vue";
// import { useMemberStore } from "@/store/member";
// import axios from "axios";
// const memberStore = useMemberStore(); //pinia에서 로그인 정보 스토어
import MaterialButton from "@/components/MaterialButton.vue";
// import MaterialInput from "@/components/MaterialInput.vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

// export default {
//   name: "tables",
//   components: {
//     MaterialButton,
//     MaterialInput,
//   },
// };
const route = useRoute();
const router = useRouter();
// console.log(`route:${route.params.num}`);
const formData = ref([]); //설문지 양식
const info = ref({});
const usage = computed(() => {
  return info.value.usage == "사용중";
});
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ko-KR");
  // 결과: "2026. 2. 22."
};
const getForm = async () => {
  // console.log(route.params.num);
  const result = await axios.get(`/api/form/getForm/${route.params.num}`);
  // console.log(result.data);
  formData.value = result.data.form;

  // formData.value.forEach((bcategory) => {
  //   console.group(bcategory);
  //   bcategory.scategory.forEach((scategory) => {
  //     console.log(scategory);
  //     scategory.questions.forEach((question) => {
  //       console.log(question);
  //     });
  //   });
  // });
};
const getInfo = async () => {
  const result = await axios.get(`/api/form/getInfo/${route.params.num}`);
  // console.log(result.data);
  info.value = result.data.info;
  console.log(info.value);
};
onBeforeMount(async () => {
  await getInfo();
  await getForm();
});
const use = async () => {
  const result = await axios.patch(`/api/form/usage/${route.params.num}`);
  if (result.data.retCode == "OK") {
    alert("사용등록 완료");
    router.push("/form");
  }
};
//값 초기화
</script>
<template>
  <div class="container-fluid pt-2 pb-2 work-layout">
    <div class="work-container">
      <div class="right">
        <div class="application-card card shadow-lg border-0 border-radius-xl">
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg"
          >
            <h6 class="mb-0 text-white font-weight-bolder">신청서 양식 조회</h6>
          </div>
          <div class="card-body px-4 pb-2">
            <div
              class="info-section bg-gray-100 border-radius-lg p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center"
            >
              <div class="d-flex gap-4">
                <div class="info-item">
                  <span
                    class="text-xs font-weight-bold text-uppercase text-muted d-block"
                    >버전명</span
                  >
                  <span class="text-sm font-weight-bolder">{{
                    info.form_ver
                  }}</span>
                </div>
                <div class="info-item">
                  <span
                    class="text-xs font-weight-bold text-uppercase text-muted d-block"
                    >등록일</span
                  >
                  <span class="text-sm font-weight-bolder">{{
                    formatDate(info.writedate)
                  }}</span>
                </div>
              </div>
              <div class="info-item flex-grow-1 ms-lg-5 mt-2 mt-lg-0">
                <span
                  class="text-xs font-weight-bold text-uppercase text-muted d-block"
                  >코멘트</span
                >
                <span class="text-sm italic text-secondary">{{
                  info.comment
                }}</span>
              </div>
            </div>
          </div>

          <div class="card-body px-4 pb-2">
            <div class="content-area">
              <div v-if="Object.keys(formData).length" class="form-sections">
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
                              disabled="true"
                            />
                            <span class="radio-label">{{ opt.value }}</span>
                          </label>
                        </div>

                        <div v-else class="text-group">
                          <textarea
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
            <div class="d-flex justify-content-end gap-2 mt-4">
              <material-button
                color="success"
                variant="gradient"
                class="mb-0"
                @click="use"
                :disabled="usage"
              >
                사용
              </material-button>
            </div>
          </div>
        </div>
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

.right {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.application-card {
  background: var(--app-surface);
  padding: 18px 18px 20px;
  position: relative;
}

.form-control,
.form-select {
  border: 1px solid var(--app-border) !important;
}
.bg-light {
  background-color: var(--app-surface-muted) !important;
}
.content-area {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid var(--app-border-muted);
  border-radius: var(--app-radius-lg);
  background: var(--app-surface-muted);
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
  border-radius: var(--app-radius-lg);
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
  border-radius: var(--app-radius-md);
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
  padding: 1rem;
  font-size: 0.9rem;
  border: 1px solid var(--app-border-muted);
  border-radius: var(--app-radius-lg);
  background: var(--app-surface-muted);
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
  border-radius: var(--app-radius-lg);
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
  border-radius: var(--app-radius-md);
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
</style>
