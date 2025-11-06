<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">InfoSwipe</h1>
          </div>
          <div class="flex space-x-4">
            <router-link
              to="/"
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              :class="$route.path === '/' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
            >
              分拣
            </router-link>
            <router-link
              to="/review"
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              :class="$route.path === '/review' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
            >
              回顾
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
