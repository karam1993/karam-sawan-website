export const looplanfyFinanceFiles = [
  {
    path: 'components/purchases/InvoiceViewer.vue',
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
                <div class="text-h6 font-weight-bold">Invoice Details #{{ invoice.invoice_number }}</div>
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
                    <div class="text-caption text-grey-darken-1 mb-1 font-weight-bold">Supplier</div>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-domain" color="primary" class="mr-2"></v-icon>
                      <span class="text-body-1 font-weight-medium">{{ invoice.suppliers?.name || 'Not Specified' }}</span>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card class="elevation-0 border rounded-lg bg-white h-100 pa-4">
                    <div class="text-caption text-grey-darken-1 mb-1 font-weight-bold">Receiving Warehouse</div>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-warehouse" color="warning" class="mr-2"></v-icon>
                      <span class="text-body-1 font-weight-medium">{{ invoice.warehouses?.name || 'Not Specified' }}</span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Items Table -->
            <div class="pa-6">
              <div class="text-h6 font-weight-bold text-primary mb-4 d-flex align-center">
                <v-icon icon="mdi-format-list-bulleted" class="mr-2"></v-icon>
                Invoice Items
              </div>
              
              <v-table class="border rounded-lg bg-white" density="comfortable">
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th class="text-right font-weight-bold">Product</th>
                    <th class="text-center font-weight-bold">Quantity</th>
                    <th class="text-center font-weight-bold">Purchase Price (Gross)</th>
                    <th class="text-center font-weight-bold">Tax</th>
                    <th class="text-center font-weight-bold">Net</th>
                    <th class="text-center font-weight-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in invoice.purchase_invoice_items" :key="item.id" class="border-b">
                    <td class="text-right pa-3">
                      <div class="font-weight-bold">{{ item.products?.name || 'Deleted Product' }}</div>
                      <div class="text-caption text-grey">{{ item.products?.sku || '' }}</div>
                    </td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-center font-weight-bold text-primary">{{ formatMoney(item.unit_price_gross) }} ₺</td>
                    <td class="text-center">%{{ item.kdv_rate }}</td>
                    <td class="text-center text-success font-weight-medium">{{ formatMoney(item.net_unit_cost) }} ₺</td>
                    <td class="text-center font-weight-black">{{ formatMoney(item.quantity * item.unit_price_gross) }} ₺</td>
                  </tr>
                  <tr v-if="!invoice.purchase_invoice_items?.length">
                    <td colspan="6" class="text-center pa-4 text-grey">No items registered in this invoice.</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            
            <!-- Notes -->
            <div v-if="invoice.notes" class="px-6 pb-6">
              <div class="text-subtitle-2 font-weight-bold text-grey-darken-1 mb-2">Invoice Notes</div>
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
                  {{ invoice.status === 'APPROVED' ? 'Approved - Added to Inventory' : 'Draft under review' }}
                </v-chip>
            </div>
            <div class="d-flex gap-6 text-right w-100 justify-md-end pr-md-6">
                <div>
                  <div class="text-caption text-grey-lighten-1 mb-1">Total Quantity</div>
                  <div class="text-h6 font-weight-bold">{{ totalItemsQuantity }}</div>
                </div>
                <div>
                  <div class="text-caption text-grey-lighten-1 mb-1">Invoice Net</div>
                  <div class="text-h6 font-weight-bold text-success">{{ formatMoney(invoice.total_net_amount) }} ₺</div>
                </div>
                <div>
                  <div class="text-caption text-grey-lighten-1 mb-1">Invoice Total (Gross)</div>
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
        const data = await $fetch('/api/purchases/{id}')
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
    path: 'components/shared/SmartDataTable.vue',
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
          <!-- Custom filter (if any) -->
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

          <!-- Quick search bar -->
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
          
          <!-- Slot for top custom actions (e.g. add button) -->
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
      <!-- Pass all slots from parent to internal v-data-table -->
      <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>

      <!-- Custom default "no data" message -->
      <template v-slot:no-data>
        <div class="pa-6 text-center">
          <v-icon icon="mdi-database-search-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
          <div class="text-h6 text-grey-darken-1">No records found.</div>
          <slot name="no-data-action"></slot>
        </div>
      </template>

      <!-- Bottom control panel (Pagination) -->
      <template v-slot:bottom>
        <div class="d-flex align-center justify-space-between pa-4 border-t bg-grey-lighten-5">
          <div class="d-flex align-center gap-4">
             <span class="text-caption text-grey-darken-1 font-weight-bold d-none d-sm-inline">Rows per page:</span>
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
  // Table title and content
  title: { type: String, default: 'Data List' },
  icon: { type: String, default: 'mdi-table' },
  
  // Data settings via API
  endpoint: { type: String, required: true }, // API endpoint to fetch data
  headers: { type: Array, required: true, default: () => [] },
  
  // Search settings
  showSearch: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Search records...' },
  
  // Filter settings
  showFilter: { type: Boolean, default: false },
  filterKey: { type: String, default: 'filter' },
  filterOptions: { type: Array, default: () => [] },

  // Dynamic extra search parameters
  extraParams: { type: Object, default: () => ({}) },

  // Key to save filter state and page number in session storage
  stateKey: { type: String, default: '' },

  // Multi-select options
  showSelect: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:selected'])

const modelSelected = computed({
  get: () => props.selected,
  set: (val) => emit('update:selected', val)
})

// Local variables 
const activeFilter = ref(props.filterOptions.length > 0 ? props.filterOptions[0] : null)
const searchQuery = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const items = ref([])
const totalItems = ref(0)
const summary = ref(null)
const loading = ref(true)

// Calculate page count based on server data
const pageCount = ref(1)

// Fetch data directly from server
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
    console.error("Error fetching data:", error)
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// Expose refresh function to allow parent (like users page) to reload table after add/edit
defineExpose({ refresh: fetchData, summary })

// Save state in session storage
const saveState = () => {
  if (props.stateKey && typeof window !== 'undefined') {
    const state = {
      searchQuery: searchQuery.value,
      itemsPerPage: itemsPerPage.value,
      page: page.value,
      activeFilter: activeFilter.value ? { value: activeFilter.value.value, key: activeFilter.value.key } : null
    }
    sessionStorage.setItem('smart_table_{props.stateKey}', JSON.stringify(state))
  }
}

let isRestoring = false

// Watch and refresh on value change, resetting page to 1 on search or filter
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

// Fetch data on mount and restore state
onMounted(() => {
  if (props.stateKey && typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('smart_table_{props.stateKey}')
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
        // Restore page last so other watches don't reset it to 1
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

/* Optimize table row style to be wider and premium */
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
    path: 'pages/purchases/create.vue',
    name: 'create.vue',
    language: 'vue',
    code: `<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-1">Enter Purchase Invoice</h1>
        <div class="text-body-2 text-grey-darken-1">Register new goods with net cost and tax calculated automatically.</div>
      </div>
      <v-btn color="grey-darken-2" variant="tonal" prepend-icon="mdi-arrow-right" class="rounded-lg font-weight-bold" @click="router.back()">
        Back
      </v-btn>
    </div>

    <!-- Alert for errors -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4 text-body-2 font-weight-bold" closable @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- Alert for success -->
    <v-alert v-if="success" type="success" variant="tonal" class="mb-4 text-body-2 font-weight-bold" closable @click:close="success = false">
      Invoice successfully saved as draft. Redirecting...
    </v-alert>

    <v-form @submit.prevent="submitInvoice" ref="formRef" :disabled="loading">
      
      <!-- Section One: Invoice Header -->
      <v-card class="rounded-xl mb-6 border elevation-0">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-6 text-primary border-b bg-grey-lighten-4">
          <v-icon icon="mdi-file-document-outline" class="mr-2"></v-icon>
          Basic Invoice Data
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field v-model="invoice.invoice_number" label="Invoice Reference Number *" variant="outlined" color="primary" :rules="[v => !!v || 'Required']" rounded="lg" density="comfortable" bg-color="white"></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="invoice.invoice_date" type="datetime-local" label="Invoice Date *" variant="outlined" color="primary" :rules="[v => !!v || 'Required']" rounded="lg" density="comfortable" bg-color="white"></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-autocomplete
                :model-value="invoice.supplier_id"
                :items="suppliers"
                item-title="name"
                item-value="id"
                label="Supplier *"
                variant="outlined"
                color="primary"
                :rules="[v => !!v || 'Required']"
                rounded="lg"
                density="comfortable"
                bg-color="white"
                :loading="loadingSuppliers"
                @update:model-value="onSupplierToggleAttempt"
                @update:search="onSupplierSearch"
                :custom-filter="() => true"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="invoice.warehouse_id"
                :items="warehouses"
                item-title="name"
                item-value="id"
                label="Receiving Warehouse *"
                variant="outlined"
                color="primary"
                :rules="[v => !!v || 'Required']"
                rounded="lg"
                density="comfortable"
                bg-color="white"
                :loading="loadingWarehouses"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="item.raw.type + ' WAREHOUSE'"></v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Section Two: Invoice Lines (Items) -->
      <v-card class="rounded-xl mb-6 border elevation-0">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-6 text-primary border-b bg-grey-lighten-4 d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center">
            <v-icon icon="mdi-format-list-bulleted" class="mr-2"></v-icon>
            Invoice Items
          </div>
          <div class="d-flex align-center gap-4">
            <v-switch
              :model-value="filterBySupplier"
              @update:model-value="onFilterToggleAttempt"
              color="primary"
              label="Show supplier products only"
              hide-details
              density="compact"
              class="font-weight-bold"
              :disabled="!invoice.supplier_id"
            ></v-switch>
            <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" class="rounded-lg font-weight-bold text-none mr-4" @click="addLineItem">
              Add Line
            </v-btn>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-table class="bg-transparent">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-start font-weight-bold text-grey-darken-3" style="width: 35%;">
                  <div class="d-flex justify-space-between align-center">
                    <span>Product / Material</span>
                    <v-btn size="x-small" color="primary" variant="text" prepend-icon="mdi-package-variant-plus" @click="openQuickAdd">Add New Product</v-btn>
                  </div>
                </th>
                <th class="text-center font-weight-bold text-grey-darken-3" style="width: 10%;">Quantity</th>
                <th class="text-center font-weight-bold text-grey-darken-3" style="width: 15%;">Unit Purchase Price<br><span class="text-caption text-primary">(Gross ₺)</span></th>
                <th class="text-center font-weight-bold text-grey-darken-3" style="width: 10%;">Tax (KDV)</th>
                <th class="text-center font-weight-bold text-grey-darken-3" style="width: 12%;">Net Cost<br><span class="text-caption text-success">(Auto calculated ₺)</span></th>
                <th class="text-center font-weight-bold text-grey-darken-3" style="width: 13%;">Total<br><span class="text-caption">(Gross ₺)</span></th>
                <th class="text-center font-weight-bold text-grey-darken-3" style="width: 5%;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in invoice.items" :key="index" class="border-b">
                <td class="pa-2">
                  <v-autocomplete
                    v-model="item.product_id"
                    :items="getAvailableProductsForLine(index)"
                    item-title="name"
                    item-value="id"
                    placeholder="Search for product..."
                    variant="outlined"
                    density="compact"
                    hide-details
                    bg-color="white"
                    :custom-filter="() => true"
                    @update:search="onProductSearchInput"
                    @update:modelValue="onProductSelected(index, $event)"
                  >
                    <template v-slot:append-item>
                      <div v-intersect="loadMoreProducts" class="pa-2 text-center">
                        <v-progress-circular v-if="loadingMoreProducts" indeterminate color="primary" size="24"></v-progress-circular>
                      </div>
                    </template>
                    <template v-slot:item="{ props, item: prod }">
                      <v-list-item v-bind="props" :subtitle="prod.raw.sku">
                        <template v-slot:prepend>
                          <v-avatar color="primary-lighten-4" class="mr-3" size="32" variant="tonal">
                            <v-img v-if="prod.raw.image_url" :src="prod.raw.image_url" cover></v-img>
                            <span v-else class="text-caption font-weight-bold text-primary">{{ prod.raw.name?.charAt(0)?.toUpperCase() || 'P' }}</span>
                          </v-avatar>
                        </template>
                        <template v-slot:title>
                          <span class="font-weight-bold">{{ prod.raw.name }}</span>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </td>
                <td class="pa-2">
                  <v-text-field v-model.number="item.quantity" type="number" min="1" variant="outlined" density="compact" hide-details class="text-center center-input"></v-text-field>
                </td>
                <td class="pa-2">
                  <v-text-field v-model.number="item.unit_price_gross" type="number" min="0" step="0.01" variant="outlined" density="compact" hide-details class="text-center center-input text-primary font-weight-bold"></v-text-field>
                </td>
                <td class="pa-2">
                  <v-select v-model.number="item.kdv_rate" :items="[0, 1, 10, 20]" variant="outlined" density="compact" hide-details class="text-center center-input">
                    <template v-slot:selection="{ item }">%{{ item.title }}</template>
                    <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="'%' + item.title"></v-list-item></template>
                  </v-select>
                </td>
                <td class="pa-2 text-center bg-grey-lighten-5">
                  <div class="font-weight-bold text-success">{{ formatMoney(calculateNet(item.unit_price_gross, item.kdv_rate)) }}</div>
                </td>
                <td class="pa-2 text-center bg-grey-lighten-5">
                  <div class="font-weight-black text-grey-darken-4">{{ formatMoney((item.quantity || 0) * (item.unit_price_gross || 0)) }}</div>
                </td>
                <td class="pa-2 text-center">
                  <v-btn icon="mdi-close" size="x-small" color="error" variant="text" @click="removeLineItem(index)" :disabled="invoice.items.length === 1"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <div v-if="invoice.items.length === 0" class="text-center pa-8 text-grey text-body-1">
            No items in invoice yet.
          </div>
        </v-card-text>
        
        <v-divider></v-divider>
        <v-card-text class="bg-grey-lighten-5 pa-4">
           <v-textarea v-model="invoice.notes" label="Explanatory notes for invoice (Optional)" variant="outlined" color="primary" rows="2" auto-grow rounded="lg" bg-color="white" hide-details></v-textarea>
        </v-card-text>
      </v-card>

      <!-- Section Three: Financial Summary & Approval -->
      <v-card class="rounded-xl border elevation-4 bg-primary-darken-1 text-white">
        <v-card-text class="pa-6">
          <v-row align="center">
            <v-col cols="12" md="4" class="text-center text-md-right border-e-md" style="border-color: rgba(255,255,255,0.2) !important;">
               <div class="text-caption text-white-lighten-2 text-uppercase mb-1">Total Quantity</div>
               <div class="text-h5 font-weight-bold">{{ totalQuantity }} <span class="text-body-2">pcs</span></div>
            </v-col>
            <v-col cols="12" md="4" class="text-center text-md-right border-e-md" style="border-color: rgba(255,255,255,0.2) !important;">
               <div class="text-caption text-white-lighten-2 text-uppercase mb-1">Total Tax (KDV)</div>
               <div class="text-h5 font-weight-bold text-yellow-lighten-1">{{ formatMoney(totalVat) }} ₺</div>
            </v-col>
            <v-col cols="12" md="4" class="text-center text-md-right">
               <div class="text-caption text-white-lighten-2 text-uppercase mb-1">Invoice Total (Gross)</div>
               <div class="text-h4 font-weight-black text-white">{{ formatMoney(totalGross) }} ₺</div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider style="border-color: rgba(255,255,255,0.2) !important;"></v-divider>
        <v-card-actions class="pa-4 bg-primary d-flex justify-end pr-6">
           <v-btn color="white" variant="text" class="font-weight-bold text-none rounded-lg mr-2" @click="router.back()">Cancel</v-btn>
           <v-btn color="white" variant="flat" class="font-weight-black text-primary text-none rounded-lg px-8" size="large" type="submit" :loading="loading" prepend-icon="mdi-content-save-check">
             Save Invoice (Draft)
           </v-btn>
        </v-card-actions>
      </v-card>

    </v-form>

    <!-- Modal Add New Product (Quick Add) -->
    <v-dialog v-model="addDialog" max-width="800" persistent scrollable>
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h5 font-weight-bold pt-4 px-4 d-flex justify-space-between align-center text-primary">
          <div class="d-flex align-center">
             <v-icon icon="mdi-package-variant-plus" class="mr-2"></v-icon>
             Add New Product & Link to Invoice
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeQuickAdd"></v-btn>
        </v-card-title>
        
        <v-divider class="mt-2"></v-divider>

        <v-card-text class="pt-4 px-4" style="max-height: 70vh;">
          <v-alert v-if="selectedSupplierName" type="info" variant="tonal" class="mb-4 text-body-2 font-weight-bold" icon="mdi-link-variant">
            This product will be added and linked automatically to the selected supplier ({{ selectedSupplierName }}) in the invoice.
          </v-alert>

          <v-alert v-if="dialogError" type="error" variant="tonal" class="mb-4 text-body-2 font-weight-bold">
            {{ dialogError }}
          </v-alert>

          <v-form @submit.prevent="createProduct" ref="addForm">
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-2 mb-1">Basic Product Information</div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="newProduct.name" label="Product Name *" variant="outlined" color="primary" :rules="[v => !!v || 'Required']" required rounded="lg" density="comfortable"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                 <v-text-field v-model="newProduct.sku" label="Product Code (SKU) *" variant="outlined" color="primary" :rules="[v => !!v || 'Required']" required dir="ltr" rounded="lg" density="comfortable"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                 <v-select v-model="newProduct.type" :items="[{ title: 'Raw Component (Component)', value: 'COMPONENT' }, { title: 'Packaging Material (Packaging)', value: 'PACKAGING' }]" label="Product Type *" variant="outlined" color="primary" :rules="[v => !!v || 'Required']" required rounded="lg" density="comfortable"></v-select>
              </v-col>
              <v-col cols="12" md="6">
                 <v-text-field v-model="newProduct.stock_alert_level" label="Stock Alert Level" type="number" variant="outlined" color="primary" rounded="lg" density="comfortable" min="0"></v-text-field>
              </v-col>

              <v-col cols="12">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-2 mt-2 mb-1">Financial & Tax Information</div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="newProduct.purchase_price_gross" label="Gross Purchase Price (Tax Inclusive)" type="number" variant="outlined" color="primary" rounded="lg" density="comfortable" min="0" step="0.01" prefix="₺"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="newProduct.kdv_rate" :items="[0, 1, 10, 20]" label="Tax Rate (KDV) *" variant="outlined" color="primary" :rules="[v => v !== null || 'Required']" required rounded="lg" density="comfortable">
                  <template v-slot:selection="{ item }">%{{ item.title }}</template>
                  <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="'%' + item.title"></v-list-item></template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-2 mt-2 mb-1">Images & Status</div>
              </v-col>
              <v-col cols="12">
                 <ImageUploader v-model="newProduct.image_url" bucket="products" label="Product Image" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 d-flex justify-end gap-2">
          <v-btn color="grey-darken-1" variant="text" class="font-weight-bold text-none rounded-lg" @click="closeQuickAdd">Cancel</v-btn>
          <v-btn color="primary" class="font-weight-bold text-none rounded-lg px-6" :loading="savingProduct" @click="$refs.addForm.requestSubmit()">Add & Integrate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Dialog for toggling supplier filter -->
    <ConfirmDialog 
      v-model="showToggleFilterDialog"
      title="Warning: Clear Invoice Lines" 
      message="Changing product display mode will clear all current invoice lines to avoid data conflicts. Are you sure you want to continue?"
      confirmText="Yes, clear and continue"
      cancelText="Cancel"
      @confirm="executeFilterToggle"
      @cancel="cancelFilterToggle"
    />

    <!-- Confirm Dialog for changing supplier -->
    <ConfirmDialog 
      v-model="showChangeSupplierDialog"
      title="Warning: Change Supplier" 
      message="Changing supplier will clear all items you entered to avoid mixing supplier products. Are you sure you want to continue?"
      confirmText="Yes, clear and change supplier"
      cancelText="Cancel"
      @confirm="executeSupplierToggle"
      @cancel="cancelSupplierToggle"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ImageUploader from '@/components/shared/ImageUploader.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const router = useRouter()
const route = useRoute()

// --- State ---
const formRef = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const suppliers = ref([])
const warehouses = ref([])
const products = ref([])
const productPage = ref(1)
const productLimit = ref(20)
const productSearch = ref('')
const hasMoreProducts = ref(true)
const loadingMoreProducts = ref(false)
let productSearchTimeout = null
const selectedProductDetails = ref(new Map())

const loadingSuppliers = ref(false)
const loadingWarehouses = ref(false)
const loadingProducts = ref(false)

// Smart Filter State
const filterBySupplier = ref(true)
const showToggleFilterDialog = ref(false)
const pendingFilterState = ref(null)

// Change Supplier State
const showChangeSupplierDialog = ref(false)
const pendingSupplierState = ref(null)

// --- Handlers for Filter Toggle ---
const onFilterToggleAttempt = (newVal) => {
  const hasSelectedProducts = invoice.value.items.some(i => i.product_id)
  
  if (hasSelectedProducts) {
    pendingFilterState.value = newVal
    showToggleFilterDialog.value = true
  } else {
    filterBySupplier.value = newVal
    fetchProducts()
  }
}

const executeFilterToggle = () => {
  filterBySupplier.value = pendingFilterState.value
  invoice.value.items = [{ product_id: null, quantity: null, unit_price_gross: null, kdv_rate: 20 }]
  showToggleFilterDialog.value = false
  fetchProducts()
}

const cancelFilterToggle = () => {
  pendingFilterState.value = null
  showToggleFilterDialog.value = false
}

// --- Handlers for Supplier Change ---
const onSupplierToggleAttempt = (newVal) => {
  // If the new value is the same as the old value, do nothing
  if (newVal === invoice.value.supplier_id) return

  const hasSelectedProducts = invoice.value.items.some(i => i.product_id)

  if (hasSelectedProducts) {
    pendingSupplierState.value = newVal
    showChangeSupplierDialog.value = true
  } else {
    // If no products chosen, just change safely
    invoice.value.supplier_id = newVal
    onSupplierChanged() // Clean lines anyway to be safe over old logic
  }
}

const executeSupplierToggle = () => {
  invoice.value.supplier_id = pendingSupplierState.value
  invoice.value.items = [{ product_id: null, quantity: null, unit_price_gross: null, kdv_rate: 20 }]
  showChangeSupplierDialog.value = false
}

const cancelSupplierToggle = () => {
  pendingSupplierState.value = null
  showChangeSupplierDialog.value = false
}

const displayProducts = computed(() => {
  const list = [...products.value]
  
  // Add items from cache that are currently selected in the invoice
  // so they don't lose their names if they aren't in the current paginated view
  const selectedIds = invoice.value.items.map(i => i.product_id).filter(id => id)
  
  selectedIds.forEach(id => {
    if (!list.find(p => p.id === id) && selectedProductDetails.value.has(id)) {
      list.push(selectedProductDetails.value.get(id))
    }
  })
  
  return list
})

const selectedSupplierName = computed(() => {
  if (!invoice.value.supplier_id) return ''
  const sup = suppliers.value.find(s => s.id === invoice.value.supplier_id)
  return sup ? sup.name : ''
})

// Format Current Date fordatetime-local
const getNowISO = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
}

const onSupplierChanged = () => {
  // If supplier changes, empty the items to prevent orphaned products that don't belong to the new supplier
  invoice.value.items = [
    { product_id: null, quantity: null, unit_price_gross: null, kdv_rate: 20 }
  ]
  fetchProducts()
}

const invoice = ref({
  invoice_number: 'INV-{Date.now()}',
  invoice_date: getNowISO(),
  supplier_id: route.query.supplier || null, // Pre-fill from query param
  warehouse_id: null,
  notes: '',
  items: [
    { product_id: null, quantity: null, unit_price_gross: null, kdv_rate: 20 } // Initial empty line
  ]
})

// --- Initialization: Fetching Data ---
onMounted(async () => {
  fetchSuppliers()
  fetchWarehouses()
  fetchProducts()
})

let supplierSearchTimeout = null

const onSupplierSearch = (val) => {
  const query = val ? val.trim() : ''
  if (supplierSearchTimeout) clearTimeout(supplierSearchTimeout)
  supplierSearchTimeout = setTimeout(() => {
    fetchSuppliers(query)
  }, 300)
}

const fetchSuppliers = async (search = '') => {
  loadingSuppliers.value = true
  try {
    const res = await $fetch('/api/suppliers', {
      query: {
        search: search,
        limit: 100
      }
    })
    const fetchedItems = res.items || res || []
    
    // Preserve selected supplier so it doesn't disappear from the UI autocomplete list
    const selectedId = invoice.value?.supplier_id
    const preserved = suppliers.value.filter(s => s.id === selectedId)
    
    // Merge without duplicates
    const combined = [...preserved]
    fetchedItems.forEach(item => {
      if (!combined.some(c => c.id === item.id)) {
        combined.push(item)
      }
    })
    
    suppliers.value = combined
  } catch (e) {
    console.error('Error fetching suppliers:', e)
  } finally {
    loadingSuppliers.value = false
  }
}

const fetchWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const res = await $fetch('/api/warehouses')
    const allWarehouses = res.items || res
    
    // Hide FBA warehouses and show LOCAL warehouses only
    warehouses.value = allWarehouses.filter(w => w.type === 'LOCAL')
    
    // Set first local warehouse as default
    if (warehouses.value.length > 0 && !invoice.value.warehouse_id) {
       invoice.value.warehouse_id = warehouses.value[0].id
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingWarehouses.value = false
  }
}

const fetchProducts = async (isLoadMore = false) => {
  if (isLoadMore) {
    if (!hasMoreProducts.value || loadingMoreProducts.value) return
    loadingMoreProducts.value = true
    productPage.value++
  } else {
    loadingProducts.value = true
    productPage.value = 1
    hasMoreProducts.value = true
    products.value = [] // clear current list when it's a new search/filter
  }

  try {
    const queryParams = new URLSearchParams({
      page: productPage.value,
      itemsPerPage: productLimit.value,
      type_not: 'BUNDLE' // We don't purchase bundles
    })

    if (productSearch.value) queryParams.append('search', productSearch.value)
    
    if (filterBySupplier.value && invoice.value.supplier_id) {
      queryParams.append('supplier_id', invoice.value.supplier_id)
    }

    const res = await $fetch('/api/products?{queryParams.toString()}')
    const items = res.items || []
    
    if (isLoadMore) {
      const newItems = items.filter(newItem => !products.value.find(p => p.id === newItem.id))
      products.value.push(...newItems)
    } else {
      products.value = items
    }
    
    // Cache fetched items to avoid losing names
    items.forEach(p => selectedProductDetails.value.set(p.id, p))

    // Protect against infinite pagination mathematically using totalItems
    if (productPage.value * productLimit.value >= (res.totalItems || 0)) {
      hasMoreProducts.value = false
    } else {
      hasMoreProducts.value = true
    }

  } catch (e) {
    console.error(e)
  } finally {
    loadingProducts.value = false
    loadingMoreProducts.value = false
  }
}

const onProductSearchInput = (val) => {
  if (typeof val !== 'string') return
  productSearch.value = val || ''
  clearTimeout(productSearchTimeout)
  productSearchTimeout = setTimeout(() => {
    fetchProducts()
  }, 500)
}

const loadMoreProducts = (isIntersecting) => {
  const isVisible = typeof isIntersecting === 'boolean' ? isIntersecting : (isIntersecting?.[0]?.isIntersecting || isIntersecting?.isIntersecting || false)
  if (isVisible && hasMoreProducts.value && !loadingProducts.value && !loadingMoreProducts.value) {
    fetchProducts(true)
  }
}

// --- Quick Add Product Logic ---
const addDialog = ref(false)
const savingProduct = ref(false)
const dialogError = ref('')
const addForm = ref(null)

const newProduct = ref({
  name: '',
  sku: '',
  type: 'COMPONENT',
  image_url: '',
  stock_alert_level: 0,
  purchase_price_gross: 0,
  kdv_rate: 20,
  is_active: true
})

const openQuickAdd = () => {
  addDialog.value = true
}

const closeQuickAdd = () => {
  addDialog.value = false
  dialogError.value = ''
  newProduct.value = { stock_alert_level: 0, purchase_price_gross: 0, kdv_rate: 20, is_active: true, name: '', sku: '', type: 'COMPONENT', image_url: '' }
  if(addForm.value) addForm.value.resetValidation()
}

const createProduct = async () => {
  if (!newProduct.value.name || !newProduct.value.sku || !newProduct.value.type) return
  
  savingProduct.value = true
  dialogError.value = ''
  
  try {
    const payload = { ...newProduct.value }
    // Attach current supplier if selected so the product auto-links
    if (invoice.value.supplier_id) {
      payload.supplier_ids = [invoice.value.supplier_id]
    }

    const { data } = await $fetch('/api/products', {
      method: 'POST',
      body: payload
    })
    
    // Refresh products quietly
    await fetchProducts()
    
    // Auto-select in invoice
    // Find empty line or add new
    let emptyLineIndex = invoice.value.items.findIndex(i => !i.product_id)
    if (emptyLineIndex === -1) {
       addLineItem()
       emptyLineIndex = invoice.value.items.length - 1
    }
    
    invoice.value.items[emptyLineIndex].product_id = data.id
    onProductSelected(emptyLineIndex, data.id)
    
    closeQuickAdd()
  } catch (error) {
    console.error("Error creating product:", error)
    dialogError.value = error.data?.message || 'An error occurred while trying to create the product.'
  } finally {
    savingProduct.value = false
  }
}

// --- Dynamic Line Logic ---

const addLineItem = () => {
  invoice.value.items.push({ product_id: null, quantity: null, unit_price_gross: null, kdv_rate: 20 })
}

const getAvailableProductsForLine = (currentIndex) => {
  // Get all products currently selected in OTHER lines
  const selectedProductIds = invoice.value.items
    .filter((item, index) => index !== currentIndex && item.product_id)
    .map(item => item.product_id)
  
  // Return products that are not selected in other lines
  return displayProducts.value.filter(p => !selectedProductIds.includes(p.id))
}

const removeLineItem = (index) => {
  if (invoice.value.items.length > 1) {
    invoice.value.items.splice(index, 1)
  }
}

// When user selects a product, auto-fill gross price and KDV from the product master
const onProductSelected = (index, productId) => {
  let prod = products.value.find(p => p.id === productId)
  if (!prod) prod = selectedProductDetails.value.get(productId) // Fallback to cache
  if (prod) {
    invoice.value.items[index].unit_price_gross = Number(prod.purchase_price_gross) || 0
    invoice.value.items[index].kdv_rate = Number(prod.kdv_rate) || 0
  }
}

// --- Math Helpers ---
const calculateNet = (gross, kdv) => {
  if(!gross) return 0
  return gross / (1 + (kdv / 100))
}

const formatMoney = (val) => {
  return Number(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// --- Computed Summaries ---

const totalQuantity = computed(() => {
  return invoice.value.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

const totalGross = computed(() => {
  return invoice.value.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unit_price_gross) || 0)), 0)
})

const totalNet = computed(() => {
  return invoice.value.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * calculateNet(item.unit_price_gross, item.kdv_rate)), 0)
})

const totalVat = computed(() => {
  return totalGross.value - totalNet.value
})

// --- Submission ---

const submitInvoice = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) {
    error.value = 'Please complete all required fields highlighted in red.'
    return
  }

  // Check for incomplete lines
  const hasEmptyItems = invoice.value.items.some(item => !item.product_id || !item.quantity || item.quantity <= 0)
  if (hasEmptyItems) {
    error.value = 'Please select a product and enter a valid quantity for all lines.'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    // Convert dates to correct timezone
    const payload = {
      ...invoice.value,
      invoice_date: new Date(invoice.value.invoice_date).toISOString()
    }

    const { invoice_id } = await $fetch('/api/purchases', {
      method: 'POST',
      body: payload
    })

    success.value = true
    router.push('/purchases')

  } catch (err) {
    console.error(err)
    error.value = err.data?.message || 'Failed to save invoice. Please check your connection and inputs.'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* Style to center text inside input boxes in table */
:deep(.center-input input) {
  text-align: center !important;
}
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
</style>`
  },
  {
    path: 'pages/purchases/index.vue',
    name: 'index.vue',
    language: 'vue',
    code: `<template>
  <div>
    <!-- Title and Top Stats Section -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-1">Purchase Invoice Management</h1>
        <div class="text-body-2 text-grey-darken-1">Record goods receipt and expenses, and approve invoices to enter them into the warehouse.</div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-receipt-text-plus-outline" class="rounded-lg font-weight-bold text-none px-6" size="large" to="/purchases/create">
        Enter New Invoice
      </v-btn>
    </div>

    <!-- Invoice List Table -->
    <SmartDataTable
      ref="dataTableRef"
      endpoint="/api/purchases"
      title="Invoice Log"
      icon="mdi-format-list-bulleted-type"
      :headers="headers"
      searchPlaceholder="Search by invoice number..."
      :showFilter="true"
      filterKey="status"
      :filterOptions="[
        { title: 'All', value: 'all' },
        { title: 'Draft (DRAFT)', value: 'DRAFT' },
        { title: 'Approved (APPROVED)', value: 'APPROVED' }
      ]"
    >
      <!-- Customize invoice number and date -->
      <template v-slot:item.invoice_info="{ item }">
        <div class="py-2">
          <div class="font-weight-bold text-primary text-body-1">{{ item.invoice_number }}</div>
          <div class="text-caption text-grey-darken-1 mt-1">
            <v-icon icon="mdi-calendar-clock-outline" size="x-small" class="mr-1"></v-icon>
            {{ new Date(item.invoice_date).toLocaleString('ar-EG', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) }}
          </div>
        </div>
      </template>

      <!-- Customize supplier and warehouse -->
      <template v-slot:item.entities="{ item }">
        <div class="d-flex flex-column gap-1">
          <div class="text-body-2 font-weight-medium text-grey-darken-4">
            <v-icon icon="mdi-domain" size="small" class="mr-2 text-primary"></v-icon>
            {{ item.supplier_name }}
          </div>
          <div class="text-caption text-grey-darken-1">
            <v-icon icon="mdi-warehouse" size="small" class="mr-2 text-warning"></v-icon>
            {{ item.warehouse_name }}
          </div>
        </div>
      </template>

      <!-- Net Cost and Tax -->
      <template v-slot:item.financials="{ item }">
        <div class="d-flex flex-column text-right w-100">
           <div class="text-caption text-grey-darken-2">
             Net: <span class="font-weight-bold">{{ Number(item.total_net_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} ₺</span>
           </div>
           <div class="text-caption text-grey-darken-2">
             Tax: <span class="font-weight-bold text-warning">{{ Number(item.total_vat_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} ₺</span>
           </div>
        </div>
      </template>

      <!-- Total (Gross) -->
      <template v-slot:item.total_amount="{ item }">
        <div class="font-weight-black text-h6" :class="item.status === 'APPROVED' ? 'text-success' : 'text-primary'">
          {{ Number(item.total_gross_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} ₺
        </div>
      </template>

      <!-- Invoice status -->
      <template v-slot:item.status="{ item }">
        <v-chip 
          :color="item.status === 'APPROVED' ? 'success' : 'warning'" 
          :prepend-icon="item.status === 'APPROVED' ? 'mdi-check-all' : 'mdi-file-edit-outline'"
          size="small" 
          variant="tonal" 
          class="font-weight-bold border"
          :border="item.status === 'APPROVED' ? 'success' : 'warning'"
        >
          {{ item.status === 'APPROVED' ? 'Closed & Added to Inventory' : 'Draft' }}
        </v-chip>
      </template>

      <!-- Advanced Actions -->
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center justify-center">
          <v-menu location="start">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" size="small" color="grey-darken-2" v-bind="props"></v-btn>
            </template>
            <v-list density="compact" class="rounded-lg elevation-4 pa-0 py-1" min-width="180">
              
              <!-- View Details -->
              <v-list-item @click="openInvoiceViewer(item.id)" value="view">
                <template v-slot:prepend>
                  <v-icon icon="mdi-eye-outline" size="small" class="mr-2 text-primary"></v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">View Invoice</v-list-item-title>
              </v-list-item>

              <v-divider class="my-1"></v-divider>

              <!-- Final Approval -->
              <v-list-item 
                v-if="item.status === 'DRAFT'" 
                @click="confirmApprove(item)" 
                value="approve"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-check-decagram-outline" size="small" class="mr-2 text-success"></v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-bold text-success">Approve & Add to Inventory</v-list-item-title>
              </v-list-item>

            </v-list>
          </v-menu>
        </div>
      </template>
    </SmartDataTable>

    <!-- Advanced Approval Confirmation Dialog (Approve Modal) -->
    <v-dialog v-model="showApproveDialog" max-width="500" persistent>
      <v-card class="rounded-xl border elevation-4">
        <v-card-title class="bg-primary text-white d-flex align-center pa-4">
          <v-icon icon="mdi-check-decagram-outline" class="mr-2"></v-icon>
          Approve Invoice Finally
        </v-card-title>
        
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4 font-weight-medium">
            Once approved, the system will automatically increase item balances in the warehouse and add the invoice value 
            <strong dir="ltr">({{ invoiceToApprove ? Number(invoiceToApprove.total_gross_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : 0 }} ₺)</strong>
            to the supplier's debt. You will not be able to edit the invoice after this. Are you sure you want to proceed?
          </p>
          
          <v-divider class="mb-5"></v-divider>
          
          <div class="text-subtitle-1 font-weight-bold mb-2 text-primary">Did you pay a installment of this amount immediately? (Optional)</div>
          <v-row>
            <v-col cols="12" sm="7">
              <v-text-field
                v-model.number="paymentAmount"
                label="Paid Amount"
                type="number"
                min="0"
                variant="outlined"
                color="primary"
                density="comfortable"
                hide-details
                suffix="₺"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="5">
              <v-select
                v-model="paymentMethod"
                :items="['CASH', 'BANK_TRANSFER', 'CREDIT_CARD']"
                label="Payment Method"
                variant="outlined"
                color="primary"
                density="comfortable"
                hide-details
              ></v-select>
            </v-col>
            <!-- Financial Account (Safe) is only shown if there is a paid amount -->
            <v-col cols="12" v-if="paymentAmount > 0">
              <v-select
                v-model="accountId"
                :items="arrangedAccounts"
                item-title="name"
                item-value="id"
                item-disabled="isDisabled"
                label="From which safe/bank was the payment made? *"
                variant="outlined"
                color="primary"
                density="comfortable"
                hide-details
                :rules="[v => !!v || 'You must select the financial account for the payment']"
              >
                  <template v-slot:item="{ props, item }">
                     <v-list-item v-bind="props" :title="item.raw.name" :subtitle="Number(item.raw.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺'">
                       <template v-slot:prepend>
                          <div :style="{ width: (item.raw.level * 16) + 'px' }"></div>
                          <v-icon v-if="item.raw.level > 0" icon="mdi-subdirectory-arrow-left" size="small" color="grey" class="ml-1"></v-icon>
                          <v-icon icon="mdi-safe" size="small" color="primary" class="ml-2"></v-icon>
                       </template>
                     </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                      <v-icon icon="mdi-safe" size="small" class="text-primary ml-2"></v-icon>
                      {{ item.title }}
                  </template>
              </v-select>
            </v-col>
          </v-row>
          <div v-if="paymentAmount > 0" class="text-caption text-success mt-2 font-weight-bold">
            <v-icon icon="mdi-information-outline" size="small"></v-icon>
            The system will automatically record the invoice and the paid amount together to save your time!
          </div>

        </v-card-text>
        
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-4 d-flex justify-end pr-6">
          <v-btn color="grey-darken-2" variant="text" class="font-weight-bold rounded-lg mr-2" @click="closeApproveDialog">Cancel</v-btn>
          <v-btn color="success" variant="flat" class="font-weight-black text-none rounded-lg px-6" :loading="approving" @click="executeApproveInvoice">Yes, Approve Invoice</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal View Invoice -->
    <InvoiceViewer ref="invoiceViewerRef" />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import SmartDataTable from '@/components/shared/SmartDataTable.vue'
import InvoiceViewer from '@/components/purchases/InvoiceViewer.vue'

const dataTableRef = ref(null)
const invoiceViewerRef = ref(null)

// Smart approval window state
const showApproveDialog = ref(false)
const invoiceToApprove = ref(null)
const approving = ref(false)
const paymentAmount = ref(0)
const paymentMethod = ref('CASH')
const accountId = ref(null)
const accounts = ref([])

onMounted(() => {
  fetchAccounts()
})

const fetchAccounts = async () => {
  try {
    const res = await $fetch('/api/accounts?type=ASSET')
    accounts.value = res.items || res
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

const arrangedAccounts = computed(() => {
  const map = {}
  const roots = []
  
  const clonedAccounts = JSON.parse(JSON.stringify(accounts.value))

  clonedAccounts.forEach(acc => {
    map[acc.id] = acc
    acc.children = []
    acc.level = 0
  })

  clonedAccounts.forEach(acc => {
    if (acc.parent_id && map[acc.parent_id]) {
      acc.level = map[acc.parent_id].level + 1
      map[acc.parent_id].children.push(acc)
    } else {
      roots.push(acc)
    }
  })

  const flattened = []
  const flatten = (nodes) => {
    nodes.forEach(node => {
      node.isDisabled = node.children.length > 0
      flattened.push(node)
      if (node.children.length > 0) {
        flatten(node.children)
      }
    })
  }

  flatten(roots)
  return flattened
})

const headers = [
  { title: 'Invoice & Date', key: 'invoice_info', align: 'start', sortable: false },
  { title: 'Supplier & Warehouse', key: 'entities', align: 'start', sortable: false },
  { title: 'Cost Details', key: 'financials', align: 'end', sortable: false },
  { title: 'Total (Gross)', key: 'total_amount', align: 'end', sortable: false },
  { title: 'Status & Inventory', key: 'status', align: 'center', sortable: false },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]

// --- Actions ---

const openInvoiceViewer = (invoiceId) => {
  if (invoiceViewerRef.value) {
    invoiceViewerRef.value.open(invoiceId)
  }
}

const confirmApprove = (invoice) => {
  invoiceToApprove.value = invoice
  paymentAmount.value = 0 // Force reset each time
  paymentMethod.value = 'CASH'
  accountId.value = null
  showApproveDialog.value = true
}

const closeApproveDialog = () => {
  showApproveDialog.value = false
  invoiceToApprove.value = null
  paymentAmount.value = 0
  accountId.value = null
}

const executeApproveInvoice = async () => {
  if (!invoiceToApprove.value) return
  approving.value = true
  
  try {
    const res = await $fetch('/api/purchases/{invoiceToApprove.value.id}/approve', {
      method: 'POST',
      body: {
        payment_amount: paymentAmount.value,
        payment_method: paymentMethod.value,
        account_id: accountId.value
      }
    })
    
    closeApproveDialog()
    if (dataTableRef.value) dataTableRef.value.refresh()
  } catch (error) {
    console.error("Error in approval:", error)
    alert(error.data?.message || 'An unexpected error occurred during approval. Please try again later.')
  } finally {
    approving.value = false
  }
}
</script>

<style scoped>
.gap-1 { gap: 4px; }
</style>`
  },
  {
    path: 'package.json',
    name: 'package.json',
    language: 'json',
    code: `{
  "name": "Looplanfy-Finance",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "@mdi/font": "^7.4.47",
    "@nuxtjs/supabase": "^2.0.4",
    "nuxt": "^4.3.1",
    "vite-plugin-vuetify": "^2.1.3",
    "vue": "^3.5.28",
    "vue-router": "^4.6.4",
    "vuetify": "^3.12.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "sass": "^1.97.3"
  }
}`
  },
  {
    path: 'server/api/purchases/index.get.ts',
    name: 'index.get.ts',
    language: 'ts',
    code: `import { serverSupabaseServiceRole } from '#supabase/server'
import { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
    const supabase = serverSupabaseServiceRole<Database>(event)
    const query = getQuery(event)

    const page = parseInt(query.page as string) || 1
    const itemsPerPage = parseInt(query.itemsPerPage as string) || parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const status_filter = query.status as string || 'all'

    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage - 1

    let dbQuery = supabase
        .from('purchase_invoices')
        .select('
            *,
            supplier:suppliers(name),
            warehouse:warehouses(name)
        ', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (search) {
        dbQuery = dbQuery.or('invoice_number.ilike.%{search}%')
    }

    if (status_filter !== 'all') {
        dbQuery = dbQuery.eq('status', status_filter.toUpperCase())
    }

    const { data, count, error } = await dbQuery.range(start, end)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    // Format data to facilitate rendering on the frontend DataTable
    const formattedData = data.map((invoice: any) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        status: invoice.status,
        total_gross_amount: invoice.total_gross_amount,
        total_net_amount: invoice.total_net_amount,
        total_vat_amount: invoice.total_vat_amount,
        supplier_name: invoice.supplier ? invoice.supplier.name : 'Deleted Supplier',
        warehouse_name: invoice.warehouse ? invoice.warehouse.name : 'Deleted Warehouse',
        created_at: invoice.created_at
    }))

    return {
        items: formattedData,
        totalItems: count || 0
    }
})`
  },
  {
    path: 'server/api/purchases/import.post.ts',
    name: 'import.post.ts',
    language: 'ts',
    code: `import { serverSupabaseServiceRole } from '#supabase/server'
// Using the mjs version of xlsx for better ESM compatibility
import * as XLSX from 'xlsx/xlsx.mjs'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const filePart = formData.find(p => p.name === 'file')
  const platformPart = formData.find(p => p.name === 'platform')
  const fulfillmentPart = formData.find(p => p.name === 'fulfillment_channel')
  const accountIdPart = formData.find(p => p.name === 'account_id')
  const revenueAccountIdPart = formData.find(p => p.name === 'revenue_account_id')
  const feesAccountIdPart = formData.find(p => p.name === 'fees_account_id')
  const overheadAccountIdPart = formData.find(p => p.name === 'overhead_account_id')
  const cogsAccountIdPart = formData.find(p => p.name === 'cogs_account_id')
  const inventoryAccountIdPart = formData.find(p => p.name === 'inventory_account_id')

  if (!filePart || !platformPart) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file or platform selection' })
  }

  const platform = platformPart.data.toString()
  const fallbackFulfillment = fulfillmentPart ? fulfillmentPart.data.toString() : 'MFN'
  const accountId = accountIdPart ? accountIdPart.data.toString() : null
  const revenueAccountId = revenueAccountIdPart ? revenueAccountIdPart.data.toString() : null
  const feesAccountId = feesAccountIdPart ? feesAccountIdPart.data.toString() : null
  const overheadAccountId = overheadAccountIdPart ? overheadAccountIdPart.data.toString() : null
  const cogsAccountId = cogsAccountIdPart ? cogsAccountIdPart.data.toString() : null
  const inventoryAccountId = inventoryAccountIdPart ? inventoryAccountIdPart.data.toString() : null
  let rows: any[] = []
  try {
    let workbook: XLSX.WorkBook;
    if (filePart.filename?.toLowerCase().endsWith('.csv')) {
      let text = filePart.data.toString('utf-8')
      text = text.trimStart()
      workbook = XLSX.read(text, { type: 'string', raw: true })
    } else {
      workbook = XLSX.read(filePart.data, { type: 'buffer' })
    }

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) throw new Error('Sheet not found');
    
    // Smart solution: some platforms place table headers in the second or third row (while the first row is the report title).
    // We will read the sheet as an array searching for the true row that carries the known table headers!
    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    
    let headerRowIndex = 0;
    for(let i = 0; i < Math.min(15, rawRows.length); i++) {
        if (!rawRows[i] || !Array.isArray(rawRows[i])) continue;
        const rowValues = rawRows[i].map(v => String(v).trim().toLowerCase());
        // Keywords indicating header row
        if (rowValues.includes('barkod') || rowValues.includes('paket no') || 
            rowValues.includes('sipariş no') || rowValues.includes('sipariş numarası') || 
            rowValues.includes('amazon order id') || rowValues.includes('order-id')) {
            headerRowIndex = i;
            break;
        }
    }

    // Now we instruct the library to convert Excel to JSON starting true reading strictly from the row we discovered!
    rows = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '' })

  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: 'An error occurred while reading file structure' })
  }

  if (!rows || rows.length === 0) {
     throw createError({ statusCode: 400, statusMessage: 'File is empty or headers are not supported' })
  }

  // Create Batch Record
  const { data: batchData, error: batchError } = await (supabase as any)
    .from('sales_import_batches')
    .insert({
      file_name: filePart.filename || 'Uploaded File',
      marketplace: platform,
      fulfillment_channel: fallbackFulfillment
    })
    .select('id')
    .single()

  if (batchError || !batchData) {
    console.error('Batch Creation Error:', batchError)
    throw createError({ statusCode: 500, statusMessage: 'Failed to initialize import batch in database' })
  }
  
  const batchId = batchData.id

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  // Note: map functions are auto-imported from server/utils
  for (const row of rows) {
    try {
      let normalized: any
      if (platform === 'Amazon') normalized = mapAmazonSale(row, fallbackFulfillment)
      else if (platform === 'Trendyol') normalized = mapTrendyolSale(row, fallbackFulfillment)
      else if (platform === 'Hepsiburada') normalized = mapHepsiburadaSale(row, fallbackFulfillment)
      else throw new Error('Unknown platform')

      // Call the RPC function for atomic processing
      // We don't use <Database> here to avoid lint errors with newly created RPCs
      const { data, error } = await (supabase as any).rpc('process_platform_sale', {
        p_order_id: normalized.order_id,
        p_sku: normalized.sku,
        p_qty: normalized.quantity,
        p_price_gross: normalized.unit_price_gross,
        p_order_date: normalized.order_date,
        p_marketplace: normalized.marketplace,
        p_fulfillment_channel: normalized.fulfillment_channel,
        p_buyer_name: normalized.buyer_name || '',
        p_raw_data: normalized.raw_data,
        p_batch_id: batchId,
        p_marketplace_account_id: accountId,
        p_revenue_account_id: revenueAccountId,
        p_fees_account_id: feesAccountId,
        p_overhead_account_id: overheadAccountId,
        p_cogs_account_id: cogsAccountId,
        p_inventory_account_id: inventoryAccountId
      })

      if (error) {
        console.error('Import Row Error:', error)
        errors.push('Order {normalized.order_id}: {error.message}')
        errorCount++
      } else {
        successCount++
      }
    } catch (err: any) {
      console.error('Mapping/Processing Error:', err)
      errors.push('Row processing failed: {err.message}')
      errorCount++
    }
  }

  return {
    success: true,
    message: 'Batch complete: {successCount} imported, {errorCount} failed.',
    successCount,
    errorCount,
    errors,
    batchId
  }
})`
  }
];
