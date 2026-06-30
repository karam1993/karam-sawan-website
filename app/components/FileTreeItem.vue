<template>
  <div class="tree-item-group">
    <!-- Folder Row -->
    <div v-if="node.type === 'folder'" class="folder-group-wrapper">
      <div 
        class="explorer-folder-row d-flex align-center px-3 py-1 cursor-pointer select-none"
        @click="isOpen = !isOpen"
      >
        <v-icon 
          :icon="isOpen ? 'mdi-chevron-down' : (isRTL ? 'mdi-chevron-left' : 'mdi-chevron-right')" 
          size="12" 
          class="mr-1 ml-1 text-grey"
        ></v-icon>
        <v-icon 
          :icon="isOpen ? 'mdi-folder-open' : 'mdi-folder'" 
          size="14" 
          class="mr-1 ml-1 text-yellow-darken-2"
        ></v-icon>
        <span class="folder-name">{{ node.name }}</span>
      </div>
      
      <!-- Sub-nodes (nested folders and files) -->
      <div v-show="isOpen" class="folder-children-container">
        <!-- Folders first -->
        <FileTreeItem
          v-for="subfolder in node.children"
          :key="subfolder.name"
          :node="subfolder"
          :active-file="activeFile"
          @select-file="$emit('select-file', $event)"
        />
        <!-- Files next -->
        <div 
          v-for="file in node.files" 
          :key="file.path"
          class="explorer-file-row d-flex align-center px-3 py-1 cursor-pointer"
          :class="{ active: activeFile && activeFile.path === file.path }"
          @click="$emit('select-file', file)"
        >
          <v-icon 
            :icon="getFileIcon(file.name)" 
            size="14" 
            class="mr-1 ml-1" 
            :color="getFileIconColor(file.name)"
          ></v-icon>
          <span class="file-name">{{ file.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  activeFile: {
    type: Object,
    default: null
  }
})

defineEmits(['select-file'])

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const isOpen = ref(true)

const getFileIcon = (filename) => {
  if (filename.endsWith('.vue')) return 'mdi-vuejs'
  if (filename.endsWith('.js')) return 'mdi-language-javascript'
  if (filename.endsWith('.ts')) return 'mdi-language-typescript'
  if (filename.endsWith('.json')) return 'mdi-code-json'
  if (filename.endsWith('.css') || filename.endsWith('.scss')) return 'mdi-language-css3'
  return 'mdi-file-document-outline'
}

const getFileIconColor = (filename) => {
  if (filename.endsWith('.vue')) return '#42b883'
  if (filename.endsWith('.js')) return '#f1e05a'
  if (filename.endsWith('.ts')) return '#3178c6'
  if (filename.endsWith('.json')) return '#cbcb41'
  if (filename.endsWith('.css') || filename.endsWith('.scss')) return '#563d7c'
  return '#94a3b8'
}
</script>

<style scoped>
.folder-children-container {
  padding-left: 12px;
}

[dir="rtl"] .folder-children-container {
  padding-left: 0;
  padding-right: 12px;
}

.explorer-folder-row {
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  user-select: none;
  margin: 1px 4px;
}

.explorer-folder-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.folder-name {
  font-size: 0.76rem;
  font-weight: 700;
  color: #cbd5e1;
}

.explorer-file-row {
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  user-select: none;
  margin: 1px 4px;
}

.explorer-file-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.explorer-file-row.active {
  background: rgba(255, 255, 255, 0.08);
}

.file-name {
  font-size: 0.74rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explorer-file-row.active .file-name {
  color: #ffffff;
  font-weight: 600;
}
</style>
