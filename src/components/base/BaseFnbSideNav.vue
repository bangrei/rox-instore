<template>
  <div class="side-con">
    <router-link v-for="item in items" :key="item.id" :to="targetLink(item)" :class="['side-con-item', {'active': item.id == activeIndex}]">
      <img class="side-image" :src="item.image" v-if="item.image" :alt="item.name" width="30" height="50"/>
      <span class="material-icons side-icon" v-else-if="item.icon">{{ item.icon }}</span>
      <span class="side-label">{{ item.title }}</span>
    </router-link>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
import outdoorFestivalIcon from "@/assets/icons/outdoor-festival-icon.png";
import shoppingBag from "@/assets/icons/shopping-bag.png";
// import peakPursuits from "@/assets/icons/peak-pursuits.png";
export default {
  name: "BaseSideNav",
  mixins: [utility],
  props: {
    activeIndex: {
      type: Number,
      default: 1,
    }
  },
  data() {
    return {
      items: [
        {
          id: 1,
          title: "Outdoor Festival",
          icon: "",
          image: outdoorFestivalIcon,
          link: "/"
        },
        // {
        //   id: 2,
        //   title: "Peak Pursuits",
        //   icon: "volcano",
        //   image: peakPursuits,
        //   link: '/events',
        // },
        {
          id: 3,
          title: "Online Store",
          icon: "shopping_bag",
          image: shoppingBag,
          link: "/shop/products"
        },
        {
          id: 4,
          title: "FAQ",
          icon: "contact_support",
          image: "",
          link: "/faq"
        }
      ]
    }
  },
  computed: {
    shopLink() {
      let apiCode = this.$route.params.outlet;
      if (!apiCode) {
        let outlet = this.$store.getters.getCurrentOutlet;
        apiCode = outlet.apiCode;
      }
      return `/shop/${apiCode}`;
    },
  },
  methods: {
    targetLink(item) {
      // if (item.id == 2) return this.shopLink;
      return item.link;
    }
  }
}
</script>
<style scoped lang="scss">
.side-con {
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid $secondary-color-10;
  padding: 10px 20px;
}
.side-con-item {
  text-decoration: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: fit-content;
  gap: 2px;
  &:hover {
    .side-icon {
      color: $secondary-color-80;
    }
  }
  .side-image {
    object-fit: contain;
    width: 30px;
    height: 50px;
    filter: grayscale(1);
    opacity: 0.5;
  }
  .side-icon {
    padding: 4px 16px;
    border-radius: 24px;
    color: rgba(46, 38, 61, 0.4);
    font-size: 2.5em;
  }
  .side-label {
    color: $secondary-color-60;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    font-weight: 600;
    color: rgba(46, 38, 61, 0.4);
  }
  &.active {
    .side-image {
      filter: grayscale(0) !important;
      opacity: 1 !important;
    }
    .side-icon {
      color: $main-red;
      // color: rgba(64, 64, 64, 1);
    }
    .side-label {
      color: rgba(64, 64, 64, 1);
    }
  }
}
@media (min-width: 672px) {
  .side-con {
    flex-direction: column !important;
    height: calc(100% - 70px);
    gap: 48px !important;
    justify-content: center !important;
    align-items: center;
    position: fixed;
    margin-block: auto;
    left: 0;
    top: 0;
    max-width: 80px;
  }
  .side-con-item {
    &.active {
      .side-label {
        margin-top: 4px;
      }
    }
  }
}
</style>