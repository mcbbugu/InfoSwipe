<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 操作栏 -->
    <div class="mb-6 flex justify-between items-start">
      <div class="flex-1">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          资讯分拣
        </h1>
        <p class="text-sm text-gray-500 font-medium">快速决策，高效管理</p>
      </div>
      <button
        @click="syncArticles"
        :disabled="syncing"
        class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
      >
        <span v-if="syncing" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          同步中...
        </span>
        <span v-else class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          同步 RSS
        </span>
      </button>
    </div>

    <!-- 操作提示（优雅设计） -->
    <div v-if="articles.length > 0" class="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-blue-100 shadow-sm">
      <div class="flex items-center justify-center gap-6 flex-wrap">
        <div class="flex items-center gap-2 text-sm text-gray-700 font-medium">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>滑动卡片进行分类：</span>
        </div>
        <div class="flex items-center gap-1 px-3 py-1.5 bg-green-100 rounded-lg">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span class="text-xs font-semibold text-green-700">上滑</span>
          <span class="text-xs text-green-600 ml-1">= 行动</span>
        </div>
        <div class="flex items-center gap-1 px-3 py-1.5 bg-blue-100 rounded-lg">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-xs font-semibold text-blue-700">右滑</span>
          <span class="text-xs text-blue-600 ml-1">= 观察</span>
        </div>
        <div class="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="text-xs font-semibold text-gray-700">左滑</span>
          <span class="text-xs text-gray-600 ml-1">= 归档</span>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div
      v-if="message.text"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg transition-all"
      :class="message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ message.text }}
    </div>

    <!-- 文章卡片堆叠 -->
    <div class="relative" style="height: 600px;">
      <div v-if="articles.length === 0 && !loading" class="text-center py-20">
        <div class="mb-4">
          <div class="text-6xl mb-4">{{ hasAnyArticles ? '🎉' : '📰' }}</div>
          <p class="text-gray-700 text-xl font-semibold mb-2">
            {{ hasAnyArticles ? '太棒了！' : '欢迎使用 InfoSwipe' }}
          </p>
          <p class="text-gray-500 text-lg mb-1">
            {{ hasAnyArticles ? '所有文章都已处理完毕' : '还没有文章，快来同步 RSS 吧' }}
          </p>
          <p class="text-gray-400 text-sm">点击下方按钮同步 RSS 获取新文章</p>
        </div>
        <button
          @click="syncArticles"
          :disabled="syncing"
          class="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2 mx-auto"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          同步 RSS 获取新文章
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-500">加载中...</p>
      </div>

      <!-- 卡片堆叠效果 -->
      <div
        v-for="(article, index) in visibleArticles"
        :key="article.id"
        :ref="el => setCardRef(el, article.id)"
        :style="{
          position: 'absolute',
          width: '100%',
          zIndex: article.dragging ? 9999 : articles.length - index,
          transform: `translate3d(${article.offsetX || 0}px, ${article.offsetY || 0}px, 0) rotate(${article.rotation || 0}deg) scale(${article.scale || 1})`,
          transition: article.dragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: article.dragging ? 0.95 : 1,
          willChange: article.dragging ? 'transform' : 'auto',
          cursor: article.dragging ? 'grabbing' : 'grab'
        }"
        class="select-none"
      >
        <ArticleCard :article="article" @read-full="openArticleModal(article)" />
      </div>

    <!-- 文章详情 Modal -->
    <ArticleModal
      :is-open="modalArticle !== null"
      :article="modalArticle || {}"
      @close="closeArticleModal"
    />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import axios from 'axios'
import ArticleCard from '../components/ArticleCard.vue'
import ArticleModal from '../components/ArticleModal.vue'

const articles = ref([])
const loading = ref(false)
const syncing = ref(false)
const message = ref({ text: '', type: '' })
const cardRefs = ref({})
const modalArticle = ref(null)
const hasAnyArticles = ref(false) // 标记数据库中是否有任何文章
const dragState = ref({
  active: false,
  articleId: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0
})

const visibleArticles = computed(() => {
  return articles.value.slice(0, 3).map((article, index) => ({
    ...article,
    offsetX: article.offsetX || 0,
    offsetY: article.offsetY || (index * 4),
    rotation: article.rotation || (index * -2),
    dragging: article.dragging || false,
    scale: article.scale || 1
  }))
})

// 设置卡片 ref
const setCardRef = (el, articleId) => {
  if (el && articleId) {
    cardRefs.value[articleId] = el
    nextTick(() => {
      setupDrag(el, articleId)
    })
  }
}

const API_BASE = '/api'

// 使用 requestAnimationFrame 优化拖拽性能
let rafId = null

const updateDragPosition = () => {
  if (!dragState.value.active) return
  
  const article = articles.value.find(a => a.id === dragState.value.articleId)
  if (!article) return
  
  const deltaX = dragState.value.currentX - dragState.value.startX
  const deltaY = dragState.value.currentY - dragState.value.startY
  
  article.offsetX = deltaX
  article.offsetY = deltaY
  article.rotation = deltaX * 0.15
  
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  article.scale = Math.min(1 + distance / 500 * 0.1, 1.1)
  
  rafId = requestAnimationFrame(updateDragPosition)
}

