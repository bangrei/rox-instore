<template>
    <div class="filter-accordions">
        <div class="page__accordion">
            <base-accordion v-if="brands.length" ref="accordionBrands" accordion-title="Brands" accordion-dark-header="true">
                <div class="checkbox-wrapper">
                    <div class="checkbox" v-for="(b, i) in brands" :key="i">
                        <input type="checkbox" v-model="b.clicked" :checked="b.clicked" @click="toggleFilterBrand(i)">
                        <span class="checkbox-label">{{ b.name }}</span>
                    </div>
                </div>
                <button v-if="isDesktop" @click="emitFiltered">Find</button>
            </base-accordion>
            <base-accordion v-if="categoriesFilter.length" ref="accordionCategories" accordion-title="Category" accordion-dark-header="true">
                <div class="checkbox-wrapper">
                    <div class="checkbox" v-for="(b, i) in categoriesFilter" :key="i">
                        <input type="checkbox" v-model="b.clicked" :checked="b.clicked" @click="toggleFilterCategory(i)">
                        <span class="checkbox-label">{{ b.name }}</span>
                    </div>
                </div>
                <button v-if="isDesktop" @click="emitFiltered">Find</button>
            </base-accordion>
            <base-accordion ref="accordionPrice" accordion-title="Price" accordion-dark-header="true">
                <div class="checkbox-wrapper">
                    <div class="checkbox" v-for="(p, i) in priceFilter" :key="i">
                        <input type="checkbox" v-model="p.clicked" :checked="p.clicked" @click="toggleFilterPrice(i)">
                        <span class="checkbox-label" v-if="p.isMax">> {{ currency(p.to) }}</span>
                        <span class="checkbox-label" v-if="!p.isMax">{{ currency(p.from) }} - {{ currency(p.to) }}</span>
                    </div>
                </div>
                <button v-if="isDesktop" @click="emitFiltered">Find</button>
            </base-accordion>
            <base-accordion ref="accordionRange" accordion-title="Range" accordion-dark-header="true">
                <div class="range-content">
                    <div class="range-wrapper">
                        <div class="range-item">
                            <input type="number" min="0" v-model="rangeFrom">
                            <span class="range-label">Min. amount</span>
                        </div>
                        <div class="range-divider">
                            <span class="material-icons">remove</span>
                        </div>
                        <div class="range-item">
                            <input type="number" min="0" v-model="rangeTo">
                            <span class="range-label">Max. amount</span>
                        </div>
                    </div>
                    <div class="range-buttons">
                        <div class="range-button lite" @click="resetMinMaxPrice()">Clear</div>
                        <div class="range-button" @click="findMinMaxPrice()">Find</div>
                    </div>
                </div>
            </base-accordion>
            <base-accordion v-if="!hideAvailability" 
                ref="accordionInventory" 
                accordion-title="Availability" 
                accordion-dark-header="true"
            >
                <div v-if="isFetchingInventories" class="checkbox-wrapper loading">
                    <small>Checking availability...</small>
                </div>
                <div v-else class="checkbox-wrapper">
                    <div class="checkbox checkbox-circle">
                        <input type="checkbox" :checked="available == 1" @click="setAvailability(1)">
                        <span class="checkbox-label">In-stock ({{ inStock }})</span>
                    </div>
                    <div class="checkbox checkbox-circle">
                        <input type="checkbox" :checked="available == 2" @click="setAvailability(2)">
                        <span class="checkbox-label">Out of stock ({{ outStock }})</span>
                    </div>
                </div>
                <!-- <div class="inventory-wrapper">
                    <div class="radio-list left-radio">
                        <div class="radio">
                            <input name="availability" type="radio" :value="1" v-model="available">
                            <span class="radio-label">In-stock ({{ inStock }})</span>
                        </div>
                        <div class="radio">
                            <input name="availability" type="radio" :value="2" v-model="available">
                            <span class="radio-label">Out of stock ({{ outStock }})</span>
                        </div>
                    </div>
                </div> -->
            </base-accordion>
        </div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
    name: "FilterAccordion",
    mixins: [utility],
    props: {
		products: {
			type: Array,
			default: () => []
        },
        productsFiltered: {
			type: Array,
			default: () => []
        },
        brands: {
			type: Array,
			default: () => []
        },
        categories: {
			type: Array,
			default: () => []
        },
        hideAvailability: {
            type: Boolean,
            default: false,
        },
        selectedCategories: {
            type: Array,
            default: () => []
        },
        collectionType: {
            type: String,
            default: ""
        },
        collectionName: {
            type: String,
            default: ""
        },
        stockIn: {
            type: Number,
            default: 0
        },
        stockOut: {
            type: Number,
            default: 0
        },
	},
    data() {
        return {
            isDesktop: false,
            sortBy: {
                newest: {
                    clicked: true,
                    selected: true,
                    name: "Newest",
                },
                lowestPrice: {
                    clicked: false,
                    selected: false,
                    name: "Price (Lowest)",
                },
                highestPrice: {
                    clicked: false,
                    selected: false,
                    name: "Price (Highest)",
                },
                productAsc: {
                    clicked: false,
                    selected: false,
                    name: "Product Name (A-Z)",
                },
                productDesc: {
                    clicked: false,
                    selected: false,
                    name: "Product Name (Z-A)",
                },
                inStock: {
                    clicked: false,
                    selected: false,
                    name: "In Stock",
                },
            },
            priceFilter: [
                {
                    clicked: false,
                    from: 1,
                    to: 2000,
                    isMax: false,
                },
                {
                    clicked: false,
                    from: 2000,
                    to: 10000,
                    isMax: false,
                },
                {
                    clicked: false,
                    from: 10000,
                    to: 10000,
                    isMax: true,
                },
            ],
            rangeFrom: null,
            rangeTo: null,
            selectedPriceIndexes: [],
            selectedBrandIndexes: [],
            selectedCategoryIndexes: [],
            brandsFilter: [],
            categoriesFilter: [],
            available: 0,
            isFetchingInventories: false,
            inStock: 0,
            outStock: 0,
        };
    },
    watch: {
        rangeFrom() {
            this.resetFilterPrice();
        },
        rangeTo() {
            this.resetFilterPrice();
        },
        available() {
            this.emitFiltered();
        },
        categories: {
            handler(){
                this.initCategories()
            },
            immediate: true,
        },
        brands: {
            handler(){
                this.initBrands()
            },
            immediate: true,
        },
        stockIn: {
            handler(){
                this.inStock = this.stockIn;
            },
            deep: true,
        },
        stockOut: {
            handler(){
                this.outStock = this.stockOut;
            },
            deep: true,
        }
    },
    methods: {
        initBrands(){
            if (!isEmpty(this.brands)) {
                this.brandsFilter = this.brands.map((it) => {
                    const isClicked = this.brandsFilter.find((b) => b.apiCode == it.apiCode)?.clicked;
                    return {
                        ...it,
                        clicked: isClicked == true,
                    };
                }).sort((a, b) => a.name.localeCompare(b.name));
                this.$nextTick(() => {
                    if (!isEmpty(this.brands) && this.$refs.accordionBrands) this.$refs.accordionBrands.isClosed = true;
                })
            }
        },
        initCategories(){
            if (!isEmpty(this.categories)) {
                let categories = this.categories.map((it) => {
                    return {
                        ...it,
                        clicked: this.selectedCategories.includes(it.id),
                    };
                });
                let cats = [];
                for (let i = 0; i < categories.length; i++){
                    let one = categories[i];
                    let exists = cats?.find((c) => c.name == one.name);
                    if (!exists) cats.push(one);
                }
                /*
                let parents = this.mapProductCategories();
                cats = cats.filter((c) => {
                    let hasParent = parents.find((p) => p.name.toLowerCase() == c.name.toLowerCase());
                    if (hasParent) return false;
                    let hasSub = parents.find((p) => p.subCategories?.filter((s) => s.toLowerCase() == c.name.toLowerCase()).length > 0);
                    if (hasSub) return false;
                    let hasChildren = parents.find((p) => {
                        return p.children?.filter((s) => {
                            return s.items.filter((n) => n.toLowerCase() == c.name.toLowerCase()).length > 0;
                        }).length > 0;
                    });
                    if (hasChildren) return false;
                    return true;
                })
                */
                if (!isEmpty(this.selectedCategories)) {
                    let ctx = [];
                    for (let i = 0; i < cats.length; i++){
                        if (cats[i].clicked) ctx.push(i);
                    }
                    this.selectedCategoryIndexes = ctx;
                }
                this.categoriesFilter = cats?.sort((a,b) => a.name.localeCompare(b.name));
                this.$nextTick(() => {
                    if (!isEmpty(this.selectedCategories)) this.$refs.accordionCategories.isClosed = true;
                })
            }
        },
        setAvailability(val) {
            if (val == this.available) this.available = 0;
            else this.available = val;
            this.emitFiltered();
        },
        resetAll() {
            this.resetFilterPrice();
            this.resetFilterBrand();
            this.resetFilterCategories();
            this.rangeFrom = null;
            this.rangeTo = null;
            this.available = 0;
        },
        resetFilterPrice() {
            this.selectedPriceIndexes = [];
            this.priceFilter.map((it) => {
                it.clicked = false;
                return it;
            });
        },
        resetFilterBrand() {
            if (isEmpty(this.brandsFilter)) return;
            this.selectedBrandIndexes = [];
            this.brandsFilter.map((it) => {
                it.clicked = false;
                return it;
            });
        },
        resetFilterCategories() {
            if (isEmpty(this.categoriesFilter)) return;
            this.selectedCategoryIndexes = [];
            this.categoriesFilter.map((it) => {
                it.clicked = false;
                return it;
            });
        },
        resetMinMaxPrice() {
            if (!this.rangeFrom && !this.rangeTo) return;
            this.rangeFrom = null;
            this.rangeTo = null;
            this.resetFilterPrice();
            // this.emitFiltered();
        },
        findMinMaxPrice() {
            // if (!this.rangeFrom) return;
            this.resetFilterPrice();
            this.emitFiltered(true);
        },
        toggleFilterBrand(index) {
            let ix = this.selectedBrandIndexes.indexOf(index);
            if (ix >= 0) this.selectedBrandIndexes.splice(ix, 1);
            else this.selectedBrandIndexes.push(index);
            // this.brandsFilter.map((p, i) => {
            //     if (i == index) p.clicked = !p.clicked;
            //     return p;
            // });
            // this.emitFiltered();
        },
        toggleFilterCategory(index) {
            let ix = this.selectedCategoryIndexes.indexOf(index);
            if (ix >= 0) this.selectedCategoryIndexes.splice(ix, 1);
            else this.selectedCategoryIndexes.push(index);
            // this.emitFiltered();
        },
        toggleFilterPrice(index) {
            let ix = this.selectedPriceIndexes.indexOf(index);
            if (ix >= 0) this.selectedPriceIndexes.splice(ix, 1);
            else this.selectedPriceIndexes.push(index);
            this.priceFilter.map((p, i) => {
                if (i == index) p.clicked = !p.clicked;
                return p;
            });
            // this.emitFiltered();
        },
        transferPayload(payload) {
            if (!payload) return;
            this.rangeFrom = payload.range.from;
            this.rangeTo = payload.range.to;
            this.available = payload.available;
            this.selectedPriceIndexes = payload.selectedPriceIndexes;
            this.selectedBrandIndexes = payload.selectedBrandIndexes;
            this.selectedCategoryIndexes = payload.selectedCategoryIndexes;
            this.priceFilter.map((it, ix) => {
                it.clicked = this.selectedPriceIndexes.indexOf(ix) > -1;
                return it;
            });
            this.brandsFilter.map((it, ix) => {
                it.clicked = this.selectedBrandIndexes.indexOf(ix) > -1;
                return it;
            });
            this.categoriesFilter.map((it, ix) => {
                it.clicked = this.selectedCategoryIndexes.indexOf(ix) > -1;
                return it;
            });
        },
        emitFiltered(isMinAndMaxPrice) {
            let prices = [];
            let brands = [];
            if (this.selectedPriceIndexes.length > 0) {
                this.selectedPriceIndexes.forEach((it) => {
                    prices.push(this.priceFilter[it]);
                });
            }
            if (this.selectedBrandIndexes.length > 0) {
                this.selectedBrandIndexes.forEach((it) => {
                    brands.push(this.brandsFilter[it]);
                });
            }

            let payload = {
                range: {
                    from: this.rangeFrom,
                    to: this.rangeTo
                },
                prices: prices,
                brands: this.brandsFilter.filter((it) => it.clicked),
                categories: this.categoriesFilter.filter((it) => it.clicked),
                selectedPriceIndexes: this.selectedPriceIndexes,
                selectedBrandIndexes: this.selectedBrandIndexes,
                selectedCategoryIndexes: this.selectedCategoryIndexes,
                available: this.available,
                isMinAndMaxPrice: isMinAndMaxPrice == true
            }
            this.$emit('filterProducts', payload, (res) => {
                this.inStock = res?.inStockCount || 0;
                this.outStock = res?.outStockCount || 0;
            });
        },
        goToCategory(name) {
            let slug = this.slugName(name);
            this.goToWithParams('CollectionsPage', {
                collectionType: 'category',
                collectionName: slug,
            });
        }
    },
    created() {
        this.isDesktop = window.innerWidth >= 672;
        window.addEventListener('resize', () => {
            this.isDesktop = window.innerWidth >= 672;
        });
        setTimeout(() => {
            this.$refs.accordionPrice.isClosed = true;
            this.$refs.accordionRange.isClosed = true;
            if (!this.hideAvailability) {
                this.$refs.accordionInventory.isClosed = true;
            }
        }, 500);
    }
};
</script>

