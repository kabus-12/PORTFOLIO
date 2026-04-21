<script setup>
// import { useRouter } from "vue-router";
// import { ref } from "vue";
// const router = useRouter();
// const id = ref("");
// const password = ref("");
// const login = async function () {
//   const member = { id: id.value, password: password.value };
// const result = await fetch(`http://localhost:3000/user/login`, {
//   method: "post",
//   headers: {
//     "content-type": "application/json",
//   },
//   body: JSON.stringify(member),
// }).then((res) => {
//   return res.json();
// });

// console.log(result);
// if (result.retCode == "OK") {
//   memberStore.setMember({
//     id: result.info.user_id,
//     center: result.info.registernum,
//     grade: result.info.grade,
//   });
//   if (result.info.approve == "k1") {
//     router.push("/document");
//   }
// }
// };
</script>

<template>
  <h2>로그인페이지 작업</h2>
  <form>
    id:<input type="text" name="id" v-model="id" /><br />
    password:<input type="password" name="password" v-model="password" />
    <br />
    <button type="button" @click="login">로그인</button>
    <button type="reset">취소</button>
  </form>
</template>