// 设置拖动手势
const setupDrag = (element, articleId) => {
  if (!element) return
  
  const handleStart = (e) => {
    e.preventDefault()
    const touch = e.touches ? e.touches[0] : e
    dragState.value = {
      active: true,
      articleId,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY
    }
    
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      article.dragging = true
    }
    
    rafId = requestAnimationFrame(updateDragPosition)
  }
  
  const handleMove = (e) => {
    if (!dragState.value.active || dragState.value.articleId !== articleId) return
    e.preventDefault()
    const touch = e.touches ? e.touches[0] : e
    dragState.value.currentX = touch.clientX
    dragState.value.currentY = touch.clientY
  }
  
  const handleEnd = (e) => {
    if (!dragState.value.active || dragState.value.articleId !== articleId) return
    e.preventDefault()
    
    const article = articles.value.find(a => a.id === articleId)
    if (!article) return
    
    article.dragging = false
    
    const deltaX = dragState.value.currentX - dragState.value.startX
    const deltaY = dragState.value.currentY - dragState.value.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // 重置缩放
    article.scale = 1
    
    // 判断滑动方向
    if (distance > 100) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 垂直滑动
        if (deltaY < 0) {
          // 上滑 - 行动
          categorizeArticle(article.id, 'action', 'swipe_up')
        } else {
          // 下滑 - 重置
          resetCardPosition(article)
        }
      } else {
        // 水平滑动
        if (deltaX > 0) {
          // 右滑 - 观察
          categorizeArticle(article.id, 'observe', 'swipe_right')
        } else {
          // 左滑 - 归档
          categorizeArticle(article.id, 'archive', 'swipe_left')
        }
      }
    } else {
      // 距离不够，重置位置
      resetCardPosition(article)
    }
    
    dragState.value.active = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  
  // 绑定事件
  element.addEventListener('mousedown', handleStart)
  element.addEventListener('touchstart', handleStart, { passive: false })
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('touchmove', handleMove, { passive: false })
  
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchend', handleEnd)
  
  // 存储清理函数
  element._dragCleanup = () => {
    element.removeEventListener('mousedown', handleStart)
    element.removeEventListener('touchstart', handleStart)
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchend', handleEnd)
  }
}

// 重置卡片位置
const resetCardPosition = (article) => {
  article.offsetX = 0
  article.offsetY = 0
  article.rotation = 0
  article.scale = 1
}

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/articles?category=pending`)
    console.log('加载的文章数据:', response.data)
    if (response.data && response.data.articles) {
      articles.value = response.data.articles.map(article => ({
        ...article,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        dragging: false,
        scale: 1
      }))
      
      // 检查是否有任何文章（通过 stats API）
      try {
        const statsResponse = await axios.get(`${API_BASE}/stats`)
        hasAnyArticles.value = (statsResponse.data.totalProcessed || 0) > 0 || 
                               (statsResponse.data.categoryStats?.action || 0) > 0 ||
                               (statsResponse.data.categoryStats?.observe || 0) > 0 ||
                               (statsResponse.data.categoryStats?.archive || 0) > 0 ||
                               articles.value.length > 0
      } catch (e) {
        // 如果获取 stats 失败，根据当前文章数量判断
        hasAnyArticles.value = articles.value.length > 0
      }
      
      // 重新设置拖动手势
      nextTick(() => {
        visibleArticles.value.forEach(article => {
          const el = cardRefs.value[article.id]
          if (el) {
            // 清理旧的事件监听器
            if (el._dragCleanup) {
              el._dragCleanup()
            }
            setupDrag(el, article.id)
          }
        })
      })
      console.log('文章数量:', articles.value.length)
    } else {
      articles.value = []
      // 检查是否有任何文章
      try {
        const statsResponse = await axios.get(`${API_BASE}/stats`)
        hasAnyArticles.value = (statsResponse.data.totalProcessed || 0) > 0 || 
                               (statsResponse.data.categoryStats?.action || 0) > 0 ||
                               (statsResponse.data.categoryStats?.observe || 0) > 0 ||
                               (statsResponse.data.categoryStats?.archive || 0) > 0
      } catch (e) {
        hasAnyArticles.value = false
      }
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    showMessage('加载文章失败，请刷新重试', 'error')
    articles.value = []
    hasAnyArticles.value = false
  } finally {
    loading.value = false
  }
}

const showMessage = (text, type = 'success') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 3000)
}

const syncArticles = async () => {
  syncing.value = true
  try {
    const response = await axios.post(`${API_BASE}/articles/sync`)
    const { added, skipped } = response.data
    showMessage(`同步成功！新增 ${added} 条，跳过 ${skipped} 条重复`, 'success')
    await loadArticles()
  } catch (error) {
    console.error('同步失败:', error)
    showMessage('同步失败，请稍后重试', 'error')
  } finally {
    syncing.value = false
  }
}

const categorizeArticle = async (articleId, category, action) => {
  try {
    await axios.put(`${API_BASE}/articles/${articleId}/category`, {
      category,
      action
    })
    
    const labels = {
      'action': '行动',
      'observe': '观察',
      'archive': '归档'
    }
    showMessage(`已分类到「${labels[category]}」`, 'success')
    
    // 移除已分类的文章
    articles.value = articles.value.filter(a => a.id !== articleId)
    delete cardRefs.value[articleId]
    
    // 如果文章少于3条，加载更多
    if (articles.value.length < 3) {
      await loadArticles()
    }
  } catch (error) {
    console.error('分类失败:', error)
    showMessage('分类失败，请稍后重试', 'error')
    // 失败时重置位置
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      resetCardPosition(article)
    }
  }
}

const openArticleModal = (article) => {
  modalArticle.value = article
}

const closeArticleModal = () => {
  modalArticle.value = null
}

onMounted(() => {
  loadArticles()
})

onUnmounted(() => {
  // 清理所有事件监听器
  Object.values(cardRefs.value).forEach(el => {
    if (el && el._dragCleanup) {
      el._dragCleanup()
    }
  })
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})
</script>

