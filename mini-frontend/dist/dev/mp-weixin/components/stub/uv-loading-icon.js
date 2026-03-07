"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "uv-loading-icon",
  props: {
    size: { default: 28 }
  },
  setup(__props) {
    const props = __props;
    const px = common_vendor.computed(() => Number(props.size));
    const wrapStyle = common_vendor.computed(() => ({
      width: `${px.value}rpx`,
      height: `${px.value}rpx`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }));
    const spinStyle = common_vendor.computed(() => ({
      width: `${px.value}rpx`,
      height: `${px.value}rpx`
    }));
    return (_ctx, _cache) => {
      return {
        a: common_vendor.s(spinStyle.value),
        b: common_vendor.s(wrapStyle.value)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ce1c84ac"]]);
wx.createComponent(Component);
