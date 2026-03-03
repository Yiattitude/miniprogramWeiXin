"use strict";
const common_vendor = require("../common/vendor.js");
let _nextId = 100;
function genId() {
  return String(++_nextId);
}
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function calcStatus(startTime, endTime) {
  const now2 = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (now2 < start)
    return "recruiting";
  if (now2 >= start && now2 <= end)
    return "ongoing";
  return "ended";
}
const _activities = [
  {
    id: "1",
    name: "社区环保清洁行动",
    startTime: "2026-03-10 09:00",
    endTime: "2026-03-10 12:00",
    location: "市中心广场",
    description: "组织志愿者清洁社区公共区域，维护城市环境卫生，请穿着舒适运动鞋参加。",
    maxCount: 30,
    enrollCount: 12,
    status: "recruiting",
    publisherId: "admin",
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false
  },
  {
    id: "2",
    name: "老年人健康讲座志愿服务",
    startTime: "2026-03-15 14:00",
    endTime: "2026-03-15 17:00",
    location: "社区服务站二楼",
    description: "协助组织老年人健康知识讲座，负责签到、引导及会场维护工作。",
    maxCount: 20,
    enrollCount: 8,
    status: "recruiting",
    publisherId: "admin",
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false
  },
  {
    id: "3",
    name: "春季义诊活动",
    startTime: "2026-03-20 08:30",
    endTime: "2026-03-20 16:00",
    location: "人民医院门诊大厅",
    description: "协助医护人员开展免费义诊，协助维持秩序、引导患者排队就诊。",
    maxCount: 15,
    enrollCount: 15,
    status: "recruiting",
    publisherId: "admin",
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false
  },
  {
    id: "4",
    name: "小学课外辅导",
    startTime: "2026-03-22 15:00",
    endTime: "2026-03-22 17:30",
    location: "育才小学图书室",
    description: "为小学生提供课外功课辅导，科目不限，需有耐心和爱心。",
    maxCount: 10,
    enrollCount: 6,
    status: "recruiting",
    publisherId: "admin",
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false
  },
  {
    id: "5",
    name: "公园绿化种植",
    startTime: "2026-04-05 08:00",
    endTime: "2026-04-05 11:00",
    location: "人民公园东门广场",
    description: "参与园林绿化种植活动，种植树苗及花草，美化公共绿地环境。",
    maxCount: 50,
    enrollCount: 23,
    status: "recruiting",
    publisherId: "admin",
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false
  }
];
const _mySignups = [];
const _myRecords = [];
function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}
function paginate(arr, page, pageSize) {
  const start = (page - 1) * pageSize;
  return {
    list: arr.slice(start, start + pageSize),
    total: arr.length
  };
}
async function getActivityList(params) {
  await delay();
  console.log("[mock] getActivityList called, total activities:", _activities.length);
  let list = [..._activities];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    list = list.filter(
      (a) => a.name.toLowerCase().includes(kw) || a.location.toLowerCase().includes(kw)
    );
  }
  if (params.location) {
    list = list.filter((a) => a.location.includes(params.location));
  }
  return paginate(list, params.page, params.pageSize ?? 10);
}
async function getActivityById(id) {
  await delay();
  const a = _activities.find((a2) => a2.id === id);
  if (!a)
    throw new Error(`活动 ${id} 不存在`);
  return { ...a };
}
async function publishActivity(form) {
  await delay(600);
  const newActivity = {
    id: genId(),
    name: form.name,
    startTime: form.startTime,
    endTime: form.endTime,
    location: form.location,
    description: form.description,
    maxCount: form.maxCount,
    enrollCount: 0,
    status: calcStatus(form.startTime, form.endTime),
    publisherId: "admin",
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false
  };
  _activities.unshift(newActivity);
  return { ...newActivity };
}
async function signup(activityId) {
  await delay();
  const idx = _activities.findIndex((a) => a.id === activityId);
  if (idx === -1)
    throw new Error("活动不存在");
  if (_activities[idx].isSignedUp)
    throw new Error("已报名该活动");
  _activities[idx] = {
    ..._activities[idx],
    isSignedUp: true,
    enrollCount: _activities[idx].enrollCount + 1
  };
  const already = _mySignups.find((a) => a.id === activityId);
  if (!already)
    _mySignups.push({ ..._activities[idx] });
}
async function cancelSignup(activityId) {
  await delay();
  const idx = _activities.findIndex((a) => a.id === activityId);
  if (idx !== -1) {
    _activities[idx] = {
      ..._activities[idx],
      isSignedUp: false,
      enrollCount: Math.max(0, _activities[idx].enrollCount - 1)
    };
  }
  const si = _mySignups.findIndex((a) => a.id === activityId);
  if (si !== -1)
    _mySignups.splice(si, 1);
}
async function getMySignups() {
  await delay();
  return _mySignups.map((a) => ({ ...a }));
}
async function submitCheckin(data) {
  await delay(600);
  const activity = _activities.find((a) => a.id === data.activityId);
  const record = {
    id: genId(),
    activityId: data.activityId,
    activityName: (activity == null ? void 0 : activity.name) ?? "未知活动",
    activityLocation: (activity == null ? void 0 : activity.location) ?? "",
    serviceHours: data.serviceHours,
    serviceCount: data.serviceCount,
    photos: data.photos,
    remark: data.remark ?? "",
    checkedAt: now(),
    status: "pending"
  };
  _myRecords.unshift(record);
  const ai = _activities.findIndex((a) => a.id === data.activityId);
  if (ai !== -1)
    _activities[ai] = { ..._activities[ai], isCheckedIn: true };
  const si = _mySignups.findIndex((a) => a.id === data.activityId);
  if (si !== -1)
    _mySignups[si] = { ..._mySignups[si], isCheckedIn: true };
  return { ...record };
}
async function getMyRecords(params) {
  await delay();
  return paginate(_myRecords, params.page, params.pageSize);
}
async function getStatistics(_params) {
  await delay();
  const totalHours = _myRecords.reduce((s, r) => s + r.serviceHours, 0);
  const totalCount = _myRecords.length;
  const totalServed = _myRecords.reduce((s, r) => s + r.serviceCount, 0);
  const byActivity = _myRecords.map((r) => ({
    activityName: r.activityName,
    personCount: r.serviceCount,
    totalHours: r.serviceHours
  }));
  return {
    totalHours,
    totalCount,
    totalServed,
    byCategory: [
      { category: "社区服务", count: Math.ceil(totalCount * 0.4), totalHours: Math.round(totalHours * 0.4 * 10) / 10 },
      { category: "医疗卫生", count: Math.ceil(totalCount * 0.3), totalHours: Math.round(totalHours * 0.3 * 10) / 10 },
      { category: "教育助学", count: Math.floor(totalCount * 0.3), totalHours: Math.round(totalHours * 0.3 * 10) / 10 }
    ].filter((r) => r.count > 0),
    byActivity
  };
}
async function exportReport(_params) {
  await delay(800);
  common_vendor.index.showToast({ title: "Mock 模式：暂不支持导出", icon: "none" });
  return { downloadUrl: "" };
}
exports.cancelSignup = cancelSignup;
exports.exportReport = exportReport;
exports.getActivityById = getActivityById;
exports.getActivityList = getActivityList;
exports.getMyRecords = getMyRecords;
exports.getMySignups = getMySignups;
exports.getStatistics = getStatistics;
exports.publishActivity = publishActivity;
exports.signup = signup;
exports.submitCheckin = submitCheckin;
