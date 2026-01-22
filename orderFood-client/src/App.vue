<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// App组件逻辑
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* 禁用触摸缩放 */
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  touch-action: none;
}
</style>
