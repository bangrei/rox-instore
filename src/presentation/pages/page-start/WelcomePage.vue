<template>
	<layout-variant-two id="welcome-page" :footer-white="true" :active-menu-index="1">
		<template v-slot:body>
			<div class="welcome-wrapper">
				<div class="head-container">
					<BannerSlider/>
				</div>
				<collections-content showParentCategories/>
				<ContactUs/>
			</div>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="1"/>
			<!-- <base-footer-nav :activeFooterId="0"></base-footer-nav> -->
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import BannerSlider from "./components/BannerSlider.vue";
import ContactUs from "./components/ContactUs.vue";
import CollectionsContent from "../page-collections/components/CollectionsContent.vue";

export default {
	name: "WelcomePage",
	components: {
		LayoutVariantTwo,
		BannerSlider,
		ContactUs,
		CollectionsContent,
	},
	mixins: [utility],
	computed: {
		hasInited() {
      return this.$store.getters.hasInited;
    },
		loading() {
			return !this.hasInited;
		}
	},
	created() {
		window.addEventListener("resize",  this.resizeBannerHandler);
	},
	beforeUnmount() {
		window.removeEventListener("resize",  this.resizeBannerHandler);
	}
};
</script>

<style scoped lang="scss">
.sd-main-body {
	width: 100%;
}
#welcome-page {
	width: 100%;
	&.fade-out {
		animation-duration: 1s;
		animation-name: fadeout;
		animation-fill-mode: forwards;
	}
}
.welcome-wrapper {
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	gap: 48px;
	padding-bottom: 48px;
}
.title {
	color: $main-red;
	font-size: 30px;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
}
@keyframes fadeout {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0;
	}
}
.head-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
	gap: 32px;
}
.page-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	overflow: hidden;
	position: relative;
	padding-inline: 20px;
}
.brands-con {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 16px;
	overflow-x: auto;
	padding-block: 20px;
	.brand {
		padding: 6px 24px;
		border-radius: 999px;
		cursor: pointer;
		border: 1px solid $main-red;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		&:is(.active){
			background: $main-red;
			color: $white;
		}
	}
}
@media (min-width: 672px) {
	.page-container {
		padding-inline: 4% !important;
	}
}
</style>
