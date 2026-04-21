<script setup>
import { ref, onBeforeMount, computed } from "vue";
// import { useMemberStore } from "@/store/member";
// import axios from "axios";
// const memberStore = useMemberStore(); //pinia에서 로그인 정보 스토어
import MaterialButton from "@/components/MaterialButton.vue";
import MaterialInput from "@/components/MaterialInput.vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

// export default {
//   name: "tables",
//   components: {
//     MaterialButton,
//     MaterialInput,
//   },
// };
const formData = ref([]); //설문지 양식
const list = ref([]);
const selectedVersion = ref("");
const comment = ref("");
//모든값이 다 들어가있는지 확인
const check = computed(() => {
  return formData.value.some((bcategory) => {
    if (!bcategory.name) return true;

    return bcategory.scategory.some((scategory) => {
      if (!scategory.name) return true;

      return scategory.questions.some((question) => {
        if (!question.question) return true;

        // 옵션 배열 중 하나라도 비어있으면 true
        return question.options.some(
          (option) => option === "" || option === null || option === undefined,
        );
      });
    });
  });
});
//버전목록 가져오기
const getList = async () => {
  const result = await axios.get("/api/form/vers");
  list.value = result.data.result;
  // console.log(result.data.result);
};
//지정한 버전 가지고 오기
const getForm = async () => {
  // console.log(route.params.num);
  const result = await axios.get(`/api/form/getForm/${selectedVersion.value}`);
  console.log(result.data.form);
  // formData.value = result.data.form;
  const newForm = [];
  result.data.form.forEach((bcategory) => {
    const newBig = {
      name: bcategory.bcategory,
      scategory: [],
    };
    newForm.push(newBig);
    bcategory.scategory.forEach((scategory) => {
      const newSmall = {
        name: scategory.scategory,
        questions: [],
      };
      newBig.scategory.push(newSmall);
      scategory.questions.forEach((question) => {
        const newQue = {
          question: question.question,
          type: question.response,
          options: [],
        };
        newSmall.questions.push(newQue);
        question.options.forEach((option) => {
          newQue.options.push(option.value);
        });
      });
    });
    formData.value = newForm;
  });
  // formData.value.forEach((bcategory) => {
  //   console.log(bcategory);
  //   bcategory.scategory.forEach((scategory) => {
  //     console.log(scategory);
  //     scategory.questions.forEach((question) => {
  //       console.log(question);
  //     });
  //   });
  // });
};
//질문추가
const addQuestion = (subCategory) => {
  subCategory.questions.push({
    question: "",
    type: "l1",
    options: [],
  });
};
// 소분류 추가 (특정 대분류 내부에 추가)
const addScategory = (category) => {
  const newSmall = {
    name: "",
    questions: [],
  };
  category.scategory.push(newSmall);
  addQuestion(newSmall);
};

// 대분류 추가
const addBcategory = () => {
  const newBig = {
    name: "",
    scategory: [],
  };
  formData.value.push(newBig);
  addScategory(newBig);
};
//질문삭제
const delQuestion = (small, idx) => {
  console.log(small);
  small.questions.splice(idx, 1);
};
//소분류삭제
const delScategory = (big, idx) => {
  big.scategory.splice(idx, 1);
};
//대분류 삭제
const delBigcategory = (idx) => {
  // console.log(formData.value);
  formData.value.splice(idx, 1);
};

