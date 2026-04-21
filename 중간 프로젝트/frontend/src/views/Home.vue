<template>
  <div class="container-fluid py-4 main-page-bg">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card my-4 main-card border-0 shadow-soft">
          <div
            class="card-header p-0 position-relative mt-n4 mx-3 z-index-2 border-0"
          >
            <div
              class="bg-gradient-success shadow-success border-radius-xl pt-4 pb-3 welcome-header"
            >
              <h3 class="text-white text-capitalize ps-3 text-center mb-0">
                <i class="material-icons opacity-10 me-2">dashboard</i>
                관리자 대시보드
              </h3>
            </div>
          </div>

          <div class="card-body px-0 pb-5">
            <div class="p-5 text-center">
              <div class="welcome-symbol mb-4">
                <span class="pulse-animation"></span>
                <i class="material-icons text-success display-1"
                  >volunteer_activism</i
                >
              </div>

              <h1 class="display-4 font-weight-bold text-dark mb-2">
                안녕하세요, <span class="text-success">{{ userName }}</span
                >님!
              </h1>
              <p class="lead text-secondary mb-4">
                발달장애인 지원 프로그램 시스템에 안전하게 접속되었습니다.
                <br />
                오늘도 따뜻한 지원과 관리를 응원합니다.
              </p>

              <hr class="horizontal dark w-25 mx-auto mb-5" />

              <div class="row px-4 mt-4">
                <div class="col-md-4 mb-3">
                  <div class="info-box p-3 border-radius-lg bg-gray-100">
                    <h6 class="text-sm mb-1">지원자 관리</h6>
                    <p class="text-xs text-secondary mb-0">
                      새로운 신청 건을 확인하세요
                    </p>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="info-box p-3 border-radius-lg bg-gray-100">
                    <h6 class="text-sm mb-1">회원 현황</h6>
                    <p class="text-xs text-secondary mb-0">
                      전체 등록 인원을 관리합니다
                    </p>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div
                    class="info-box p-3 border-radius-lg bg-gray-100 highlight-box"
                  >
                    <h6 class="text-sm mb-1">오늘의 일정</h6>
                    <p class="text-xs text-secondary mb-0">
                      예정된 상담이 있습니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMemberStore } from "../store/member";
const userName = ref("");
const memberStore = useMemberStore();
onMounted(() => {
  userName.value = memberStore.name;
});
</script>

<style scoped>
/* 배경 부드러운 색감 */
.main-page-bg {
  min-height: 80vh;
  background-color: var(--app-surface-muted);
}

/* 카드 현대화 */
.main-card {
  border-radius: 20px !important;
  transition: all 0.3s ease-in-out;
}

.shadow-soft {
  box-shadow: var(--app-shadow-lg) !important;
}

/* 헤더 그래디언트 강화 */
.welcome-header {
  background: var(--app-gradient-success);
}

/* 환영 아이콘 및 애니메이션 */
.welcome-symbol {
  position: relative;
  display: inline-block;
}

.pulse-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-color: rgba(var(--app-accent-rgb), 0.1);
  border-radius: 50%;
  z-index: -1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0.7;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
}

/* 인포 박스 스타일 */
.info-box {
  transition: transform 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
}

.info-box:hover {
  transform: translateY(-5px);
  background-color: var(--app-surface) !important;
  border-color: var(--app-accent);
  box-shadow: var(--app-shadow-md);
}

.highlight-box {
  background-color: var(--app-success-bg) !important;
}

.display-4 {
  font-weight: 700;
  letter-spacing: -1px;
}
</style>
