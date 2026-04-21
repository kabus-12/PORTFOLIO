<script setup>
// 최종 완결본: getlabel 미사용 에러 해결 + 모든 모달 필드 복구 + 스타일 최적화 + 페이징
import { ref, onMounted, reactive, computed } from "vue";
import axios from "axios";
import MaterialPagination from "@/components/MaterialPagination.vue";
import MaterialPaginationItem from "@/components/MaterialPaginationItem.vue";
// import { useRouter } from "vue-router";
import { useMemberStore } from "../../store/member";
import { storeToRefs } from "pinia";

// const router = useRouter();
const memberStore = useMemberStore();
const { id: memberId } = storeToRefs(memberStore);

// --- 1. 상태 제어 변수 ---

// --- 2. 검색 필터 (Reactive) ---
const search = reactive({
  name: "",
  priority: "전체",
  disability_category: "",
});

const supported = ref([]);

// --- 페이징 ---
const pageSize = ref(10);
const currentPage = ref(1);

const totalItems = computed(() => supported.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pageSize.value)),
);
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return supported.value.slice(start, start + pageSize.value);
});
const startItem = computed(() =>
  totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
);
const endItem = computed(() =>
  Math.min(currentPage.value * pageSize.value, totalItems.value),
);

const goToPage = (page) => {
  const p = Number(page);
  if (p >= 1 && p <= totalPages.value) currentPage.value = p;
};
const prevPage = () => goToPage(currentPage.value - 1);
const nextPage = () => goToPage(currentPage.value + 1);

