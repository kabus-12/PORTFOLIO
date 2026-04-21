<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useMemberStore } from "@/store/member";

const user_id = ref("");
const user_pw = ref("");
const user_email = ref("");
const user_tel = ref("");
const memberStore = useMemberStore();

onMounted(async () => {
  const userId = memberStore.id;
  if (!userId || userId === "null") {
    alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
    return;
  }
  user_id.value = userId;
  try {
    const response = await axios.get(`/api/mypage/info`, {
      params: { user_id: userId },
    });
    const data = response.data;
    if (data) {
      const result = Array.isArray(data) ? data[0] : data;
      user_email.value = result.user_email || "";
      user_tel.value = result.user_tel || "";
    }
  } catch (error) {
    console.error("조회 에러:", error);
  }
});

const saveInfo = async () => {
  if (!user_id.value) return alert("사용자 정보가 없습니다.");
  try {
    const response = await fetch("/api/mypage/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user_id.value,
        user_password: user_pw.value,
        user_email: user_email.value,
        user_tel: user_tel.value,
      }),
    });
    if (response.status === 404) return alert("서버 경로를 찾을 수 없습니다.");
    const result = await response.json();
    if (result.success) alert("정보가 수정되었습니다.");
  } catch (error) {
    console.error("저장 오류:", error);
  }
};
</script>

<template>
  <div class="container-fluid py-5 d-flex justify-content-center">
    <div class="edit-card-wrapper">
      <div class="card shadow-lg border-0 border-radius-xl animation-fade-in">
        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
          <div
            class="bg-gradient-success shadow-success border-radius-lg pt-4 pb-3 ps-4"
          >
            <h4 class="text-white mb-0 font-weight-bolder">내 정보 수정</h4>
            <p class="text-white text-xs opacity-9 mb-0">
              회원님의 소중한 정보를 안전하게 관리하세요.
            </p>
          </div>
        </div>

        <div class="card-body p-4 p-md-5">
          <div class="row info-form">
            <div class="col-12 mb-4">
              <label class="form-label-custom text-success"
                >아이디 (변경 불가)</label
              >
              <div class="input-container disabled-field">
                <i class="material-icons text-secondary me-3">account_circle</i>
                <input
                  type="text"
                  v-model="user_id"
                  class="form-input"
                  disabled
                />
              </div>
            </div>

            <div class="col-12 mb-4">
              <label class="form-label-custom text-dark">새 비밀번호</label>
              <div class="input-container active-border">
                <i class="material-icons text-dark opacity-5 me-3"
                  >lock_outline</i
                >
                <input
                  type="password"
                  v-model="user_pw"
                  class="form-input"
                  placeholder="비밀번호 입력"
                />
              </div>
            </div>

            <div class="col-12 mb-4">
              <label class="form-label-custom text-dark">이메일 주소</label>
              <div class="input-container active-border">
                <i class="material-icons text-dark opacity-5 me-3"
                  >mail_outline</i
                >
                <input type="text" v-model="user_email" class="form-input" />
              </div>
            </div>

            <div class="col-12 mb-5">
              <label class="form-label-custom text-dark">전화번호</label>
              <div class="input-container active-border">
                <i class="material-icons text-dark opacity-5 me-3"
                  >phone_android</i
                >
                <input type="text" v-model="user_tel" class="form-input" />
              </div>
            </div>

            <div class="col-12 d-flex justify-content-center gap-3">
              <button
                class="btn btn-outline-secondary btn-action"
                @click="$router.go(-1)"
              >
                취소하기
              </button>
              <button
                class="btn bg-gradient-success btn-action text-white fw-bold shadow-success"
                @click="saveInfo"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-card-wrapper {
  width: 100%;
  max-width: 550px;
}

.form-label-custom {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  margin-left: 4px;
}

.btn-action {
  padding: 12px 40px;
  border-radius: 10px;
  font-size: 0.875rem;
  min-width: 140px;
}
</style>
