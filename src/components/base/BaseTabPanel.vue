<template>
	<div
		class="sd-tab-panel"
		v-if="
			tabObjects.length > 0 &&
			(tabObjects != null || tabObjects != undefined)
		"
	>
		<ul
			:class="[
				'sd-tab-custom',
				'hide-scrollbar',
				size == 'lg'
					? 'sd-tab-panel-header-lg'
					: 'sd-tab-panel-header-sm',
			]"
		>
			<li
				v-for="tab in tabObjects"
				:key="tab.title"
				@click="selectTab(tab)"
				:class="[
					selectedTab != null && tab.title == selectedTab.title
						? 'selected-tab'
						: 'primary-tab',
					tab.disabled == true ? 'disabled-tab' : '',
				]"
			>
				<div class="tab-button">
					<i
						class="material-icons md-18"
						v-show="tab.icon != undefined"
					>
						{{ tab.icon }}</i
					>
					<span class="tab-title body-2-normal medium">{{
						tab.title
					}}</span>
					<span
						:class="[
							'tab-chip',
							tab.disabled == true ? 'tab-chip-disabled' : '',
							selectedTab != null &&
							selectedTab.title == tab.title
								? 'tab-chip-selected'
								: '',
						]"
						v-show="tab.chipValue != undefined"
					>
						{{ tab.chipValue }}
					</span>
					<div
						:class="[
							size == 'lg'
								? 'selected-tab-underline-lg'
								: 'selected-tab-underline-sm',
						]"
						v-show="
							selectedTab != null &&
							selectedTab.title == tab.title
						"
					></div>
				</div>
			</li>
		</ul>

		<div class="tab-container">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		size: {
			type: String,
			validator: (value) => {
				return ["sm", "lg"].indexOf(value) !== -1;
			},
		},
	},
	data() {
		return {
			selectedTab: {},
		};
	},
	watch: {
		tabObjects(newVal, oldVal) {
			let newValKeys = newVal ? newVal.map((it) => it.key) : [];
			let oldValKeys = oldVal ? oldVal.map((it) => it.key) : [];
			let isSameTabList =
				JSON.stringify(newValKeys) === JSON.stringify(oldValKeys);

			if (!isSameTabList) this.selectTab(newVal[0]);
		},
	},
	created() {
		this.selectedTab = this.tabObjects[0];
	},
	methods: {
		isTabPanel(child) {
			return child.type.name === "BaseTab";
		},
		selectTab(tab) {
			this.selectedTab = tab;
			this.$emit("select-tab", this.selectedTab.key);
		},
	},
	computed: {
		tabObjects() {
			const tabs = [];
			this.$slots.default().forEach((child) => {
				if (this.isTabPanel(child)) {
					tabs.push(child.props);
				} else if (child.children && child.children instanceof Array) {
					child.children.forEach((nestedChild) => {
						if (this.isTabPanel(nestedChild)) {
							tabs.push(nestedChild.props);
						}
					});
				}
			});
			return tabs;
		},
	},
};
</script>

<style scoped lang="scss">
.sd-tab-panel {
	width: 100%;
}

.sd-tab-panel-header {
	list-style: none;
	display: flex;
	overflow-x: auto;
	overflow-y: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sd-tab-panel-header-sm {
	@extend .sd-tab-panel-header;
	height: fit-content;
}

.sd-tab-panel-header-lg {
	@extend .sd-tab-panel-header;
	height: 52px;
}

.sd-tab-panel-header-sm li {
	text-align: center;
	cursor: pointer;
	transition: 0.3s all;
	padding-top: 12px;
	padding-bottom: 12px;
	padding-left: 16px;
	padding-right: 16px;
	min-width: fit-content;
	align-items: center;
	justify-content: center;
}

.sd-tab-panel-header-lg li {
	text-align: center;
	cursor: pointer;
	transition: 0.3s all;
	padding: 16px;
	min-width: fit-content;
	align-items: center;
	justify-content: center;
}

.selected-tab {
	background-color: none;
	color: $primary-color-70;
	justify-content: center;
	align-items: center;
	display: flex;
}

.selected-tab-underline {
	background-color: none;
	color: $primary-color-70;
	border-bottom: 2px solid $primary-color-70;
	border-radius: 10px;
	position: absolute;
	width: 100%;
	bottom: 0px;
	transition: 0.3s all;
}

.selected-tab-underline-sm {
	@extend .selected-tab-underline;
	bottom: -12px;
}

.selected-tab-underline-lg {
	@extend .selected-tab-underline;
	bottom: -16px;
}

.primary-tab {
	background: none;
	color: $secondary-color-70;
	justify-content: center;
	align-items: center;
	display: flex;
	min-height: 24px;

	&:hover {
		background: $secondary-color-10;
		color: $secondary-color-70;
	}
}

.disabled-tab {
	justify-content: center;
	align-items: center;
	display: flex;
	background: none !important;
	color: $secondary-color-30 !important;
	cursor: not-allowed !important;
}

.tab-button {
	justify-content: center;
	align-items: center;
	display: flex;
	width: fit-content;
	position: relative;
}

.tab-title {
	padding-left: 8px;
	padding-right: 8px;
	align-items: center;
	justify-content: center;
	height: 20px;
	font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
}

.tab-chip {
	border-radius: 10px;
	background: $secondary-color-10;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	padding-bottom: 2px;
	font-size: 12px;
	color: $secondary-color-70;
	height: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.primary-tab:hover .tab-chip {
	background: $secondary-color-20;
}

.tab-chip-disabled {
	@extend .tab-chip;
	background: $secondary-color-10 !important;
	color: $secondary-color-30 !important;
}

.tab-chip-selected {
	@extend .tab-chip;
	background: $primary-color-10;
	color: $primary-color-80;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
	display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
}

.sd-tab-custom {
	padding: 8px 0;
	box-shadow: 0px 4px 4px rgb(38 38 38 / 4%);
}

ul {
	padding-inline-start: 0px;
}

hr {
	padding: 0px;
	width: 100%;
	border-bottom: 2px solid $primary-color-100;
	border-radius: 10px;
	position: absolute;
	bottom: 0px;
}
.tab-container {
	padding-block: 24px;
}
</style>
