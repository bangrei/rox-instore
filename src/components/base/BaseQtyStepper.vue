<template>
	<div
		v-if="
			shape === 'rectangle' || (shape === 'circle' && highlight === true)
		"
		:class="[
			'sd-qty-stepper',
			highlight === false
				? 'sd-qty-stepper-rectangle'
				: 'sd-qty-stepper-circle-highlight',
			size === 'sm' ? 'sd-qty-stepper-rectangle-sm' : '',
			size === 'md' ? 'sd-qty-stepper-rectangle-md' : '',
			size === 'lg' ? 'sd-qty-stepper-rectangle-lg' : '',
			minusDisabled && plusDisabled && highlight
				? 'sd-qty-stepper-circle-highlight-disabled'
				: '',
			minusDisabled && plusDisabled && !highlight
				? 'sd-qty-stepper-rectangle-disabled'
				: '',
		]"
	>
		<base-icon
			class="sd-icon-btn-ghost sd-icon-btn-sm"
			:iconName="minusQtyIcon"
			:iconSize="size"
			@click="decreaseValue"
			:disabled="minusDisabled"
		></base-icon>

		<input
			:class="['input-text-rectangle']"
			v-model="mutableValue"
			min="1"
			:disabled="true"
			type="number"
		/>

		<base-icon
			class="sd-icon-btn-ghost sd-icon-btn-sm"
			:iconName="plusQtyIcon"
			:iconSize="size"
			@click="increaseValue"
			:disabled="plusDisabled"
		></base-icon>
	</div>
	<div
		v-if="shape === 'circle' && highlight === false"
		:class="[
			'sd-qty-stepper',
			'sd-qty-stepper-circle',
			minusDisabled && plusDisabled
				? 'sd-qty-stepper-circle-disabled'
				: '',
		]"
	>
		<base-icon
			:class="[
				'sd-icon-btn-tertiary-active',
				size === 'sm' ? 'sd-icon-btn-sm' : '',
				size === 'md' ? 'sd-icon-btn-md' : '',
				size === 'lg' ? 'sd-icon-btn-lg' : '',
			]"
			:iconName="minusQtyIcon"
			:iconSize="size"
			@click="decreaseValue()"
			:disabled="minusDisabled"
		></base-icon>
		<input
			:class="['input-text-circle']"
			:disabled="true"
			v-model="mutableValue"
			:min="1"
			type="number"
		/>

		<base-icon
			:class="[
				'sd-icon-btn-tertiary-active',
				size === 'sm' ? 'sd-icon-btn-sm' : '',
				size === 'md' ? 'sd-icon-btn-md' : '',
				size === 'lg' ? 'sd-icon-btn-lg' : '',
			]"
			:iconName="plusQtyIcon"
			:iconSize="size"
			@click="increaseValue()"
			:disabled="plusDisabled"
		></base-icon>
	</div>
</template>

<script>
export default {
	name: "BaseQtyStepper",
	props: {
		modelValue: {
			type: Number,
		},
		shape: {
			type: String,
			validator: (value) => {
				return ["rectangle", "circle"].indexOf(value) !== -1;
			},
		},
		size: {
			type: String,
			validator: (value) => {
				return ["sm", "md", "lg"].indexOf(value) !== -1;
			},
		},
		highlight: {
			type: Boolean,
			default: false,
		},
		minusQtyIcon: {
			type: String,
			default: "remove",
		},
		plusQtyIcon: {
			type: String,
			default: "add",
		},
		minusDisabled: {
			type: Boolean,
			default: false,
		},
		plusDisabled: {
			type: Boolean,
			default: false,
		},
	},
	data: function () {
		return {
			mutableValue: this.modelValue,
		};
	},
	methods: {
		increaseValue() {
			this.mutableValue++;
			this.$emit("update:modelValue", this.mutableValue);
		},
		decreaseValue() {
			this.mutableValue--;
			this.$emit("update:modelValue", this.mutableValue);
		},
	},
};
</script>

<style scoped lang="scss">
.input-text {
	text-align: center;
	border: none;
	outline: none;
	cursor: default;
	font-size: 16px;
	background: none;
	width: 32px;
	height: 28px;
}

.input-text-rectangle {
	@extend .input-text;
	padding-left: 4px;
	padding-right: 4px;
}

.input-text-circle {
	@extend .input-text;
	padding-left: 2px;
	padding-right: 2px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.sd-qty-stepper {
	transition: all 0.3s;
	border: none;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.sd-qty-stepper-rectangle {
	border: 1px solid $secondary-color-20;
	border-radius: 5%;
}

.sd-qty-stepper-rectangle-sm {
	padding-left: 3px;
	padding-right: 3px;
}

.sd-qty-stepper-rectangle-md {
	padding: 3px;
}

.sd-qty-stepper-rectangle-lg {
	padding-left: 11px;
	padding-right: 11px;
	padding-top: 3px;
	padding-bottom: 3px;
}

.sd-qty-stepper-circle {
	border-radius: 32px;
}

.sd-qty-stepper-circle-highlight {
	background-color: $primary-color-10;
	border-radius: 32px;
}

div {
	width: fit-content;
	height: fit-content;
	margin: 0 auto;
}

.sd-qty-stepper-circle-highlight-disabled {
	background-color: $secondary-color-10;
	input {
		color: $secondary-color-30;
	}
}

.sd-qty-stepper-circle-disabled {
	input {
		color: $secondary-color-30;
	}
}

.sd-qty-stepper-rectangle-disabled {
	border: 1px solid $secondary-color-30;
	input {
		color: $secondary-color-30;
	}
}
</style>
