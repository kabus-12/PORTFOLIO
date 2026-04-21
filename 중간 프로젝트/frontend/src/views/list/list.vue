<script setup>
/* eslint-disable */
// import MaterialButton from "@/components/MaterialButton.vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// 시스템 관리자 페이지의 버튼 변경
// const btnName = computed(() => {
//   return route.path.includes("center") ? "기관관리" : "지원자 관리";
// });

// const goplan = () => {
//   router.push("/work/plan");
// };

// const gopriority = () => {
//   router.push("/support/supported");
// };

// const gorecord = () => {
//   router.push("/work/record");
// };
// const gorepresentative = () => {
//   router.push("/work/representative");
// };
</script>
<template>
  <div class="work-layout">
    <div class="work-container">
      <!-- <div class="left">
        <RouterView name="left" />

        <div class="button">
          <material-button @click="gorepresentative" size="lg"
            >Home</material-button
          >

          <material-button @click="gopriority" size="lg">{{
            btnName
          }}</material-button>
          <br />
          <material-button @click="gorecord" size="lg"
            >마이페이지</material-button
          >

          <material-button @click="goplan" size="lg">로그아웃</material-button>
        </div>
      </div> -->

      <div class="right">
        <RouterView />
      </div>
    </div>
  </div>
</template>
<style scoped>
.work-layout {
  background-color: var(--app-surface-muted);
  
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.work-container {
  flex: 1 1 auto;
  min-height: min-content;
}

.right {
  overflow: visible;
}
</style>
