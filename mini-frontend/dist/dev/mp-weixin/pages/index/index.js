"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_volunteer = require("../../stores/volunteer.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  _easycom_uv_loading_icon2();
}
const _easycom_uv_loading_icon = () => "../../components/stub/uv-loading-icon.js";
if (!Math) {
  (Icon + _easycom_uv_loading_icon + ActivityCard)();
}
const Icon = () => "../../components/common/Icon.js";
const ActivityCard = () => "../../components/volunteer/ActivityCard.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const activities = common_vendor.ref([]);
    const activityPage = common_vendor.ref(1);
    const activityPageSize = common_vendor.ref(4);
    const activityLoading = common_vendor.ref(false);
    const activityFinished = common_vendor.ref(false);
    common_vendor.onMounted(async () => {
      if (userStore.isLoggedIn && !userStore.userInfo) {
        await userStore.fetchProfile();
      }
    });
    common_vendor.onLoad(() => {
      computePageSize();
      loadActivities(true);
    });
    common_vendor.onReachBottom(() => {
      if (!activityFinished.value) {
        loadActivities();
      }
    });
    function goVolunteer() {
      common_vendor.index.switchTab({ url: "/pages/volunteer/index" });
    }
    function onCheckin(activity) {
      common_vendor.index.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity._id}` });
    }
    function computePageSize() {
      try {
        const { windowHeight } = common_vendor.index.getSystemInfoSync();
        const reservedHeight = 380;
        const cardHeight = 140;
        const count = Math.ceil((windowHeight - reservedHeight) / cardHeight);
        activityPageSize.value = Math.min(8, Math.max(3, count));
      } catch (e) {
        activityPageSize.value = 4;
      }
    }
    function getPublishTime(activity) {
      const ts = Date.parse(activity.createdAt || activity.startTime || activity.endTime || "");
      return Number.isFinite(ts) ? ts : 0;
    }
    function mergeActivities(current, incoming) {
      const map = /* @__PURE__ */ new Map();
      current.forEach((item) => map.set(item._id, item));
      incoming.forEach((item) => map.set(item._id, item));
      return Array.from(map.values()).sort(
        (a, b) => getPublishTime(b) - getPublishTime(a)
      );
    }
    async function loadActivities(reset = false) {
      if (activityLoading.value)
        return;
      if (reset) {
        activityPage.value = 1;
        activityFinished.value = false;
        activities.value = [];
        volunteerStore.resetFilter();
      }
      if (activityFinished.value)
        return;
      activityLoading.value = true;
      try {
        const result = await volunteerStore.fetchActivityList(
          activityPage.value,
          activityPageSize.value
        );
        const incoming = Array.isArray(result.list) ? result.list : [];
        const merged = mergeActivities(activities.value, incoming);
        activities.value = merged;
        const totalFromResult = typeof result.total === "number" ? result.total : null;
        const reachedTotal = totalFromResult !== null ? merged.length >= totalFromResult : incoming.length < activityPageSize.value;
        if (reachedTotal || incoming.length === 0) {
          activityFinished.value = true;
        } else {
          activityPage.value += 1;
        }
      } catch (e) {
        console.error("[index] loadActivities error:", e);
        common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "加载失败", icon: "none" });
      } finally {
        activityLoading.value = false;
      }
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: ((_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.avatar) || "/static/default-avatar.png",
        b: common_vendor.t(common_vendor.unref(userStore).userInfo ? "你好，" + common_vendor.unref(userStore).userInfo.nickName : "欢迎使用"),
        c: common_vendor.t(((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.unit) || "银才荟-志愿服务平台"),
        d: common_vendor.unref(userStore).isLoggedIn && common_vendor.unref(userStore).userInfo
      }, common_vendor.unref(userStore).isLoggedIn && common_vendor.unref(userStore).userInfo ? {
        e: common_vendor.t(common_vendor.unref(userStore).userInfo.totalHours || 0),
        f: common_vendor.t(common_vendor.unref(userStore).userInfo.totalCount || 0),
        g: common_vendor.t(common_vendor.unref(userStore).userInfo.totalServed || 0)
      } : {}, {
        h: common_vendor.p({
          name: "hand-heart-line",
          size: "28px"
        }),
        i: common_vendor.p({
          name: "arrow-right-line",
          size: "24px"
        }),
        j: common_vendor.o(goVolunteer),
        k: activityLoading.value && activities.value.length === 0
      }, activityLoading.value && activities.value.length === 0 ? {
        l: common_vendor.p({
          size: "36"
        })
      } : {}, {
        m: common_vendor.f(activities.value, (item, k0, i0) => {
          return {
            a: item._id,
            b: common_vendor.o(onCheckin, item._id),
            c: "83a5a03c-3-" + i0,
            d: common_vendor.p({
              activity: item
            })
          };
        }),
        n: !activityLoading.value && activities.value.length === 0
      }, !activityLoading.value && activities.value.length === 0 ? {} : {}, {
        o: activities.value.length > 0
      }, activities.value.length > 0 ? common_vendor.e({
        p: activityLoading.value
      }, activityLoading.value ? {
        q: common_vendor.p({
          size: "26"
        })
      } : activityFinished.value ? {} : {}, {
        r: activityFinished.value
      }) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
