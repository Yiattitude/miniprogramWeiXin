"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "Icon",
  props: {
    name: {},
    size: { default: "24px" },
    color: {},
    rotate: {}
  },
  setup(__props) {
    const props = __props;
    const iconClass = common_vendor.computed(() => {
      var _a;
      const name = (_a = props.name) == null ? void 0 : _a.trim();
      if (!name)
        return "";
      const normalized = name.replace(/^mgc[-_]/, "").replace(/-/g, "_");
      return `mgc_${normalized}`;
    });
    const iconStyle = common_vendor.computed(() => {
      const size = props.size;
      const fontSize = typeof size === "number" ? `${size}px` : size;
      const style = {
        "font-size": fontSize
      };
      if (props.color)
        style.color = props.color;
      if (props.rotate)
        style.transform = `rotate(${props.rotate}deg)`;
      return style;
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.n(iconClass.value),
        b: common_vendor.s(iconStyle.value)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d27583ff"]]);
wx.createComponent(Component);
