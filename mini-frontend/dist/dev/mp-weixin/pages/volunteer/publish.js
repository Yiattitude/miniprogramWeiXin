"use strict";
const common_vendor = require("../../common/vendor.js");
const api_volunteer = require("../../api/volunteer.js");
const composables_useAuth = require("../../composables/useAuth.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "publish",
  setup(__props) {
    const { requireLogin } = composables_useAuth.useAuth();
    const categories = ["传承红色文化", "参与基层治理", "服务企业发展", "实施以老助老", "其他服务"];
    const form = common_vendor.ref({
      name: "",
      category: "",
      location: "",
      startDate: "",
      startClock: "",
      endDate: "",
      endClock: "",
      maxCount: 0,
      description: ""
    });
    const submitting = common_vendor.ref(false);
    function onCategoryChange(e) {
      form.value.category = categories[e.detail.value];
    }
    function onStartDateChange(e) {
      form.value.startDate = e.detail.value;
    }
    function onStartClockChange(e) {
      form.value.startClock = e.detail.value;
    }
    function onEndDateChange(e) {
      form.value.endDate = e.detail.value;
    }
    function onEndClockChange(e) {
      form.value.endClock = e.detail.value;
    }
    function toIsoString(dateStr, timeStr) {
      if (!dateStr || !timeStr)
        return "";
      const parts = dateStr.split("-").map(Number);
      const tparts = timeStr.split(":").map(Number);
      if (parts.length !== 3 || tparts.length < 2)
        return "";
      const dt = new Date(parts[0], parts[1] - 1, parts[2], tparts[0], tparts[1], 0);
      if (Number.isNaN(dt.getTime()))
        return "";
      return dt.toISOString();
    }
    function onSubmit() {
      return __async(this, null, function* () {
        const ok = yield requireLogin({
          content: "发布活动需要先登录，是否立即登录？"
        });
        if (!ok)
          return;
        const { name, category, location, startDate, startClock, endDate, endClock, maxCount } = form.value;
        if (!name.trim())
          return common_vendor.index.showToast({ title: "请填写活动名称", icon: "none" });
        if (!category)
          return common_vendor.index.showToast({ title: "请选择活动分类", icon: "none" });
        if (!location.trim())
          return common_vendor.index.showToast({ title: "请填写活动地点", icon: "none" });
        if (!startDate || !startClock)
          return common_vendor.index.showToast({ title: "请选择开始日期和时间", icon: "none" });
        if (!endDate || !endClock)
          return common_vendor.index.showToast({ title: "请选择结束日期和时间", icon: "none" });
        if (!maxCount || maxCount <= 0)
          return common_vendor.index.showToast({ title: "请填写正确的名额上限", icon: "none" });
        const startTime = toIsoString(startDate, startClock);
        const endTime = toIsoString(endDate, endClock);
        if (!startTime || !endTime)
          return common_vendor.index.showToast({ title: "时间格式不合法", icon: "none" });
        if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
          return common_vendor.index.showToast({ title: "结束时间必须晚于开始时间", icon: "none" });
        }
        submitting.value = true;
        try {
          yield api_volunteer.publishActivity({
            name: name.trim(),
            category,
            location: location.trim(),
            startTime,
            endTime,
            maxCount,
            description: form.value.description.trim()
          });
          common_vendor.index.showToast({ title: "发布成功", icon: "success" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } catch (err) {
          common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "发布失败，请重试", icon: "none" });
        } finally {
          submitting.value = false;
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: form.value.name,
        b: common_vendor.o(($event) => form.value.name = $event.detail.value),
        c: common_vendor.t(form.value.category || "请选择活动分类"),
        d: !form.value.category ? 1 : "",
        e: categories,
        f: common_vendor.o(onCategoryChange),
        g: form.value.location,
        h: common_vendor.o(($event) => form.value.location = $event.detail.value),
        i: common_vendor.t(form.value.startDate || "选择日期"),
        j: !form.value.startDate ? 1 : "",
        k: form.value.startDate,
        l: common_vendor.o(onStartDateChange),
        m: common_vendor.t(form.value.startClock || "选择时间"),
        n: !form.value.startClock ? 1 : "",
        o: form.value.startClock,
        p: common_vendor.o(onStartClockChange),
        q: common_vendor.t(form.value.endDate || "选择日期"),
        r: !form.value.endDate ? 1 : "",
        s: form.value.endDate,
        t: common_vendor.o(onEndDateChange),
        v: common_vendor.t(form.value.endClock || "选择时间"),
        w: !form.value.endClock ? 1 : "",
        x: form.value.endClock,
        y: common_vendor.o(onEndClockChange),
        z: form.value.maxCount,
        A: common_vendor.o(common_vendor.m(($event) => form.value.maxCount = $event.detail.value, {
          number: true
        })),
        B: form.value.description,
        C: common_vendor.o(($event) => form.value.description = $event.detail.value),
        D: submitting.value,
        E: common_vendor.o(onSubmit)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a77e90c"]]);
wx.createPage(MiniProgramPage);
