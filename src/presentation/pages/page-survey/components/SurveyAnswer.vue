<template>
	<div>
		<button
			class="answer"
			:class="{
				'answer--selected': isSelected,
				'answer--image': displayImg,
				'answered': isAnswered && isSelected,
				'disabled': review && !(isAnswered && isSelected),
			}"
			@click="toggleSelected"
		>
			<div
				:class="{
					answer__slot: !displayImg,
					'answer__slot--image': displayImg,
				}"
			>
				<slot name="answer"></slot>
			</div>
			<div v-if="displayImg" class="answer__image">
				<img v-if="imageUrl" :src="imageUrl" alt="answer image" />
				<div v-else class="dummy"></div>
			</div>
		</button>
	</div>
</template>

<script>
export default {
	props: {
		displayImg: Boolean,
		imageUrl: String,
		isSelected: Boolean,
		isAnswered: Boolean,
		review: Boolean
	},
};
</script>

<style scoped lang="scss">
.dummy {
	width: 133px;
	height: 110px;
}
.answer {
	padding: 0;
	border-radius: 1rem;
	border: none;
	background-color: $primary-color-10;
	width: 100%;
	text-align: left;
	transition: box-shadow 0.3s ease;
	overflow: hidden;

	&.disabled {
		background: $secondary-color-20 !important;
		pointer-events: none !important;
		opacity: 0.8;
	}

	&.answered {
		background: $primary-color-20 !important;
		pointer-events: none !important;

		* {
			color: $primary-color-70 !important;
			font-weight: bold;
		}
	}

	&--image {
		width: 133px;
		height: 110px;
		background-color: $primary-color-10;
	}

	&__slot {
		padding: 1rem;
		color: $secondary-color-100;
	}

	&.answer--selected {
		background-color: $primary-color-80;
		.answer__slot {
			color: $white;
		}
	}

	&__slot--image {
		position: absolute;
		margin-top: 1rem;
		margin-left: 1rem;
		color: $white;
	}

	&__image {
		display: block;
	}

	&__image img {
		width: 133px;
		height: 110px;
		object-fit: cover;
	}
}
</style>
