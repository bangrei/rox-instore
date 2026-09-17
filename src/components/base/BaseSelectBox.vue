<template>
	<div class="sd-select-box" :tabindex="tabindex" @blur="open = false">
		<div
			class="select-box-content"
			:class="[
				description ? 'select-box-description-padding' : '',
				image ? 'select-box-image-padding' : '',
				image && description
					? 'select-box-description-image-padding'
					: '',
			]"
			@click="toggleBox"
		>
			<div v-if="image && selected" class="image">
				<img :src="selected.imageSrc" />
			</div>
			<div class="selected-option">
				<div class="selected-text">
					{{ selected.title }}
				</div>
				<div v-if="description" class="description">
					{{ selected.description }}
				</div>
			</div>
			<div class="arrow" :class="{ expanded: open }"></div>
		</div>
		<div class="items" :class="{ closed: !open }">
			<div
				v-for="(option, i) of options"
				:key="i"
				@click="
					selected = option;
					open = false;
					updateValue(selected);
				"
				v-bind="$attrs"
				class="options"
			>
				<div v-if="image" class="image">
					<img :src="option.imageSrc" />
				</div>
				<div>
					<div class="selected-text">
						{{ option.title }}
					</div>
					<div v-if="description" class="description">
						{{ option.description }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "BaseSelectBox",
	inheritAttrs: false,
	props: {
		options: {
			type: Array,
			required: true,
		},
		tabindex: {
			type: Number,
			required: false,
			default: 0,
		},
		image: {
			type: Boolean,
			required: false,
		},
		description: {
			type: Boolean,
			required: false,
		},
		modelValue: {
			type: [Number, String],
		},
	},
	data() {
		return {
			selected: null,
			open: false,
		};
	},
	created() {
		this.selected = this.options[0];
	},
	methods: {
		toggleBox() {
			this.open = !this.open;
		},
		updateValue(selected) {
			this.$emit("update:modelValue", selected.id);
		},
	},
};
</script>

<style lang="scss" scoped>
.sd-select-box {
	position: relative;
	text-align: left;
	outline: none;
	border-radius: 4px;
	cursor: pointer;
	user-select: none;
}

.select-box-content {
	flex-direction: row;
	display: flex;
	font-size: 16px;
	padding: 21px 16px;
	color: $secondary-color-100;
	align-items: center;
}

.selected-option {
	display: flex;
	flex-direction: column;

	gap: 2px;
}

.selected-text {
	font-size: 16px;
	line-height: 22px;
}

.description {
	font-size: 14px;
	line-height: 18px;
	color: $secondary-color-60;
}

.arrow {
	position: absolute;
	right: 16px;
	border: 5px solid transparent;
	border-color: $secondary-color-100 transparent transparent transparent;
}
.expanded {
	transform: rotateZ(180deg) translateY(2px);
}
.select-box-description-padding {
	padding: 11px 16px;
}

.select-box-image-padding {
	padding: 12px 16px;
}

.select-box-description-image-padding {
	padding: 11px 16px;
}

.image {
	box-sizing: border-box;
	height: 40px;
	width: 40px;
	margin-right: 16px;

	img {
		border-radius: 50%;
		height: 100%;
		width: 100%;
	}
}

.options {
	flex-direction: row;
	display: flex;
	font-size: 16px;
	padding: 21px 16px;
	color: $secondary-color-100;
	align-items: center;
}
.sd-select-box .items {
	color: $white;
	border-radius: 0px 0px 6px 6px;
	overflow: hidden;
	position: absolute;
	box-shadow: 0px 0px 1px rgba(38, 38, 38, 0.04),
		0px 0px 8px 1px rgba(38, 38, 38, 0.08);
	background-color: $white;
	left: 0;
	right: 0;
	z-index: 1;
}

.sd-select-box .items :first-child {
	color: black;
	cursor: pointer;
	user-select: none;
}

.closed {
	display: none;
}

// Colors
.sd-select-box .selected {
	background-color: $white;
}

.sd-select-box-secondary {
	border: 1px solid $secondary-color-20;
}

.sd-select-box-tertiary {
	border: 1px solid $primary-color-10;
	background-color: $primary-color-10;
}
.sd-select-box-tertiary .selected {
	border: 1px solid $primary-color-10;
	background-color: $primary-color-10;
}

// for hover
.sd-select-box .items div:hover {
	background-color: $primary-color-10;
}
</style>
