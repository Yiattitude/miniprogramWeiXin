"use strict";
const api_http = require("./http.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function getAdminUsers(params) {
  return __async(this, null, function* () {
    const data = yield api_http.cloudCall("adminGetUsers", params);
    return { code: 0, data };
  });
}
function getAdminUser(id) {
  return __async(this, null, function* () {
    const data = yield api_http.cloudCall("adminGetUser", { id });
    return { code: 0, data };
  });
}
function adjustUserPoints(data) {
  return __async(this, null, function* () {
    const result = yield api_http.cloudCall("adjustUserPoints", data);
    return { code: 0, data: result };
  });
}
function getPointsLogs(userId) {
  return __async(this, null, function* () {
    const data = yield api_http.cloudCall("getPointsLogs", { userId });
    return { code: 0, data };
  });
}
function getAdminCheckins(params) {
  return __async(this, null, function* () {
    const data = yield api_http.cloudCall("adminGetCheckins", params);
    return { code: 0, data };
  });
}
function auditCheckin(data) {
  return __async(this, null, function* () {
    const result = yield api_http.cloudCall("auditCheckin", data);
    return { code: 0, data: result };
  });
}
function getAdminStats() {
  return __async(this, null, function* () {
    const data = yield api_http.cloudCall("adminGetStats");
    return { code: 0, data };
  });
}
function getAdminHonors(params) {
  return __async(this, null, function* () {
    const data = yield api_http.cloudCall("adminGetHonors", params);
    return { code: 0, data };
  });
}
function auditHonor(data) {
  return __async(this, null, function* () {
    const result = yield api_http.cloudCall("adminAuditHonor", data);
    return { code: 0, data: result };
  });
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
