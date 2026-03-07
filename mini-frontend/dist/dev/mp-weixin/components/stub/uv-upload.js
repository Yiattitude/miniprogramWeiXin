"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "uv-upload",
  props: {
    fileList: { default: () => [] },
    maxCount: { default: 9 },
    maxSize: { default: 5 * 1024 * 1024 },
    uploadIcon: {},
    previewFullImage: { type: Boolean, default: true }
  },
  emits: ["update:fileList"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    function onChoose() {
      const remaining = props.maxCount - props.fileList.length;
      common_vendor.index.chooseImage({
        count: remaining,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success(res) {
          const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths];
          const newFiles = paths.map((path) => ({ path, url: "" }));
          emit("update:fileList", [...props.fileList, ...newFiles]);
        }
      });
    }
    function onRemove(index) {
      const list = [...props.fileList];
      list.splice(index, 1);
      emit("update:fileList", list);
    }
    function onPreview(index) {
      if (!props.previewFullImage)
        return;
      const urls = props.fileList.map((f) => f.url || f.path).filter(Boolean);
      if (!urls.length)
        return;
      common_vendor.index.previewImage({ urls, current: urls[index] });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(_ctx.fileList, (item, index, i0) => {
          return {
            a: item.url || item.path,
            b: common_vendor.o(($event) => onRemove(index), index),
            c: index,
            d: common_vendor.o(($event) => onPreview(index), index)
          };
        }),
        b: _ctx.fileList.length < _ctx.maxCount
      }, _ctx.fileList.length < _ctx.maxCount ? {
        c: common_vendor.o(onChoose)
      } : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-35716e1f"]]);
wx.createComponent(Component);
