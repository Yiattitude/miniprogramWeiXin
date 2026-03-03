"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_format = require("../../utils/format.js");
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
        d: common_vendor.t(STATUS_TEXT[_ctx.activity.status])
      }, {
        c: _ctx.activity.status === "ongoing",
        e: common_vendor.t(common_vendor.unref(utils_format.formatActivityTime)(_ctx.activity.startTime, _ctx.activity.endTime)),
        f: common_vendor.t(_ctx.activity.location),
        g: _ctx.activity.isCheckedIn
      }, _ctx.activity.isCheckedIn ? {} : {
        h: common_vendor.o(handleCheckin)
      }, {
        i: _ctx.activity.isCheckedIn ? 1 : ""
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0721d630"]]);
wx.createComponent(Component);
