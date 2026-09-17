<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
			<div>
				<h1>Privacy Policy</h1>
				<policy-content/>
			</div>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import PolicyContent from "./components/PolicyContent.vue";
import utility from "@/presentation/mixins/utility.js";
export default {
	name: "PolicyPage",
	mixins: [utility],
	components: { LayoutVariantTwo, PolicyContent },
	data() {
		return {
			loading: true,
		};
	},
	computed: {
		showBack(){
			return window.history.state.back !== null
		}
	},
	methods: {
		toggleSelected(activeCategoryId) {
			this.tabIndex = activeCategoryId;
		},
	},
	async created(){
    if(!this.$store.getters.hasInited){
      await this.refreshMainData();
    }
    this.loading = false;
  }
};
</script>
<style lang="scss" scoped>
h1 {
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	font-weight: normal !important;
	font-size: 24px;
	margin-top: 48px;
	margin-bottom: 24px;
	color: $main-red;
}
</style>
