<template>
  <div class="banner-slider-wrapper">
    <swiper 
      :modules="modules" 
      :slides-per-view="1" 
      :loop="true" 
      :autoplay="{ delay: 5000000 }" 
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
            ${require('@/assets/bannerslider/banner-1-480w.webp')} 480w,
            ${require('@/assets/bannerslider/banner-1-768w.webp')} 768w,
            ${require('@/assets/bannerslider/banner-1-1200w.webp')} 1200w,
            ${require('@/assets/bannerslider/banner-1-1600w.webp')} 1600w,
            ${require('@/assets/bannerslider/banner-1-1920w.webp')} 1920w
          `,
          fallback: require('@/assets/bannerslider/banner-1-1600w.webp')
        },
        {
          srcset: `
            ${require('@/assets/bannerslider/banner-2-480w.webp')} 480w,
            ${require('@/assets/bannerslider/banner-2-768w.webp')} 768w,
            ${require('@/assets/bannerslider/banner-2-1200w.webp')} 1200w,
            ${require('@/assets/bannerslider/banner-2-1600w.webp')} 1600w,
            ${require('@/assets/bannerslider/banner-2-1920w.webp')} 1920w
          `,
          fallback: require('@/assets/bannerslider/banner-2-1600w.webp')
        },
        {
          srcset: `
            ${require('@/assets/bannerslider/banner-3-480w.webp')} 480w,
            ${require('@/assets/bannerslider/banner-3-768w.webp')} 768w,
            ${require('@/assets/bannerslider/banner-3-1200w.webp')} 1200w,
            ${require('@/assets/bannerslider/banner-3-1600w.webp')} 1600w,
            ${require('@/assets/bannerslider/banner-3-1920w.webp')} 1920w
          `,
          fallback: require('@/assets/bannerslider/banner-3-1600w.webp')
        },
      ]
    };
  }
};
</script>
