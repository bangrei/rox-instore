<template>
  <layout-variant-two :active-menu-index="1" :footer-red="true">
    <template v-slot:body>
      <div class="fnb-container">
        <div class="brand-banner" v-if="selectedBrand?.custom?.brandBanner">
          <img :src="getImage(selectedBrand.custom.brandBanner,'width=750')" :alt="selectedBrand.name"/>
        </div>
        <div class="breadcrumbs">
          <router-link class="breadcrumb-link" to="/">Home <i class="material-icons">chevron_right</i></router-link> 
          <div class="breadcrumb-item">Food & Beverage</div>
        </div>
        <h2 class="fnb-title">Order online, pick-up onsite</h2>
        <div class="brands-list">
          <router-link :to="'/shop/fnb/' + brand.apiCode" :class="['brand-item', {'active': brand.id == selectedBrand?.id}]" 
            v-for="brand in foodBrands" :key="brand.id">
            {{ brand.name }}
          </router-link>
        </div>
        <div class="categories" v-if="!loading">
          <div :class="['category', {'active': category.id == categoryId}]" 
            v-for="category in productCategories" 
            :key="category.id"
            @click="categoryId = category.id">{{ category.name }}</div>
        </div>
        <div :class="['products-list', {'shimmer': loading}]">
          <div class="product-shimmer" v-for="index in productShimmer" :key="index">
            <div class="shimmer-image"></div>
            <div class="shimmer-title"></div>
            <div class="shimmer-text"></div>
          </div>
          <div class="product-item"
            v-for="prd in productsDisplay" 
            :key="prd.id">
            <router-link :to="getProductLink(prd)" :class="['product-image',{'empty-img': prd.imagesCount == 0}]">
              <img :src="prd.images[0].image" :alt="prd.name"/>
            </router-link>
            <div class="product-wrapper">
              <div class="product-content">
                <router-link :to="getProductLink(prd)" class="product-name">{{ prd.name }}</router-link>
                <div class="price-wrapper">
                  <span class="promo-price" v-if="hasPromoPrice(prd)">{{ displayPrice(prd) }}</span>
						      <span class="product-price">{{ prdPrice(prd) }}</span>
                </div>
              </div>
              <router-link class="product-link" :to="getProductLink(prd)">
                <i class="material-icons">add_circle</i>
              </router-link>
            </div>
          </div>
        </div>
        <base-empty-product-state v-if="!loading && !productsDisplay?.length"/>
      </div>
    </template>
    <template v-slot:footer>
      <base-side-nav v-if="!loading" :active-index="1"/>
		</template>
  </layout-variant-two>
