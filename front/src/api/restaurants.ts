import { supabase } from '../lib/supabase'
import type { Restaurant, RestaurantInsert, RestaurantMessage } from '../types/restaurant'

/**
 * 获取数据库中的所有餐厅信息，仅包含留言计数（不加载留言详情）
 * 初始加载更快，留言在打开留言板时懒加载
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, message_count:restaurant_messages(count)')
    .order('visited_date', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => {
    const { message_count, ...rest } = row
    // Supabase 返回 message_count 为 [{count: N}] 的数组形式
    const count = Array.isArray(message_count) && message_count.length > 0
      ? (message_count[0] as Record<string, number>).count
      : 0
    return { ...rest, message_count: count } as unknown as Restaurant
  })
}

/**
 * 懒加载某个餐厅的留言列表
 */
export async function fetchRestaurantMessages(restaurantId: number): Promise<RestaurantMessage[]> {
  const { data, error } = await supabase
    .from('restaurant_messages')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as RestaurantMessage[]
}

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

export async function addRestaurantMessage(restaurantId: number, author: string, content: string): Promise<RestaurantMessage> {
  const { data, error } = await supabase
    .from('restaurant_messages')
    .insert({
      restaurant_id: restaurantId,
      author: author.trim(),
      content: content.trim(),
    })
    .select()
    .single()
  if (error) throw error
  return data as RestaurantMessage
}

export async function deleteRestaurantMessage(messageId: number) {
  const { error } = await supabase
    .from('restaurant_messages')
    .delete()
    .eq('id', messageId)
  if (error) throw error
}
