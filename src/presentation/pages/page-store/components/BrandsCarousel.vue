<template>
  <div class="brands-carousel-container">
		<carousel ref="brandsCarousel" 
      :transition="500" 
      :wrap-around="true" 
      :autoplay="autoPlayTimer"
      :itemsToShow="slidesPerView"
    >
			<slide v-for="(content, index) in contents" :key="index">
				<div class="slide-wrapper">
					<img class="carousel-img" alt="image" :src="getImage(content.imageId)"/>
				</div>
			</slide>
		</carousel>
	</div>
</template>
<script>
import utility from "@/presentation/mixins/utility.js";
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide } from 'vue3-carousel';
import { ref, reactive } from "vue";
import { isEmpty } from "lodash";

export default {
  name: "BrandsCarousel",
  mixins: [utility],
	components: {
		Carousel,
		Slide,
	},
  props: {
		activities: {
			type: Array,
			default: () => []
		},
	},
  data() {
		return {
			swiperRef: null,
			contents: null,
			currentContent: null,
			currentActiveIndex: 0,
			isDesktop: true,
			slidesPerView: 1,
			autoPlayTimer: 3000,
      brands: []
		};
	},
	computed: {
		contentLength(){
			let num = this.contents.length;
			let perView = this.slidesPerView;
			let len = Math.ceil(num/perView);
			if(num % perView > 0) len += 1;
			return len;
		}
	},
	watch: {
		autoPlayTimer(val) {
			if (!this.$refs.brandsCarousel) return;
			this.$refs.brandsCarousel.data.config.autoplay = val;
			this.$refs.brandsCarousel.restartCarousel();
		}
	},
  methods: {
    getImage(image) {
			if (!image) return "";
			return this.$store.getters.cloudinaryURL + image + "?width=300";
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
		resizeBannerHandler(){
      this.isDesktop = window.innerWidth >= 672;
			this.slidesPerView = this.isDesktop ? 7 : 4;
    },
    init() {
			if (!isEmpty(this.activities)) {
				this.label = `From<br/>${this.activities.from} to ${this.activities.to}`;
				this.brands = this.activities.brands || [];
			}
		},
	},
  async created() {
		try {
      this.init();
			this.contents = ref(this.brands);
			this.currentContent = reactive({});
			if(!isEmpty(this.contents)) this.currentContent.value = this.contents[0];
			if (this.contentLength <= 1) this.autoPlayTimer = 0;
			if (this.manualSlide == true) this.autoPlayTimer = 0;
			window.addEventListener("resize",  this.resizeBannerHandler);
      setTimeout(() => {
        this.resizeBannerHandler();
      }, 500);
		} catch (error) {
			console.log(error);
		}
	},
	beforeUnmount(){
		window.removeEventListener("resize",  this.resizeBannerHandler);
	}
}
</script>
<style scoped lang="scss">
.brands-carousel-container {
  padding-block: 24px;
}
.slide-wrapper {
  padding: 16px;
}
.carousel-img {
  height: 75px;
  object-fit: contain;
  mix-blend-mode: multiply;
}
</style>