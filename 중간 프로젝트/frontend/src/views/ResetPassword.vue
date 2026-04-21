<template>
  <div
    class="page-header align-items-start min-vh-100 reset-bg"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <span class="mask bg-gradient-dark opacity-6"></span>
    <div
      class="container d-flex justify-content-center align-items-center min-vh-100"
    >
      <div class="login-card-box">
        <div class="header-bar bg-gradient-success shadow-success">
          <h4 class="text-white font-weight-bolder mb-0">새 비밀번호 설정</h4>
        </div>

        <div class="login-content">
          <form @submit.prevent="handleResetPassword">
            <div class="row-input mb-4">
              <label class="row-label">새 비밀번호</label>
              <input
                type="password"
                v-model="newPassword"
                class="custom-input"
                placeholder="새 비밀번호 입력"
                required
              />
            </div>

            <div class="row-input mb-4">
              <label class="row-label">비밀번호 확인</label>
              <input
                type="password"
                v-model="confirmPassword"
                class="custom-input"
                placeholder="비밀번호 다시 입력"
                required
              />
            </div>

            <div class="text-center mt-4">
              <button
                type="submit"
                class="btn-success-gradient w-100"
                :disabled="isUpdating"
              >
                {{ isUpdating ? "변경 중..." : "비밀번호 변경하기" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"; // Vue의 반응형 데이터와 마운트 시점 기능을 가져옵니다.
import { useRoute, useRouter } from "vue-router"; // 현재 주소 정보와 페이지 이동 기능을 가져옵니다.
import axios from "axios"; // 서버와 통신하기 위한 라이브러리를 가져옵니다.
import bgImage from "@/assets/img2.png";

const route = useRoute(); // 현재 URL의 쿼리(token 등)를 읽기 위해 생성합니다.
const router = useRouter(); // 가입 후 이동 등을 처리하기 위해 생성합니다.
const newPassword = ref(""); // 사용자가 입력한 새 비밀번호를 담는 변수입니다.
const confirmPassword = ref(""); // 확인을 위해 다시 입력한 비밀번호를 담는 변수입니다.
const token = ref(""); // 메일 링크에서 전달된 본인 인증용 토큰을 저장합니다.
const isUpdating = ref(false); // 현재 서버에 데이터를 보내는 중인지 상태를 관리합니다.

// 화면이 처음 나타날 때 실행됩니다.
onMounted(() => {
  token.value = route.query.token; // 주소창의 ?token=값 부분을 읽어와 변수에 넣습니다.

  // if (!token.value) {
  //   // 만약 토큰이 없다면 잘못된 경로로 들어온 것입니다.
  //   alert("메일의 링크를 다시 확인해주세요."); // 경고 메시지를 보여줍니다.
  //   router.push("/login"); // 로그인 페이지로 쫓아냅니다.
  // }
});

// 비밀번호 변경 버튼을 눌렀을 때 실행되는 함수입니다.
const handleResetPassword = async () => {
  // 두 번 입력한 비밀번호가 서로 같은지 먼저 검사합니다.
  if (newPassword.value !== confirmPassword.value) {
    alert("비밀번호가 서로 일치하지 않습니다."); // 다르면 경고창을 띄우고,
    return; // 함수를 여기서 끝냅니다.
  }

  isUpdating.value = true; // 통신 시작 시 상태를 true로 바꿔 버튼을 비활성화합니다.

  try {
    // 백엔드 서버에 토큰과 새 비밀번호를 실어서 보냅니다.
    const response = await axios.post(
      "/api/user/reset-password-confirm",
      {
        token: token.value, // 인증용 토큰입니다.
        newPassword: newPassword.value, // 변경할 비밀번호입니다.
      },
    );

    if (response.data.success) {
      // 서버에서 성공적으로 변경했다는 응답이 오면 실행합니다.
      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요."); // 성공 알림을 줍니다.
      router.push("/sign-in"); // 다시 로그인하도록 로그인 페이지로 이동시킵니다.
    } else {
      // 서버는 연결됐으나 토큰 만료 등의 이유로 실패한 경우입니다.
      alert(response.data.message || "비밀번호 변경에 실패했습니다."); // 서버가 보낸 메시지를 띄웁니다.
    }
  } catch (error) {
    // 서버 연결이 안 되거나 통신 에러가 발생한 경우입니다.
    console.error("비밀번호 변경 에러:", error); // 로그에 에러를 남깁니다.
    alert(error.response?.data?.message || "서버 오류가 발생했습니다."); // 오류 원인을 알립니다.
  } finally {
    isUpdating.value = false; // 성공하든 실패하든 마지막에는 버튼 비활성화를 풉니다.
  }
};
</script>

<style scoped>
/* 배경 이미지 및 레이아웃 설정입니다. */
.reset-bg {
  background-size: cover;
  position: relative;
  background-repeat: no-repeat; /* 이미지 반복 방지 */
  background-size: cover; /* 이미지가 요소에 꽉 차도록 비율 조정 */
  background-position: center; /* 이미지를 중앙에 배치 */
}

/* 카드 상자의 모양과 그림자 설정입니다. */
.login-card-box {
  width: 100%;
  max-width: 500px;
  background: var(--app-surface);
  border-radius: var(--app-radius-lg);
  box-shadow: var(--app-shadow-modal);
  position: relative;
  z-index: 5;
}

/* 제목이 들어가는 상단 바 디자인입니다. */
.header-bar {
  margin: -25px 20px 0 20px;
  padding: 20px 0;
  border-radius: 10px;
  text-align: center;
  background: var(--app-gradient-success);
}

/* 내부 콘텐츠 여백입니다. */
.login-content {
  padding: 40px 40px 30px 40px;
}

/* 입력 라벨과 필드를 한 줄로 배치합니다. */
.row-input {
  display: flex;
  align-items: center;
}

/* 라벨의 너비와 폰트 스타일입니다. */
.row-label {
  width: 120px;
  font-weight: bold;
  color: var(--app-text);
  margin-bottom: 0;
}

/* 입력창 테두리와 디자인입니다. */
.custom-input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--app-border);
  border-radius: 5px;
  outline: none;
}

/* 입력창을 클릭했을 때 강조 색상입니다. */
.custom-input:focus {
  border-color: var(--app-accent);
}

/* 하단 버튼의 그라데이션 및 글자 스타일입니다. */
.btn-success-gradient {
  background: var(--app-gradient-success);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

/* 버튼이 비활성화되었을 때 투명하게 만듭니다. */
.btn-success-gradient:disabled {
  opacity: 0.6;
}
</style>
