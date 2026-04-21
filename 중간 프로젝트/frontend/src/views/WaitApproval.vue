<template>
  <div class="wait-approval-layout">
    <div class="wait-approval-container">
      <div
        class="wait-approval-card card shadow-lg border-0 border-radius-xl overflow-hidden"
      >
        <div
          class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center"
        >
          <i class="material-icons opacity-10 me-2">schedule</i>
          <span class="title text-white fw-bold">승인 대기</span>
        </div>

        <div class="card-body p-4">
          <div class="result-icon mb-3 text-center">
            <i class="material-icons text-warning">hourglass_empty</i>
          </div>
          <p class="text-secondary text-sm mb-3 text-center">
            본 서비스는 가입하시는 기관의 관리자가 승인 처리 후 이용 가능합니다.
          </p>
          <p class="text-xs text-secondary mb-4 text-center">
            * 문의사항은 기관으로 연락주세요
          </p>
          <div class="info-box mb-4">
            <label class="form-label text-xs fw-bolder mb-1 text-secondary"
              >기관 연락처</label
            >
            <p class="mb-0 fw-bold">010-1234-5678</p>
          </div>
          <button
            type="button"
            class="btn btn-sm w-100 bg-gradient-success text-white"
            @click="router.push('/sign-in')"
          >
            로그인 화면으로
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.wait-approval-layout {
  background-color: var(--app-surface-muted);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.wait-approval-container {
  width: 100%;
  max-width: 420px;
}

.wait-approval-card {
  background: var(--app-surface);
  position: relative;
}

.wait-approval-card .card-body {
  padding: 1.5rem 1.25rem;
}

.result-icon .material-icons {
  font-size: 3.5rem;
}

.info-box {
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border-muted);
  border-radius: 12px;
  padding: 1rem 1.25rem;
}

button {
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
}
</style>
