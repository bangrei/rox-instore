<template>
  <div class="head">
    <div class="slide-down">
      <div class="header-con default">
        <div class="header-wrapper header-wrapper-logo">
          <div class="header-logo-con left bordered">
            <img v-if="inited" width="35" height="35" alt="rox logo"
              :src="require('@/assets/images/rox-logo-2025.jpeg')" />
          </div>
        </div>
        <div class="header-wrapper centered guest">
          <base-desktop-nav v-if="inited" :no-search="true" :activeFooterId="activeFooterId"></base-desktop-nav>
        </div>
        <div class="header-wrapper end">
          <base-header-nav v-if="inited" :scanner-on="false" :noSearch="true" :activeFooterId="activeFooterId"></base-header-nav>
        </div>
      </div>
      <!-- <div class="header-auth" :class="{'bordered': isDesktop}">
        <base-store-header v-if="inited"
          @store-changed="storeChanged()"
          :show-content="true"
          :show-label="false"
          :is-desktop="true"
        ></base-store-header>
        <div class="auth-con" v-if="inited">
          <span @click="goSignup()" class="auth-btn">Create account</span>
          <span @click="goTo('LoginPage')" class="auth-btn active">Login</span>
        </div>
      </div> -->
    </div>
  </div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
export default {
  props: {
    inited: {
      type: Boolean,
      default: false,
    },
    activeFooterId: {
			type: Number,
			default: 0
		}
  },
  mixins: [utility],
}
</script>
<style scoped lang="scss">
.head {
  width: 100%;
  height: 70px;
  overflow: hidden;
}
.header-con {
  min-height: 100%;
}
</style>