<template>
	<span
		class="sd-input-con"
		:class="[
			iconLeft === true ? 'sd-input-icon-left-' + size : '',
			iconRight === true ? 'sd-input-icon-right-' + size : '',
		]"
	>
		<div v-if="$slots.fieldText" class="sd-input-title">
			<slot name="fieldText"></slot>
		</div>

		<div class="sd-icon-relative-container">
			<span
				v-if="$slots.iconLeft"
				:class="[
					iconLeft === true && size === 'sm' ? 'left-sm' : 'left-lg',
				]"
			>
				<slot name="iconLeft"></slot>
			</span>

			<input
				class="sd-input-con"
				:class="[
					size == 'sm' ? 'sd-input-text-sm' : 'sd-input-text-lg',
					invalid ? 'sd-input-text-invalid' : '',
				]"
				:value="modelValue"
				@input="onInput"
				v-bind="$attrs"
			/>

			<span
				v-if="$slots.iconRight"
				:class="[
					iconRight === true && size === 'sm'
						? 'right-sm'
						: 'right-lg',
				]"
			>
				<slot name="iconRight"></slot>
			</span>
		</div>

		<span
			v-if="$slots.helperText"
			:class="[
				invalid
					? 'sd-input-text-helper-invalid'
					: 'sd-input-text-helper',
			]"
		>
			<slot name="helperText"></slot>
		</span>
	</span>
</template>

<script>
export default {
	emits: ["update:modelValue"],
	props: {
		modelValue: null,
		size: {
			type: String,
			default: "sm",
			validator: (size) => {
				return ["sm", "lg"].includes(size);
			},
		},
		iconLeft: {
			type: Boolean,
		},
		iconRight: {
			type: Boolean,
		},
		invalid: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		onInput(event) {
			this.$emit("update:modelValue", event.target.value);
		},
	},
};
</script>

<style scoped lang="scss">
.sd-input-con {
	width: 100%;
}
.sd-input-text-sm {
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 10px;
	padding-bottom: 10px;
	font-size: 14px;
	line-height: 20px;
	outline: none;
	box-shadow: 0px;
	height: 40px;
	display: inline;
	border: 1px solid $secondary-color-20;
	color: $secondary-color-100;
	transition: all 0.3s;
	border-radius: 4px;

	&:focus {
		border: 1px solid $primary-color-60;
		color: $secondary-color-100;
	}

	&:hover {
		border: 1px solid $primary-color-60;
		color: $secondary-color-100;
	}

	&:disabled {
		color: $secondary-color-40;
		background: $secondary-color-20;
		border: 1px solid $secondary-color-20;
	}

	&:focus {
		color: $secondary-color-100;
		border: 1px solid $secondary-color-20;
	}

	&:invalid {
		border: 1px solid $alert-base;
	}

	&:focus:enabled {
		color: $secondary-color-100;
		border: 1px solid $secondary-color-20;
	}

	&::placeholder {
		color: $secondary-color-50;
	}
}

.sd-input-text-lg {
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 10px;
	padding-bottom: 10px;
	font-size: 14px;
	line-height: 20px;
	outline: none;
	box-shadow: 0px;
	height: 48px;
	display: inline;
	border: 1px solid $secondary-color-20;
	color: $secondary-color-100;
	transition: all 0.3s;
	border-radius: 4px;

	&:focus {
		border: 1px solid $primary-color-60;
		color: $secondary-color-100;
	}

	&:hover {
		border: 1px solid $primary-color-60;
		color: $secondary-color-100;
	}

	&:disabled {
		color: $secondary-color-40;
		background: $secondary-color-20;
		border: 1px solid $secondary-color-20;
	}

	&:focus {
		color: $secondary-color-100;
		border: 1px solid $secondary-color-20;
	}

	&:invalid {
		border: 1px solid $alert-base;
	}

	&:focus:enabled {
		color: $secondary-color-100;
		border: 1px solid $secondary-color-20;
	}

	&::placeholder {
		color: $secondary-color-50;
	}
}

.sd-icon-relative-container {
	position: relative;
}

.sd-input-text-invalid {
	border: 1px solid $alert-base;
}

.sd-input-icon-left-sm {
	color: $secondary-color-100;

	input {
		padding-left: 40px;
	}
}

.sd-input-icon-right-sm {
	color: $secondary-color-100;

	input {
		padding-right: 40px;
	}
}

.sd-input-icon-left-lg {
	color: $secondary-color-100;

	input {
		padding-left: 50px;
	}
}

.sd-input-icon-right-lg {
	color: $secondary-color-100;

	input {
		padding-right: 50px;
	}
}

.left-sm {
	position: absolute;
	left: 12px;
	@extend .icon-style;
}

.right-sm {
	position: absolute;
	right: 12px;
	@extend .icon-style;
}

.left-lg {
	position: absolute;
	left: 16px;
	@extend .icon-style;
}

.right-lg {
	position: absolute;
	right: 16px;
	@extend .icon-style;
}

.icon-style {
	top: 50%;
	transform: translateY(-50%);
	line-height: 0px;
}

.sd-input-text-helper {
	color: $secondary-color-60;
	font-size: 14px;
	line-height: 20px;
	float: left !important;
	margin-top: 8px;
	text-align: left;
}

.sd-input-text-helper-invalid {
	color: $alert-dark;
	font-size: 14px;
	line-height: 20px;
	float: left !important;
	margin-top: 8px;
	text-align: left;
}

.sd-input-title {
	font-size: 14px;
	font-weight: 400;
	line-height: 16px;
	color: $secondary-color-100;
	padding-bottom: 8px;
	text-align: left;
}
</style>
