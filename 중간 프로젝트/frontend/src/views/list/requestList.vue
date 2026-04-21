<script setup>
import { onMounted, ref } from "vue";
// import { useRouter } from "vue-router";
import axios from "axios";

// const router = useRouter();

// 미배정 지원자 목록
const Notsupported = ref([]);
// 모달표시 부분
const showModal = ref(false);
// 배정하기 버튼 부분
const selectedMember = ref(null);
const managerList = ref([
  { user_id: "m1", user_name: "김철수", count: 5, status: "근무중" },
  { user_id: "m2", user_name: "이영희", count: 2, status: "근무중" },
  { user_id: "m3", user_name: "박지성", count: 0, status: "휴가" },
]);
const getManagerList = async (writer) => {
  // console.log(docStore.writer);
  const result = await axios.get(`/api/user/getManager/${writer}`);
  managerList.value = result.data.result;
};
const getNomanagerList = async () => {
  try {
    const responese = await axios.get("/api/support/list");
    if (responese.data.retCode === "OK") {
      const allData = responese.data.result;
      Notsupported.value = allData.map((item) => ({
        ...item,
        display_status: item.user_id ? "d1" : "d2",
      }));
    }
    // console.log(responese.data);
  } catch (err) {
    // console.error("데이터 불러오기 실패", err);
  }
};
onMounted(() => {
  getNomanagerList();
});

// 지원자 명 검색
const searchName = ref("");
// const resetSearch = () => {
//   searchName.value = "";
// };

// 배정하기 버튼 부분 내용
const openModal = async (member) => {
  selectedMember.value = member;
  await getManagerList(member.user_id);
  showModal.value = true;
};
// 지정버튼 클릭 시
const assignManager = async (manager) => {
  if (!selectedMember.value) return;
  // console.log(selectedMember.value);
  try {
    const responese = await axios.post(
      "/api/support/assign",
      {
        sup_num: selectedMember.value.sup_num,
        manager_id: manager.user_id,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    if (responese.data.retCode === "OK") {
      alert(
        `${selectedMember.value.sup_name}님에게 ${manager.user_name} 담당자가 배정되었습니다.`,
      );
      Notsupported.value = Notsupported.value.filter(
        (m) => m.sup_num !== selectedMember.value.sup_num,
      );

      showModal.value = false;
      selectedMember.value = null;
    }
  } catch (err) {
    alert("배정 처리중 오류 발생");
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
            <button
              type="button"
              class="btn btn-sm w-100 bg-gradient-success text-white"
              @click="getNomanagerList"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="application-card card shadow-lg border-0 border-radius-xl">
          <div
            class="card-header p-3 bg-gradient-success shadow-success border-radius-lg"
          >
            <h6 class="mb-0 text-white font-weight-bolder">
              담당자 미 배정 지원자 목록
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
                      class="ps-4 text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      지원자명
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      가입일
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      현재상태
                    </th>
                    <th
                      class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
                    >
                      배정
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in Notsupported" :key="member.sup_num">
                    <td class="text-center text-sm">{{ member.sup_num }}</td>
                    <td class="ps-4 text-sm font-weight-bold">
                      {{ member.sup_name }}
                    </td>
                    <td class="text-center text-sm">
                      {{ member.sup_reg_date?.split("T")[0] || "-" }}
                    </td>
                    <td class="text-center">
                      <span class="badge badge-sm bg-gradient-info">{{
                        member.display_status
                      }}</span>
                    </td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn btn-sm bg-gradient-success text-white px-3"
                        @click="openModal(member)"
                      >
                        배정하기
                      </button>
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

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal-content card shadow-lg p-4 border-radius-xl">
      <h5 class="font-weight-bolder text-dark mb-3 fw-bold">담당자 목록</h5>
      <div class="table-responsive">
        <table class="table align-items-center mb-0">
          <thead class="bg-gray-100">
            <tr>
              <th
                class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
              >
                번호
              </th>
              <th
                class="ps-4 text-secondary text-xxs font-weight-bolder opacity-7"
              >
                담당자명
              </th>
              <th
                class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
              >
                배정인원수
              </th>
              <th
                class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
              >
                근무상태
              </th>
              <th
                class="text-center text-secondary text-xxs font-weight-bolder opacity-7"
              >
                선택
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(manager, index) in managerList" :key="manager.user_id">
              <td class="text-center text-sm">{{ index + 1 }}</td>
              <td class="ps-4 text-sm font-weight-bold">
                {{ manager.user_name }}
              </td>
              <td class="text-center text-sm">{{ manager.count }}명</td>
              <td class="text-center text-sm">{{ manager.status }}</td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-sm bg-gradient-success text-white px-3"
                  @click="assignManager(manager)"
                >
                  지정
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        type="button"
        class="btn btn-sm bg-gradient-dark w-100 text-white mt-4"
        @click="showModal = false"
      >
        닫기
      </button>
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
  background: var(--app-surface);
  max-width: 550px;
  width: 90%;
  border-radius: 0.75rem;
  overflow: hidden;
}

.border-radius-xl {
  border-radius: 0.75rem;
}
</style>
