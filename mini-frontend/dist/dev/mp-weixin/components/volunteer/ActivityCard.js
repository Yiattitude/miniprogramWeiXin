"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_format = require("../../utils/format.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "ActivityCard",
  props: {
    activity: {}
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const STATUS_MAP = {
      recruiting: { text: "招募中", color: "#3a7bd5", bg: "#eef3fc" },
      upcoming: { text: "即将开始", color: "#e67e22", bg: "#fff3e0" },
      ongoing: { text: "进行中", color: "#27ae60", bg: "#e6f9f0" },
      ended: { text: "已结束", color: "#a0aab5", bg: "#f0f2f4" }
    };
    const enrollPercent = () => Math.min(props.activity.enrollCount / props.activity.maxCount * 100, 100);
    function handleClick() {
      emit("click", props.activity);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(_ctx.activity.name),
        b: common_vendor.t(STATUS_MAP[_ctx.activity.status].text),
        c: STATUS_MAP[_ctx.activity.status].color,
        d: STATUS_MAP[_ctx.activity.status].bg,
        e: _ctx.activity.isSignedUp
      }, _ctx.activity.isSignedUp ? {} : {}, {
        f: common_vendor.t(common_vendor.unref(utils_format.formatActivityTime)(_ctx.activity.startTime, _ctx.activity.endTime)),
        g: common_vendor.t(_ctx.activity.location),
        h: common_vendor.t(_ctx.activity.enrollCount),
        i: common_vendor.t(_ctx.activity.maxCount),
        j: enrollPercent() + "%",
        k: common_vendor.o(handleClick)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-42741bb8"]]);
wx.createComponent(Component);
