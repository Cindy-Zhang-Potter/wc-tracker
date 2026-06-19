# 世界杯数据自动更新 + 前端集成指南

## 这套东西做什么

GitHub Actions 每天定时跑一次脚本，拉取 [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) 的2026世界杯赛果，统计每队战绩，生成 `data/team_form.json`，自动 commit 回仓库。

你的前端（jsx计算器）可以直接 fetch 这个仓库里的 `team_form.json`（走 raw.githubusercontent.com 或你自己部署的静态文件）。

---

## 部署步骤

### 1. 建仓库，放好文件结构

```
your-repo/
├── .github/workflows/update-data.yml   # 定时任务配置
├── scripts/fetch_and_build.py          # 抓取脚本
└── data/team_form.json                 # 生成的数据（首次跑之前先手动跑一次占位）
```

### 2. 推送到 GitHub

```bash
git init
git add .
git commit -m "init: 世界杯数据自动更新"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 3. 确认 Actions 权限

仓库 Settings → Actions → General → Workflow permissions，选择
**"Read and write permissions"**（否则 push 会失败，因为默认是只读）。

### 4. 手动触发测试一次

仓库页面 → Actions 标签 → 左侧选 "每日更新世界杯数据" → 右侧 "Run workflow" 按钮，
手动跑一次，确认能成功生成 commit。

### 5. 之后就是全自动

每天 UTC 02:00（北京时间10点）自动跑。

**注意**：GitHub Actions 的 `schedule` 触发不保证分秒不差，仓库不活跃时可能延迟几分钟到十几分钟，这是 GitHub 的已知行为，不是配置问题。

---

## 前端怎么接

`worldcup-predictor.jsx` 已经改成 fetch 版本——打开文件顶部，把这一行改成你自己的仓库地址：

```javascript
const DATA_SOURCE_URL =
  "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/team_form.json";
```

改完直接部署（Cloudflare Pages / Vercel 都行，你熟悉的方式）。运行时逻辑：

- 页面加载时自动 fetch 这个 URL
- 拿到最新数据后，"近期状态"自动按新战绩重新计算
- 界面顶部有个状态条，告诉你当前是"已拉到最新数据"还是"拉取失败，用了内置兜底快照"
- fetch 失败不会白屏——内置了一份 6/19 的快照数据作为降级方案

**注意 raw.githubusercontent.com 的缓存**：这个域名走CDN，有时候你刚push新数据，几分钟内fetch到的可能还是旧版本（缓存没刷新）。如果发现数据没更新，等几分钟再试，或者考虑用 `jsdelivr.net`（`cdn.jsdelivr.net/gh/用户名/仓库名@main/data/team_form.json`，缓存策略不同，有时反而更快刷新）。

---

## 数据源局限性（务必知道）

- openfootball 是**人工维护**的开源项目，不是官方API，更新可能滞后于实际比赛结束时间几小时到一天
- 不含 xG（预期进球）等深度数据，仅有比分、进球者、阵容等基础信息
- 如果某天该项目维护者没及时更新，你的数据会停留在上一次成功抓取的结果，脚本不会报错（这是设计上的容错，避免一次源数据缺失就让整条pipeline失败）

## 调整定时频率

修改 `.github/workflows/update-data.yml` 里的 cron 表达式即可，比如想要每天跑两次：

```yaml
- cron: "0 2 * * *"   # UTC 02:00
- cron: "0 14 * * *"  # UTC 14:00
```
