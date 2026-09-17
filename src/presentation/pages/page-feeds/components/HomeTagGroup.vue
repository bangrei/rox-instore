<template>
	<div class="tag-group-con">
		<div
			class="tag-group"
			v-for="tag in tagsObj"
			:key="tag.name"
			:class="{ active: tag.selected }"
			@click="handleTagSelected(tag)"
		>
			{{ tag.name }}
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			tagsObj: [],
		};
	},
	props: {
		tags: {
			type: Array,
			default: () => [],
		},
	},
	methods: {
		handleTagSelected(tag) {
			tag.selected = !tag.selected;
			let selectedTags = this.tagsObj
				.filter((it) => it.selected)
				.map((it) => it.name);
			this.$emit("selected-tag-updated", selectedTags);
		},
	},
	mounted() {
		this.tagsObj = this.tags.map((it) => {
			return { name: it, selected: false };
		});
	},
};
</script>

<style scope lang="scss">
.tag-group-con {
	display: flex;
	gap: 8px;
	overflow: scroll;
	height: 32px;
}

.tag-group {
	padding: 5px 16px;
	border-radius: 50px;
	border: 1px solid $secondary-color-30;
	color: $secondary-color-100;
	cursor: pointer;
	flex-shrink: 0;

	&.active {
		color: $primary-color-80;
		background-color: $primary-color-10;
	}
}
</style>
