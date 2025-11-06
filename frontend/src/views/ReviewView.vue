<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">回顾视图</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">总处理量</div>
        <div class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalProcessed || 0 }}</div>
      </div>
      <div class="bg-green-50 rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">行动池</div>
        <div class="text-3xl font-bold text-green-600 mt-2">{{ stats.categoryStats?.action || 0 }}</div>
      </div>
      <div class="bg-blue-50 rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">观察池</div>
        <div class="text-3xl font-bold text-blue-600 mt-2">{{ stats.categoryStats?.observe || 0 }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg shadow p-6">
        <div class="text-sm text-gray-600">归档池</div>
        <div class="text-3xl font-bold text-gray-600 mt-2">{{ stats.categoryStats?.archive || 0 }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 行动池 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b bg-green-50">
          <h3 class="font-semibold text-green-700">行动池</h3>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="!stats.articlesByCategory?.action?.length" class="text-gray-400 text-sm text-center py-8">
            暂无文章
          </div>
          <div
            v-for="article in stats.articlesByCategory?.action || []"
            :key="article.id"
            class="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-sm text-gray-900 mb-2">{{ article.title }}</div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs text-gray-500">{{ article.source }}</span>
              <span class="text-xs text-blue-600">评分: {{ article.score }}</span>
            </div>
            <div class="flex gap-2 mt-2">
              <button
                v-if="article.content"
                @click="openArticleModal(article)"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                阅读全文
              </button>
              <a
                v-if="article.link"
                :href="article.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                查看原文
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 观察池 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b bg-blue-50">
          <h3 class="font-semibold text-blue-700">观察池</h3>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="!stats.articlesByCategory?.observe?.length" class="text-gray-400 text-sm text-center py-8">
            暂无文章
          </div>
          <div
            v-for="article in stats.articlesByCategory?.observe || []"
            :key="article.id"
            class="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-sm text-gray-900 mb-2">{{ article.title }}</div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs text-gray-500">{{ article.source }}</span>
              <span class="text-xs text-blue-600">评分: {{ article.score }}</span>
            </div>
            <div class="flex gap-2 mt-2">
              <button
                v-if="article.content"
                @click="openArticleModal(article)"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                阅读全文
              </button>
              <a
                v-if="article.link"
                :href="article.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                查看原文
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 归档池 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b bg-gray-50">
          <h3 class="font-semibold text-gray-700">归档池</h3>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="!stats.articlesByCategory?.archive?.length" class="text-gray-400 text-sm text-center py-8">
            暂无文章
          </div>
          <div
            v-for="article in stats.articlesByCategory?.action || []"
            :key="article.id"
            class="mb-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-sm text-gray-900 mb-2">{{ article.title }}</div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs text-gray-500">{{ article.source }}</span>
              <span class="text-xs text-blue-600">评分: {{ article.score }}</span>
            </div>
            <div class="flex gap-2 mt-2">
              <button
                v-if="article.content"
                @click="openArticleModal(article)"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                阅读全文
              </button>
              <a
                v-if="article.link"
                :href="article.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                查看原文
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近操作 -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <h3 class="font-semibold text-gray-900">最近操作</h3>
      </div>
      <div class="p-4">
        <div v-if="!stats.recentOperations?.length" class="text-gray-400 text-sm text-center py-8">
          暂无操作记录
        </div>
        <div class="space-y-2">
          <div
            v-for="op in stats.recentOperations || []"
            :key="op.id"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ op.title }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatTime(op.created_at) }}
              </div>
            </div>
            <div class="ml-4">
              <span
                class="px-2 py-1 text-xs rounded"
                :class="{
                  'bg-green-100 text-green-700': op.action === 'swipe_up' || op.category === 'action',
                  'bg-blue-100 text-blue-700': op.action === 'swipe_right' || op.category === 'observe',
                  'bg-gray-100 text-gray-700': op.action === 'swipe_left' || op.category === 'archive'
                }"
              >
                {{ getActionLabel(op.action || op.category) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章详情 Modal -->
    <ArticleModal
      :is-open="modalArticle !== null"
      :article="modalArticle || {}"
      @close="closeArticleModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ArticleModal from '../components/ArticleModal.vue'

const stats = ref({
  categoryStats: {},
  totalProcessed: 0,
  recentOperations: [],
  articlesByCategory: {}
})
const modalArticle = ref(null)

const API_BASE = '/api'

const openArticleModal = (article) => {
  modalArticle.value = article
}

const closeArticleModal = () => {
  modalArticle.value = null
}

const loadStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/stats`)
    stats.value = response.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const getActionLabel = (action) => {
  const labels = {
    'swipe_up': '行动',
    'swipe_right': '观察',
    'swipe_left': '归档',
    'action': '行动',
    'observe': '观察',
    'archive': '归档'
  }
  return labels[action] || action
}

onMounted(() => {
  loadStats()
  // 每30秒刷新一次
  setInterval(loadStats, 30000)
})
</script>

