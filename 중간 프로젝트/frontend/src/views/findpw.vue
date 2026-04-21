<template>
  <div class="findpw-layout" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="findpw-container">
      <div
        class="findpw-card card shadow-lg border-0 border-radius-xl overflow-hidden"
      >
        <div
          class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center"
        >
          <i class="material-icons opacity-10 me-2">lock_reset</i>
          <span class="title text-white fw-bold">비밀번호 재설정</span>
        </div>

        <div class="card-body p-4">
          <form @submit.prevent="handleSendAuthEmail">
            <div class="mb-4">
              <label
                class="form-label text-xs fw-bolder mb-1 text-secondary"
                for="findpw-userid"
                >아이디</label
              >
              <material-input
                id="findpw-userid"
                v-model="userId"
                variant="static"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div class="mb-4">
              <label
                class="form-label text-xs fw-bolder mb-1 text-secondary"
                for="findpw-email"
                >이메일</label
              >
              <material-input
                id="findpw-email"
                v-model="userEmail"
                type="email"
                variant="static"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <button
              type="submit"
              class="btn btn-sm w-100 bg-gradient-success text-white mb-3"
              :disabled="isSending"
            >
              {{ isSending ? "전송 중..." : "인증메일 전송" }}
            </button>

            <div class="pt-3 border-top border-light">
              <router-link to="/find-id" class="findpw-link">
                <i
                  class="material-icons align-middle me-1"
                  style="font-size: 1rem"
                  >search</i
                >
                아이디 찾으러 가기
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import MaterialInput from "@/components/MaterialInput.vue";
import bgImage from "@/assets/img2.png";

const router = useRouter();
const userId = ref("");
const userEmail = ref("");
const isSending = ref(false);

const handleSendAuthEmail = async () => {
  if (!userId.value || !userEmail.value) {
    alert("아이디와 이메일을 모두 입력해주세요.");
    return;
  }

  isSending.value = true;

  try {
    const response = await axios.post("/api/user/forgot-password", {
      userId: userId.value,
      userEmail: userEmail.value,
    });

    if (response.data.success) {
      alert("정보 확인 완료! 인증 메일이 발송되었습니다.\n(유효시간: 5분)");
      router.push("/sign-in");
    } else {
      alert(response.data.message || "입력하신 정보가 일치하지 않습니다.");
    }
  } catch (error) {
    console.error("메일 발송 에러:", error);
    const errorMessage =
      error.response?.status === 404
        ? "서버 경로를 찾을 수 없습니다. (주소: /user/forgot-password 확인 필요)"
        : error.response?.data?.message ||
          "오류가 발생했습니다. 다시 시도해주세요.";
    alert(errorMessage);
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
.findpw-layout {
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

.findpw-container {
  width: 100%;
  max-width: 420px;
}

.findpw-card {
  background: var(--app-surface);
  position: relative;
}

.findpw-card .card-body {
  padding: 1.5rem 1.25rem;
}

.findpw-link {
  font-size: 0.875rem;
  color: #6c757d;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.findpw-link:hover {
  color: var(--app-accent);
  text-decoration: underline;
}

button {
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
