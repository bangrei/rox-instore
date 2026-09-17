<template>
	<start-page-layout id="get-started">
		<template v-slot:body>
			<div class="pg-container" :class="{'get-start': getStarted}">
				<div class="body-wrapper" v-if="getStarted">
					<div class="body-con">
						<p class="title-text heading-4">
							<span>Welcome to ROX Community!</span>
						</p>
						<!-- <p class="header-text heading-4">
							<span>Let us get to know you first!</span>
						</p> -->
						<p class="sub-title-text" v-for="(msg, index) in messages" v-bind:key="index" v-html="msg"></p>
					</div>
				</div>
				<div class="welcome-button-con" v-if="getStarted">
					<base-button
						btnLabel="Get Started"
						iconName="arrow_forward"
						:isRightIcon="true"
						class="sd-btn-primary sd-btn-md body-1-normal medium"
						@click="start"
					/>
				</div>

				<div class="body-wrapper" v-if="!getStarted">
					<div class="body-con">
						<base-icon
							class="sd-icon-btn-ghost sd-icon-btn-xl unset-cursor align-middle"
							iconName="thumb_up"
							iconSize="xxlg"
							iconStyle="outlined"
						></base-icon>
						<p class="title-text heading-4 primary-color-80">
							<span>Congrats!</span>
						</p>
						<p class="title-text heading-4">
							<span>And welcome to ROX Community</span>
						</p>
						<p class="sub-title-text body-1-normal regular secondary-color-60">
							Let’s onboard together to the largest outdoor community in the Philippines!
						</p>
					</div>
					<div class="welcome-button-con">
						<base-button
							btnLabel="Start!"
							:isRightIcon="true"
							class="sd-btn-primary sd-btn-md body-1-normal medium"
							@click="start"
						/>
					</div>
				</div>
			</div>
		</template>
	</start-page-layout>
</template>

<script>
import StartPageLayout from "@/components/layout/StartPageLayout.vue";
import utility from "@/presentation/mixins/utility.js";
// import { goTo } from "@/presentation/mixins/utility.js";

export default {
	name: "GetStarted",
	components: {
		StartPageLayout,
	},
	mixins: [utility],
	data() {
		return {
			getStarted: false,
			messages: [
				"Embark on an adventure with us! Explore a world of expert outdoor content, from in-depth gear guides to skill-building quizzes and practical checklists. But that's not all – dive into our event registrations for exciting outdoor experiences and make the most of our efficient Click & Collect service for all your gear needs.",
				"As you read articles and engage with our content, you'll rack up points, paving the way to exciting rewards coming soon. Watch your points grow at the top of your home screen and stay tuned for the amazing surprises we have in store!",
				"Ready to start your adventure? Register for events, shop with ease, and earn rewards – all in the ROX Community. Let the journey begin!",
				/*
				'To provide you with personalized outdoor gear guides, skill training, and checklists, we need to know some things about you. Please read the instruction before getting started.',
				'Once you are done, you can explore some of existing content. We have some awesome gear guides, skill quizzes and checklists waiting for you! So don’t hesitate and get going.',
				'For every piece of article you open and read, you receive points. For every questionnaire that is answered, you also receive points.',
				'You can see the amount of collected points at the top of the home screen. Clicking on the points banner will open our surprise page. Here you can see which awesome outdoor surprises we have waiting for you. The more points you collect, the more surprises you can collect.',
				'To get your surprises, you can show the amount of collected points to any R.O.X store team member.',
				'So, what are you waiting for! Let’s start this adventure!',
				*/
			]
		};
	},
	methods: {
		start() {
			if (!this.getStarted) {
				this.getStarted = true;
				return;
			}
			/* hide for now:
			if(this.$route.params.registered || false == true) {
				return goTo("SurveyPage", { nudgeId: "c67bdd42918f4a09b0706ff76ca8c155", getStarted: true });
			}
			*/
			if (this.$route.query.redirect) {
				return this.$router.replace(this.$route.query.redirect);
			}
			this.$router.push({
				name: "WelcomePage"
			});
		},
	},
};
</script>

<style scoped lang="scss">
#get-started {
	height: 100%;

	&.fade-out {
		animation-duration: 1s;
		animation-name: fadeout;
		animation-fill-mode: forwards;
	}
}

.sd-main-con {
	.pg-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
		justify-content: center;
		background-image: url('@/assets/images/registration-bg.png');
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		&.get-start {
			height: 100% !important;
			padding-top: 24px;
			.body-wrapper {
				max-width: 450px;
				margin: 0 auto;
			}
			.title-text, .header-text {
				text-align: left;
				padding: 0 24px;
			}
			.sub-title-text {
				text-align: left;
				&:last-child {
					padding-bottom: 24px;
				}
			}
		}

		* {
			width: 100%;
		}
		.body-wrapper {
			width: 90%;
			max-width: 600px;
			margin: 0 auto;
			background: $white;
			padding: 16px 24px;
			border-radius: 12px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		}
		.welcome-button-con {
			position: relative;
			height: auto;
			display: flex;
			flex-direction: column;
			padding: 20px;
			justify-content: flex-end;
			gap: 20px;
			width: 100%;
			max-width: 500px;
			margin: 0 auto;
			font-weight: bold;
		}
	}
}

.sd-icon-btn-xl {
	transform: scale(1.5);
}

@keyframes fadeout {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0;
	}
}

.title-text, .header-text {
	margin: 22px auto 16px;
}
.header-text {
	font-size: 1.6em;
}

.sub-title-text {
	padding: 0 24px;
}
.sub-title-text + .sub-title-text,
:not(.sub-title-text) + .sub-title-text {
	margin-top: 24px;
}
@media (min-width: 672px) {
	.sd-main-con {
		.pg-container {
			&.get-start {
				height: 100% !important;
				margin-top: 0;
			}
		}
	}
}
</style>
