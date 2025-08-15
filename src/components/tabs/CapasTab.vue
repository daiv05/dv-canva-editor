<!--
  CapasTab.vue
  Tab para gestión de capas y jerarquías de elementos.
  Por ahora muestra un placeholder, se implementará funcionalidad más adelante.
-->

<template>
  <div class="capas-tab">
    <!-- Header del tab -->
    <div class="tab-header">
      <h3 class="tab-title">Gestión de Capas</h3>
      <div class="tab-subtitle">Organiza elementos en capas y jerarquías</div>
    </div>

    <!-- Contenido placeholder -->
    <div class="tab-body">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="icon">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        <h4 class="placeholder-title">Funcionalidad de Capas</h4>
        <p class="placeholder-description">Esta funcionalidad permitirá:</p>

        <ul class="feature-list">
          <li>Organizar elementos en capas independientes</li>
          <li>Controlar visibilidad de capas</li>
          <li>Gestionar orden de renderizado</li>
          <li>Agrupar elementos por función</li>
          <li>Bloquear/desbloquear capas</li>
        </ul>

        <div class="coming-soon">
          <span class="badge">Próximamente</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Por ahora no hay lógica, solo placeholder
</script>

<style scoped>
.capas-tab {
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
  overflow-y: auto;
}

.placeholder-content {
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.placeholder-icon .icon {
  width: 32px;
  height: 32px;
}

.placeholder-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.placeholder-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.feature-list li {
  font-size: 0.875rem;
  color: #4b5563;
  position: relative;
  padding-left: 1.5rem;
}

.feature-list li::before {
  content: '•';
  color: #3b82f6;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.coming-soon {
  margin-top: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
