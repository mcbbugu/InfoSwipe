<template>
  <!-- Modal 背景遮罩 -->
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
    >
      <!-- 背景遮罩（可点击关闭） -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="close"
      ></div>
      
      <!-- Modal 内容 -->
      <div class="relative flex min-h-full items-center justify-center p-4">
        <div
          class="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- 头部 -->
          <div class="flex justify-between items-start p-6 border-b border-gray-200">
            <div class="flex-1 pr-4">
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getScoreColorClass(article.score)"
                >
                  评分: {{ article.score }}
                </span>
                <span class="text-xs text-gray-500">{{ article.source }}</span>
                <span class="text-xs text-gray-400">
                  {{ formatDate(article.published_at) }}
                </span>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">{{ article.title }}</h2>
            </div>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 内容区域（可滚动） -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="hasContent" class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ article.content }}
              </p>
            </div>
            <div v-else class="text-center py-12">
              <p class="text-gray-400 mb-4">该文章暂无内容预览</p>
              <a
                v-if="article.link"
                :href="article.link"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                查看原文
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <!-- 评分详情 -->
            <div v-if="scoreDetails" class="mt-6 p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-semibold text-gray-700 mb-3">评分详情：</div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>标题质量: <span class="font-medium">{{ scoreDetails.title }}</span></div>
                <div>内容长度: <span class="font-medium">{{ scoreDetails.contentLength }}</span></div>
                <div>来源权威: <span class="font-medium">{{ scoreDetails.source }}</span></div>
                <div>时效性: <span class="font-medium">{{ scoreDetails.timeliness }}</span></div>
                <div class="col-span-2">关键词: <span class="font-medium">{{ scoreDetails.keywords }}</span></div>
              </div>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div class="p-6 border-t border-gray-200 flex justify-between items-center">
            <div class="text-sm text-gray-500">
              来源: {{ article.source }}
            </div>
            <div class="flex gap-3">
              <button
                @click="close"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              <a
                v-if="article.link"
                :href="article.link"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                查看原文
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  article: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const hasContent = computed(() => {
  const content = props.article.content || ''
  return content.trim().length > 0
})

const scoreDetails = computed(() => {
  if (!props.article.score_details) return null
  if (typeof props.article.score_details === 'string') {
    try {
      return JSON.parse(props.article.score_details)
    } catch {
      return null
    }
  }
  return props.article.score_details
})

const getScoreColorClass = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 60) return 'bg-blue-100 text-blue-700'
  if (score >= 40) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-700'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* Modal 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.95);
}
</style>

