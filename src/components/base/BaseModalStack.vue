<script>
import { h } from "vue";
import BaseIcon from "./BaseIcon.vue";
export default {
	name: "BaseModalStack",

	props: {
		copy: {
			type: Boolean,
			default: false,
		},
		icon: {
			type: String,
		},
		plain: {
			type: Boolean,
			default: false,
		},
	},

	methods: {
		generateContent() {
			const content = [];
			if (this.plain && this.$slots.default != undefined) {
				content.push(
					h("div", { class: "stack__slot" }, this.$slots.default())
				);
				return content;
			}
			if (this.$slots.title != undefined) {
				if (this.$slots.desc != undefined) {
					content.push(
						h("div", { class: "stack__title" }, [
							h(
								"div",
								{ class: "body-1-normal", ref: "clone" },
								this.$slots.title()
							),
							h(
								"div",
								{
									class: " body-2-normal secondary-color-60 ",
								},
								this.$slots.desc()
							),
						])
					);
				} else {
					content.push(
						h("div", { class: "stack__title" }, this.$slots.title())
					);
				}
			}

			if (this.copy === true) {
				content.push(
					h(BaseIcon, {
						class: "sd-icon-btn-lg sd-icon-btn-ghost stack__icon",
						iconName: "content_copy",
						iconSise: "lg",
						onClick: () => {
							this.$emit("copy");
						},
					})
				);
			}

			return content;
		},
	},

	render() {
		return h(
			"div",
			{
				class: "stack",
			},
			[
				h(
					"div",
					{
						class: "material-icons stack__icon",
					},
					this.icon
				),
				this.generateContent(),
			]
		);
	},
};
</script>

<style scoped lang="scss">
.stack {
	margin-top: 5px;
	display: flex;
	min-height: 56px;
	padding: 10px;
	box-shadow: 0 4px 2px -2px $secondary-color-10;

	&__icon {
		align-self: center;
	}

	&__title {
		margin-left: 18px;
		align-self: center;
		flex-grow: 1;
	}

	&__slot {
		flex-grow: 1;
	}
}
</style>
