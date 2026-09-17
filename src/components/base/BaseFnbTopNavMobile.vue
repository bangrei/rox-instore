<template>
  <div class="base-top-nav-mobile" ref="modalRef">
    <div class="base-top-nav-mobile-trigger" @click="toggleContent()">
      <i class="material-icons icon-trigger">menu</i>
    </div>
    <div :class="['base-top-nav-mobile-content', {'active': showContent}]">
      <router-link to="/#activities" :class="['top-nav-item']">Activities</router-link>
      <router-link to="/shop/fnb" :class="['top-nav-item']">Food & Beverage</router-link>
      <router-link to="/#grabmart" :class="['top-nav-item']">GrabMart</router-link>
      <router-link to="/#partners" :class="['top-nav-item']">Partners</router-link>
      <router-link to="/points" :class="['top-nav-item']">Rewards</router-link>
      <router-link to="/shop/products" :class="['top-nav-item']">Online Store</router-link>
    </div>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
export default {
  name: "BaseTopNavMobile",
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
      showContent: false,
    }
  },
  computed: {
    allBrandsActive() {
      let brandParam = this.$route.params.brandCode;
      return !brandParam
    },
    allBrands() {
      return `/shop`;
    },
    currentOutlet() {
      return this.$store.getters.getCurrentOutlet;
    }
  },
  methods: {
    itemLink(item) {
      return `/collections/brand/${item.apiCode}`
    },
    categoryLink(item) {
      return `/collections/category/${this.slugName(item)}`
    },
    isActiveBrand(item) {
      let brandParam = this.$route.params.brandCode;
      return item.apiCode == brandParam;
    },
    toggleContent() {
      this.showContent = !this.showContent;
    },
    handleClickOutside(event){
      if (this.$refs.modalRef && !this.$refs.modalRef.contains(event.target)) {
        this.showContent = false
      }
    },
    init(){
      let hq = this.$store.getters.getHeadquarter;
      let allBrands = [];
      if(!isEmpty(hq) && !isEmpty(hq.headquarter)){
        allBrands = hq.headquarter.brand;
      }
      if(!isEmpty(allBrands) && !isEmpty(this.products)){
        allBrands = allBrands.filter((b) => {
          return this.products?.filter((prd) => prd.brands?.map((it) => it.apiCode).includes(b.apiCode)).length > 0;
        });
      }
      this.brands = allBrands;
      this.categories = this.mapProductCategories();
    }
  },
  watch: {
    products: {
      handler() {
        this.init();
      },
      deep: true
    },
  },
  created() {
    this.init()
    document.body.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount(){
    document.body.removeEventListener('click', this.handleClickOutside);
  }
}
</script>
<style scoped lang="scss">
.base-top-nav-mobile {
  // display: none;
  display: flex;
  width: fit-content;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  overflow: visible;
  z-index: 100;
  position: relative;
  .base-top-nav-mobile-trigger {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: fit-content;
    cursor: pointer;
    color: $dark-color-1;
    .icon-trigger {
      font-size: 32px !important;
    }
  }
  .base-top-nav-mobile-content {
    min-width: 300px;
    max-width: 400px;
    display: flex !important;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    position: fixed;
    top: 0;
    bottom: 0;
    left: -100%;
    background: $white;
    max-height: 100%;
    height: 100%;
    overflow-y: auto;
    transition: all 0.25s ease-in-out;
    -webkit-transition: all 0.25s ease-in-out;
    padding: 24px;
    &.active {
      left: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
      -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    }
  }
}
.list-groups {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  .list-groups-trigger {
    font-weight: bold;
    font-size: 0.9em;
    width: 100%;
    text-align: left;
    padding-block: 4px;
    color: $dark-color-2;
    cursor: pointer;
    position: relative;
    height: 30px;
    margin: 8px 0 0 0;
    &::before {
      content: attr(data-label);
      height: 30px;
      width: calc(100% - 24px);
      position: absolute;
      left: 0;
      pointer-events: none;
      background: $white;
      font-size: 17px;
      font-weight: 600;
      line-height: 26px;
      letter-spacing: 0px;
    }
    &::after {
      position: absolute;
      right: 0;
      content: "arrow_drop_down";
      font-family: "Material Icons Outlined";
      pointer-events: none;
      font-size: 17px !important;
    }
    &:checked {
      & + .list-group-items {
        max-height: unset !important;
      }
    }
  }
  .list-group-items {
    width: 100%;
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    transition: all 0.25s ease-in-out;
    -webkit-transition: all 0.25s ease-in-out;
    overflow: hidden;
    max-height: 0;
    & .top-nav-item {
      padding-block: 0 !important;
    }
  }
}
.top-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 8px;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  width: 100%;
  position: relative;
  min-height: 40px;
  color: $dark-color-2;
  font-size: 17px;
  font-weight: 600;
  line-height: 26px;
  letter-spacing: 0px;
  & .item-link {
    min-height: 40px;
    display: flex;
    align-items: center;
    text-decoration: none;
    font-weight: 400;
    color: $dark-color-2;
    &.bold {
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      font-weight: normal !important;
    }
  }
  &.active {
    color: $primary-color-60;
  }
  &.with-trigger {
    padding-block: 0 !important;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    &::after {
      position: absolute;
      right: 0;
      top: 6px;
      content: "arrow_drop_down";
      font-family: "Material Icons Outlined";
      pointer-events: none;
    }
    input {
      height: 30px;
      width: 20px;
      position: absolute;
      right: 0%;
      opacity: 0;
      cursor: pointer;
      &:checked + .list-group-items {
        max-height: unset !important;
      }
    }
  }
  &.block {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-weight: normal !important;
    padding-block: 0px !important;
  }
  &.sale {
    font-weight: normal !important;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    color: $main-red;
  }
}
.nav-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  .material-icons {
    pointer-events: none;
  }
}
.nav-dropdown {
  display: none;
  &.active {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0;
    border-radius: 6px;
    background: $white;
    top: 50px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    min-width: 200px;
    z-index: 100;
    overflow: hidden;
  }
  .nav-dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding-inline: 16px;
    min-height: 40px;
    text-align: left;
    text-decoration: none;
    color: $secondary-color-90;
    &:hover {
      background: $secondary-color-20;
    }
  }
}
@media (min-width: 672px) {
	.base-top-nav-mobile {
    display: none !important;
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
  .list-group-items {
    &:hover {
      .top-nav-item:not(:hover):not(.active){
      color: $secondary-color-50;
      }
      .top-nav-item:not(:hover):is(.active){
      color: $primary-color-40;
      }
    }
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .base-top-nav-mobile {
    display: flex !important;
    width: fit-content !important;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;
    overflow: visible !important;
    z-index: 100;
  }
}
/* @media (max-height: 768px) and (max-width: 1024px) {
  .base-top-nav-list {
    display: none !important;
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
} */
</style>
