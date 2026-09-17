<template>
	<div class="slab__container" :class="{'centered': posCenter}">
		<div
			v-for="index in totalIndex"
			:key="index"
			class="slab no-select"
			:class="{
				'slab--under': index - 1 < currentIndex,
				'slab--over': index - 1 > currentIndex,
				'slab--current': index - 1 === currentIndex,
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
		posCenter: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style lang="scss">
.slab {
	height: 8px;
	border-radius: 2rem;
	cursor: pointer;
	flex: 0 1 8px;
	&__container {
		display: flex;
		justify-content: flex-start;
		gap: 8px;
        padding: 0 16px;

		&.centered {
			justify-content: center;
		}
	}
	&--under {
		background-color: $secondary-color-20;
	}
	&--over {
		background-color: $secondary-color-20;
	}

	&--current {
		background-color: $primary-color-60;
	}
}
</style>
