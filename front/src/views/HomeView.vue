<template>
  <div class="home">
    <div class="toolbar">
      <el-input v-model="search" placeholder="搜索餐厅名称、城市、菜系..." clearable class="search-input">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="filterCuisine" placeholder="筛选菜系" clearable class="cuisine-select">
        <el-option v-for="c in cuisineOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-button type="primary" :icon="Plus" @click="showAdd = true">添加餐厅</el-button>
    </div>

    <div class="stats">
      共 <strong>{{ filteredList.length }}</strong> 家餐厅
      <span v-if="filteredList.length > pageSize" class="page-info">，第 {{ currentPage }} / {{ totalPages }} 页</span>
    </div>

    <div v-if="loading" class="center"><el-icon class="is-loading" size="32"><Loading /></el-icon></div>
    <div v-else-if="filteredList.length === 0" class="center"><el-empty description="暂无餐厅记录" /></div>
    <div v-else>
      <div class="list">
        <RestaurantCard
          v-for="r in paginatedList"
          :key="r.id"
          :restaurant="r"
          @delete="handleDelete"
          @message-added="handleMessageAdded"
          @message-deleted="handleMessageDeleted"
        />
      </div>
      <div v-if="filteredList.length > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredList.length"
          layout="prev, pager, next"
          background
          hide-on-single-page
        />
      </div>
    </div>

    <footer class="source-footer">
      开源地址：
      <a
        href="https://github.com/cao0015/restaurant-tracker"
        target="_blank"
        rel="noopener noreferrer"
      >
        cao0015/restaurant-tracker
      </a>
    </footer>

    <AddRestaurantDialog v-model="showAdd" @added="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Plus, Loading } from '@element-plus/icons-vue'
import RestaurantCard from '../components/RestaurantCard.vue'
import AddRestaurantDialog from '../components/AddRestaurantDialog.vue'
import { fetchRestaurants, deleteRestaurant } from '../api/restaurants'

import type { Restaurant, RestaurantMessage } from '../types/restaurant'

const list = ref<Restaurant[]>([])
const loading = ref(false)
const showAdd = ref(false)
const search = ref('')
const filterCuisine = ref('')
const currentPage = ref(1)
const pageSize = 10

// 从已有数据动态生成菜系选项，而非写死，新增菜系后自动出现在筛选器
const cuisineOptions = computed(() => [...new Set(list.value.map(r => r.cuisine_type).filter(Boolean))])

const filteredList = computed(() => {
  return list.value.filter(r => {
    const matchSearch = !search.value ||
      r.name.includes(search.value) ||
      r.city.includes(search.value) ||
      r.cuisine_type.includes(search.value)
    const matchCuisine = !filterCuisine.value || r.cuisine_type === filterCuisine.value
    return matchSearch && matchCuisine
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize))

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

/**
 * 从数据库加载餐厅数据列表
 */
async function loadData() {
  loading.value = true
  try {
    list.value = await fetchRestaurants()
  } catch (e) {
    ElMessage.error('加载数据失败，请检查 Supabase 配置')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确认删除这条记录？', '提示', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteRestaurant(id)
    ElMessage.success('已删除')
    await loadData()
  } catch {
    ElMessage.error('删除失败，请重试')
  }
}

function handleMessageAdded(restaurantId: number, message: RestaurantMessage) {
  const item = list.value.find(r => r.id === restaurantId)
  if (!item) return
  item.messages = [message, ...(item.messages ?? [])]
  item.message_count += 1
}

function handleMessageDeleted(restaurantId: number, messageId: number) {
  const item = list.value.find(r => r.id === restaurantId)
  if (!item) return
  item.messages = (item.messages ?? []).filter(message => message.id !== messageId)
  item.message_count = Math.max(0, item.message_count - 1)
}

// 搜索或筛选变化时重置到第一页
watch([search, filterCuisine], () => { currentPage.value = 1 })

onMounted(loadData)
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.search-input {
  width: 300px;
}
.cuisine-select {
  width: 140px;
}
.stats {
  color: #888;
  font-size: 13px;
  margin-bottom: 16px;
}
.list {
  display: flex;
  flex-direction: column;
}
.center {
  text-align: center;
  padding: 60px 0;
  color: #aaa;
}
.source-footer {
  margin-top: 24px;
  padding: 16px 0 4px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}
.source-footer a {
  color: #409eff;
  text-decoration: none;
}
.page-info {
  color: #aaa;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.source-footer a:hover {
  text-decoration: underline;
}
@media (max-width: 640px) {
  .home {
    padding: 16px 12px;
  }
  .search-input {
    width: 100%;
    flex: 1 1 100%;
  }
  .cuisine-select {
    flex: 1;
    width: auto;
  }
}
</style>
