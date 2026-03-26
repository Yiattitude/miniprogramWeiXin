移除前端 mock 逻辑（强制跳转/假数据），改为真实接口调用：
mini-frontend/src/pages/auth/login.vue
mini-frontend/src/pages/auth/UserBind.vue（已删除）
mini-frontend/src/pages/admin/user-manage.vue
mini-frontend/src/pages/admin/user-detail.vue
替换管理端 API 为云函数调用（保持原有 code/data 返回结构）：
mini-frontend/src/api/admin.ts
云函数补齐登录、绑定、荣誉、管理员功能，并对接前端字段：
mini-frontend/cloudfunctions/volunteer-service/index.js
清理注释中的 mock 字样：
mini-frontend/src/api/volunteer.ts
功能层面我补齐了这些云函数动作

登录/绑定：wechatLogin、bindUser
荣誉：submitHonor、adminGetHonors、adminAuditHonor
管理端：adminGetUsers、adminGetUser、getPointsLogs、adjustUserPoints、adminGetCheckins、auditCheckin、adminGetStats
打卡字段对齐：submitCheckin 支持 declaredPoints / activityCategory
个人统计补齐：getStatistics 返回 totalPoints/totalCheckins/totalHonors + 记录列表
你需要做的验证步骤

部署云函数：mini-frontend/cloudfunctions/volunteer-service
云数据库准备集合：users、records、honors、points_logs（以及已有的 activities、signups）
确保管理员权限：把你的用户在 users 集合中 role 设为 admin
重新编译并走以下流程：
登录 → 绑定 → 首页
提交打卡 → 管理端审核 → 积分增长
荣誉提交 → 管理端审核 → 积分增长