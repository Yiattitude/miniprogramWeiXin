"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
const composables_useAuth = require("../../composables/useAuth.js");
if (!Array) {
  const _easycom_uv_upload2 = common_vendor.resolveComponent("uv-upload");
  _easycom_uv_upload2();
}
const _easycom_uv_upload = () => "../../components/stub/uv-upload.js";
if (!Math) {
  _easycom_uv_upload();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "checkin-form",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const { requireLogin } = composables_useAuth.useAuth();
    const activityId = common_vendor.ref("");
    const activityName = common_vendor.ref("");
    const serviceHours = common_vendor.ref("");
    const serviceCount = common_vendor.ref("");
    const remark = common_vendor.ref("");
    const fileList = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const errors = common_vendor.ref({});
    common_vendor.onLoad(async (options) => {
      const id = (options == null ? void 0 : options.activityId) || "";
      activityId.value = id;
      if (!id)
        return;
      try {
        const activity = await volunteerStore.fetchActivityById(id);
        activityName.value = activity.name;
      } catch (e) {
        console.error("[checkin-form] fetchActivity error:", e);
      }
    });
    function validate() {
      errors.value = {};
      const hours = parseFloat(serviceHours.value);
      if (!serviceHours.value) {
        errors.value.hours = "请填写服务时长";
      } else if (isNaN(hours) || hours < 0.5 || hours > 24) {
        errors.value.hours = "服务时长须在 0.5 ~ 24 小时之间";
      } else if (hours * 10 % 5 !== 0) {
        errors.value.hours = "步长为 0.5 小时";
      }
      const count = parseInt(serviceCount.value);
      if (!serviceCount.value) {
        errors.value.count = "请填写服务人数";
      } else if (isNaN(count) || count < 1) {
        errors.value.count = "服务人数至少 1 人";
      }
      return Object.keys(errors.value).length === 0;
    }
    async function handleSubmit() {
      const ok = await requireLogin({
        content: "提交打卡需要先登录，是否立即登录？"
      });
      if (!ok)
        return;
      if (!validate())
        return;
      submitting.value = true;
      try {
        const photoUrls = fileList.value.map((f) => f.url || f.path);
        await volunteerStore.submitCheckin({
          activityId: activityId.value,
          serviceHours: parseFloat(serviceHours.value),
          serviceCount: parseInt(serviceCount.value),
          photos: photoUrls,
          remark: remark.value || void 0
        });
        common_vendor.index.showToast({ title: "打卡成功！", icon: "success" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      } catch (e) {
        console.error("[checkin-form] submit error:", e);
      } finally {
        submitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityName.value
      }, activityName.value ? {
        b: common_vendor.t(activityName.value)
      } : {}, {
        c: serviceHours.value,
        d: common_vendor.o(($event) => serviceHours.value = $event.detail.value),
        e: errors.value.hours ? 1 : "",
        f: errors.value.hours
      }, errors.value.hours ? {
        g: common_vendor.t(errors.value.hours)
      } : {}, {
        h: serviceCount.value,
        i: common_vendor.o(($event) => serviceCount.value = $event.detail.value),
        j: errors.value.count ? 1 : "",
        k: errors.value.count
      }, errors.value.count ? {
        l: common_vendor.t(errors.value.count)
      } : {}, {
        m: common_vendor.o(($event) => fileList.value = $event),
        n: common_vendor.p({
          ["max-count"]: 9,
          ["max-size"]: 5 * 1024 * 1024,
          ["upload-icon"]: "camera",
          ["preview-full-image"]: true,
          fileList: fileList.value
        }),
        o: remark.value,
        p: common_vendor.o(($event) => remark.value = $event.detail.value),
        q: common_vendor.t(remark.value.length),
        r: common_vendor.t(submitting.value ? "提交中..." : "提交打卡"),
        s: submitting.value ? 1 : "",
        t: submitting.value,
        v: common_vendor.o(handleSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2788f303"]]);
wx.createPage(MiniProgramPage);
