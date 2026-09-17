<template>
  <div class="banner-slider-wrapper custom-block">
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
      <swiper-slide v-for="(slide, index) in slides" :key="index">
        <div class="cb-container">
          <div class="cb-info">
            <div class="cb-info__title">{{ slide.title }}</div>
            <div class="cb-info__desc" v-for="(desc, i) in slide.description" :key="i">{{ desc }}</div>
            <button type="button" 
              class="cb-info__button" 
              @click="clickSlide(slide)">
              {{ slide.button }}
            </button>
          </div>
          <div class="cb-image">
            <img :src="slide.image" alt="GrabMart"/>
          </div>
        </div>
      </swiper-slide>
      <div class="swiper-navigation">
        <div class="swiper-button-prev">
          <i class="material-icons-outlined">arrow_back</i>
        </div>
        <div class="swiper-button-next">
          <i class="material-icons-outlined">arrow_forward</i>
        </div>
      </div>
    </swiper>
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
  name: "CustomBlock",
  components: { Swiper, SwiperSlide },
  data(){
    return {
      loading: false,
      modules: [Navigation, Autoplay],
      slides: [
        {
          title: "Get outside in the heart of the city",
          description: [
            `The R.O.X. Outdoor Festival brings the excitement of the outdoors to the concrete jungle of Bonifacio Global City.`,
            `Experience the brand’s biggest festival yet as it transforms an urban, open space into a vibrant community hub of activity zones, brand activations, and local F&B pop-ups.`
          ],
          image: banner,
          button: "Sign up now",
          requireLogin: true,
        },
        {
          title: "Gear up at the next stop",
          description: [
            `R.O.X. is leveling up!`,
            `While the brand’s iconic, 3-story flagship store in Bonifacio High Street undergoes a major transformation from August to September, the R.O.X. branches in Mitsukoshi BGC, SM Megamall, and One Ayala Makati are excited to welcome emerging explorers ready for their next adventure`
          ],
          image: banner2,
          button: "Read more",
          requireLogin: false,
        },
      ],
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  },
  methods: {
    clickSlide(slide) {
      let page = '/login';
      if(!slide.requireLogin) {
        page = '/events';
      } else if (this.isLoggedIn) {
        page = '/events';
      }
      this.$router.push(page);
    }
  }
}
</script>
<style scoped lang="scss">
.swiper-navigation {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  z-index: 10;
  .swiper-button-prev,
  .swiper-button-next {
    position: static; // disable Swiper's default positioning
    margin-top: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $white;
    border: 2px solid $main-red;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &::after {
      display: none; // hide default arrow icon
    }
    i {
      font-size: 24px;
      color: $main-red;
    }
  }
}
.cb-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  position: relative;
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
.cb-image {
  flex: 1;
  aspect-ratio: 5/3;
  overflow: hidden;
  border-radius: 16px;
  img {
    width: 100%;
    aspect-ratio: inherit;
    border-radius: 16px;
    object-fit: cover;
  }
}
@media (min-width: 672px) {
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
  .cb-container {
    flex-direction: column !important;
    aspect-ratio: unset !important;
  }
}
</style>