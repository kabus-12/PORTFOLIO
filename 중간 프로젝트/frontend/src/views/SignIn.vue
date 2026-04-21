<script setup>
/* eslint-disable */
import { ref, onBeforeMount, onBeforeUnmount } from "vue"; // Vue에서 상태 관리와 생명주기 훅을 가져옵니다.
import { useStore } from "vuex"; // 기존의 Vuex 상태 관리를 사용하기 위해 가져옵니다.
import { useRouter } from "vue-router"; // 다른 페이지로 이동하기 위한 라우터 도구를 가져옵니다.
import axios from "axios"; // 서버와 데이터를 주고받기 위한 통신 라이브러리를 가져옵니다.
import MaterialInput from "@/components/MaterialInput.vue"; // 디자인된 입력창 컴포넌트를 가져옵니다.
import bgImage from "@/assets/img2.png";
// Pinia 스토어를 가져옵니다. (이미지 경로인 @/store/member로 맞춤)
import { useMemberStore } from "@/store/member";

const store = useStore(); // Vuex 저장소 인스턴스를 사용 가능하게 만듭니다.
const router = useRouter(); // 라우터 인스턴스를 생성하여 이동 함수를 준비합니다.
const memberStore = useMemberStore(); // Pinia 스토어 인스턴스를 생성합니다.

const userId = ref(""); // 사용자가 입력창에 쓴 아이디를 담는 변수입니다.
const password = ref(""); // 사용자가 입력창에 쓴 비밀번호를 담는 변수입니다.
const loginError = ref(false); // 로그인 실패 시 화면에 경고를 띄울지 결정하는 상태값입니다.

// 실제 로그인을 처리하는 함수입니다.
const handleLogin = async () => {
  if (!userId.value || !password.value) {
    // 아이디나 비밀번호가 비어있는지 확인합니다.
    loginError.value = true; // 에러 상태를 참으로 만듭니다.
    alert("아이디와 비밀번호를 모두 입력해주세요."); // 알림창을 띄웁니다.
    return; // 더 이상 진행하지 않고 중단합니다.
  }

  try {
    // 서버의 로그인 API 주소로 사용자가 입력한 정보를 보냅니다.
    const response = await axios.post("/api/user/login", {
      user_id: userId.value, // 입력한 아이디입니다.
      user_password: password.value, // 입력한 비밀번호입니다.
    });

    if (response.data && response.data.success) {
      // 서버 응답이 성공(success)일 때 실행합니다.
      loginError.value = false; // 에러 상태를 끕니다.
      alert(`환영합니다, ${response.data.user.user_name}님!`); // 환영 메시지를 띄웁니다.

      // Pinia 스토어에 사용자 정보를 저장합니다.
      memberStore.setMember({
        id: response.data.user.user_id,
        center: response.data.user.center || "1018112345",
        grade: response.data.user.grade,
        name: response.data.user.user_name,
      });
      if (response.data.user.approve == "k1") {
        router.push({ name: "Home" }); // 메인 페이지(Home)로 화면을 이동시킵니다.
      } else {
        router.push("/wait-approval");
      }
    } else {
      // 아이디나 비번이 틀려서 서버가 실패 응답을 보낸 경우입니다.
      loginError.value = true; // 에러 상태를 켭니다.
      alert("아이디 또는 비밀번호가 틀렸습니다."); // 실패 알림을 줍니다.
    }
  } catch (error) {
    // 네트워크 오류 등 예외가 발생했을 때 처리합니다.
    console.error("로그인 에러:", error); // 개발자 도구 콘솔에 에러를 기록합니다.
    loginError.value = true; // 에러 상태를 켭니다.

    if (error.response && error.response.status === 404) {
      // 서버 주소가 잘못되었을때 입니다.
      alert("서버의 로그인 경로를 찾을 수 없습니다.");
    } else {
      // 그 외 서버와 연결할 수 없을 때입니다.
      alert("서버 연결에 실패했습니다.");
    }
  }
};

// 화면이 그려지기 전에 실행하여 특정 UI 요소들을 숨기거나 조절합니다.
onBeforeMount(() => {
  store.commit("toggleEveryDisplay"); // 페이지별 커스텀 레이아웃 설정을 켭니다.
  store.commit("toggleHideConfig"); // 설정 버튼 등을 화면에서 숨깁니다.
});

// 이 화면을 떠날 때 원래의 화면 설정으로 복구합니다.
onBeforeUnmount(() => {
  store.commit("toggleEveryDisplay"); // 변경했던 레이아웃 설정을 복원합니다.
  store.commit("toggleHideConfig"); // 숨겼던 설정 버튼을 다시 보여줍니다.
});
</script>

<template>
  <div class="signin-layout" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="signin-container">
      <div
        class="login-card card shadow-lg border-0 border-radius-xl overflow-hidden"
      >
        <div
          class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center"
        >
          <i class="material-icons opacity-10 me-2">login</i>
          <span class="title text-white fw-bold">발달장애인 지원 프로그램</span>
        </div>
        <div class="card-body p-4">
          <div class="error-msg-area mb-3">
            <p v-if="loginError" class="text-danger text-xs text-center mb-0">
              * 입력된 정보를 확인해주십시오.
            </p>
          </div>
          <form role="form" @submit.prevent="handleLogin">
            <div class="mb-4">
              <label
                class="form-label text-xs fw-bolder mb-1 text-secondary"
                for="id"
                >아이디</label
              >
              <material-input
                id="id"
                v-model="userId"
                variant="static"
                placeholder="아이디 입력"
              />
            </div>
            <div class="mb-4">
              <label
                class="form-label text-xs fw-bolder mb-1 text-secondary"
                for="password"
                >비밀번호</label
              >
              <material-input
                id="password"
                type="password"
                v-model="password"
                variant="static"
                placeholder="비밀번호 입력"
              />
            </div>

            <button
              type="submit"
              class="btn btn-sm w-100 bg-gradient-success text-white mb-3"
            >
              로그인
            </button>

            <router-link :to="{ name: 'SignUp' }" class="d-block">
              <button
                type="button"
                class="btn btn-sm w-100 bg-gradient-success text-white mb-3"
              >
                회원가입
              </button>
            </router-link>

            <div
              class="find-options mt-3 pt-3 border-top border-light text-center"
            >
              <router-link to="/find-id" class="find-link"
                >아이디 찾기</router-link
              >
              <span class="divider">|</span>
              <router-link to="/find-pw" class="find-link"
                >비밀번호 찾기</router-link
              >
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* documentLIST.vue work-layout와 동일한 배경/레이아웃 */
.signin-layout {
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

.signin-container {
  width: 100%;
  max-width: 420px;
}

/* documentLIST filter-card / application-card 동일 스타일 */
.login-card {
  background: var(--app-surface);
  position: relative;
}

.login-card .card-body {
  padding: 1.5rem 1.25rem;
}

.error-msg-area {
  min-height: 1.5rem;
}

.find-options {
  border-top-color: var(--app-border-muted) !important;
}

.find-link {
  font-size: 0.8rem;
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.find-link:hover {
  color: var(--app-accent);
}

.divider {
  margin: 0 0.75rem;
  color: var(--app-border-muted);
  font-size: 0.75rem;
}

button {
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
}
</style>
