<template>
  <div class="base-top-nav-list">
    <router-link :to="allBrands" :class="['top-nav-item bold']">Shop Now</router-link>
    <div class="top-nav-item with-trigger" v-if="brands.length > 0">
      <span class="nav-trigger">Brands</span>
      <div class="nav-dropdown wide">
        <div class="nav-dropdown-item special">
          <div class="special-container">
            <!-- <div class="special-content">
              <div class="exclusive">Exclusive to R.O.X.</div>
              <router-link :to="itemLink('brand', sp.apiCode)" class="special-content-item" v-for="sp in specialBrands" :key="sp.id">
                <span class="special-title">{{ sp.name }}</span>
                <div class="special-content-img">
                  <img :src="brandImage(sp)" :alt="sp.name"/>
                </div>
                <div class="special-desc">{{ sp.description }}</div>
              </router-link>
            </div> -->
            <div class="other-links">
              <router-link :to="itemLink('brand', item.apiCode)" class="nav-dropdown-item" v-for="item in brands" :key="item.id">
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="top-nav-item with-trigger" v-if="categories.length > 0">
      <span class="nav-trigger">Category</span>
      <div class="nav-dropdown wide in-column">
        <div class="nav-dropdown-category" 
          v-for="cat in categories" :key="cat.name">
          <div class="nav-dropdown-item-block">
            <div class="nav-dropdown-item-block-title">
              {{ cat.name }} <i v-if="cat.hasChildren" class="material-icons nav-trigger">chevron_right</i>
            </div>
            <ul class="nav-dropdown-item-block-list">
              <li v-for="(item, index) in cat.children" :key="index">
                <router-link :to="itemLink('category', [cat.name,item.name].join(' '))">{{ item.name }}</router-link>
              </li>
              <li v-for="(it, ix) in cat.itemsOnly" :key="'only-'+ix">
                <router-link :to="itemLink('category', [cat.name, it].join(' '))">{{ it }}</router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="top-nav-item with-trigger">
      <span class="nav-trigger">Store Exclusive</span>
      <div class="nav-dropdown wide in-column">
        <div class="nav-dropdown-category">
          <div class="nav-dropdown-item-block">
            <div class="nav-dropdown-item-block-title in-column">
              <span>Food & Beverages</span>
              <a :href="peakpursuitsLink" class="nav-dropdown-item-block-title">Events</a>
            </div>
            <ul class="nav-dropdown-item-block-list permanent" v-if="foodBrands?.length > 0">
              <li v-for="brand in foodBrands" :key="brand.apiCode">
                <img v-if="brand.bannerDisplay" :src="brand.bannerDisplay" width="200" height="200" :alt="brand.name" />
                <router-link class="brand-name" :to="'/shop/fnb/' + brand.apiCode">{{ brand.name }} </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <a :href="peakpursuitsLink" class="top-nav-item block">Join Peak Pursuits</a>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
