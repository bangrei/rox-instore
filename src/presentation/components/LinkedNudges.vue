<template>
	<div class="linked-chain-con">
		<p class="heading-4">
			<b>{{ title }}</b>
		</p>

		<base-progress-step :items="mappedLinkedNudges" />

		<div class="button-con">
			<base-button
				btnLabel="Previous"
				class="sd-btn-secondary sd-btn-md body-1-normal medium prev-btn"
				@click="goToPreviousNudge"
				v-show="showPrevBtn"
			/>

			<base-button
				btnLabel="Next"
				iconName="arrow_forward"
				:isRightIcon="true"
				class="sd-btn-primary sd-btn-md body-1-normal medium next-btn"
				@click="goToNextNudge"
				v-show="nextNudge"
			/>
		</div>
	</div>
</template>

<script>
import { isEmpty } from "lodash";

export default {
	props: {
		title: {
			type: String,
			default: "",
		},
		nudges: {
			type: Array,
			default: () => [],
		},
		currentNudge: {
			type: Object,
			default: () => {},
		},
	},
	data() {
		return {
			prevNudge: {},
			nextNudge: {},
			mappedLinkedNudges: [],
			showPrevBtn: true,
		};
	},
	watch: {
		nudges: {
			immediate: true,
			handler(val) {
				if (!isEmpty(val) && this.currentNudge) {
					let linkedNudgesTemp = [];
					let firstLinkedNudge = null;
					let otherLinkedNudges = [];
					if (
						this.currentNudge.tags
							?.map((it) => it.toLowerCase())
							?.includes("nudge_1")
					) {
						firstLinkedNudge = this.currentNudge;
						linkedNudgesTemp.push(firstLinkedNudge);
						this.showPrevBtn = false;
					} else {
						val.forEach((nudge) => {
							if (
								nudge.tags
									?.map((it) => it.toLowerCase())
									?.includes("nudge_1") &&
								nudge.links.includes(this.currentNudge.id)
							) {
								firstLinkedNudge = nudge;
								linkedNudgesTemp.push(nudge);
							}
						});
					}

					if (!isEmpty(firstLinkedNudge)) {
						firstLinkedNudge.links.forEach((id) => {
							const nudgeFound = val.find((nudge) => {
								return nudge.id == id;
							});

							if (!isEmpty(nudgeFound))
								otherLinkedNudges.push(nudgeFound);
						});

						if (!isEmpty(otherLinkedNudges)) {
							linkedNudgesTemp.push(...otherLinkedNudges);
						}

						this.mappedLinkedNudges = [];
						let flag = false;
						this.mappedLinkedNudges = linkedNudgesTemp.map(
							(nudge, index) => {
								let isCurrent = false;
								let status = "enable";
								if (nudge.id == this.currentNudge.id) {
									isCurrent = true;
									flag = true;

									if (index !== 0) {
										this.prevNudge =
											linkedNudgesTemp[index - 1];
									}

									if (index != val.length - 1) {
										this.nextNudge =
											linkedNudgesTemp[index + 1];
									}
								}

								if (!flag) {
									status = "pastActive";
								} else if (isCurrent) {
									status = "active";
								}

								return {
									id: nudge.id,
									title: nudge.name,
									description: nudge.description,
									status: status,
								};
							}
						);
					}
				}
			},
		},
	},
	methods: {
		getPageTogo(type) {
			switch (type) {
				case "QUESTIONNAIRE":
					return "SurveyPage";
				case "ARTICLE":
					return "ArticlePage";
				case "SURPRISE":
					return "SurprisePage";
			}
		},
		goToPreviousNudge() {
			this.$router.push({
				name: this.getPageTogo(this.prevNudge.type),
				params: {
					nudgeId: this.prevNudge.id,
				},
			});
		},
		goToNextNudge() {
			this.$router.push({
				name: this.getPageTogo(this.nextNudge.type),
				params: {
					nudgeId: this.nextNudge.id,
				},
			});
		},
	},
};
</script>

<style scoped lang="scss">
.button-con {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 24px 16px;
	gap: 10px;

	.prev-btn {
		flex: 1;
		background-color: $secondary-color-60;
	}

	.next-btn {
		flex: 2;
		max-width: 65%;
	}
}
</style>
