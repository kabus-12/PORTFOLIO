<template>
  <nav
    class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl mt-3 floating-nav"
    v-bind="$attrs"
  >
    <div class="container-fluid py-2 px-3 d-flex align-items-center">
      <div
        class="d-flex align-items-center brand-area"
        @click="gohome"
        style="cursor: pointer"
      >
        <div
          class="icon-shape-sm bg-gradient-success shadow-success border-radius-md me-3 d-flex align-items-center justify-content-center"
        >
          <i class="material-icons text-white text-sm">home</i>
        </div>
        <h6 class="mb-0 font-weight-bolder text-dark">
          발달장애인 지원 프로그램
        </h6>
      </div>

      <div class="collapse navbar-collapse ms-5" id="navbar">
        <div class="navbar-nav d-flex flex-row align-items-center gap-2">
          <button class="nav-link-custom active" @click="gohome">Home</button>

          <template v-if="memberStore.grade == 'a1'">
            <button class="nav-link-custom" @click="godocument">
              신청서 조회
            </button>
            <button class="nav-link-custom" @click="govolunteer">
              지원자 관리
            </button>
          </template>
          <template v-if="memberStore.grade == 'a2'">
            <button class="nav-link-custom" @click="godocument">
              신청서 관리
            </button>
          </template>
          <template v-if="memberStore.grade === 'a3'">
            <button class="nav-link-custom" @click="godocument">
              신청서 조회
            </button>
            <button class="nav-link-custom" @click="govol">승인 관리</button>
            <button class="nav-link-custom" @click="gomember">회원 관리</button>
          </template>

          <template v-if="memberStore.grade === 'a4'">
            <button class="nav-link-custom" @click="goform">양식 관리</button>
            <!-- <button class="nav-link-custom" @click="govol">회원 관리</button> -->
            <button class="nav-link-custom" @click="gocenter">기관 관리</button>
          </template>
        </div>
      </div>

      <div class="ms-md-auto d-flex align-items-center">
        <div class="user-info-badge me-3">
          <span class="badge-grade">{{ grades[memberStore.grade] }}</span>
          <span class="user-name">{{ memberStore.name }}님</span>
        </div>

        <div class="btn-group-nav">
          <button class="btn-nav-action me-2" @click="gomypage">
            마이페이지
          </button>
          <button class="btn-nav-logout" @click="handleLogout">로그아웃</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useMemberStore } from "@/store/member";

const memberStore = useMemberStore();
const router = useRouter();

const grades = {
  a1: "일반사용자",
  a2: "기관담당자",
  a3: "기관관리자",
  a4: "시스템관리자",
};

/* 페이지 이동 함수들 */
const gohome = () => router.push("/home");
const govolunteer = () => router.push("/support/supported");
const govol = () => router.push("/support/appreq");
const gocenter = () => router.push("/center");
const goform = () => router.push("/form");
const gomypage = () => router.push("/mypage");
const godocument = () => router.push("/document");
const gomember = () => router.push("/approval");
const handleLogout = () => {
  if (confirm("로그아웃 하시겠습니까?")) {
    memberStore.logout();
    router.push("/sign-in");
  }
};
</script>

<style scoped>
/* 네비게이션 바 전체 스타일 */
.floating-nav {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
  z-index: 1000;
}

/* 로고 박스 */
.icon-shape-sm {
  width: 32px;
  height: 32px;
  background-image: linear-gradient(195deg, #66bb6a 0%, #43a047 100%);
}

/* 커스텀 메뉴 버튼 (nav-link 대체) */
.nav-link-custom {
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #67748e;
  transition: all 0.2s;
}

.nav-link-custom:hover {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.08);
}

.nav-link-custom.active {
  color: #4caf50;
  font-weight: 700;
}

/* 사용자 정보 섹션 */
.user-info-badge {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 50px;
  border: 1px solid #ebedf0;
}

.badge-grade {
  font-size: 0.75rem;
  color: #4caf50;
  font-weight: 700;
  margin-right: 8px;
  border-right: 1px solid #ddd;
  padding-right: 8px;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #344767;
}

/* 우측 액션 버튼 */
.btn-nav-action {
  background: white;
  border: 1px solid #4caf50;
  color: #4caf50;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-nav-action:hover {
  background: #4caf50;
  color: white;
}

.btn-nav-logout {
  background: #f44335;
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(244, 67, 53, 0.1);
  transition: all 0.3s;
}

.btn-nav-logout:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

/* 반응형 간격 조정 */
.gap-2 {
  gap: 0.5rem !important;
}
</style>
