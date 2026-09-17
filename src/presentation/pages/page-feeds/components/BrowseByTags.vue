<template>
	<div class="feed-anchors-wrapper">
		<div class="feed-anchors">
			<h1>Browse by Tags</h1>
			<button type="button" @click="scrollRight">
				More <i class="material-icons-outlined">chevron_right</i>
			</button>
		</div>
		<div class="feeds">
			<router-link :to="'/feeds/' + tagLink(feed.name)" class="feed"
				v-for="(feed) in feedNavs" 
				:key="feed.id">
				<span class="feed-label">{{ feed.name }}</span>
			</router-link>
		</div>
	</div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
export default {
	name: "BrowseByTags",
	mixins: [utility],
	props: {
		feedNavs: {
			type: Array,
			default: () => []
		}
	},
	methods: {
		scrollRight() {
      let target = document.querySelector('.feeds');
			target.scrollLeft += 300;
    },
		tagLink(tag){
			return this.slugName(tag);
		},
	},
};
</script>
<style scoped lang="scss">
	h1 {
		text-align: left;
		font-size: 24px;
		line-height: 38px;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
	}
	.feed-anchors-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.feed-anchors{
		max-width: calc(100% - 24px);
		margin-inline: auto;
		margin-top: 48px;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		button {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 4px;
			outline: none;
			border-radius: 8px;
			background: $white;
			border: 1px solid $border-color;
			width: 106px;
			height: 42px;
			font-size: 17px;
			line-height: 26px;
			cursor: pointer;
			&:hover {
				border-color: $primary-color-60;
			}
		}
	}
	.feeds {
		padding-block: 16px;
		display: flex;
		width: 100%;
		padding-inline: 12px;
		overflow-x: auto;
		align-items: center;
		justify-content: flex-start;
		position: relative;
		gap: 12px;
		scroll-behavior: smooth;

		.feed {
			min-width: 180px;
			max-width: 180px;
			aspect-ratio: 5/3;
			background: $secondary-color-80;
			border-radius: 8px;
			overflow: hidden;
			padding: 24px 0;
			cursor: pointer;
			font-size: 0.75rem;
			line-height: 0.875rem;
			letter-spacing: 0.025rem;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			color: $white;
			font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
			text-decoration: none;
			.material-icons {
				font-size: 16px;
			}
			.feed-label {
				font-size: 18px;
				line-height: 28px;
				text-decoration: none;
			}
			&.active {
				background: $primary-color-60;
				color: $border-color;
			}
		}
	}
	@media (min-width: 672px) {
		.feed-anchors,
		.feeds {
			max-width: calc(100% - 40px);
			margin-inline: auto;
			padding-inline: 0 !important;
		}
	}
</style>
