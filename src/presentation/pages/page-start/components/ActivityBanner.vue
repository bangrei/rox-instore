<template>
  <div class="activity-slider-wrapper">
    <swiper 
      :modules="modules" 
      :slides-per-view="1" 
      :loop="true" 
      :autoplay="{ delay: 5000000 }" 
      :pagination="{
        clickable: true,
        el: '.swiper-pagination',
      }"
      class="activity-slider">
      <swiper-slide v-for="(banner, index) in banners" :key="index">
        <picture>
          <source
            :type="banner.type"
            :srcset="banner.srcset"
            sizes="100vw"
          />
          <img
            :src="banner.fallback"
            alt="R.O.X Outdoor Activities"
            :loading="index == 0 ? 'eager' : 'lazy'"
          />
        </picture>
      </swiper-slide>
      <!-- <div class="swiper-pagination"></div> -->
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore, { Pagination, Autoplay } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Install Swiper modules
SwiperCore.use([Pagination, Autoplay]);

export default {
  name: "ActivityBanner",
  components: { Swiper, SwiperSlide },
  data() {
    return {
      modules: [Pagination, Autoplay],
      banners: [
        {
          type: "image/png",
          srcset: `
            ${require('@/assets/bannerslider/activities-table.png')} 480w,
            ${require('@/assets/bannerslider/activities-table.png')} 768w,
            ${require('@/assets/bannerslider/activities-table.png')} 1200w,
            ${require('@/assets/bannerslider/activities-table.png')} 1600w,
            ${require('@/assets/bannerslider/activities-table.png')} 1920w
          `,
          fallback: require("@/assets/bannerslider/activities-table.png")
        },
      ]
    };
  }
};
</script>
<style lang="scss" scoped>
.activity-slider-wrapper {
  width: 100%;
  padding: 20px;
  overflow: hidden;
  .swiper-slide {
    width: 100%;
    img {
      min-width: 100%;
      max-width: 100%;
      height: auto !important;
    }
  }
}
</style>
