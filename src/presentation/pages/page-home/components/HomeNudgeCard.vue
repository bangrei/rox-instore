<template>
	<div
		class="nudge-card hide-nudge"
		ref="animateNudge"
		:class="nudge.image ? 'with-image' : 'bg-1'"
		:style="{
			'background-image': `url(${nudge.image})`,
		}"
		@click="nudgeClicked(nudge)"
	>
		<div class="nudge-card-header-con">
			<base-badge
				:badgeLabel="getFormattedNudgeStatus(nudge.status)"
				:class="{
					'sd-badge-alert-light': nudge.status == 'NOT_READ',
					'sd-badge-success-light': nudge.status == 'READ',
				}"
				class="sd-badge-rounded sd-badge-sm"
			/>

			<div class="nudge-card-point-con" v-if="nudge.status != 'READ'">
				<base-icon
					class="sd-icon-btn-md sd-icon-btn-ghost"
					iconName="add"
					iconSize="md"
				></base-icon>
				<div class="nudge-card-point-child-con">
					<span class="nudge-card-point">
						{{ nudge.type == "QUESTIONNAIRE" ? nudge.completionPoints : nudge.readingPoints }}
					</span>
					<base-icon
						class="sd-icon-btn-md sd-icon-btn-ghost"
						iconName="star"
						iconSize="md"
					>
					</base-icon>
				</div>
			</div>
		</div>
		<div
			class="nudge-card-footer-con"
			:class="
				nudge.image
					? 'with-image'
					: nudge.backgroundId
					? `bg-${nudge.backgroundId}`
					: 'bg-1'
			"
		>
			<div class="footer-desc-con">
				<p class="body-1-normal bold">{{ nudge.name }}</p>
				<p class="footer-desc body-2-normal regular">
					{{
						nudge.type === "SURPRISE"
							? "Click here to see what we got for you"
							: nudge.description
					}}
				</p>
			</div>
			<base-icon
				v-if="!nudge.image"
				class="sd-icon-btn-md sd-icon-btn-ghost"
				:iconName="getNudgeIconName(nudge.type)"
				iconSize="xlg"
			></base-icon>
		</div>
	</div>
</template>

<script>
import { homeService } from "@/bloc/services";
import { startCase, toLower } from "lodash";
export default {
	props: {
		nudge: {
			type: Object,
			default: () => {},
		},
	},
	methods: {
		setNudgesAnimation() {
			// show/hide nudge (only on mounted hook);

			this.$nextTick(() => {
				const observer = new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add("show-nudge");
						}
					});
				});

				let element = this.$refs.animateNudge;
				observer.observe(element);
			});
		},
		nudgeClicked(nudge) {
			this.$emit("nudge-clicked", nudge);
		},
		getNudgeIconName(nudgeType) {
			return homeService.getNudgeIconName(nudgeType);
		},
		getFormattedNudgeStatus(nudgeStatus) {
			return startCase(toLower(nudgeStatus));
		},
	},
	mounted() {
		this.setNudgesAnimation();
	},
};
</script>

<style scoped lang="scss">
.nudge-card {
	border-radius: 12px;
	padding: 16px;
	background-size: cover;
	position: relative;
	cursor: pointer;
	min-height: 180px;

	&.with-image {
		min-height: 272px;
	}

	&.bg-1 {
		background-color: $custom-blue-color;
	}

	&.bg-2 {
		background-color: $custom-yellow-color;
	}

	&.bg-3 {
		background-color: $primary-color-30;
	}
}
.nudge-card-header-con {
	display: flex;
	justify-content: space-between;
	height: 24px;
}
.nudge-card-point-con {
	background-color: $primary-color-10;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 32px;
}

.nudge-card-point-child-con {
	display: flex;
	align-items: center;
}

.nudge-card-point {
	margin-right: -12px;
	color: $primary-color-60;
}

.nudge-card-footer-con {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 16px;
	text-align: left;
	max-height: 92px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;

	.footer-desc-con {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: hidden;

		p {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.footer-desc {
		margin-top: 6px;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		-webkit-line-clamp: 3;
	}

	&.bg-1 {
		color: $white;

		.sd-icon-btn {
			color: $white;
		}
	}

	&.bg-2,
	&.bg-3 {
		.sd-icon-btn {
			color: $secondary-color-100;
		}
	}

	&.with-image {
		color: $white;
		background: linear-gradient(
			180deg,
			rgba(15, 23, 42, 0) -9.29%,
			#0f172a 100%
		);
		backdrop-filter: blur(20px);
		border-radius: 0px 0px 12px 12px;
	}
}

.hide-nudge {
	opacity: 0;
	transition: all 0.5s ease-in-out;
}

.show-nudge {
	opacity: 1;
}
</style>
