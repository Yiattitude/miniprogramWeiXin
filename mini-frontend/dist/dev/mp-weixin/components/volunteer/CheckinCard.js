"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_format = require("../../utils/format.js");
if (!Math) {
  Icon();
}
const Icon = () => "../common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "CheckinCard",
  props: {
    activity: {}
  },
  emits: ["checkin"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const STATUS_TEXT = {
      recruiting: "招募中",
      upcoming: "即将开始",
      ongoing: "进行中",
      ended: "已结束"
    };
    function handleCheckin() {
      if (!props.activity.isCheckedIn) {
        emit("checkin", props.activity);
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(_ctx.activity.name),
        b: _ctx.activity.isCheckedIn
      }, _ctx.activity.isCheckedIn ? {} : _ctx.activity.status === "ongoing" ? {} : {
        d: common_vendor.t(STATUS_TEXT[_ctx.activity.status] || "已结束")
      }, {
        c: _ctx.activity.status === "ongoing",
        e: common_vendor.p({
          name: "time-line",
          size: "13px"
        }),
        f: common_vendor.t(common_vendor.unref(utils_format.formatActivityTime)(_ctx.activity.startTime, _ctx.activity.endTime)),
        g: common_vendor.p({
          name: "location-line",
          size: "13px"
        }),
        h: common_vendor.t(_ctx.activity.location),
        i: _ctx.activity.isCheckedIn
      }, _ctx.activity.isCheckedIn ? {} : {
        j: common_vendor.o(handleCheckin)
      }, {
        k: _ctx.activity.isCheckedIn ? 1 : ""
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0721d630"]]);
wx.createComponent(Component);
