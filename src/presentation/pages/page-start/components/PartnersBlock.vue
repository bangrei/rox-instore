<template>
  <div class="cb-container">
    <div class="cb-info">
      <div class="cb-info__title">{{ slide.title }}</div>
      <div class="cb-info__desc" v-for="(desc, i) in slide.description" :key="i">{{ desc }}</div>
    </div>
    <div class="cb-images">
      <div class="banner-slider-wrapper custom-block partners">
        <div class="swiper-button-prev">
          <i class="material-icons-outlined">chevron_left</i>
        </div>
        <swiper 
          :modules="modules" 
          :slides-per-view="1" 
          :loop="true"
          :pagination="{ clickable: true, el: '.swiper-pagination'}"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }"
          class="banner-slider">
          <swiper-slide v-for="(banner, index) in slide.banners" :key="index">
            <div class="image-item">
              <img :src="banner" alt="GrabMart"/>
            </div>
          </swiper-slide>
        </swiper>
        <div class="swiper-button-next">
          <i class="material-icons-outlined">chevron_right</i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore, { Navigation, Autoplay } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import banner from "@/assets/bannerslider/banner-3-768w.webp";
import banner2 from "@/assets/bannerslider/custom-block-2.png";
SwiperCore.use([Navigation, Autoplay]);

export default {
  name: "PartnersBlock",
  components: { Swiper, SwiperSlide },
  data(){
    return {
      loading: false,
      modules: [Navigation, Autoplay],
      slide: {
        title: "Partners",
        description: [
          `R.O.X. is expanding its playground from the city center to the great outdoors. We’re partnering with like-minded experience providers, fellow retailers, and local merchants to bring together a community of outdoor enthusiasts where every interaction is an invitation to explore and connect.`,
          `Tara! Let’s take your brand outside! `
        ],
        banners: [banner, banner2]
      }
    }
  }
}
</script>
<style scoped lang="scss">
.partners {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;
  position: relative;
}
.swiper-button-prev,
.swiper-button-next {
  position: absolute;
  min-width: 40px;
  min-height: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $secondary-color-100;
  color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &::after {
    display: none; // hide default arrow icon
  }
  i {
    font-size: 32px !important;
    color: $white;
  }
}
.swiper-button-prev {
  left: 0;
}
.swiper-button-next {
  right: 0;
}
.cb-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  padding-inline: 20px;
}
.cb-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
  &__title {
    font-size: 30px;
    font-family: "Berthold Akzidenz Grotesk Medium";
    color: $main-red;
    margin-bottom: 20px;
    line-height: normal;
  }
  &__desc {
    color: $secondary-color-60;
    display: block;
    margin-bottom: 16px;
  }
  &__button {
    padding-inline: 32px;
    padding-block: 8px;
    border-radius: 24px;
    background: $main-red;
    color: $white;
    font-family: "Berthold Akzidenz Grotesk Medium";
    border: none;
    cursor: pointer;
    width: fit-content;
    box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
    &:hover {
      background: $primary-color-60;
    }
  }
}
.cb-images {
  flex: 1;
  aspect-ratio: 5/3;
  .custom-block {
    padding: 0 !important;
    position: relative;
    aspect-ratio: 5/3 !important;
  }
  .banner-slider {
    aspect-ratio: 5/3 !important;
  }
}
.image-item {
  aspect-ratio: 5/3;
  border-radius: 16px;
  img {
    width: 100%;
    aspect-ratio: inherit;
    border-radius: 16px;
    object-fit: cover;
  }
}
@media (min-width: 672px) {
  .swiper-button-prev,
  .swiper-button-next {
    position: sticky;
  }
  .cb-container {
    flex-direction: row !important;
    justify-content: space-between;
    aspect-ratio: 5/1.5;
  }
  .cb-info {
    padding-top: 12px;
  }
  .swiper-navigation {
    left: 50%;
    transform: translateX(-50%);
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .swiper-button-prev,
  .swiper-button-next {
    position: absolute !important;
  }
  .cb-container {
    flex-direction: column !important;
    aspect-ratio: unset !important;
  }
}
</style>