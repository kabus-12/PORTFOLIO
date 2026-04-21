<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card my-4">
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div
              class="bg-gradient-success shadow-success border-radius-lg pt-4 pb-3"
            >
              <h3 class="text-white text-capitalize ps-3 text-center">
                홈페이지 창
              </h3>
            </div>
          </div>
          <div class="card-body px-0 pb-2">
            <div class="p-5 text-center">
              <h1 class="display-1 font-weight-bold text-success mb-4">
                홈페이지 창
              </h1>
              <hr class="horizontal dark" />
              <h4 class="mt-4" v-if="userName">
                <span class="text-success">{{ userName }}</span
                >님, 환영합니다!
              </h4>
              <p class="text-secondary">
                이곳은 우리 팀의 메인 프로그램 화면입니다.<br />
                이제 이 아래에 팀 프로젝트의 주요 기능들을 채워 넣으면 됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6 mx-auto">
        <div class="card">
          <div class="card-header p-3">
            <h6 class="mb-0">시스템 알림 테스트</h6>
          </div>
          <div class="card-body p-3 text-center">
            <button
              class="btn bg-gradient-info mb-0 me-2"
              @click="snackbar = 'info'"
            >
              접속 정보 확인
            </button>
            <button
              class="btn bg-gradient-success mb-0"
              @click="snackbar = 'success'"
            >
              가입 정보 확인
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="position-fixed bottom-1 end-1 z-index-2">
      <material-snackbar
        v-if="snackbar === 'success'"
        title="시스템 알림"
        date="방금 전"
        description="성공적으로 로그인되었습니다."
        :icon="{ component: 'done', color: 'white' }"
        color="success"
        :close-handler="closeSnackbar"
      />
      <material-snackbar
        v-if="snackbar === 'info'"
        title="접속 알림"
        date="방금 전"
        :description="`${userName}님의 접속을 확인했습니다.`"
        :icon="{ component: 'notifications', color: 'white' }"
        color="info"
        :close-handler="closeSnackbar"
      />
    </div>
  </div>
</template>

<script>
import MaterialSnackbar from "@/components/MaterialSnackbar.vue";

export default {
  name: "Home",
  components: {
    MaterialSnackbar,
  },
  data() {
    return {
      snackbar: null,
      userName: "",
    };
  },
  mounted() {
    // 로그인 시 저장했던 이름을 가져옴
    this.userName = localStorage.getItem("userName") || "사용자";
  },
  methods: {
    closeSnackbar() {
      this.snackbar = null;
    },
  },
};
</script>

<style scoped>
.display-1 {
  font-size: 5rem;
  letter-spacing: -2px;
}
.card {
  box-shadow: var(--app-shadow-sm);
}
</style>
