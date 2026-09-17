<template>
	<layout-variant-two>
		<template v-slot:body>
			<terms-content class="support-con"/>
		</template>
		<template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import TermsContent from "./components/TermsContent.vue";
import utility from "@/presentation/mixins/utility.js";
export default {
	mixins: [utility],
	components: { LayoutVariantTwo, TermsContent },
	data() {
		return {
			tabIndex: 2,
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
};
</script>
<style lang="scss" scoped>
.header-con {
	padding: 12px 14px;
	border-bottom: 1px solid $secondary-color-20;
	background: $white;
	color: $secondary-color-90;
	justify-content: space-between;

	.back-btn {
		color: $primary-color-60;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 16px;
	}
}

.faq-back {
	position: absolute;
}
.support-con {
	margin-top: 40px;
}
</style>
