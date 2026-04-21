import { createRouter, createWebHistory } from "vue-router";
import SignIn from "@/views/SignIn.vue";
import SignUp from "@/views/SignUp.vue";
import list from "@/views/list/list.vue";
import work from "../views/work/work.vue";
import Home from "@/views/Home.vue";
import FindId from "@/views/FindId.vue";
import findpw from "@/views/findpw.vue";
import Mypage from "@/views/mypage/mypage.vue";
import { useMemberStore } from "@/store/member";
const routes = [
  {
    path: "/",
    redirect: "/sign-in",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  {
    path: "/find-id",
    name: "FindId",
    component: FindId,
    meta: { hideHeader: true },
  },
  {
    path: "/find-pw",
    name: "FindPw",
    component: findpw,
    meta: { hideHeader: true },
  },
  {
    path: "/wait-approval",
    name: "WaitApproval",
    component: () => import("@/views/WaitApproval.vue"),
  },
  {
    path: "/work",
    name: "work",
    component: work,
    description: "서류관련 페이지들",
    meta: { requiredLevel: ["a2", "a3"] },
    children: [
      {
        path: "plan",
        components: { right: () => import("../views/work/plan.vue") },
        meta: { requiredLevel: ["a2"] },
        description: "계획조회",
      },
      {
        path: "plan_manager",
        components: { right: () => import("../views/work/plan_manager.vue") },
        meta: { requiredLevel: ["a3"] },
      },
      {
        path: "priority",
        components: {
          right: () => import("../views/work/priority.vue"),
        },
        meta: { requiredLevel: ["a2"] },
      },
      {
        path: "priority_manager",
        components: {
          right: () => import("../views/work/priority_manager.vue"),
        },
        meta: { requiredLevel: ["a3"] },
      },
      {
        path: "record",
        components: { right: () => import("../views/work/record.vue") },
        meta: { requiredLevel: ["a2", "a3"] },
      },
      {
        path: "result",
        components: { right: () => import("../views/work/result.vue") },
        meta: { requiredLevel: ["a2", "a3"] },
      },
      {
        path: "representative",
        components: { right: () => import("../views/work/representative.vue") },
        meta: { requiredLevel: ["a2", "a3"] },
      },
    ],
  },
  // 지원자 관련 목록
  {
    path: "/support",
    name: "Support",
    component: list,
    redirect: "/support/supported",
    children: [
      {
        path: "supported", // 등록된 지원자 목록
        component: () => import("@/views/list/supportedList.vue"),
        meta: { requiredLevel: ["a1"] },
      },
      {
        path: "info", // 등록된 지원자 정보 보는 목록
        component: () => import("@/views/list/SupportedInfo.vue"),
        meta: { requiredLevel: ["a1", "a2"] },
      },
      {
        path: "look", // 자기에게 배정받은 지원자 목록 (기관 담당자)
        component: () => import("@/views/list/managementList.vue"),
        meta: { requiredLevel: ["a2"] },
      },
      {
        path: "allotment", // 미배정 담당자가 있는 지원자에게 담당자 배정
        component: () => import("@/views/list/requestList.vue"),
        meta: { requiredLevel: ["a3"] },
      },
      {
        path: "appreq",
        component: () => import("@/views/list/appReqList.vue"),
        meta: { requiredLevel: ["a3"] },
      },
    ],
  },
  {
    path: "/center",
    name: "Center",
    component: () => import("@/views/list/centerList.vue"),
    meta: { requiredLevel: ["a4"] },
  },
  {
    path: "/document",
    name: "Document",
    component: list,
    children: [
      {
        path: "",
        component: () => import("@/views/list/documentLIST.vue"),
      },
      {
        path: "write",
        component: () => import("@/views/document/write_document.vue"),
        meta: { requiredLevel: ["a1"] },
      },
    ],
  },
  {
    path: "/form",
    name: "Form",
    component: list,
    meta: { requiredLevel: ["a4"] },
    children: [
      {
        path: "",
        component: () => import("@/views/form/formList.vue"),
        meta: { requiredLevel: ["a4"] },
      },
      {
        path: "write",
        component: () => import("@/views/form/formWrite.vue"),
        meta: { requiredLevel: ["a4"] },
      },
      {
        path: "view/:num",
        component: () => import("@/views/form/formView.vue"),
        meta: { requiredLevel: ["a4"] },
      },
    ],
  },

  {
    path: "/sign-in",
    name: "SignIn",
    component: SignIn,
    meta: { hideHeader: true },
  },
  {
    path: "/sign-up",
    name: "SignUp",
    component: SignUp,
    meta: { hideHeader: true },
  },
  {
    path: "/reset-password",
    name: "resetPW",
    component: () => import("@/views/ResetPassword.vue"),
  },
  {
    path: "/approval", // 일반회원 가입승인
    component: () => import("@/views/mypage/Approvalpage.vue"),
    meta: { requiredLevel: ["a3"] },
  },
  {
    path: "/mypage", // 마이페이지 메인 화면 (접속 시 본인확인을 위해 비밀번호 입력)
    component: Mypage,
    children: [
      {
        path: "info", // 내정보 수정
        component: () => import("@/views/mypage/mypageInfo.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});
router.beforeEach((to, from, next) => {
  const memberStore = useMemberStore(); // 2단계에서 만든 내 권한 가져오기
  const myLevel = memberStore.grade; // 내 실제 등급
  // console.log(to.name);
  //로그인,회원가입,아이디 비밀번호 찾기는 로그인 없이도가능
  if (["SignIn", "SignUp", "resetPW", "FindPw", "FindId"].includes(to.name)) {
    return next();
  }

  //로그인이 안되어 있으면 로그인 후 이용가능
  if (!myLevel) {
    alert("로그인후 이용 가능합니다");
    return next({ name: "SignIn" });
  }

  const requiredLevel = to.meta.requiredLevel; // 1단계에서 정한 합격 기준
  console.log(requiredLevel);
  if (!requiredLevel) {
    return next();
  }
  //
  if (requiredLevel && !requiredLevel.includes(myLevel)) {
    alert("접근이 금지된 페이지 입니다");
    return next(false); // ❌ 입장 거부 (이전 페이지 유지)
  }
  return next(); // ✅ 입장 허가
});
export default router;
