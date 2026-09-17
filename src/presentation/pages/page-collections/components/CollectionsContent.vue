<template>
  <div class="collection-page">
    <div class="top-info">
      <div class="title-text">Shop online, pick-up in-store</div>
      <div :class="['parent-categories-con','shimmer', {'show': showParentCategories && parentArray?.length > 0}]">
        <div class="parent-category" v-for="index in parentArray" :key="index"></div>
      </div>
      <div :class="['parent-categories-con', {'show': showParentCategories && !parentArray?.length}]">
        <div @click="clickParentCategory(null)" :class="['parent-category', {'active': !selectedParentCategory}]">All</div>
        <div @click="clickParentCategory(parent)" :class="['parent-category', {'active': parent.name == selectedParentCategory}]" 
          v-for="parent in parentCategories" 
          :key="parent.name">{{ parent.name }}</div>
      </div>
    </div>
    <div class="top-head" v-if="showSearchBar">
      <div class="top-search-wrapper">
        <span class="top-search-icon material-icons-outlined">search</span>
        <input
          type="text"
          placeholder="Search products"
          v-model="keywords"
          @keypress.enter="searchProducts()"
        />
        <div class="top-search-btn" @click="searchProducts()">Submit</div>
      </div>
    </div>
    <div :class="['main-container', {'loading': !showDesktopFilter}]">
      <div :class="['filter-container']" v-if="products && isDesktop">
        <!-- <div class="filter-label">Filter</div> -->
        <filter-accordion
          ref="filterAccordionDesktop"
          :products="products"
          :productsFiltered="productsFiltered"
          :brands="brands"
          :categories="categories"
          @filterProducts="setProductsFiltered"
          :hideAvailability="false"
          :selectedCategories="selectedCategoryIds"
          :collectionType="collectionType"
          :collectionName="collectionName"
          :stockIn="inStock"
          :stockOut="outStock"
        >
        </filter-accordion>
      </div>
      <div class="products-container">
        <div class="products-head">
          <div class="btn-filter" v-if="isDesktop" @click="toggleShowFilter()">
            <span class="material-icons filter-icon">tune</span>
            <span>Filter</span>
            <i class="material-icons filter-icon">chevron_right</i>
          </div>
          <span :class="['product-length', {'loading': loading, 'is-fetching': isFetching}]">
            {{ isFetching ? 'Fetching...' : (productCount + ' results') }} 
            {{ keySubmitted && isFetching ? ` for ${keySubmitted}` : "" }}
          </span>
          <div class="filter-wrapper">
            <div
              class="btn-filter"
              v-if="!isDesktop"
              @click="toggleShowFilter()">
              <span class="material-icons filter-icon">tune</span>
              <span>Filter</span>
            </div>
            <div class="btn-filter" @click="toggleShowSorter()">
              <span class="material-icons filter-icon">swap_vert</span>
              <span class="sort-label">Sort by:</span>
              <span class="sort-by">{{ sortedByDisplay }}</span>
            </div>
          </div>
        </div>
        <product-grid
          ref="productGrid_category"
          :products="productsFiltered"
          :noPadding="true"
          :gridColumns="showDesktopFilter ? 3 : 4"
          :more-button="false"
          :loading="isFetching"
        ></product-grid>
        <small class="pagination-info" v-html="showingRows"></small>
        <div class="pagination">
          <button :disabled="!enablePreviousPage"
            @click="setPageIndex(0)"
          ><i class="material-icons-outlined">skip_previous</i></button>
          <button :disabled="!enablePreviousPage"
            @click="setPageIndex(pageIndex - 1)"
          ><i class="material-icons-outlined">chevron_left</i></button>
          <button 
            v-for="page in maxPages" 
            :key="page.index"
            :class="{'active': page.index == pageIndex}"
            @click="setPageIndex(page.index)"
          >{{ page.number }}</button>
          <button :disabled="!enableNextPage"
            @click="setPageIndex(pageIndex + 1)"
          ><i class="material-icons-outlined">chevron_right</i></button>
          <button :disabled="!enableNextPage"
            @click="setPageIndex(pagesCount - 1)"
          ><i class="material-icons-outlined">skip_next</i></button>
        </div>
      </div>
    </div>
    <!-- <div class="fetching" v-if="isFetching"><div class="circle spinning"></div></div> -->

    <base-modal :show="showFilter" :full-screen="false">
      <template v-slot:header>
        <div class="modal-header header-flex header-justify">
          <h3>Filter</h3>
          <span
            class="material-icons-outlined back-btn"
            @click="toggleShowFilter()"
            >close</span
          >
        </div>
      </template>
      <template v-slot:body>
        <div class="modal-body" v-if="showFilter">
          <filter-accordion
            ref="filterAccordionMobile"
            :products="products"
            :productsFiltered="productsFiltered"
            :brands="brands"
            :categories="categories"
            @filterProducts="setProductsFiltered"
            :hideAvailability="false"
            :selectedCategories="selectedCategoryIds"
            :collectionType="collectionType"
            :collectionName="collectionName"
          >
          </filter-accordion>
        </div>
        <div class="modal-footer">
          <div class="button" @click="setFilterPayload">Apply</div>
          <div class="button lite" @click="resetFilterMobile()">
            Reset All
          </div>
        </div>
      </template>
    </base-modal>

    <base-modal :show="showSorter" :full-screen="false">
      <template v-slot:header>
        <div class="modal-header header-flex header-justify">
          <h3>Sort</h3>
          <span
            class="material-icons-outlined back-btn"
            @click="toggleShowSorter()"
            >close</span
          >
        </div>
      </template>
      <template v-slot:body>
        <div class="modal-body">
          <div class="radio-list">
            <div class="radio" v-for="radio in sortedList" :key="radio.key">
              <input
                name="sortBy"
                type="radio"
                :checked="radio.clicked == true"
                :data-key="radio.key"
                @click="setSortedBy(radio.key)"
              />
              <span class="radio-label">{{ radio.name }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="button lite" @click="resetSorter()">Reset All</div>
          <div class="button" @click="sortProducts()">Apply</div>
        </div>
      </template>
    </base-modal>
  </div>
</template>

<script>
import ProductGrid from "../../page-store/components/ProductGrid.vue";
import FilterAccordion from "../../page-brand/components/FilterAccordion.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import { productService } from "@/bloc/services";
// import moment from 'moment';

export default {
  name: "CollectionsContent",
  mixins: [utility],
  components: {
    ProductGrid,
    FilterAccordion,
  },
  props: {
    showParentCategories: {
      type: Boolean,
      default: false,
    },
    hideAvailability: {
      type: Boolean,
      default: false,
    },
    selectedBrand: {
      type: String,
      default: ""
    },
    collectionType: {
      type: String,
      default: ""
    },
    collectionName: {
      type: String,
      default: ""
    },
    showSearchBar: {
      type: Boolean,
      default: false,
    },
    saleOnly: {
      type: Boolean,
      default: false,
    },
    searchKey: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      loading: true,
      isDesktop: false,
      products: [],
      productsFiltered: [],
      pageIndex: 0,
      limit: 9,
      sortBy: {
        newest: {
          clicked: true,
          selected: true,
          name: "Newest",
        },
        oldest: {
          clicked: false,
          selected: false,
          name: "Oldest",
        },
        lowestPrice: {
          clicked: false,
          selected: false,
          name: "Price (Lowest)",
        },
        highestPrice: {
          clicked: false,
          selected: false,
          name: "Price (Highest)",
        },
        productAsc: {
          clicked: false,
          selected: false,
          name: "Product Name (A-Z)",
        },
        productDesc: {
          clicked: false,
          selected: false,
          name: "Product Name (Z-A)",
        },
        // inStock: {
        //     clicked: false,
        //     selected: false,
        //     name: "In Stock",
        // },
      },
      showFilter: false,
      filterPayload: null,
      showSorter: false,
      categories: [],
      selectedCategories: [],
      brands: [],
      keywords: "",
      keySubmitted: "",
      maximumPages: 6,
      inStock: 0,
      outStock: 0,
      productCount: 0,
      pagesCount: 0,
      sortKey: "newest",
      isFetching: true,
      selectedParentCategory: "",
      showDesktopFilter: false,
    };
  },
  watch: {
    keywords(val) {
      if (!val) this.searchProducts();
    },
  },
  computed: {
    parentArray(){
      if(!this.loading) return [];
      return Array.from({length: 6}).map((_, index) => ({index}));
    },
    parentCategories(){
      return this.mapProductCategories();
    },
    selectedCategoryIds() {
      if (isEmpty(this.selectedCategories)) return [];
      let categories = this.categories;
      if (isEmpty(categories)) return [];
      let names = this.selectedCategories.map((c) => c.toLowerCase());
      return categories.filter((c) => names.includes(c.name.toLowerCase()))?.map((c) => c.id);
    },
    sortedByDisplay() {
      let theOne = null;
      for (var key in this.sortBy) {
        if (this.sortBy[key].clicked) theOne = this.sortBy[key];
      }
      return theOne ? theOne.name : "Newest";
    },
    sortedList() {
      let items = [];
      for (var key in this.sortBy) {
        let it = this.sortBy[key];
        it.key = key;
        items.push(it);
      }
      return items;
    },
    maxPages(){
      if(this.pagesCount <= this.maximumPages) {
        return Array.from({length: this.pagesCount}).map((_, index) => {
          return {
            index: index,
            number: index + 1
          }
        })
      };
      if(this.pageIndex < this.maximumPages){
        return Array.from({length: this.maximumPages}).map((_, index) => {
          return {
            index: index,
            number: index + 1
          }
        });
      }
      let pages = [];
      let startIndex = Math.floor(this.pageIndex / this.maximumPages) * this.maximumPages;
      let endIndex = startIndex + this.maximumPages;
      if((endIndex + 1) > this.pagesCount) {
        endIndex = this.pagesCount;
        startIndex = endIndex - this.maximumPages;
      }
      for(let i = startIndex; i < endIndex; i++){
        pages.push({
          index: i,
          number: i + 1
        })
      }
      return pages;
    },
    enablePreviousPage(){
      if(isEmpty(this.productsFiltered)) return false;
      return this.pageIndex > 0;
    },
    enableNextPage(){
      if(isEmpty(this.productsFiltered)) return false;
      // if(this.pagesCount <= this.maximumPages) return false;
      return (this.pageIndex + 1) < this.pagesCount;
    },
    showingRows(){
      let len = this.productCount;
      if(!len || len == 0) return "";
      let startNumber = (this.pageIndex * this.limit) + 1
      let endNumber = startNumber + this.limit - 1;
      if(endNumber > len) endNumber = len;
      return `Showing <b>${startNumber}-${endNumber}</b> of ${len} Products`;
    },
  },
  methods: {
    setPageIndex(index){
      this.pageIndex = index;
      this.fetchProducts(index);
    },
    goSignup() {
      this.goToWithParams("LoginPage", {
        signup: true,
      });
    },
    resetFilterMobile() {
      this.$refs.filterAccordionMobile.resetAll();
    },
    toggleShowFilter() {
      if(this.isDesktop){
        this.showDesktopFilter = !this.showDesktopFilter;
        return
      }
      this.showFilter = !this.showFilter;
      if (this.showFilter && !this.isDesktop) {
        setTimeout(() => {
          this.$refs.filterAccordionMobile.transferPayload(this.filterPayload);
        }, 250);
      }
    },
    toggleShowSorter() {
      this.showSorter = !this.showSorter;
    },
    async resetSorter() {
      let items = document.getElementsByName("sortBy");
      for (var i = 0; i < items.length; i++) {
        document.getElementsByName("sortBy")[i].checked = false;
      }
      document.querySelector("[data-key='newest']").checked = true;
      for (var s in this.sortBy) {
        this.sortBy[s].clicked = false;
      }

      this.sortBy.newest.clicked = true;
      this.sortProducts();
    },
    setSortedBy(key) {
      this.sortKey = key;
      for (var s in this.sortBy) {
        this.sortBy[s].selected = false;
      }
      this.sortBy[key].selected = true;
    },
    sortProducts() {
      let count = 0;
      for (var s in this.sortBy) {
        this.sortBy[s].clicked = this.sortBy[s].selected;
        if (this.sortBy[s].clicked) count++;
      }
      if (count == 0) this.sortBy.newest.clicked = true;
      if (this.$refs.productGrid_category) this.$refs.productGrid_category.finalizeProducts(this.productsFiltered);
      this.showSorter = false;
    },
    clickParentCategory(parent){
      this.selectedParentCategory = parent?.name || "";
      this.fetchProducts(0);
    },
    emitFilterPayload(payload) {
      this.filterPayload = {
        range: payload.range,
        prices: payload.prices,
        brands: payload.brands,
        categories: payload.categories,
        selectedPriceIndexes: payload.selectedPriceIndexes,
        selectedBrandIndexes: payload.selectedBrandIndexes,
        selectedCategoryIndexes: payload.selectedCategoryIndexes,
        available: payload.available,
        isMinAndMaxPrice: payload.isMinAndMaxPrice,
      };
      if (
        !this.isDesktop &&
        this.showFilter &&
        !isEmpty(payload) &&
        payload.isMinAndMaxPrice
      ) {
        this.setProductsFiltered(payload);
      }
    },
    setFilterPayload() {
      this.$refs.filterAccordionMobile.emitFiltered();
    },
    resizeHandler() {
      this.isDesktop = window.innerWidth >= 672;
      this.showFilter = false;
      if (!this.filterPayload) return;
      setTimeout(() => {
        if (this.isDesktop) {
          this.$refs.filterAccordionDesktop.transferPayload(this.filterPayload);
        }
      }, 250);
    },
    async setProductsFiltered(payload) {
      let callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
      this.showFilter = false;
      let keys = this.keywords.split('-');
      let keyRest = keys;
      let parentName = "";
      let subName = "";
      for (let i = 0; i < this.parentCategories.length; i++){
        let parName = this.slugName(this.parentCategories[i].name).toLowerCase();
        if (keys.map((k) => k.toLowerCase()).includes(parName)) {
          parentName = parName;
          keyRest = keyRest.filter((k) => k.toLowerCase() != parentName);
          if (keyRest.length > 0) {
            let subs = this.parentCategories[i].subCategories;
            let ex = subs.map((k) => k.toLowerCase()).filter((f) => {
              return keyRest.map((s) => s.toLowerCase()).includes(f);
            });
            if (ex.length) {
              subName = ex[0];
            }
          }
        }
      }
      let pks = [];
      if (parentName) pks = [parentName];
      if (subName) pks.push(subName);
      if (pks.length > 0) {
        let restkey = keys?.map((k) => k.toLowerCase()).filter((k) => !pks.includes(k));
        if (restkey.length) pks = [...pks, ...[restkey.join(' ')]];
        this.selectedCategories = pks;
      } else {
        this.selectedCategories = [];
      }
      this.emitFilterPayload(payload);

      await this.fetchProducts(!payload ? 0 : this.pageIndex);
      callback({inStockCount: this.inStock, outStockCount: this.outStock});
    },
    async fetchProducts(pageIndex){
      try {
        let payload = this.filterPayload;
        let priceRanges = payload?.prices || [];
        // let rangeFrom = payload.range.from;
        // let rangeTo = payload.range.to;
        let availability = payload?.available;
        let selectedBrands = payload?.brands || [];
        let selectedCategories = payload?.categories || [];
        if(this.selectedParentCategory){
          let parent = this.parentCategories.find((it) => it.name == this.selectedParentCategory);
          if(parent){
            let categories = [];
            categories.push(parent);
            if(parent.subCategories) {
              categories = [
                ...categories,
                ...parent.subCategories.map((c) => ({name: c}))
              ]
            }
            if(parent.itemsOnly) {
              categories = [
                ...categories,
                ...parent.itemsOnly.map((c) => ({name: c}))
              ]
            }
            if(parent.children) {
              categories = [
                ...categories,
                ...parent.children.map((c) => ({name: c.name}))
              ]
              for(let i = 0; i < parent.children.length; i++){
                categories.push({name: parent.children[i].name});
                for(let n = 0; n < parent.children[i].items.length; n++){
                  categories.push({name: parent.children[i].items[n]});
                }
              }
            }
            selectedCategories = [...selectedCategories, ...categories];
          }
        }

        let params = {
          pageNumber: pageIndex,
          pageSize: this.limit,
          sortBy: this.sortKey,
          keyword: this.keySubmitted,
          saleOnly: this.saleOnly
        }
        if(!isEmpty(selectedBrands)){
          params = {
            ...params,
            brands: selectedBrands?.map((b) => b.apiCode)
          }
        }
        if(!isEmpty(selectedCategories)){
          params = {
            ...params,
            categories: selectedCategories.map((c) => c.name)
          }
        }
        if(!isEmpty(priceRanges)){
          let pMin = Math.min(...priceRanges.map((pr) => pr.from));
          let pMax = Math.max(...priceRanges.map((pr) => pr.to));
          if(pMin == pMax) pMin = 0;
          params = {
            ...params,
            priceFrom: pMin,
            priceTo: pMax
          }
        }
        if(availability > 0){
          params = {
            ...params,
            stockStatus: availability == 1 ? "INSTOCK" : "OUTSTOCK",
          }
        }
        if(this.collectionType == "brand") {
          params.brands = [...(params.brands || []), ...[this.collectionName]];
        }
        this.isFetching = true;
        const res = await productService.retrieveProductsList(params);
        let productsList = res?.products.map((prd) => {
          prd.brands = res?.brands?.length ? res.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
          return prd;
        });
        let resBrands = [];
        if(res?.brands){
          let selectedBrandsMap = selectedBrands.length > 0 ? selectedBrands.map((b) => b.apiCode) : [];
          resBrands = res?.brands?.map((b) => {
            b.clicked = selectedBrandsMap.includes(b.apiCode);
            return b;
          })
        }
        this.products = productsList;
        this.productsFiltered = productsList;
        this.productCount = res?.productCount || 0;
        this.pagesCount = res?.pageCount || 0;
        this.inStock = res?.inStock || 0;
        this.outStock = res?.outStock || 0;
        this.products = productsList;
        this.productsFiltered = productsList;
        this.brands = this.collectionType == 'brand' ? [] : resBrands;
        let cnames = payload?.categories?.map((it) => it.name) || [];
        this.categories = (res?.categories || [])?.map((it) => {
          it.clicked = cnames.includes(it.name);
          return it;
        });
        this.$store.dispatch("setCategories", res?.categories || []);
        this.$store.dispatch("setTags", res?.tags || []);
        this.sortProducts();
      } finally {
        this.isFetching = false;
      }
    },
    collectBrands() {
      let brands = this.collectBrandsList()
      if (!isEmpty(brands)) {
        brands?.map((it) => ({ ...it,filtered: false })).sort((a, b) => a.name.localeCompare(b.name));
			}
			this.brands = brands;
    },
    searchProducts() {
      this.keySubmitted = this.keywords;
      if (this.isDesktop && this.$refs.filterAccordionDesktop) this.$refs.filterAccordionDesktop.resetAll();
      else if(this.$refs.filterAccordionMobile) this.$refs.filterAccordionMobile.resetAll();
      this.fetchProducts(0);
    },
    async initData() {
      try {
        this.isFetching = true;
        let params = {
          pageNumber: this.pageIndex,
          pageSize: this.limit,
          sortBy: this.sortKey,
          saleOnly: this.saleOnly,
          brands: [],
          categories: []
        }
        let names = this.collectionName ? this.collectionName.split('-') : [];
        let cnames = [];
        if(names.length > 1){
          cnames.push(this.collectionName);
          for(let i = 0; i < names.length; i++){
            cnames.push(names[i]);
          }
        }
        switch (this.collectionType) {
          case "brand":
            params.brands = [this.collectionName];
            break;
          case "category":
            params.categories = cnames;
            break;
        }
        if (this.searchKey) {
          params.keyword = this.searchKey;
        }
        const res = await productService.retrieveProductsList(params);
        let productsList = [];
        if(res?.products?.length > 0){
          productsList = res?.products.map((prd) => {
            prd.brands = res?.brands?.length ? res.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
            return prd;
          })
        }
        this.productCount = res?.productCount || 0;
        this.pagesCount = res?.pageCount || 0;
        this.inStock = res?.inStock || 0;
        this.outStock = res?.outStock || 0;
        this.products = productsList;
        this.productsFiltered = productsList;
        this.brands = this.collectionType == 'brand' ? [] : (res?.brands || []);
        this.categories = res?.categories || [];
        let selectedCategories = [];
        switch (this.collectionType) {
          case "brand":
            this.keywords = this.collectionName;
            break;
          case "category":
            this.collectBrands();
            this.keywords = this.collectionName;
            selectedCategories = this.categories?.filter((c) => this.slugName(c.name) == this.slugName(this.collectionName));
            if(cnames.length > 1){
              selectedCategories = this.categories?.filter((c) => cnames.includes(this.slugName(c.name)));
            }
            break;
          default:
            this.collectBrands();
            this.keywords = this.selectedBrand;
            if (this.searchKey) this.keywords = this.searchKey;
            break;
        }
        if(selectedCategories.length > 0){
          this.selectedCategories = Array.from(new Set(selectedCategories?.map((c) => c.name)));
        }
      } finally {
        this.isFetching = false;
        this.$emit('init-done', this.selectedCategoryIds);
        if(this.isDesktop) this.showDesktopFilter = true;
      }
    }
  },
  async created() {
    this.isDesktop = window.innerWidth >= 672;
    window.addEventListener("resize", this.resizeHandler);
    this.keywords = "";
    this.loading = true;
    try {
      if (!this.$store.getters.hasInited) {
        await this.refreshMainData(true);
        this.$store.dispatch("setInited", true);
      }
      await this.initData();
    } catch (error) {
      console.error("Failed to init collections", error);
    } finally {
      this.loading = false;
    }
  },
  beforeUnmount(){
    window.removeEventListener("resize", this.resizeHandler);
  }
};
</script>

