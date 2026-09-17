<template>
	<button :class="['sd-chip', darkMode == true ? 'sd-chip-dark' : '']">
		<i
			v-show="iconLeft != undefined"
			class="centralised-icon sd-chips-left-icon material-icons md-18"
		>
			{{ iconLeft }}
		</i>
		<span class="sd-chip-label">
			{{ label }}
		</span>
		<i
			v-show="iconRight != undefined"
			class="centralised-icon sd-chips-right-icon material-icons md-18"
		>
			{{ iconRight }}
		</i>
	</button>
</template>

<script>
export default {
	props: {
		label: {
			type: String,
			required: true,
		},
		iconLeft: {
			type: String,
		},
		iconRight: {
			type: String,
		},
		disabled: {
			type: Boolean,
		},
		darkMode: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style scoped lang="scss">
.sd-chip {
	height: 32px;
	padding-right: 16px;
	padding-left: 16px;
	padding-top: 5px;
	padding-bottom: 5px;
	border-radius: 50px;
	width: fit-content;
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: 1px solid $secondary-color-30;
	color: $secondary-color-100;

	&:hover {
		background: $secondary-color-10;
	}

	&:active {
		background: $primary-color-10 !important;
		border: none;
		color: $primary-color-80;
	}

	&:focus {
		background: $secondary-color-10;
		border: 1px solid $primary-color-60;
	}

	&:disabled {
		color: $secondary-color-40;
	}
}

.sd-chip-dark {
	&:active {
		background: $secondary-color-100 !important;
		color: white !important;
		border: 0px;
	}
}

.sd-chip-label {
	// font-family: inter;
	font-size: 16px;
	line-height: 22px;
	white-space: nowrap;
}

.centralised-icon {
	display: flex;
	justify-content: center;
	align-items: center;
}

.sd-chips-left-icon {
	padding-right: 8px;
}

.sd-chips-right-icon {
	padding-left: 8px;
}
</style>