// formList.vue와 동일: 현재 페이지 앞뒤 range 2
const displayedPages = computed(() => {
  const range = 2;
  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// --- 3. 모달 제어 및 수정 변수 ---
const detailModal = ref(false);
const selectMember = ref(null);
const isEditModalOpen = ref(false);
const Modifymember = ref(null);
const addModal = ref(false);
const sup_file = ref("");

// 신규 등록 데이터 초기값
const newSupported = ref({
  sup_name: "",
  sup_birthday: "",
  sup_gender: "f1",
  sup_tel: "",
  sup_address: "",
  disability_category: "",
  sup_file: "",
});

// --- 4. 데이터 로딩 로직 ---
const updateTableData = (data) => {
  supported.value = data.map((item, index) => {
    let pVal = "계획";
    let pClass = "p-plan";
    if (index % 3 === 0) {
      pVal = "긴급";
      pClass = "p-emergency";
    } else if (index % 3 === 1) {
      pVal = "중점";
      pClass = "p-focus";
    }
    return { ...item, temp_priority: pVal, temp_class: pClass };
  });
  currentPage.value = 1; // 검색/새로고침 시 1페이지로
};

const buildSupportListParams = () => {
  const params = {};
  const name = (search.name ?? "").toString().trim();
  if (name) params.name = name;

  const disability = (search.disability_category ?? "").toString().trim();
  if (disability && disability !== "전체") params.disability_category = disability;

  // search.priority는 현재 백엔드 필터에 없음(프론트 UI용)
  return Object.keys(params).length ? params : undefined;
};

const getSupportedList = async () => {
  try {
    const response = await axios.get(`/api/support/list?id=${memberStore.id}`, {
      params: buildSupportListParams(),
    });
    if (response.data?.retCode === "OK") updateTableData(response.data.result || []);
  } catch (err) {
    console.error("로드 실패:", err);
  }
};

const fetchData = async () => {
  try {
    const response = await axios.get("/api/support/list", {
      params: buildSupportListParams(),
    });
    if (response.data?.retCode === "OK") updateTableData(response.data.result || []);
  } catch (error) {
    console.error("검색 실패:", error);
  }
};

// --- 5. 핵심 함수 (템플릿 연결용) ---

// [수정 모달]
const openEditModal = (member) => {
  Modifymember.value = { ...member };
  sup_file.value = member.sup_file || "";
  isEditModalOpen.value = true;
};
const closeEditModal = () => {
  isEditModalOpen.value = false;
  Modifymember.value = null;
};

const updateMember = async () => {
  try {
    Modifymember.value.sup_file = sup_file.value;
    await axios.put("/api/support/update", Modifymember.value);
    alert("정보 수정이 완료되었습니다.");
    closeEditModal();
    getSupportedList();
  } catch (e) {
    alert("수정 실패");
  }
};

// [등록 모달]
const openAddModal = () => {
  addModal.value = true;
};
const closeModal = () => {
  addModal.value = false;
  newSupported.value = {
    sup_name: "",
    sup_birthday: "",
    sup_gender: "f1",
    sup_tel: "",
    sup_address: "",
    disability_category: "",
    sup_file: "",
  };
};
const addSupported = async () => {
  try {
    const user_id = (memberId.value ?? "").toString().trim();
    await axios.post("/api/support/add", { ...newSupported.value, user_id });
    alert("신규 등록 완료");
    closeModal();
    getSupportedList();
  } catch (e) {
    alert("등록 실패");
  }
};

// [상세 모달]
const openDetailModal = async (member) => {
  selectMember.value = member;
  try {
    const res = await axios.get("/api/support/disabilities", {
      params: { sup_num: member.sup_num },
    });
    selectMember.value.disabilities = res.data;
    detailModal.value = true;
  } catch (e) {
    alert("상세 정보 로드 실패");
  }
};
const closeDetailModal = () => {
  detailModal.value = false;
  selectMember.value = null;
};

// [기타]
const requestManager = (name) =>
  alert(`${name}님의 담당자 배정요청이 완료되었습니다.`);
const putButton = (v) => {
  search.priority = v;
  fetchData();
};

// [에러 해결 포인트] getlabel 정의 및 사용 확인
const getlabel = (code) => {
  const labels = { d1: "대기", d2: "승인", d3: "반려", d4: "재승인" };
  return labels[code] || "-";
};

onMounted(() => {
  getSupportedList();
});
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
            <span class="title text-white fw-bold">지원자 검색</span>
          </div>
          <div class="card-body p-3">
            <div class="mb-4">
              <label class="form-label text-xs fw-bolder mb-1 text-secondary"
                >지원자 명</label
              >
              <input
                v-model="search.name"
                type="text"
                class="form-control form-control-sm"
                placeholder="지원자명 입력"
              />
            </div>
            <div class="mb-4">
              <label class="form-label text-xs fw-bolder mb-1 text-secondary"
                >대기단계</label
              >
              <div class="d-flex gap-1 flex-wrap">
                <button
                  v-for="p in ['전체', '계획', '중점', '긴급']"
                  :key="p"
                  type="button"
                  class="btn btn-sm flex-grow-1"
                  :class="
                    search.priority === p
                      ? 'bg-gradient-success text-white'
                      : 'btn-outline-secondary'
                  "
                  @click="putButton(p)"
                >
                  {{ p }}
                </button>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-sm w-100 bg-gradient-success text-white"
              @click="fetchData"
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
            <h6 class="mb-0 text-white font-weight-bolder">지원자 정보목록</h6>
            <button
              type="button"
              class="btn btn-sm bg-gradient-dark text-white px-3"
              @click="openAddModal"
            >
              지원자 추가
            </button>
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
                      class="ps-4 text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      지원자명
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      성별
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      생년월일
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      휴대폰 번호
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      주소
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      서류상태
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      담당자
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      등록일
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in paginatedList" :key="member.sup_num">
                    <td class="text-center text-sm">{{ member.sup_num }}</td>
                    <td class="ps-4 text-sm font-weight-bold">
                      {{ member.sup_name }}
                    </td>
                    <td class="text-center text-sm">
                      {{
                        member.gender === "f1" || member.gender === "남성"
                          ? "남성"
                          : "여성"
                      }}
                    </td>
                    <td class="text-center text-sm">
                      {{
                        member.birthday ? member.birthday.split("T")[0] : "미정"
                      }}
                    </td>
                    <td class="text-center text-sm">{{ member.sup_tel }}</td>
                    <td
                      class="text-center text-sm table-cell-ellipsis"
                      style="max-width: 120px"
                    >
                      {{ member.sup_address }}
                    </td>
                    <td class="text-center text-sm">
                      <span class="badge badge-sm bg-gradient-info">{{
                        getlabel(member.sup_approved)
                      }}</span>
                    </td>
                    <td class="text-center text-sm">
                      <span v-if="member.user_id">{{ member.user_id }}</span>
                      <button
                        v-else
                        type="button"
                        class="btn btn-sm bg-gradient-warning text-white px-2"
                        @click="requestManager(member.sup_name)"
                      >
                        배정요청
                      </button>
                    </td>
                    <td class="text-center text-sm">
                      {{ member.sup_reg_date?.split("T")[0] || "-" }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex gap-1 justify-content-center">
                        <button
                          type="button"
                          class="btn btn-sm bg-gradient-info text-white px-2"
                          @click="openEditModal(member)"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm bg-gradient-success text-white px-2"
                          @click="openDetailModal(member)"
                        >
                          장애
                        </button>
                      </div>
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
                  @click="prevPage"
                  :disabled="currentPage <= 1"
                />
                <material-pagination-item
                  v-for="page in displayedPages"
                  :key="page"
                  :label="String(page)"
                  :active="currentPage === page"
                  @click="goToPage(page)"
                />
                <material-pagination-item
                  next
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                />
              </material-pagination>

              <span class="text-secondary text-sm mb-0">
                {{ startItem }}-{{ endItem }} / 전체 {{ totalItems }}건
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="detailModal" class="modal-overlay" @click.self="closeDetailModal">
    <div class="modal-card shadow-lg p-4 border-radius-xl">
      <h4 class="text-success border-bottom pb-2 fw-bold">장애 상세 정보</h4>
      <div class="mt-3 bg-gray-100 p-2 rounded text-sm">
        대상자: <strong>{{ selectMember?.sup_name }}</strong>
      </div>
      <table class="table mt-3 text-center align-items-center mb-0">
        <thead class="bg-gray-100">
          <tr class="text-xxs">
            <th
              class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
            >
              유형
            </th>
            <th
              class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
            >
              정도
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(d, i) in selectMember?.disabilities"
            :key="i"
            class="text-xs"
          >
            <td>{{ d.type }}</td>
            <td>{{ d.level }}</td>
          </tr>
        </tbody>
      </table>
      <button
        type="button"
        class="btn btn-sm bg-gradient-dark w-100 text-white mt-4"
        @click="closeDetailModal"
      >
        닫기
      </button>
    </div>
  </div>

  <div
    v-if="isEditModalOpen && Modifymember"
    class="modal-overlay"
    @click.self="closeEditModal"
  >
    <div class="modal-card shadow-lg p-4 border-radius-xl">
      <h4 class="text-dark border-bottom pb-2 text-center fw-bold">
        지원자 정보 수정
      </h4>
      <div class="modal-body mt-3">
        <div class="mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >성함</label
          >
          <input
            v-model="Modifymember.sup_name"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >휴대폰</label
          >
          <input
            v-model="Modifymember.sup_tel"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >주소</label
          >
          <input
            v-model="Modifymember.sup_address"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >장애유형 추가</label
          >
          <input
            v-model="Modifymember.disability_category"
            type="text"
            class="form-control form-control-sm"
            placeholder="추가할 유형 입력"
          />
        </div>
        <div class="mb-4">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >첨부파일명</label
          >
          <input
            v-model="sup_file"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
      </div>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm bg-gradient-success text-white flex-fill"
          @click="updateMember"
        >
          저장
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary flex-fill"
          @click="closeEditModal"
        >
          취소
        </button>
      </div>
    </div>
  </div>

  <div v-if="addModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-card shadow-lg p-4 border-radius-xl">
      <h4 class="text-success border-bottom pb-2 text-center fw-bold">
        지원자 신규 등록
      </h4>
      <div class="row mt-3">
        <div class="col-6 mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >성함</label
          >
          <input
            v-model="newSupported.sup_name"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="col-6 mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >생년월일</label
          >
          <input
            v-model="newSupported.sup_birthday"
            type="text"
            class="form-control form-control-sm"
            placeholder="YYYY-MM-DD"
          />
        </div>
        <div class="col-12 mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >성별</label
          >

          <label class="mb-0">
            <input
              v-model="newSupported.sup_gender"
              type="radio"
              value="f1"
            />
            남성
          </label>
          <label class="mb-0">
            <input
              v-model="newSupported.sup_gender"
              type="radio"
              value="f2"
            />
            여성
          </label>
        </div>
        <div class="col-12 mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >휴대폰</label
          >
          <input
            v-model="newSupported.sup_tel"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="col-12 mb-3">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >주소</label
          >
          <input
            v-model="newSupported.sup_address"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
        <div class="col-12 mb-4">
          <label class="form-label text-xs fw-bolder mb-1 text-secondary"
            >첨부파일</label
          >
          <input
            v-model="newSupported.sup_file"
            type="text"
            class="form-control form-control-sm"
          />
        </div>
      </div>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm bg-gradient-success text-white flex-fill"
          @click="addSupported"
        >
          등록
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary flex-fill"
          @click="closeModal"
        >
          취소
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* documentLIST.vue 동일 레이아웃 */
.work-layout {
  background-color: var(--app-surface-muted);
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

.left,
.right {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.left {
  max-width: 320px;
  flex: 0 0 auto;
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
  max-width: 120px;
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

.modal-card {
  background: var(--app-surface);
  width: 100%;
  max-width: 500px;
  border-radius: 0.75rem;
  overflow: hidden;
}

.border-radius-xl {
  border-radius: 0.75rem;
}

.bg-gray-100 {
  background-color: var(--app-surface-muted);
}
</style>
