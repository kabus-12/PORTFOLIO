<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import MaterialInput from "@/components/MaterialInput.vue";
import bgImage from "@/assets/img2.png";

const router = useRouter();

const userName = ref("");
const userEmail = ref("");
const foundId = ref("");
const isSearchDone = ref(false);

const handleFindId = async () => {
  if (!userName.value || !userEmail.value) {
    alert("이름과 이메일을 입력해주세요.");
    return;
  }
  try {
    const res = await axios.post("/api/user/find-id", {
      userName: userName.value,
      userEmail: userEmail.value,
    });

    if (res.data.success) {
      foundId.value = res.data.userId;
    } else {
      foundId.value = "none";
    }
    isSearchDone.value = true;
  } catch (err) {
    console.error("아이디 찾기 에러:", err);
    alert("서버 통신 중 오류가 발생했습니다.");
  }
};
</script>

<template>
  <div class="findid-layout" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="findid-container">
      <div
        class="findid-card card shadow-lg border-0 border-radius-xl overflow-hidden"
      >
        <div
          class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center"
        >
          <i class="material-icons opacity-10 me-2">person_search</i>
          <span class="title text-white fw-bold">아이디 찾기</span>
        </div>

        <div class="card-body p-4">
          <div v-if="!isSearchDone">
            <div class="mb-4">
              <label
                class="form-label text-xs fw-bolder mb-1 text-secondary"
                for="find-name"
                >성함</label
              >
              <material-input
                id="find-name"
                v-model="userName"
                variant="static"
                placeholder="등록된 이름을 입력하세요"
              />
            </div>
            <div class="mb-4">
              <label
                class="form-label text-xs fw-bolder mb-1 text-secondary"
                for="find-email"
                >이메일 주소</label
              >
              <material-input
                id="find-email"
                v-model="userEmail"
                type="email"
                variant="static"
                placeholder="example@mail.com"
              />
            </div>
            <button
              type="button"
              class="btn btn-sm w-100 bg-gradient-success text-white mb-3"
              @click="handleFindId"
            >
              아이디 찾기
            </button>
            <button
              type="button"
              class="btn btn-sm w-100 btn-outline-secondary"
              @click="router.push({ name: 'SignIn' })"
            >
              이전 화면으로 돌아가기
            </button>
          </div>

          <div v-else class="text-center">
            <div class="result-icon mb-3">
              <i v-if="foundId !== 'none'" class="material-icons text-success"
                >check_circle</i
              >
              <i v-else class="material-icons text-warning">error_outline</i>
            </div>

            <div class="result-box mb-4">
              <div v-if="foundId !== 'none'">
                <p class="text-secondary text-sm mb-1">
                  요청하신 아이디 정보입니다.
                </p>
                <p class="found-id-text mb-0">{{ foundId }}</p>
              </div>
              <div v-else>
                <p class="fw-bold text-dark mb-1">일치하는 정보가 없습니다.</p>
                <p class="text-xs text-secondary mb-0">
                  입력하신 이름과 이메일을 다시 확인해 주세요.
                </p>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm flex-grow-1 bg-gradient-success text-white"
                @click="router.push({ name: 'SignIn' })"
              >
                로그인하기
              </button>
              <button
                type="button"
                class="btn btn-sm flex-grow-1 btn-outline-success"
                @click="router.push({ name: 'FindPw' })"
              >
                비밀번호 찾기
              </button>
            </div>
            <p
              v-if="foundId === 'none'"
              class="mt-4 text-xs text-secondary mb-0"
            >
              아직 회원이 아니신가요?
              <router-link :to="{ name: 'SignUp' }" class="findid-link"
                >회원가입</router-link
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.findid-layout {
  background-color: var(--app-surface-muted);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-repeat: no-repeat; /* 이미지 반복 방지 */
  background-size: cover; /* 이미지가 요소에 꽉 차도록 비율 조정 */
  background-position: center; /* 이미지를 중앙에 배치 */
}

.findid-container {
  width: 100%;
  max-width: 420px;
}

.findid-card {
  background: var(--app-surface);
  position: relative;
}

.findid-card .card-body {
  padding: 1.5rem 1.25rem;
}

.result-icon .material-icons {
  font-size: 3.5rem;
}

.result-box {
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border-muted);
  border-radius: 12px;
  padding: 1.5rem 1.25rem;
}

.found-id-text {
  color: var(--app-accent);
  font-weight: 700;
  font-size: 1.1rem;
}

.findid-link {
  color: var(--app-accent);
  font-weight: 600;
  text-decoration: none;
}

.findid-link:hover {
  color: #1aae4a;
  text-decoration: underline;
}

button {
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
}
</style>
