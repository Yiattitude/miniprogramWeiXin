"use strict";
const api_http = require("./http.js");
async function getAdminUsers(params) {
  const data = await api_http.cloudCall("adminGetUsers", params);
  return { code: 0, data };
}
async function getAdminUser(id) {
  const data = await api_http.cloudCall("adminGetUser", { id });
  return { code: 0, data };
}
async function adjustUserPoints(data) {
  const result = await api_http.cloudCall("adjustUserPoints", data);
  return { code: 0, data: result };
}
async function getPointsLogs(userId) {
  const data = await api_http.cloudCall("getPointsLogs", { userId });
  return { code: 0, data };
}
async function getAdminCheckins(params) {
  const data = await api_http.cloudCall("adminGetCheckins", params);
  return { code: 0, data };
}
async function auditCheckin(data) {
  const result = await api_http.cloudCall("auditCheckin", data);
  return { code: 0, data: result };
}
async function getAdminStats() {
  const data = await api_http.cloudCall("adminGetStats");
  return { code: 0, data };
}
async function getAdminHonors(params) {
  const data = await api_http.cloudCall("adminGetHonors", params);
  return { code: 0, data };
}
async function auditHonor(data) {
  const result = await api_http.cloudCall("adminAuditHonor", data);
  return { code: 0, data: result };
}
exports.adjustUserPoints = adjustUserPoints;
exports.auditCheckin = auditCheckin;
exports.auditHonor = auditHonor;
exports.getAdminCheckins = getAdminCheckins;
exports.getAdminHonors = getAdminHonors;
exports.getAdminStats = getAdminStats;
exports.getAdminUser = getAdminUser;
exports.getAdminUsers = getAdminUsers;
exports.getPointsLogs = getPointsLogs;
