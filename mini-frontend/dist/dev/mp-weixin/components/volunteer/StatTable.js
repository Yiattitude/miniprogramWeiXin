"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "StatTable",
  props: {
    columns: {},
    rows: {},
    totalRow: { default: void 0 }
  },
  setup(__props) {
    function cellAlign(col) {
      return col.align ?? "left";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(_ctx.columns, (col, ci, i0) => {
          return {
            a: common_vendor.t(col.label),
            b: ci,
            c: cellAlign(col)
          };
        }),
        b: common_vendor.f(_ctx.rows, (row, ri, i0) => {
          return {
            a: common_vendor.f(row, (cell, ci, i1) => {
              return {
                a: common_vendor.t(cell),
                b: ci,
                c: cellAlign(_ctx.columns[ci])
              };
            }),
            b: ri,
            c: ri % 2 === 1 ? 1 : ""
          };
        }),
        c: _ctx.totalRow && _ctx.totalRow.length
      }, _ctx.totalRow && _ctx.totalRow.length ? {
        d: common_vendor.f(_ctx.totalRow, (cell, ci, i0) => {
          return {
            a: common_vendor.t(cell),
            b: ci,
            c: cellAlign(_ctx.columns[ci])
          };
        })
      } : {}, {
        e: _ctx.rows.length === 0
      }, _ctx.rows.length === 0 ? {} : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2df3b14a"]]);
wx.createComponent(Component);
