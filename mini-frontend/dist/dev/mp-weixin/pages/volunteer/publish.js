"use strict";
const common_vendor = require("../../common/vendor.js");
const api_volunteer = require("../../api/volunteer.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "publish",
  setup(__props) {
    const form = common_vendor.ref({
      name: "",
      location: "",
      startTime: "",
      endTime: "",
      maxCount: 0,
      description: ""
    });
    const submitting = common_vendor.ref(false);
    function onStartTimeChange(e) {
      form.value.startTime = e.detail.value;
    }
    function onEndTimeChange(e) {
      form.value.endTime = e.detail.value;
    }
    async function onSubmit() {
      const { name, location, startTime, endTime, maxCount } = form.value;
      if (!name.trim())
        return common_vendor.index.showToast({ title: "请填写活动名称", icon: "none" });
      if (!location.trim())
        return common_vendor.index.showToast({ title: "请填写活动地点", icon: "none" });
      if (!startTime)
        return common_vendor.index.showToast({ title: "请选择开始时间", icon: "none" });
      if (!endTime)
        return common_vendor.index.showToast({ title: "请选择结束时间", icon: "none" });
      if (!maxCount || maxCount <= 0)
        return common_vendor.index.showToast({ title: "请填写正确的名额上限", icon: "none" });
      submitting.value = true;
      try {
        await api_volunteer.publishActivity({
          name: name.trim(),
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
    }
    return (_ctx, _cache) => {
      return {
        a: form.value.name,
        b: common_vendor.o(($event) => form.value.name = $event.detail.value),
        c: form.value.location,
        d: common_vendor.o(($event) => form.value.location = $event.detail.value),
        e: common_vendor.t(form.value.startTime || "请选择开始时间"),
        f: !form.value.startTime ? 1 : "",
        g: form.value.startTime,
        h: common_vendor.o(onStartTimeChange),
        i: common_vendor.t(form.value.endTime || "请选择结束时间"),
        j: !form.value.endTime ? 1 : "",
        k: form.value.endTime,
        l: common_vendor.o(onEndTimeChange),
        m: form.value.maxCount,
        n: common_vendor.o(common_vendor.m(($event) => form.value.maxCount = $event.detail.value, {
          number: true
        })),
        o: form.value.description,
        p: common_vendor.o(($event) => form.value.description = $event.detail.value),
        q: submitting.value,
        r: common_vendor.o(onSubmit)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a77e90c"]]);
wx.createPage(MiniProgramPage);
