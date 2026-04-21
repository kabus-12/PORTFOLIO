<script setup>
// // import { ref, computed } from "vue";
// const id = ref("");
// const password = ref("");
// const pwcheck = ref("");
// const email = ref("");
// var idcheck = false;
// const check = async function () {
//   const result = await fetch(
//     `http://localhost:3000/user/check/${id.value}`,
//   ).then((res) => {
//     return res.json();
//   });
//   console.log(result);
//   if (result.result.count == 0) {
//     alert("사용가능합니다");
//     idcheck = true;
//   } else {
//     alert("이미사용중입니다");
//   }
// };
</script>

<template>
  <div class="registration-container">
    <h1>회원가입</h1>
    <form action="/auth/register" method="POST" id="regForm">
      <div class="form-group">
        <label>아이디</label>
        <input
          type="text"
          name="username"
          id="username"
          required
          v-model="id"
        />
        <button type="button" v-on:click="check">중복확인</button>
        <p id="idError" class="error-msg" style="display: none; color: red">
          *이미 사용 중인 아이디입니다.
        </p>
        {{ id }}
      </div>

      <div class="form-group">
        <label>비밀번호</label>
        <input
          type="password"
          name="password"
          id="password"
          required
          v-model="password"
        />
      </div>

      <div class="form-group">
        <label>비밀번호 확인</label>
        <input type="password" id="passwordConfirm" required />
        <p id="pwError" class="error-msg" style="display: none; color: red">
          *비밀번호가 일치하지 않습니다.
        </p>
      </div>

      <div class="form-group">
        <label>이메일</label>
        <input type="email" name="email" id="email" required v-model="email" />
        <p id="emailError" class="error-msg" style="display: none; color: red">
          *이미 가입된 이메일입니다.
        </p>
      </div>

      <div class="form-group">
        <label>주소</label>
        <input type="text" name="address" readonly />
        <button type="button">검색</button>
      </div>

      <button type="submit" class="submit-btn">가입하기</button>
    </form>
  </div>
</template>
