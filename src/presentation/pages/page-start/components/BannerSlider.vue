<template>
  <div class="banner-slider-x">
    <swiper 
      :modules="modules" 
      :slides-per-view="1" 
      :loop="banners.length > 1" 
      :autoplay="{ delay: 5000 }" 
      :pagination="{
        clickable: true,
        el: '.swiper-pagination',
      }"
      class="banner-slider">
      <swiper-slide v-for="(banner, index) in banners" :key="index">
        <picture>
          <source
            type="image/webp"
            :srcset="banner.srcset"
            sizes="100vw"
          />
          <img
            :src="banner.fallback"
            alt="R.O.X Outdoor Festival"
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
  name: "BannerSlider",
  components: { Swiper, SwiperSlide },
  data() {
    return {
      modules: [Pagination, Autoplay],
      banners: [
        {
          srcset: `
            ${require('@/assets/bannerslider/banner-home-480w.webp')} 480w,
            ${require('@/assets/bannerslider/banner-home-768w.webp')} 768w,
            ${require('@/assets/bannerslider/banner-home-1200w.webp')} 1200w,
            ${require('@/assets/bannerslider/banner-home-1600w.webp')} 1600w,
            ${require('@/assets/bannerslider/banner-home-1920w.webp')} 1774w
          `,
          fallback: require('@/assets/bannerslider/banner-home-1600w.webp')
        },
      ]
    };
  }
};
</script>
<style scoped lang="scss">
.banner-slider-x {
  width: 100%;
  position: relative;
  .banner-slider {
    width: 100%;
    height: 100%;
  }
  .swiper-slide, picture, img {
    width: 100%;
    object-fit: cover;
  }
}
@media (max-width: 672px) {
  .banner-slider-x {
    aspect-ratio: 5/1.5;
  }
  .banner-slider {
    aspect-ratio: 5/1.5;
  }
  .swiper-slide, picture, img {
    aspect-ratio: 5/1.5;
  }
}
</style>
