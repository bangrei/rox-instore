<template>
	<label class="container">
		<input
			type="checkbox"
			v-bind="$attrs"
			:checked="modelValue"
			@change="updateValue($event)"
			:disabled="disabled"
		/>
		<span
			v-if="checkboxType === 'checkbox'"
			class="sd-checkbox material-icons"
			:class="[
				disabled === false
					? 'sd-checkbox-enabled '
					: 'sd-checkbox-disabled',
			]"
			>done</span
		>
		<span
			v-else-if="checkboxType === 'switch'"
			:class="[
				disabled === false
					? 'sd-switch sd-switch-enabled '
					: 'sd-disabled-switch sd-switch-disabled',
			]"
		></span>
		<span
			v-else-if="checkboxType === 'mini-knob'"
			class="sd-mini-knob"
			:class="[
				disabled === false
					? 'sd-switch-enabled '
					: 'sd-mini-knob-disabled sd-mini-knob-disabled-switch',
			]"
		></span>
		<span
			v-else-if="checkboxType === 'mini-switch'"
			class="sd-mini-switch round"
			:class="[
				disabled === false
					? 'sd-switch-enabled '
					: 'sd-switch-disabled',
			]"
		></span>
	</label>
</template>

<script>
export default {
	name: "BaseCheckbox",
	inheritAttrs: false,
	methods: {
		updateValue(event) {
			this.$emit("update:modelValue", event.target.checked);
		},
	},
	props: {
		modelValue: {
			type: Boolean,
			default: false,
		},
		checkboxType: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
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
.container input[type="checkbox"] {
	position: absolute;
	opacity: 0;
	display: none;
}

.sd-checkbox:after {
	content: "";
	position: absolute;
	display: none;
}
.sd-checkbox {
	position: absolute;
	width: 24px;
	height: 24px;
	border-radius: 4px;
	color: $white;
}

.sd-switch {
	position: absolute;
	width: 56px;
	height: 32px;
	border-radius: 32px;
	transition: 0.4s;
}

.sd-switch:before {
	position: absolute;
	content: "";
	height: 28px;
	width: 28px;
	top: 1px;
	left: 1px;
	background-color: $white;
	transition: 0.4s;
	border-radius: 50px;
}

input:checked + .sd-switch:before {
	transform: translateX(24px);
}

.sd-disabled-switch {
	position: absolute;
	width: 56px;
	height: 32px;
	border-radius: 32px;
	transition: 0.4s;
	cursor: not-allowed;
}

.sd-disabled-switch:before {
	position: absolute;
	content: "";
	height: 28px;
	width: 28px;
	top: 1px;
	left: 1px;
	background-color: $secondary-color-20;
	transition: 0.4s;
	border-radius: 50px;
}

input:checked + .sd-disabled-switch:before {
	transform: translateX(24px);
	background-color: $secondary-color-10;
}
.sd-mini-knob {
	position: absolute;
	width: 48px;
	height: 24px;
	border-radius: 32px;
	transition: 0.4s;
}

.sd-mini-knob:before {
	position: absolute;
	content: "";
	height: 12px;
	width: 12px;
	top: 5px;
	left: 6px;
	background-color: $white;
	transition: 0.4s;
	border-radius: 32px;
}

input:checked + .sd-mini-knob:before {
	transform: translateX(24px);
}
.sd-mini-knob-disabled-switch {
	position: absolute;
	width: 48px;
	height: 24px;
	border-radius: 32px;
	transition: 0.4s;
}

.sd-mini-knob-disabled-switch:before {
	position: absolute;
	content: "";
	height: 12px;
	width: 12px;
	top: 6px;
	left: 6px;
	background-color: $secondary-color-20;
	transition: 0.4s;
	border-radius: 32px;
}

input:checked + .sd-mini-knob-disabled-switch:before {
	transform: translateX(24px);
	background-color: $secondary-color-10;
}

.sd-mini-switch {
	position: absolute;
	width: 36px;
	height: 12px;
	border-radius: 100px;
	transition: 0.4s;
	align-content: center;
	align-items: center;
}

.sd-mini-switch:before {
	position: absolute;
	content: "";
	height: 20px;
	width: 20px;

	right: 18px;
	background-color: $white;
	transition: 0.4s;
	border-radius: 50px;
}

input:checked + .sd-mini-switch:before {
	transform: translateX(24px);
}

/* Colour*/
.sd-checkbox-enabled {
	border: 1px solid $secondary-color-30;
}

input:checked ~ .sd-checkbox-enabled {
	background-color: $primary-color-60;
	border: 1px solid $primary-color-60;
}

.sd-checkbox-disabled {
	border: 1px solid $secondary-color-20;
	cursor: default;
}

input:checked ~ .sd-checkbox-disabled {
	background-color: $secondary-color-20;
}

.sd-switch-enabled {
	border: 1px solid $secondary-color-30;
	background-color: $secondary-color-30;
}

/* When the checkbox is checked, add a background */
input:checked ~ .sd-switch-enabled {
	background-color: $primary-color-60;
	border: 1px solid $primary-color-60;
}

.sd-switch-disabled {
	border: 1px solid $secondary-color-20;
	cursor: default;
}

input:checked ~ .sd-switch-disabled {
	background-color: $secondary-color-20;
}

.sd-mini-knob-disabled {
	background-color: $white;
	border: 1px solid $secondary-color-20;
	color: $secondary-color-20;
	cursor: default;
}
input:checked ~ .sd-mini-knob-disabled {
	background-color: $secondary-color-20;
}
</style>
