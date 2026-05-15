import { supabase } from '../lib/supabase'
import type { Restaurant, RestaurantInsert, RestaurantMessage } from '../types/restaurant'

type RestaurantRow = Omit<Restaurant, 'messages'>

/**
 * 获取数据库中的所有餐厅信息，包括消息板条目
 * @returns 所有餐厅的数组，每个餐厅包含其消息板条目
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data: restaurantsData, error: restaurantsError } = await supabase
    .from('restaurants')
    .select('*')
    .order('visited_date', { ascending: false })
  if (restaurantsError) throw restaurantsError

  const restaurants = (restaurantsData ?? []) as RestaurantRow[]
  const restaurantIds = restaurants.map(item => item.id)

  let messages: RestaurantMessage[] = []
  if (restaurantIds.length > 0) {
    const { data: messagesData, error: messagesError } = await supabase
      .from('restaurant_messages')
      .select('*')
      .in('restaurant_id', restaurantIds)
      .order('created_at', { ascending: false })
    if (messagesError) throw messagesError
    messages = (messagesData ?? []) as RestaurantMessage[]
  }

  const messagesByRestaurantId = new Map<number, RestaurantMessage[]>()
  for (const message of messages) {
    const existing = messagesByRestaurantId.get(message.restaurant_id)
    if (existing) {
      existing.push(message)
    } else {
      messagesByRestaurantId.set(message.restaurant_id, [message])
    }
  }

  return restaurants.map(restaurant => ({
    ...restaurant,
    messages: messagesByRestaurantId.get(restaurant.id) ?? [],
  }))
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
