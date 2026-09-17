<template>
  <div class="side-con">
    <router-link v-for="item in items" :key="item.id" :to="targetLink(item)" :class="['side-con-item', {'active': item.id == activeIndex}]">
      <span class="material-icons-outlined side-icon">{{ item.icon }}</span>
      <span class="side-label">{{ item.title }}</span>
    </router-link>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
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
          title: "Home",
          icon: "cabin",
          link: "/"
        },
        {
          id: 2,
          title: "Shop",
          icon: "shopping_bag",
          link: '/shop',
        },
        // {
        //   id: 3,
        //   title: "Events",
        //   icon: "hiking",
        //   link: "/events"
        // },
        {
          id: 4,
          title: "Feeds",
          icon: "explore",
          link: "/feeds"
        },
        {
          id: 5,
          title: "Rewards",
          icon: "emoji_events",
          link: "/points"
        },
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
      background-color: $primary-color-10;
    }
  }
  .side-icon {
    padding: 4px 16px;
    border-radius: 24px;
    color: rgba(46, 38, 61, 0.4);
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
    .side-icon {
      background: $primary-color-20;
      color: rgba(64, 64, 64, 1);
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
    gap: 32px !important;
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