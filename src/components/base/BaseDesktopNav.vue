<template>
  <div class="desktop-nav">
    <div
      :class="{ active: footerNav.isActive }"
      class="desktop-nav-item"
      v-for="footerNav in availableFooterNavs"
      :key="footerNav.id"
      @click="handleFooterNavClick(footerNav)"
    >
      <div
        class="desktop-nav-icon-wrapper"
        :class="{ active: footerNav.isActive }"
      >
        <span
          class="md-24"
          :class="{
            'material-icons-outlined': footerNav.isOutlined,
            'material-icons': !footerNav.isOutlined,
          }"
          >{{ footerNav.tagIcon }}</span
        >
      </div>
      <p class="body-3-tight medium">{{ footerNav.tagString }}</p>
    </div>
  </div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
export default {
  name: "BaseFooterNav",
  props: {
    activeFooterId: {
      type: Number,
      default: 0, // HomePage
    },
  },
  mixins: [utility],
  data() {
    return {
      footerNavs: [
        {
          id: 0,
          tagName: "Home",
          tagString: "Home",
          tagIcon: "cabin",
          isOutlined: false,
          isActive: true,
          hidden: false,
        },
        {
          id: 1,
          tagName: "Event",
          tagString: "Event",
          tagIcon: "hiking",
          //tagIcon: "cabin",
          isOutlined: false,
          isActive: false,
          hidden: false,
        },
        {
          id: 2,
          tagName: "Shop",
          tagString: "Shop",
          tagIcon: "shopping_bag",
          isOutlined: true,
          isActive: false,
          hidden: false,
        },
        {
          id: 3,
          tagName: "Feeds",
          tagString: "Feeds",
          tagIcon: "person",
          //tagIcon: "hiking",
          isOutlined: true,
          isActive: false,
          hidden: false,
        },
        {
          id: 4,
          tagName: "Profile",
          tagString: "Profile",
          tagIcon: "emoji_people",
          isOutlined: false,
          isActive: false,
          hidden: true,
        },
      ],
    };
  },
  computed: {
    availableFooterNavs() {
      return this.footerNavs.filter((it) => {
        return !it.hidden;
      });
    },
  },
  methods: {
    handleFooterNavClick(footerNav) {
      if (!footerNav) return;
      this.footerNavs.map((it) => (it.isActive = false));
      this.footerNavs.find((it) => it.id == footerNav.id).isActive = true;

      if (this.activeFooterNavId == footerNav.id) return;
      if (footerNav.id == 0) {
        return this.$router.push({ name: "WelcomePage" });
      }
      if (footerNav.id == 1) return this.$router.push({ name: "EventsPage" });
      if (footerNav.id == 2) {
        let outlet = this.$store.getters.getCurrentOutlet;
        let apiCode = isEmpty(outlet) ? -1 : outlet.apiCode;
        return this.goToWithParams('ShopPage', {
          outlet: apiCode
        });
      }
      if (footerNav.id == 3) return this.$router.push({ name: "FeedPage" });
      if (footerNav.id == 4) return this.$router.push({ name: "Profile" });
    },
  },
  async created() {
    if (!this.$store.getters.isLoggedIn) {
      this.footerNavs.forEach((f) => {
        if (["Profile"].indexOf(f.tagName) > -1) f.hidden = true;
      });
    }
    this.footerNavs.map((it) => (it.isActive = false));
    if (this.activeFooterId != null) {
      this.footerNavs.find(
        (it) => it.id == this.activeFooterId
      ).isActive = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.desktop-nav {
  display: none;

  .desktop-nav-item {
    padding: 5px;
    cursor: pointer;
		display: flex;
    flex-direction: column;
    justify-content: center;
		border-bottom: 6px solid transparent;
		&.active {
      border-bottom-color: $primary-color-60;
    }

    .desktop-nav-icon-wrapper {
      margin: 0 auto;
      max-width: 64px;
      border-radius: 20px;
      padding: 2px 16px;
      display: flex;
      justify-content: center;
      align-items: center;

      .material-icons {
        &:hover {
          animation: iconShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          backface-visibility: hidden;
          transform-origin: top right;
        }
      }

      &.active {
        transition: all 0.5s;
      }
    }

    p {
      margin-top: 2px;
    }
  }
}
@media (min-width: 672px) {
  .desktop-nav {
    display: flex;
    justify-content: space-around;
    padding: 0;
    gap: 6px;
		background: $white;
		color: $secondary-color-100;
		padding-inline: 32px;
		height: 100%;
  }
}
</style>
