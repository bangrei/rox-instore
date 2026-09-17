<template>
	<div class="empty-nudge-con">
		<p class="heading-6 primary-color-90">{{ heading }}</p>
		<p class="heading-6 secondary-color-100">{{ subHeading }}</p>
		<p class="empty-nudge-message body-3-normal secondary-color-60">
			{{ message }}
		</p>
	</div>
</template>

<script>
export default {
	props: {
		heading: {
			type: String,
			default: "",
		},
		subHeading: {
			type: String,
			default: "",
		},
		message: {
			type: String,
			default: "",
		},
	},
};
</script>

<style scoped lang="scss">
.empty-nudge-con {
	padding: 16px;
	background-color: $primary-color-10;
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
}

.empty-nudge-message {
	margin-top: 16px;
}
</style>
