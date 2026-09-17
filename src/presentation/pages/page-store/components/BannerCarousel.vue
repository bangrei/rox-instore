<template>
	<div class="shop-carousel-container">
		<carousel ref="carousel" :transition="500" :wrap-around="true" :autoplay="autoPlayTimer">
			<slide v-for="content in contents" :key="content.index">
				<a class="slide-wrapper link" 
					v-if="validLink(content)" 
					:href="validLink(content)"
				>
					<img class="carousel-img" :class="className" v-if="useImage" :src="content.image"/>
					<div v-else class="landing-background-img" :class="content.image"></div>
					<!-- <span class="slide-label">{{ content.name }}</span> -->
				</a>
				<div class="slide-wrapper" v-else>
					<img class="carousel-img" :class="className" v-if="useImage" :src="content.image"/>
					<div v-else class="landing-background-img" :class="content.image"></div>
					<!-- <span class="slide-label">{{ content.name }}</span> -->
				</div>
			</slide>
			<!-- <template #addons v-if="contentLength > 1">
				<navigation>
					<template #next><span class="carousel__icon material-icons-outlined md-32">arrow_forward</span></template>
					<template #prev><span class="carousel__icon material-icons-outlined md-32">arrow_back</span></template>
				</navigation>
				<div class="pagination__custom" :class="{'inside': inside}">
					<span class="pagination__icon material-icons" @click="letsPlay()" :class="{'active': autoPlayTimer > 0}">play_circle</span>
					<div class="pagination__main">
						<pagination />
					</div>
					<span class="pagination__icon material-icons" @click="letsPause()" :class="{'active': autoPlayTimer == 0}">pause_circle</span>
				</div>
			</template> -->
		</carousel>
	</div>
</template>

<script>
import { ref, reactive } from "vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide } from 'vue3-carousel';

export default {
	name: "BannerCarousel",
	mixins: [utility],
	components: {
		Carousel,
		Slide,
	},
    props: {
		fullScreen: {
			type: Boolean,
			default: false,
		},
		useImage: {
			type: Boolean,
			default: false,
		},
		customSwiper: {
			type: Boolean,
			default: false,
		},
		posCenter: {
			type: Boolean,
			default: false,
		},
		inside: {
			type: Boolean,
			default: false,
		},
		banners: {
			type: Array,
			default: () => []
		},
		className: {
			type: String,
			default: ""
		},
		manualSlide: {
			type: Boolean,
			default: false,
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
			autoPlayTimer: 2000,
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
			if (!this.$refs.carousel) return;
			this.$refs.carousel.data.config.autoplay = val;
			this.$refs.carousel.restartCarousel();
		}
	},
	methods: {
		validLink(content){
			try {
				let url = new URL(content.description);
				return url;
			} catch(_){
				return null;
			}
		},
		letsPlay(){
			if(this.autoPlayTimer == 0) {
				this.autoPlayTimer = 2000;
				this.$refs.carousel.next();
			}
		},
		letsPause(){
			if(this.autoPlayTimer > 0) {
				this.autoPlayTimer = 0;
			}
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
			this.slidesPerView = 1;
        },
	},
	async created() {
		try {
			this.swipeSpeed = 250;
			this.contents = ref(this.banners);
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
};
</script>

<style scoped lang="scss">
	.shop-carousel-container {
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}
	.pagination {
		&__custom {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			margin: 10px 0 0;

			&.inside {
				margin-top: -30px;
			}
		}
		&__main {
			display: flex;
			align-items: center;
			z-index: 2;

			.carousel__pagination {
				margin: 0;
			}
		}
		&__icon {
			color: $secondary-color-50;
			cursor: pointer;
			z-index: 2;

			&.active {
				opacity: 0.6;
				cursor: auto;
			}
		}
	}
	.swiper {
		height: 200px !important;
		&.custom-swiper {
			height: auto !important;
		}
	}
	.slide-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		&.link {
			&::before {
				content: "";
				position: absolute;
				left: 0;
				top: 0;
				bottom: 0;
				right: 0;
				pointer-events: none;
				background: $dark-color-4;
				z-index: 10;
				width: 100%;
				height: 100%;
				opacity: 0;
			}
			&:hover {
				&::before {
					opacity: 0.2 !important;
				}
			}
		}
	}
	.slide-label {
		font-size: 24px;
		line-height: 38px;
		color: $white;
		font-weight: 500;
		position: absolute;
    bottom: 30px;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
		font-family: "Berthold Akzidenz Grotesk Medium";
		text-decoration: none;
		&.link:hover {
			color: $success-dark;
		}
	}
	@keyframes fadein {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	.landing-swipper-con {
		z-index: 1;
	}

	.carousel-img {
		width: 100%;
		object-fit: cover;
		aspect-ratio: 5/3;
	}

	.landing-background-img {
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		height: 100%;

		&.image-1 {
			background-image: url("@/assets/images/landing_1.jpg");
		}

		&.image-2 {
			background-image: url("@/assets/images/landing_2.jpg");
		}

		&.image-3 {
			background-image: url("@/assets/images/landing_3.jpg");
		}
	}

	.landing-content-wrapper {
		position: relative;
		z-index: 2;
	}

	.landing-content-con {
		text-align: left;
		padding: 24px;
		background: linear-gradient(
			180deg,
			rgba(15, 23, 42, 0) -9.29%,
			#0f172a 100%
		);
		backdrop-filter: blur(20px);
		border-radius: 12px 12px 0px 0px;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;

		.title {
			margin-bottom: 16px;
			position: relative;
		}
	}

	.swiper {
		height: 100%;
	}
	@media (min-width: 672px) {
		.carousel-img {
			aspect-ratio: 5/1.5 !important;
		}
	}
	@media (max-width: 672px) {
		.swiper {
			&.custom-swiper {
				height: 400px !important;

				img {
					height: 100%;
					width: auto;
					margin: auto;
				}
			}
		}
	}
</style>