<style scoped lang="scss">
.collection-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-block: 20px;
}
.top-info {
  width: 100%;
  padding-inline: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
  justify-content: flex-start;
}
.title-text {
  display: block;
	font-size: 30px;
  line-height: normal;
	text-align: left;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
}
.parent-categories-con {
	width: 100%;
	gap: 10px;
	overflow-x: auto;
  &:is(.show){
    display: flex;
	  align-items: center;
    padding-block: 20px;
  }
  &:not(.show){
    display: none;
    pointer-events: none;
  }
	.parent-category {
		padding: 6px 24px;
		border-radius: 999px;
		cursor: pointer;
		border: 1px solid $main-red;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		&:is(.active){
			background: $main-red;
			color: $white;
		}
	}
  &:is(.shimmer){
    .parent-category {
      background: $secondary-color-20;
      border-color: $secondary-color-20;
      min-height: 32px;
      min-width: 120px;
    }
  }
}
.fetching {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  position: fixed;
  background-color: rgba(0,0,0,.1);
  .circle {
    width: 50px;
    height: 50px;
    border: 4px solid $primary-color-50;
    border-right-color: transparent;
    border-radius: 50%;
  }
}
.pagination-info {
  margin-top: auto;
  display: block;
  padding-top: 40px;
  width: fit-content;
  margin-left: auto;
}
.pagination {
  width: 100% !important;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-top: auto;
  padding-inline: 16px;
  transform: translateX(0px) !important;
  -webkit-transform: translateX(0px) !important;
  button {
    min-width: 35px;
    max-width: 35px;
    min-height: 35px;
    max-height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $secondary-color-20;
    font-size: 14px;
    cursor: pointer;
    &.active {
      background: $dark-color-1;
      color: $white;
    }
    .material-icons,
    .material-icons-outlined {
      font-size: 16px;
    }
  }
}
.back-btn {
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
}
.modal-body {
  .radio-list {
    padding: 20px 0 !important;
  }
}
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid $secondary-color-20;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  .button {
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: $primary-color-60;
    color: $white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    &.lite {
      border-color: $primary-color-20;
      color: $primary-color-60;
      background: $white;
    }
  }
}
.top-head {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: flex-start;
  .top-search-wrapper {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 0px 20px;
    border-radius: 12px;
    background: linear-gradient(
      45deg,
      $secondary-color-10,
      $secondary-color-20
    );
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    gap: 12px;
    position: relative;
    .top-search-icon {
      color: $secondary-color-60;
    }
    input {
      flex: 3;
      background: transparent;
      outline: none;
      border: none;
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      padding: 20px 0;
    }
    .top-search-btn {
      border-radius: 8px;
      background: $brown-dark;
      padding: 8px 16px;
      color: $white;
      cursor: pointer;
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      &:hover {
        opacity: 0.7;
      }
    }
  }
}
.main-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  .filter-container {
    transition: all 0.25s ease-in-out;
    -webkit-transition: all 0.25s ease-in-out;
    width: 100%;
    .filter-label {
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      font-size: 1.5em;
      padding: 8px 0;
    }
  }
  &:is(.loading){
    .filter-container {
      width: 0 !important;
      overflow: hidden;
    }
    .products-container {
      flex: 1;
    }
  }
  &:not(.loading){
    .filter-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .products-container {
      flex: 3;
    }
  }
  .products-container {
    .products-head {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block: 20px;
      flex-direction: column;
      gap: 12px;
      .product-length {
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        font-size: 1.2em;
        text-align: left;
        width: 100%;
        &:is(.loading){
          display: none;
        }
        &:is(.is-fetching){
          color: $secondary-color-50;
        }
      }
      .filter-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
      }
      .btn-filter {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid $secondary-color-20;
        // font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        // font-size: 1em;
        cursor: pointer;
        &:hover {
          opacity: 0.7;
        }
        .filter-icon {
          font-size: 1em;
        }
        * {
          white-space: nowrap;
        }

        .sort-by {
          color: $secondary-color-50;
          font-family: 'Berthold Akzidenz Grotesk', sans-serif !important;
        }
      }
    }
  }
}
.header-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  &.centered {
    flex: 3;
  }
  &.guest {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
@media (min-width: 672px) {
  .top-info {
    padding-inline: 4%;
  }
  .pagination {
    width: fit-content !important;
    max-width: 100%;
    margin-inline: auto 0;
    padding-inline: 0 !important;
  }
  .top-head {
    padding: 20px 4% !important;
  }
  .main-container {
    padding: 20px 4% !important;
    flex-direction: row !important;
    &:not(.loading){
      gap: 20px;
    }
    .products-container {
      .products-head {
        flex-direction: row !important;
        .product-length {
          width: unset !important;
        }
        .filter-wrapper {
          width: unset !important;
        }
      }
    }
    .filter-container {
      .range-content {
        .range-wrapper {
          .range-item {
            input {
              max-width: 100px !important;
            }
          }
        }
      }
    }
  }
}
</style>