const handleTypeChange = (q) => {
  let count = 0;
  if (q.type == "l2") {
    count = 2;
  } else if (q.type == "l3") {
    count = 5;
  }

  if (count > 0) {
    const currentOptions = q.options || [];
    if (currentOptions.length < count) {
      // 모자란 만큼 빈 문자열 추가
      const added = Array(count - currentOptions.length).fill("");
      q.options = [...currentOptions, ...added];
    }
    if (currentOptions.length > count) {
      const newOpt = [];
      let max = count;
      for (const option of q.options) {
        if (option) {
          newOpt.push(option);
          max--;
        }
        if (max == 0) {
          break;
        }
      }
      while (max > 0) {
        newOpt.push("");
        max--;
      }
      q.options = newOpt;
    }
  } else {
    q.option = [];
  }
};
onBeforeMount(async () => {
  await getList();
  addBcategory();
});
const submitForm = async () => {
  // console.log(formData);
  const result = await axios.post(
    "/api/form/write",
    {
      form: formData.value,
      comment: comment.value,
    },
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  if (result.data.retCode == "OK") {
    alert("등록완료 되었습니다");
    router.push(`/form/view/${result.data.result}`);
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
            <h6 class="mb-0 text-white font-weight-bolder">신청서 양식 작성</h6>
          </div>
          <div class="card-body px-4 pb-2">
            <div class="row mb-4 border-bottom pb-4">
              <div class="col-md-4">
                <label class="form-label fw-bold text-secondary text-xs"
                  >양식 버전 불러오기</label
                >
                <div class="d-flex gap-2">
                  <select
                    v-model="selectedVersion"
                    class="form-select border p-2 border-radius-lg"
                  >
                    <option
                      v-for="ver in list"
                      :key="ver.id"
                      :value="ver.form_ver"
                    >
                      {{ ver.form_ver }}
                    </option>
                  </select>
                  <material-button
                    size="sm"
                    variant="outline"
                    color="success"
                    class="mb-0 text-nowrap"
                    @click="getForm"
                    >불러오기</material-button
                  >
                </div>
              </div>
              <div class="col-md-8">
                <label class="form-label fw-bold text-secondary text-xs"
                  >양식 설명 (코멘트)</label
                >
                <material-input
                  v-model="comment"
                  variant="static"
                  placeholder="이 신청서 양식에 대한 설명을 입력하세요 (예: 2026년 상반기 정기 신청용)"
                />
              </div>
            </div>
          </div>
          <div class="card-body px-4 pb-2">
            <div v-if="Object.keys(formData).length" class="form-sections">
              <section
                v-for="(big, bIdx) in formData"
                :key="'big-' + bIdx"
                class="big-section"
              >
                <h2 class="big-title">
                  <span class="big-title-num">{{ bIdx + 1 }}</span>
                  대분류
                </h2>
                <div class="big-section-body">
                  <div class="big-section-actions">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="delBigcategory(bIdx)"
                      :disabled="formData.length <= 1"
                    >
                      지우기
                    </button>
                  </div>
                  <material-input
                    variant="static"
                    placeholder="대분류명을 입력하세요"
                    v-model="big.name"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-add-sub"
                    @click="addScategory(big)"
                  >
                    소분류 추가
                  </button>
                </div>

                <div
                  v-for="(small, sIdx) in big.scategory"
                  :key="'small-' + bIdx + '-' + sIdx"
                  class="small-group"
                >
                  <h3 class="small-title">
                    <span class="small-title-badge"
                      >{{ bIdx + 1 }}-{{ sIdx + 1 }}</span
                    >
                    소분류
                  </h3>
                  <div class="small-group-body">
                    <div class="small-group-actions">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        :disabled="big.scategory.length <= 1"
                        @click="delScategory(big, sIdx)"
                      >
                        지우기
                      </button>
                    </div>
                    <material-input
                      variant="static"
                      placeholder="소분류명을 입력하세요"
                      v-model="small.name"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-add-question"
                      @click="addQuestion(small)"
                    >
                      질문 추가
                    </button>
                  </div>
                  <div
                    v-for="(q, qIdx) in small.questions"
                    :key="'q-' + qIdx"
                    class="question-card"
                  >
                    <div class="question-card-inner">
                      <div class="type-select-area">
                        <span class="q-num">{{ qIdx + 1 }}.</span>
                        <label
                          class="form-label fw-bold text-secondary text-xs mb-0"
                          >응답 타입</label
                        >
                        <select
                          v-model="q.type"
                          @change="handleTypeChange(q)"
                          class="form-select form-select-sm type-select"
                        >
                          <option value="l1">자유 응답형</option>
                          <option value="l2">2지선다형</option>
                          <option value="l3">5지선다형</option>
                        </select>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary"
                          :disabled="small.questions.length <= 1"
                          @click="delQuestion(small, qIdx)"
                        >
                          지우기
                        </button>
                      </div>
                      <div class="question-input-wrap">
                        <material-input
                          v-model="q.question"
                          variant="static"
                          placeholder="질문을 입력하세요"
                        />
                      </div>
                      <div v-if="q.type != 'l1'" class="options-container">
                        <div
                          v-for="(opt, oIdx) in q.options"
                          :key="oIdx"
                          class="option-input-group"
                        >
                          <span class="option-label"
                            >{{ oIdx + 1 }}번 선택지</span
                          >
                          <input
                            v-model="q.options[oIdx]"
                            type="text"
                            class="form-control form-control-sm option-input"
                            :placeholder="oIdx + 1 + '번 내용을 입력하세요'"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-add-big mb-3"
              @click="addBcategory"
            >
              대분류 추가
            </button>
            <div class="bottom-actions d-flex justify-content-end gap-2 mt-4">
              <material-button
                color="success"
                variant="gradient"
                class="mb-0"
                @click="submitForm"
                :disabled="check"
              >
                제출
              </material-button>
              <material-button
                color="secondary"
                variant="outline"
                class="mb-0"
                @click="router.push('/list/form')"
              >
                취소
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

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

button {
  cursor: pointer;
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

.big-section-body {
  padding: 1rem 1.25rem;
}

.big-section-actions {
  margin-bottom: 0.75rem;
}

.btn-add-sub {
  margin-top: 0.75rem;
  background: var(--app-gradient-success);
  color: var(--app-surface);
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-add-sub:hover {
  opacity: 0.9;
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

.small-group-body {
  margin-bottom: 0.5rem;
}

.small-group-actions {
  margin-bottom: 0.5rem;
}

.btn-add-question {
  margin-top: 0.5rem;
  background: var(--app-gradient-success);
  color: var(--app-surface);
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-add-question:hover {
  opacity: 0.9;
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

.question-card-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-select-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-select-area .q-num {
  font-weight: 700;
  color: var(--app-accent);
  min-width: 1.5em;
}

.type-select-area .form-label {
  margin: 0 0.25rem 0 0;
}

.type-select {
  width: auto;
  min-width: 120px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.question-input-wrap {
  margin-left: 0.25rem;
}

.options-container {
  margin-left: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.option-label {
  font-size: 0.875rem;
  color: var(--app-text-secondary);
  min-width: 5rem;
}

.option-input {
  flex: 1;
  min-width: 180px;
  border: 1px solid var(--app-border-muted);
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
}

.option-input:focus {
  border-color: var(--app-accent);
  outline: none;
  box-shadow: var(--app-focus-ring-sm);
}

.btn-add-big {
  background: var(--app-gradient-success);
  color: var(--app-surface);
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-add-big:hover {
  opacity: 0.9;
}

.form-control,
.form-select {
  border: 1px solid var(--app-border) !important;
}
.bg-light {
  background-color: var(--app-surface-muted) !important;
}
</style>
