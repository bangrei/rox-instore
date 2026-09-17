<template>
	<label class="container">
		<input
			type="radio"
			v-bind="$attrs"
			:checked="checked"
			:disabled="disabled"
			:name="name"
			:value="value"
		/>

		<span
			class="sd-radio-button"
			:class="[
				disabled === false
					? 'sd-radio-button-enabled '
					: 'sd-radio-button-disabled',
			]"
		></span>
	</label>
</template>

<script>
export default {
	name: "BaseRadioButton",
	inheritAttrs: false,
	props: {
		checked: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		name: {
			type: String,
			required: false,
		},
		value: {
			type: String,
			required: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.container {
	display: inline-block;
	position: relative;
	cursor: pointer;
	user-select: none;
	width: 24px;
	height: 24px;
}

/* Hide the browser's default checkbox */
.container input[type="radio"] {
	position: absolute;
	opacity: 0;
	display: none;
}

.sd-radio-button {
	position: absolute;
	height: 24px;
	width: 24px;
	border-radius: 32px;
	background-color: $white;
}

.sd-radio-button:after {
	content: "";
	position: absolute;
	display: none;
}

.container input:checked ~ .sd-radio-button:after {
	display: block;
}

.container .sd-radio-button:after {
	top: 7px;
	left: 7px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: $white;
}

/* Colour*/
.sd-radio-button-enabled {
	border: 1px solid $secondary-color-30;
}

input:checked ~ .sd-radio-button-enabled {
	background-color: $primary-color-60;
	border: 1px solid $primary-color-60;
}

.sd-radio-button-disabled {
	border: 1px solid $secondary-color-20;
	cursor: default;
}

input:checked ~ .sd-radio-button-disabled {
	background-color: $secondary-color-20;
}
</style>
