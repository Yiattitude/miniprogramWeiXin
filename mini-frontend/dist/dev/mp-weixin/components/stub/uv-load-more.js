"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "uv-load-more",
  props: {
    status: { default: "loadmore" }
  },
  emits: ["loadmore"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: _ctx.status === "loading"
      }, _ctx.status === "loading" ? {} : _ctx.status === "nomore" ? {} : {
        c: common_vendor.o(($event) => emit("loadmore"))
      }, {
        b: _ctx.status === "nomore"
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aed33775"]]);
wx.createComponent(Component);
