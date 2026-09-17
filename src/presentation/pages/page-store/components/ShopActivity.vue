<template>
	<div class="activity-con" :class="{'empty': (!activities || activities.length == 0)}">
		<div class="activity-nav-con" v-if="showScrollNav">
			<div class="activity-nav prev" @click="scrollLeft()"></div>
			<div class="activity-nav next" @click="scrollRight()"></div>
		</div>
		<div class="activity-items">
			<router-link :to="goTag(act)" 
				class="activity-item" 
				v-for="(act, index) in activities" 
				:key="index"
				:style="act.imageId ? {'background-image': 'url(' + getImage(act.imageId) + ')'} : {}">
				<div class="overlay"></div>
				<div class="activity-content">
					<span class="label">{{act.name}}</span>
					<span class="action">Shop</span>
				</div>
			</router-link>
		</div>
	</div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
export default {
	mixins: [utility],
	props: {
		activities: {
			type: Array,
			default: () => []
		},
		smaller: {
			type: Boolean,
			default: false
		},
		noScrollNav: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			showScrollNav: false,
		};
	},
	methods: {
		getImage(image) {
			if (!image) return "";
			return this.$store.getters.cloudinaryURL + image + "?width=300";
		},
		goTag(tag) {
			return `/collections/category/${this.slugName(tag.name)}`;
		},
		scrollRight() {
			let parent = document.getElementsByClassName('activity-items');
			if (parent.length == 0) return;
			parent = parent[0];
			parent.scrollLeft += 100;
		},
		scrollLeft() {
			let parent = document.getElementsByClassName('activity-items');
			if (parent.length == 0) return;
			parent = parent[0];
			parent.scrollLeft -= 100;
		},
		checkScrollbar() {
			let el = document.querySelector('.activity-items');
			if (!el) return;
			let x1 = el.scrollLeft;
			el.scrollLeft += 1;
			let x2 = el.scrollLeft;
			el.scrollLeft -= 1;
			let x3 = el.scrollLeft;
			el.scrollLeft = x1;

			this.showScrollNav = x1 !== x2 || x2 !== x3;
			if (this.noScrollNav) this.showScrollNav = false;
		}
	},
	async created() {
		window.addEventListener("resize", this.checkScrollbar);
		setTimeout(() => {
			this.checkScrollbar()
		}, 100);
	},
	beforeUnmount(){
		window.removeEventListener("resize", this.checkScrollbar);
	}
};
</script>

<style lang="scss">
	.activity-con {
		width: 100%;
		position: relative;
		padding-bottom: 32px;

		&.empty {
			margin-top: 0 !important;
			padding: 0 !important;
		}

		.activity-nav-con {
			width: 100%;
			display: flex;
			gap: 24px;
			padding: 6px 7% !important;
			justify-content: flex-end;

			.activity-nav {
				padding: 12px;
				width: 45px;
				height: 45px;
				border-radius: 50%;
				display: flex;
				background: $white;
				align-items: center;
				justify-content: center;

				&::before {
					content: "arrow_back";
					font-family: 'Material Icons Outlined';
					font-weight: normal;
					font-style: normal;
					font-size: 1.5em;
					letter-spacing: normal;
					text-transform: none;
					display: inline-block;
					white-space: nowrap;
					word-wrap: normal;
					direction: ltr;
					text-rendering: optimizeLegibility;
					-webkit-font-smoothing: antialiased;
				}
				&.next {
					&::before{
						content: "arrow_forward";
					}
				}
			}
		}

		.activity-items {
			display: flex;
			gap: 24px;
			width: 100%;
			overflow: hidden;
			overflow-x: auto;
			padding: 20px;

			.activity-item {
				flex: 1;
				min-width: 250px;
				height: 250px;
				background: $white;
				padding: 16px;
				border-radius: 12px;
				position: relative;
				background-position: center;
				background-size: cover;
				background-image: url("@/assets/images/landing_1.jpg");
				overflow: hidden;

				.overlay {
					content: "";
					position: absolute;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					background: rgba(0, 0, 0, 0.3);
				}

				.activity-content {
					width: 100%;
					height: fit-content;
					position: absolute;
					left: 0;
					right: 0;
					top: 0;
					bottom: 0;
					margin: auto;
				}

				.label {
					font-family: 'Berthold Akzidenz Grotesk Medium';
					color: $white;
					text-align: center;
					font-size: 1.2em;
					z-index: 10;
					display: block;
				}
				.action {
					display: block;
					width: fit-content;
					padding: 8px 18px;
					border-radius: 12px;
					background: $white;
					color: #000;
					font-weight: bold;
					margin: 16px auto;
				}
			}
		}
	}
	@media (min-width: 672px) {
		.activity-nav {
			cursor: pointer;
		}
		.activity-items {
			.activity-item {
				.action {
					cursor: pointer;
				}
			}
		}
	}
	@media (max-width: 672px) {
		.activity-nav-con {
			display: none !important;
		}
	}
</style>
