<template>
	<div class="slab__container">
		<div
			v-for="index in totalIndex"
			:key="index"
			class="slab no-select"
			:class="{
				'slab--under': index - 1 < currentIndex,
				'slab--over': index - 1 > currentIndex,
				'slab--current': index - 1 === currentIndex,
				'flex-all': flex == true
			}"
			@click="$emit('slab-clicked', index - 1)"
		>
			&nbsp;
		</div>
	</div>
</template>

<script>
export default {
	props: {
		currentIndex: Number,
		totalIndex: Number,
		flex: Boolean
	},
};
</script>

<style lang="scss">
.slab {
	height: 8px;
	border-radius: 2rem;
	cursor: pointer;
	flex: 0 1 50px;
	&.flex-all {
		flex: 1 !important;
	}
	&__container {
		display: flex;
		justify-content: center;
		gap: 8px;
	}
	&--under {
		background-color: $secondary-color-20;
	}
	&--over {
		background-color: $secondary-color-20;
	}

	&--current {
		background-color: $primary-color-80;
	}
}
</style>
