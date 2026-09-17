<template>
	<div class="etalase-wrapper">
		<div class="etalase-tabs">
			<div class="etalase-tab"
				:class="{'active': isActiveBrand(brand)}"
				v-for="(brand, index) in curatedBrands" 
				:key="index"
				@click="selectBrand(brand)">
				<span>{{ brand.name }}</span>
			</div>
		</div>
		<div class="etalase-tabs-children" v-if="!isEmpty(displayCategories)">
			<div class="etalase-tab-children"
				:class="{'active': currentCategory == null}"
				@click="showAllProducts()">
				<span>All</span>
			</div>
			<div class="etalase-tab-children"
				:class="{'active': isActive(cat)}"
				v-for="(cat, index) in displayCategories" 
				:key="index"
				@click="selectCategory(cat)">
				<span>{{ cat.name }}</span>
			</div>
		</div>
		<product-grid ref="productGrid" :products="currentProducts" :more-button="true" @loadMore="emitData"></product-grid>
	</div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
import ProductGrid from "./ProductGrid.vue";
export default {
	mixins: [utility],
	props: {
		categories: {
			type: Array,
			default: () => []
		},
		emitable: {
			type: Boolean,
			default: false,
		}
	},
	components: {
        ProductGrid
	},
	data() {
		return {
			displayCategories: [],
			currentCategory: null,
			currentProducts: [],
			isCategoryChanged: false,
			curatedBrands: [],
			currentBrand: null,
		};
	},
	watch: {
		currentBrand(val){
			this.currentCategory = null;
			if(isEmpty(val) || isEmpty(this.categories)) {
				this.displayCategories = [];
				this.currentProducts = [];
				this.isCategoryChanged = !this.isCategoryChanged;
				return;
			}
			let products = [];
			let cats = [];
			this.categories.forEach((c) => {
				if(isEmpty(c.products)) return;
				c.products.forEach((p) => {
					if(p.brands.map((b) => { return b.id }).indexOf(val.id) > -1){
						products.push(p);
						if(cats.map((ct) => { return ct.id }).indexOf(c.id) == -1) cats.push(c);
					}
				})
			});
			this.displayCategories = cats;
			this.currentProducts = products;
			this.isCategoryChanged = !this.isCategoryChanged;
		},
		isCategoryChanged() {
			if (!this.$refs.productGrid) return;
			this.$refs.productGrid.currentProducts = [];
			setTimeout(() => {
				this.$refs.productGrid.setCurrentProducts();
			}, 50);
		}
	},
	methods: {
		showAllProducts(){
			let prd = [];
			if (!isEmpty(this.categories)) {
				this.categories.forEach((c) => {
					if (isEmpty(c.products)) return;
					c.products.forEach((p) => {
						if (!this.currentBrand) {
							prd.push(p);
							return
						}
						if (p.brands.map((b) => { return b.id }).includes(this.currentBrand.id)) {
							prd.push(p);
						}
					});
				});
			}
			this.currentCategory = null;
			this.currentProducts = prd;
			this.isCategoryChanged = !this.isCategoryChanged;
			this.emitData();
		},
		setCurrentProducts() {
			if(isEmpty(this.currentCategory)) return this.showAllProducts();
			let prd = this.currentCategory.products.filter((p) => {
				return p.brands.map((b) => { return b.id }).indexOf(this.currentBrand?.id) > -1;
			});
			this.currentProducts = prd;
			this.isCategoryChanged = !this.isCategoryChanged;
		},
		emitData() {
			if (!this.emitable) return;
			let size = this.$refs.productGrid?.productSize || 0;
			this.$emit("onCategoryClicked", {
				brand: this.currentBrand,
				category: this.currentCategory,
				productSize: size
			});
		},
		selectBrand(brand){
			this.currentBrand = brand;
			this.emitData();
		},
		selectCategory(cat){
			this.currentCategory = cat;
			this.emitData();
			this.setCurrentProducts();
		},
		isActive(cat){
			if(isEmpty(this.currentCategory)) return false;
			return cat.id == this.currentCategory.id;
		},
		isActiveBrand(brand){
			if(isEmpty(this.currentBrand)) return false;
			return brand.id == this.currentBrand.id;
		},
		changeDisplay(items){
			this.displayCategories = items;
		},
		init(storeState) {
			let brands = this.$store.getters.getCuratedBrands || [];
			if (isEmpty(brands)) {
				let hq = this.$store.getters.getHeadquarter;
				if (hq?.headquarter?.brand) {
					brands = hq.headquarter.brand;
				}
			}
			this.curatedBrands = brands.filter((b) => {
				return this.categories.filter((c) => {
					return c.products.filter(p => p.brands.map(br => br.id).indexOf(b.id) > -1).length > 0;
				}).length > 0;
			});
			this.currentCategory = null;
			let skipBrand = false;
			if (!isEmpty(storeState)) {
				if (!isEmpty(storeState.currentBrand)) {
					this.currentBrand = storeState.currentBrand;
					skipBrand = true;
				}
				if (!isEmpty(storeState.currentCategory)) {
					let cat = this.displayCategories.find((c) => c.id == storeState.currentCategory.id);
					if (!isEmpty(cat)) this.currentCategory = cat;
				}
			}
			if(!isEmpty(this.curatedBrands) && !skipBrand) this.currentBrand = this.curatedBrands[0];
			this.setCurrentProducts();
		}
	},
	created() {
		let storeState = this.$store.getters.getStateStorePage;
		this.changeDisplay(this.categories);
		this.init(storeState);
	}
};
</script>

<style lang="scss">
	.etalase-wrapper {
		width: 100%;
		position: relative;

		.etalase-tabs {
			width: 100%;
			padding-inline: 24px;
			display: flex;
			overflow: hidden;
			overflow-x: auto;
			gap: 32px;
			border-bottom: 2px solid $secondary-color-20;

			.etalase-tab {
				color: $secondary-color-60;
				font-weight: bold;
				white-space: nowrap;
				height: fit-content;
				padding-bottom: 12px;
				text-transform: uppercase;
				border-bottom: 2px solid transparent;
				cursor: pointer;

				&.active {
					color: $primary-color-60;
					border-bottom: 2px solid $primary-color-60;
				}
			}
		}
		.etalase-tabs-children {
			width: 100%;
			padding: 24px;
			display: flex;
			overflow: hidden;
			overflow-x: auto;
			gap: 12px;
			background: $white;

			.etalase-tab-children {
				color: $white;
				font-weight: bold;
				white-space: nowrap;
				height: fit-content;
				padding: 8px 32px;
				background: $white;
				color: $secondary-color-70;
				border-radius: 24px;
				border: 1px solid $secondary-color-30;
				cursor: pointer;

				&.active {
					color: $primary-color-70;
					background: $primary-color-20;
					border-color: transparent;

				}
			}
		}
	}
	@media (min-width: 672px) {
		.etalase-wrapper {
			.etalase-tabs {
				padding-left: 0 !important;
				padding-bottom: 0 !important;

				.etalase-tab {
					cursor: pointer;
				}
			}
			.etalase-tabs-children {
				padding-left: 0 !important;

				.etalase-tab-children {
					cursor: pointer;
				}
			}
		}
	}
	.zoom-image {
		object-fit: cover;
		margin: auto;
		height: 100%;
		object-position: center;
	}
</style>
