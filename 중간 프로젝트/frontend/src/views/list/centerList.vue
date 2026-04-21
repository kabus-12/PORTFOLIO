<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import MaterialPagination from "@/components/MaterialPagination.vue";
import MaterialPaginationItem from "@/components/MaterialPaginationItem.vue";

const searchName = ref("");
const centerList = ref([]);

// 페이징 (formList.vue와 동일 스타일)
const pageSize = 10;
const currentPage = ref(1);
const totalPages = computed(() =>
  centerList.value.length
    ? Math.ceil(centerList.value.length / pageSize)
    : 1
);
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return centerList.value.slice(start, start + pageSize);
});
const displayedPages = computed(() => {
  const range = 2;
  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
const getCenterList = async () => {
  try {
    const response = await axios.get("/api/center/list");

    if (response.data.retCode === "OK") {
      centerList.value = response.data.result;
      console.log("센터목록 가져오기 성공", centerList.value);
    }
  } catch (err) {
    console.log("센터목록 가져오기 실패:", err);
  }
};
onMounted(() => {
  getCenterList();
});

// 모달창에 입력 해야 하는 부분
const showAddModal = ref(false);
const newCenter = ref({
  repname: "",
  center_name: "",
  center_tel: "",
  center_addr: "",
  center_email: "",
  registernum: "",
  runed: "운영",
});

// 기관 등록 함수
const addCenter = async () => {
  if (Object.values(newCenter.value).some((val) => !val)) {
    alert("빠짐 없이 입력 해주세요");
    return;
  }
  try {
    const response = await axios.post("/api/center/addCenter", newCenter.value);
    if (response.data.retCode === "OK") {
      alert("기관 등록완료");
      showAddModal.value = false;

      newCenter.value = {
        repname: "",
        center_name: "",
        center_tel: "",
        center_addr: "",
        center_email: "",
        registernum: "",
        runed: "운영",
      };
      await getCenterList();
      // console.log("기관 목록 등록완료");
    } else {
      // console.log("서버 응답은 왔으나 OK가 아님:", response.data);
    }
  } catch (err) {
    // console.error("기관 등록실패:", err);
    alert("기관 등록이 실패하였습니다");
  }
};
// 기관 수정하기
// <script setup> 내부에 추가
const isCenterModalOpen = ref(false);
const modifyCenter = ref(null);

// 수정 버튼 클릭 시 실행 (해당 행의 기관 데이터 전달)
const openCenterEditModal = (center) => {
  modifyCenter.value = { ...center }; // 원본 데이터 복사
  isCenterModalOpen.value = true;
};

// 수정된 데이터를 서버로 전송
const updateCenter = async () => {
  try {
    const response = await axios.put("/api/center/update", modifyCenter.value);
    if (response.status === 200) {
      alert("기관 정보 수정 완료");
      isCenterModalOpen.value = false;
      getCenterList(); // 목록 새로고침 함수 (기존 getList와 유사한 이름일 것임)
    }
  } catch (error) {
    // console.error("기관 수정 실패:", error);
    alert("기관 정보 수정 중 오류가 발생했습니다.");
  }
};
</script>
<template>
  <div class="container-fluid pt-4 pb-4 work-layout">
    <div class="work-container">
      <div class="left">
        <div
          class="filter-card card shadow-lg border-0 border-radius-xl overflow-hidden"
        >
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex align-items-center"
          >
            <i class="material-icons opacity-10 me-2">search</i>
            <span class="title text-white fw-bold">기관 검색</span>
          </div>
          <div class="card-body p-3">
            <div class="mb-4">
              <label class="form-label text-xs fw-bolder mb-1 text-secondary"
                >기관명</label
              >
              <input
                v-model="searchName"
                type="text"
                class="form-control form-control-sm"
                placeholder="기관명 입력"
              />
            </div>
            <button
              type="button"
              class="btn btn-sm w-100 bg-gradient-success text-white"
              @click="getCenterList()"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="application-card card shadow-lg border-0 border-radius-xl">
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg d-flex justify-content-between align-items-center"
          >
            <h6 class="mb-0 text-white font-weight-bolder">
              시스템관리자의 기관목록
            </h6>
            <button
              type="button"
              class="btn btn-sm bg-gradient-dark text-white px-3"
              @click="showAddModal = true"
            >
              기관 등록
            </button>
          </div>

          <div class="card-body px-0 pb-2">
            <div class="table-wrapper-full">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr class="bg-gray-100">
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      번호
                    </th>
                    <th
                      class="ps-4 text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      대표명
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      기관명
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      대표번호
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      주소
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      이메일
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      기관등록일
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      운영상태
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      정보수정
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="center in pagedList" :key="center.registernum">
                    <td class="text-center text-sm">
                      {{ center.registernum }}
                    </td>
                    <td class="ps-4 text-sm font-weight-bold">
                      {{ center.repname }}
                    </td>
                    <td class="text-center text-sm">
                      {{ center.center_name }}
                    </td>
                    <td class="text-center text-sm">{{ center.center_tel }}</td>
                    <td class="text-center text-sm table-cell-ellipsis">
                      {{ center.center_addr }}
                    </td>
                    <td class="text-center text-sm">
                      {{ center.center_email }}
                    </td>
                    <td class="text-center text-sm">{{ center.reg_date }}</td>
                    <td class="text-center">
                      <span class="badge badge-sm bg-gradient-success">{{
                        center.runed
                      }}</span>
                    </td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn btn-sm bg-gradient-info text-white px-3"
                        @click="openCenterEditModal(center)"
                      >
                        수정하기
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bottom-actions d-flex justify-content-between align-items-center p-3 mt-2"
            >
              <material-pagination color="success" size="sm">
                <material-pagination-item
                  prev
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                />
                <material-pagination-item
                  v-for="page in displayedPages"
                  :key="page"
                  :label="String(page)"
                  :active="currentPage === page"
                  @click="changePage(page)"
                />
                <material-pagination-item
                  next
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                />
              </material-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 기관 등록 모달 -->
  <div
    v-if="showAddModal"
    class="modal-overlay"
    @click.self="showAddModal = false"
  >
    <div class="modal-content">
      <h3 class="mb-3 fw-bold">기관 등록</h3>
      <hr class="dark horizontal my-2" />
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >대표명</label
        >
        <input
          v-model="newCenter.repname"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >기관명</label
        >
        <input
          v-model="newCenter.center_name"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >대표번호</label
        >
        <input
          v-model="newCenter.center_tel"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >주소</label
        >
        <input
          v-model="newCenter.center_addr"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >이메일</label
        >
        <input
          v-model="newCenter.center_email"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >기관 사업자 번호</label
        >
        <input
          v-model="newCenter.registernum"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >기관 운영여부</label
        >
        <select v-model="newCenter.runed" class="form-control form-control-sm">
          <option value="운영">운영</option>
          <option value="휴업">휴업</option>
        </select>
      </div>
      <div class="modal-button d-flex justify-content-end gap-2">
        <button
          type="button"
          class="btn btn-sm bg-gradient-success text-white"
          @click="addCenter"
        >
          등록
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="showAddModal = false"
        >
          취소
        </button>
      </div>
    </div>
  </div>

  <!-- 기관 수정 모달 -->
  <div
    v-if="isCenterModalOpen && modifyCenter"
    class="modal-overlay"
    @click.self="isCenterModalOpen = false"
  >
    <div class="modal-content">
      <h3 class="mb-3 fw-bold">기관 정보 수정</h3>
      <hr class="dark horizontal my-2" />
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >대표명</label
        >
        <input
          v-model="modifyCenter.repname"
          type="text"
          class="form-control form-control-sm"
          placeholder="대표명"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >기관명</label
        >
        <input
          v-model="modifyCenter.center_name"
          type="text"
          class="form-control form-control-sm"
          placeholder="기관주소"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >기관주소</label
        >
        <input
          v-model="modifyCenter.center_addr"
          type="text"
          class="form-control form-control-sm"
          placeholder="기관주소"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >사업자번호</label
        >
        <input
          v-model="modifyCenter.registernum"
          type="text"
          class="form-control form-control-sm"
          placeholder="사업자번호"
        />
      </div>

      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >대표번호</label
        >
        <input
          v-model="modifyCenter.center_tel"
          type="text"
          class="form-control form-control-sm"
          placeholder="대표번호"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >주소</label
        >
        <input
          v-model="modifyCenter.center_addr"
          type="text"
          class="form-control form-control-sm"
          placeholder="주소"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >이메일</label
        >
        <input
          v-model="modifyCenter.center_email"
          type="text"
          class="form-control form-control-sm"
          placeholder="이메일"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label text-xs fw-bolder mb-1 text-secondary"
          >기관 운영여부</label
        >
        <select v-model="newCenter.runed" class="form-control form-control-sm">
          <option value="운영">운영</option>
          <option value="휴업">휴업</option>
        </select>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button
          type="button"
          class="btn btn-sm bg-gradient-success text-white"
          @click="updateCenter"
        >
          저장
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="isCenterModalOpen = false"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* documentLIST.vue 동일 레이아웃 - list.vue 안에서 테이블 한 번에 표시(스크롤 없음) */
.work-layout {
  background-color: var(--app-surface-muted);
  height: auto;
  min-height: 0;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.work-container {
  display: flex;
  gap: 24px;
  flex: 1 1 auto;
  min-height: 0;
}

.left,
.right {
  flex: 1;
  min-height: 0;
}

.right {
  overflow: visible;
  min-height: auto;
}

.left {
  max-width: 320px;
  flex: 0 0 auto;
  overflow-y: auto;
}

/* 테이블 영역 스크롤 없이 전체 표시 */
.table-wrapper-full {
  overflow: visible;
}

.application-card,
.filter-card {
  background: var(--app-surface);
  padding: 18px 18px 20px;
  position: relative;
}

.filter-card .card-body {
  padding: 18px;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

button {
  cursor: pointer;
}

.table-cell-ellipsis {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--app-backdrop);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 0.75rem;
  width: 500px;
  max-width: 90%;
  box-shadow: var(--app-shadow-modal);
}

.modal-content input,
.modal-content select {
  width: 100%;
  box-sizing: border-box;
}
</style>
