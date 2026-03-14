"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_format = require("../../utils/format.js");
if (!Math) {
  Icon();
}
const Icon = () => "../common/Icon.js";
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
      recruiting: { text: "\u62db\u52df\u4e2d", color: "#3a7bd5", bg: "#eef3fc" },
      upcoming: { text: "\u5373\u5c06\u5f00\u59cb", color: "#e67e22", bg: "#fff3e0" },
      ongoing: { text: "\u8fdb\u884c\u4e2d", color: "#27ae60", bg: "#e6f9f0" },
      ended: { text: "\u5df2\u7ed3\u675f", color: "#a0aab5", bg: "#f0f2f4" }
    };
    const statusInfo = common_vendor.computed(() => {
      return STATUS_MAP[props.activity.status] || STATUS_MAP.ended;
    });
    const enrollPercent = common_vendor.computed(() => {
      if (!props.activity.maxCount)
        return 0;
      return Math.min(props.activity.enrollCount / props.activity.maxCount * 100, 100);
    });
    function handleClick() {
      emit("click", props.activity);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(_ctx.activity.name),
        b: common_vendor.t(statusInfo.value.text),
        c: statusInfo.value.color,
        d: statusInfo.value.bg,
        e: _ctx.activity.isSignedUp
      }, _ctx.activity.isSignedUp ? {} : {}, {
        f: common_vendor.p({
          name: "time-line",
          size: "14px"
        }),
        g: common_vendor.t(common_vendor.unref(utils_format.formatActivityTime)(_ctx.activity.startTime, _ctx.activity.endTime)),
        h: common_vendor.p({
          name: "location-line",
          size: "14px"
        }),
        i: common_vendor.t(_ctx.activity.location),
        j: common_vendor.p({
          name: "group-line",
          size: "14px"
        }),
        k: common_vendor.t(_ctx.activity.enrollCount),
        l: common_vendor.t(_ctx.activity.maxCount),
        m: enrollPercent.value + "%",
        n: common_vendor.o(handleClick)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-42741bb8"]]);
wx.createComponent(Component);