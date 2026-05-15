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
    <div v-if="restaurant.notes" class="legacy-notes">原备注：{{ restaurant.notes }}</div>

    <div class="card-footer">
      <el-button size="small" text @click="messageDialogVisible = true">
        留言板（{{ restaurant.messages.length }}）
      </el-button>
      <el-button type="danger" size="small" text @click="$emit('delete', restaurant.id)">删除</el-button>
    </div>
  </el-card>

  <el-dialog
    v-model="messageDialogVisible"
    title="留言板"
    width="min(620px, 92vw)"
  >
    <div v-if="restaurant.messages.length === 0" class="message-empty">暂无留言</div>
    <div v-else class="message-list">
      <article v-for="message in restaurant.messages" :key="message.id" class="message-item">
        <div class="message-meta">
          <span class="message-author">{{ message.author }}</span>
          <span class="message-time">{{ formatMessageTime(message.created_at) }}</span>
          <el-button
            text
            type="danger"
            size="small"
            :loading="deletingMessageId === message.id"
            @click="removeMessage(message.id)"
          >
            删除
          </el-button>
        </div>
        <div class="message-content">{{ message.content }}</div>
      </article>
    </div>

    <div class="message-form">
      <el-input v-model="draftAuthor" placeholder="留言人" maxlength="32" />
      <el-input
        v-model="draftContent"
        type="textarea"
        :rows="3"
        maxlength="300"
        show-word-limit
        placeholder="输入留言内容"
      />
      <div class="message-actions">
        <el-button type="primary" :loading="posting" @click="submitMessage">发布留言</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Restaurant, RestaurantMessage } from '../types/restaurant'
import { addRestaurantMessage, deleteRestaurantMessage } from '../api/restaurants'

const props = defineProps<{ restaurant: Restaurant }>()
const emit = defineEmits<{
  delete: [id: number]
  messageAdded: [restaurantId: number, message: RestaurantMessage]
  messageDeleted: [restaurantId: number, messageId: number]
}>()

const messageDialogVisible = ref(false)
const draftAuthor = ref('')
const draftContent = ref('')
const posting = ref(false)
const deletingMessageId = ref<number | null>(null)

function formatMessageTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

async function submitMessage() {
  const author = draftAuthor.value.trim()
  const content = draftContent.value.trim()
  if (!author) {
    ElMessage.warning('请输入留言人')
    return
  }
  if (!content) {
    ElMessage.warning('请输入留言内容')
    return
  }

  posting.value = true
  try {
    const message = await addRestaurantMessage(props.restaurant.id, author, content)
    emit('messageAdded', props.restaurant.id, message)
    draftContent.value = ''
    ElMessage.success('留言已发布')
  } catch {
    ElMessage.error('发布失败，请重试')
  } finally {
    posting.value = false
  }
}

async function removeMessage(messageId: number) {
  try {
    await ElMessageBox.confirm('确认删除这条留言？', '提示', { type: 'warning' })
  } catch {
    return
  }

  deletingMessageId.value = messageId
  try {
    await deleteRestaurantMessage(messageId)
    emit('messageDeleted', props.restaurant.id, messageId)
    ElMessage.success('留言已删除')
  } catch {
    ElMessage.error('删除失败，请重试')
  } finally {
    deletingMessageId.value = null
  }
}

function openMap() {
  if (props.restaurant.poi_id) {
    window.open(`https://www.amap.com/detail/${props.restaurant.poi_id}`, '_blank')
  } else {
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
  gap: 8px 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
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
  margin-bottom: 10px;
}

.legacy-notes {
  font-size: 13px;
  color: #777;
  white-space: pre-wrap;
  margin-bottom: 10px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 10px;
}

.message-empty {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.message-list {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding-right: 2px;
}

.message-item {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 8px 10px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-author {
  font-size: 13px;
  color: #303133;
  font-weight: 600;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-meta :deep(.el-button) {
  margin-left: auto;
}

.message-content {
  font-size: 13px;
  color: #555;
  white-space: pre-wrap;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
