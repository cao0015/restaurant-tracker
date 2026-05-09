// 与 Supabase restaurants 表结构一一对应
export interface Restaurant {
  id: number
  name: string
  city: string
  address: string
  cuisine_type: string
  rating: number
  notes: string
  avg_cost: number | null
  visited_date: string
  created_at: string
  poi_id: string | null  // 高德 POI ID，有则跳详情页，无则关键词搜索
}

// id 和 created_at 由数据库自动生成，插入时不需要传
export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at'>
