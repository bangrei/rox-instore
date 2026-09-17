<template>
	<button
		type="button"
		:class="{
			'sd-btn': true,
			'is-right-icon': isRightIcon,
			'sd-btn-loading': isLoading,
			'full-width': isFullWidth,
		}"
		:iconName="iconName"
		:isLoading="isLoading"
		:disabled="isDisabled"
	>
		<span v-if="isLoading" class="material-icons md-16 spinning"
			>hourglass_bottom</span
		>
		<span v-if="iconName && !isLoading" class="material-icons md-16">{{
			iconName
		}}</span>
		<span v-if="!isLoading">{{ btnLabel }}</span>
	</button>
</template>

<script>
export default {
	name: "BaseButton",
	props: {
		btnLabel: {
			type: String,
			default: "&nbsp;",
		},
		iconName: {
			type: String,
			required: false,
		},
		isRightIcon: {
			type: Boolean,
			default: false,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		isFullWidth: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style scoped lang="scss">
.sd-btn {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 12px;
	border: none;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s;
	padding: 8px 16px;

	&:disabled {
		cursor: not-allowed;
	}

	&.is-right-icon {
		flex-direction: row-reverse;
	}

	+ .sd-btn-loading {
		pointer-events: none;
	}

	&.full-width {
		width: 100%;
	}
}

.sd-btn-primary {
	color: $white;
	background-color: $primary-color-60;

	&:disabled {
		color: $secondary-color-40;
		background-color: $secondary-color-20;
	}

	&:not(:disabled):hover {
		background-color: $primary-color-40;
	}

	&:not(:disabled):active,
	+ .sd-btn-loading {
		background-color: $primary-color-80;
	}
}

.sd-btn-secondary {
	color: $white;
	background-color: $secondary-color-30;

	&:disabled {
		color: $secondary-color-40;
		background-color: $secondary-color-20;
	}

	&:not(:disabled):hover {
		background-color: $secondary-color-70;
	}

	&:focus {
		background-color: $secondary-color-80;
	}

	&:not(:disabled):active,
	+ .sd-btn-loading {
		background-color: $secondary-color-60;
	}
}

.sd-btn-tertiery {
	color: $primary-color-60;
	background-color: $white;
	border: 1px solid $primary-color-20;

	&:disabled {
		color: $secondary-color-30;
		border: 1px solid $secondary-color-30;
	}

	&:not(:disabled):hover {
		background-color: $secondary-color-30;
		color: $secondary-color-100;
	}

	&:focus {
		background-color: $secondary-color-10;
		border-color: $primary-color-60;
		color: $secondary-color-100;
	}

	&:not(:disabled):active,
	+ .sd-btn-loading {
		color: $primary-color-60;
		border-color: $primary-color-20;
	}
}

.sd-btn-ghost {
	color: $primary-color-60;
	background-color: $white;

	&:disabled {
		color: $secondary-color-30;
	}

	&:not(:disabled):hover {
		background-color: $secondary-color-10;
		color: $secondary-color-70;
	}

	&:focus {
		background-color: $white;
		border: 1px solid $primary-color-60;
	}

	&:not(:disabled):active,
	+ .sd-btn-loading {
		background-color: $primary-color-10;
	}
}

.sd-btn-sm {
	padding: 5px 16px;
}

.sd-btn-md {
	padding: 9px 16px;
}

.sd-btn-lg {
	padding: 13px 16px;
}
</style>
