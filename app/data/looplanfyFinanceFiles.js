export const looplanfyFinanceFiles = [
  {
    path: 'components/blocks/all-products-category/SimpleAllProductsByCategory.vue',
    name: 'SimpleAllProductsByCategory.vue',
    language: 'vue',
    code: `<template>
  <section class="all-products-category pt-6 pb-12">
    <v-container>
      <!-- Figma Styled Header -->
      <div v-if="category" class="mb-14 text-center fade-in">
        <span class="text-overline font-weight-bold text-grey mb-1 d-block letter-spacing-2">{{ $t('common.collection') || 'Collection' }}</span>
        <h2 class="text-h4 font-weight-light section-title-figma pb-3 d-inline-block position-relative">
          {{ getLocalized(category, 'name') }}
          <div class="title-underline" :style="{ backgroundColor: brandColor }"></div>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center py-16">
        <div class="elegant-loader" :style="{ '--brand': brandColor }"></div>
      </div>

      <!-- Products Grid -->
      <v-row v-else-if="products.length" class="px-2">
        <v-col 
          v-for="(product, index) in products" 
          :key="product.id" 
          cols="12" sm="6" md="4" lg="3"
          class="pa-2 stagger-item d-flex"
          :style="{ '--delay': (index * 0.1) + 's' }"
        >
          <div class="product-card-premium bg-white overflow-hidden h-100 d-flex flex-column w-100" @click="goToProduct(product.id)">
            <!-- Image Area -->
            <div class="image-wrapper-premium-simple-style position-relative">
              <!-- Price Badge Floating -->
              <div class="price-badge-floating" :style="{ color: brandColor }">
                {{ product.price }} <span class="text-caption ms-1">{{ tenantStore.tenant?.settings?.currency }}</span>
              </div>
              <v-img
                :src="getOptimizedUrl(product.image_url, 400)"
                aspect-ratio="1"
                contain
                max-height="240"
                class="product-image-premium"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                    <v-progress-circular indeterminate color="grey-lighten-4" size="24"></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </div>

            <!-- Content Section -->
            <div class="pa-5 flex-grow-1 d-flex flex-column position-relative">
              <!-- Product Name -->
              <h4 class="name-premium font-weight-black text-grey-darken-4 mb-2">
                {{ getLocalized(product, 'name') }}
              </h4>
              
              <!-- Actions Row -->
              <div class="mt-auto pt-4 border-t border-opacity-10 d-flex justify-center">
                <div class="action-wrapper w-100">
                  <!-- Smart Stepper for Simple Products (In Grid) -->
                  <div v-if="getCartItemForGrid(product)" class="d-flex justify-center">
                     <div class="custom-stepper-premium" :class="{ 'is-updating': updatingQuantity && cartLoading === product.id }">
                        <v-btn icon="mdi-plus" variant="text" size="x-small" class="stepper-btn-premium" @click.stop="updateCartQuantityInGrid(product, 1)" :disabled="updatingQuantity"></v-btn>
                        
                        <div class="qty-display-premium">
                          <transition name="fade" mode="out-in">
                            <v-progress-circular v-if="updatingQuantity && cartLoading === product.id" indeterminate size="14" width="2" :color="brandColor"></v-progress-circular>
                            <span v-else class="qty-circle-premium font-weight-black" :style="{ color: brandColor }">{{ getCartItemForGrid(product).quantity }}</span>
                          </transition>
                        </div>

                        <v-btn icon="mdi-minus" variant="text" size="x-small" class="stepper-btn-premium" @click.stop="updateCartQuantityInGrid(product, -1)" :disabled="updatingQuantity"></v-btn>
                     </div>
                  </div>
                  
                  <v-btn
                    v-else
                    block
                    :color="brandColor"
                    variant="flat"
                    class="add-btn-premium"
                    rounded="xl"
                    elevation="0"
                    @click.stop="handleAddToCartClick(product)"
                    :loading="fetchingOptionsId === product.id || cartLoading === product.id"
                  >
                    <v-icon start size="small">mdi-cart-plus</v-icon>
                    {{ $t('common.add_to_cart') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Empty State: Premium Redesign -->
      <div v-else class="empty-category-premium py-16 px-4 fade-in">
        <div class="empty-content-wrapper position-relative mx-auto">
          <!-- Decorative Background Blob -->
          <div class="empty-blob" :style="{ backgroundColor: brandColor + '10' }"></div>
          
          <div class="empty-content text-center position-relative">
            <div class="empty-icon-box mb-8">
              <v-icon size="120" :color="brandColor" class="empty-icon-main">mdi-package-variant-closed</v-icon>
              <div class="icon-pulse" :style="{ backgroundColor: brandColor }"></div>
            </div>
            
            <h2 class="empty-title text-h4 font-weight-black mb-4">
              {{ $t('common.no_products_found') }}
            </h2>
            
            <p class="empty-subtitle text-body-1 text-grey-darken-1 mb-10 mx-auto" style="max-width: 500px; line-height: 1.6;">
              {{ category ? getLocalized(category, 'description') : '' }}
            </p>
            
            <v-btn
              to="/"
              size="x-large"
              height="60"
              rounded="xl"
              elevation="8"
              :color="brandColor"
              class="back-home-btn px-12 text-white font-weight-bold"
            >
              <v-icon start class="me-2">mdi-home-outline</v-icon>
              {{ $t('common.home') }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-12 fade-in pb-10">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          rounded="lg"
          variant="flat"
          :active-color="brandColor"
          density="comfortable"
          class="custom-pagination"
          
        ></v-pagination>
      </div>
    </v-container>

    <!-- Quick Selection Dialog -->
    <v-dialog v-model="selectionDialog" max-width="850" rounded="16" scrollable transition="dialog-bottom-transition">
      <v-card v-if="selectedProduct" class="selection-card-premium position-relative d-flex flex-column" style="max-height: 90vh;">
        <v-btn icon="mdi-close" variant="text" size="small" class="close-btn-pos" @click="selectionDialog = false"></v-btn>

        <v-card-text class="pa-6 pa-md-12 overflow-y-auto">
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-start justify-center">
              <div class="dialog-image-wrapper">
                <v-img 
                  :src="getOptimizedUrl(currentVariant?.image_url || selectedProduct.image_url, 600)" 
                  contain
                  max-height="380"
                  class="dialog-main-image mobile-img-height"
                ></v-img>
              </div>
            </v-col>

            <v-col cols="12" md="8" class="text-right d-flex flex-column">
              <h2 class="text-h4 font-weight-light section-title-figma pb-3 d-inline-block position-relative">{{ getLocalized(selectedProduct, 'name') }}</h2>
              <div class="text-body-2 text-grey-darken-1 mb-4 line-height-relaxed description-scroll" v-html="getLocalized(selectedProduct, 'description')">
              </div>
              <div class="text-h4 font-weight-black mb-6 text-center" :style="{ color: brandColor }">
                {{ currentVariant?.price || selectedProduct.price }} {{ tenantStore.tenant?.settings?.currency }}
              </div>
            </v-col>

            <v-col cols="12">
              <v-row>
                <v-col cols="12" md="6" v-if="productOptions.length > 0">
                  <div class="options-section">
                    <div v-for="option in productOptions" :key="option.id" class="option-group">
                      <label class="option-label">
                        <span :style="{ background: brandColor }" class="label-dot mr-2"></span>
                        {{ option.translations?.[locale]?.name || option.name }}
                      </label>
                      <div class="option-values">
                        <button
                          v-for="(val, idx) in option.values"
                          :key="val"
                          @click="selectedOptions[option.name] = val"
                          class="option-btn"
                          :class="{ 'option-btn-active': selectedOptions[option.name] === val }"
                        >
                          {{ option.translations?.[locale]?.values?.[idx] || val }}
                        </button>
                      </div>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" :md="productOptions.length > 0 ? 6 : 12" v-if="selectedProduct.attributes && Object.keys(selectedProduct.attributes).length > 0">
                  <div class="attributes-grid">
                    <div v-for="(value, key) in selectedProduct.attributes" :key="key" v-show="value && key !== 'shippen_in_day'" class="attribute-pill">
                      <span class="attr-key">
                        <v-icon size="medium" class="mr-1" :color="brandColor">{{ getAttributeIcon(key) }}</v-icon>
                        {{ getAttributeLabel(key) }}
                      </span>
                      <span class="attr-val">{{ value }}</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <div v-if="existingCartItem" class="mt-6 d-flex justify-center">
             <div class="custom-stepper" :class="{ 'is-updating': updatingQuantity }">
                <v-btn icon="mdi-plus" variant="text" size="x-small" class="stepper-btn" @click="updateCartQuantity(1)" :disabled="updatingQuantity || !isStockAvailable"></v-btn>
                <div class="qty-display">
                  <transition name="fade" mode="out-in">
                    <v-progress-circular v-if="updatingQuantity" indeterminate size="16" width="2" :color="brandColor"></v-progress-circular>
                    <span v-else class="qty-circle" :style="{ background: brandColor }">{{ existingCartItem.quantity }}</span>
                  </transition>
                </div>
                <v-btn icon="mdi-minus" variant="text" size="x-small" class="stepper-btn" @click="updateCartQuantity(-1)" :disabled="updatingQuantity"></v-btn>
             </div>
          </div>
          <v-btn
            v-else
            block
            :color="brandColor"
            class="text-white font-weight-bold rounded-lg mt-6 figma-add-btn shadow-sm"
            elevation="0"
            @click="confirmAddToCart"
            :loading="cartLoading === selectedProduct.id"
            :disabled="!isStockAvailable"
          >
            {{ isStockAvailable ? $t('common.add_to_cart') : 'نفدت الكمية' }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup>
const props = defineProps({
  categoryId: String // Option to pass ID directly
})

const client = useSupabaseClient()
const tenantStore = useTenantStore()
const cartStore = useCartStore()
const route = useRoute()
const { getLocalized: getLocHelper } = useLocalized()
const { t, locale } = useI18n()
const { success: showSuccess, error: showError } = useSnackbar()
const img = useImage()

const getOptimizedUrl = (url, width = 400) => {
  if (!url || url.includes('placeholder.com')) return url
  return img(url, { width, quality: 75, format: 'webp' })
}

const loading = ref(true)
const products = ref([])
const category = ref(null)
const cartLoading = ref(null)
const fetchingOptionsId = ref(null)

// Pagination State
const page = ref(1)
const itemsPerPage = ref(24)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const selectionDialog = ref(false)
const selectedProduct = ref(null)
const productOptions = ref([])
const productVariants = ref([])
const selectedOptions = ref({})
const attributeDefinitions = ref({})

const brandColor = computed(() => tenantStore.tenant?.settings?.brand_color)
const getLocalized = (item, field) => getLocHelper(item, field)

// Resolve Category ID from props or URL slug
const resolveCategoryId = async () => {
  if (props.categoryId) return props.categoryId
  
  // URL structure is /category/mens-shoes
  const slug = Array.isArray(route.params.slug) ? route.params.slug[1] : null
  if (!slug) return null

  // If it's a UUID, return it
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(slug)) return slug

  // Otherwise, fetch ID by slug
  const { data } = await client
    .from('categories')
    .select('id')
    .eq('project_id', tenantStore.tenant.id)
    .eq('is_active', true)
    .eq('slug', slug)
    .single()
  
  return data?.id || null
}

const fetchAllData = async () => {
  loading.value = true
  try {
    const catId = await resolveCategoryId()
    if (!catId) {
        loading.value = false
        return
    }

    // 1. Fetch Category Details
    const { data: catData } = await client.from('categories').select('*').eq('id', catId).eq('is_active', true).single()
    if (catData) category.value = catData

    // 2. Fetch Total Count for pagination (excluding out-of-stock simple products)
    const { count } = await client
      .from('items')
      .select('id, item_categories!inner(category_id)', { count: 'exact', head: true })
      .eq('item_categories.category_id', catId)
      .eq('is_active', true)
      .or('stock_quantity.is.null,stock_quantity.gt.0')
    
    totalItems.value = count || 0
    console.log('Category Products Count:', { catId, totalItems: totalItems.value, totalPages: totalPages.value })

    // 3. Fetch Products for current page
    const from = (page.value - 1) * itemsPerPage.value
    const to = from + itemsPerPage.value - 1

    const { data: prods } = await client
      .from('items')
      .select('*, item_categories!inner(category_id)')
      .eq('item_categories.category_id', catId)
      .eq('is_active', true)
      .or('stock_quantity.is.null,stock_quantity.gt.0')
      .order('created_at', { ascending: false })
      .range(from, to)
    
    products.value = prods || []
  } catch (err) {
    console.error('Error fetching category products:', err)
  } finally {
    loading.value = false
  }
}

watch(page, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchAllData()
})

const handleAddToCartClick = async (product) => {
  fetchingOptionsId.value = product.id
  try {
    const [optsRes, varsRes] = await Promise.all([
      client.from('item_options').select('*').eq('item_id', product.id).order('position'),
      client.from('item_variants').select('*').eq('item_id', product.id).eq('is_active', true)
    ])
    const opts = optsRes.data || []
    const vars = varsRes.data || []

    if (product.attributes && Object.keys(product.attributes).length > 0) {
      const keys = Object.keys(product.attributes)
      const { data: defs } = await client.from('attribute_definitions').select('*').in('key', keys)
      if (defs) {
        attributeDefinitions.value = defs.reduce((acc, def) => { acc[def.key] = def; return acc }, {})
      }
    }

    if (opts.length > 0 && vars.length > 0) {
      selectedProduct.value = product
      productOptions.value = opts
      productVariants.value = vars
      selectedOptions.value = {}
      opts.forEach(opt => { if (opt.values.length > 0) selectedOptions.value[opt.name] = opt.values[0] })
      selectionDialog.value = true
    } else {
      addToCart(product)
    }
  } finally {
    fetchingOptionsId.value = null
  }
}

const currentVariant = computed(() => {
  if (!productVariants.value.length) return null
  return productVariants.value.find(v => {
    return Object.entries(v.options).every(([key, val]) => selectedOptions.value[key] === val)
  })
})

const isStockAvailable = computed(() => {
  if (productVariants.value.length > 0) {
    if (!currentVariant.value) return false
    return currentVariant.value.stock_quantity === null || currentVariant.value.stock_quantity > 0
  }
  return selectedProduct.value?.stock_quantity === null || (selectedProduct.value?.stock_quantity || 0) > 0
})

const confirmAddToCart = () => {
  if (!selectedProduct.value) return
  addToCart(selectedProduct.value, currentVariant.value)
  selectionDialog.value = false
}

const getAttributeLabel = (key) => {
  const def = attributeDefinitions.value[key]
  if (!def) return key
  return def.translations?.[locale.value]?.label || def.label || key
}

const getAttributeIcon = (key) => attributeDefinitions.value[key]?.icon

const addToCart = async (product, variant = null) => {
  cartLoading.value = product.id
  try {
    const locOpts = variant ? getLocalizedOptions() : {}
    const itemToAdd = {
      ...product,
      price: variant?.price || product.price,
      variant_id: variant?.id,
      selected_options: variant ? { ...locOpts } : null,
      image_url: variant?.image_url || product.image_url
    }
    await cartStore.addItem(itemToAdd, 1, variant ? locOpts : null)
    showSuccess(t('common.added_to_cart'))
  } catch (err) {
    if (err?.type === 'STOCK_LIMIT') {
      showError('{t('common.stock_limit_reached') || 'Stock limit reached'}: {err.remaining} items remaining)
    } else {
      console.error('[AllProductsByCategory] Add to cart error:', err)
    }
  } finally {
    cartLoading.value = null
  }
}

const goToProduct = (id) => navigateTo('/product/{id}')

// Smart Cart Logic
const isAttributesEqual = (a, b) => {
    const aKeys = Object.keys(a || {}).sort()
    const bKeys = Object.keys(b || {}).sort()
    if (aKeys.length !== bKeys.length) return false
    return aKeys.every(key => JSON.stringify(a[key]) === JSON.stringify(b[key]))
}

const getLocalizedOptions = () => {
  const locOpts = {}
  if (!selectedProduct.value) return locOpts
  for (const [key, val] of Object.entries(selectedOptions.value)) {
    const optDef = productOptions.value.find(o => o.name === key)
    if (optDef) {
      const locKey = optDef.translations?.[locale.value]?.name || key
      const valIdx = optDef.values.indexOf(val)
      const locVal = (valIdx !== -1 && optDef.translations?.[locale.value]?.values?.[valIdx]) 
        ? optDef.translations[locale.value].values[valIdx] 
        : val
      locOpts[locKey] = locVal
    } else {
      locOpts[key] = val
    }
  }
  return locOpts
}

const existingCartItem = computed(() => {
  if (!selectedProduct.value) return null
  const localizedOpts = getLocalizedOptions()
  return cartStore.items.find(item => 
    item.id === selectedProduct.value.id &&
    item.variant_id === (currentVariant.value?.id || null) &&
    isAttributesEqual(item.selected_options || item.attributes, localizedOpts)
  )
})

const updatingQuantity = ref(false)
const updateCartQuantity = async (delta) => {
  if (!existingCartItem.value) return
  updatingQuantity.value = true
  try {
    const idToUpdate = existingCartItem.value.cart_item_id || existingCartItem.value.id
    if (existingCartItem.value.quantity + delta <= 0) {
        await cartStore.removeItem(idToUpdate)
    } else {
        await cartStore.updateQuantity(idToUpdate, delta)
    }
  } catch (err) {
    if (err?.type === 'STOCK_LIMIT') {
      showError(t('common.stock_limit_reached', { name: err.name, count: err.available }))
    } else {
      console.error('[AllProductsByCategory] Update quantity error:', err)
    }
  } finally {
    updatingQuantity.value = false
  }
}

const getCartItemForGrid = (product) => {
  return cartStore.items.find(item => item.id === product.id && !item.variant_id)
}

const updateCartQuantityInGrid = async (product, delta) => {
  const item = getCartItemForGrid(product)
  if (!item) return
  updatingQuantity.value = true
  cartLoading.value = product.id
  try {
    const idToUpdate = item.cart_item_id || item.id
    if (item.quantity + delta <= 0) {
        await cartStore.removeItem(idToUpdate)
    } else {
        await cartStore.updateQuantity(idToUpdate, delta)
    }
  } catch (err) {
    if (err?.type === 'STOCK_LIMIT') {
      showError(t('common.stock_limit_reached', { name: err.name, count: err.available }))
    } else {
      console.error('[AllProductsByCategory] Grid update quantity error:', err)
    }
  } finally {
    updatingQuantity.value = false
    cartLoading.value = null
  }
}

onMounted(fetchAllData)
watch(() => route.params.slug, () => {
  page.value = 1
  fetchAllData()
})
</script>

<style scoped>
.all-products-category { background-color: #f2f2f5 ; }
.section-title-figma { color: #1a1a1a; position: relative; font-weight: 400 !important; }
.title-underline { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; border-radius: 2px; }

.product-card-premium {
  background: #ffffff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(0,0,0,0.03);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.product-card-premium:hover { 
  transform: translateY(-6px); 
  box-shadow: 0 20px 40px rgba(0,0,0,0.08); 
  border-color: rgba(0,0,0,0.08);
}

.image-wrapper-premium-simple-style {
  /* background: #f8f9fa; */
  border-radius: 16px;
  margin: 12px 12px 0 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 16px; */
  position: relative;
}
.product-image-premium {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  mix-blend-mode: multiply;
}
.product-card-premium:hover .product-image-premium {
  transform: scale(1.08);
}

.price-badge-floating {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: 6px 14px;
  border-radius: 30px;
  font-weight: 900;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
}

.price-value { font-size: 1.3rem; letter-spacing: -0.5px; }
.currency-label { font-size: 0.75rem !important; opacity: 0.8; }

.name-premium {
  font-size: 20px !important;
  font-weight: 400 !important;
  color: #1a1a1a !important;
  line-height: 1.2;
  margin-bottom: 8px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.add-btn-premium { 
  text-transform: none; 
  font-weight: 800; 
  letter-spacing: 0.2px;
  height: 40px !important;
  transition: all 0.3s ease;
}
.add-btn-premium:hover {
  transform: scale(1.05);
}

.custom-stepper-premium {
  display: inline-flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 30px;
  padding: 4px;
  border: 1px solid rgba(0,0,0,0.05);
}
.stepper-btn-premium {
  color: #4a5568 !important;
}
.qty-display-premium {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-circle-premium {
  font-size: 15px;
}

/* Quick View Premium Styles */
.selection-card-premium { background: #ffffff; border-radius: 16px !important; }
.close-btn-pos { position: absolute; top: 15px; right: 15px; z-index: 10; color: #666; }
.dialog-image-wrapper { width: 100%; border: 1px solid #f0f0f0; border-radius: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.options-section { margin-bottom: 24px; }
.option-group { margin-bottom: 20px; }
.option-label { font-size: 0.85rem; font-weight: 700; color: #4a5568; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; }
.label-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-left: 8px; }
.option-values { display: flex; flex-wrap: wrap; gap: 10px; }
.option-btn { padding: 10px 20px; border: 1px solid #edf2f7; border-radius: 8px; background: #f8fafc; color: #2d3748; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.option-btn:hover { background: white; border-color: var(--brand-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.option-btn-active { background: var(--brand-color) !important; color: white !important; border-color: var(--brand-color) !important; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

.attributes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
.attribute-pill { background: #f8f9fa; border-left: 3px solid var(--brand-color); border-radius: 4px; padding: 10px 14px; display: flex; flex-direction: column; text-align: right; }
.attr-key { font-size: 0.75rem; color: #6c757d; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; display: flex; align-items: center; }
.attr-val { font-size: 0.95rem; font-weight: 500; color: #212529; }

.figma-add-btn { height: 48px !important; }

/* Stepper */
.custom-stepper { display: inline-flex; align-items: center; background: #f2f2f5; border-radius: 12px; padding: 4px; }
.qty-display { width: 48px; height: 32px; display: flex; align-items: center; justify-content: center; }
.qty-circle { color: white; min-width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; margin: 0 8px; font-size: 14px; }
.stepper-btn { color: #1a1a1a !important; }

.elegant-loader { width: 40px; height: 40px; border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--brand); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.stagger-item { opacity: 0; animation: fadeInUp 0.6s ease forwards; animation-delay: var(--delay); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Brand-Infused Pagination Styling */
.custom-pagination :deep(.v-btn) {
  background-color: white !important;
  color: v-bind(brandColor) !important; /* Brand color for all numbers/icons */
  border: 1px solid #eee !important;
  border-radius: 12px !important;
  /* font-weight: 700 !important; */
}

.custom-pagination :deep(.v-btn:hover) {
    transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
}

.custom-pagination :deep(.v-btn.v-btn--active),
.custom-pagination :deep(.v-pagination__item--active .v-btn) {
  background-color: v-bind(brandColor) !important;
  color: white !important;
  border-color: v-bind(brandColor) !important;
}

/* Premium Empty State Styles */
.empty-category-premium {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content-wrapper {
  width: 100%;
  max-width: 600px;
}

.empty-blob {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  filter: blur(45px);
  animation: blob-animate 12s infinite alternate;
  z-index: 0;
}

@keyframes blob-animate {
  0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
}

.empty-icon-box {
  position: relative;
  display: inline-block;
}

.empty-icon-main {
  z-index: 2;
  position: relative;
  animation: float 4s ease-in-out infinite;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.15;
  animation: pulse 2.5s infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}

.back-home-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
}

.back-home-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px v-bind(brandColor + '40') !important;
}

.empty-title {
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

@media (max-width: 600px) { .mobile-img-height { max-height: 250px !important; } }
</style>



`
  },
  //   {
  //     path: 'components/SmartDataTable.vue',
  //     name: 'SmartDataTable.vue',
  //     language: 'vue',
  //     code: `<template>
  //   <v-card elevation="2" class="rounded-lg">
  //     <v-card-title class="pa-4 border-b bg-white">
  //       <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4">

  //         <div class="d-flex align-center">
  //           <v-icon :icon="icon" color="primary" class="mr-3"></v-icon>
  //           <span class="font-weight-bold text-h6 text-grey-darken-3">{{ title }}</span>
  //         </div>

  //         <div class="d-flex flex-column flex-sm-row gap-3">
  //           <!-- فلتر مخصص (إن وجد) -->
  //           <v-select
  //             v-if="showFilter"
  //             v-model="activeFilter"
  //             :items="filterOptions"
  //             item-title="title"
  //             return-object
  //             density="compact"
  //             variant="outlined"
  //             hide-details
  //             rounded="lg"
  //             bg-color="grey-lighten-4"
  //             prepend-inner-icon="mdi-filter-variant"
  //             style="min-width: 150px;"
  //           ></v-select>

  //           <!-- شريط البحث السريع -->
  //           <v-text-field
  //             v-if="showSearch"
  //             v-model="searchQuery"
  //             density="compact"
  //             variant="outlined"
  //             :placeholder="searchPlaceholder"
  //             prepend-inner-icon="mdi-magnify"
  //             hide-details
  //             clearable
  //             rounded="lg"
  //             bg-color="grey-lighten-4"
  //             style="min-width: 250px;"
  //           ></v-text-field>

  //           <!-- مكان لإضافة أزرار مخصصة علوية (مثل زر الإضافة) -->
  //           <slot name="top-actions"></slot>
  //         </div>

  //       </div>
  //     </v-card-title>

  //     <v-data-table
  //       v-model="modelSelected"
  //       :show-select="showSelect"
  //       return-object
  //       :headers="headers"
  //       :items="items"
  //       :loading="loading"
  //       :items-per-page="itemsPerPage"
  //       hover
  //       class="elevation-0 smart-table"
  //     >
  //       <!-- تمرير كل الـ slots القادمة من الأب إلى الـ v-data-table الداخلي -->
  //       <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
  //         <slot :name="name" v-bind="slotData || {}" />
  //       </template>

  //       <!-- تخصيص رسالة "لا توجد بيانات" افتراضية -->
  //       <template v-slot:no-data>
  //         <div class="pa-6 text-center">
  //           <v-icon icon="mdi-database-search-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
  //           <div class="text-h6 text-grey-darken-1">لم يتم العثور على أية سجلات.</div>
  //           <slot name="no-data-action"></slot>
  //         </div>
  //       </template>

  //       <!-- وحدة التحكم السفلية (Pagination) -->
  //       <template v-slot:bottom>
  //         <div class="d-flex align-center justify-space-between pa-4 border-t bg-grey-lighten-5">
  //           <div class="d-flex align-center gap-4">
  //              <span class="text-caption text-grey-darken-1 font-weight-bold d-none d-sm-inline">الصفوف في كل صفحة:</span>
  //              <v-select
  //                v-model="itemsPerPage"
  //                :items="[5, 10, 25, 50, 100]"
  //                density="compact"
  //                variant="outlined"
  //                hide-details
  //                rounded="lg"
  //                bg-color="white"
  //                style="width: 80px;"
  //              ></v-select>
  //           </div>

  //           <v-pagination
  //              v-model="page"
  //              :length="pageCount"
  //              active-color="primary"
  //              rounded="circle"
  //              density="comfortable"
  //              :total-visible="5"
  //           ></v-pagination>
  //         </div>
  //       </template>

  //     </v-data-table>
  //   </v-card>
  // </template>

  // <script setup>
  // import { ref, watch, onMounted, computed } from 'vue'

  // const props = defineProps({
  //   // محتوى وعنوان الجدول
  //   title: { type: String, default: 'قائمة البيانات' },
  //   icon: { type: String, default: 'mdi-table' },

  //   // إعدادات البيانات عبر الـ API
  //   endpoint: { type: String, required: true }, // رابط الـ API لجلب البيانات
  //   headers: { type: Array, required: true, default: () => [] },

  //   // إعدادات البحث
  //   showSearch: { type: Boolean, default: true },
  //   searchPlaceholder: { type: String, default: 'بحث السجلات...' },

  //   // إعدادات الفلتر
  //   showFilter: { type: Boolean, default: false },
  //   filterKey: { type: String, default: 'filter' },
  //   filterOptions: { type: Array, default: () => [] },

  //   // معلمات إضافية ديناميكية للبحث
  //   extraParams: { type: Object, default: () => ({}) },

  //   // مفتاح لحفظ حالة الفلتر ورقم الصفحة بالذاكرة المؤقتة
  //   stateKey: { type: String, default: '' },

  //   // خيارات التحديد المتعدد
  //   showSelect: { type: Boolean, default: false },
  //   selected: { type: Array, default: () => [] }
  // })

  // const emit = defineEmits(['update:selected'])

  // const modelSelected = computed({
  //   get: () => props.selected,
  //   set: (val) => emit('update:selected', val)
  // })

  // // المتغيرات المحلية 
  // const activeFilter = ref(props.filterOptions.length > 0 ? props.filterOptions[0] : null)
  // const searchQuery = ref('')
  // const itemsPerPage = ref(10)
  // const page = ref(1)

  // const items = ref([])
  // const totalItems = ref(0)
  // const summary = ref(null)
  // const loading = ref(true)

  // // حساب عدد الصفحات بناءً على البيانات القادمة من السيرفر
  // const pageCount = ref(1)

  // // دالة جلب البيانات من السيرفر مباشرة
  // const fetchData = async () => {
  //   loading.value = true
  //   try {
  //     const queryParams = {
  //       page: page.value,
  //       limit: itemsPerPage.value,
  //       itemsPerPage: itemsPerPage.value,
  //       search: searchQuery.value,
  //       ...props.extraParams
  //     }

  //     // Dynamic Filter injection
  //     if (activeFilter.value && activeFilter.value.value !== 'all') {
  //       const key = activeFilter.value.key || props.filterKey || 'filter'
  //       queryParams[key] = activeFilter.value.value
  //     }

  //     const data = await $fetch(props.endpoint, {
  //       query: queryParams
  //     })

  //     items.value = data.items
  //     totalItems.value = data.totalItems
  //     summary.value = data.summary
  //     pageCount.value = Math.ceil(data.totalItems / itemsPerPage.value) || 1
  //   } catch (error) {
  //     console.error("خطأ في جلب البيانات:", error)
  //     items.value = []
  //     totalItems.value = 0
  //   } finally {
  //     loading.value = false
  //   }
  // }

  // // كشف دالة التحديث للخارج لكي يستطيع الأب (مثل صفحة المستخدمين) إعادة تحميل الجدول بعد الإضافة أو التعديل
  // defineExpose({ refresh: fetchData, summary })

  // // دالة حفظ الحالة في الذاكرة المؤقتة
  // const saveState = () => {
  //   if (props.stateKey && typeof window !== 'undefined') {
  //     const state = {
  //       searchQuery: searchQuery.value,
  //       itemsPerPage: itemsPerPage.value,
  //       page: page.value,
  //       activeFilter: activeFilter.value ? { value: activeFilter.value.value, key: activeFilter.value.key } : null
  //     }
  //     sessionStorage.setItem(\`smart_table_\${props.stateKey}\`, JSON.stringify(state))
  //   }
  // }

  // let isRestoring = false

  // // المراقبة والتحديث عند تغيير أي قيمة، مع إعادة تصفير الصفحة عند البحث أو الفلترة
  // watch(searchQuery, () => {
  //   if (isRestoring) return
  //   page.value = 1
  //   saveState()
  //   fetchData()
  // })

  // watch(() => activeFilter.value, () => {
  //   if (isRestoring) return
  //   page.value = 1
  //   saveState()
  //   fetchData()
  // }, { deep: true })

  // watch(() => JSON.stringify(props.extraParams), (newVal, oldVal) => {
  //   if (isRestoring) return
  //   if (newVal === oldVal) return
  //   page.value = 1
  //   saveState()
  //   fetchData()
  // })

  // watch([itemsPerPage, page], () => {
  //   if (isRestoring) return
  //   if (page.value > Math.ceil(totalItems.value / itemsPerPage.value) && totalItems.value > 0) {
  //     page.value = 1
  //   }
  //   saveState()
  //   fetchData()
  // })

  // // جلب البيانات أول مرة عند تحميل المكون مع استرجاع الحالة
  // onMounted(() => {
  //   if (props.stateKey && typeof window !== 'undefined') {
  //     const saved = sessionStorage.getItem(\`smart_table_\${props.stateKey}\`)
  //     if (saved) {
  //       try {
  //         isRestoring = true
  //         const parsed = JSON.parse(saved)
  //         if (parsed.searchQuery !== undefined) searchQuery.value = parsed.searchQuery
  //         if (parsed.itemsPerPage !== undefined) itemsPerPage.value = parsed.itemsPerPage
  //         if (parsed.activeFilter !== undefined && parsed.activeFilter) {
  //           const found = props.filterOptions.find(opt => opt.value === parsed.activeFilter.value && opt.key === parsed.activeFilter.key)
  //           if (found) activeFilter.value = found
  //         }
  //         // استرجاع الصفحة في النهاية لكي لا تقوم بمراقبة التحديثات الأخرى بإرجاع الصفحة إلى 1
  //         if (parsed.page !== undefined) page.value = parsed.page
  //       } catch (e) {
  //         console.error('Failed to parse saved smart table state:', e)
  //       } finally {
  //         isRestoring = false
  //       }
  //     }
  //   }
  //   fetchData()
  // })
  // </script>

  // <style scoped>
  // .border-b {
  //   border-bottom: 1px solid rgba(0,0,0,0.05) !important;
  // }
  // .border-t {
  //   border-top: 1px solid rgba(0,0,0,0.05) !important;
  // }
  // .gap-3 {
  //   gap: 12px;
  // }
  // .gap-4 {
  //   gap: 16px;
  // }

  // /* تحسين شكل صفوف الجدول لجعلها أوسع قليلاً وتصميم راقي */
  // :deep(.v-data-table .v-data-table__tr:hover) {
  //   background-color: rgba(24, 103, 192, 0.03) !important;
  // }
  // :deep(.v-data-table > .v-table__wrapper > table > tbody > tr > td) {
  //   padding-top: 10px !important;
  //   padding-bottom: 10px !important;
  //   font-size: 0.95rem;
  // }
  // :deep(.v-data-table > .v-table__wrapper > table > thead > tr > th) {
  //   font-weight: 700 !important;
  //   color: #424242 !important;
  //   font-size: 0.85rem !important;
  //   text-transform: uppercase;
  //   letter-spacing: 0.5px;
  //   background-color: #fafafa !important;
  // }
  // </style>`
  //   },
  //   {
  //     path: 'components/ImageUploader.vue',
  //     name: 'ImageUploader.vue',
  //     language: 'vue',
  //     code: `<template>
  //   <div class="image-uploader-wrapper w-100" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
  //     <div v-if="label" class="text-subtitle-2 font-weight-bold mb-2 text-grey-darken-3">
  //       <v-icon icon="mdi-image-plus" size="small" class="mr-1"></v-icon>
  //       {{ label }}
  //     </div>
  //     <!-- حقل الرفع والإفلات -->
  //     <v-card 
  //       v-if="!currentImageUrl"
  //       variant="outlined" 
  //       class="upload-zone text-center rounded-lg pa-6 d-flex flex-column align-center justify-center position-relative cursor-pointer"
  //       :class="{ 'border-primary bg-primary-lighten-5': isDragging, 'border-error': error, 'border-dashed border-grey-lighten-1': !isDragging }"
  //       @dragover.prevent="isDragging = true"
  //       @dragleave.prevent="isDragging = false"
  //       @drop.prevent="handleDrop"
  //       @click="triggerFileInput"
  //       v-ripple
  //     >
  //        <input 
  //          type="file" 
  //          ref="fileInputRef" 
  //          class="d-none" 
  //          accept="image/png, image/jpeg, image/jpg, image/webp" 
  //          @change="handleFileSelect" 
  //        />

  //        <div v-if="loading" class="w-100 d-flex flex-column align-center justify-center" style="height: 120px;">
  //          <v-progress-circular indeterminate color="primary" size="40" width="4" class="mb-4"></v-progress-circular>
  //          <div class="text-caption text-primary font-weight-bold">جاري الرفع السحابي...</div>
  //        </div>

  //        <div v-else class="w-100 d-flex flex-column align-center">
  //          <v-icon :icon="isDragging ? 'mdi-file-download-outline' : 'mdi-cloud-upload-outline'" :color="isDragging ? 'primary' : 'grey-lighten-1'" size="48" class="mb-3"></v-icon>
  //          <div class="text-body-1 font-weight-bold text-grey-darken-3 mb-1">
  //            {{ isDragging ? 'أفلت الصورة هنا' : 'انقر لاختيار صورة أو قم بسحبها هنا' }}
  //          </div>
  //          <div class="text-caption text-grey">
  //            أو قم بنسخها ولصقها مباشرة بالكيبورد (Ctrl+V)
  //          </div>
  //          <div class="text-caption text-grey mt-2">
  //            (الحد الأقصى: 5 ميغابايت)
  //          </div>
  //        </div>
  //     </v-card>

  //     <!-- عرض الصورة المرفوعة مع زر الإلغاء -->
  //     <v-card v-else class="image-preview rounded-lg overflow-hidden position-relative border">
  //       <v-img :src="currentImageUrl" height="200" cover class="bg-grey-lighten-4">
  //         <template v-slot:placeholder>
  //           <div class="d-flex align-center justify-center fill-height">
  //             <v-progress-circular indeterminate color="grey-lighten-2"></v-progress-circular>
  //           </div>
  //         </template>
  //       </v-img>

  //       <div class="preview-overlay d-flex align-center justify-center position-absolute top-0 left-0 w-100 h-100 bg-black-20">
  //          <v-btn
  //            icon="mdi-trash-can-outline"
  //            color="error"
  //            variant="flat"
  //            class="elevation-4"
  //            @click="removeImage"
  //          ></v-btn>
  //       </div>
  //     </v-card>

  //     <!-- رسائل الخطأ المخفية -->
  //     <div v-if="error" class="text-caption text-error mt-2 px-2 d-flex align-center">
  //       <v-icon icon="mdi-alert-circle-outline" size="x-small" class="mr-1"></v-icon>
  //       {{ error }}
  //     </div>

  //     <!-- التسمية التقليدية للمرجع إن أردت إظهار الرابط -->
  //     <v-text-field 
  //       v-show="false"
  //       :model-value="modelValue" 
  //       readonly
  //     ></v-text-field>
  //   </div>
  // </template>

  // <script setup>
  // import { ref, watch, onMounted, onUnmounted } from 'vue'

  // const props = defineProps({
  //   modelValue: { type: String, default: '' },
  //   bucket: { type: String, default: 'products' }, // الافتراضي هو حاوية Products
  //   label: { type: String, default: 'صورة المنتج' }
  // })

  // const emit = defineEmits(['update:modelValue'])

  // const isDragging = ref(false)
  // const isHovered = ref(false)
  // const loading = ref(false)
  // const error = ref('')
  // const currentImageUrl = ref(props.modelValue)
  // const fileInputRef = ref(null)

  // // تزامن حالة الكومبوننت مع البيرنت
  // watch(() => props.modelValue, (newVal) => {
  //   currentImageUrl.value = newVal
  // })

  // const triggerFileInput = () => {
  //   if (fileInputRef.value && !loading.value) {
  //     fileInputRef.value.click()
  //   }
  // }

  // const handleFileSelect = (e) => {
  //   const file = e.target.files[0]
  //   if (file) uploadFile(file)
  // }

  // const handleDrop = (e) => {
  //   isDragging.value = false
  //   const file = e.dataTransfer.files[0]
  //   if (file) uploadFile(file)
  // }

  // // دعم عملية اللصق Paste (Ctrl+V)
  // const handlePaste = (e) => {
  //   if (!isHovered.value) return // يعمل فقط عندما يكون مؤشر الماوس فوق المكوّن المحدّد
  //   if (currentImageUrl.value || loading.value) return // لا تقبل اللصق إذا كان هناك صورة أو قيد الرفع

  //   const items = (e.clipboardData || e.originalEvent.clipboardData).items
  //   for (let index in items) {
  //     const item = items[index]
  //     if (item.kind === 'file' && item.type.startsWith('image/')) {
  //       const file = item.getAsFile()
  //       uploadFile(file)
  //       break
  //     }
  //   }
  // }

  // const validateFile = (file) => {
  //   error.value = ''
  //   if (!file.type.startsWith('image/')) {
  //     error.value = 'يُسمح فقط برفع الصور.'
  //     return false
  //   }
  //   const MAX_SIZE = 5 * 1024 * 1024
  //   if (file.size > MAX_SIZE) {
  //     error.value = 'حجم الصورة يتجاوز الحد الأقصى (5 ميغابايت).'
  //     return false
  //   }
  //   return true
  // }

  // const uploadFile = async (file) => {
  //   if (!validateFile(file)) return

  //   loading.value = true
  //   error.value = ''

  //   const formData = new FormData()
  //   formData.append('file', file)

  //   try {
  //     const response = await $fetch('/api/upload?bucket=products', {
  //       method: 'POST',
  //       body: formData
  //     })

  //     currentImageUrl.value = response.url
  //     emit('update:modelValue', response.url)

  //   } catch (err) {
  //     console.error("خطأ في الرفع:", err)
  //     error.value = err.data?.message || 'حدث خطأ أثناء الرفع للسيرفر.'
  //   } finally {
  //     loading.value = false
  //     if(fileInputRef.value) fileInputRef.value.value = '' // تفريغ حقل الاختيار
  //   }
  // }

  // const removeImage = () => {
  //   currentImageUrl.value = ''
  //   emit('update:modelValue', '')
  //   // مستقبلاً يمكننا طلب حذف الصورة من السيرفر كلياً إن أردنا
  // }

  // onMounted(() => {
  //   document.addEventListener('paste', handlePaste)
  // })

  // onUnmounted(() => {
  //   document.removeEventListener('paste', handlePaste)
  // })
  // </script>

  // <style scoped>
  // .upload-zone {
  //   min-height: 180px;
  //   transition: all 0.3s ease;
  // }
  // .upload-zone:hover {
  //   background-color: #f5f5f5;
  //   border-color: rgba(0,0,0,0.2) !important;
  // }
  // .border-dashed {
  //   border-style: dashed !important;
  //   border-width: 2px !important;
  // }
  // .bg-black-20 {
  //   background-color: rgba(0,0,0,0.3);
  //   opacity: 0;
  //   transition: opacity 0.3s ease;
  // }
  // .image-preview:hover .bg-black-20 {
  //   opacity: 1;
  // }
  // </style>`
  //   },
  //   {
  //     path: 'pages/inventory/index.vue',
  //     name: 'index.vue',
  //     language: 'vue',
  //     code: `<template>
  //   <div>
  //     <!-- عنوان الصفحة -->
  //     <div class="d-flex justify-space-between align-center mb-6">
  //       <h1 class="text-h4 font-weight-bold text-primary">إدارة المخزون</h1>
  //       <v-btn color="primary" prepend-icon="mdi-plus" class="rounded-lg font-weight-bold text-none">
  //         إضافة منتج جديد
  //       </v-btn>
  //     </div>

  //     <!-- إحصائيات سريعة (Cards) -->
  //     <v-row class="mb-6">
  //       <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
  //         <v-card elevation="2" class="rounded-lg h-100 pa-4 border-l-4" :style="border-left: 4px solid stat.color">
  //           <div class="d-flex justify-space-between align-start">
  //             <div>
  //               <div class="text-subtitle-2 text-medium-emphasis mb-1 font-weight-bold">{{ stat.title }}</div>
  //               <div class="text-h5 font-weight-bold text-grey-darken-3">{{ stat.value }}</div>
  //             </div>
  //             <v-avatar :color="stat.color + '-lighten-4'" size="40">
  //               <v-icon :icon="stat.icon" :color="stat.color"></v-icon>
  //             </v-avatar>
  //           </div>
  //         </v-card>
  //       </v-col>
  //     </v-row>

  //     <!-- جدول تجريبي (Data Table Dummy) -->
  //     <v-card elevation="2" class="rounded-lg">
  //       <v-card-title class="pa-4 border-b bg-white d-flex align-center justify-space-between">
  //         <span class="font-weight-bold text-subtitle-1">المنتجات الحالية</span>
  //         <div style="width: 250px;">
  //           <v-text-field
  //             density="compact"
  //             variant="outlined"
  //             placeholder="بحث بالكود أو الاسم..."
  //             prepend-inner-icon="mdi-magnify"
  //             hide-details
  //             rounded="lg"
  //             bg-color="grey-lighten-4"
  //           ></v-text-field>
  //         </div>
  //       </v-card-title>

  //       <v-table hover>
  //         <thead>
  //           <tr>
  //             <th class="text-right font-weight-bold">الكود (SKU)</th>
  //             <th class="text-right font-weight-bold">اسم المنتج</th>
  //             <th class="text-right font-weight-bold">التصنيف</th>
  //             <th class="text-right font-weight-bold">الكمية المتوفرة</th>
  //             <th class="text-right font-weight-bold">الحالة</th>
  //             <th class="text-center font-weight-bold">إجراءات</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <tr v-for="item in dummyInventory" :key="item.sku">
  //             <td class="font-weight-medium text-primary">{{ item.sku }}</td>
  //             <td>{{ item.name }}</td>
  //             <td class="text-medium-emphasis">{{ item.category }}</td>
  //             <td class="font-weight-bold">{{ item.stock }} وحدة</td>
  //             <td>
  //               <v-chip :color="item.stock > 10 ? 'success' : 'warning'" size="small" variant="flat" class="font-weight-bold">
  //                 {{ item.stock > 10 ? 'متوفر' : 'أوشك على النفاد' }}
  //               </v-chip>
  //             </td>
  //             <td class="text-center">
  //               <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary"></v-btn>
  //               <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error"></v-btn>
  //             </td>
  //           </tr>
  //         </tbody>
  //       </v-table>
  //     </v-card>
  //   </div>
  // </template>

  // <script setup>
  // import { ref } from 'vue'

  // const stats = ref([
  //   { title: 'إجمالي المنتجات', value: '1,248', icon: 'mdi-package-variant', color: '#1867C0' },
  //   { title: 'متوفر في المستودع (Local)', value: '850', icon: 'mdi-warehouse', color: '#4CAF50' },
  //   { title: 'متوفر في أمازون (FBA)', value: '398', icon: 'mdi-truck-delivery', color: '#FB8C00' },
  //   { title: 'منتجات منخفضة المخزون', value: '12', icon: 'mdi-alert-circle', color: '#B00020' },

  // ])

  // const dummyInventory = ref([
  //   { sku: 'LP-SHO-B-42', name: 'حذاء رياضي أسود رجالي مقاس 42', category: 'أحذية', stock: 45 },
  //   { sku: 'LP-TSH-W-L', name: 'تي شيرت قطن أبيض رجالي Large', category: 'ملابس', stock: 120 },
  //   { sku: 'LP-BAG-L-BR', name: 'حقيبة لابتوب جلد بني', category: 'إكسسوارات', stock: 8 },
  //   { sku: 'LP-WAT-S-BL', name: 'ساعة يد رقمية ذكية', category: 'إلكترونيات', stock: 34 },
  //   { sku: 'LP-HDP-W-WH', name: 'سماعات رأس بلوتوث بيضاء', category: 'إلكترونيات', stock: 0 },
  // ])
  // </script>

  // <style scoped>
  // .border-b {
  //   border-bottom: 1px solid rgba(0,0,0,0.05) !important;
  // }
  // .border-l-4 {
  //   border-left-width: 4px !important;
  //   border-left-style: solid !important;
  // }
  // </style>`
  //   },
  //   {
  //     path: 'server/api/purchases/index.get.ts',
  //     name: 'index.get.ts',
  //     language: 'typescript',
  //     code: `import { serverSupabaseServiceRole } from '#supabase/server'
  // import { Database } from '~/types/supabase'

  // export default defineEventHandler(async (event) => {
  //     const supabase = serverSupabaseServiceRole<Database>(event)
  //     const query = getQuery(event)

  //     const page = parseInt(query.page as string) || 1
  //     const itemsPerPage = parseInt(query.itemsPerPage as string) || parseInt(query.limit as string) || 10
  //     const search = query.search as string || ''
  //     const status_filter = query.status as string || 'all'

  //     const start = (page - 1) * itemsPerPage
  //     const end = start + itemsPerPage - 1

  //     let dbQuery = supabase
  //         .from('purchase_invoices')
  //         .select('
  //       *,
  //     supplier: suppliers(name),
  //     warehouse: warehouses(name)
  //       ', { count: 'exact' })
  //         .order('created_at', { ascending: false })

  //     if (search) {
  //         dbQuery = dbQuery.or('invoice_number.ilike.% { search } %')
  //     }

  //     if (status_filter !== 'all') {
  //         dbQuery = dbQuery.eq('status', status_filter.toUpperCase())
  //     }

  //     const { data, count, error } = await dbQuery.range(start, end)

  //     if (error) {
  //         throw createError({
  //             statusCode: 500,
  //             statusMessage: error.message
  //         })
  //     }

  //     // تنسيق البيانات لتسهيل عرضها على الـ DataTable الأمامي
  //     const formattedData = data.map((invoice: any) => ({
  //         id: invoice.id,
  //         invoice_number: invoice.invoice_number,
  //         invoice_date: invoice.invoice_date,
  //         status: invoice.status,
  //         total_gross_amount: invoice.total_gross_amount,
  //         total_net_amount: invoice.total_net_amount,
  //         total_vat_amount: invoice.total_vat_amount,
  //         supplier_name: invoice.supplier ? invoice.supplier.name : 'مورد محذوف',
  //         warehouse_name: invoice.warehouse ? invoice.warehouse.name : 'مستودع محذوف',
  //         created_at: invoice.created_at
  //     }))

  //     return {
  //         items: formattedData,
  //         totalItems: count || 0
  //     }
  // })`
  //   },
  //   {
  //     path: 'server/api/purchases/index.post.ts',
  //     name: 'index.post.ts',
  //     language: 'typescript',
  //     code: `import { serverSupabaseServiceRole } from '#supabase/server'
  // import { Database } from '~/types/supabase'

  // export default defineEventHandler(async (event) => {
  //     const supabase = serverSupabaseServiceRole<Database>(event)
  //     const body = await readBody(event)

  //     // Basic Validation
  //     if (!body.supplier_id || !body.warehouse_id || !body.invoice_number) {
  //         throw createError({
  //             statusCode: 400,
  //             statusMessage: 'المعلومات الأساسية للفاتورة غير مكتملة.'
  //         })
  //     }

  //     if (!Array.isArray(body.items) || body.items.length === 0) {
  //         throw createError({
  //             statusCode: 400,
  //             statusMessage: 'يجب أن تحتوي الفاتورة على صنف واحد على الأقل.'
  //         })
  //     }

  //     try {
  //         // 1. حساب القيم الإجمالية (Gross, Net, VAT) بناءً على الأصناف المُرسلة
  //         let total_gross_amount = 0;
  //         let total_net_amount = 0;
  //         let total_vat_amount = 0;

  //         const processedItems = body.items.map((item: any) => {
  //             const quantity = Number(item.quantity) || 0
  //             const unit_price_gross = Number(item.unit_price_gross) || 0
  //             const kdv_rate = Number(item.kdv_rate) || 0

  //             // الحسابات للقطعة الواحدة
  //             const net_unit_cost = unit_price_gross / (1 + (kdv_rate / 100))
  //             const total_item_gross = quantity * unit_price_gross
  //             const total_item_net = quantity * net_unit_cost
  //             const total_item_vat = total_item_gross - total_item_net

  //             // الجمع للإجماليات
  //             total_gross_amount += total_item_gross
  //             total_net_amount += total_item_net
  //             total_vat_amount += total_item_vat

  //             return {
  //                 product_id: item.product_id,
  //                 quantity: quantity,
  //                 unit_price_gross: unit_price_gross,
  //                 kdv_rate: kdv_rate,
  //                 net_unit_cost: net_unit_cost,
  //                 total_gross: total_item_gross
  //             }
  //         })

  //         // 2. إدخال الترويسة الأساسية للفاتورة في جدول purchase_invoices
  //         const { data: invoiceData, error: invoiceError } = await supabase
  //             .from('purchase_invoices')
  //             .insert([{
  //                 invoice_number: body.invoice_number,
  //                 supplier_id: body.supplier_id,
  //                 warehouse_id: body.warehouse_id,
  //                 invoice_date: body.invoice_date || new Date().toISOString(),
  //                 status: 'DRAFT', // تبدأ دائماً كمسودة
  //                 notes: body.notes || null,
  //                 total_gross_amount,
  //                 total_net_amount,
  //                 total_vat_amount
  //             }])
  //             .select('id')
  //             .single()

  //         if (invoiceError) throw new Error(invoiceError.message)

  //         // 3. تحضير وإدخال سطور الأصناف
  //         const itemsToInsert = processedItems.map(item => ({
  //             ...item,
  //             invoice_id: invoiceData.id
  //         }))

  //         const { error: itemsError } = await supabase
  //             .from('purchase_invoice_items')
  //             .insert(itemsToInsert)

  //         if (itemsError) {
  //             // Rollback: delete the invoice if items insert fails (Simulated transaction)
  //             await supabase.from('purchase_invoices').delete().eq('id', invoiceData.id)
  //             throw new Error("فشل إدخال أصناف الفاتورة: " + itemsError.message)
  //         }

  //         return {
  //             success: true,
  //             message: 'تم حفظ الفاتورة بنجاح كمسودة.',
  //             invoice_id: invoiceData.id
  //         }

  //     } catch (err: any) {
  //         throw createError({
  //             statusCode: 500,
  //             statusMessage: err.message || 'حدث خطأ أثناء حفظ الفاتورة.'
  //         })
  //     }
  // })`
  //   },
  //   {
  //     path: 'server/api/sales/index.post.ts',
  //     name: 'batches.get.ts',
  //     language: 'typescript',
  //     code: `import { serverSupabaseServiceRole } from '#supabase/server'

  // export default defineEventHandler(async (event) => {
  //   const supabase = serverSupabaseServiceRole(event)

  //   const { data, error } = await supabase
  //     .from('sales_import_batches')
  //     .select('*, sales ( count )')
  //     .order('created_at', { ascending: false })
  //     .limit(50)

  //   if (error) {
  //     throw createError({ statusCode: 500, statusMessage: 'فشل في جلب تاريخ الاستيرادات' })
  //   }

  //   // Transform data to make count easier
  //   return (data as any[]).map(b => ({
  //     ...b,
  //     sales_count: b.sales[0]?.count || 0
  //   }))
  // })`
  //   },
  //   {
  //     path: 'server/api/sales/import.post.ts',
  //     name: 'import.post.ts',
  //     language: 'typescript',
  //     code: `import { serverSupabaseServiceRole } from '#supabase/server'
  // // Using the mjs version of xlsx for better ESM compatibility
  // import * as XLSX from 'xlsx/xlsx.mjs'

  // export default defineEventHandler(async (event) => {
  //   const supabase = serverSupabaseServiceRole(event)
  //   const formData = await readMultipartFormData(event)

  //   if (!formData || formData.length === 0) {
  //     throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  //   }

  //   const filePart = formData.find(p => p.name === 'file')
  //   const platformPart = formData.find(p => p.name === 'platform')
  //   const fulfillmentPart = formData.find(p => p.name === 'fulfillment_channel')
  //   const accountIdPart = formData.find(p => p.name === 'account_id')
  //   const revenueAccountIdPart = formData.find(p => p.name === 'revenue_account_id')
  //   const feesAccountIdPart = formData.find(p => p.name === 'fees_account_id')
  //   const overheadAccountIdPart = formData.find(p => p.name === 'overhead_account_id')
  //   const cogsAccountIdPart = formData.find(p => p.name === 'cogs_account_id')
  //   const inventoryAccountIdPart = formData.find(p => p.name === 'inventory_account_id')

  //   if (!filePart || !platformPart) {
  //     throw createError({ statusCode: 400, statusMessage: 'Missing file or platform selection' })
  //   }

  //   const platform = platformPart.data.toString()
  //   const fallbackFulfillment = fulfillmentPart ? fulfillmentPart.data.toString() : 'MFN'
  //   const accountId = accountIdPart ? accountIdPart.data.toString() : null
  //   const revenueAccountId = revenueAccountIdPart ? revenueAccountIdPart.data.toString() : null
  //   const feesAccountId = feesAccountIdPart ? feesAccountIdPart.data.toString() : null
  //   const overheadAccountId = overheadAccountIdPart ? overheadAccountIdPart.data.toString() : null
  //   const cogsAccountId = cogsAccountIdPart ? cogsAccountIdPart.data.toString() : null
  //   const inventoryAccountId = inventoryAccountIdPart ? inventoryAccountIdPart.data.toString() : null
  //   let rows: any[] = []
  //   try {
  //     let workbook: XLSX.WorkBook;
  //     if (filePart.filename?.toLowerCase().endsWith('.csv')) {
  //       let text = filePart.data.toString('utf-8')
  //       text = text.trimStart()
  //       workbook = XLSX.read(text, { type: 'string', raw: true })
  //     } else {
  //       workbook = XLSX.read(filePart.data, { type: 'buffer' })
  //     }

  //     const sheetName = workbook.SheetNames[0]
  //     const sheet = workbook.Sheets[sheetName]
  //     if (!sheet) throw new Error('Sheet not found');

  //     // الحل العبقري: بعض المنصات تضع عناوين الجداول في السطر الثاني أو الثالث (ويكون الأول عنوان التقرير العام).
  //     // سنقوم بقراءة الشيت كـ مصفوفة بحثاً عن السطر الحقيقي الذي يحمل رؤوس الجداول المعروفة!
  //     const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  //     let headerRowIndex = 0;
  //     for(let i = 0; i < Math.min(15, rawRows.length); i++) {
  //         if (!rawRows[i] || !Array.isArray(rawRows[i])) continue;
  //         const rowValues = rawRows[i].map(v => String(v).trim().toLowerCase());
  //         // كلمات مفتاحية تدل على سطر العناوين
  //         if (rowValues.includes('barkod') || rowValues.includes('paket no') || 
  //             rowValues.includes('sipariş no') || rowValues.includes('sipariş numarası') || 
  //             rowValues.includes('amazon order id') || rowValues.includes('order-id')) {
  //             headerRowIndex = i;
  //             break;
  //         }
  //     }

  //     // الآن نطلب من المكتبة تحويل الإكسل إلى JSON مع بدء القراءة الحقيقية حصراً من السطر الذي اكتشفناه!
  //     rows = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '' })

  //   } catch (err) {
  //     throw createError({ statusCode: 400, statusMessage: 'حدث خطأ أثناء قراءة هيكل الملف' })
  //   }

  //   if (!rows || rows.length === 0) {
  //      throw createError({ statusCode: 400, statusMessage: 'الملف فارغ أو العناوين غير مدعومة' })
  //   }

  //   // Create Batch Record
  //   const { data: batchData, error: batchError } = await (supabase as any)
  //     .from('sales_import_batches')
  //     .insert({
  //       file_name: filePart.filename || 'Uploaded File',
  //       marketplace: platform,
  //       fulfillment_channel: fallbackFulfillment
  //     })
  //     .select('id')
  //     .single()

  //   if (batchError || !batchData) {
  //     console.error('Batch Creation Error:', batchError)
  //     throw createError({ statusCode: 500, statusMessage: 'فشل في تهيئة دفعة الاستيراد في قاعدة البيانات' })
  //   }

  //   const batchId = batchData.id

  //   let successCount = 0
  //   let errorCount = 0
  //   const errors: string[] = []

  //   // Note: map functions are auto-imported from server/utils
  //   for (const row of rows) {
  //     try {
  //       let normalized: any
  //       if (platform === 'Amazon') normalized = mapAmazonSale(row, fallbackFulfillment)
  //       else if (platform === 'Trendyol') normalized = mapTrendyolSale(row, fallbackFulfillment)
  //       else if (platform === 'Hepsiburada') normalized = mapHepsiburadaSale(row, fallbackFulfillment)
  //       else throw new Error('Unknown platform')

  //       // Call the RPC function for atomic processing
  //       // We don't use <Database> here to avoid lint errors with newly created RPCs
  //       const { data, error } = await (supabase as any).rpc('process_platform_sale', {
  //         p_order_id: normalized.order_id,
  //         p_sku: normalized.sku,
  //         p_qty: normalized.quantity,
  //         p_price_gross: normalized.unit_price_gross,
  //         p_order_date: normalized.order_date,
  //         p_marketplace: normalized.marketplace,
  //         p_fulfillment_channel: normalized.fulfillment_channel,
  //         p_buyer_name: normalized.buyer_name || '',
  //         p_raw_data: normalized.raw_data,
  //         p_batch_id: batchId,
  //         p_marketplace_account_id: accountId,
  //         p_revenue_account_id: revenueAccountId,
  //         p_fees_account_id: feesAccountId,
  //         p_overhead_account_id: overheadAccountId,
  //         p_cogs_account_id: cogsAccountId,
  //         p_inventory_account_id: inventoryAccountId
  //       })

  //       if (error) {
  //         console.error('Import Row Error:', error)
  //         errors.push('Order ' + normalized.order_id + ': ' + error.message)
  //         errorCount++
  //       } else {
  //         successCount++
  //       }
  //     } catch (err: any) {
  //       console.error('Mapping/Processing Error:', err)
  //       errors.push('Row processing failed: ' + err.message)
  //       errorCount++
  //     }
  //   }

  //   return {
  //     success: true,
  //     message: 'Batch complete: ' + successCount + ' imported, ' + errorCount + ' failed.',
  //     successCount,
  //     errorCount,
  //     errors,
  //     batchId
  //   }
  // })`
  //   }
];
