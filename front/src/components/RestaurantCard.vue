<template>
  <el-card class="restaurant-card" shadow="hover">
    <div class="card-header">
      <span class="name" @click="openMap">{{ restaurant.name }}</span>
      <el-rate :model-value="restaurant.rating" disabled />
    </div>
    <div class="card-body">
      <el-tag size="small" type="info">{{ restaurant.cuisine_type }}</el-tag>
      <span class="city">{{ restaurant.city }}</span>
      <span v-if="restaurant.avg_cost" class="avg-cost">¥{{ restaurant.avg_cost }}/人</span>
      <span class="date">{{ restaurant.visited_date }}</span>
    </div>
    <div v-if="restaurant.address" class="address">{{ restaurant.address }}</div>
    <template v-if="editing">
      <el-input
        v-model="draftNotes"
        type="textarea"
        :rows="3"
        placeholder="口感、推荐菜等..."
        style="margin-top:8px"
        autofocus
      />
      <div class="edit-actions">
        <el-button size="small" :loading="saving" type="primary" @click="saveNotes">保存</el-button>
        <el-button size="small" @click="cancelEdit">取消</el-button>
      </div>
    </template>
    <div v-else-if="restaurant.notes" class="notes">{{ restaurant.notes }}</div>
    <div class="card-footer">
      <el-button size="small" text @click="startEdit">{{ restaurant.notes ? '编辑备注' : '添加备注' }}</el-button>
      <el-button type="danger" size="small" text @click="$emit('delete', restaurant.id)">删除</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Restaurant } from '../types/restaurant'
import { updateNotes } from '../api/restaurants'

/**
 * 从父组件接收餐厅数据，展示基本信息和备注，支持编辑备注和删除餐厅
 */
const props = defineProps<{ restaurant: Restaurant }>()
const emit = defineEmits<{ delete: [id: number]; notesUpdated: [id: number, notes: string] }>()

const editing = ref(false)
const draftNotes = ref('')
const saving = ref(false)

/**
 * 更新备注
 */
function startEdit() {
  draftNotes.value = props.restaurant.notes ?? ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveNotes() {
  saving.value = true
  try {
    await updateNotes(props.restaurant.id, draftNotes.value)
    emit('notesUpdated', props.restaurant.id, draftNotes.value)
    editing.value = false
  } catch {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 点击跳转地图
 */
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
.avg-cost {
  color: #e6a23c;
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
.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 6px;
}
</style>
