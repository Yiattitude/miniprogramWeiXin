"use strict";
const common_vendor = require("../common/vendor.js");
const api_http = require("./http.js");
async function getActivityList(params) {
  return await api_http.cloudCall("getActivities", params);
}
async function getActivityById(id) {
  return await api_http.cloudCall("getActivityById", { id });
}
async function publishActivity(form) {
  return await api_http.cloudCall("publishActivity", form);
}
async function signup(activityId) {
  return await api_http.cloudCall("signup", { activityId });
}
async function cancelSignup(activityId) {
  return await api_http.cloudCall("cancelSignup", { activityId });
}
async function getMySignups() {
  return await api_http.cloudCall("getMySignups");
}
async function submitCheckin(data) {
  return await api_http.cloudCall("submitCheckin", data);
}
async function getMyRecords(params) {
  return await api_http.cloudCall("getMyRecords", params);
}
async function getStatistics() {
  return await api_http.cloudCall("getStatistics");
}
async function exportReport() {
  const fileID = await api_http.cloudCall("exportReport");
  const { fileList } = await common_vendor.wx$1.cloud.getTempFileURL({
    fileList: [fileID]
  });
  return { downloadUrl: fileList[0].tempFileURL };
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
