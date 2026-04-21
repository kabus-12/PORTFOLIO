<script setup>
import { ref, onMounted, computed } from "vue";
import MaterialPagination from "@/components/MaterialPagination.vue";
import MaterialPaginationItem from "@/components/MaterialPaginationItem.vue";

import { useMemberStore } from "@/store/member";
const memberStore = useMemberStore();
// 실제 DB에서 가져온 데이터를 담을 배열 (초기값 빈 배열)
const userInfo = ref([]);

const choiceUser = ref({});
const showInfo = ref(true);
const Noapprove = ref(false);
const Reason = ref("");

// --- 페이징 관련 상태 및 로직 ---
const pageSize = ref(10); // 한 페이지에 보여줄 개수
const currentPage = ref(1); // 현재 페이지

// 전체 페이지 수 계산
const totalPages = computed(() =>
  userInfo.value.length ? Math.ceil(userInfo.value.length / pageSize.value) : 1,
);

// formList.vue와 동일: 현재 페이지 앞뒤로 보여줄 번호 (range 2)
const displayedPages = computed(() => {
  const range = 2;
  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// 현재 페이지에 보여줄 데이터(10개씩 자름)
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return userInfo.value.slice(start, end);
});

// 페이지 변경 함수
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
const goPrev = () => changePage(currentPage.value - 1);
const goNext = () => changePage(currentPage.value + 1);
// ------------------------------

// DB에서 일반회원 승인신청목록 받아오기 (센터 기준)
const fetchUsers = async () => {
  try {
    const centerCode = memberStore.center || "";
    const query = centerCode
      ? `?centerCode=${encodeURIComponent(centerCode)}`
      : "";
    const response = await fetch(
      `/api/mypage/admin/users/pending${query}`,
    );
    if (response.ok) {
      userInfo.value = await response.json();
      currentPage.value = 1; // 데이터를 새로 불러오면 1페이지로 초기화
    }
  } catch (error) {
    console.error("목록 로드 실패:", error);
  }
};

// 페이지 로드 시 목록 실행
onMounted(() => {
  fetchUsers();
});

// 등록 버튼 클릭 시 일반회원 상세 정보를 보여주는 부분
const viewInfo = (user) => {
  choiceUser.value = user;
  showInfo.value = false;
  Noapprove.value = false;
};

// 회원 가입승인버튼 눌렀을 때 (추가 + 승인을 누르면 목록에서 삭제)
const Okapprove = async () => {
  try {
    const response = await fetch("/api/mypage/admin/users/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: choiceUser.value.user_id }),
    });
    // 승인 완료 후 승인 안내 메세지, 목록에서 삭제
    if (response.ok) {
      alert(`${choiceUser.value.user_name} 님을 승인 하였습니다.`);
      userInfo.value = userInfo.value.filter(
        (user) => user.user_id !== choiceUser.value.user_id,
      );

      // 목록 삭제 후 현재 페이지가 비었다면 이전 페이지로 이동
      if (pagedList.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }

      showInfo.value = true;
    }
  } catch (error) {
    alert("승인 처리 실패");
  }
};

const reasonModal = () => {
  Noapprove.value = true;
};

// 반려 사유 입력 부분
const confirmReject = () => {
  if (!Reason.value) return alert("반려 사유를 입력하세요");

  // 반려 시 목록에서 제거
  userInfo.value = userInfo.value.filter(
    (user) => user.user_id !== choiceUser.value.user_id,
  );

  // 목록 삭제 후 현재 페이지가 비었다면 이전 페이지로 이동
  if (pagedList.value.length === 0 && currentPage.value > 1) {
    currentPage.value--;
  }

  Noapprove.value = false;
  showInfo.value = true;
  Reason.value = "";
  alert("반려 처리가 완료되었습니다.");
};
</script>

