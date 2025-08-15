<!--
  ElementosTab.vue
  Tab que contiene el catálogo completo de elementos.
  Este componente encapsula todo el contenido del ElementosCatalogo original.
-->

<template>
  <div class="elementos-tab">
    <!-- Header del tab -->
    <div class="tab-header">
      <h3 class="tab-title">Catálogo de Elementos</h3>
      <div class="tab-subtitle">Arrastra elementos al canvas para agregarlos</div>
    </div>

    <!-- Contenido del catálogo -->
    <div class="tab-body">
      <ElementosCatalogo />
    </div>
  </div>
</template>

<script setup>
import ElementosCatalogo from '../ElementosCatalogo.vue'
</script>

<style scoped>
.elementos-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.tab-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.tab-body {
  flex: 1;
  overflow: hidden;
}
</style>
