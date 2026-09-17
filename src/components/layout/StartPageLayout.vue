<template>
	<div class="sd-base-con">
		<div class="sd-main-con">
			<slot name="body"> body</slot>
		</div>
	</div>
	<div class="sd-base-loading-con" v-if="showLoadingScreen">
		<div class="sd-loading-con">
			<div class="dot-overtaking"></div>
			<p class="body-2-regular bold loading-text secondary-color-60">
				Loading ...
			</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "StartPageLayout",
	props: {
		showLoadingScreen: {
			type: Boolean,
			default: false,
		},
	}
};
</script>

<style scoped lang="scss">
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
}
.sd-header {
	width: 100%;
}

.sd-main-con {
	height: 100%;
	width: 100%;
	position: relative;
	justify-content: center;
}
</style>
