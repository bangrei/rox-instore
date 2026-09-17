<template>
	<start-page-layout id="landing-page">
		<template v-slot:body>
			<div class="slides">
				<div class="slide-item" 
					v-for="content in contents" 
					:key="content.index" 
					:class="{'active': currentContent && currentContent.value.index == content.index}">
					<div
						class="landing-background-img"
						:class="content.image"
					></div>
					<base-button v-if="currentContent.value.index == content.index"
						btnLabel="Skip"
						class="skip-button sd-btn-sm body-1-normal medium"
						@click="goSignUp()"
					/>

					<div class="landing-content-wrapper" v-if="currentContent.value.index == content.index">
						<div class="landing-content-con">
							<p class="heading-4 white-color title">
								<b>{{ currentContent.value.title }}</b>
							</p>
							<!--
							<div class="support-con">
								<base-icon
									class="sd-icon-btn-xsm sd-icon-btn-ghost"
									iconName="help_outline"
									iconSize="lg"
									@click="goTo('FAQ')"
								></base-icon>
							</div>
							-->

							<p class="body-2-normal medium white-color">
								{{ currentContent.value.description }}
							</p>

							<div class="progress-con">
								<base-slab
									:currentIndex="currentContent.value.index"
									:totalIndex="contents.length"
									@slab-clicked="slideTo"
								></base-slab>
							</div>

							<div class="button-con-wrapper">
								<!-- <div class="support-con">
									<base-icon
										class="sd-icon-btn-xsm sd-icon-btn-ghost"
										iconName="help_outline"
										iconSize="lg"
										@click="goTo('FAQ')"
									></base-icon>
								</div> -->
								<div class="button-con">
									<base-button
										btnLabel="Previous"
										class="sd-btn-tertiery sd-btn-sm body-1-normal medium prev-btn"
										@click="slidePrev"
										v-show="currentContent.value.index != 0"
									/>

									<base-button
										:btnLabel="
											currentContent.value.index !=
											contents.length - 1
												? 'Next'
												: 'Get Started'
										"
										iconName="arrow_forward"
										:isRightIcon="true"
										class="sd-btn-primary sd-btn-md body-1-normal medium next-btn"
										@click="
											slideNext(
												currentContent.value.index,
												contents.length
											)
										"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</start-page-layout>
</template>

<script>
import StartPageLayout from "@/components/layout/StartPageLayout.vue";
import BaseSlab from "../page-survey/components/BaseSlab.vue";
import utility from "@/presentation/mixins/utility.js";

export default {
	name: "LandingCarouselPage",
	mixins: [utility],
	components: {
		StartPageLayout,
		BaseSlab,
	},
	data() {
		return {
			index: 0,
			contents: [],
			currentContent: null,
		}
	},
	watch: {
		index() {
			this.onSlideChange();
			this.layout();
		}
	},
	methods: {
		layout() {
			const imgs = document.querySelectorAll('.slide-item');
			const xOffsetStep = window.innerWidth/(imgs.length - 1);
			const count = imgs.length;
			const scaleStep = 0.8;
			const opacityStep = 0.5;
			
			for(let i = 0; i < imgs.length; i++){
				let img = imgs[i];
				const sign = Math.sign(i - this.index);

				let xOffset = (i - this.index) * xOffsetStep;
				let w = window.innerWidth / imgs.length;
				if (i !== this.index) xOffset = xOffset + w * sign;
				const scale = scaleStep ** Math.abs(i - this.index);
				//const rotateY = i === this.index ? 0 : 30 * -sign;
				img.style.transform = `perspective(800px) translateX(${xOffset}px) scale(${scale}) rotateY(${0}deg)`;
				
				let opacity = opacityStep ** Math.abs(i - this.index);
				if (Math.abs(i - this.index) > 2) opacity = 0;
				img.style.opacity = opacity;
				
				img.style.zIndex = count - Math.abs(this.index - i);
			}
		},
		onSlideChange() {
			this.currentContent.value = this.contents[this.index];
		},
		slideTo(index) {
			this.index = index;
		},
		slidePrev() {
			this.slideTo(this.index - 1);
		},
		slideNext(contentIndex, contentLength) {
			contentIndex != contentLength - 1
				? this.slideTo(contentIndex + 1)
				: this.goSignUp();
		},
		goSignUp() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
		}
	},
	created() {
		window.addEventListener('resize', this.layout);
		this.contents = [
			{
				index: 0,
				title: "We know you are craving for the next adventure!",
				description:
					"Let our outdoor specialist help you plan for your epic trip!",
				image: "image-3",
			},
			{
				index: 1,
				title: "Impress your friends with your outdoor adventure skills",
				description:
					"Want to level up your skills and be prepared for your next trip? Join our community to get you ready!",
				image: "image-2",
			},
			{
				index: 2,
				title: "Gear Up for the Ultimate Camping Experience!",
				description:
					"Unlock the full potential of your outdoor journey with expert!",
				image: "image-4",
			},
			{
				index: 3,
				title: "Let's plan together!",
				description:
					"With our RXC outdoor adventure checklist, we can help you make sure you are fully prepared!",
				image: "image-1",
			},
		];
		this.currentContent = {};
		this.currentContent.value = this.contents[0];
		setTimeout(() => {
			this.layout();
		}, 50);
	},
	beforeUnmount(){
		window.removeEventListener('resize', this.layout);
	}
};
</script>

<style scoped lang="scss">
	#landing-page {
		animation-duration: 0.5s;
		animation-name: fadein;
		animation-fill-mode: forwards;
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
		&.image-4 {
			background-image: url("@/assets/images/landing_4.png");
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

	.progress-con {
		padding: 24px 0;
	}

	.skip-button {
		position: absolute;
		right: 24px;
		top: 24px;
		z-index: 2;
		font-weight: 600;
	}

	.button-con-wrapper {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
	.button-con {
		display: flex;
		justify-content: space-between;
		gap: 12px;

		.prev-btn {
			background-color: transparent;
			color: $white;
		}
	}

	.support-con {
		position: absolute;
		top: -55px;
		border-radius: 50%;
		background-color: $white;
		transition: all 0.2s ease-in-out;

		.sd-icon-btn {
			color: $primary-color-90;
		}
	}

	.swiper {
		height: 100%;
	}
	.slides {
		width: 100vw;
		height: 100vh;
		background-color: $primary-color-10;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;

		.slide-item {
			width: 60%;
			height: 95%;
			background-color: #87A0E2;
			border-radius: 16px;
			overflow: hidden;
			position: absolute;
			user-select: none;
			transition-property: transform, opacity, zIndex, ; 
			transition-duration: 0.3s; 
			transition-timing-function: ease-out;
			
			&:not(.active){
				transform: perspective(800px) translateX(200%) scale(0.8) rotateY(0deg);
			}
		}
	}
	@media (max-width: 672px) {
		.slides {

			.slide-item {
				width: 100%;
				height: 100%;
				border-radius: 0px;
			}
		}
	}
</style>
