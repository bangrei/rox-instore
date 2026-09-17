<template>
	<div class="linked-chain-con">
		<div class="progress-chain-con">
			<div
				class="chain-wrapper"
				v-for="(item, index) in items"
				:key="item"
			>
				<div
					class="progress-circle-con"
					:class="{
						active: item.status == 'active',
						'past-active': item.status == 'pastActive',
						'use-icon': isUseIcon,
					}"
				>
					<span class="body-1-tight regular" v-if="!isUseIcon">
						{{ progressNumber(index) }}
					</span>

					<div
						class="ellipse"
						v-else-if="item.status == 'active'"
					></div>

					<span
						class="md-24 material-icons"
						v-else-if="item.status == 'pastActive'"
					>
						{{ pastActiveIcon }}
					</span>
				</div>

				<div
					class="chain-con"
					:class="{
						active: item.status == 'active',
						'past-active': item.status == 'pastActive',
					}"
				>
					<p class="body-1-normal regular">{{ item.title }}</p>

					<p class="body-2-normal regular secondary-color-60">
						{{ item.description }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		items: {
			type: Array,
			default: () => [],
		},
		isUseIcon: {
			type: Boolean,
			default: false,
		},
		pastActiveIcon: {
			type: String,
			default: "check",
		},
	},
	data() {
		return {};
	},
	methods: {
		progressNumber(value) {
			value += 1;
			return (value < 10 ? "0" : "") + value;
		},
	},
};
</script>

<style scoped lang="scss">
.progress-circle-con {
	padding: 4px;
	color: $secondary-color-60;
	border-radius: 50%;
	height: 32px;
	min-width: 32px;
	margin-top: 8px;
	border: 2px solid $secondary-color-20;
	display: flex;
	align-items: center;
	justify-content: center;

	.ellipse {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: $primary-color-60;
	}

	&.active {
		color: $primary-color-60;
		border: 2px solid $primary-color-60;
		box-shadow: 0px 0px 0px 4px rgba(255, 167, 38, 0.25);
	}

	&.past-active {
		background: $primary-color-60;
		border: 2px solid $primary-color-60;
		color: $white;
	}
}

.chain-wrapper {
	display: flex;
	gap: 16px;
	padding: 16px;

	.progress-icon {
		margin-top: 8px;
		height: 32px;
	}

	.chain-con {
		text-align: left;
		position: relative;
	}

	&:not(:first-child) {
		padding-top: 8px;

		.chain-con:before {
			content: "";
			position: absolute;
			top: -16px;
			left: -32px;
			border-left: 2px solid $secondary-color-20;
			height: 24px;
			z-index: -1;
		}

		.chain-con.active:before,
		.chain-con.past-active:before {
			content: "";
			border-left: 2px solid $primary-color-60;
		}
	}

	&:not(:last-child) {
		padding-bottom: 8px;

		.chain-con:after {
			content: "";
			position: absolute;
			top: 40px;
			left: -32px;
			border-left: 2px solid $secondary-color-20;
			height: calc(100% - 24px);
			z-index: -1;
		}

		.chain-con.past-active:after {
			content: "";
			border-left: 2px solid $primary-color-60;
		}
	}
}
</style>
