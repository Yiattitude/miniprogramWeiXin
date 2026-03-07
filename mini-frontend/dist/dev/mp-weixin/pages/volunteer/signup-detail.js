"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
const utils_format = require("../../utils/format.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  _easycom_uv_loading_icon2();
}
const _easycom_uv_loading_icon = () => "../../components/stub/uv-loading-icon.js";
if (!Math) {
  _easycom_uv_loading_icon();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "signup-detail",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const activityId = common_vendor.ref("");
    const activity = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const actionLoading = common_vendor.ref(false);
    const STATUS_MAP = {
      recruiting: { text: "招募中", color: "#3a7bd5", bg: "#eef3fc" },
      upcoming: { text: "即将开始", color: "#e67e22", bg: "#fff3e0" },
      ongoing: { text: "进行中", color: "#27ae60", bg: "#e6f9f0" },
      ended: { text: "已结束", color: "#a0aab5", bg: "#f0f2f4" }
    };
    const statusInfo = common_vendor.computed(() => {
      if (!activity.value)
        return STATUS_MAP.ended;
      return STATUS_MAP[activity.value.status] || STATUS_MAP.ended;
    });
    const isFull = common_vendor.computed(() => {
      return activity.value ? activity.value.enrollCount >= activity.value.maxCount : false;
    });
    const enrollPercent = common_vendor.computed(() => {
      if (!activity.value)
        return 0;
      return Math.min(activity.value.enrollCount / activity.value.maxCount * 100, 100);
    });
    common_vendor.onLoad(async (options) => {
      const id = (options == null ? void 0 : options.activityId) || "";
      activityId.value = id;
      if (!id)
        return;
      loading.value = true;
      try {
        activity.value = await volunteerStore.fetchActivityById(id);
      } catch (err) {
        console.error("[signup-detail] load error:", err);
      } finally {
        loading.value = false;
      }
    });
    async function handleSignup() {
      if (!activity.value)
        return;
      actionLoading.value = true;
      try {
        await volunteerStore.signupActivity(activity.value._id);
        activity.value.isSignedUp = true;
        activity.value.enrollCount++;
        common_vendor.index.showToast({ title: "报名成功！", icon: "success" });
      } catch (e) {
        console.error("[signup-detail] signup error:", e);
      } finally {
        actionLoading.value = false;
      }
    }
    async function handleCancel() {
      if (!activity.value)
        return;
      actionLoading.value = true;
      try {
        await volunteerStore.cancelSignup(activity.value._id);
        activity.value.isSignedUp = false;
        activity.value.enrollCount--;
        common_vendor.index.showToast({ title: "已取消报名", icon: "none" });
      } catch (e) {
        console.error("[signup-detail] cancel error:", e);
      } finally {
        actionLoading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          size: "36"
        })
      } : activity.value ? common_vendor.e({
        d: common_vendor.t(statusInfo.value.text),
        e: statusInfo.value.color,
        f: statusInfo.value.bg,
        g: common_vendor.t(activity.value.name),
        h: common_vendor.t(common_vendor.unref(utils_format.formatActivityTime)(activity.value.startTime, activity.value.endTime)),
        i: common_vendor.t(activity.value.location),
        j: common_vendor.t(common_vendor.unref(utils_format.formatDateTime)(activity.value.createdAt)),
        k: common_vendor.t(activity.value.enrollCount),
        l: common_vendor.t(activity.value.maxCount),
        m: enrollPercent.value + "%",
        n: isFull.value
      }, isFull.value ? {} : {}, {
        o: common_vendor.t(activity.value.description),
        p: activity.value.isSignedUp
      }, activity.value.isSignedUp ? {
        q: common_vendor.t(actionLoading.value ? "处理中..." : "取消报名"),
        r: actionLoading.value,
        s: common_vendor.o(handleCancel)
      } : common_vendor.e({
        t: activity.value.status !== "ended" && !isFull.value
      }, activity.value.status !== "ended" && !isFull.value ? {
        v: common_vendor.t(actionLoading.value ? "报名中..." : "确认报名"),
        w: actionLoading.value,
        x: common_vendor.o(handleSignup)
      } : activity.value.status === "ended" ? {} : isFull.value ? {} : {}, {
        y: activity.value.status === "ended",
        z: isFull.value
      })) : {}, {
        c: activity.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bf424cbb"]]);
wx.createPage(MiniProgramPage);
