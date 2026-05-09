import { supabase } from '../lib/supabase'
import type { Restaurant, RestaurantInsert } from '../types/restaurant'

/**
 * 从数据库加载餐厅数据列表
 * 1、通过 Supabase JavaScript SDK 发送 HTTP 请求到 Supabase 服务，
 * 2、服务端执行 SQL 查询并返回 JSON 数据，前端解析为 JavaScript 对象数组。
 * @returns 餐厅数据列表
 */
// 按到访日期倒序，最近吃的排在最前面
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('visited_date', { ascending: false })
  if (error) throw error
  return data as Restaurant[]
}

// .select().single() 让插入后立即拿到含 id 的完整记录
export async function addRestaurant(restaurant: RestaurantInsert) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRestaurant(id: number) {
  const { error } = await supabase.from('restaurants').delete().eq('id', id)
  if (error) throw error
}

export async function updateNotes(id: number, notes: string) {
  const { error } = await supabase.from('restaurants').update({ notes }).eq('id', id)
  if (error) throw error
}
