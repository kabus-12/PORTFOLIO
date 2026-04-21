import { defineStore } from "pinia";

export const useMemberStore = defineStore("member", {
  state: () => ({
    id: "",
    center: "",
    grade: "",
    name: "",
  }),

  actions: {
    setMember(data) {
      this.id = data.id;
      this.center = data.center;
      this.grade = data.grade;
      this.name = data.name;
    },

    logout() {
      this.$reset();
    },
  },
  persist: true,
});
