<script setup>
import { ref, nextTick, computed, watch } from "vue";
import MaterialInput from "@/components/MaterialInput.vue";
import MaterialButton from "@/components/MaterialButton.vue";
import MaterialRadio from "@/components/MaterialRadio.vue";

// --- 폼 데이터 상태 ---
const id = ref("");
const password = ref("");
const pwcheck = ref("");
const name = ref("");
const tel = ref("");
const email = ref("");
const grade = ref("a1");

// --- 주소 & 기관 상태 ---
const zipCode = ref("");
const address = ref("");
const detailAddress = ref("");
const center = ref("");
const isAddressVisible = ref(false); // 주소창 표시
const showCenterModal = ref(false); // 기관 모달 표시

// --- 검증 상태 ---
const idDuplicateChecked = ref(false);

// 비밀번호 일치 확인
const pwMatchMessage = computed(() => {
  if (!pwcheck.value) return "";
  return pwcheck.value === password.value
    ? "비밀번호가 일치합니다"
    : "비밀번호가 다릅니다";
});

// --- 1. 아이디 중복 확인 ---
const checkIdDuplicate = async () => {
  if (!id.value) return alert("아이디를 입력해주세요.");
  try {
    const res = await fetch(`http://localhost:3000/user/check/${id.value}`);
    const result = await res.json();
    if (result.result.count === 0) {
      alert("사용 가능한 아이디입니다.");
      idDuplicateChecked.value = true;
    } else {
      alert("이미 사용 중인 아이디입니다.");
      idDuplicateChecked.value = false;
    }
  } catch (e) {
    alert("서버와 통신할 수 없습니다.");
  }
};

// --- 2. 주소 검색 (임베드 방식) ---
const openAddressSearch = () => {
  isAddressVisible.value = !isAddressVisible.value;
  if (isAddressVisible.value) {
    nextTick(() => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          address.value = data.roadAddress || data.jibunAddress;
          zipCode.value = data.zonecode;
          isAddressVisible.value = false;
        },
        width: "100%",
        height: "100%",
      }).embed(document.getElementById("address-layer"));
    });
  }
};

// --- 3. 기관 선택 모달 ---
const selectCenter = (name) => {
  center.value = name;
  showCenterModal.value = false;
};

// --- 4. 회원가입 전송 ---
const signUp = async () => {
  if (!idDuplicateChecked.value) return alert("아이디 중복확인을 해주세요.");
  if (password.value !== pwcheck.value)
    return alert("비밀번호를 확인해주세요.");

  const payload = {
    userId: id.value,
    userPw: password.value,
    userName: name.value,
    userTel: tel.value,
    userEmail: email.value,
    userGrade: grade.value,
    zipCode: zipCode.value,
    userAddress: address.value,
    centerName: center.value,
  };

  try {
    const res = await fetch("http://localhost:3000/user/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.retCode === "OK") {
      alert("회원가입이 완료되었습니다!");
    } else {
      alert("가입 실패: " + result.message);
    }
  } catch (e) {
    alert("서버 통신 에러가 발생했습니다.");
  }
};

// 아이디 수정 시 중복확인 리셋
watch(id, () => {
  idDuplicateChecked.value = false;
});
</script>

<template>
  <div class="container mt-5 pb-5">
    <div v-if="showCenterModal" class="custom-modal-backdrop">
      <div class="card shadow-lg p-3 custom-modal-content">
        <h6>기관 검색</h6>
        <div class="list-group mt-3">
          <button
            @click="selectCenter('강남장애인복지관')"
            class="list-group-item list-group-item-action"
          >
            강남장애인복지관
          </button>
          <button
            @click="selectCenter('강남세움복지관')"
            class="list-group-item list-group-item-action"
          >
            강남세움복지관
          </button>
          <button
            @click="selectCenter('성모자애복지관')"
            class="list-group-item list-group-item-action"
          >
            성모자애복지관
          </button>
        </div>
        <material-button
          class="mt-3"
          color="secondary"
          @click="showCenterModal = false"
          >닫기</material-button
        >
      </div>
    </div>

    <div class="card p-4 shadow-sm">
      <h4 class="text-center mb-4">회원가입</h4>

      <div class="d-flex gap-2 mb-3 align-items-end">
        <material-input
          v-model="id"
          label="아이디"
          variant="outline"
          class="flex-grow-1"
        />
        <material-button color="dark" size="sm" @click="checkIdDuplicate"
          >중복확인</material-button
        >
      </div>

      <material-input
        v-model="password"
        type="password"
        label="비밀번호"
        variant="outline"
        class="mb-3"
      />
      <material-input
        v-model="pwcheck"
        type="password"
        label="비밀번호 확인"
        variant="outline"
      />
      <p
        class="text-xs mt-1 mb-3"
        :class="password === pwcheck ? 'text-success' : 'text-danger'"
      >
        {{ pwMatchMessage }}
      </p>

      <material-input
        v-model="name"
        label="이름"
        variant="outline"
        class="mb-3"
      />
      <material-input
        v-model="tel"
        label="연락처"
        variant="outline"
        class="mb-3"
      />
      <material-input
        v-model="email"
        label="이메일"
        variant="outline"
        class="mb-3"
      />

      <div class="d-flex gap-2 mb-3 align-items-end">
        <material-input
          v-model="zipCode"
          label="우편번호"
          variant="outline"
          readonly
          class="flex-grow-1"
        />
        <material-button color="success" size="sm" @click="openAddressSearch"
          >주소 검색</material-button
        >
      </div>
      <div
        v-show="isAddressVisible"
        id="address-layer"
        class="address-wrap"
      ></div>
      <material-input
        v-model="address"
        label="기본 주소"
        variant="outline"
        readonly
        class="mb-3"
      />
      <material-input
        v-model="detailAddress"
        label="상세 주소"
        variant="outline"
        class="mb-3"
      />

      <div class="d-flex gap-2 mb-3 align-items-end">
        <material-input
          v-model="center"
          label="소속 기관"
          variant="outline"
          readonly
          class="flex-grow-1"
        />
        <material-button color="info" size="sm" @click="showCenterModal = true"
          >기관 검색</material-button
        >
      </div>

      <div class="mb-4">
        <material-radio v-model="grade" value="a1">일반사용자</material-radio>
        <material-radio v-model="grade" value="a2">기관담당자</material-radio>
      </div>

      <material-button
        color="success"
        variant="gradient"
        fullWidth
        size="lg"
        @click="signUp"
        >가입하기</material-button
      >
    </div>
  </div>
</template>

<style scoped>
.address-wrap {
  border: 1px solid var(--app-border);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  height: 400px;
  overflow: hidden;
}
.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--app-backdrop);
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
}
.custom-modal-content {
  width: 90%;
  max-width: 400px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
