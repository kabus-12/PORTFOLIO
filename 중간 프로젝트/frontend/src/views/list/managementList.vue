<script setup>
import { ref, onMounted } from "vue";
// import { useRouter } from "vue-router";
// const router = useRouter();
import axios from "axios";

const searchName = ref("");
// 지원자 목록에 들어갈 정보
const supported = ref([]);

const getList = async () => {
  try {
    const loginId = "user";
    const response = await axios.get("/api/support/list", {
      params: {
        user_id: loginId,
        sup_name: searchName.value, // 사용자가 입력한 검색어 추가!
      },
    });

    if (response.data.retCode === "OK") {
      supported.value = response.data.result;
    }
  } catch (err) {
    console.error("데이터 로드 실패:", err);
  }
};

// 검색 버튼 클릭 시 실행할 함수
const handleSearch = () => {
  getList(); // 현재 입력된 searchName으로 다시 조회합니다.
};

// 3. 페이지가 로드될 때 실행
onMounted(() => {
  getList();
});
const resetSearch = () => {
  searchName.value = "";
  // 검색 결과 초기화 로직 (전체 목록 다시 불러오기)
  getList();
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
            <span class="title text-white fw-bold">지원자 검색</span>
          </div>
          <div class="card-body p-3">
            <div class="mb-4">
              <label class="form-label text-xs fw-bolder mb-1 text-secondary"
                >지원자 명</label
              >
              <input
                v-model="searchName"
                type="text"
                class="form-control form-control-sm"
                placeholder="지원자명 입력"
              />
            </div>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm flex-grow-1 bg-gradient-success text-white"
                @click="handleSearch"
              >
                검색
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                @click="resetSearch"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="application-card card shadow-lg border-0 border-radius-xl">
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg"
          >
            <h6 class="mb-0 text-white font-weight-bolder">지원자 목록</h6>
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
                      지원자 명
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      대기단계
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      지원신청일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in supported" :key="member.sup_num">
                    <td class="text-center text-sm">{{ member.sup_num }}</td>
                    <td class="ps-4 text-sm font-weight-bold">
                      {{ member.sup_name }}
                    </td>
                    <td class="text-center">
                      <span class="badge badge-sm bg-gradient-success">{{
                        member.progress || "d2"
                      }}</span>
                    </td>
                    <td class="text-center text-sm">
                      {{
                        member.sup_reg_date
                          ? member.sup_reg_date.split("T")[0]
                          : "-"
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bottom-actions d-flex justify-content-between align-items-center p-3 mt-2"
            >
              <div class="pagination d-flex gap-2 align-items-center">
                <button type="button" class="btn btn-sm btn-outline-secondary">
                  이전
                </button>
                <span class="pages text-secondary text-sm">
                  <span class="fw-bold">1</span> <span>2</span> <span>3</span>
                </span>
                <button type="button" class="btn btn-sm btn-outline-secondary">
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>
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
</style>
