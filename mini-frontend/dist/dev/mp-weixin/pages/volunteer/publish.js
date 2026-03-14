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
        return common_vendor.index.showToast({ title: "\u8bf7\u586b\u5199\u6d3b\u52a8\u540d\u79f0", icon: "none" });
      if (!location.trim())
        return common_vendor.index.showToast({ title: "\u8bf7\u586b\u5199\u6d3b\u52a8\u5730\u70b9", icon: "none" });
      if (!startTime)
        return common_vendor.index.showToast({ title: "\u8bf7\u9009\u62e9\u5f00\u59cb\u65f6\u95f4", icon: "none" });
      if (!endTime)
        return common_vendor.index.showToast({ title: "\u8bf7\u9009\u62e9\u7ed3\u675f\u65f6\u95f4", icon: "none" });
      if (!maxCount || maxCount <= 0)
        return common_vendor.index.showToast({ title: "\u8bf7\u586b\u5199\u6b63\u786e\u7684\u540d\u989d\u4e0a\u9650", icon: "none" });
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
        common_vendor.index.showToast({ title: "\u53d1\u5e03\u6210\u529f", icon: "success" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "\u53d1\u5e03\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5", icon: "none" });
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
        e: common_vendor.t(form.value.startTime || "\u8bf7\u9009\u62e9\u5f00\u59cb\u65f6\u95f4"),
        f: !form.value.startTime ? 1 : "",
        g: form.value.startTime,
        h: common_vendor.o(onStartTimeChange),
        i: common_vendor.t(form.value.endTime || "\u8bf7\u9009\u62e9\u7ed3\u675f\u65f6\u95f4"),
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