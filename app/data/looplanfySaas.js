export const looplanfySaas = [
  {
    path: 'components/blocks/AllProducts.vue',
    name: 'AllProducts.vue',
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
  {
    path: 'components/blocks/Cart.vue',
    name: 'Cart.vue',
    language: 'vue',
    code: `<template>
  <div class="cart-block-wrapper">
    <v-container class="">
      <!-- Empty State: Premium Redesign -->
      <div v-if="cartStore.items.length === 0" class="empty-cart-premium py-16 px-4">
        <div class="empty-content-wrapper position-relative mx-auto" style="max-width: 600px;">
          <!-- Decorative Background Blob -->
          <div class="empty-blob" :style="{ backgroundColor: brandColor + '10' }"></div>
          
          <div class="empty-content text-center position-relative">
            <div class="empty-icon-box mb-8">
              <v-icon size="120" :color="brandColor" class="empty-icon-main">mdi-shopping-outline</v-icon>
              <div class="icon-pulse" :style="{ backgroundColor: brandColor }"></div>
            </div>
            
            <h2 class="empty-title text-h4 font-weight-black mb-4">
              {{ $t('cart.empty_title') || 'Your cart is empty' }}
            </h2>
            
            <p class="empty-subtitle text-body-1 text-grey-darken-1 mb-10 mx-auto" style="max-width: 500px; line-height: 1.6;">
              {{ $t('cart.empty_subtitle') || 'Start shopping to fill it up!' }}
            </p>
            
            <v-btn
              to="/"
              size="x-large"
              height="60"
              rounded="pill"
              elevation="0"
              :color="brandColor"
              class="start-shopping-btn px-12 text-white font-weight-black"
            >
              <v-icon start class="me-2">mdi-store-outline</v-icon>
              {{ $t('cart.continue_shopping') || 'Start Shopping' }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Active Cart -->
      <v-row v-else class="gx-8">
        <!-- Cart Items List -->
        <v-col cols="12" md="8">
          <div class="items-container">
            <transition-group name="list">
              <div 
                v-for="item in cartStore.items" 
                :key="item.id + (item.variant_id || '')"
                class="cart-item-premium mb-5 bg-white overflow-hidden"
              >
                <div class="d-flex pa-4 pa-md-5">
                  <!-- Product Image with Gray Background -->
                  <div class="item-img-wrapper-premium rounded-xl" @click="navigateToProduct(item.id)">
                    <v-img :src="getOptimizedUrl(item.image || item.image_url)" aspect-ratio="1" contain class="item-img-premium"></v-img>
                  </div>

                  <!-- Info Section -->
                  <div class="flex-grow-1 ps-4 ps-md-6 d-flex flex-column">
                    <div class="d-flex justify-space-between align-start mb-1">
                      <h3 class="item-name-premium font-weight-black" @click="navigateToProduct(item.id)">
                        {{ getLocalized(item, 'name') }}
                      </h3>
                      <v-btn
                        icon="mdi-close"
                        variant="text"
                        color="grey-lighten-1"
                        size="small"
                        density="comfortable"
                        class="ms-2"
                        @click="handleRemoveItem(item)"
                        :loading="removingItems.has(item.cart_item_id || item.id)"
                      ></v-btn>
                    </div>

                    <!-- Selected Options (Translated) -->
                    <div v-if="item.selected_options && Object.keys(item.selected_options).length" class="d-flex flex-wrap gap-2 mb-3">
                      <div v-for="(val, key) in item.selected_options" :key="key" class="item-option-tag">
                        <span class="text-grey-darken-1">{{ key }}:</span>
                        <span class="font-weight-bold ms-1">{{ val }}</span>
                      </div>
                    </div>

                    <div class="mt-auto d-flex align-end justify-space-between pt-2">
                      <div class="item-price-premium font-weight-black" :style="{ color: brandColor }">
                        {{ formatPrice((item.price || 0) * (item.quantity || 1)) }}
                      </div>

                      <!-- Stepper -->
                      <div class="custom-stepper-premium" :class="{ 'is-updating': updatingItems.has(item.cart_item_id || item.id) }">
                        <v-btn icon="mdi-plus" variant="text" size="x-small" class="stepper-btn-premium" @click="handleQuantityChange(item, 1)" :disabled="updatingItems.has(item.cart_item_id || item.id)"></v-btn>
                        
                        <div class="qty-display-premium">
                          <transition name="fade" mode="out-in">
                            <v-progress-circular v-if="updatingItems.has(item.cart_item_id || item.id)" indeterminate size="14" width="2" :color="brandColor"></v-progress-circular>
                            <span v-else class="qty-circle-premium font-weight-black" :style="{ color: brandColor }">{{ item.quantity }}</span>
                          </transition>
                        </div>

                        <v-btn icon="mdi-minus" variant="text" size="x-small" class="stepper-btn-premium" :disabled="item.quantity <= 1 || updatingItems.has(item.cart_item_id || item.id)" @click="handleQuantityChange(item, -1)"></v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </v-col>

        <!-- Summary Sidebar -->
        <v-col cols="12" md="4">
          <!-- Free Shipping Box (Always Visible) -->
          <div v-if="tenantStore.tenant?.settings?.shipping_mode === 'conditional' || tenantStore.tenant?.settings?.shipping_mode === 'free'" class="free-shipping-premium mb-4">
            <div class="d-flex align-center justify-end mb-2">
              <span class="font-weight-bold text-subtitle-1 text-grey-darken-4">
                <template v-if="tenantStore.tenant?.settings?.shipping_mode === 'free'">
                  {{ $t('cart.free_shipping') }}
                </template>
                <template v-else>
                  {{ remainingForFreeShipping === 0 ? $t('cart.free_shipping_unlocked') : $t('cart.free_shipping') }}
                </template>
              </span>
              <v-icon size="24" :color="brandColor" class="ms-2">mdi-truck-fast</v-icon>
            </div>

            <v-progress-linear
              v-if="tenantStore.tenant?.settings?.shipping_mode === 'conditional'"
              :model-value="progressPercentage"
              height="6"
              rounded
              :color="brandColor"
              bg-color="#fff0e6"
              bg-opacity="1"
              class="mb-2 custom-progress"
            ></v-progress-linear>
            
            <div class="text-right">
              <span v-if="tenantStore.tenant?.settings?.shipping_mode === 'free'" class="text-body-2 text-grey-darken-1">
                {{ $t('cart.all_orders_free_shipping') }}
              </span>
              <template v-else>
                <span v-if="remainingForFreeShipping > 0" class="text-body-2 text-grey-darken-1">
                  {{ $t('cart.free_shipping_progress', { amount: formatPrice(remainingForFreeShipping) }) }}
                </span>
                <span v-else class="text-info font-weight-bold text-body-2">
                  {{ $t('cart.free_shipping_threshold_applied', { threshold: formatPrice(tenantStore.tenant?.settings?.free_shipping_threshold) }) }}
                </span>
              </template>
            </div>
          </div>

          <div class="summary-desktop-sticky">
            
            <!-- Main Detailed Summary Card (Visible on Desktop AND Mobile) -->
            <div class="summary-main-card rounded-xl pa-6 bg-white mb-4">
              <h3 class="text-h6 font-weight-bold mb-6 text-grey-darken-3">{{ $t('cart.order_summary') || 'Order Summary' }}</h3>
              
              <div class="summary-row mb-4">
                <div class="d-flex align-center">
                  <v-icon size="18" class="me-2 text-grey">mdi-receipt-text-outline</v-icon>
                  <span class="label">{{ $t('cart.subtotal') || 'Subtotal' }} ({{ totalItemsCount }} {{ $t('cart.items') || 'items' }})</span>
                </div>
                <span class="value font-weight-bold text-grey-darken-3">{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>
              <div class="summary-row mb-4">
                <div class="d-flex align-center">
                  <v-icon size="18" class="me-2 text-grey">mdi-truck-delivery-outline</v-icon>
                  <span class="label">{{ $t('cart.shipping') || 'Shipping' }}</span>
                </div>
                <span class="value font-weight-bold text-grey-darken-3" :class="{'text-info': shippingCost === 0}">
                  {{ shippingCost === 0 ? $t('cart.free_shipping') || 'Free' : formatPrice(shippingCost) }}
                </span>
              </div>
              <div class="summary-row mb-6">
                <div class="d-flex align-center">
                  <v-icon size="18" class="me-2 text-grey">mdi-shield-check-outline</v-icon>
                  <span class="label">{{ $t('cart.taxes') || 'Estimated Taxes' }}</span>
                </div>
                <span class="value text-info font-weight-bold">{{ $t('cart.included') || 'Included' }}</span>
              </div>

              <v-divider class="mb-6 opacity-10"></v-divider>

              <div class="total-section-premium pa-4 rounded-xl mb-8" :style="{ backgroundColor: brandColor + '08' }">
                <div class="d-flex justify-space-between align-center">
                  <div class="text-left" :class="{'text-right': locale === 'ar'}">
                    <div class=" text-uppercase font-weight-bold mb-1" :style="{ color: brandColor }">
                      {{ $t('cart.total') || 'Total Amount' }}
                    </div>
                    <div class="total-vat text-caption text-grey-darken-1">{{ $t('cart.including_vat') || 'Inc. VAT' }}</div>
                  </div>
                  <div class="total-price  text-h6 font-weight-bold text-grey-darken-3 text-info" >
                    {{ formatPrice(grandTotal) }}
                  </div>
                </div>
              </div>

              <!-- Action Button (Now Inside the Card) -->
              <div class="d-none d-md-block">
                <v-btn
                  v-if="isCheckoutEnabled"
                  block
                  :color="brandColor"
                  height="56"
                  rounded="pill"
                  elevation="0"
                  class="checkout-main-btn text-white font-weight-bold text-h6"
                  @click="handleCheckout"
                >
                  {{ $t('common.checkout_btn') || 'Checkout' }}
                </v-btn>

                <v-btn
                  v-else
                  block
                  color="#25D366"
                  height="60"
                  rounded="lg"
                  class="checkout-main-btn text-white font-weight-bold text-h6"
                  @click="handleWhatsAppCheckout"
                  prepend-icon="mdi-whatsapp"
                >
                  {{ $t('common.whatsapp_order_btn') || 'WhatsApp Order' }}
                </v-btn>

                <!-- Continue Shopping Button (Below Checkout) -->
                <v-btn
                  to="/"
                  block
                  variant="text"
                  height="50"
                  color="grey-darken-1"
                  class="mt-2 font-weight-bold"
                >
                  {{ $t('cart.continue_shopping') || 'Continue Shopping' }}
                </v-btn>
              </div>

              <!-- Trust Badges -->
              <div class="trust-badges d-flex align-center justify-center gap-1 mt-4 text-grey-darken-1">
                 <v-icon size="small">mdi-shield-check-outline</v-icon>
                 <span class="text-caption font-weight-medium">{{ $t('cart.secure_checkout') || 'Secure Checkout' }}</span>
              </div>
            </div>
          </div>

          <!-- Mobile Sticky Action Bar -->
          <div class="mobile-sticky-action-bar d-md-none">
            <div class="mobile-summary-info">
              <span class="mobile-total-label">{{ $t('cart.total') || 'Total' }}</span>
              <span class="mobile-total-price">{{ formatPrice(grandTotal) }}</span>
            </div>
            
            <v-btn
              v-if="isCheckoutEnabled"
              :color="brandColor"
              height="48"
              class="checkout-main-btn text-white font-weight-bold flex-grow-1"
              @click="handleCheckout"
            >
              {{ $t('common.checkout_btn') || 'Checkout' }}
            </v-btn>
            <v-btn
              v-else
              color="#25D366"
              height="48"
              class="checkout-main-btn text-white font-weight-bold flex-grow-1"
              @click="handleWhatsAppCheckout"
              prepend-icon="mdi-whatsapp"
            >
              {{ $t('common.whatsapp_order_btn') || 'WhatsApp Order' }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useTenantStore } from '~/stores/tenant'

const { getLocalized: getLocHelper } = useLocalized()
const { t, locale } = useI18n()
const router = useRouter()
const cartStore = useCartStore()
const tenantStore = useTenantStore()
const supabase = useSupabaseClient()
const { success: showSuccess, info: showInfo, error: showError } = useSnackbar()
const img = useImage()

const getOptimizedUrl = (url) => {
  if (!url || url.includes('placeholder.com')) return url
  return img(url, { width: 150, quality: 75, format: 'webp' })
}

const brandColor = computed(() => tenantStore.tenant?.settings?.brand_color || '#1a1a1a')

// Same logic as SimpleProductsList.vue
const getLocalized = (item, field) => getLocHelper(item, field)

onMounted(async () => {
  await cartStore.initCart()
})

const navigateToProduct = (id) => {
  router.push('/ product / { id }')
}

const formatPrice = (p) => {


  const currency = tenantStore.tenant?.settings?.currency
  return '{ currency } { p.toFixed(0) }'


  //  currency = tenantStore.tenant?.settings?.currency
  // return new Intl.NumberFormat('en-US', { 
  //   style: 'currency', 
  //   currency: currency,
  //   maximumFractionDigits: 0
  // }).format(p)
}

const updatingItems = ref(new Set())

const handleQuantityChange = async (item, delta) => {
  const itemId = item.cart_item_id || item.id
  if (updatingItems.value.has(itemId)) return

  updatingItems.value.add(itemId)
  try {
    await cartStore.updateQuantity(itemId, delta)
    
    // Add a small artificial delay of 1s as requested to prevent spamming
    await new Promise(resolve => setTimeout(resolve, 800))

    // Show feedback AFTER loading
    if (delta > 0) {
      showSuccess(t('common.item_updated') || 'Quantity increased')
    } else {
      showInfo(t('common.item_updated') || 'Quantity decreased')
    }
  } catch (err) {
    if (err?.type === 'STOCK_LIMIT') {
      showError(t('common.stock_limit_reached', { name: err.name, count: err.available }))
    } else {
      console.error('[SimpleCart] Update quantity error:', err)
    }
  } finally {
    updatingItems.value.delete(itemId)
  }
}

const removingItems = ref(new Set())

const handleRemoveItem = async (item) => {
  const itemId = item.cart_item_id || item.id
  removingItems.value.add(itemId)
  try {
    await cartStore.removeItem(itemId)
    showSuccess(t('common.item_removed') || 'Item removed from cart')
  } finally {
    removingItems.value.delete(itemId)
  }
}

const isCheckoutEnabled = computed(() => {
  return tenantStore.tenant?.settings?.enable_checkout ?? true
})

const totalItemsCount = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
})

const shippingCost = computed(() => {
  const settings = tenantStore.tenant?.settings
  if (!settings || settings.shipping_mode === 'free') return 0
  if (settings.shipping_mode === 'fixed') return Number(settings.shipping_cost) || 0
  if (settings.shipping_mode === 'conditional') {
    const threshold = Number(settings.free_shipping_threshold) || 0
    return cartStore.totalPrice >= threshold ? 0 : (Number(settings.shipping_cost) || 0)
  }
  return 0
})

const grandTotal = computed(() => cartStore.totalPrice + shippingCost.value)

const remainingForFreeShipping = computed(() => {
  const settings = tenantStore.tenant?.settings
  if (settings?.shipping_mode !== 'conditional') return 0
  const threshold = Number(settings.free_shipping_threshold) || 0
  const remaining = threshold - cartStore.totalPrice
  return remaining > 0 ? remaining : 0
})

const progressPercentage = computed(() => {
  const settings = tenantStore.tenant?.settings
  if (settings?.shipping_mode !== 'conditional') return 100
  const threshold = Number(settings.free_shipping_threshold) || 1
  const progress = (cartStore.totalPrice / threshold) * 100
  return Math.min(progress, 100)
})

const handleCheckout = () => {
  if (isCheckoutEnabled.value) {
    const user = useSupabaseUser()
    const settings = tenantStore.tenant?.settings
    const allowGuest = settings?.allow_guest_checkout ?? true
    if (user.value || allowGuest) {
       router.push('/checkout')
    } else {
       router.push('/login?redirect=/checkout')
    }
  }
}

const handleWhatsAppCheckout = () => {
  const waNumber = tenantStore.tenant?.settings?.whatsapp_number
  if (!waNumber) {
    alert(t('common.whatsapp_number_missing'))
    return
  }

  const storeName = (tenantStore.tenant?.name || 'Looplanfy Store').toUpperCase()
  const baseUrl = window.location.origin
  const date = new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  let msg = '*--- {t('common.wa_msg_new_order') || 'NEW ORDER'} ---*\n'
  msg += '*STORE: {storeName}*\n'
  msg += '==============================\n\n'
  
  msg += '*{t('cart.order_details') || 'ORDER DETAILS'}*\n\n'
  
  cartStore.items.forEach((item, index) => {
    const itemName = getLocalized(item, 'name')
    const itemTotal = formatPrice(item.price * item.quantity)
    const productUrl = '{baseUrl}/product/{item.id}'

    msg += '{index + 1}. *{item.quantity}x* {itemName}\n'
    
    // Add selected options if they exist (Already localized in DB)
    if (item.selected_options && Object.keys(item.selected_options).length > 0) {
      const opts = Object.entries(item.selected_options)
        .map(([key, val]) => '{key}: {val}')
        .join(' | ')
      msg += '   ({opts})\n'
    }
    
    msg += '   *{t('cart.subtotal') || 'Subtotal'}: {itemTotal}*\n'
    msg += '   LINK: {productUrl}\n\n'
  })

  msg += '==============================\n'
  msg += '*{t('cart.order_summary') || 'SUMMARY'}*\n'
  msg += '- {t('cart.subtotal') || 'Subtotal'}: {formatPrice(cartStore.totalPrice)}\n'
  msg += '- {t('cart.shipping') || 'Shipping'}: {shippingCost.value === 0 ? (t('cart.free_shipping') || 'Free') : formatPrice(shippingCost.value)}\n'
  msg += '*{t('cart.total') || 'Total'}: {formatPrice(grandTotal.value)}*\n'
  
  msg += '==============================\n'
  msg += 'DATE: {date}\n'
  msg += 'URL: {baseUrl}\n\n'
  msg += '*{t('common.wa_confirm_msg') || 'Please confirm my order. Thank you!'}*'

  const url = 'https://wa.me/{waNumber.replace('+', '')}?text={encodeURIComponent(msg)}'
  window.open(url, '_blank')
}
</script>

<style scoped>
.cart-block-wrapper {
  background-color: #f2f2f5;
  min-height: 60vh;
  padding-bottom: 60px;
}

/* Empty Cart Premium Styles */
.empty-cart-premium {
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
  width: 300px;
  height: 300px;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  filter: blur(40px);
  animation: blob-animate 10s infinite alternate;
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
  animation: float 3s ease-in-out infinite;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  animation: pulse 2s infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.start-shopping-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 1px;
}

.start-shopping-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0,0,0,0.15) !important;
}

.empty-title {
  color: #1a1a1a;
  letter-spacing: -1px;
}

/* Base Card Styles */
.cart-item-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease;
  /* border: 1px solid rgba(0,0,0,0.05); */
  /* box-shadow: 0 2px 10px rgba(0,0,0,0.02); */
}

.cart-item-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
}

/* Custom Flex Layout (Desktop default) */
.custom-item-layout {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-img-box {
  flex: 0 0 120px;
  max-width: 120px;
  cursor: pointer;
  /* background: #fafafa; */
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}
/* .cart-item-card:hover .product-img-box .v-img {
  transform: scale(1.05);
} */
.product-img-box .v-img {
  transition: transform 0.4s ease;
}

.product-info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

[dir="rtl"] .product-info-box { text-align: right; }
[dir="ltr"] .product-info-box { text-align: left; }

.product-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a1a;
  cursor: pointer;
  line-height: 1.3;
  margin-bottom: 8px;
}

.product-desc {
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  color: #757575;
}

.price-attr-row {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.product-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--brand-color);
}

.attr-wrapper {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.attr-tag {
  background: #f0f0f2;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  color: #424242;
  font-weight: 600;
}

.custom-stepper {
  display: flex;
  align-items: center;
  background: #f2f2f5;
  border-radius: 12px;
  padding: 4px;
}

.qty-circle {
  background: var(--brand-color);
  color: white;
  min-width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 8px;
  font-size: 14px;
}

.stepper-btn { color: #1a1a1a; }

.remove-btn-flow {
  margin-top: -8px;
  margin-right: -8px;
}
[dir="rtl"] .remove-btn-flow {
  margin-right: 0;
  margin-left: -8px;
}

/* Base Flex Rows */
.info-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.info-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.price-attr-group {
  display: flex;
  flex-direction: column;
}

.cart-item-premium {
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.03);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.cart-item-premium:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.item-img-wrapper-premium {
  background: #f8f9fa;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.item-img-premium {
  mix-blend-mode: multiply;
}

.item-name-premium {
  font-size: 20px !important;
  font-weight: 400 !important;
  color: #1a1a1a !important;
  line-height: 1.2;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-option-tag {
  background: #f2f2f5;
  padding: 4px 10px;
  border-radius: 8px;
  margin-left: 5px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
}

.item-price-premium {
  font-size: 1.25rem;
}

.custom-stepper-premium {
  display: inline-flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 30px;
  padding: 3px;
  border: 1px solid rgba(0,0,0,0.05);
}
.qty-display-premium {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-circle-premium {
  font-size: 14px;
}
.stepper-btn-premium {
  color: #4a5568 !important;
}

/* Sidebar Styles */
.summary-desktop-sticky { position: sticky; top: 100px; }
.summary-main-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 40px rgba(0,0,0,0.06) !important;
  border-radius: 28px !important;
  overflow: hidden;
}
.summary-row { display: flex; justify-content: space-between; font-size: 0.95rem; align-items: center; }
.summary-row .label { color: #555; }
.summary-row .value { font-weight: 600; color: #1a1a1a; }

.total-section-premium {
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s ease;
}

.free-shipping-premium { 
  background: #ffffff; 
  border-radius: 24px; 
  padding: 18px; 
  border: 1px solid rgba(255, 255, 255, 0.8); 
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
.custom-progress { border-radius: 10px; }
.total-label { font-size: 0.7rem; letter-spacing: 1.5px; }
.total-price { line-height: 1; }
.checkout-main-btn { 
  text-transform: none; 
  font-weight: 700 !important;
  letter-spacing: 0.5px;
}

/* Transitions */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px); }

/* --- MOBILE SPECIFIC LAYOUT (STRICT TWO-LINE SIDE-BY-SIDE, FLOW-BASED) --- */
@media (max-width: 600px) {
  .cart-item-card {
    padding: 10px;
    min-height: auto;
  }

  .custom-item-layout {
    gap: 10px;
    align-items: flex-start;
  }

  /* Force Image to Right in RTL, Left in LTR */
  [dir="rtl"] .product-img-box { order: 2; }
  [dir="ltr"] .product-img-box { order: 0; }
  
  .product-img-box {
    flex: 0 0 75px;
    max-width: 75px;
    height: 75px;
    padding: 0;
    border-radius: 10px;
  }

  /* Force Info to Left in RTL, Right in LTR */
  [dir="rtl"] .product-info-box { order: 1; text-align: right; }
  [dir="ltr"] .product-info-box { order: 1; text-align: left; }

  .product-info-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 75px;
  }

  /* Line 1: Name & Delete */
  .info-top-row {
    margin-bottom: 2px;
    gap: 6px;
  }

  .product-title {
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 0 !important;
    line-height: 1.2;
    flex: 1;
  }

  .remove-btn-flow {
    flex: 0 0 24px;
    width: 24px !important;
    height: 24px !important;
    margin: -4px 0 0 0;
  }

  /* Line 2: Price/Attrs & Stepper */
  .info-bottom-row {
    align-items: flex-end;
    gap: 6px;
    margin-top: auto;
  }

  .price-attr-group {
    flex: 1;
    align-items: flex-start;
  }
  
  [dir="rtl"] .price-attr-group {
    align-items: flex-end;
  }

  .product-price {
    font-size: 1rem;
    line-height: 1;
    font-weight: 800;
  }

  .attr-wrapper {
    gap: 3px;
    margin-top: 2px;
  }
  
  .attr-tag {
    font-size: 9px;
    padding: 2px 5px;
    border-radius: 4px;
  }

  .custom-stepper {
    flex: 0 0 auto;
    transform: scale(0.75);
    transform-origin: bottom right;
    margin: 0;
    padding: 2px;
  }
  
  [dir="rtl"] .custom-stepper {
    transform-origin: bottom left;
  }

  /* Mobile Summary Enhancements */
  .summary-main-card {
    margin-bottom: 15px !important;
    padding: 15px !important;
    border-radius: 12px !important;
  }

  .summary-main-card .text-h6 {
    font-size: 1rem !important;
    margin-bottom: 15px !important;
  }

  .summary-row {
    font-size: 0.85rem !important;
    margin-bottom: 8px !important;
  }

  .total-row {
    margin-bottom: 20px !important;
  }
  .total-price {
    font-size: 1.5rem !important;
  }

  .mobile-sticky-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    padding: 10px 14px 18px 14px;
    box-shadow: 0 -4px 15px rgba(0,0,0,0.08);
    border-radius: 14px 14px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .mobile-summary-info { min-width: 80px; }
  .mobile-total-label { font-size: 0.65rem; color: #757575; text-transform: uppercase; font-weight: 600; }
  .mobile-total-price { font-size: 1.15rem; font-weight: 800; color: var(--brand-color); }
  .checkout-main-btn { height: 44px !important; font-size: 0.95rem !important; }
  
  .cart-block-wrapper { padding-bottom: 100px; }
  .free-shipping-premium { 
    margin-bottom: 10px; 
    padding: 6px 10px; 
    border-radius: 8px !important;
    border: none;
  }
  .free-shipping-premium .v-icon { font-size: 18px !important; margin-right: 4px !important; }
  .free-shipping-premium .text-subtitle-1 { font-size: 0.75rem !important; line-height: 1.2 !important; color: #1a1a1a; }
  .free-shipping-premium .text-body-2 { font-size: 0.7rem !important; line-height: 1.2 !important; margin-top: 2px; color: var(--brand-color); }
  .custom-progress { height: 4px !important; margin-bottom: 4px !important; }
  .qty-display {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Fade Transition for Qty Loader */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
}
</style>

<style>
.product-img-box .v-img img { object-fit: contain !important; }
</style>`
  },
  {
    path: 'components/blocks/CheckoutProcess.vue',
    name: 'CheckoutProcess.vue',
    language: 'vue',
    code: `<template>
  <div class="checkout-page-clean" :style="{ '--brand-color': brandColor, '--brand-color-rgb': hexToRgb(brandColor) }">
    <div class="checkout-container-clean">
      <div v-if="cartStore.items.length > 0 || step === 5" class="stepper-layout">
        <!-- Premium Stepper -->
        <div v-if="step < 5" class="mb-10 mt-2 px-2 premium-stepper-wrapper">
          <div class="d-flex align-center justify-space-between position-relative">
            <!-- Lines Wrapper to perfectly align between circle centers -->
            <div class="stepper-lines-wrapper">
              <!-- Background Line -->
              <div class="stepper-line-bg"></div>
              <!-- Active Progress Line -->
              <div 
                class="stepper-line-active" 
                :style="{ 
                  width: ((step - 1) / (steps.length - 1)) * 100 + '%', 
                  backgroundColor: brandColor 
                }"
              ></div>
            </div>

            <!-- Stepper Items -->
            <div 
              v-for="(stepName, index) in steps" 
              :key="index" 
              class="stepper-item d-flex flex-column align-center position-relative"
            >
              <div 
                class="stepper-circle d-flex align-center justify-center font-weight-bold transition-all"
                :style="{ 
                  backgroundColor: step >= index + 1 ? brandColor : '#ffffff',
                  color: step >= index + 1 ? '#ffffff' : '#9e9e9e',
                  borderColor: step >= index + 1 ? brandColor : '#e0e0e0',
                  boxShadow: step === index + 1 ? '0 0 0 6px rgba({hexToRgb(brandColor)}, 0.12)' : 'none'
                }"
              >
                <v-icon v-if="step > index + 1" size="18" color="white">mdi-check</v-icon>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span 
                class="stepper-title mt-2 text-center transition-all d-none d-sm-block"
                :style="{ 
                  color: step >= index + 1 ? '#1a1a1a' : '#9e9e9e',
                  fontWeight: step >= index + 1 ? '600' : '400'
                }"
              >
                {{ stepName }}
              </span>
            </div>
          </div>
        </div>

        <v-row class="justify-center">
          <v-col cols="12" md="8" lg="6">

            
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-window v-model="step">
                
                <!-- STEP 1: Customer Info -->


                <v-window-item :value="1">
                  <div class="info-card-clean mb-6">
                    <div class="d-flex align-center mb-6">
                      <v-avatar :style="{ backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.1)' }" size="48" class="me-4">
                        <v-icon :color="brandColor" size="24">mdi-account-details-outline</v-icon>
                      </v-avatar>
                      <div>
                        <h3 class="text-h6 font-weight-medium text-grey-darken-4 mb-1">{{ $t('checkout.customer_info') }}</h3>
                        <div class="text-caption text-grey-darken-1">{{ $t('checkout.customer_info_hint') || 'Please enter your personal details to proceed' }}</div>
                      </div>
                    </div>

                    <v-row>
                      <v-col cols="12">
                        <label class="input-label-clean">{{ $t('checkout.full_name') }}</label>
                        <v-text-field
                          v-model="customer.name"
                          variant="outlined"
                          density="comfortable"
                          :placeholder="$t('checkout.full_name_placeholder')"
                          :rules="[v => !!v || $t('checkout.name_required')]"
                          hide-details="auto"
                          bg-color="white"
                          rounded="lg"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="grey-darken-1">mdi-account-outline</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                      
                      <v-col cols="12">
                        <label class="input-label-clean">{{ $t('checkout.phone') }}</label>
                        <ClientOnly>
                          <vue-tel-input 
                            v-model="customer.phone" 
                            mode="international"
                            dir="ltr" 
                            class="custom-tel-input" 
                            :class="{ 
                              'vti-error': !isPhoneValid && customer.phone,
                              'custom-tel-input-rtl': isRtl,
                              'custom-tel-input-ltr': !isRtl
                            }"
                             :inputOptions="{ 
                               placeholder: $t('checkout.phone_placeholder'),
                               showDialCode: false
                             }"
                            :dropdownOptions="{ disabled: true, showFlags: true }"
                            @on-input="(formatted, info) => onPhoneValidate(info)"
                          />
                        </ClientOnly>
                      </v-col>
                    </v-row>
                    <!-- Step 1 Actions -->
                    <div class="mt-8 d-flex align-center justify-space-between">
                      <v-btn @click="nextStep" :color="brandColor" height="48" width="160" elevation="0" class="font-weight-bold text-none rounded-lg">
                        {{ $t('common.next') }}
                        <template v-slot:prepend><v-icon>{{ isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon></template>
                      </v-btn>
                      <v-btn to="/" variant="text" color="grey-darken-1" height="48" class="font-weight-bold text-none px-4 rounded-lg">
                        {{ $t('cart.continue_shopping') }}
                        <v-icon end>{{ isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right' }}</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-window-item>

                <!-- STEP 2: Delivery & Address -->
                <v-window-item :value="2">
                  <div class="info-card-clean mb-6" v-if="hasHomeDelivery || hasLocalPickup">
                    <div class="d-flex align-center mb-6">
                      <v-avatar :style="{ backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.1)' }" size="48" class="me-4">
                        <v-icon :color="brandColor" size="24">mdi-truck-fast-outline</v-icon>
                      </v-avatar>
                      <div>
                        <h3 class="text-h6 font-weight-medium text-grey-darken-4 mb-1">{{ $t('checkout.delivery_and_address') }}</h3>
                        <div class="text-caption text-grey-darken-1">{{ $t('checkout.delivery_hint') || 'Choose how you want to receive your order' }}</div>
                      </div>
                    </div>
                    
                    <div v-if="hasHomeDelivery && hasLocalPickup" class="delivery-toggle-clean mb-8">
                      <button 
                        type="button"
                        class="delivery-option-card"
                        :class="{ 'active': deliveryMethod === 'delivery' }"
                        :style="deliveryMethod === 'delivery' ? { borderColor: brandColor, background: 'rgba({hexToRgb(brandColor)}, 0.05)' } : {}"
                        @click="deliveryMethod = 'delivery'"
                      >
                        <v-avatar :color="deliveryMethod === 'delivery' ? brandColor : 'grey-lighten-3'" size="40" class="me-3">
                          <v-icon :color="deliveryMethod === 'delivery' ? 'white' : 'grey-darken-1'">mdi-truck-fast-outline</v-icon>
                        </v-avatar>
                        <div class="text-start">
                          <div class="font-weight-bold text-body-2 mb-0">{{ $t('checkout.home_delivery') }}</div>
                          <div class="text-caption text-grey">{{ $t('checkout.home_delivery_desc') || 'Receive order at your door' }}</div>
                        </div>
                      </button>
                      <button 
                        type="button"
                        class="delivery-option-card"
                        :class="{ 'active': deliveryMethod === 'pickup' }"
                        :style="deliveryMethod === 'pickup' ? { borderColor: brandColor, background: 'rgba({hexToRgb(brandColor)}, 0.05)' } : {}"
                        @click="deliveryMethod = 'pickup'"
                      >
                        <v-avatar :color="deliveryMethod === 'pickup' ? brandColor : 'grey-lighten-3'" size="40" class="me-3">
                          <v-icon :color="deliveryMethod === 'pickup' ? 'white' : 'grey-darken-1'">mdi-store-marker-outline</v-icon>
                        </v-avatar>
                        <div class="text-start">
                          <div class="font-weight-bold text-body-2 mb-0">{{ $t('checkout.pickup') }}</div>
                          <div class="text-caption text-grey">{{ $t('checkout.pickup_desc') || 'Pick up from our store' }}</div>
                        </div>
                      </button>
                    </div>
      
                    <!-- Address Section -->
                    <v-expand-transition>
                      <div v-if="deliveryMethod === 'delivery'">
                          <!-- Saved Addresses Carousel -->
                          <div v-if="user && savedAddresses.length > 0 && !showNewAddressForm" class="mb-8">
                            <div class="d-flex align-center justify-space-between mb-2">
                              <label class="section-title-clean mb-0">{{ $t('checkout.saved_addresses') }}</label>
                              <v-btn variant="text" size="small" :color="brandColor" class="text-none" @click="showNewAddressForm = true">
                                <v-icon start>mdi-plus</v-icon>
                                {{ $t('checkout.new_address_btn') }}
                              </v-btn>
                            </div>
                            
                            <div class="saved-addresses-carousel">
                              <div 
                                v-for="addr in savedAddresses" 
                                :key="addr.id"
                                class="saved-address-card"
                                :class="{ 'selected': customer.address?.id === addr.id }"
                                @click="onAddressSelected(addr)"
                              >
                                <div class="d-flex justify-space-between align-start">
                                  <div class="flex-grow-1">
                                    <div class="address-label d-flex align-center">
                                      <v-avatar size="24" :color="customer.address?.id === addr.id ? brandColor : 'grey-lighten-4'" class="me-2">
                                        <v-icon size="14" :color="customer.address?.id === addr.id ? 'white' : 'grey'">mdi-map-marker</v-icon>
                                      </v-avatar>
                                      {{ addr.label || 'Address' }}
                                    </div>
                                    <div class="address-details mt-2">
                                       <div class="font-weight-bold text-grey-darken-3">
                                         <template v-if="addr.city">{{ addr.city?.name }}<template v-if="addr.municipality?.name">, {{ addr.municipality?.name }}</template><template v-if="addr.neighborhood">, {{ addr.neighborhood }}</template></template>
                                         <template v-else>
                                           <div class="d-flex align-center text-primary text-caption font-weight-bold">
                                             <v-icon size="14" class="me-1">mdi-crosshairs-gps</v-icon>
                                            
                                             {{ $te('checkout.map_location') ? $t('checkout.map_location') : 'موقع محدد على الخريطة' }}
                                           </div>
                                         </template>
                                       </div>
                                       <div class="text-caption text-grey-darken-1 mt-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; line-height: 1.4;">
                                         <template v-if="addr.detailed_address">{{ addr.detailed_address }}</template>
                                         <template v-else-if="addr.lat && addr.lng">{{ Number(addr.lat).toFixed(5) }}, {{ Number(addr.lng).toFixed(5) }}</template>
                                       </div>
                                     </div>
                                  </div>
                                  <div v-if="customer.address?.id === addr.id" class="selection-check-corner">
                                    <v-icon color="white" size="14" class="check-icon">mdi-check</v-icon>
                                  </div>
                                </div>
                              </div>

                     
                            </div>
                          </div>
      
                        <!-- New Address Form -->
                        <div v-else-if="showNewAddressForm || !user || savedAddresses.length === 0">
                          <div class="d-flex align-center justify-space-between mb-4" v-if="user && savedAddresses.length > 0">
                            <label class="input-label-clean mb-0 font-weight-bold">{{ $t('checkout.add_new_address') }}</label>
                            <v-btn 
                              variant="outlined" 
                              size="small" 
                              :color="brandColor"
                              class="text-none"
                              @click="showNewAddressForm = false"
                            >
                              <v-icon start size="18">{{ isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon>
                              {{ $t('checkout.back_to_addresses') }}
                            </v-btn>
                          </div>
      
                          <!-- Common Address Fields (Label) -->
                          <v-row v-if="user" class="mb-2">
                            <v-col cols="12">
                              <label class="input-label-clean">{{ $t('checkout.address_label') || 'Address Label' }} <span class="text-error" v-if="addressForm.save_to_account">*</span></label>
                              <v-text-field
                                v-model="addressForm.label"
                                variant="outlined"
                                density="comfortable"
                                :placeholder="$t('checkout.address_label_placeholder') || 'e.g. Home, Office, Gym'"
                                hide-details="auto"
                                bg-color="white"
                                rounded="lg"
                                :rules="addressForm.save_to_account ? [v => !!v || $t('checkout.label_required') || 'Label is required to save address'] : []"
                              >
                                <template v-slot:prepend-inner>
                                  <v-icon color="grey-darken-1">mdi-tag-outline</v-icon>
                                </template>
                              </v-text-field>
                            </v-col>
                          </v-row>

                          <!-- Address Mode Segmented Control -->
                          <div v-if="tenantAddressMode === 'both'" class="segmented-control mb-6">
                            <button 
                              type="button"
                              class="segment-btn"
                              :class="{ 'active': addressMode === 'fields' }"
                              @click="addressMode = 'fields'"
                            >
                              <v-icon size="18">mdi-form-select</v-icon>
                              {{ $t('checkout.fill_fields') }}
                            </button>
                            <button 
                              type="button"
                              class="segment-btn"
                              :class="{ 'active': addressMode === 'map' }"
                              @click="addressMode = 'map'"
                            >
                              <v-icon size="18">mdi-map-marker-radius</v-icon>
                              {{ $t('checkout.select_from_map') }}
                            </button>
                          </div>
      
                          <!-- Map Mode -->
                          <div v-if="addressMode === 'map'" class="mb-4">
                            <GoogleMapPicker
                              v-if="googleMapsApiKey"
                              :api-key="googleMapsApiKey"
                              :initial-lat="addressForm.lat || defaultCoords.lat"
                              :initial-lng="addressForm.lng || defaultCoords.lng"
                              @update:location="onMapLocationSelected"
                            />
                            <div v-else class="map-placeholder border rounded-lg bg-grey-lighten-4 pa-8 text-center">
                              <v-icon size="48" color="grey" class="mb-2">mdi-map-marker-off</v-icon>
                              <div class="text-body-2 text-grey">{{ $t('checkout.map_disabled') }}</div>
                            </div>
                          </div>
      
                          <!-- Fields Mode -->
                          <v-row v-if="addressMode === 'fields'">
                            <v-col cols="12">
                              <label class="input-label-clean">{{ $t('checkout.city') }}</label>
                              <v-autocomplete
                                v-model="addressForm.city_id"
                                :items="cities"
                                item-title="name"
                                item-value="id"
                                variant="outlined"
                                density="comfortable"
                                :placeholder="$t('checkout.select_city')"
                                @update:model-value="loadMunicipalities"
                                hide-details="auto"
                                bg-color="white"
                                rounded="lg"
                                theme="light"
                                :menu-props="{ contentClass: 'checkout-autocomplete-menu', theme: 'light' }"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="12">
                              <label class="input-label-clean">{{ $t('checkout.municipality') }}</label>
                              <v-autocomplete
                                :key="'muni_' + (addressForm.city_id || 'none')"
                                v-model="addressForm.municipality_id"
                                :items="municipalities"
                                item-title="name"
                                item-value="id"
                                variant="outlined"
                                density="comfortable"
                                :placeholder="$t('checkout.select_municipality')"
                                :disabled="!addressForm.city_id"
                                hide-details="auto"
                                bg-color="white"
                                rounded="lg"
                                theme="light"
                                :menu-props="{ contentClass: 'checkout-autocomplete-menu', theme: 'light' }"
                              ></v-autocomplete>
                            </v-col>
                            <v-col cols="12">
                              <label class="input-label-clean">{{ $t('checkout.neighborhood') }}</label>
                              <v-text-field
                                v-model="addressForm.neighborhood"
                                variant="outlined"
                                density="comfortable"
                                :placeholder="$t('checkout.neighborhood_placeholder')"
                                hide-details="auto"
                                bg-color="white"
                                rounded="lg"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                              <label class="input-label-clean">{{ $t('checkout.detailed_address') }}</label>
                              <v-textarea
                                v-model="addressForm.detailed_address"
                                variant="outlined"
                                rows="2"
                                :placeholder="$t('checkout.detailed_address_placeholder')"
                                hide-details="auto"
                                bg-color="white"
                                rounded="lg"
                              ></v-textarea>
                            </v-col>
                          </v-row>

                          <!-- Save to Account Checkbox -->
                          <div v-if="user" class="mt-4 rounded-lg bg-grey-lighten-5 border">
                            <v-checkbox
                              v-model="addressForm.save_to_account"
                              :color="brandColor"
                              hide-details
                              density="comfortable"
                              class="ma-0"
                            >
                              <template v-slot:label>
                                <div class="text-body-2 font-weight-bold text-grey-darken-3">
                                  {{ $t('checkout.save_address_to_account') || 'Save this address to my account for future use' }}
                                </div>
                              </template>
                            </v-checkbox>
                          </div>

                        </div>
                      </div>
                    </v-expand-transition>

                    <!-- Pickup branch message -->
                    <v-expand-transition>
                      <div v-if="deliveryMethod === 'pickup'" class="mt-4 mb-6">
                        <v-card 
                          variant="outlined" 
                          class="rounded-xl pa-6 text-center border-dashed d-flex flex-column align-center justify-center"
                          :style="{ 
                            backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.03)', 
                            borderColor: 'rgba({hexToRgb(brandColor)}, 0.25)' 
                          }"
                        >
                          <v-avatar :color="brandColor" size="56" class="mb-4 shadow-soft">
                            <v-icon color="white" size="28">mdi-store-marker-outline</v-icon>
                          </v-avatar>
                          <h4 class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-2">
                            {{ $t('checkout.pickup_welcome_title') || 'أهلاً وسهلاً بك!' }}
                          </h4>
                          <p class="text-body-2 text-grey-darken-3 font-weight-medium px-4" style="max-width: 450px; line-height: 1.6;">
                            {{ $t('checkout.pickup_welcome_desc') || 'يسعدنا ويشرفنا التعامل معك وننتظرك في فرعنا لاستلام طلبك بكل حب وسرور.' }}
                          </p>
                        </v-card>
                      </div>
                    </v-expand-transition>

                    <div class="mt-8 d-flex align-center justify-space-between">
                      <v-btn @click="nextStep" :color="brandColor" height="48" width="140" elevation="0" class="font-weight-bold text-none rounded-lg">
                        {{ $t('common.next') }}
                        <template v-slot:prepend><v-icon>{{ isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon></template>
                      </v-btn>
                      <v-btn variant="outlined" @click="prevStep" :color="brandColor" height="48" width="140" class="font-weight-bold text-none rounded-lg">
                        {{ $t('common.previous') }}
                        <v-icon end>{{ isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right' }}</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-window-item>

                <!-- STEP 3: Payment Method -->
                <v-window-item :value="3">
                  <div class="info-card-clean">
                    <div class="d-flex align-center mb-6">
                      <v-avatar :style="{ backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.1)' }" size="48" class="me-4">
                        <v-icon :color="brandColor" size="24">mdi-credit-card-outline</v-icon>
                      </v-avatar>
                      <div>
                        <h3 class="text-h6 font-weight-medium text-grey-darken-4 mb-1">{{ $t('checkout.payment_method') }}</h3>
                        <div class="text-caption text-grey-darken-1">{{ $t('checkout.payment_hint') || 'Select your preferred payment method' }}</div>
                      </div>
                    </div>
                    
                    <div class="payment-options-clean">
                      <div 
                        v-for="method in availablePaymentMethods"
                        :key="method.id"
                        class="payment-option-clean"
                        :class="{ 'selected': paymentMethod === method.id }"
                        :style="paymentMethod === method.id ? { borderColor: brandColor, backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.05)' } : {}"
                        @click="paymentMethod = method.id"
                      >
                        <div class="payment-option-content">
                          <v-avatar :color="paymentMethod === method.id ? brandColor : 'grey-lighten-4'" size="40" class="me-3">
                            <v-icon :color="paymentMethod === method.id ? 'white' : 'grey-darken-1'">{{ method.icon }}</v-icon>
                          </v-avatar>
                          <div class="payment-option-text text-start">
                            <div class="payment-title">{{ method.title }}</div>
                            <div class="payment-desc text-caption">{{ method.desc }}</div>
                          </div>
                        </div>
                        <v-icon v-if="paymentMethod === method.id" :color="brandColor">mdi-check-circle</v-icon>
                        <v-icon v-else color="grey-lighten-2">mdi-circle-outline</v-icon>
                      </div>
                    </div>
                    
                    <!-- Bank Transfer Details -->
                    <v-expand-transition>
                      <div 
                        v-if="paymentMethod === 'bank'" 
                        class="bank-details-box mt-4 pa-4 rounded-lg border-dashed"
                        :style="{ backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.04)' }"
                      >
                        <div class="d-flex align-center mb-2">
                          <v-icon :color="brandColor" size="20" class="me-2">mdi-bank-outline</v-icon>
                          <span class="font-weight-bold text-body-2 text-black">{{ $t('checkout.bank_details') }}</span>
                        </div>
                        <div class="text-body-2 text-grey-darken-3" style="white-space: pre-line;">
                          {{ bankDetails }}
                        </div>
                        <v-alert
                          type="info"
                          variant="tonal"
                          density="compact"
                          class="mt-3 text-caption"
                        >
                          {{ $t('checkout.bank_transfer_hint') }}
                        </v-alert>
                      </div>
                    </v-expand-transition>
                    <!-- Step 3 Actions -->
                    <div class="mt-8 d-flex align-center justify-space-between">
                      <v-btn @click="nextStep" :color="brandColor" height="48" width="140" elevation="0" class="font-weight-bold text-none rounded-lg">
                        {{ $t('common.next') }}
                        <template v-slot:prepend><v-icon>{{ isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon></template>
                      </v-btn>
                      <v-btn variant="outlined" @click="prevStep" :color="brandColor" height="48" width="140" class="font-weight-bold text-none rounded-lg">
                        {{ $t('common.previous') }}
                        <v-icon end>{{ isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right' }}</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-window-item>

                <!-- STEP 4: Summary & Confirm -->
                <v-window-item :value="4">
                   <div class="info-card-clean">
                      <div class="d-flex align-center mb-8">
                        <v-avatar :style="{ backgroundColor: 'rgba({hexToRgb(brandColor)}, 0.1)' }" size="48" class="me-4">
                          <v-icon :color="brandColor" size="24">mdi-text-box-check-outline</v-icon>
                        </v-avatar>
                        <div>
                          <h3 class="text-h6 font-weight-medium text-grey-darken-4 mb-1">{{ $t('cart.summary') }}</h3>
                          <div class="text-caption text-grey-darken-1">{{ $t('checkout.summary_hint') || 'Final review of your order details' }}</div>
                        </div>
                        <v-spacer></v-spacer>
                        <v-chip size="small" :color="brandColor" variant="flat" class="text-white font-weight-bold px-4">
                          {{ cartStore.totalItems }} {{ $t('common.items') }}
                        </v-chip>
                      </div>

                      <!-- Order Review Cards -->
                      <v-row class="mb-8">
                        <v-col cols="12" md="6">
                          <div class="review-info-card-premium pa-5">
                            <div class="d-flex align-center justify-space-between mb-4">
                              <div class="d-flex align-center">
                                <div class="review-icon-box me-3" :style="{ backgroundColor: brandColor + '10' }">
                                  <v-icon :color="brandColor" size="20">mdi-account-outline</v-icon>
                                </div>
                                <span class="text-caption font-weight-bold text-uppercase letter-spacing-1 text-grey-darken-1">{{ $t('checkout.customer_info') }}</span>
                              </div>
                              <v-btn variant="text" size="x-small" :color="brandColor" class="text-none font-weight-bold" @click="step = 1">{{ $t('common.edit') || 'Edit' }}</v-btn>
                            </div>
                            <div class="text-body-1 font-weight-bold text-grey-darken-4 mb-1">
                              {{ customer.name }}
                            </div>
                            <div class="text-body-2 text-grey-darken-1 phone-display-ltr">
                               {{ customer.phone }}
                            </div>
                          </div>
                        </v-col>
                        
                        <v-col cols="12" md="6">
                          <div class="review-info-card-premium pa-5">
                            <div class="d-flex align-center justify-space-between mb-4">
                              <div class="d-flex align-center">
                                <div class="review-icon-box me-3" :style="{ backgroundColor: brandColor + '10' }">
                                  <v-icon :color="brandColor" size="20">mdi-truck-outline</v-icon>
                                </div>
                                <span class="text-caption font-weight-bold text-uppercase letter-spacing-1 text-grey-darken-1">{{ $t('checkout.delivery_and_address') }}</span>
                              </div>
                              <v-btn variant="text" size="x-small" :color="brandColor" class="text-none font-weight-bold" @click="step = 2">{{ $t('common.edit') || 'Edit' }}</v-btn>
                            </div>
                            <div class="text-body-1 font-weight-bold text-grey-darken-4">
                              <template v-if="deliveryMethod === 'pickup'">{{ $t('checkout.pickup') }}</template>
                              <template v-else-if="customer.address?.city || addressForm.city_name">
                                {{ (showNewAddressForm || !customer.address)
                                   ? '{addressForm.city_name || ''}{addressForm.municipality_name ? ', ' + addressForm.municipality_name : ''}{addressForm.neighborhood ? ', ' + addressForm.neighborhood : ''} ' 
                                   : '{customer.address.city?.name || ''}{customer.address.municipality?.name ? ', ' + customer.address.municipality.name : ''}{customer.address.neighborhood ? ', ' + customer.address.neighborhood : ''} ' 
                                }}
                              </template>
                              <template v-else>
                                <div class="d-flex align-center text-primary text-caption font-weight-bold">
                                  <v-icon size="14" class="me-1">mdi-crosshairs-gps</v-icon>
                                  {{ $te('checkout.map_location') ? $t('checkout.map_location') : 'موقع محدد على الخريطة' }}
                                </div>
                              </template>
                            </div>
                            <div class="text-caption text-grey-darken-2 mt-2 line-clamp-2">
                              <template v-if="deliveryMethod === 'pickup'">{{ $t('checkout.pickup_desc') }}</template>
                              <template v-else-if="(showNewAddressForm || !customer.address) ? addressForm.detailed_address : customer.address?.detailed_address">
                                {{ (showNewAddressForm || !customer.address) ? addressForm.detailed_address : customer.address?.detailed_address }}
                              </template>
                              <template v-else-if="(showNewAddressForm || !customer.address) ? (addressForm.lat && addressForm.lng) : (customer.address?.lat && customer.address?.lng)">
                                {{ Number((showNewAddressForm || !customer.address) ? addressForm.lat : customer.address?.lat).toFixed(5) }}, {{ Number((showNewAddressForm || !customer.address) ? addressForm.lng : customer.address?.lng).toFixed(5) }}
                              </template>
                            </div>
                          </div>
                        </v-col>

                        <v-col cols="12">
                          <div class="review-info-card-premium pa-5">
                            <div class="d-flex align-center justify-space-between mb-4">
                              <div class="d-flex align-center">
                                <div class="review-icon-box me-3" :style="{ backgroundColor: brandColor + '10' }">
                                  <v-icon :color="brandColor" size="20">mdi-credit-card-outline</v-icon>
                                </div>
                                <span class="text-caption font-weight-bold text-uppercase letter-spacing-1 text-grey-darken-1">{{ $t('checkout.payment_method') }}</span>
                              </div>
                              <v-btn variant="text" size="x-small" :color="brandColor" class="text-none font-weight-bold" @click="step = 3">{{ $t('common.edit') || 'Edit' }}</v-btn>
                            </div>
                            <div class="d-flex align-center">
                              <v-icon :color="brandColor" size="24" class="me-3">
                                {{ availablePaymentMethods.find(m => m.id === paymentMethod)?.icon || 'mdi-cash' }}
                              </v-icon>
                              <div class="text-body-1 font-weight-bold text-grey-darken-4">
                                {{ availablePaymentMethods.find(m => m.id === paymentMethod)?.title }}
                              </div>
                            </div>
                          </div>
                        </v-col>
                      </v-row>

                      <!-- Items List - Matching SimpleCart Style -->
                      <div class="review-items-container-premium mb-8">
                        <div class="d-flex align-center mb-5 px-2">
                          <v-icon color="grey-darken-1" size="20" class="me-2">mdi-package-variant-closed</v-icon>
                          <span class="text-caption font-weight-bold text-uppercase letter-spacing-1 text-grey-darken-1">{{ $t('cart.items') }}</span>
                        </div>
                        
                        <div class="summary-items-list-premium">
                          <div v-for="item in cartStore.items" :key="item.id" class="checkout-item-premium d-flex pa-4 mb-4 bg-white">
                            <!-- Item Image -->
                            <div class="checkout-item-img-box rounded-xl" :style="{ backgroundColor: '#f8f9fa' }">
                               <v-img :src="getOptimizedUrl(item.image || item.image_url)" contain class="pa-1 item-img-blend"></v-img>
                            </div>
                            
                            <!-- Item Info -->
                            <div class="flex-grow-1 ps-4 d-flex flex-column justify-center">
                              <div class="text-body-1 font-weight-bold text-grey-darken-4 mb-1 line-clamp-1">{{ item.name }}</div>
                              <div class="text-caption text-grey-darken-1">
                                {{ item.quantity }} × {{ formatPrice(item.price) }}
                              </div>
                            </div>
                            
                            <!-- Item Price -->
                            <div class="text-body-1 font-weight-bold text-grey-darken-4 ms-auto ps-3 d-flex align-center checkout-item-price" :style="{ color: brandColor }">
                              {{ formatPrice(item.price * item.quantity) }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Final Cost Breakdown - Matching SimpleCart Style -->
                      <div class="final-breakdown-premium-glass pa-6 pa-md-8 rounded-3xl mb-8">
                        <div class="summary-row-premium d-flex justify-space-between mb-4">
                          <div class="d-flex align-center">
                            <v-icon size="18" class="me-2 text-grey">mdi-receipt-text-outline</v-icon>
                            <span class="text-body-1 text-grey-darken-1 font-weight-medium">{{ $t('cart.subtotal') }}</span>
                          </div>
                          <span class="text-body-1 font-weight-bold text-grey-darken-4 summary-value-premium">{{ formatPrice(cartStore.totalPrice) }}</span>
                        </div>
                        
                        <div class="summary-row-premium d-flex justify-space-between mb-4">
                          <div class="d-flex align-center">
                            <v-icon size="18" class="me-2 text-grey">mdi-truck-delivery-outline</v-icon>
                            <span class="text-body-1 text-grey-darken-1 font-weight-medium">{{ $t('cart.shipping') }}</span>
                          </div>
                          <span v-if="shippingCost === 0" class="text-body-1 font-weight-bold text-success summary-value-premium">{{ $t('common.free') }}</span>
                          <span v-else class="text-body-1 font-weight-bold text-grey-darken-4 summary-value-premium">{{ formatPrice(shippingCost) }}</span>
                        </div>

                        <div class="summary-row-premium d-flex justify-space-between mb-6">
                          <div class="d-flex align-center">
                            <v-icon size="18" class="me-2 text-grey">mdi-shield-check-outline</v-icon>
                            <span class="text-body-1 text-grey-darken-1 font-weight-medium">{{ $t('cart.taxes') || 'Taxes' }}</span>
                          </div>
                          <span class="text-body-1 font-weight-bold text-info">{{ $t('cart.included') || 'Included' }}</span>
                        </div>
                        
                        <v-divider class="mb-8 opacity-10"></v-divider>

                        <div class="total-section-premium-modern pa-3 rounded-2xl" :style="{ backgroundColor: brandColor + '08' }">
                          <div class="d-flex justify-space-between align-center">
                            <div class="text-start">
                              <div class="total-label-premium text-uppercase font-weight-black mb-1 letter-spacing-1" :style="{ color: brandColor, fontSize: '0.75rem' }">
                                {{ $t('cart.total') }}
                              </div>
                              <div class="text-caption text-grey-darken-1">{{ $t('cart.including_vat') }}</div>
                            </div>
                            <div class="text-h4 font-weight-black" :style="{ color: '#1a1a1a' }">
                              {{ formatPrice(grandTotal) }}
                            </div>
                          </div>
                        </div>
                      </div>

                    <!-- Step 4 Actions -->
                    <div class="mt-10">
                      <v-btn
                        block
                        :color="brandColor"
                        height="54"
                        elevation="0"
                        class="premium-submit-btn text-none mb-6 rounded-xl font-weight-bold"
                        :loading="orderStore.loading"
                        @click="submitOrder"
                      >
                        <span class="text-h6">{{ $t('checkout.complete_order') }}</span>
                        <v-icon end class="ms-3 submit-icon-animate">{{ isRtl ? 'mdi-arrow-left-circle' : 'mdi-arrow-right-circle' }}</v-icon>
                      </v-btn>

                      <div class="d-flex align-center justify-space-between">
                        <v-btn variant="text" @click="prevStep" :color="brandColor" height="50" class="font-weight-bold text-none px-6 rounded-pill">
                          <v-icon start>{{ isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon>
                          {{ $t('common.previous') }}
                        </v-btn>
                        <v-btn to="/" variant="text" color="grey-darken-1" height="50" class="font-weight-medium text-none px-6 rounded-pill">
                          <v-icon start>mdi-store-outline</v-icon>
                          {{ $t('cart.continue_shopping') }}
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-window-item>

                <!-- STEP 5: Success State -->
                <v-window-item :value="5">
                  <div class="success-container-premium py-12 px-6 text-center">
                    <div class="success-icon-wrapper mb-8">
                      <div class="success-circle-bg" :style="{ backgroundColor: brandColor + '15' }"></div>
                      <v-icon :color="brandColor" size="80" class="success-icon-animate">mdi-check-decagram</v-icon>
                    </div>
                    
                    <h2 class="text-h4 font-weight-black text-grey-darken-4 mb-4">{{ $t('checkout.order_success') || 'Order Received!' }}</h2>
                    <p class="text-body-1 text-grey-darken-1 mb-10 mx-auto" style="max-width: 400px;">
                      {{ $t('checkout.success_thank_you') || 'Thank you for your order! We have received your request and will start processing it immediately.' }}
                    </p>

                    <v-btn
                      to="/"
                      :color="brandColor"
                      height="56"
                      elevation="0"
                      class="text-none px-12 rounded-xl font-weight-bold"
                      style="border-radius: 100px !important;"
                    >
                      <v-icon start class="me-2">mdi-store-outline</v-icon>
                      {{ $t('cart.continue_shopping') }}
                    </v-btn>
                  </div>
                </v-window-item>

              </v-window>

              <!-- Actions/Buttons -->
                  <!-- Old actions removed -->

            </v-form>
          </v-col>
        </v-row>
      </div>

      <!-- Empty State: Premium Redesign (Matched with CartSimple) -->
      <div v-else class="empty-cart-premium py-16">
        <div class="empty-content-wrapper position-relative">
          <!-- Decorative Background Blob -->
          <div class="empty-blob" :style="{ backgroundColor: brandColor + '10' }"></div>
          
          <div class="empty-content text-center position-relative">
            <div class="empty-icon-box mb-8">
              <v-icon size="120" :color="brandColor" class="empty-icon-main">mdi-cart-outline</v-icon>
              <div class="icon-pulse" :style="{ backgroundColor: brandColor }"></div>
            </div>
            
            <h2 class="empty-title text-h3 font-weight-black mb-4">
              {{ $t('cart.empty_title') || 'Your cart is empty' }}
            </h2>
            
            <p class="empty-subtitle text-h6 text-grey-darken-1 mb-10 mx-auto" style="max-width: 500px; line-height: 1.6;">
              {{ $t('cart.empty_subtitle') || 'Start shopping to fill it up!' }}
            </p>
            
            <v-btn
              to="/"
              size="x-large"
              height="64"
              rounded="pill"
              elevation="12"
              :color="brandColor"
              class="start-shopping-btn px-12 text-white font-weight-black"
            >
              <v-icon start class="mr-2">mdi-store-outline</v-icon>
              {{ $t('cart.continue_shopping') || 'Start Shopping' }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar Removed: Using global AppSnackbar -->
  </div>
</template>

<script setup>
const cartStore = useCartStore()
const orderStore = useOrderStore()
const tenantStore = useTenantStore()
const user = useSupabaseUser()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const { t, locale } = useI18n()
const { success: showSuccess, error: showError } = useSnackbar()
const isRtl = computed(() => locale.value === 'ar')

const img = useImage()
const getOptimizedUrl = (url) => {
  if (!url || url.includes('placeholder.com')) return url
  return img(url, { width: 150, quality: 75, format: 'webp' })
}

const form = ref(null)
const valid = ref(false)
const paymentMethod = ref('') // Will be set dynamically
const deliveryMethod = ref('') // Will be set dynamically
const showNewAddressForm = ref(false)

// Stepper Logic
const step = ref(1)
const steps = computed(() => [
  t('checkout.customer_info'),
  t('checkout.delivery_and_address'),
  t('checkout.payment_method'),
  t('cart.summary')
])

async function nextStep() {
  if (step.value === 1) {
    // Validate Step 1: Name and Phone
    if (!customer.value.name || !customer.value.phone || !isPhoneValid.value) {
      const errorMsg = (!isPhoneValid.value && customer.value.phone) 
        ? t('checkout.phone_invalid') 
        : t('checkout.fill_required_data')
      showError(errorMsg)
      return
    }
    step.value = 2
  } else if (step.value === 2) {
    // Validate Step 2: Delivery Method and Address
    if (!deliveryMethod.value) {
      showError(t('checkout.fill_required_data'))
      return
    }
    
    if (deliveryMethod.value === 'delivery') {
      if (!customer.value.address && !addressForm.value.detailed_address && !addressForm.value.lat) {
        showError(t('checkout.complete_address_data'))
         return
      }
       // If form is shown, validate it briefly
       if (showNewAddressForm.value || !user.value || savedAddresses.value.length === 0) {
          // [NEW] Validate Label if saving to account
          if (user.value && addressForm.value.save_to_account && !addressForm.value.label) {
            showError(t('checkout.label_required') || 'Label is required to save address')
            return
          }

          // Ensure address_type is synced with UI mode before validation
          addressForm.value.address_type = addressMode.value

          if (addressForm.value.address_type === 'fields') {
             if (!addressForm.value.city_id) {
               showError(t('checkout.complete_address_data'))
               return
             }
             // Store names for summary
             const city = cities.value.find(c => c.id === addressForm.value.city_id)
             const muni = municipalities.value.find(m => m.id === addressForm.value.municipality_id)
             if (city) addressForm.value.city_name = city.name
             if (muni) addressForm.value.municipality_name = muni.name
          } else if (addressForm.value.address_type === 'map') {
             if (!addressForm.value.lat || !addressForm.value.lng) {
               showError(t('checkout.select_location') || 'Please select your location on the map')
               return
             }
          }
       }
    }
    step.value = 3
  } else if (step.value === 3) {
    // Validate Step 3: Payment
    if (!paymentMethod.value) {
       showError(t('checkout.fill_required_data'))
       return
    }
    step.value = 4
  }
  smoothScrollToTop()
}

function prevStep() {
  if (step.value > 1) {
    step.value--
    smoothScrollToTop()
  }
}

// Custom smooth scroll to top with controllable duration
function smoothScrollToTop() {
  const duration = 800; // Duration in ms (Higher = Slower)
  const start = window.pageYOffset;
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

  const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
  const destination = 0;

  function scroll() {
    const now = 'now' in window.performance ? performance.now() : new Date().getTime();
    const time = Math.min(1, ((now - startTime) / duration));
    const timeFunction = (t) => t * (2 - t); // easeOutQuad
    window.scroll(0, Math.ceil((timeFunction(time) * (destination - start)) + start));

    if (window.pageYOffset === destination || (time === 1)) {
      return;
    }
    requestAnimationFrame(scroll);
  }

  scroll();
}

const customer = ref({
  name: '', // Will be hydrated from store_customers if logged in
  phone: '', // Will be hydrated from store_customers if logged in
  address: null
})

const rawPhone = ref('')
const isPhoneValid = ref(false)
function onPhoneValidate(info) {
  isPhoneValid.value = !!(info?.valid || info?.isValid)
  if (info && info.number) {
    rawPhone.value = info.number.replace(/[^\d+]/g, '')
  } else {
    rawPhone.value = ''
  }
}

watch(() => customer.value.phone, (newVal) => {
  if (newVal && newVal.includes('+')) {
    rawPhone.value = newVal.replace(/[^\d+]/g, '')
  }
}, { immediate: true })

const addressForm = ref({
  address_type: 'fields', // 'fields' or 'map'
  city_id: null,
  municipality_id: null,
  neighborhood: '',
  detailed_address: '',
  lat: null,
  lng: null,
  label: '', // Added for saving address
  save_to_account: false // Added for saving address
})

const addressMode = ref('fields') // Toggle between 'fields' and 'map'
const tenantAddressMode = computed(() => tenantStore.themeConfig?.address_mode || 'both')

watch(tenantAddressMode, (newMode) => {
  if (newMode === 'fields' || newMode === 'map') {
    addressMode.value = newMode
  } else {
    addressMode.value = 'fields'
  }
}, { immediate: true })
const cities = ref([])
const municipalities = ref([])
const savedAddresses = ref([])
const allDistrictsData = ref([]) // Cache all districts for filtering

const hasHomeDelivery = computed(() => tenantStore.themeConfig?.home_delivery ?? true)
const hasLocalPickup = computed(() => tenantStore.themeConfig?.local_pickup ?? true)

const googleMapsApiKey = config.public.googleMapsApiKey

// Watch address mode changes
watch(addressMode, (newMode) => {
  addressForm.value.address_type = newMode
  
  // Clear opposite mode data when switching
  if (newMode === 'map') {
    addressForm.value.city_id = null
    addressForm.value.municipality_id = null
    addressForm.value.neighborhood = ''
  } else {
    addressForm.value.lat = null
    addressForm.value.lng = null
  }
})

// Handle map location selection
const onMapLocationSelected = (location) => {
  addressForm.value.lat = location.lat
  addressForm.value.lng = location.lng
  console.log('Map location selected:', location)
}
const defaultCoords = computed(() => {
  const country = tenantStore.tenant?.settings?.default_country || 'TR'
  if (country === 'EG') {
    return { lat: 30.0444, lng: 31.2357 } // Cairo, Egypt
  }
  if (country === 'SY') {
    return { lat: 33.5138, lng: 36.2765 } // Damascus, Syria
  }
  return { lat: 39.9334, lng: 32.8597 } // Ankara, Turkey
})

const brandColor = computed(() => {
  return tenantStore.themeConfig?.brand_color || '#FF5722'
})

const hexToRgb = (hex) => {
  // Remove hash if present
  hex = hex.replace('#', '')
  
  // Parse r, g, b
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return '{r}, {g}, {b} '
}

const availablePaymentMethods = computed(() => {
  const methods = []
  const settings = tenantStore.themeConfig

  // 1. Cash on Delivery (check multiple possible keys)
  if (settings?.payment_options?.cash_on_delivery || settings?.cod_enabled || settings?.payment_methods?.includes('cod')) {
    methods.push({
      id: 'cod',
      title: t('checkout.cod'),
      desc: t('checkout.cod_desc'),
      icon: 'mdi-cash-multiple',
      color: 'success'
    })
  }

  // 2. Bank Transfer
  if (settings?.payment_options?.bank_transfer || settings?.bank_enabled || settings?.payment_methods?.includes('bank')) {
    methods.push({
      id: 'bank',
      title: t('checkout.bank'),
      desc: t('checkout.bank_desc'),
      icon: 'mdi-bank',
      color: 'info'
    })
  }
  
  // 3. WhatsApp Checkout
  if (settings?.payment_options?.whatsapp || settings?.whatsapp_ordering || settings?.payment_methods?.includes('whatsapp')) {
    methods.push({
      id: 'whatsapp',
      title: t('checkout.whatsapp'),
      desc: t('checkout.whatsapp_desc'),
      icon: 'mdi-whatsapp',
      color: 'success'
    })
  }

  // Fallback if no methods configured
  if (methods.length === 0) {
    methods.push({
      id: 'cod',
      title: t('checkout.cod'),
      desc: t('checkout.cod_desc'),
      icon: 'mdi-cash-multiple',
      color: 'success'
    })
  }

  return methods
})

// Automatically select first available option
watchEffect(() => {
  // Set default payment method if not set
  if (!paymentMethod.value && availablePaymentMethods.value.length > 0) {
    paymentMethod.value = availablePaymentMethods.value[0].id
  }
  
  // Set default delivery method based on availability
  if (!deliveryMethod.value) {
    if (hasHomeDelivery.value) {
      deliveryMethod.value = 'delivery'
    } else if (hasLocalPickup.value) {
      deliveryMethod.value = 'pickup'
    } else {
      deliveryMethod.value = 'delivery' // Fallback
    }
  }
})

const shippingCost = computed(() => {
  const s = tenantStore.themeConfig
  if (!s || s.shipping_mode === 'free' || deliveryMethod.value === 'pickup') return 0
  if (s.shipping_mode === 'fixed') return Number(s.shipping_cost) || 0
  if (s.shipping_mode === 'conditional') {
    return cartStore.totalPrice >= (Number(s.free_shipping_threshold) || 0) ? 0 : (Number(s.shipping_cost) || 0)
  }
  return 0
})

const grandTotal = computed(() => cartStore.totalPrice + shippingCost.value)

const bankDetails = computed(() => tenantStore.themeConfig?.bank_details || t('checkout.bank_details_missing'))

const onAddressSelected = (addr) => {
  customer.value.address = addr
  showNewAddressForm.value = false
}

const loadSavedAddresses = async () => {
  const userId = user.value?.id || user.value?.sub
  if (!userId || !tenantStore.tenant?.id) return
  const { data } = await client.from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('tenant_id', tenantStore.tenant.id)
    .order('is_default', { ascending: false })
    
  let hydratedData = data || []
  
  // Hydrate city and municipality names from the API
  if (hydratedData.length > 0) {
    try {
      // Ensure provinces are loaded
      if (cities.value.length === 0) await loadCities()
      
      // Ensure districts are loaded
      if (!allDistrictsData.value || allDistrictsData.value.length === 0) {
        const country = tenantStore.tenant?.settings?.default_country || 'TR'
        let url = 'https://api.turkiyeapi.dev/v1/districts'
        if (country === 'EG') url = '/data/egypt.json'
        if (country === 'SY') url = '/data/syria.json'

        const response = await fetch(url)
        if (response.ok) {
          const result = await response.json()
          allDistrictsData.value = country === 'TR' ? result.data : result.districts
        }
      }
      
      // Map the names
      hydratedData = hydratedData.map(addr => {
        const cityObj = cities.value.find(c => c.id === addr.city_id)
        const muniObj = allDistrictsData.value?.find(m => m.id === addr.municipality_id)
        
        return {
          ...addr,
          city: cityObj ? { name: cityObj.name } : null,
          municipality: muniObj ? { name: muniObj.name } : null,
          city_name: cityObj ? cityObj.name : null,
          municipality_name: muniObj ? muniObj.name : null,
          neighborhood: addr.neighborhood,
          address_type: (addr.lat && addr.lng && !addr.city_id) ? 'map' : 'fields'
        }
      })
    } catch (e) {
      console.error('Failed to hydrate address names:', e)
    }
  }

  savedAddresses.value = hydratedData
  if (savedAddresses.value.length > 0) {
    onAddressSelected(savedAddresses.value[0])
  }
}

const loadCities = async () => {
  try {
    const country = tenantStore.tenant?.settings?.default_country || 'TR'
    let url = 'https://api.turkiyeapi.dev/v1/provinces'
    if (country === 'EG') url = '/data/egypt.json'
    if (country === 'SY') url = '/data/syria.json'

    const response = await fetch(url)
    if (!response.ok) {
      console.error('Error fetching provinces:', response.statusText)
      return
    }
    const result = await response.json()
    
    // Only extract province ID and name, ignore embedded districts
    const provincesList = country === 'TR' ? result.data : result.provinces
    cities.value = provincesList.map(province => ({
      id: province.id,
      name: province.name
    }))
    
    console.log('Loaded {cities.value.length} provinces for {country}')
  } catch (error) {
    console.error('Exception loading cities:', error)
  }
}

const loadMunicipalities = async (cityId) => {
  // Reset municipalities and selected municipality when city changes
  municipalities.value = []
  addressForm.value.municipality_id = null
  
  if (!cityId) return
  
  try {
    // Load all districts once and cache them
    if (!allDistrictsData.value || allDistrictsData.value.length === 0) {
      const country = tenantStore.tenant?.settings?.default_country || 'TR'
      let url = 'https://api.turkiyeapi.dev/v1/districts'
      if (country === 'EG') url = '/data/egypt.json'
      if (country === 'SY') url = '/data/syria.json'

      const response = await fetch(url)
      if (!response.ok) {
        console.error('Error fetching districts:', response.statusText)
        return
      }
      const result = await response.json()
      allDistrictsData.value = country === 'TR' ? result.data : result.districts
    }
    
    // Filter districts by selected province
    municipalities.value = allDistrictsData.value
      .filter(district => district.provinceId === cityId)
      .map(district => ({
        id: district.id,
        name: district.name
      }))
      
    console.log('Loaded {municipalities.value.length} districts for province {cityId}')
  } catch (error) {
    console.error('Exception loading municipalities:', error)
  }
}

const formatPrice = (p) => {
  const currency = tenantStore.tenant?.settings?.currency || ''
  return '{currency} {p.toFixed(0)} '
}

async function submitOrder() {
  if (form.value) {
    const { valid: v } = await form.value.validate()
    if (!v) {
      showError(t('checkout.fill_required_data'))
      return
    }
  }

  let addr = null
  if (deliveryMethod.value === 'delivery') {
    if (user.value && !showNewAddressForm.value && customer.value.address) {
      addr = customer.value.address
    } else {
      addr = { ...addressForm.value, is_new: true }
      
      // Validate based on address type
      if (addressForm.value.address_type === 'map') {
        if (!addr.lat || !addr.lng) {
          showError(t('checkout.select_location'))
          return
        }
      } else {
        if (!addr.city_id || !addr.detailed_address) {
          showError(t('checkout.complete_address_data'))
          return
        }
        
        // [New Logic] Inject Names for snapshotting
        const cityObj = cities.value.find(c => c.id === addr.city_id)
        const muniObj = municipalities.value.find(m => m.id === addr.municipality_id)
        
        if (cityObj) addr.city_name = cityObj.name
        if (muniObj) addr.municipality_name = muniObj.name
      }
    }
  } else {
    addr = { type: 'pickup' }
  }

  const data = {
    tenant_id: tenantStore.tenant.id,
    customer_name: customer.value.name,
    customer_phone: rawPhone.value || customer.value.phone,
    customer_address: addr,
    delivery_method: deliveryMethod.value,
    payment_method: paymentMethod.value,
    shipping_cost: shippingCost.value,
    currency: tenantStore.tenant?.settings?.currency
  }

  const res = await orderStore.createOrder(data)
  if (res.success) {
    showSuccess(t('checkout.order_success'))

    if (paymentMethod.value === 'whatsapp') {
      const link = orderStore.getWhatsAppLink(tenantStore.themeConfig.whatsapp_number, customer.value.name)
      window.open(link, '_blank')
    }
    step.value = 5
    cartStore.clearCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    showError(res.error)
  }
}

const loadCustomerProfile = async () => {
  console.log('⚡ loadCustomerProfile Triggered!')
  
  // Wait a tiny bit for auth state to settle
  const { data: { session } } = await client.auth.getSession()
  
  let activeUserId = user.value?.id || session?.user?.id
  let activeUserMeta = user.value?.user_metadata || session?.user?.user_metadata
  
  if (!activeUserId) {
    const { data: authData } = await client.auth.getUser()
    activeUserId = authData.user?.id
    activeUserMeta = authData.user?.user_metadata
  }

  console.log('User ID for checkout:', activeUserId)
  console.log('Tenant ID for checkout:', tenantStore.tenant?.id)

  if (activeUserId && tenantStore.tenant?.id) {
    try {
      let fullName = ''
      let phone = ''

      // 1. Try fetching from store_customers first
      const { data: customerData, error: customerError } = await client
        .from('store_customers')
        .select('first_name, last_name, phone_number')
        .eq('project_id', tenantStore.tenant.id)
        .eq('profile_id', activeUserId)
        .maybeSingle() // Use maybeSingle to avoid 406/PGRST116 error if no record exists
        
      if (customerData) {
        fullName = [customerData.first_name, customerData.last_name].filter(Boolean).join(' ')
        phone = customerData.phone_number || ''
      }

      // 2. If name is still empty (no record, or empty names), fetch from profiles
      if (!fullName) {
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', activeUserId)
            .single()

          if (profile) {
            fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
          }
        } catch (profileErr) {
          console.warn('Could not fetch profile fallback:', profileErr)
        }
      }

      // 3. If STILL empty (e.g. old account before the register fix), try to find ANY store_customers record they have
      if (!fullName) {
        try {
          const { data: anyStoreCustomer } = await client
            .from('store_customers')
            .select('first_name, last_name, phone_number')
            .eq('profile_id', activeUserId)
            .not('first_name', 'is', null)
            .not('first_name', 'eq', '')
            .limit(1)
            .maybeSingle()
            
          if (anyStoreCustomer) {
            fullName = [anyStoreCustomer.first_name, anyStoreCustomer.last_name].filter(Boolean).join(' ')
            if (!phone) phone = anyStoreCustomer.phone_number || ''
          }
        } catch (anyErr) {
          console.warn('Could not fetch any previous store profile fallback:', anyErr)
        }
      }

      // Set the values with metadata as a final fallback
      customer.value.name = fullName || activeUserMeta?.full_name || ''
      customer.value.phone = phone || activeUserMeta?.phone || ''

    } catch (err) {
      console.error('Failed to load customer profile for checkout', err)
      customer.value.name = activeUserMeta?.full_name || ''
      customer.value.phone = activeUserMeta?.phone || ''
    }
  } else {
    // Reset if no user
    customer.value.name = ''
    customer.value.phone = ''
  }
}

// Watch user state to hydrate customer data (handles async auth)
watch(() => user.value, () => {
  loadCustomerProfile()
  loadSavedAddresses() // Fix: Load addresses when user is ready
}, { immediate: true })

onMounted(() => {
  loadSavedAddresses()
  loadCities()
})
</script>

<style scoped>
.checkout-page-clean {
  background: #f2f2f5;
  /* min-height: 100vh; */
  padding: 20px 0 60px;
  font-family: system-ui, -apple-system, sans-serif;
  direction: v-bind(isRtl ? 'rtl' : 'ltr');
}

.checkout-container-clean {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Empty Cart Premium Styles (from CartSimple) */
.empty-cart-premium {
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
  width: 300px;
  height: 300px;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  filter: blur(40px);
  animation: blob-animate 10s infinite alternate;
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
  animation: float 3s ease-in-out infinite;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  animation: pulse 2s infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.start-shopping-btn {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 1px;
}

.start-shopping-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0,0,0,0.15) !important;
}

.empty-title {
  color: #1a1a1a;
  letter-spacing: -1px;
}

/* Premium Stepper Styles */
.premium-stepper-wrapper {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stepper-lines-wrapper {
  position: absolute;
  top: 18px; /* نصف ارتفاع الدائرة تقريباً */
  inset-inline-start: 40px; /* نصف عرض الـ stepper-item */
  inset-inline-end: 40px;
  height: 4px;
  z-index: 1;
}
.total-label-premium {
  font-size: 18px !important;
}

.stepper-line-bg {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  inset-inline-end: 0;
  height: 100%;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.stepper-line-active {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  height: 100%;
  border-radius: 4px;
  z-index: 2;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stepper-item {
  z-index: 3;
  width: 80px;
}

.stepper-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid;
  font-size: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: white; /* fallback */
}

.stepper-title {
  font-size: 12px;
  line-height: 1.2;
  width: max-content;
  max-width: 100px;
}

.transition-all {
  transition: all 0.4s ease;
  height: 40px;
}

/* Header */
.checkout-header-clean {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn {
  color: #666;
}

.page-title-clean {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* Info Cards */
.info-card-clean {
  background: #ffffff !important;
  border-radius: 16px !important;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: start;
}

.section-title-clean {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.input-label-clean {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
  text-align: start;
}

/* Delivery Toggle */
.delivery-toggle-clean {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.delivery-option-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1a1a1a !important;
}

.delivery-option-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
}

.delivery-option-card.active {
  border-color: var(--brand-color);
  box-shadow: 0 8px 20px rgba(var(--brand-color-rgb), 0.1);
}

/* Segmented Control */
.segmented-control {
  display: flex;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 12px;
  gap: 8px;
}

.segment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  background: transparent;
}

.segment-btn.active {
  background: white;
  color: var(--brand-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.segment-btn:not(.active):hover {
  background: rgba(0,0,0,0.03);
}



/* Saved Addresses */
.saved-addresses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

/* Saved Addresses Carousel */
.saved-addresses-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 4px 20px 4px;
  margin: 0 -4px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.saved-addresses-carousel::-webkit-scrollbar {
  height: 6px;
}

.saved-addresses-carousel::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.saved-addresses-carousel::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.saved-addresses-carousel::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

.saved-address-card {
  flex: 0 0 280px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
}

.add-new-quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e0e0e0;
  background: #fafafa;
}

.saved-address-card.selected {
  border-color: var(--brand-color);
  background: rgba(var(--brand-color-rgb), 0.03);
}

.saved-address-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
}

.saved-address-card.selected:hover {
  border-color: var(--brand-color);
}


.selection-check-corner {
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  width: 24px;
  height: 24px;
  background: var(--brand-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.selection-check-corner .check-icon {
  font-size: 14px !important;
}

/* Autocomplete Menu Fix */
.checkout-autocomplete-menu,
.checkout-autocomplete-menu .v-list,
.checkout-autocomplete-menu .v-theme--light.v-list {
  background: white !important;
  background-color: white !important;
  color: #333 !important;
  border-radius: 12px !important;
}

.checkout-autocomplete-menu {
  box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
  border: 1px solid rgba(0,0,0,0.05) !important;
}

.checkout-autocomplete-menu .v-list-item {
  border-radius: 8px !important;
  margin: 4px !important;
  color: #333 !important;
}

.checkout-autocomplete-menu .v-list-item--active {
  background: rgba(var(--brand-color-rgb), 0.1) !important;
  color: var(--brand-color) !important;
}

/* Step 4 Premium Styles */
.review-info-card {
  border: 1px solid #f0f0f5;
  border-radius: 16px;
  padding: 16px;
  height: 100%;
  transition: all 0.4s ease;
}

.review-info-card:hover {
  border-color: var(--brand-color);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-8px);
}

.border-b-light {
  border-bottom: 1px solid #f0f0f5;
}

.border-b-light:last-child {
  border-bottom: none !important;
}


.max-h-300 {
  max-height: 300px;
}

.overflow-y-auto {
  overflow-y: auto;
}

.review-items-box {
  background: #ffffff;
  border: 1px solid #f0f0f5;
  border-radius: 20px;
  padding: 20px;
}

.final-breakdown {
  position: relative;
  overflow: hidden;
}

.summary-card-clean {
  position: relative;
}

.qty-badge {
  position: absolute;
  top: -8px;
  inset-inline-end: -8px;
  background: v-bind(brandColor);
  color: white;
  font-size: 11px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
}

.phone-display-ltr {
  direction: ltr !important;
  display: inline-block;
  unicode-bidi: plaintext;
  text-align: end;
}

[dir="rtl"] .phone-display-ltr {
  text-align: right;
}








.address-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.address-details {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

/* Payment Options */
.payment-options-clean {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option-clean {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.4s;
}
.payment-option-clean:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-8px);
}

.payment-option-clean.selected {
  border-color: var(--brand-color);
  background: rgba(var(--brand-color-rgb), 0.05);
}

.payment-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-option-text {
  text-align: right;
}

.payment-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.payment-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* Summary Sidebar */
.summary-sticky {
  position: sticky;
  top: 20px;
}

.summary-card-clean {
  background: #ffffff !important;
  border-radius: 16px !important;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-title-main {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.summary-count-badge {
  display: inline-block;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 16px;
}

/* Summary Items */
.summary-items-clean {
  margin: 16px 0;
}

.summary-item-clean {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.summary-item-img {
  border-radius: 12px;
  flex-shrink: 0;
  max-width: 45px;
  width: 45px !important;
}

.summary-item-info {
  flex: 1;
  min-width: 0;
}

.summary-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.summary-item-meta {
  font-size: 12px;
  color: #666;
}

.item-price {
  font-weight: 600;
  color: #1a1a1a;
}

.summary-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 16px 0;
}

/* Costs */
.summary-costs {
  margin: 16px 0;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cost-label {
  font-size: 14px;
  color: #666;
}

.cost-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.cost-free {
  color: #4CAF50;
}

/* Total */
.summary-total-clean {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 16px 0 20px;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.total-tax {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-color);
}

/* Checkout Button */
.checkout-btn {
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 16px;
  transition: transform 0.4s, box-shadow 0.4s;
}

.checkout-btn:active {
  transform: scale(0.98);
}

/* Trust Badge */
.trust-badge-clean {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #999;
}

/* Empty State */
.empty-cart-clean {
  text-align: center;
  padding: 80px 20px;
}

.empty-cart-clean h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 16px 0 8px;
}

.empty-cart-clean p {
  color: #999;
  margin-bottom: 24px;
}

/* Responsive */
@media (max-width: 960px) {
  .summary-sticky {
    position: static;
    margin-top: 24px;
  }
  
  .saved-addresses-grid {
    grid-template-columns: 1fr;
  }
}

/* Bank Details Box */
.bank-details-box {
  background: #fffbf0;
  border: 1px solid #ffe0b2;
  border-radius: 12px;
  padding: 16px;
}

.bank-details-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.bank-details-title {
  font-size: 14px;
  font-weight: 600;
  color: #FF5722;
}

.bank-details-content {
  background: white;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.8;
  color: #666;
  white-space: pre-wrap;
  border: 1px dashed #ffe0b2;
}

/* Input Overrides */
:deep(.v-field) {
  border-radius: 8px !important;
  box-shadow: none !important;
}

:deep(.v-field__input) {
  font-size: 14px !important;
  color: #1a1a1a !important;
}

:deep(.v-select .v-field__input) {
  color: #1a1a1a !important;
}

:deep(.v-select .v-select__selection-text) {
  color: #1a1a1a !important;
}

:deep(.v-text-field .v-field) {
  background: #fafafa;
}
</style>
<style scoped>
:deep(.custom-tel-input) {
  border-radius: 8px;
  border: 1px solid #b0bec5;
  height: 48px;
  background-color: white;
  color: #333333 !important;
}
:deep(.custom-tel-input:focus-within) {
  border: 2px solid v-bind(brandColor);
  box-shadow: none;
}
:deep(.custom-tel-input.vti-error) {
  border: 1px solid #ff5252 !important;
}
:deep(.vti__input) {
  background-color: transparent;
  border: none;
  font-family: inherit;
  padding-left: 12px;
  color: #333333 !important;
}
:deep(.vti__dropdown) {
  padding: 0 12px;
  transition: all 0.4s;
  color: #333333 !important;
  cursor: default !important;
}
.custom-tel-input-ltr :deep(.vti__dropdown) {
  border-radius: 8px 0 0 8px;
}
.custom-tel-input-rtl :deep(.vti__dropdown) {
  border-radius: 0 8px 8px 0;
}
.custom-tel-input-rtl {
  flex-direction: row-reverse !important;
}
:deep(.vti__dropdown-arrow) {
  display: none !important;
}
:deep(.vti__dropdown:hover) {
  background-color: transparent !important;
}
:deep(.vti__dropdown-list) {
  color: #333333 !important;
}

/* Custom Syria Flag Override */
:deep(.vti__flag.sy), :deep(.vti__flag.SY) {
  background: url('/syria-flag.png') no-repeat center !important;
  background-size: contain !important;
  width: 24px !important;
  height: 16px !important;
  display: inline-block !important;
}
/* Step 4 Modernized Styles - Matching SimpleCart.vue Identity */
.summary-card-premium {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 20px 50px rgba(0,0,0,0.04);
}

.review-info-card-premium {
  background: white;
  border-radius: 24px;
  border: 1px solid #f0f0f5;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.review-info-card-premium:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.checkout-item-premium {
  border-radius: 20px;
  border: 1px solid #f0f0f5;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.checkout-item-premium:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.checkout-item-price {
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

.summary-value-premium {
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  margin-inline-start: 16px;
}

.checkout-item-img-box {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.item-img-blend {
  mix-blend-mode: multiply;
}

.final-breakdown-premium-glass {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.02);
  box-shadow: inset 0 0 40px rgba(255,255,255,0.5);
}

.total-section-premium-modern {
  border: 1px solid rgba(var(--brand-color-rgb), 0.05);
  transition: all 0.3s ease;
}

.confirm-btn-premium {
  box-shadow: 0 15px 35px rgba(var(--brand-color-rgb), 0.3) !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.confirm-btn-premium:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 20px 45px rgba(var(--brand-color-rgb), 0.4) !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 600px) {
  .summary-card-premium {
    padding: 24px !important;
    border-radius: 24px;
  }
  .total-section-premium-modern .text-h4 {
    font-size: 1.5rem !important;
  }
}


/* Success Animations */
.success-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
}

.success-circle-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: success-pulse 2s infinite;
}

.success-icon-animate {
  animation: success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  z-index: 2;
}

@keyframes success-pop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes success-pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.8; }
}

.success-container-premium {
  min-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.premium-submit-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  border-radius: 100px !important;
}

.premium-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.premium-submit-btn:hover::before {
  left: 100%;
}

.premium-submit-btn:hover {
  /* transform: translateY(-3px) scale(1.01); */
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2) !important;
  /* filter: brightness(1.1); */
}

.premium-submit-btn:active {
  transform: translateY(0) scale(0.98);
}

.submit-icon-animate {
  transition: transform 0.3s ease;
}

.premium-submit-btn:hover .submit-icon-animate {
  transform: translateX(5px);
}

/* RTL handling for icon animation */
[dir="rtl"] .premium-submit-btn:hover .submit-icon-animate {
  transform: translateX(-5px);
}

</style>
`
  },
  {
    path: 'server/api/tenant/update-design.post.ts',
    name: 'update-design.post.ts',
    language: 'typescript',
    code: `import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient(event)
        const { data: { user } } = await client.auth.getUser()

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }
        const tenantId = user.id

        const body = await readBody(event)
        const { projectId, global_blocks } = body

        if (!projectId || !global_blocks) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID and global_blocks are required'
            })
        }

        const serviceClient = serverSupabaseServiceRole(event)

        const { data: project, error: fetchError } = await serviceClient
            .from('projects')
            .select('settings')
            .eq('id', projectId)
            .eq('tenant_id', tenantId)
            .single()

        if (fetchError || !project) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden: Project not found or does not belong to user.'
            })
        }

        // Only update global_blocks' inside 'settings'
        const newSettings = {
  ...project.settings,
  global_blocks: global_blocks
}

const { error: updateError } = await serviceClient
  .from('projects')
  .update({ settings: newSettings })
  .eq('id', projectId)

if (updateError) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Error updating project',
    data: updateError.message
  })
}

return {
  success: true,
  message: 'Design settings updated successfully'
}

    } catch (err) {
  console.error('API Error /tenant/update-design:', err)
  throw createError({
    statusCode: err.statusCode || 500,
    statusMessage: err.statusMessage || err.message || 'Internal Server Error'
  })
}
})`

  },
  {
    path: 'server/api/tenant/check-order-limits.post.ts',
    name: 'check-order-limits.post.ts',
    language: 'typescript',
    code: `import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { tenant_id } = body

    if (!tenant_id) {
        throw createError({ statusCode: 400, statusMessage: 'Missing tenant_id' })
    }

    const serviceClient = serverSupabaseServiceRole(event)

    // 1. Fetch tenant plan from projects
    const { data: project, error: projErr } = await serviceClient
        .from('projects')
        .select('plan')
        .eq('id', tenant_id)
        .single()

    if (projErr || !project) {
        return { exceeded: false, message: 'Project or plan not found' }
    }

    // 2. Fetch plan limits
    const { data: limits, error: limErr } = await serviceClient
        .from('plan_limits')
        .select('max_orders_month, max_orders_daily')
        .eq('plan_id', project.plan)
        .single()

    if (limErr || !limits) {
        return { exceeded: false, message: 'Limits not found' }
    }

    let monthlyCount = 0
    let dailyCount = 0

    // Fetch monthly orders count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count: mCount, error: monthlyError } = await serviceClient
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id)
        .gte('created_at', startOfMonth.toISOString())

    if (monthlyError) throw monthlyError
    monthlyCount = mCount || 0

    // Fetch daily orders count
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { count: dCount, error: dailyError } = await serviceClient
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id)
        .gte('created_at', startOfDay.toISOString())

    if (dailyError) throw dailyError
    dailyCount = dCount || 0

    const monthlyExceeded = limits.max_orders_month !== null && monthlyCount >= limits.max_orders_month
    const dailyExceeded = limits.max_orders_daily !== null && dailyCount >= limits.max_orders_daily

    return {
        exceeded: monthlyExceeded || dailyExceeded,
        type: dailyExceeded ? 'daily' : (monthlyExceeded ? 'monthly' : null),
        daily: {
            count: dailyCount,
            limit: limits.max_orders_daily,
            exceeded: dailyExceeded
        },
        monthly: {
            count: monthlyCount,
            limit: limits.max_orders_month,
            exceeded: monthlyExceeded
        }
    }
})`

  },
  {
    path: 'package.json',
    name: 'package.json',
    language: 'json',
    code: `{
  "name": "looplanfy-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev --host 0.0.0.0",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "devDependencies": {
    "@nuxtjs/supabase": "^2.0.5",
    "nuxt": "^3.12.1"
  },
  "dependencies": {
    "@googlemaps/js-api-loader": "^2.0.2",
    "@mdi/font": "^7.4.47",
    "@nuxt/image": "^2.0.0",
    "@nuxtjs/i18n": "^10.2.1",
    "@pinia/nuxt": "0.11.0",
    "@types/nodemailer": "^7.0.10",
    "nodemailer": "^8.0.1",
    "pinia": "^3.0.4",
    "sass": "^1.91.0",
    "swiper": "^12.0.3",
    "vue-tel-input": "^9.8.0",
    "vuedraggable": "^4.1.0",
    "vuetify": "^3.9.6",
    "vuetify-nuxt-module": "^0.18.7"
  }
}`
  },
]