</template>
<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { productService } from "@/bloc/services";
import isEmpty from "lodash/isEmpty";
export default {
  name: "FnBPage",
  components: {
    LayoutVariantTwo
  },
  mixins: [utility],
  data(){
    return {
      loading: true,
      products: [],
      selectedBrand: null,
      pageNumber: 0,
      pageSize: 10,
      categoryId: null,
    }
  },
  computed: {
    productShimmer(){
      if(!this.loading) return [];
      return Array.from({length: 8}).map((_, index) => ({index}));
    },
    foodBrands(){
      let brands = this.collectBrandsList();
      return brands?.filter((brand) => brand.type == "FOOD");
    },
    productCategories(){
      if(!this.selectedBrand) return [];
      if(!this.products?.length) return [];
      let cats = [];
      for(const i in this.products){
        if(this.products[i].categories?.length) {
          let catIds = cats?.length ? cats.map((c) => c.id) : [];
          cats = [...cats, ...this.products[i].categories.filter((c) => !catIds.includes(c.id))];
        }
      }
      return cats;
    },
    productsDisplay(){
      if(!this.selectedBrand) return [];
      if(!this.categoryId) return [];
      return this.products.filter((p) => p.categories.map((c) => c.id).includes(this.categoryId));
    },
  },
  watch: {
    selectedBrand(){
      this.fetchProducts();
    },
  },
  methods: {
    clickBrand(brand){
      if(!brand.stores?.length) return this.showNotification("alert", "error_outline", 'The store is unavailable at the moment!');
      this.selectedBrand = brand
    },
    getProductLink(prd) {
			let names = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
				if (it.toUpperCase() == it) return it;
				return it.toLowerCase();
			});
			if(!isEmpty(prd.variants)) {
				prd.variants.sort((a,b) => a.sortIndex - b.sortIndex);
				let variant = prd.variants[0];
				if(!isEmpty(prd.cart)) variant = prd.cart.variant;
				
				let variantSlugs = variant.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
					if (it.toUpperCase() == it) return it;
					return it.toLowerCase();
				});
				names = [...names, ...variantSlugs];
			}
			return `/product/${prd.id}/${names.join('-')}`;
		},
    getImages(prd) {
			let images = [];
			if (!isEmpty(prd.imageId)) images.push({ sortIndex: 0, id: prd.imageId, image: `${this.$store.getters.cloudinaryURL}${prd.imageId}?width=300` });
			if (!isEmpty(prd.image2Id)) images.push({ sortIndex: 1, id: prd.image2Id, image: `${this.$store.getters.cloudinaryURL}${prd.image2Id}?width=300` });
			if (!isEmpty(prd.image3Id)) images.push({ sortIndex: 2, id: prd.image3Id, image: `${this.$store.getters.cloudinaryURL}${prd.image3Id}?width=300` });
			if (!isEmpty(prd.images)) {
				images = prd.images.map((im) => {
					return {
						...im,
						image: `${this.$store.getters.cloudinaryURL}${im.id}?width=300`
					}
				});
				images.sort((a, b) => a.sortIndex - b.sortIndex);
			}
      if(images?.length) return {images, imagesCount: images.length};
      return {images: [{image: require('@/assets/images/rox-logo-2025.jpeg')}], imagesCount: 0}
		},
    displayPrice(prd) {
      if (isEmpty(prd.variants)) return this.currency(prd.originalPrice);
      let variants = prd.variants.filter((v) => v.promoPrice > 0);
      if (variants.length > 0) {
        return this.currency(variants[0].price)
      }
      return this.currency(prd.originalPrice);
    },
		prdPrice(prd) {
			if (isEmpty(prd.variants)) return prd.price == 0 ? 'Free' : this.currency(prd.price);
			let hasVariantPromo = this.hasPromoPrice(prd);
			if (hasVariantPromo) return hasVariantPromo;
			let variantPrice = prd.variants.find((v) => v.price > 0);
			return variantPrice ? this.currency(variantPrice.price) : 'Free';
		},
		hasPromoPrice(prd) {
			let promoPrice = prd.promoPrice;
			if (!isEmpty(prd.variants)) {
				let variants = prd.variants.filter((v) => v.promoPrice > 0);
				if (variants.length > 0) {
					promoPrice = variants[0].promoPrice;
				}
			}
			if (promoPrice > 0) return this.currency(promoPrice);
			return null;
		},
    async fetchProducts(){
      try {
        this.loading = true;
        let params = {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          sortBy: "newest",
          brands: this.selectedBrand?.apiCode ? [this.selectedBrand?.apiCode] : [],
        }
        let json = await productService.retrieveProductsList(params);
        if(json?.productCount > this.pageSize){
          json = await productService.retrieveProductsList({
            ...params,
            pageSize: json.productCount
          });
        }
        this.products = json?.products?.map((prd) => {
          prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
          const prdImages = this.getImages(prd);
          prd = {
            ...prd,
            ...prdImages
          }
          return prd;
        });
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false;
        if(this.productCategories?.length){
          this.categoryId = this.productCategories[0].id;
        }
      }
    }
  },
  async created(){
    this.loading = true;
    if (!this.$store.getters.hasInited) {
      await this.refreshMainData(true);
      this.$store.dispatch('setInited', true);
    }
    if(this.foodBrands?.length){
      if(this.$route?.params?.brandCode){
        this.selectedBrand = this.foodBrands.find((b) => b.apiCode == this.$route.params.brandCode);
      } else {
        this.selectedBrand = this.foodBrands.find((b) => b.stores?.length > 0);
      }
    }
  }
}
</script>
<style scoped lang="scss">
.price-wrapper {
  font-size: 18px;
  line-height: 28px;
  text-align: left;
  margin-top: 8px;
  display: flex;
  font-weight: bold;
  align-items: center;
  gap: 10px;
  color: $dark-color-1;
  .promo-price {
    position: relative;
    display: flex;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      margin: auto;
      background: $primary-color-60;
    }
  }
}
.brand-banner {
  width: 100%;
  aspect-ratio: 5/1.5;
  overflow: hidden;
  img {
    width: 100%;
    aspect-ratio: inherit;
    object-fit: cover;
  }
}
.empty-content {
  width: 100%;
  aspect-ratio: 5/1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-inline: 20px;
  margin-top: 20px;
  & * {
    color: $white;
    text-decoration: none;
  }
  .breadcrumb-link {
    color: $white !important;
    display: flex;
    align-items: center;
    i {
      color: $white !important;
    }
  }
  .breadcrumb-item {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
  }
}
.fnb-title {
  font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
  font-size: 24px;
  line-height: 38px;
  letter-spacing: 0px;
  display: flex;
  justify-content: space-between;
  position: relative;
  gap: 32px;
  width: 100%;
  text-align: left;
  color: $blue-powder;
  font-weight: normal !important;
  padding-inline: 20px;
  .material-icons,
  .material-icons-outlined {
      right: 16px;
  }
}
.fnb-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: $brown-dark;
  padding-bottom: 64px;
}
.brands-list {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding-block: 10px;
  padding-inline: 20px;
  overflow-x: auto;
  .brand-item {
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid $blue-powder;
    background: $brown-dark;
    font-family: 'Berthold Akzidenz Grotesk Medium';
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
    color: $white;
    &:is(.active){
      background: $blue-powder;
      color: $brown-dark;
    }
  }
}
.categories {
  padding: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  white-space: nowrap;
  .category {
    color: $white;
    cursor: pointer;
    text-decoration: underline;
    &:is(.active){
      font-family: 'Berthold Akzidenz Grotesk Medium';
    }
  }
}
.products-list {
  padding-bottom: 20px;
  padding-inline: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  .product-shimmer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    text-decoration: none;
    gap: 10px;
    opacity: 0.5;
    .shimmer-image {
      width: 100%;
      aspect-ratio: 4/3;
      background: $blue-powder;
    }
    .shimmer-title {
      width: 100%;
      min-height: 20px;
      background: $blue-powder;
    }
    .shimmer-text {
      width: 35%;
      min-height: 10px;
      background: $blue-powder;
    }
  }
  .product-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    text-decoration: none;
    .product-image {
      width: 100%;
      aspect-ratio: 4/3;
      text-decoration: none;
      color: $secondary-color-90;
      &:is(.empty-img){
        background: $blue-powder;
        img {
          object-fit: contain;
        }
      }
    }
    img {
      width: 100%;
      aspect-ratio: inherit;
      object-fit: cover;
    }
    .product-wrapper {
      padding-top: 10px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
    }
    .product-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
    }
    .product-name {
      text-decoration: none;
      font-family: 'Berthold Akzidenz Grotesk Medium';
      color: $white;
      text-align: left;
      font-size: 1.3em;
    }
    .product-price {
      text-decoration: none;
      color: $white;
      text-align: left;
      font-family: 'Berthold Akzidenz Grotesk' !important;
      font-weight: normal;
    }
    .product-link {
      text-decoration: none;
      color: $blue-powder;
      text-align: left;
      .material-icons, 
      .material-icons-outlined {
        font-size: 2em !important;
      }
    }
  }
}
@media (min-width: 672px) {
  .breadcrumbs,
  .fnb-title,
  .categories,
  .brands-list {
    padding-inline: 4%;
  }
  .products-list {
    padding-inline: 4%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 672px) and (max-width: 820px) {
  .products-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>