<template>
  <div class="container-fluid work-layout pt-4 pb-4">
    <div class="work-container justify-content-center">
      <div class="right w-100" style="max-width: 1200px">
        <div
          v-if="showInfo"
          class="application-card card shadow-lg border-0 border-radius-xl"
        >
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg"
          >
            <h6 class="mb-0 text-white font-weight-bolder">
              가입승인 요청 목록
            </h6>
          </div>

          <div class="card-body px-0 pb-2">
            <div class="table-responsive">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr class="bg-gray-100">
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      번호
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      아이디
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      이름
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      이메일 주소
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      가입 신청일
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      확인하기
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="pagedList && pagedList.length > 0">
                    <tr v-for="(user, index) in pagedList" :key="user.user_id">
                      <td class="text-center text-sm">
                        {{ (currentPage - 1) * pageSize + index + 1 }}
                      </td>
                      <td class="text-center text-sm font-weight-bold">
                        {{ user.user_id }}
                      </td>
                      <td class="text-center text-sm">{{ user.user_name }}</td>
                      <td class="text-center text-sm">{{ user.user_email }}</td>
                      <td class="text-center text-sm">
                        {{
                          user.user_reg_date
                            ? user.user_reg_date.split("T")[0]
                            : ""
                        }}
                      </td>
                      <td class="text-center">
                        <button
                          class="btn btn-sm bg-gradient-info text-white mb-0"
                          @click="viewInfo(user)"
                        >
                          등록
                        </button>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="6" class="text-center py-5">
                      <div class="d-flex flex-column align-items-center">
                        <i
                          class="material-icons text-secondary mb-2"
                          style="font-size: 2rem"
                          >info_outline</i
                        >
                        <p class="text-secondary mb-0">
                          승인 대기 중인 회원이 없습니다.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bottom-actions d-flex justify-content-between align-items-center p-3 mt-2"
              v-if="userInfo.length > 0"
            >
              <material-pagination color="success" size="sm">
                <material-pagination-item
                  prev
                  :disabled="currentPage === 1"
                  @click="goPrev"
                />
                <material-pagination-item
                  v-for="page in displayedPages"
                  :key="page"
                  :label="String(page)"
                  :active="page === currentPage"
                  @click="changePage(page)"
                />
                <material-pagination-item
                  next
                  :disabled="currentPage === totalPages"
                  @click="goNext"
                />
              </material-pagination>
            </div>
          </div>
        </div>

        <div
          v-if="!showInfo"
          class="application-card card shadow-lg border-0 border-radius-xl"
        >
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex justify-content-between align-items-center"
          >
            <h6 class="mb-0 text-white font-weight-bolder">회원 상세정보</h6>
            <button
              type="button"
              class="btn-close text-white"
              @click="showInfo = true"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="card-body p-4">
            <div class="row content-area mb-4">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold text-secondary text-xs"
                  >아이디</label
                >
                <p class="text-dark font-weight-bold">
                  {{ choiceUser.user_id }}
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold text-secondary text-xs"
                  >이름</label
                >
                <p class="text-dark font-weight-bold">
                  {{ choiceUser.user_name }}
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold text-secondary text-xs"
                  >이메일</label
                >
                <p class="text-dark font-weight-bold">
                  {{ choiceUser.user_email }}
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold text-secondary text-xs"
                  >연락처</label
                >
                <p class="text-dark font-weight-bold">
                  {{ choiceUser.user_tel || "정보 없음" }}
                </p>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button
                class="btn bg-gradient-success text-white mb-0"
                @click="Okapprove"
              >
                승인
              </button>
              <button
                class="btn bg-gradient-danger text-white mb-0"
                @click="reasonModal"
              >
                반려
              </button>
              <button
                class="btn btn-outline-secondary mb-0"
                @click="showInfo = true"
              >
                목록으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="Noapprove" class="modal-backdrop fade show"></div>
  <div
    class="modal fade"
    :class="{ 'show d-block': Noapprove }"
    tabindex="-1"
    role="dialog"
    @click.self="Noapprove = false"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="card shadow-lg w-100">
        <div
          class="card-header p-3 pb-0 d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0 text-danger font-weight-bolder">반려 사유 입력</h5>
          <button
            type="button"
            class="btn-close text-dark"
            @click="Noapprove = false"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <hr class="dark horizontal my-2" />
        <div class="card-body p-4">
          <div class="form-group">
            <label class="form-label text-secondary text-xs fw-bolder"
              >반려 사유를 상세히 적어주세요.</label
            >
            <textarea
              v-model="Reason"
              class="form-control answer-textarea border p-3"
              placeholder="반려 사유를 입력하세요"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-end p-3 gap-2">
          <button
            class="btn bg-gradient-danger text-white mb-0"
            @click="confirmReject"
          >
            확인
          </button>
          <button
            class="btn btn-outline-secondary mb-0"
            @click="Noapprove = false"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.work-layout {
  background-color: var(--app-surface-muted, #f8f9fa);
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.work-container {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.right {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.application-card {
  background: var(--app-surface, #ffffff);
  padding: 18px 18px 20px;
  position: relative;
}

/* 하단 페이징 관련 영역 지정 (formList와 동일: 좌우 정렬) */
.bottom-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

button {
  cursor: pointer;
}

/* 모달 관련 스타일 */
.modal {
  pointer-events: none;
}

.modal-dialog {
  pointer-events: auto;
  display: flex;
  align-items: center;
  min-height: calc(100% - 3.5rem);
}

.content-area {
  padding: 1.5rem;
  border: 1px solid var(--app-border-muted, #e9ecef);
  border-radius: 12px;
  background: var(--app-surface-muted, #f8f9fa);
}

.answer-textarea {
  width: 100%;
  font-size: 0.9rem;
  border: 1px solid #d2d6da;
  border-radius: 8px;
  background: #ffffff;
  color: #495057;
  resize: vertical;
}

.answer-textarea:focus {
  border-color: #4caf50;
  outline: 0;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style>
