# 后端 - Supabase 配置说明

## 第一次部署步骤（仅项目创建者需要操作一次）

1. 前往 [supabase.com](https://supabase.com) 注册并创建新项目
2. 进入项目 → 左侧菜单 **SQL Editor** → 新建查询
3. 把 `schema.sql` 的内容粘贴进去，点击 **Run**
4. 进入 **Project Settings → API**，复制：
   - `Project URL`
   - `anon public` key
5. 打开前端目录下的 `.env.local`，填入这两个值：
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
6. 将填好的 `.env.local` 提交到 GitHub（`.env.example` 仅作参考模板）

## 其他人下载项目后

直接运行即可，无需任何配置：

```bash
cd front
npm install
npm run dev
```
