<template>
	<div class="wrapper">
		<img class="bg-image" :src="require('@/assets/images/registration-bg.png')" alt="Thank you"/>
		<div class="message-con">
			<message-page-layout
				:fitHeight="true"
				iconName="thumb_up"
				:title="title"
				:subTitle="subTitle"
				:isCongrats="true"
				:instruction="instruction"
				:buttonText="buttonLabel"
				:goToPage="goToPage"
			></message-page-layout>
		</div>
	</div>
</template>

<script>
import MessagePageLayout from "@/components/layout/MessagePageLayout.vue";

export default {
	name: "ThankYouPage",
	components: {
		MessagePageLayout,
	},
	props: {
		title: {
			type: String,
			default: "Thank You!",
		},
		subTitle: {
			type: String,
			default: "Your answer will be saved!",
		},
		instruction: {
			type: String,
			default: "Click the button to go back to the BFM homepage",
		},
		buttonLabel: {
			type: String,
			default: "Back Home",
		},
		goToPage: {
			type: String,
			default: "WelcomePage",
		},
	},
};
</script>

<style scoped lang="scss">
.wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	padding: 24px;

	.bg-image {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: -1;
		width: auto;
		height: 100%;
		object-fit: cover;
	}

	.message-con {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
		background: $white;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		padding: 16px;
	}
}
@media(min-width: 672px){
	.bg-image {
		width: 100% !important;
		height: 100%;
		object-fit: contain;
	}
}
</style>
