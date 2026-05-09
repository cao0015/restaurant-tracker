<template>
  <el-card class="restaurant-card" shadow="hover">
    <div class="card-header">
      <span class="name" @click="openMap">{{ restaurant.name }}</span>
      <el-rate :model-value="restaurant.rating" disabled />
    </div>
    <div class="card-body">
      <el-tag size="small" type="info">{{ restaurant.cuisine_type }}</el-tag>
      <span class="city">{{ restaurant.city }}</span>
      <span class="date">{{ restaurant.visited_date }}</span>
    </div>
    <div v-if="restaurant.address" class="address">{{ restaurant.address }}</div>
    <div v-if="restaurant.notes" class="notes">{{ restaurant.notes }}</div>
    <div class="card-footer">
      <el-button type="danger" size="small" text @click="$emit('delete', restaurant.id)">删除</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { Restaurant } from '../types/restaurant'

/**
 * 从数据库中接受餐厅的ID
 */
const props = defineProps<{ restaurant: Restaurant }>()
defineEmits<{ delete: [id: number] }>()

function openMap() {
  if (props.restaurant.poi_id) {
    // 通过高德搜索录入的记录有 poi_id，直接跳到 POI 详情页，定位更准确
    window.open(`https://www.amap.com/detail/${props.restaurant.poi_id}`, '_blank')
  } else {
    // 手动录入的记录没有 poi_id，退回到关键词搜索
    const keyword = encodeURIComponent(`${props.restaurant.city} ${props.restaurant.name}`)
    window.open(`https://www.amap.com/search?query=${keyword}`, '_blank')
  }
}
</script>

<style scoped>
.restaurant-card {
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.name {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  cursor: pointer;
}
.name:hover {
  text-decoration: underline;
}
.card-body {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.city {
  color: #666;
  font-size: 13px;
}
.date {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}
.address {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
}
.notes {
  font-size: 13px;
  color: #777;
  font-style: italic;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
