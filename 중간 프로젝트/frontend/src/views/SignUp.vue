<script setup>
import { ref, reactive, computed } from "vue"; // Vue의 반응형 상태 관리 및 계산된 속성 도구 임포트
import { useRouter } from "vue-router"; // 페이지 이동을 위한 라우터 도구 임포트
import axios from "axios"; // API 통신을 위한 axios 라이브러리 임포트
import MaterialInput from "@/components/MaterialInput.vue"; // 커스텀 입력창 컴포넌트 임포트
import bgImage from "@/assets/img2.png";

const router = useRouter(); // 라우터 인스턴스 생성

// 회원가입 폼에 입력될 데이터를 담는 반응형 객체
const form = reactive({
  user_id: "", // 사용자 아이디
  user_password: "", // 비밀번호
  user_name: "", // 사용자 이름
  user_tel: "", // 연락처
  user_email: "", // 이메일
  registernum: "", // 선택된 기관의 고유 등록 번호
  grade: "a1", // 회원 등급 (기본값 a1: 일반사용자)
  actived: "i1", // 계정 상태 (기본값 i1: 승인 대기 등)
});

const userPwCheck = ref(""); // 비밀번호 일치 확인을 위한 입력값 저장 변수
const institutionName = ref(""); // 화면에 표시될 기관의 이름
const emailDuplicate = ref(false); // 이메일 중복 상태 (UI 표시용)
const isModalOpen = ref(false); // 기관 검색 모달창의 열림/닫힘 상태
const searchQuery = ref(""); // 모달 내 기관 검색어 저장 변수
const centers = ref([]); // 검색 결과로 받은 기관 목록 저장 배열

// 비밀번호와 확인용 비밀번호가 입력되었을 때, 두 값이 서로 다른지 실시간으로 확인
const isPasswordMismatch = computed(() => {
  return (
    form.user_password !== "" &&
    userPwCheck.value !== "" &&
    form.user_password !== userPwCheck.value
  );
});

// 아이디 중복 확인 버튼 클릭 시 실행되는 함수
const checkIdDuplication = async () => {
  if (!form.user_id) {
    alert("아이디를 입력해주세요."); // 아이디 미입력 시 경고
    return;
  }
  try {
    const res = await axios.post("/api/user/check-id", {
      user_id: form.user_id, // 서버로 현재 입력된 아이디 전송
    });
    alert(
      res.data.isDuplicate
        ? "이미 사용 중인 아이디입니다." // 중복된 경우
        : "사용 가능한 아이디입니다.", // 사용 가능한 경우
    );
  } catch (e) {
    alert("서버 연결 실패"); // 서버 에러 발생 시
  }
};

// 기관 검색 버튼 클릭 시 서버에서 기관 목록을 가져오는 함수
const fetchInstitutions = async () => {
  try {
    const url = `/api/center/list`;
    const res = await axios.get(url, { params: { name: searchQuery.value } }); // 검색어를 쿼리로 전달

    console.log("서버 응답 데이터:", res.data);
    centers.value = res.data.result; // 받아온 기관 데이터를 배열에 저장
  } catch (e) {
    console.error("에러 상세:", e);
    alert("서버 연결에 실패했습니다.");
  }
};

// 모달 테이블에서 특정 기관의 '사용' 버튼을 클릭했을 때 처리
const selectOrg = (org) => {
  institutionName.value = org.center_name; // 화면에 기관명 표시
  form.registernum = org.registernum; // 가입 데이터에 해당 기관 번호 저장
  isModalOpen.value = false; // 선택 완료 후 모달 닫기
};

// 최종 '가입하기' 버튼 클릭 시 실행되는 함수
const handleSignup = async () => {
  // 필수 입력값이 빠졌는지 최종 확인
  if (!form.user_id || !form.user_password || !form.registernum) {
    alert("필수 항목을 모두 입력해주세요.");
    return;
  }
  try {
    const res = await axios.post("/api/user/signup", form); // 전체 데이터 전송
    if (res.data.success) {
      alert("회원가입 완료!"); // 가입 성공 메시지
      router.push("/sign-in"); // 로그인 페이지로 페이지 이동
    }
  } catch (e) {
    alert("가입 실패"); // 가입 실패 메시지
  }
};
</script>

