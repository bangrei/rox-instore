<template>
	<div class="sd-base-con" :class="{'blur-con': showLoadingScreen}">
		<div class="sd-header" v-if="!hideHeader">
			<base-promo-slides v-if="!showLoadingScreen"/>
			<!-- <div class="slide-down"> -->
				<div class="header-con">
					<base-header-nav v-if="!showLoadingScreen" @onSearch="onSearch" :triggerOpenCart="openCart"/>
				</div>
			<!-- </div> -->
		</div>
		<div class="notification__con" :class="{ active: notification.show }">
			<base-notification :class="{ active: notification.show }"/>
		</div>
		<!-- <div :class="['sd-base-layout', {'hide-side-left': hideSideMenu}]"> -->
		<div :class="['sd-base-layout single-grid']">
			<div class="side-left">
				<!-- <base-side-nav :active-index="activeMenuIndex" v-if="!showLoadingScreen"/> -->
			</div>
			<div class="sd-main-con">
				<div class="sd-main-body">
					<slot name="body"></slot>
					<div class="body-footnote mobile" v-if="!hideFootNote" :class="{'invisible': showLoadingScreen}">
						<base-fnb-footer :footer-red="footerRed"/>
					</div>
				</div>
				<div class="body-footnote desktop" v-if="!hideFootNote" :class="{'invisible': showLoadingScreen}">
					<base-fnb-footer :footer-red="footerRed"/>
				</div>
			</div>
		</div>
		<div class="sd-footer footer-white hidden" :class="{'auto': freeFooter, 'hidden': hideFooter}" v-if="hasFooterSlot">
			<slot name="footer"></slot>
		</div>
		<div class="sd-base-loading-con" v-if="showLoadingScreen">
		<div class="sd-loading-con">
			<div class="dot-overtaking"></div>
			<p class="body-2-regular bold loading-text secondary-color-60">
				Loading ...
			</p>
		</div>
	</div>
	</div>
</template>

<script>
import router from "@/router";
import { computed } from "vue";
import { useStore } from "vuex";

export default {
	name: "LayoutVariantTwo",
	emits: ["onSearch"],
	props: {
		footerRed: {
			type: Boolean,
			default: false,
		},
		activeMenuIndex: {
			type: Number,
			default: 0,
		},
		showLoadingScreen: {
			type: Boolean,
			default: false,
		},
		showMainLogo: {
			type: Boolean,
			default: false
		},
		overflowHidden: {
			type: Boolean,
			default: false,
		},
		freeFooter: {
			type: Boolean,
			default: false,
		},
		hideFooter: {
			type: Boolean,
			default: false,
		},
		footerWhite: {
			type: Boolean,
			default: false,
		},
		autoHeight: {
			type: Boolean,
			default: false,
		},
		hideFootNote: {
			type: Boolean,
			default: false
		},
		hideHeader: {
			type: Boolean,
			default: false,
		},
		hideSideMenu: {
			type: Boolean,
			default: false,
		},
		openCart: {
			type: Boolean,
			default: false,
		}
	},
	setup(_, context) {
		const store = useStore();
		const notification = computed(() => store.state.notification);
		const hasHeaderSlot = computed(() => !!context.slots.header);
		const hasFooterSlot = computed(() => !!context.slots.footer);
		const thisYear = computed(() => {
			const date = new Date();
			return date.getFullYear();
		})
		const goFAQ = () => router.push({ name: 'FAQ' });
		const emit = context.emit;
		const onSearch = (key) => {
			emit('on-search', key);
		}

		return {
			store,
			notification,
			hasHeaderSlot,
			hasFooterSlot,
			thisYear,
			goFAQ,
			onSearch
		};
	},
};
</script>

<style scoped lang="scss">
.sd-base-layout {
  width: 100%;
  display: grid;
  grid-template-columns: 0fr 1fr;
	background: #EEEAE6;
}
.side-left {
	max-width: 0;
	overflow: hidden;
	overflow-y: auto;
	background: #EEEAE6;
}
.main-logo {
	display: none;
}

.sd-base-con {
	&.blur-con {
		filter: blur(2px);
		-webkit-filter: blur(2px);
		-moz-filter: blur(2px);
		-o-filter: blur(2px);
	}
}
.sd-header {
	width: 100%;

	&.with-logo {
		position: relative;
		margin-top: -36px;
	}

	.sd-header-logo-con {
		position: relative;
		width: fit-content;
		left: 0;
		right: 0;
		margin: 0 auto;
		z-index: 99999;
		top: 48px;
		pointer-events: none;
		img {
			object-fit: contain;
		}
	}
}
.sd-main-con {
	max-width: 100%;
	overflow: hidden;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	flex: 3;
	min-height: 100vh;
	background: $white;
	overflow: hidden;

	&.overflow-hidden {
		overflow: hidden;
	}
	&.auto-height {
		height: auto !important;
	}
	&.has-footer-slot {
		&:not(.hide-footer) {
			height: auto !important;
		}
	}
	&.hide-footnote {
		height: 100% !important;
	}
}