<style scoped lang="scss">
    @keyframes fetching {
        100% {
            transform: rotate(360deg);
            -webkit-transform: rotate(360deg);
        }
    }
    @-webkit-keyframes fetching {
        100% {
            transform: rotate(360deg);
            -webkit-transform: rotate(360deg);
        }
    }
    .filter-accordions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        .checkbox-wrapper {
            display: flex;
            flex-direction: column;
            background: $white;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid $secondary-color-20;
            max-height: 250px;
            overflow: hidden;
            overflow-y: auto;
            &.loading {
                position: relative;
                align-items: center;
                justify-content: center;
                padding: 32px !important;
                &::before {
                    content: "";
                    width: 25px;
                    height: 25px;
                    border: 2px solid $secondary-color-20;
                    border-left-color: transparent;
                    border-radius: 50%;
                    transition: all 0.3s ease-in-out;
                    -webkit-transition: all 0.3s ease-in-out;
                    animation: fetching 1s linear infinite;
                    -webkit-animation: fetching 1s linear infinite;
                }
            }
            & + button {
                margin-top: 10px;
                cursor: pointer;
            }
        }
        .range-content {
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: $white;
            padding: 24px 16px;
            border-radius: 8px;
            border: 1px solid $secondary-color-20;
            .range-wrapper {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                .range-divider {
                    font-size: 1.5em;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    position: relative;
                }
                .range-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    position: relative;
                    input {
                        padding: 8px 16px;
                        border-radius: 12px;
                        border: 1px solid $secondary-color-20;
                        outline: none;
                        width: 100%;
                        &:focus {
                            border-color: $secondary-color-40;
                        }
                    }
                    .range-label {
                        color: $secondary-color-60;
                        font-size: small;
                        position: absolute;
                        background: $white;
                        left: 0;
                        bottom: -24px;
                        width: fit-content;
                        white-space: nowrap;
                    }
                }
            }
            .range-buttons {
                margin-top: 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                .range-button {
                    padding: 12px 24px;
                    border-radius: 8px;
                    background: $brown-dark;
                    color: $white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    flex: 1;
                    &:hover {
                        opacity: 0.7;
                    }
                    &.lite {
                        color: $brown-dark;
                        background: $white;
                        border: 1px solid $brown-dark;
                    }
                }
            }
        }
    }
</style>