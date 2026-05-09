# 🍜 我的餐厅记录

> 记录每一家吃过的餐厅，随时翻看，永不遗忘。

一个基于 Supabase 的无服务器餐厅打卡工具。所有人 clone 后直接共享同一份云端数据库，无需部署任何后端服务。

---

## 功能特性

- **浏览 & 搜索** — 按餐厅名称、城市、菜系实时过滤
- **菜系筛选** — 下拉筛选器从已有数据自动派生，无需手动维护
- **添加餐厅** — 支持高德地图 POI 搜索自动填入，也可手动录入
- **地图直达** — 点击餐厅名称，有 POI ID 时跳详情页，否则关键词搜索
- **评分记录** — 1–5 星评分 + 备注
- **删除记录** — 带二次确认的删除操作
- **离线可用** — 打包后的 `dist/` 可直接用浏览器打开，无需 web 服务器（hash 路由）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) + TypeScript |
| UI 组件库 | [Element Plus](https://element-plus.org/) |
| 数据库 | [Supabase](https://supabase.com/)（托管 PostgreSQL + 匿名 RLS） |
| 地图 API | [高德地图 Web 服务 API](https://lbs.amap.com/) |
| 路由 | Vue Router（hash 模式） |

无独立后端服务器，前端直接通过 Supabase JS SDK 读写数据库。

---

## 项目结构

```
restaurant-tracker/
├── front/                  # Vue 3 前端 SPA
│   ├── src/
│   │   ├── api/            # Supabase 数据库操作
│   │   ├── components/     # AddRestaurantDialog、RestaurantCard
│   │   ├── lib/            # supabase 客户端、高德 POI 搜索
│   │   ├── router/         # Vue Router（hash 模式）
│   │   ├── types/          # Restaurant、RestaurantInsert 类型
│   │   └── views/          # HomeView 主页面
│   └── public/
│       └── favicon.svg
└── back/
    └── schema.sql          # 建表 SQL + RLS 策略（在 Supabase SQL Editor 执行一次）
```

---

## 快速开始

数据库凭据已随仓库提交（`front/.env.local`），clone 后所有人共享同一份云端数据，无需任何额外配置。

```bash
git clone <repo-url>
cd restaurant-tracker/front
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5173` 即可使用。

> **想用自己的数据库？** 在 [supabase.com](https://supabase.com) 新建项目，执行 `back/schema.sql` 建表，然后将 `front/.env.local` 中的三个变量替换为你自己的值即可。高德 Key 申请见 [高德开放平台](https://lbs.amap.com/)（Web 服务类型）。

---

## 数据库说明

`back/schema.sql` 会创建 `restaurants` 表并开启行级安全（RLS）：

| 操作 | 权限 |
|------|------|
| 查询 | 任何人（匿名） |
| 插入 | 任何人（匿名） |
| 删除 | 任何人（匿名） |

> **注意：** 当前策略允许任何人删除记录，适合私人小圈子共享使用。如需限制删除权限，将 `back/schema.sql` 中的 `public delete` 策略改为要求认证用户即可。

**注意：**有一个缺点，要是一周不使用，这个supabase会被锁起来，要手动解锁。要是90天没有解锁，数据库就会被删掉。

---

## 数据备份

由于 Supabase 免费项目 **90 天不活跃会被删除**，建议定期备份数据。

```bash
cd front
pnpm backup
# → 已备份 42 条记录 → backup/restaurants.json
```

备份文件是 `backup/restaurants.json`，每次运行覆盖旧文件并提交到 GitHub，git 历史即版本记录。

---

## 常用命令

```bash
# 开发
pnpm dev

# 生产构建
pnpm build

# 预览构建产物
pnpm preview

# 仅类型检查
pnpm vue-tsc --noEmit

# 备份数据库到本地 JSON
pnpm backup
```

---

## License

MIT
