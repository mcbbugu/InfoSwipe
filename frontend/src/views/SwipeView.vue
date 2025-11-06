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
        <div class="mb-4">
          <div class="text-6xl mb-4">🎉</div>
          <p class="text-gray-700 text-xl font-semibold mb-2">太棒了！</p>
          <p class="text-gray-500 text-lg mb-1">所有文章都已处理完毕</p>
          <p class="text-gray-400 text-sm">点击下方按钮同步 RSS 获取新文章</p>
        </div>
        <button
          @click="syncArticles"
          class="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          🔄 同步 RSS 获取新文章
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
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    showMessage('加载文章失败，请刷新重试', 'error')
    articles.value = []
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

