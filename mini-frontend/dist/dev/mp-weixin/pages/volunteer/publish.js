"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_volunteer = require("../../stores/volunteer.js");
if (!Array) {
  const _easycom_uv_datetime_picker2 = common_vendor.resolveComponent("uv-datetime-picker");
  _easycom_uv_datetime_picker2();
}
const _easycom_uv_datetime_picker = () => "../../node-modules/@climblee/uv-ui/components/uv-datetime-picker/uv-datetime-picker.js";
if (!Math) {
  _easycom_uv_datetime_picker();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "publish",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const volunteerStore = stores_volunteer.useVolunteerStore();
    common_vendor.onMounted(() => {
      if (!userStore.isAdmin) {
        common_vendor.index.showToast({ title: "权限不足", icon: "none" });
        common_vendor.index.navigateBack();
      }
    });
    const form = common_vendor.reactive({
      name: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      maxCount: 10
    });
    const startTimeText = common_vendor.ref("");
    const endTimeText = common_vendor.ref("");
    const startPickerRef = common_vendor.ref(null);
    const endPickerRef = common_vendor.ref(null);
    const submitting = common_vendor.ref(false);
    common_vendor.ref(null);
    function formatTimestamp(ts) {
      const d = new Date(ts);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function onStartPickerConfirm(e) {
      const ts = typeof e.value === "number" ? e.value : new Date(e.value).getTime();
      const formatted = formatTimestamp(ts);
      form.startTime = formatted;
      startTimeText.value = formatted;
      showStartPicker.value = false;
    }
    function onEndPickerConfirm(e) {
      const ts = typeof e.value === "number" ? e.value : new Date(e.value).getTime();
      const formatted = formatTimestamp(ts);
      form.endTime = formatted;
      endTimeText.value = formatted;
      showEndPicker.value = false;
    }
    function onMaxCountInput(val) {
      const n = parseInt(val);
      form.maxCount = isNaN(n) ? 1 : Math.min(999, Math.max(1, n));
    }
    async function handleSubmit() {
      if (!form.name.trim())
        return common_vendor.index.showToast({ title: "请输入活动名称", icon: "none" });
      if (form.name.length > 50)
        return common_vendor.index.showToast({ title: "活动名称不超过50字", icon: "none" });
      if (!form.startTime)
        return common_vendor.index.showToast({ title: "请选择开始时间", icon: "none" });
      if (!form.endTime)
        return common_vendor.index.showToast({ title: "请选择结束时间", icon: "none" });
      if (form.endTime <= form.startTime)
        return common_vendor.index.showToast({ title: "结束时间须晚于开始时间", icon: "none" });
      if (!form.location.trim())
        return common_vendor.index.showToast({ title: "请输入活动地点", icon: "none" });
      if (!form.description.trim())
        return common_vendor.index.showToast({ title: "请填写活动内容/需求", icon: "none" });
      if (form.maxCount < 1 || form.maxCount > 999)
        return common_vendor.index.showToast({ title: "报名人数须在1-999之间", icon: "none" });
      submitting.value = true;
      try {
        await volunteerStore.publishActivity(form);
        common_vendor.index.showToast({ title: "发布成功！", icon: "success" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      } catch (e) {
        console.error("[publish] error:", e);
      } finally {
        submitting.value = false;
      }
    }
    function handleReset() {
      form.name = "";
      form.startTime = "";
      form.endTime = "";
      form.location = "";
      form.description = "";
      form.maxCount = 10;
      startTimeText.value = "";
      endTimeText.value = "";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.name,
        b: common_vendor.o(($event) => form.name = $event.detail.value),
        c: common_vendor.t(form.name.length),
        d: common_vendor.t(startTimeText.value || "请选择开始时间"),
        e: common_vendor.n(startTimeText.value ? "has-val" : "no-val"),
        f: common_vendor.o(($event) => {
          var _a;
          return (_a = startPickerRef.value) == null ? void 0 : _a.open();
        }),
        g: common_vendor.t(endTimeText.value || "请选择结束时间"),
        h: common_vendor.n(endTimeText.value ? "has-val" : "no-val"),
        i: common_vendor.o(($event) => {
          var _a;
          return (_a = endPickerRef.value) == null ? void 0 : _a.open();
        }),
        j: form.location,
        k: common_vendor.o(($event) => form.location = $event.detail.value),
        l: common_vendor.o(($event) => form.maxCount = Math.max(1, form.maxCount - 1)),
        m: String(form.maxCount),
        n: common_vendor.o(($event) => onMaxCountInput($event.detail.value)),
        o: common_vendor.o(($event) => form.maxCount = Math.min(999, form.maxCount + 1)),
        p: form.description,
        q: common_vendor.o(($event) => form.description = $event.detail.value),
        r: common_vendor.t(form.description.length),
        s: common_vendor.o(handleReset),
        t: submitting.value
      }, submitting.value ? {} : {}, {
        v: common_vendor.n(submitting.value ? "btn-disabled" : ""),
        w: common_vendor.o(($event) => !submitting.value && handleSubmit()),
        x: common_vendor.sr(startPickerRef, "9a77e90c-0", {
          "k": "startPickerRef"
        }),
        y: common_vendor.o(onStartPickerConfirm),
        z: common_vendor.p({
          mode: "datetime",
          title: "选择开始时间"
        }),
        A: common_vendor.sr(endPickerRef, "9a77e90c-1", {
          "k": "endPickerRef"
        }),
        B: common_vendor.o(onEndPickerConfirm),
        C: common_vendor.p({
          mode: "datetime",
          title: "选择结束时间"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a77e90c"]]);
wx.createPage(MiniProgramPage);
