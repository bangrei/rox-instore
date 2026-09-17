<template>
	<div v-show="isSelected">
		<slot></slot>
	</div>
</template>

<script>
export default {
	name: "BaseTab",
	props: {
		isSelected: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
		},
		icon: {
			type: String,
		},
		chipValue: {
			type: Number,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style></style>
