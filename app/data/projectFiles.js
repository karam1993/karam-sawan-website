export const looplanfyFinanceFiles = [
  {
    path: 'components/InvoiceViewer.vue',
    name: 'InvoiceViewer.vue',
    language: 'vue',
    code: `<template>
  <v-dialog v-model="dialog" max-width="900" scrollable>
    <v-card v-if="invoice" class="rounded-xl border">
      <!-- Header -->
      <v-card-title class="bg-primary text-white d-flex justify-space-between align-center px-6 py-4">
        <div class="d-flex align-center">
          <v-icon icon="mdi-receipt-text-outline" class="mr-3" size="large"></v-icon>
          <div>
            <div class="text-h6 font-weight-bold">تفاصيل الفاتورة #{{ invoice.invoice_number }}</div>
            <div class="text-caption text-white-lighten-2">{{ formatDate(invoice.invoice_date) }}</div>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- Info Cards -->
        <div class="bg-grey-lighten-4 pa-6 border-b">
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="elevation-0 border rounded-lg bg-white h-100 pa-4">
                <div class="text-caption text-grey-darken-1 mb-1 font-weight-bold">المورد</div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-domain" color="primary" class="mr-2"></v-icon>
                  <span class="text-body-1 font-weight-medium">{{ invoice.suppliers?.name || 'غير محدد' }}</span>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="elevation-0 border rounded-lg bg-white h-100 pa-4">
                <div class="text-caption text-grey-darken-1 mb-1 font-weight-bold">المستودع المستلم</div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-warehouse" color="warning" class="mr-2"></v-icon>
                  <span class="text-body-1 font-weight-medium">{{ invoice.warehouses?.name || 'غير محدد' }}</span>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Items Table -->
        <div class="pa-6">
          <div class="text-h6 font-weight-bold text-primary mb-4 d-flex align-center">
            <v-icon icon="mdi-format-list-bulleted" class="mr-2"></v-icon>
            أصناف الفاتورة
          </div>
          
          <v-table class="border rounded-lg bg-white" density="comfortable">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-right font-weight-bold">المنتج</th>
                <th class="text-center font-weight-bold">الكمية</th>
                <th class="text-center font-weight-bold">سعر الشراء (شامل)</th>
                <th class="text-center font-weight-bold">الضريبة</th>
                <th class="text-center font-weight-bold">الصافي</th>
                <th class="text-center font-weight-bold">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoice.purchase_invoice_items" :key="item.id" class="border-b">
                <td class="text-right pa-3">
                  <div class="font-weight-bold">{{ item.products?.name || 'منتج محذوف' }}</div>
                  <div class="text-caption text-grey">{{ item.products?.sku || '' }}</div>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-center font-weight-bold text-primary">{{ formatMoney(item.unit_price_gross) }} ₺</td>
                <td class="text-center">%{{ item.kdv_rate }}</td>
                <td class="text-center text-success font-weight-medium">{{ formatMoney(item.net_unit_cost) }} ₺</td>
                <td class="text-center font-weight-black">{{ formatMoney(item.quantity * item.unit_price_gross) }} ₺</td>
              </tr>
              <tr v-if="!invoice.purchase_invoice_items?.length">
                <td colspan="6" class="text-center pa-4 text-grey">لا توجد أصناف مسجلة في هذه الفاتورة.</td>
              </tr>
            </tbody>
          </v-table>
        </div>
        
        <!-- Notes -->
        <div v-if="invoice.notes" class="px-6 pb-6">
          <div class="text-subtitle-2 font-weight-bold text-grey-darken-1 mb-2">ملاحظات الفاتورة</div>
          <v-card class="elevation-0 bg-yellow-lighten-5 border-warning border pa-4 rounded-lg text-body-2">
            {{ invoice.notes }}
          </v-card>
        </div>

      </v-card-text>

      <!-- Financial Summary Footer -->
      <v-card-actions class="bg-grey-darken-4 text-white pa-6 d-flex flex-column flex-md-row justify-space-between align-center rounded-b-xl">
         <div class="d-flex align-center mb-4 mb-md-0">
           <v-chip 
              :color="invoice.status === 'APPROVED' ? 'success' : 'warning'" 
              :prepend-icon="invoice.status === 'APPROVED' ? 'mdi-check-all' : 'mdi-file-edit-outline'"
              class="font-weight-bold text-uppercase"
              variant="flat"
            >
              {{ invoice.status === 'APPROVED' ? 'معتمدة - مضافة للمخزون' : 'مسودة قيد المراجعة' }}
            </v-chip>
         </div>
         <div class="d-flex gap-6 text-right w-100 justify-md-end pr-md-6">
            <div>
              <div class="text-caption text-grey-lighten-1 mb-1">الكمية الإجمالية</div>
              <div class="text-h6 font-weight-bold">{{ totalItemsQuantity }}</div>
            </div>
            <div>
              <div class="text-caption text-grey-lighten-1 mb-1">صافي الفاتورة</div>
              <div class="text-h6 font-weight-bold text-success">{{ formatMoney(invoice.total_net_amount) }} ₺</div>
            </div>
            <div>
              <div class="text-caption text-grey-lighten-1 mb-1">إجمالي الفاتورة (شامل)</div>
              <div class="text-h5 font-weight-black text-white">{{ formatMoney(invoice.total_gross_amount) }} ₺</div>
            </div>
         </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const dialog = ref(false)
const invoice = ref(null)

// Computed
const totalItemsQuantity = computed(() => {
  if (!invoice.value?.purchase_invoice_items) return 0
  return invoice.value.purchase_invoice_items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

// Methods
const open = async (invoiceId) => {
  dialog.value = true
  await fetchInvoiceDetails(invoiceId)
}

const close = () => {
  dialog.value = false
  invoice.value = null
}

const fetchInvoiceDetails = async (id) => {
  try {
    const data = await $fetch(\`/api/purchases/\${id}\`)
    invoice.value = data
  } catch (e) {
    console.error('Error fetching invoice details:', e)
  }
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('ar-EG', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}

const formatMoney = (val) => {
  return Number(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

defineExpose({
  open,
  close
})
</script>

<style scoped>
.gap-6 { gap: 24px; }
</style>`
  },
  {
    path: 'components/SmartDataTable.vue',
    name: 'SmartDataTable.vue',
    language: 'vue',
    code: `<template>
  <v-card elevation="2" class="rounded-lg">
    <v-card-title class="pa-4 border-b bg-white">
      <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4">
        
        <div class="d-flex align-center">
          <v-icon :icon="icon" color="primary" class="mr-3"></v-icon>
          <span class="font-weight-bold text-h6 text-grey-darken-3">{{ title }}</span>
        </div>

        <div class="d-flex flex-column flex-sm-row gap-3">
          <!-- فلتر مخصص (إن وجد) -->
          <v-select
            v-if="showFilter"
            v-model="activeFilter"
            :items="filterOptions"
            item-title="title"
            return-object
            density="compact"
            variant="outlined"
            hide-details
            rounded="lg"
            bg-color="grey-lighten-4"
            prepend-inner-icon="mdi-filter-variant"
            style="min-width: 150px;"
          ></v-select>

          <!-- شريط البحث السريع -->
          <v-text-field
            v-if="showSearch"
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            :placeholder="searchPlaceholder"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            rounded="lg"
            bg-color="grey-lighten-4"
            style="min-width: 250px;"
          ></v-text-field>
          
          <!-- مكان لإضافة أزرار مخصصة علوية (مثل زر الإضافة) -->
          <slot name="top-actions"></slot>
        </div>
        
      </div>
    </v-card-title>
    
    <v-data-table
      v-model="modelSelected"
      :show-select="showSelect"
      return-object
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      hover
      class="elevation-0 smart-table"
    >
      <!-- تمرير كل الـ slots القادمة من الأب إلى الـ v-data-table الداخلي -->
      <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>

      <!-- تخصيص رسالة "لا توجد بيانات" افتراضية -->
      <template v-slot:no-data>
        <div class="pa-6 text-center">
          <v-icon icon="mdi-database-search-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
          <div class="text-h6 text-grey-darken-1">لم يتم العثور على أية سجلات.</div>
          <slot name="no-data-action"></slot>
        </div>
      </template>

      <!-- وحدة التحكم السفلية (Pagination) -->
      <template v-slot:bottom>
        <div class="d-flex align-center justify-space-between pa-4 border-t bg-grey-lighten-5">
          <div class="d-flex align-center gap-4">
             <span class="text-caption text-grey-darken-1 font-weight-bold d-none d-sm-inline">الصفوف في كل صفحة:</span>
             <v-select
               v-model="itemsPerPage"
               :items="[5, 10, 25, 50, 100]"
               density="compact"
               variant="outlined"
               hide-details
               rounded="lg"
               bg-color="white"
               style="width: 80px;"
             ></v-select>
          </div>
          
          <v-pagination
             v-model="page"
             :length="pageCount"
             active-color="primary"
             rounded="circle"
             density="comfortable"
             :total-visible="5"
          ></v-pagination>
        </div>
      </template>

    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  // محتوى وعنوان الجدول
  title: { type: String, default: 'قائمة البيانات' },
  icon: { type: String, default: 'mdi-table' },
  
  // إعدادات البيانات عبر الـ API
  endpoint: { type: String, required: true }, // رابط الـ API لجلب البيانات
  headers: { type: Array, required: true, default: () => [] },
  
  // إعدادات البحث
  showSearch: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'بحث السجلات...' },
  
  // إعدادات الفلتر
  showFilter: { type: Boolean, default: false },
  filterKey: { type: String, default: 'filter' },
  filterOptions: { type: Array, default: () => [] },

  // معلمات إضافية ديناميكية للبحث
  extraParams: { type: Object, default: () => ({}) },

  // مفتاح لحفظ حالة الفلتر ورقم الصفحة بالذاكرة المؤقتة
  stateKey: { type: String, default: '' },

  // خيارات التحديد المتعدد
  showSelect: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:selected'])

const modelSelected = computed({
  get: () => props.selected,
  set: (val) => emit('update:selected', val)
})

// المتغيرات المحلية 
const activeFilter = ref(props.filterOptions.length > 0 ? props.filterOptions[0] : null)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const items = ref([])
const totalItems = ref(0)
const summary = ref(null)
const loading = ref(true)

// حساب عدد الصفحات بناءً على البيانات القادمة من السيرفر
const pageCount = ref(1)

// دالة جلب البيانات من السيرفر مباشرة
const fetchData = async () => {
  loading.value = true
  try {
    const queryParams = {
      page: page.value,
      limit: itemsPerPage.value,
      itemsPerPage: itemsPerPage.value,
      search: searchQuery.value,
      ...props.extraParams
    }

    // Dynamic Filter injection
    if (activeFilter.value && activeFilter.value.value !== 'all') {
      const key = activeFilter.value.key || props.filterKey || 'filter'
      queryParams[key] = activeFilter.value.value
    }

    const data = await $fetch(props.endpoint, {
      query: queryParams
    })
    
    items.value = data.items
    totalItems.value = data.totalItems
    summary.value = data.summary
    pageCount.value = Math.ceil(data.totalItems / itemsPerPage.value) || 1
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// كشف دالة التحديث للخارج لكي يستطيع الأب (مثل صفحة المستخدمين) إعادة تحميل الجدول بعد الإضافة أو التعديل
defineExpose({ refresh: fetchData, summary })

// دالة حفظ الحالة في الذاكرة المؤقتة
const saveState = () => {
  if (props.stateKey && typeof window !== 'undefined') {
    const state = {
      searchQuery: searchQuery.value,
      itemsPerPage: itemsPerPage.value,
      page: page.value,
      activeFilter: activeFilter.value ? { value: activeFilter.value.value, key: activeFilter.value.key } : null
    }
    sessionStorage.setItem(\`smart_table_\${props.stateKey}\`, JSON.stringify(state))
  }
}

let isRestoring = false

// المراقبة والتحديث عند تغيير أي قيمة، مع إعادة تصفير الصفحة عند البحث أو الفلترة
watch(searchQuery, () => {
  if (isRestoring) return
  page.value = 1
  saveState()
  fetchData()
})

watch(() => activeFilter.value, () => {
  if (isRestoring) return
  page.value = 1
  saveState()
  fetchData()
}, { deep: true })

watch(() => JSON.stringify(props.extraParams), (newVal, oldVal) => {
  if (isRestoring) return
  if (newVal === oldVal) return
  page.value = 1
  saveState()
  fetchData()
})

watch([itemsPerPage, page], () => {
  if (isRestoring) return
  if (page.value > Math.ceil(totalItems.value / itemsPerPage.value) && totalItems.value > 0) {
    page.value = 1
  }
  saveState()
  fetchData()
})

// جلب البيانات أول مرة عند تحميل المكون مع استرجاع الحالة
onMounted(() => {
  if (props.stateKey && typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(\`smart_table_\${props.stateKey}\`)
    if (saved) {
      try {
        isRestoring = true
        const parsed = JSON.parse(saved)
        if (parsed.searchQuery !== undefined) searchQuery.value = parsed.searchQuery
        if (parsed.itemsPerPage !== undefined) itemsPerPage.value = parsed.itemsPerPage
        if (parsed.activeFilter !== undefined && parsed.activeFilter) {
          const found = props.filterOptions.find(opt => opt.value === parsed.activeFilter.value && opt.key === parsed.activeFilter.key)
          if (found) activeFilter.value = found
        }
        // استرجاع الصفحة في النهاية لكي لا تقوم بمراقبة التحديثات الأخرى بإرجاع الصفحة إلى 1
        if (parsed.page !== undefined) page.value = parsed.page
      } catch (e) {
        console.error('Failed to parse saved smart table state:', e)
      } finally {
        isRestoring = false
      }
    }
  }
  fetchData()
})
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
.border-t {
  border-top: 1px solid rgba(0,0,0,0.05) !important;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

/* تحسين شكل صفوف الجدول لجعلها أوسع قليلاً وتصميم راقي */
:deep(.v-data-table .v-data-table__tr:hover) {
  background-color: rgba(24, 103, 192, 0.03) !important;
}
:deep(.v-data-table > .v-table__wrapper > table > tbody > tr > td) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  font-size: 0.95rem;
}
:deep(.v-data-table > .v-table__wrapper > table > thead > tr > th) {
  font-weight: 700 !important;
  color: #424242 !important;
  font-size: 0.85rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #fafafa !important;
}
</style>`
  },
  {
    path: 'components/ImageUploader.vue',
    name: 'ImageUploader.vue',
    language: 'vue',
    code: `<template>
  <div class="image-uploader-wrapper w-100" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div v-if="label" class="text-subtitle-2 font-weight-bold mb-2 text-grey-darken-3">
      <v-icon icon="mdi-image-plus" size="small" class="mr-1"></v-icon>
      {{ label }}
    </div>
    <!-- حقل الرفع والإفلات -->
    <v-card 
      v-if="!currentImageUrl"
      variant="outlined" 
      class="upload-zone text-center rounded-lg pa-6 d-flex flex-column align-center justify-center position-relative cursor-pointer"
      :class="{ 'border-primary bg-primary-lighten-5': isDragging, 'border-error': error, 'border-dashed border-grey-lighten-1': !isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      v-ripple
    >
       <input 
         type="file" 
         ref="fileInputRef" 
         class="d-none" 
         accept="image/png, image/jpeg, image/jpg, image/webp" 
         @change="handleFileSelect" 
       />

       <div v-if="loading" class="w-100 d-flex flex-column align-center justify-center" style="height: 120px;">
         <v-progress-circular indeterminate color="primary" size="40" width="4" class="mb-4"></v-progress-circular>
         <div class="text-caption text-primary font-weight-bold">جاري الرفع السحابي...</div>
       </div>

       <div v-else class="w-100 d-flex flex-column align-center">
         <v-icon :icon="isDragging ? 'mdi-file-download-outline' : 'mdi-cloud-upload-outline'" :color="isDragging ? 'primary' : 'grey-lighten-1'" size="48" class="mb-3"></v-icon>
         <div class="text-body-1 font-weight-bold text-grey-darken-3 mb-1">
           {{ isDragging ? 'أفلت الصورة هنا' : 'انقر لاختيار صورة أو قم بسحبها هنا' }}
         </div>
         <div class="text-caption text-grey">
           أو قم بنسخها ولصقها مباشرة بالكيبورد (Ctrl+V)
         </div>
         <div class="text-caption text-grey mt-2">
           (الحد الأقصى: 5 ميغابايت)
         </div>
       </div>
    </v-card>

    <!-- عرض الصورة المرفوعة مع زر الإلغاء -->
    <v-card v-else class="image-preview rounded-lg overflow-hidden position-relative border">
      <v-img :src="currentImageUrl" height="200" cover class="bg-grey-lighten-4">
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="grey-lighten-2"></v-progress-circular>
          </div>
        </template>
      </v-img>
      
      <div class="preview-overlay d-flex align-center justify-center position-absolute top-0 left-0 w-100 h-100 bg-black-20">
         <v-btn
           icon="mdi-trash-can-outline"
           color="error"
           variant="flat"
           class="elevation-4"
           @click="removeImage"
         ></v-btn>
      </div>
    </v-card>

    <!-- رسائل الخطأ المخفية -->
    <div v-if="error" class="text-caption text-error mt-2 px-2 d-flex align-center">
      <v-icon icon="mdi-alert-circle-outline" size="x-small" class="mr-1"></v-icon>
      {{ error }}
    </div>

    <!-- التسمية التقليدية للمرجع إن أردت إظهار الرابط -->
    <v-text-field 
      v-show="false"
      :model-value="modelValue" 
      readonly
    ></v-text-field>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  bucket: { type: String, default: 'products' }, // الافتراضي هو حاوية Products
  label: { type: String, default: 'صورة المنتج' }
})

const emit = defineEmits(['update:modelValue'])

const isDragging = ref(false)
const isHovered = ref(false)
const loading = ref(false)
const error = ref('')
const currentImageUrl = ref(props.modelValue)
const fileInputRef = ref(null)

// تزامن حالة الكومبوننت مع البيرنت
watch(() => props.modelValue, (newVal) => {
  currentImageUrl.value = newVal
})

const triggerFileInput = () => {
  if (fileInputRef.value && !loading.value) {
    fileInputRef.value.click()
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) uploadFile(file)
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) uploadFile(file)
}

// دعم عملية اللصق Paste (Ctrl+V)
const handlePaste = (e) => {
  if (!isHovered.value) return // يعمل فقط عندما يكون مؤشر الماوس فوق المكوّن المحدّد
  if (currentImageUrl.value || loading.value) return // لا تقبل اللصق إذا كان هناك صورة أو قيد الرفع
  
  const items = (e.clipboardData || e.originalEvent.clipboardData).items
  for (let index in items) {
    const item = items[index]
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile()
      uploadFile(file)
      break
    }
  }
}

const validateFile = (file) => {
  error.value = ''
  if (!file.type.startsWith('image/')) {
    error.value = 'يُسمح فقط برفع الصور.'
    return false
  }
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    error.value = 'حجم الصورة يتجاوز الحد الأقصى (5 ميغابايت).'
    return false
  }
  return true
}

const uploadFile = async (file) => {
  if (!validateFile(file)) return
  
  loading.value = true
  error.value = ''

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $fetch('/api/upload?bucket=products', {
      method: 'POST',
      body: formData
    })
    
    currentImageUrl.value = response.url
    emit('update:modelValue', response.url)
    
  } catch (err) {
    console.error("خطأ في الرفع:", err)
    error.value = err.data?.message || 'حدث خطأ أثناء الرفع للسيرفر.'
  } finally {
    loading.value = false
    if(fileInputRef.value) fileInputRef.value.value = '' // تفريغ حقل الاختيار
  }
}

const removeImage = () => {
  currentImageUrl.value = ''
  emit('update:modelValue', '')
  // مستقبلاً يمكننا طلب حذف الصورة من السيرفر كلياً إن أردنا
}

onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})
</script>

<style scoped>
.upload-zone {
  min-height: 180px;
  transition: all 0.3s ease;
}
.upload-zone:hover {
  background-color: #f5f5f5;
  border-color: rgba(0,0,0,0.2) !important;
}
.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}
.bg-black-20 {
  background-color: rgba(0,0,0,0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.image-preview:hover .bg-black-20 {
  opacity: 1;
}
</style>`
  },
  {
    path: 'pages/inventory/index.vue',
    name: 'inventory/index.vue',
    language: 'vue',
    code: `<template>
  <div>
    <!-- عنوان الصفحة -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">إدارة المخزون</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" class="rounded-lg font-weight-bold text-none">
        إضافة منتج جديد
      </v-btn>
    </div>

    <!-- إحصائيات سريعة (Cards) -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
        <v-card elevation="2" class="rounded-lg h-100 pa-4 border-l-4" :style="border-left: 4px solid stat.color">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-subtitle-2 text-medium-emphasis mb-1 font-weight-bold">{{ stat.title }}</div>
              <div class="text-h5 font-weight-bold text-grey-darken-3">{{ stat.value }}</div>
            </div>
            <v-avatar :color="stat.color + '-lighten-4'" size="40">
              <v-icon :icon="stat.icon" :color="stat.color"></v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- جدول تجريبي (Data Table Dummy) -->
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="pa-4 border-b bg-white d-flex align-center justify-space-between">
        <span class="font-weight-bold text-subtitle-1">المنتجات الحالية</span>
        <div style="width: 250px;">
          <v-text-field
            density="compact"
            variant="outlined"
            placeholder="بحث بالكود أو الاسم..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            rounded="lg"
            bg-color="grey-lighten-4"
          ></v-text-field>
        </div>
      </v-card-title>
      
      <v-table hover>
        <thead>
          <tr>
            <th class="text-right font-weight-bold">الكود (SKU)</th>
            <th class="text-right font-weight-bold">اسم المنتج</th>
            <th class="text-right font-weight-bold">التصنيف</th>
            <th class="text-right font-weight-bold">الكمية المتوفرة</th>
            <th class="text-right font-weight-bold">الحالة</th>
            <th class="text-center font-weight-bold">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dummyInventory" :key="item.sku">
            <td class="font-weight-medium text-primary">{{ item.sku }}</td>
            <td>{{ item.name }}</td>
            <td class="text-medium-emphasis">{{ item.category }}</td>
            <td class="font-weight-bold">{{ item.stock }} وحدة</td>
            <td>
              <v-chip :color="item.stock > 10 ? 'success' : 'warning'" size="small" variant="flat" class="font-weight-bold">
                {{ item.stock > 10 ? 'متوفر' : 'أوشك على النفاد' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary"></v-btn>
              <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { title: 'إجمالي المنتجات', value: '1,248', icon: 'mdi-package-variant', color: '#1867C0' },
  { title: 'متوفر في المستودع (Local)', value: '850', icon: 'mdi-warehouse', color: '#4CAF50' },
  { title: 'متوفر في أمازون (FBA)', value: '398', icon: 'mdi-truck-delivery', color: '#FB8C00' },
  { title: 'منتجات منخفضة المخزون', value: '12', icon: 'mdi-alert-circle', color: '#B00020' },
  
])

const dummyInventory = ref([
  { sku: 'LP-SHO-B-42', name: 'حذاء رياضي أسود رجالي مقاس 42', category: 'أحذية', stock: 45 },
  { sku: 'LP-TSH-W-L', name: 'تي شيرت قطن أبيض رجالي Large', category: 'ملابس', stock: 120 },
  { sku: 'LP-BAG-L-BR', name: 'حقيبة لابتوب جلد بني', category: 'إكسسوارات', stock: 8 },
  { sku: 'LP-WAT-S-BL', name: 'ساعة يد رقمية ذكية', category: 'إلكترونيات', stock: 34 },
  { sku: 'LP-HDP-W-WH', name: 'سماعات رأس بلوتوث بيضاء', category: 'إلكترونيات', stock: 0 },
])
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}
.border-l-4 {
  border-left-width: 4px !important;
  border-left-style: solid !important;
}
</style>`
  },
  // {
  //   path: 'components/SmartDataTable.vue',
  //   name: 'SmartDataTable.vue',
  //   language: 'vue',
  //   code: ``
  // },
  // {
  //   path: 'components/SmartDataTable.vue',
  //   name: 'SmartDataTable.vue',
  //   language: 'vue',
  //   code: ``
  // },
  // {
  //   path: 'components/SmartDataTable.vue',
  //   name: 'SmartDataTable.vue',
  //   language: 'vue',
  //   code: ``
  // },
];
