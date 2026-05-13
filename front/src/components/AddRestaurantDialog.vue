<template>
  <el-dialog v-model="visible" title="添加餐厅" width="min(480px, 92vw)" @closed="resetForm">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="搜索">
        <el-autocomplete
          v-model="searchQuery"
          :fetch-suggestions="queryPoi"
          placeholder="输入店名和城市名，如“海底捞 南京”"
          style="width:100%"
          value-key="name"
          :trigger-on-focus="false"
          @select="onPoiSelect"
        >
          <template #default="{ item }">
            <div class="poi-item">
              <span class="poi-name">{{ item.name }}</span>
              <span class="poi-addr">{{ item.cityname }} · {{ item.address }}</span>
            </div>
          </template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item label="餐厅名称" prop="name">
        <el-input v-model="form.name" placeholder="从搜索结果自动填入，或手动输入" />
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input v-model="form.city" placeholder="如：北京" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.address" placeholder="详细地址（可选）" />
      </el-form-item>
      <el-form-item label="菜系" prop="cuisine_type">
        <el-select v-model="form.cuisine_type" placeholder="选择菜系" style="width:100%">
          <el-option v-for="c in cuisines" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="评分" prop="rating">
        <el-rate v-model="form.rating" />
      </el-form-item>
      <el-form-item label="到访日期" prop="visited_date">
        <el-date-picker v-model="form.visited_date" type="date" value-format="YYYY-MM-DD"
          placeholder="选择日期" style="width:100%" />
      </el-form-item>
      <el-form-item label="人均消费">
        <el-input v-model.number="form.avg_cost" type="number" placeholder="单位：元（可选）" style="width:160px">
          <template #prefix>¥</template>
        </el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="口感、推荐菜等（可选）" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addRestaurant } from '../api/restaurants'
import type { RestaurantInsert } from '../types/restaurant'
import { searchPoi, type GaodePoi } from '../lib/gaode'

const visible = defineModel<boolean>({ required: true })
const emit = defineEmits<{ added: [] }>()

const cuisines = ['川菜', '粤菜', '鲁菜', '苏菜', '浙菜', '湘菜', '徽菜', '闽菜', '日料', '韩料', '西餐', '火锅', '烧烤', '其他']

const formRef = ref<FormInstance>()
const loading = ref(false)
const searchQuery = ref('')

// 工厂函数而非对象字面量，确保每次 reset 拿到全新引用，避免 reactive 残留旧数据
const defaultForm = (): RestaurantInsert => ({
  name: '',
  city: '',
  address: '',
  cuisine_type: '',
  rating: 0,
  visited_date: '',
  notes: '',
  avg_cost: null,
  poi_id: null,
})

const form = reactive(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入餐厅名称', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  cuisine_type: [{ required: true, message: '请选择菜系', trigger: 'change' }],
  rating: [{ required: true, type: 'number', min: 1, message: '请评分', trigger: 'change' }],
  visited_date: [{ required: true, message: '请选择到访日期', trigger: 'change' }],
}

async function queryPoi(query: string, cb: (results: GaodePoi[]) => void) {
  const results = await searchPoi(query)
  cb(results)
}

function onPoiSelect(poi: GaodePoi) {
  form.name = poi.name
  form.city = poi.cityname
  form.address = poi.address
  form.poi_id = poi.id
}

async function submit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await addRestaurant({ ...form })
    visible.value = false
    emit('added')
  } catch {
    ElMessage.error('添加失败，请重试')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, defaultForm())
  searchQuery.value = ''
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.poi-item {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  padding: 2px 0;
}
.poi-name {
  font-size: 14px;
}
.poi-addr {
  font-size: 12px;
  color: #999;
}
</style>
