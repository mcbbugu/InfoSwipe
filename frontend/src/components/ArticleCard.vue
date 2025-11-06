<template>
  <div
    class="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
    :style="{ userSelect: 'none' }"
  >
    <!-- 评分标签 -->
    <div class="flex justify-between items-start mb-4">
      <span
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :class="getScoreColorClass(article.score)"
      >
        评分: {{ article.score }}
      </span>
      <span class="text-xs text-gray-500">{{ article.source }}</span>
    </div>

    <!-- 标题（可点击） -->
    <h3 
      @click="$emit('readFull')"
      @mousedown.stop
      @touchstart.stop
      class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
    >
      {{ article.title }}
    </h3>

    <!-- 内容预览（不可点击，避免影响拖拽） -->
    <div v-if="hasContent" class="mb-4">
      <p class="text-gray-600 text-sm leading-relaxed line-clamp-4">
        {{ article.content }}
      </p>
    </div>

    <!-- 无内容时的显示 -->
    <div v-else class="mb-4">
      <p class="text-gray-400 text-sm italic">
        该文章暂无内容预览，请点击"查看原文"阅读完整内容
      </p>
    </div>

    <!-- 评分详情 -->
    <div v-if="scoreDetails" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <div class="text-xs font-semibold text-gray-700 mb-2">评分详情：</div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>标题质量: <span class="font-medium">{{ scoreDetails.title }}</span></div>
        <div>内容长度: <span class="font-medium">{{ scoreDetails.contentLength }}</span></div>
        <div>来源权威: <span class="font-medium">{{ scoreDetails.source }}</span></div>
        <div>时效性: <span class="font-medium">{{ scoreDetails.timeliness }}</span></div>
        <div class="col-span-2">关键词: <span class="font-medium">{{ scoreDetails.keywords }}</span></div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
      <div class="text-xs text-gray-400">
        {{ formatDate(article.published_at) }}
      </div>
      <a
        v-if="article.link"
        :href="article.link"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
        class="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
      >
        查看原文
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['readFull'])

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

// 确保 score_details 是对象
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

// 判断是否有实际内容
const hasContent = computed(() => {
  const content = props.article.content || ''
  return content.trim().length > 0
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

