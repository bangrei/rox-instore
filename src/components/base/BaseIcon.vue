<template>
	<button type="button" :disabled="disabled" class="sd-icon-btn">
		<slot>
			<span :class="iconClass">
				{{ iconName }}
			</span>
		</slot>
	</button>
</template>

<script>
export default {
	name: "BaseIcon",
	props: {
		iconName: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		iconSize: {
			type: String,
			validator: (value) => {
				return (
					["sm", "md", "lg", "xlg", "xxlg", "xxxlg"].indexOf(
						value
					) !== -1
				);
			},
		},
		iconStyle: {
			type: String,
			default: "filled",
			validator: (value) => {
				return (
					["outlined", "filled", "sharp", "round"].indexOf(value) !==
					-1
				);
			},
		},
	},
	computed: {
		iconClass() {
			let iconSizeClass = "md-16";
			switch (this.iconSize) {
				case "md":
					iconSizeClass = "md-18";
					break;
				case "lg":
					iconSizeClass = "md-24";
					break;
				case "xlg":
					iconSizeClass = "md-32";
					break;
				case "xxlg":
					iconSizeClass = "md-48";
					break;
				case "xxxlg":
					iconSizeClass = "md-80";
					break;
				default:
					iconSizeClass = "md-16";
			}
			let iconStyleClass =
				this.iconStyle === "filled"
					? "material-icons"
					: `material-icons-${this.iconStyle}`;
			return iconStyleClass + " " + iconSizeClass;
		},
	},
};
</script>

<style scoped lang="scss">
.sd-icon-btn {
	border-radius: 50%;
	transition: all 0.3s;
	border: none;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

//primary
.sd-icon-btn-primary {
	background: $primary-color-60;
	color: $white;

	&:not(:disabled):active {
		background: $primary-color-80;
		color: $white;
	}

	&:disabled {
		background: $secondary-color-20;
		color: $secondary-color-40;
		cursor: not-allowed;
	}
}

.sd-icon-btn-primary-active {
	background: $primary-color-80;
	color: $white;
}
//secondary
.sd-icon-btn-secondary {
	background: $secondary-color-100;
	color: $white;

	&:not(:disabled):active {
		background: $secondary-color-60;
		color: $white;
	}

	&:disabled {
		background: $secondary-color-20;
		color: $secondary-color-40;
		cursor: not-allowed;
	}
}

.sd-icon-btn-secondary-active {
	background: $secondary-color-60;
	color: $white;
}

//tertiary
.sd-icon-btn-tertiary {
	background: none;
	color: $secondary-color-100;
	border: 1px solid $secondary-color-30;

	&:not(:disabled):active {
		background: none;
		color: $primary-color-60;
		border: 1px solid $primary-color-60;
	}

	&:disabled {
		background: none;
		color: $secondary-color-30;
		border: 1px solid $secondary-color-30;
		cursor: not-allowed;
	}
}

.sd-icon-btn-tertiary-active {
	background: none;
	color: $primary-color-60;
	border: 1px solid $primary-color-60;

	&:disabled {
		background: none;
		color: $secondary-color-30;
		border: 1px solid $secondary-color-30;
		cursor: not-allowed;
	}
}

//ghost
.sd-icon-btn-ghost {
	background: none;
	color: $primary-color-70;

	&:not(:disabled):active {
		background: $primary-color-10;
		color: $primary-color-80;
	}

	&:disabled {
		background: none;
		color: $secondary-color-30;
		cursor: not-allowed;
	}
}

.sd-icon-btn-ghost-active {
	background: $primary-color-10;
	color: $primary-color-80;
}

.sd-icon-btn-xsm {
	padding: 4px;
}
.sd-icon-btn-sm {
	padding: 8px;
}

.sd-icon-btn-md {
	padding: 12px;
}

.sd-icon-btn-lg {
	padding: 12px;
}

.sd-icon-btn-xl {
	padding: 24px;
}

.unset-cursor {
	cursor: unset;
}

.align-middle {
	margin: 0 auto;
}
</style>
