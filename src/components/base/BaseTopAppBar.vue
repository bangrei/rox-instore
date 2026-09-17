<template>
	<div
		class="sd-top-app-bar"
		:class="[background === 'white' ? 'white-background' : '']"
	>
		<div class="left-container">
			<slot name="left-bar"></slot>
		</div>

		<div class="title-container">
			<div class="title">{{ title }}</div>
		</div>

		<div class="right-container">
			<slot name="right-bar"></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: "BaseTopAppbar",
	props: {
		title: {
			type: String,
		},
		background: {
			type: String,
			required: true,
		},
	},
};
</script>

<style lang="scss">
.sd-top-app-bar {
	display: flex;
	width: 100%;
	flex-direction: row;
	align-items: center;
	padding: 12px 16px;
	background-color: none;
}

.white-background {
	background-color: $white;
}

.left-container {
	flex-basis: 33.33%;
	display: flex;
	flex-direction: row;
}
.title-container {
	flex-basis: 33.33%;
}

.right-container {
	flex-basis: 33.33%;
	display: flex;
	flex-direction: row-reverse;
}

.title {
	font-size: 24px;
	font-weight: 500;
}

.title::first-letter {
	text-transform: capitalize;
}
.button-border {
	border: none;
	background: $white;
}
</style>
