import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 解析 .env.local（Vite 约定格式：KEY=VALUE，每行一条）
const envRaw = readFileSync(join(__dirname, '../.env.local'), 'utf-8')
const env = Object.fromEntries(
  envRaw
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .order('visited_date', { ascending: false })

if (error) {
  console.error('备份失败：', error.message)
  process.exit(1)
}

const outFile = join(__dirname, '../../backup/restaurants.json')

writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8')
console.log(`已备份 ${data.length} 条记录 → backup/restaurants.json`)
