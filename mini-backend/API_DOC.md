# 后端对接文档

> 本文档面向后端开发者，描述前端期望的接口规范。  
> 前端完成对接后，只需将 `src/api/volunteer.ts` 中的 Mock 导入切换为真实实现即可上线。

---
## 0. 前端切换 Mock → 真实接口

编辑 `mini-frontend/src/api/volunteer.ts`，将顶部的 Mock 导出注释掉，取消注释真实接口实现即可：

```ts
// 注释掉 Mock：
// export { ... } from './mock'

// 启用真实接口（取消以下注释）：
import { http } from './http'
// ... 见文件内已有代码
```

同时在 `mini-frontend/.env.development` 中配置正确的后端地址：

```env
VITE_API_BASE_URL=http://localhost:8080
```


## 1. 基础约定

| 项目 | 说明 |
|------|------|
| BaseURL | `http://localhost:8080`（可通过前端 `.env` 的 `VITE_API_BASE_URL` 修改） |
| 数据格式 | 请求/响应均为 `application/json` |
| 认证方式 | `Authorization: Bearer <token>`（请求头） |
| 时间格式 | ISO 8601，如 `2026-03-10T09:00:00.000Z` |

### 统一响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

| code | 含义 |
|------|------|
| `0` | 成功 |
| `401` | 未登录 / Token 失效，前端自动跳转登录页 |
| 其他 | 业务错误，前端弹出 `message` 提示 |

---

## 2. 数据类型

### Activity（志愿活动）

```ts
{
  id: string
  name: string
  startTime: string          // ISO 8601
  endTime: string
  location: string
  description: string
  maxCount: number           // 最大报名人数
  enrollCount: number        // 当前已报名人数
  status: 'recruiting' | 'upcoming' | 'ongoing' | 'ended'
  publisherId: string
  createdAt: string
  isSignedUp?: boolean       // 当前登录用户是否已报名
  isCheckedIn?: boolean      // 当前登录用户是否已打卡
}
```

### CheckinRecord（打卡记录）

```ts
{
  id: string
  activityId: string
  activityName: string
  activityLocation: string
  serviceHours: number       // 服务时长（小时，步长 0.5）
  serviceCount: number       // 服务人数
  photos: string[]           // 现场照片 URL 数组（最多 9 张）
  remark: string
  checkedAt: string
  status: 'pending' | 'approved' | 'rejected'
}
```

### StatisticsData（统计报表）

```ts
{
  totalHours: number
  totalCount: number
  totalServed: number
  byCategory: Array<{ category: string; count: number; totalHours: number }>
  byActivity: Array<{ activityName: string; personCount: number; totalHours: number }>
}
```

### 分页参数 & 响应

```ts
// 请求 Query
{ page: number; pageSize?: number }   // pageSize 默认 10

// 响应 data 字段
{ list: T[]; total: number }
```

---

## 3. 接口列表

### 3.1 活动管理

#### 获取活动列表
```
GET /api/volunteer/activities
```
Query：`page`, `pageSize`, `keyword?`, `location?`, `startDate?`, `endDate?`  
Response data：`PageResult<Activity>`

#### 获取活动详情
```
GET /api/volunteer/activities/:id
```
Response data：`Activity`

#### 发布活动（需登录，需管理员权限）
```
POST /api/volunteer/activities
```
Body：
```json
{
  "name": "string",
  "startTime": "string",
  "endTime": "string",
  "location": "string",
  "description": "string",
  "maxCount": 30
}
```
Response data：`Activity`

---

### 3.2 报名管理

#### 报名活动
```
POST /api/volunteer/signups
```
Body：`{ "activityId": "string" }`  
Response data：`null`

#### 取消报名
```
DELETE /api/volunteer/signups/:activityId
```
Response data：`null`

#### 获取我的报名列表
```
GET /api/volunteer/signups/mine
```
Response data：`Activity[]`

---

### 3.3 打卡管理

#### 提交打卡
```
POST /api/volunteer/checkins
```
Body：
```json
{
  "activityId": "string",
  "serviceHours": 2.5,
  "serviceCount": 10,
  "photos": ["https://cdn.example.com/photo1.jpg"],
  "remark": "string（可选）"
}
```
Response data：`CheckinRecord`

#### 获取我的打卡记录
```
GET /api/volunteer/records/mine
```
Query：`page`, `pageSize`  
Response data：`PageResult<CheckinRecord>`

---

### 3.4 统计报表

#### 获取统计数据
```
GET /api/volunteer/statistics
```
Query：`timeRange?`（`today` / `week` / `month` / `custom`）、`startDate?`、`endDate?`  
Response data：`StatisticsData`

#### 导出报告
```
POST /api/volunteer/statistics/export
```
Body：`{ "timeRange": "month", "startDate?": "...", "endDate?": "..." }`  
Response data：`{ "downloadUrl": "https://..." }`

---


