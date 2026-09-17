<template>
	<div class="sd-notification notification" :class="getNotificationTypeClass">
		<div class="sd-notification-con">
			<div class="content-con">
				<span
					v-if="notificationStatus.icon"
					className="material-icons md-16 sd-notification-icon"
				>
					{{ notificationStatus.icon }}
				</span>

				<span class="body-2-normal regular sd-notification-font">{{
					notificationStatus.message
				}}</span>
			</div>

			<div class="button-con">
				<a
					href="#"
					class="body-2-normal medium info-dark-color"
					v-if="hasActionButton"
					@click.prevent="doAction"
					>{{ actionLabel }}
				</a>

				<a
					href="#"
					v-if="showCloseButton"
					className="material-icons md-18 info-dark-color close-button"
					@click.prevent="doClose"
				>
					close
				</a>
			</div>
		</div>

		<div class="multiple-button-con" v-if="hasMultipleAction">
			<a
				href="#"
				class="body-2-normal medium info-dark-color"
				@click.prevent="doAction"
				>{{ actionLabel }}
			</a>

			<a
				href="#"
				class="body-2-normal medium info-dark-color"
				@click.prevent="doActionTwo"
				>{{ actionTwoLabel }}
			</a>
		</div>
	</div>
</template>

<script>
export default {
	name: "BaseNotification",
	props: {
		message: {
			type: String,
			default: "&nbsp;",
		},
		iconName: {
			type: String,
			required: false,
		},
		hasCloseButton: {
			type: Boolean,
			default: false,
		},
		hasHeadline: {
			type: Boolean,
			dafault: false,
		},
		headline: {
			type: String,
			default: "",
		},
		hasActionButton: {
			type: Boolean,
			default: false,
		},
		actionLabel: {
			type: String,
			default: "",
		},
		hasMultipleAction: {
			type: Boolean,
			default: false,
		},
		actionTwoLabel: {
			type: String,
			default: "",
		},
		type: {
			type: String,
			default: "success",
		},
	},

	methods: {
		doClose() {
			this.$emit("close-notification");
			this.$store.dispatch("notification/updateNotification", {
        show: false,
      });
		},
		doAction() {
			this.$emit("do-action");
			this.doClose();
		},
		doActionTwo() {
			this.$emit("do-action-two");
			this.doClose();
		},
	},
	computed: {
		notificationStatus() {
			return this.$store.state.notification;
		},
		showCloseButton() {
			if (this.hasCloseButton) return true;
			return !this.notificationStatus.autoClose;
		},
		getNotificationTypeClass() {
			switch (this.notificationStatus.type) {
				case "alert":
					return {
						"sd-notification-alert-light": true,
					};
				case "warning":
					return {
						"sd-notification-warning": true,
					};
				case "info":
					return {
						"sd-notification-info": true,
					};
				case "point":
					return {
						"sd-notification-point": true,
					};
				default:
					return {
						"sd-notification-success-light": true,
					};
			}
		},
	},
};
</script>

<style lang="scss" scoped>
	.sd-notification {
		border-radius: 12px;
		max-width: 600px;
	}

	.sd-notification-con {
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
		width: fit-content;
		gap: 16px;
		padding: 12px 16px;
		text-align: left;
		width: 100%;
		color: $white;
	}

	.sd-notification-success {
		background-color: $success-base;
	}
	.sd-notification-success-light {
		background-color: $success-light;

		// .sd-notification-icon {
		// 	color: $success-dark;
		// }
	}

	.sd-notification-alert {
		background-color: $alert-base;
	}
	.sd-notification-alert-light {
		background-color: $alert-light;

		// .sd-notification-icon {
		// 	color: $alert-dark;
		// }
	}

	.sd-notification-warning {
		background-color: $warning-base;
	}

	.sd-notification-warning-light {
		background-color: $warning-light;

		// .sd-notification-icon {
		// 	color: $warning-dark;
		// }
	}

	.sd-notification-info {
		background-color: $info-base;
	}
	.sd-notification-info-light {
		background-color: $info-light;

		// .sd-notification-icon {
		// 	color: $info-dark;
		// }
	}

	.sd-notification-point {
		background-color: $secondary-color-50;

		.sd-notification-con {
			color: $white;
		}
	}

	.content-con,
	.button-con {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}

	.close-button {
		text-decoration: none;
	}

	.multiple-button-con {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		gap: 16px;
		padding: 16px;
		padding-top: 4px;
	}
</style>
