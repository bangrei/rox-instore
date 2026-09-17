<template>
  <div class="bps-container" :class="{'empty': isPromoEmpty}">
    <carousel ref="promo-carousel" :transition="500" :wrap-around="true" :autoplay="autoPlayTimer">
      <slide v-for="content in contents" :key="content.index">
				<div class="slide-label">{{ content.name }}</div>
			</slide>
      <template #addons>
				<navigation>
					<template #next><i class="material-icons-outlined">arrow_right</i></template>
					<template #prev><i class="material-icons-outlined">arrow_left</i></template>
				</navigation>
			</template>
    </carousel>
  </div>
</template>
<script>
import { storeService } from "@/bloc/services";
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import { ref, reactive } from "vue";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
import initData from "@/init";

export default {
  name: "BasePromoSlides",
  data() {
    return {
      promotions: [],
      swiperRef: null,
      contents: [],
      currentContent: null,
      currentActiveIndex: 0,
      isDesktop: true,
      slidesPerView: 1,
      autoPlayTimer: 0,
    }
  },
  components: {
    Carousel,
    Slide,
    Navigation,
  },
  computed: {
    contentLength() {
      let num = this.contents.length;
      let perView = this.slidesPerView;
      let len = Math.ceil(num / perView);
      if (num % perView > 0) len += 1;
      return len;
    },
    isPromoEmpty(){
      return isEmpty(this.promotions);
    }
  },
  watch: {
    autoPlayTimer(val) {
      if (!this.$refs['promo-carousel']) return;
      this.$refs['promo-carousel'].data.config.autoplay = val;
      this.$refs['promo-carousel'].restartCarousel();
    }
  },
  methods: {
    async fetchPromotions() {
      let callAPI = true;
      let json = {};
      let homeState = this.$store.getters.getStateHomePage || {};
      if(!homeState.lastUpdated) {
        json = initData["promotionData"] ? initData["promotionData"] : {};
        if (!isEmpty(json) && json.success) callAPI = false;
      } else {
        let now = moment();
        let expDate = moment(homeState.lastUpdated);
				callAPI = !expDate.isAfter(now);
        if(!callAPI) {
          json = { success: true, promotions: homeState.promotions }
        }
      }
      if(callAPI) json = await storeService.retrievePromotions();
      if (!json?.success) return;
      const promos = json.promotions.filter((it) => it.publishType == "INFORMATIONAL" && it.displayAsBanner != true);
      this.promotions = promos;
      this.contents = ref(this.promotions);
			this.currentContent = reactive({});
			if(!isEmpty(this.contents)) this.currentContent.value = this.contents[0];
			if (this.contentLength > 1) this.autoPlayTimer = 2000;
    },
    setSwiperRef(swiper) {
      this.swiperRef = swiper;
    },
    onSlideChange() {
      this.currentContent.value = this.contents[this.swiperRef.activeIndex];
    },
    slideTo(index) {
      this.swiperRef.slideTo(index);
      this.currentActiveIndex = index;
    },
    slidePrev() {
      this.swiperRef.slidePrev();
      this.currentActiveIndex--;
    },
    resizeBannerHandler() {
      this.isDesktop = window.innerWidth >= 672;
      this.slidesPerView = 1;
    },
  },
  created() {
    this.fetchPromotions();
    window.addEventListener("resize",  this.resizeBannerHandler);
    setTimeout(() => {
      this.resizeBannerHandler();
    }, 500);
  },
  beforeUnmount(){
    window.removeEventListener("resize",  this.resizeBannerHandler);
  }
}
</script>
<style lang="scss" scoped>
.bps-container {
  width: 100%;
  margin-inline: auto;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  min-height: 40px;
  max-height: 40px;
  &.empty {
    min-height: 0px !important;
    max-height: 0px !important;
  }
}
.slide-label {
  width: 100%;
  min-height: 40px;
  max-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Berthold Akzidenz Grotesk Medium";
  background: $primary-color-70;
  color: $white;
}
.carousel__prev,
.carousel__next {
  margin-inline: 0 !important;
}
.material-icons-outlined {
  color: $white;
}
@media(min-width: 672px) {
  .bps-container {
    &.scrolling{
      min-height: 0px !important;
      max-height: 0px !important;
    }
  }
}
</style>