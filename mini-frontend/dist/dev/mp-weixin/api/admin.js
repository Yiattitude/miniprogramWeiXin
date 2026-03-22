"use strict";
require("../common/vendor.js");
function mockResolve(data, delay = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 0, data });
    }, delay);
  });
}
async function getAdminUsers(params) {
  const mockList = [
    { _id: "u1", _openid: "o1", realName: "张三", phone: "13800138000", totalPoints: 120, checkinCount: 5, role: "member", bindAt: "2023-10-01T10:00:00.000Z" },
    { _id: "u2", _openid: "o2", realName: "李四", phone: "13900139000", totalPoints: 85, checkinCount: 3, role: "member", bindAt: "2023-10-02T11:30:00.000Z" },
    { _id: "u3", _openid: "o3", realName: "王五", phone: "13700137000", totalPoints: 210, checkinCount: 12, role: "admin", bindAt: "2023-09-15T09:20:00.000Z" }
  ];
  const list = params.keyword ? mockList.filter((u) => u.realName.includes(params.keyword) || u.phone.includes(params.keyword)) : mockList;
  return mockResolve({ list, total: list.length });
}
async function adjustUserPoints(data) {
  return mockResolve({ success: true });
}
async function getPointsLogs(userId) {
  const list = [
    { _id: "l1", userId, operatorId: "sys", changeAmount: 20, afterPoints: 120, reason: "参与【社区清扫】获得", type: "audit_pass", createdAt: (/* @__PURE__ */ new Date()).toISOString() },
    { _id: "l2", userId, operatorId: "sys", changeAmount: -10, afterPoints: 100, reason: "手动扣除积分：违规操作", type: "manual_adjust", createdAt: new Date(Date.now() - 864e5).toISOString() }
  ];
  return mockResolve({ list });
}
async function getAdminCheckins(params) {
  const allRecords = [
    {
      _id: "r1",
      activityId: "a1",
      activityName: "社区助老活动",
      activityCategory: "实施以老助老",
      activityLocation: "社区中心",
      declaredPoints: 5,
      photos: [
        "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=400"
      ],
      remark: "今天陪老人聊天，帮忙打扫了房间的卫生。",
      _openid: "o1",
      realName: "张三",
      phone: "13800138000",
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    },
    {
      _id: "r2",
      activityId: "a2",
      activityName: "环保植树",
      activityCategory: "其他服务",
      activityLocation: "郊野公园",
      declaredPoints: 4,
      photos: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400"],
      remark: "顺利完成植树活动，种了两棵树。",
      _openid: "o2",
      realName: "李四",
      phone: "13900139000",
      checkedAt: new Date(Date.now() - 36e5).toISOString(),
      status: "approved"
    },
    {
      _id: "r3",
      activityId: "a3",
      activityName: "红色文化宣讲",
      activityCategory: "传承红色文化",
      activityLocation: "文化馆",
      declaredPoints: 8,
      photos: [],
      remark: "",
      _openid: "o1",
      realName: "张三",
      phone: "13800138000",
      checkedAt: new Date(Date.now() - 72e5).toISOString(),
      status: "rejected",
      rejectReason: "缺少现场照片证明，请重新提交打卡记录。"
    }
  ];
  const list = params.status ? allRecords.filter((r) => r.status === params.status) : allRecords;
  return mockResolve({ list, total: list.length });
}
async function auditCheckin(data) {
  return mockResolve({ success: true });
}
async function getAdminStats() {
  return mockResolve({
    totalUsers: 342,
    totalCheckins: 1205,
    totalPointsIssued: 4580,
    topUsers: [
      { realName: "王五", totalPoints: 210 },
      { realName: "张三", totalPoints: 120 },
      { realName: "李四", totalPoints: 85 },
      { realName: "赵六", totalPoints: 70 },
      { realName: "孙七", totalPoints: 60 }
    ]
  });
}
async function getAdminHonors(params) {
  const all = [
    {
      id: "h1",
      userName: "张三",
      phone: "13800138000",
      honorLevel: "国家级荣誉",
      honorPoints: 20,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      proofs: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400"
      ]
    },
    {
      id: "h2",
      userName: "李四",
      phone: "13900139000",
      honorLevel: "厅局级荣誉",
      honorPoints: 12,
      status: "approved",
      createdAt: new Date(Date.now() - 36e5).toISOString(),
      proofs: []
    },
    {
      id: "h3",
      userName: "王五",
      phone: "13700137000",
      honorLevel: "厂处级荣誉",
      honorPoints: 10,
      status: "rejected",
      createdAt: new Date(Date.now() - 72e5).toISOString(),
      rejectReason: "证明材料不清晰，请重新上传。"
    }
  ];
  const list = params.status ? all.filter((item) => item.status === params.status) : all;
  return mockResolve({ list, total: list.length });
}
async function auditHonor(_data) {
  return mockResolve({ success: true });
}
exports.adjustUserPoints = adjustUserPoints;
exports.auditCheckin = auditCheckin;
exports.auditHonor = auditHonor;
exports.getAdminCheckins = getAdminCheckins;
exports.getAdminHonors = getAdminHonors;
exports.getAdminStats = getAdminStats;
exports.getAdminUsers = getAdminUsers;
exports.getPointsLogs = getPointsLogs;
