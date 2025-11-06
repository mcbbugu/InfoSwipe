<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 操作栏 -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">资讯分拣</h2>
        <p class="text-gray-600 mt-1">上滑=行动，右滑=观察，左滑=归档</p>
      </div>
      <button
        @click="syncArticles"
        :disabled="syncing"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ syncing ? '同步中...' : '同步RSS' }}
      </button>
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
        <p class="text-gray-500 text-lg">暂无待处理文章</p>
        <button
          @click="syncArticles"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          同步RSS获取文章
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-500">加载中...</p>
      </div>

      <!-- 卡片堆叠效果 -->
      <div
        v-for="(article, index) in visibleArticles"
        :key="article.id"
        :style="{
          position: 'absolute',
          width: '100%',
          zIndex: articles.length - index,
          transform: `translate3d(${article.offsetX}px, ${article.offsetY}px, 0) rotate(${article.rotation}deg)`,
          transition: article.dragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: article.dragging ? 0.9 : 1,
          willChange: article.dragging ? 'transform' : 'auto'
        }"
        @touchstart="handleTouchStart($event, article)"
        @touchmove="handleTouchMove($event, article)"
        @touchend="handleTouchEnd($event, article)"
        @mousedown="handleMouseDown($event, article)"
        @mousemove="handleMouseMove($event, article)"
        @mouseup="handleMouseEnd($event, article)"
        @mouseleave="handleMouseLeave($event, article)"
        class="cursor-grab active:cursor-grabbing"
      >
        <ArticleCard :article="article" />
      </div>

      <!-- 操作提示 -->
      <div v-if="articles.length > 0" class="mt-12 flex justify-center items-center space-x-12">
        <div class="flex flex-col items-center group">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mb-2 group-hover:bg-gray-200 transition-colors">
            ⬅️
          </div>
          <div class="text-sm font-medium text-gray-700">归档</div>
          <div class="text-xs text-gray-500 mt-1">左滑</div>
        </div>
        <div class="flex flex-col items-center group">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl mb-2 group-hover:bg-green-200 transition-colors">
            ⬆️
          </div>
          <div class="text-sm font-medium text-green-700">行动</div>
          <div class="text-xs text-gray-500 mt-1">上滑</div>
        </div>
        <div class="flex flex-col items-center group">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl mb-2 group-hover:bg-blue-200 transition-colors">
            ➡️
          </div>
          <div class="text-sm font-medium text-blue-700">观察</div>
          <div class="text-xs text-gray-500 mt-1">右滑</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import ArticleCard from '../components/ArticleCard.vue'

const articles = ref([])
const loading = ref(false)
const syncing = ref(false)
const message = ref({ text: '', type: '' })

const visibleArticles = computed(() => {
  return articles.value.slice(0, 3).map((article, index) => ({
    ...article,
    offsetX: article.offsetX || 0,
    offsetY: article.offsetY || (index * 4),
    rotation: article.rotation || (index * -2),
    dragging: article.dragging || false
  }))
})

const API_BASE = '/api'

let touchStartX = 0
let touchStartY = 0
let mouseStartX = 0
let mouseStartY = 0
let animationFrameId = null

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/articles?category=pending`)
    articles.value = response.data.articles.map(article => ({
      ...article,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      dragging: false
    }))
  } catch (error) {
    console.error('加载文章失败:', error)
    showMessage('加载文章失败，请刷新重试', 'error')
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
    // 如果文章少于3条，加载更多
    if (articles.value.length < 3) {
      await loadArticles()
    }
  } catch (error) {
    console.error('分类失败:', error)
    showMessage('分类失败，请稍后重试', 'error')
  }
}

const handleTouchStart = (e, article) => {
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  article.dragging = true
}

const updateCardPosition = (article, deltaX, deltaY) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  animationFrameId = requestAnimationFrame(() => {
    article.offsetX = deltaX
    article.offsetY = deltaY
    article.rotation = deltaX * 0.1
  })
}

const handleTouchMove = (e, article) => {
  if (!article.dragging) return
  e.preventDefault()
  const touch = e.touches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  
  updateCardPosition(article, deltaX, deltaY)
}

const handleTouchEnd = (e, article) => {
  if (!article.dragging) return
  article.dragging = false
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  
  if (distance > 100) {
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // 垂直滑动
      if (deltaY < 0) {
        // 上滑 - 行动
        categorizeArticle(article.id, 'action', 'swipe_up')
      } else {
        // 下滑 - 重置
        article.offsetX = 0
        article.offsetY = 0
        article.rotation = 0
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
    // 重置位置
    article.offsetX = 0
    article.offsetY = 0
    article.rotation = 0
  }
}

const handleMouseDown = (e, article) => {
  mouseStartX = e.clientX
  mouseStartY = e.clientY
  article.dragging = true
}

const handleMouseMove = (e, article) => {
  if (!article.dragging) return
  const deltaX = e.clientX - mouseStartX
  const deltaY = e.clientY - mouseStartY
  
  updateCardPosition(article, deltaX, deltaY)
}

const handleMouseLeave = (e, article) => {
  if (article.dragging) {
    article.dragging = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    article.offsetX = 0
    article.offsetY = 0
    article.rotation = 0
  }
}

const handleMouseEnd = (e, article) => {
  if (!article.dragging) return
  article.dragging = false
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  const deltaX = e.clientX - mouseStartX
  const deltaY = e.clientY - mouseStartY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  
  if (distance > 100) {
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // 垂直滑动
      if (deltaY < 0) {
        // 上滑 - 行动
        categorizeArticle(article.id, 'action', 'swipe_up')
      } else {
        // 下滑 - 重置
        article.offsetX = 0
        article.offsetY = 0
        article.rotation = 0
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
    // 重置位置
    article.offsetX = 0
    article.offsetY = 0
    article.rotation = 0
  }
}

// 全局鼠标事件处理（防止鼠标移出窗口时卡住）
const handleGlobalMouseUp = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  articles.value.forEach(article => {
    if (article.dragging) {
      article.dragging = false
      article.offsetX = 0
      article.offsetY = 0
      article.rotation = 0
    }
  })
}

onMounted(() => {
  loadArticles()
  // 添加全局事件监听
  document.addEventListener('mouseup', handleGlobalMouseUp)
  document.addEventListener('mouseleave', handleGlobalMouseUp)
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  document.removeEventListener('mouseleave', handleGlobalMouseUp)
})
</script>

