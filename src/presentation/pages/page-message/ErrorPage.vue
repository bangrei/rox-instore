<template>
	<message-page-layout
		iconName="search_off"
		title="404..."
		subTitle="Page Not Found"
		instruction="Lost? Let's bring you back to Home"
		buttonText="Back To Home"
	></message-page-layout>
</template>

<script>
import MessagePageLayout from "@/components/layout/MessagePageLayout.vue";

export default {
	name: "ErrorPage",
	components: {
		MessagePageLayout,
	},
	data() {
		return {};
	},
	methods: {},
	created() {},
};
</script>

<style scoped lang="scss"></style>
