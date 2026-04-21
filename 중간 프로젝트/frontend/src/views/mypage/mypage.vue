<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMemberStore } from "@/store/member";

const router = useRouter();
const route = useRoute();
const memberStore = useMemberStore();

const isCheck = ref(false);
const passwordConfirm = ref("");
const userInfo = reactive({
  user_id: memberStore.id || "사용자",
});

const checkpassword = async () => {
  if (!passwordConfirm.value) return alert("비밀번호를 입력해주세요.");
  try {
    const response = await fetch("/api/mypage/check", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userInfo.user_id,
        password: passwordConfirm.value,
      }),
    });
    if (response.ok) {
      alert("본인 확인 완료");
      isCheck.value = true;
      if (route.path.startsWith("/mypage")) router.push("/mypage/info");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  } catch (error) {
    console.error("인증오류:", error);
  }
};
</script>

<template>
  <!-- 1단계: 본인 확인 화면 (중앙 카드) -->
  <div
    v-if="!isCheck"
    class="container-fluid py-6 d-flex justify-content-center align-items-center"
  >
    <div class="auth-wrapper" style="width: 100%; max-width: 500px">
      <div class="card shadow-lg border-0 border-radius-xl animation-fade-in">
        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
          <div
            class="bg-gradient-success shadow-success border-radius-lg pt-4 pb-3 text-center"
          >
            <i class="material-icons text-white display-5 mb-2">lock</i>
            <h4 class="text-white mb-0 font-weight-bolder">본인 확인</h4>
            <p class="text-white text-sm opacity-8 mb-0">
              안전한 정보 보호를 위해 비밀번호를 입력해주세요.
            </p>
          </div>
        </div>

        <div class="card-body p-5">
          <div class="mb-4">
            <label class="text-success font-weight-bold text-xs mb-2"
              >아이디</label
            >
            <div class="custom-input-group disabled-bg">
              <i class="material-icons text-lg me-2 text-secondary">person</i>
              <input
                type="text"
                v-model="userInfo.user_id"
                class="clean-input"
                disabled
              />
            </div>
          </div>

          <div class="mb-5">
            <label class="text-dark font-weight-bold text-xs mb-2"
              >비밀번호</label
            >
            <div class="custom-input-group active-focus">
              <i class="material-icons text-lg me-2">key</i>
              <input
                type="password"
                v-model="passwordConfirm"
                @keyup.enter="checkpassword"
                class="clean-input"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <button
            class="btn btn-lg bg-gradient-success w-100 border-radius-lg shadow-success text-white fw-bold py-3"
            @click="checkpassword"
          >
            확인하기
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 2단계: 인증 후에는 자식 라우트 전체 화면 사용 -->
  <div v-else>
    <router-view />
  </div>
</template>