<template>
  <div class="signup-layout" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="signup-container">
      <div
        class="signup-card card shadow-lg border-0 border-radius-xl overflow-hidden"
      >
        <div
          class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center"
        >
          <i class="material-icons opacity-10 me-2">person_add</i>
          <span class="title text-white fw-bold">회원가입</span>
        </div>
        <div class="card-body p-4">
          <!-- 가입 유형 -->
          <div class="mb-4">
            <label class="form-label text-xs fw-bolder mb-1 text-secondary"
              >가입 유형</label
            >
            <div class="radio-group d-flex gap-3 flex-wrap">
              <label class="radio-item">
                <input type="radio" v-model="form.grade" value="a2" />
                <span>기관담당자</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="form.grade" value="a1" />
                <span>일반사용자</span>
              </label>
            </div>
          </div>

          <!-- 아이디 -->
          <div class="mb-4">
            <label
              class="form-label text-xs fw-bolder mb-1 text-secondary"
              for="user_id"
              >아이디 <span class="text-danger">(필수)</span></label
            >
            <div class="d-flex gap-2 align-items-center">
              <material-input
                id="user_id"
                v-model="form.user_id"
                variant="static"
                placeholder="아이디 입력"
                class="flex-grow-1"
              />
              <button
                type="button"
                class="btn btn-sm bg-gradient-success text-white flex-shrink-0"
                @click="checkIdDuplication"
              >
                중복 확인
              </button>
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="mb-4">
            <label
              class="form-label text-xs fw-bolder mb-1 text-secondary"
              for="user_password"
              >비밀번호 <span class="text-danger">(필수)</span></label
            >
            <material-input
              id="user_password"
              v-model="form.user_password"
              type="password"
              variant="static"
              placeholder="비밀번호 입력"
            />
          </div>

          <!-- 비밀번호 확인 -->
          <div class="mb-4">
            <label
              class="form-label text-xs fw-bolder mb-1 text-secondary"
              for="user_pw_check"
              >비밀번호 확인 <span class="text-danger">(필수)</span></label
            >
            <material-input
              id="user_pw_check"
              v-model="userPwCheck"
              type="password"
              variant="static"
              placeholder="비밀번호 다시 입력"
            />
            <p v-if="isPasswordMismatch" class="text-danger text-xs mt-1 mb-0">
              * 비밀번호가 일치하지 않습니다.
            </p>
          </div>

          <!-- 이름 -->
          <div class="mb-4">
            <label
              class="form-label text-xs fw-bolder mb-1 text-secondary"
              for="user_name"
              >이름 <span class="text-danger">(필수)</span></label
            >
            <material-input
              id="user_name"
              v-model="form.user_name"
              variant="static"
              placeholder="이름 입력"
            />
          </div>

          <!-- 연락처 -->
          <div class="mb-4">
            <label
              class="form-label text-xs fw-bolder mb-1 text-secondary"
              for="user_tel"
              >연락처 <span class="text-danger">(필수)</span></label
            >
            <material-input
              id="user_tel"
              v-model="form.user_tel"
              variant="static"
              placeholder="연락처 입력"
            />
          </div>

          <!-- 이메일 -->
          <div class="mb-4">
            <label
              class="form-label text-xs fw-bolder mb-1 text-secondary"
              for="user_email"
              >이메일 <span class="text-danger">(필수)</span></label
            >
            <material-input
              id="user_email"
              v-model="form.user_email"
              type="email"
              variant="static"
              placeholder="이메일 입력"
            />
            <p v-if="emailDuplicate" class="text-danger text-xs mt-1 mb-0">
              * 이미 등록된 이메일입니다.
            </p>
          </div>

          <!-- 기관명 -->
          <div class="mb-4">
            <label class="form-label text-xs fw-bolder mb-1 text-secondary"
              >기관명 <span class="text-danger">(필수)</span></label
            >
            <div class="d-flex gap-2 align-items-center">
              <material-input
                :model-value="institutionName"
                variant="static"
                placeholder="기관 검색 후 선택"
                class="flex-grow-1"
                readonly
              />
              <button
                type="button"
                class="btn btn-sm bg-gradient-success text-white flex-shrink-0"
                @click="isModalOpen = true"
              >
                검색
              </button>
            </div>
          </div>

          <!-- 가입하기 버튼 -->
          <div class="mt-4 pt-3 border-top border-light">
            <button
              type="button"
              class="btn btn-sm w-100 bg-gradient-success text-white py-2"
              @click="handleSignup"
            >
              가입하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 기관 검색 모달 -->
    <div v-if="isModalOpen" class="modal-backdrop fade show"></div>
    <div
      class="modal fade"
      :class="{ 'show d-block': isModalOpen }"
      tabindex="-1"
      role="dialog"
      @click.self="isModalOpen = false"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="card shadow-lg w-100 modal-content-scroll">
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center justify-content-between"
          >
            <span class="text-white fw-bold">기관 검색</span>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="닫기"
              @click="isModalOpen = false"
            ></button>
          </div>
          <div class="card-body p-4">
            <div class="mb-4">
              <label class="form-label text-xs fw-bolder mb-1 text-secondary"
                >기관명</label
              >
              <div class="d-flex gap-2">
                <material-input
                  v-model="searchQuery"
                  variant="static"
                  placeholder="기관명을 입력하세요"
                  class="flex-grow-1"
                  @keyup.enter="fetchInstitutions"
                />
                <button
                  type="button"
                  class="btn btn-sm bg-gradient-success text-white"
                  @click="fetchInstitutions"
                >
                  검색
                </button>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table align-items-center mb-0 org-table">
                <thead>
                  <tr class="bg-gray-100">
                    <th
                      class="text-secondary text-xxs font-weight-bolder opacity-7 ps-3"
                    >
                      기관명
                    </th>
                    <th
                      class="text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      주소
                    </th>
                    <th
                      class="text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      연락처
                    </th>
                    <th
                      class="text-secondary text-xxs font-weight-bolder opacity-7 text-center"
                    >
                      선택
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="center in centers" :key="center.registernum">
                    <td class="ps-3 text-sm">{{ center.center_name }}</td>
                    <td class="text-sm">{{ center.center_addr }}</td>
                    <td class="text-sm">{{ center.center_tel }}</td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn btn-sm bg-gradient-success text-white"
                        @click="selectOrg(center)"
                      >
                        사용
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="d-flex justify-content-end mt-3">
              <button
                type="button"
                class="btn btn-sm bg-secondary text-white"
                @click="isModalOpen = false"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* documentLIST / SignIn과 동일 레이아웃 */
.signup-layout {
  background-color: var(--app-surface-muted);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  position: relative;
  background-repeat: no-repeat; /* 이미지 반복 방지 */
  background-size: cover; /* 이미지가 요소에 꽉 차도록 비율 조정 */
  background-position: center; /* 이미지를 중앙에 배치 */
}

.signup-container {
  width: 100%;
  max-width: 520px;
}

/* documentLIST card 스타일 */
.signup-card {
  background: var(--app-surface);
  position: relative;
}

.signup-card .card-body {
  padding: 1.5rem 1.25rem;
}

/* 라디오 (가입 유형) */
.radio-group .radio-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--app-text-muted);
  cursor: pointer;
}

.radio-group .radio-item input {
  margin: 0;
  accent-color: var(--app-accent);
}

/* 모달 - documentLIST와 동일 */
.modal {
  pointer-events: none;
}

.modal-dialog {
  pointer-events: auto;
  display: flex;
  align-items: center;
  min-height: calc(100% - 3.5rem);
}

.modal-content-scroll {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
}

.modal .card-body {
  overflow-y: auto;
}

button {
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
}
</style>