.sd-main-body {
	width: 100%;
	flex: 3;
	display: block;
	overflow: hidden;
	overflow-y: auto;
}

.body-footnote {
	display: flex;
	flex-direction: column-reverse;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-top: auto;
	padding-bottom: 48px;
	&.desktop {
		display: none;
		padding: 0 !important;
	}
	&.invisible {
		display: none !important;
	}
	.footnote-tnc {
		display: flex;
		gap: 48px;
		align-items: center;
		.tnc-item {
			font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
			color: $primary-color-60;
			&:hover {
				cursor: pointer;
				color: $primary-color-40;
			}
		}
	}
}

.sd-footer {
	width: 100%;
	max-height: 80px;
	overflow: hidden;
	position: fixed;
	background-color: $primary-color-10;
	bottom: 0;

	&.footer-white {
		background-color: $white !important;
		border-top: 1px solid $primary-color-10;
	}

	&.auto {
		height: auto !important;
	}
	&.hidden {
		display: none;
		height: 0 !important;
	}
}

.notification__con {
	min-width: 288px;
	position: fixed;
	left: 50%;
	top: 56px;
	transform: translateX(-50%);
	z-index: 100000;
	width: 100%;
	&:not(.active) {
		pointer-events: none;
	}

	.notification {
		width: 100%;
		margin: 0 auto;
		opacity: 0;
		transition: all 0.5s;

		&.active {
			opacity: 100%;
		}
	}
}
.sd-base-loading-con {
	position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

	.sd-loading-con {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.loading-text {
			margin-top: 40px;
		}
	}
}

.dot-overtaking {
	position: relative;
	width: 12px;
	height: 12px;
	border-radius: 6px;
	background-color: transparent;
	color: $primary-color-70;
	margin: -1px 0;
	box-shadow: 0 -20px 0 0;
	animation: dotOvertaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
}

.dot-overtaking::before,
.dot-overtaking::after {
	content: "";
	display: inline-block;
	position: absolute;
	top: 0;
	left: 0;
	width: 12px;
	height: 12px;
	border-radius: 6px;
	background-color: transparent;
	color: $primary-color-60;
	box-shadow: 0 -20px 0 0;
}

.dot-overtaking::after {
	color: $primary-color-60;
}

.dot-overtaking::before {
	animation: dotOvertaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
	animation-delay: 0.3s;
}

.dot-overtaking::after {
	animation: dotOvertaking 1.5s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
	animation-delay: 0.6s;
}

@keyframes dotOvertaking {
	0% {
		transform: rotateZ(0deg);
	}
	100% {
		transform: rotateZ(360deg);
	}
}

@media (min-width: 672px) {
	.sd-base-layout:is(.single-grid) {
		width: 100%;
		display: grid;
		grid-template-columns: 0px 1fr !important;
		background: #EEEAE6;
		padding-top: 115px;
		.side-left {
			min-width: 0px !important;
			max-width: 0px !important;
			overflow: hidden;
		}
		.sd-main-con {
			border-radius: 0 !important;
		}
		.sd-main-body {
			border-radius: 0px !important;
		}
	}
	.sd-base-layout:not(.hide-side-left){
		width: 100%;
		display: grid;
		grid-template-columns: 80px 1fr;
		padding-top: 115px;
		.side-left {
			min-width: 80px;
		}
	}
	.sd-main-con,
	.notification__con,
	.sd-footer {
		max-width: 100%;
		overflow: hidden;
	}
	.main-logo {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		background: $white;
		height: 70px;
		padding-block: 8px;
		padding-left: 24px;
		border-bottom: 1px solid $secondary-color-20;
		img {
			object-fit: contain;
		}
	}
	.sd-main-con {
		border-radius: 32px 0 0 0;
	}
	.sd-main-body {
		height: 100%;
		max-height: calc(100% - 60px);
		overflow-y: auto;
		border-radius: 20px 0 0 20px;
		background: $white;
	}
	.body-footnote {
		&.mobile {
			display: none !important;
		}
		&.desktop {
			margin-top: auto;
			display: flex !important;
			flex-direction: row;
		}
		.footnote-tnc {
			gap: 24px;
		}
	}

	.sd-footer {
		display: none;
	}
}
</style>
