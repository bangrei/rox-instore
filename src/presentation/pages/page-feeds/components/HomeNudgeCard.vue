<template>
	<div
		class="nudge-card hide-nudge"
		ref="animateNudge"
		@click="nudgeClicked(nudge)"
	>
		<div class="nudge-card-header-con">
			<base-badge
				:badgeLabel="getFormattedNudgeStatus(nudge)"
				:class="{
					'sd-badge-alert-light': nudge.status == 'NOT_READ',
					'sd-badge-success-light': nudge.status == 'READ',
				}"
				class="sd-badge-sm nudge-status outlined"
			/>

			<div class="nudge-card-point-con" v-if="hasEligiblePoints(nudge)">
				<span class="nudge-card-point">
					{{ nudge.type == "QUESTIONNAIRE" ? nudge.completionPoints : nudge.readingPoints }}
					Points
				</span>
			</div>
		</div>
		<div class="nudge-image">
			<img v-if="nudge.image" :src="nudge.image" :class="{'aligned': aligned}"/>
			<img v-else :src="require('@/assets/images/rox-logo-2025.jpeg')" :class="{'aligned': aligned}"/>
		</div>
		<div class="nudge-card-footer-con">
			<div class="footer-desc-con">
				<router-link :to="nudgeLink(nudge)" class="nudge-link">{{ nudge.name }}</router-link>
				<p class="footer-desc body-2-normal regular" 
					v-html="nudge.type === 'SURPRISE' ? 'Click here to see what we got for you' : descriptionDisplay"
				></p>
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
		aligned: {
			type: Boolean,
			default: false,
		}
	},
	computed: {
		descriptionDisplay() {
			if (!this.nudge.description) return "";
			return this.nudge.description.split("<br/>").join("\n");
		},
	},
	methods: {
		nudgeLink(nudge){
			let pageToGo = "";
			switch (nudge.type) {
				case "QUESTIONNAIRE":
					pageToGo = "survey";
					break;
				case "ARTICLE":
					pageToGo = "article";
					break;
				case "SURPRISE":
					pageToGo = "surprise";
					break;
			}
			return `/${pageToGo}/${nudge.id}`;
		},
		hasEligiblePoints(nudge) {
			let points = nudge.type == "QUESTIONNAIRE" ? nudge.completionPoints : nudge.readingPoints;
			return nudge.status != 'READ' && points > 0;
		},
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
			this.$router.push(this.nudgeLink(nudge));
		},
		getNudgeIconName(nudgeType) {
			return homeService.getNudgeIconName(nudgeType);
		},
		getFormattedNudgeStatus(nudge) {
			let status = nudge.status;
			if (nudge.state == "CLAIMED") status = nudge.state;
			return startCase(toLower(status));
		},
		resize (){
			if (this.aligned) {
				let target = this.$refs.animateNudge;
				if (!target) return;
				let w = target.clientWidth;
				target.style['height'] = `${w}px`;
			}
		}
	},
	mounted() {
		this.setNudgesAnimation();
		this.resize();
		window.addEventListener('resize', this.resize);
	},
	beforeUnmount(){
		window.removeEventListener('resize', this.resize);
	}
};
</script>

<style scoped lang="scss">
	.nudge-card {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
		.nudge-image {
			aspect-ratio: 4/3;
			overflow: hidden;
			border-radius: 12px;
			background: $custom-blue-color;
		}
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		.nudge-card-header-con {
			font-family: 'Berthold Akzidenz Grotesk', sans-serif;
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
		align-items: center;
		justify-content: space-between;
		height: 30px;
		width: 100%;
		overflow: hidden;
	}
	.nudge-card-point-con {
		background-color: $main-red;
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
		padding-inline: 8px;
		color: $white;
		font-size: 0.8em;
	}

	.nudge-card-footer-con {
		text-align: left;
		max-height: 92px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
		button {
			box-shadow: none !important;
			-webkit-box-shadow: none !important;
			width: fit-content !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		.footer-desc-con {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			overflow: hidden;
			margin-bottom: 24px;

			.nudge-link {
				text-decoration: none;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				margin: 0;
				font-size: 17px;
				line-height: 26px;
				color: $border-color;
				cursor: pointer;
				&:hover {
					color: $primary-color-60;
				}
			}
		}

		.footer-desc {
			margin-top: 6px;
			font-size: 15px !important;
			line-height: 18px;
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
			backdrop-filter: blur(4px);
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
