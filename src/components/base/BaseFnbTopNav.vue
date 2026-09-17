<template>
  <div class="base-top-nav-list">
    <div class="base-top-nav-wrapper">
      <router-link to="/#activities" :class="['top-nav-item']">Activities</router-link>
      <router-link to="/shop/fnb" class="top-nav-item">Food & Beverage</router-link>
      <router-link to="/#grabmart" class="top-nav-item">GrabMart</router-link>
      <router-link to="/#partners" class="top-nav-item">Partners</router-link>
      <router-link to="/points" class="top-nav-item">Rewards</router-link>
    </div>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
// import { isEmpty } from "lodash";
export default {
  name: "BaseTopNav",
  mixins: [utility],
  props: {
    products: {
      type: Array,
      default: () => []
    }
  },
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
    }
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
    initData() {
      let w = window.innerWidth;
      this.isTablet = w >= 672 && w < 1024;
      // this.brands = this.$store.getters.getCuratedBrands;

      let app = this.$store.getters.getHeadquarter;
      let brands = app?.headquarter?.brand || [];
      let hq = app?.headquarter;
      let codes = hq?.app?.properties?.curatedBrands || [];
      this.specialBrands = brands.filter((b) => b.apiCode.includes(codes));
      this.brands = brands.filter((b) => {
        return this.products.filter((prd) => prd.brands?.map((it) => it.apiCode).includes(b.apiCode)).length > 0;
      });
      /* if (this.brands.length > 1 && (this.specialBrands.length == this.brands.length || this.specialBrands.length == 0)) {
        this.specialBrands = this.brands.slice(0, 1);
        this.brands = this.brands.slice(1, this.brands.length);
      } else {
        this.brands = this.brands.filter((b) => !b.apiCode.includes(codes));
      } */
      this.categories = this.mapProductCategories();
    },
  },
  watch: {
    products: {
      handler() {
        this.initData();
      },
      deep: true
    },
  },
  async created() {
    this.initData();
    window.addEventListener('resize', this.initData);
  },
  beforeUnmount(){
    window.removeEventListener('resize', this.initData);
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
      flex-direction: row !important;
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
}
@media (min-width: 672px) {
  .base-top-nav-list {
    width: 100%;
    display: block;
  }
	.base-top-nav-wrapper {
    width: 100% !important;
    max-width: 850px;
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 32px;
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