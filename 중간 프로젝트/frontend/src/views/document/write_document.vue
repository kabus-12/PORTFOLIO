<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useMemberStore } from "@/store/member";
import { useRouter } from "vue-router";
import axios from "axios";
const router = useRouter();
const memberStore = useMemberStore(); //pinia에서 로그인 정보 스토어
const sups = ref([]); //지원자 목록
const sup_num = ref("");
const userAnswers = ref({}); //유저답변 기록
const formData = ref([]); //설문지 양식
let formVer = ""; //설문지 버전
//지원자 목록을 가져온다
const getList = async () => {
  const id = (memberStore.id ?? "").toString().trim();
  const result = await axios.get(`/api/support/list`, {
    // id가 비어있거나 undefined면 아예 파라미터를 보내지 않음(목록 0건 방지)
    params: id ? { id } : undefined,
  });
  if (result.data?.retCode === "OK") {
    sups.value = Array.isArray(result.data.result) ? result.data.result : [];
  } else {
    sups.value = [];
  }
};
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ko-KR");
  // 결과: "2026. 2. 22."
};
const gender = computed((gender) => {
  if (!selectedUser.value) return ""; // selectedUser가 없을 때의 예외 처리

  if (selectedUser.value.gender == "f1") {
    return "남자";
  } else {
    return "여자";
  }
});
//설문지 양식을 가져온다
const getForm = async () => {
  const result = await axios.get(`/api/form/usageForm`);
  console.log(result);
  formData.value = result.data.form;
  formVer = result.data.ver;
  // console.log(formData.value);
  formData.value.forEach((bcategory) => {
    bcategory.scategory.forEach((scategory) => {
      scategory.questions.forEach((question) => {
        // console.log(question);
        userAnswers.value[question.question_num] = {
          type: question.response,
          response: "",
        };
      });
    });
  });
};
const saveTemp = () => {
  // console.log("임시저장", userAnswers.value);
};
const inputCheck = computed(() => {
  const answers = userAnswers.value;
  if (!answers || Object.keys(answers).length === 0) return true;

  for (const num in answers) {
    const resp = answers[num]?.response;

    // 라디오(번호) / 주관식(문자열) 모두 처리
    if (resp === null || resp === undefined) return true;
    if (typeof resp === "string" && resp.trim() === "") return true;
  }

  return false;
});
const selectedUser = computed(() => {
  return sups.value.find((sup) => {
    if (sup.sup_num == sup_num.value) {
      // console.log(sup);
    }
    return sup.sup_num == sup_num.value;
  });
});
//제출
const submitForm = async () => {
  // console.log(userAnswers.value);
  const surveyData = {
    sup_num: sup_num.value,
    user_id: memberStore.id,
    formVer, // 처음에 서버에서 받았던 그 버전!
    response: userAnswers.value,
  };
  const result = await axios.post(`/api/document/write`, surveyData);
  // console.log(result);
  if (result.data.retCode == "OK") {
    alert("작성완료");
    router.push("/document");
  } else {
    alert("작성실패");
  }
};
//값 초기화
const cancel = () => {
  // console.log(userAnswers.value);
  for (const key in userAnswers.value) {
    userAnswers.value[key].response = "";
  }
};
onBeforeMount(() => {
  getList();
  getForm();
});
</script>
<template>
  <div class="container-fluid pt-2 pb-2 document-write">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">
        <div
          class="card my-4 shadow-lg border-0 border-radius-xl animation-fade-in"
        >
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div
              class="bg-gradient-success shadow-success border-radius-lg pt-4 pb-3"
            >
              <div
                class="d-flex align-items-center justify-content-between px-4"
              >
                <div>
                  <h5 class="text-white mb-0 font-weight-bolder">
                    지원 신청서 작성
                  </h5>
                  <p class="text-white text-xs opacity-9 mb-0">
                    지원자 선택 후 설문을 작성해 제출하세요.
                  </p>
                </div>
                <i class="material-icons text-white opacity-9">description</i>
              </div>
            </div>
          </div>

          <div class="card-body px-4 pb-2">
            <div class="row mb-4">
              <div class="col-md-3">
                <label class="text-xs fw-bold text-success mb-2">지원자</label>
                <select class="form-select" v-model="sup_num">
                  <option value="" disabled selected>
                    담당자를 선택하세요
                  </option>
                  <option
                    v-for="sup in sups"
                    :value="sup.sup_num"
                    :key="sup.sup_num"
                  >
                    {{ sup.sup_name }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="text-xs fw-bold text-dark mb-2">성별</label>
                <div
                  v-if="selectedUser"
                  class="form-control bg-light"
                  style="min-height: 38px; display: flex; align-items: center"
                >
                  {{ gender }}
                </div>
              </div>

              <div class="col-md-3">
                <label class="text-xs fw-bold text-dark mb-2">생년월일</label>
                <div
                  v-if="selectedUser"
                  class="form-control bg-light"
                  style="min-height: 38px; display: flex; align-items: center"
                >
                  {{ formatDate(selectedUser.birthday) }}
                </div>
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <material-button class="btn bg-gradient-success w-100 mb-0">
                  작성시작
                </material-button>
              </div>
            </div>

            <hr class="dark horizontal" />
            <div v-if="Object.keys(userAnswers).length">
              <section
                v-for="big in formData"
                :key="big.bcategory"
                class="big-section"
              >
                <h2 class="big-title">{{ big.bcategory }}</h2>

                <div
                  v-for="small in big.scategory"
                  :key="small.scategory"
                  class="small-group"
                >
                  <h3 class="small-title">▣ {{ small.scategory }}</h3>

                  <div
                    v-for="q in small.questions"
                    :key="q.question_num"
                    class="question-card"
                  >
                    <p class="question-text">
                      <span class="q-num"></span>
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
                            :name="q.question_num"
                            :value="opt.exam_num"
                            v-model="userAnswers[q.question_num].response"
                          />
                          {{ opt.value }}
                        </label>
                      </div>

                      <div v-else class="text-group">
                        <textarea
                          v-model="userAnswers[q.question_num].response"
                          placeholder="답변을 입력해주세요."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <material-button class="btn bg-gradient-dark" @click="saveTemp">
                임시저장
              </material-button>
              <material-button
                class="btn bg-gradient-success"
                @click="submitForm"
                :disabled="inputCheck"
              >
                제출
              </material-button>
              <material-button
                class="btn btn-outline-secondary"
                @click="cancel"
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
<script>
import MaterialButton from "@/components/MaterialButton.vue";

export default {
  name: "tables",
  components: {
    MaterialButton,
  },
};
</script>
<style scoped>
.big-section {
  padding: 8px 0 24px;
}

.big-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--app-text);
  margin: 18px 0 10px;
  padding-left: 2px;
}

.small-group {
  padding: 14px 0 6px;
}

.small-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--app-accent);
  margin: 0 0 12px;
}

.question-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border-muted);
  border-radius: 14px;
  padding: 18px 18px 16px;
  margin-bottom: 12px;
  box-shadow: var(--app-shadow-md);
}

.question-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--app-text);
  margin-bottom: 12px;
}

.answer-area {
  background: var(--app-surface-muted);
  border: 1px dashed var(--app-border);
  border-radius: 12px;
  padding: 12px;
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--app-text-muted);
  background: var(--app-surface);
  border: 1px solid var(--app-border-muted);
  border-radius: 10px;
  padding: 10px 12px;
}

.text-group textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
  background: var(--app-surface);
}

.text-group textarea:focus {
  border-color: var(--app-accent);
  box-shadow: var(--app-focus-ring);
}
</style>