// import { isEmpty } from "lodash";
export default {
  name: "BaseTopNav",
  mixins: [utility],
  data() {
    return {
      brands: [],
      categories: [],
      moreCategories: [],
      showMore: false,
      showBrands: false,
      isTablet: false,
      specialBrands: [],
    }
  },
  computed: {
    peakpursuitsLink(){
      return process.env.VUE_APP_PEAKPURSUITS_DOMAIN;
    },
    foodBrands(){
      if(isEmpty(this.brands)) return [];
      let fbrands = this.brands.filter((it) => it.type == "FOOD");
      return fbrands.map((it) => {
        let brandBanner = it.custom.brandBanner;
        return {
          ...it,
          bannerDisplay: brandBanner ? this.getImage(brandBanner, 'width=300') : '',
        };
      });
    },
    allBrandsActive() {
      let currentRoute = this.$router.currentRoute.value;
      return currentRoute.name == "ProductsPage";
      /*
      let brandParam = this.$route.params.brandCode;
      return !brandParam
      */
    },
    allBrands() {
      return `/shop/products`;
    },
    currentOutlet() {
      return this.$store.getters.getCurrentOutlet;
    },
  },
  methods: {
    brandImage(brand) {
      let image = brand.imageId;
      if (!image) return "";
			return this.$store.getters.cloudinaryURL + "" + image;
    },
    itemLink(type, name) {
      let names = name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
        if (it.toUpperCase() == it) return it;
        return it.toLowerCase();
      });
      if (type == "brand") names = [name];
      return `/collections/${type}/${names.join('-')}`;
    },
    isActiveBrand(item) {
      let brandParam = this.$route.params.brandCode;
      return item.apiCode == brandParam;
    },
    toggleNav() {
      this.showMore = !this.showMore;
    },
    initNav() {
      let w = window.innerWidth;
      this.isTablet = w >= 672 && w < 1024;
      // this.brands = this.$store.getters.getCuratedBrands;

      let app = this.$store.getters.getHeadquarter;
      let brands = app?.headquarter?.brand || [];
      let hq = app?.headquarter;
      // let products = this.$store.getters.getProducts;
      let codes = hq?.app?.properties?.curatedBrands || [];
      this.specialBrands = brands.filter((b) => b.apiCode.includes(codes));
      this.brands = brands;
      /* if (this.brands.length > 1 && (this.specialBrands.length == this.brands.length || this.specialBrands.length == 0)) {
        this.specialBrands = this.brands.slice(0, 1);
        this.brands = this.brands.slice(1, this.brands.length);
      } else {
        this.brands = this.brands.filter((b) => !b.apiCode.includes(codes));
      } */
      this.categories = this.mapProductCategories();
    },
    onResizeNav() {
      if (this._navResizeTimer) clearTimeout(this._navResizeTimer);
      this._navResizeTimer = setTimeout(() => {
        this.initNav();
      }, 150);
    },
  },
  async created() {
    window.addEventListener('resize', this.onResizeNav);
    if (!this.$store.getters.hasInited) {
      await this.refreshMainData(true);
      this.$store.dispatch('setInited', true);
    }
    this.initNav();
  },
  beforeUnmount(){
    window.removeEventListener('resize', this.onResizeNav);
    if (this._navResizeTimer) clearTimeout(this._navResizeTimer);
  }
}
</script>
<style scoped lang="scss">
.base-top-nav-list {
  display: none;
  width: 0;
  color: $dark-color-2;
  font-size: 17px;
  line-height: 26px;
  letter-spacing: 0px;
}
.top-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-block: 8px;
  color: $dark-color-2;
  text-decoration: none;
  white-space: nowrap;
  font-size: 17px;
  line-height: 26px;
  letter-spacing: 0px;
  font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
  &:not(.with-trigger){
    cursor: pointer;
  }
  &:hover {
    .nav-trigger {
      opacity: 0.7;
    }
  }
  &.bold {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
  }
  &.active {
    color: $main-red;
  }
  &.with-trigger {
    position: relative;
  }
  &.sale {
    color: $main-red;
  }
  &:is(.block){
    font-size: 0.9em;
    padding: 4px 20px;
    border-radius: 999px;
    color: $white !important;
    background: $main-red !important;
  }
}
.nav-trigger,
.nav-no-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: $secondary-color-90;
  cursor: pointer;
  &:is(.active){
    color: $main-red !important;
    opacity: 1 !important;
  }
  .material-icons {
    pointer-events: none;
  }
  & * {
    text-decoration: none;
    color: $secondary-color-90;
  }
}
.nav-dropdown {
  display: none;
  &.active {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0;
    background: $white;
    top: 50px;
    min-width: 200px;
    z-index: 100;
    overflow: hidden;
    max-height: 500px;
    overflow-y: auto;
    transition: all 0.3s ease-in-out;
    -webkit-transition: all 0.3s ease-in-out;
    &:not(.wide){
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
      -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    }
    &.wide {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      -webkit-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 110px;
      left: 0;
      right: 0;
      width: 100%;
      // max-width: calc(100% - 48px) !important;
      // margin-inline: auto;
      padding-inline: 80px;
      &:not(.in-column){
        flex-direction: row !important;
      }
      &:is(.in-column){
        flex-direction: column !important;
        padding-inline: 80px 0px !important;
        gap: 16px;
        padding-block: 40px;
        .nav-dropdown-item {
          align-items: flex-start !important;
        }
      }
    }
    &.scrolling {
      top: 70px !important;
    }
  }
  .nav-dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding-inline: 16px;
    min-height: 40px;
    text-align: left;
    text-decoration: none;
    color: $secondary-color-90;
    font-weight: normal !important;
    &:not(.special):hover {
      background: $secondary-color-20;
      cursor: pointer;
    }
    &.special {
      flex-direction: column;
      gap: 16px;
      .special-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 24px;
      }
      .exclusive {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 24px;
        font-size: 1.2em;
      }
      .special-content {
        display: flex;
        flex-direction: row;
        gap: 24px;
        .special-content-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          gap: 12px;
          text-decoration: none;
          color: $secondary-color-90;
          .special-title {
            font-size: 0.8em;
            border: 1px solid $secondary-color-20;
            border-radius: 24px;
            padding: 2px 10px;
            width: fit-content;
            font-family: 'Berthold Akzidenz Grotesk';
          }
          .special-desc {
            font-size: 0.9em;
            max-width: 150px;
            overflow: hidden;
            display: flex;
            flex-wrap: wrap;
            white-space: wrap;
            font-family: 'Berthold Akzidenz Grotesk';
            line-height: 22px;
          }
          .special-content-img {
            width: 150px;
            aspect-ratio: 1/1;
            border: 1px solid $secondary-color-10;
            border-radius: 8px;
          }
          img {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: contain;
          }
        }
      }
      .other-links {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 0px;
        height: fit-content;
        padding-block: 24px;
        font-weight: normal;
      }
      .sub-categories {
        flex: 1;
        display: flex;
        flex-wrap: nowrap;
        min-height: 200px;
        align-items: baseline;
        justify-content: space-evenly;
        padding-block: 24px;
        .nav-dropdown-item {
          width: fit-content !important;
          cursor: auto !important;
          &:hover { background: $white !important;}
        }
        .item-category {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          .item-category-title {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            padding-bottom: 12px;
            text-decoration: none;
            color: $dark-color-2;
            &:hover{ color: $primary-color-60;}
          }
          .item-category-sub {
            font-family: 'Berthold Akzidenz Grotesk', sans-serif;
            cursor: pointer;
            padding-bottom: 8px;
            text-decoration: none;
            color: $dark-color-2;
            font-weight: normal !important;
            &:hover{ color: $primary-color-60;}
          }
        }
      }
    }
  }
  .nav-dropdown-item-block {
    width: 100%;
    display: flex;
    gap: 24px;
    .nav-dropdown-item-block-title {
      cursor: pointer;
      text-decoration: none;
      color: $secondary-color-80;
      width: 100%;
      max-width: 200px;
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: space-between;
      height: fit-content;
      &:is(.in-column){
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
      }
      &:not(.in-column):hover{
        opacity: 0.7;
      }
    }
    .nav-dropdown-item-block-list {
      &:not(.active){
        display: none;
      }
      &:is(.active),
      &:is(.permanent){
        padding: 0;
        width: 100%;
        display: flex !important;
        flex-direction: row;
        padding-bottom: 10px;
        flex-wrap: wrap;
      }
      gap: 20px;
      text-decoration: none;
      list-style: none;
      font-family: 'Berthold Akzidenz Grotesk' !important;
      max-width: 100%;
      overflow: hidden;
      white-space: normal;
      a {
        text-decoration: none;
        color: $secondary-color-80;
        outline: none;
        width: 100%;
        aspect-ratio: 1/1;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
        z-index: 2;
        background: rgba(0,0,0,.2) !important;
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        pointer-events: none;
        z-index: 1;
      }
      li, a {
        position: relative;
        min-width: 150px;
        max-width: 150px;
        aspect-ratio: 1/1;
        background: $brown-dark;
        color: $white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
        text-align: center;
        &:hover {
          opacity: 0.7;
        }
      }
    }
  }
}
@media (min-width: 672px) {
	.base-top-nav-list {
    width: 100% !important;
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 54px;
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .base-top-nav-list {
    display: none !important;
  }
}
/* @media (max-height: 768px) and (max-width: 1024px) {
  .base-top-nav-list {
    display: flex !important;
  }
} */
</style>