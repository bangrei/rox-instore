<template>
	<layout-variant-two class="main-con" :show-loading-screen="loading">
		<template v-slot:body>
            <div class="top-head" v-if="category">
                <h1>{{ category.name }}</h1>
            </div>
            <div class="main-container" v-if="!loading">
                <div class="filter-container" v-if="category && isDesktop">
                    <div class="filter-label">Filter</div>
                    <filter-accordion 
                        ref="filterAccordionDesktop" 
                        :products="products" 
                        :productsFiltered="productsFiltered"
                        @filterProducts="setProductsFiltered"
                    />
                </div>
                <div class="products-container">
                    <div class="products-head">
                        <span class="product-length">{{ productsFiltered.length }} items</span>
                        <div class="btn-filter" v-if="!isDesktop" @click="toggleShowFilter()">
                            <span class="material-icons">tune</span>
                            <span>Filter</span>
                        </div>
                        <div class="btn-filter" @click="toggleShowSorter()">
                            <span class="material-icons">swap_vert</span>
                            <span class="sort-label">Sort by:</span>
                            <span class="sort-by">{{sortedByDisplay}}</span>
                        </div>
                    </div>
                    <product-grid 
                        v-if="!loading" 
                        ref="productGrid_category" 
                        :products="productsFiltered" 
                        :noPadding="true"
                        :gridColumns="3"
                        :more-button="false">
                    </product-grid>
                </div>
            </div>

            <base-modal :show="showFilter" :full-screen="false">
                <template v-slot:header>
                    <div class="modal-header header-flex header-justify">
                        <h3>Filter</h3>
                        <span class="material-icons-outlined back-btn" @click="toggleShowFilter()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body" v-if="showFilter">
                        <filter-accordion 
                            ref="filterAccordionMobile" 
                            :products="products" 
                            :productsFiltered="productsFiltered"
                            @filterProducts="emitFilterPayload"
                        />
                    </div>
                    <div class="modal-footer">
                        <div class="button" @click="setFilterPayload">Apply</div>
                        <div class="button lite" @click="resetFilterMobile()">Reset All</div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="showSorter" :full-screen="false">
                <template v-slot:header>
                    <div class="modal-header header-flex header-justify">
                        <h3>Sort</h3>
                        <span class="material-icons-outlined back-btn" @click="toggleShowSorter()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="radio-list">
                            <div class="radio" v-for="radio in sortedList" :key="radio.key">
                                <input name="sortBy" type="radio" 
                                    :checked="radio.clicked == true" 
                                    :data-key="radio.key"
                                >
                                <span class="radio-label">{{ radio.name }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="button lite" @click="resetSorter()">Reset All</div>
                        <div class="button" @click="sortProducts()">Apply</div>
                    </div>
                </template>
            </base-modal>
		</template>
        <template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="-1"></base-footer-nav> -->
            <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import ProductGrid from "../page-store/components/ProductGrid.vue";
import FilterAccordion from './components/FilterAccordion.vue';
import utility from "@/presentation/mixins/utility.js";
import { getInventory } from "@/connector/v4/productConnector";
import { isEmpty } from "lodash";
// import moment from 'moment';

export default {
    name: "FilterPage",
    mixins: [utility],
    components: {
        LayoutVariantTwo,
        ProductGrid,
        FilterAccordion,
    },
    data() {
        return {
            loading: false,
            isDesktop: false,
            category: null,
            products: [],
            productsFiltered: [],
            sortBy: {
                newest: {
                    clicked: true,
                    selected: true,
                    name: "Newest",
                },
                oldest: {
                    clicked: false,
                    selected: false,
                    name: "Oldest",
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
                // inStock: {
                //     clicked: false,
                //     selected: false,
                //     name: "In Stock",
                // },
            },
            showFilter: false,
            filterPayload: null,
            showSorter: false,
        };
    },
    watch: {},
    computed: {
        sortedByDisplay(){
            let theOne = null;
            for (var key in this.sortBy) {
                if (this.sortBy[key].clicked) theOne = this.sortBy[key];
            }
            return theOne ? theOne.name : "Newest";
        },
        sortedList(){
            let items = [];
            for(var key in this.sortBy){
                let it = this.sortBy[key];
                it.key = key;
                items.push(it);
            }
            return items;
        }
    },
    methods: {
        goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
        },
        resetFilterMobile() {
            this.$refs.filterAccordionMobile.resetAll();
        },
        toggleShowFilter(){
            this.showFilter = !this.showFilter;
            if (this.showFilter && !this.isDesktop) {
                setTimeout(() => {
                    this.$refs.filterAccordionMobile.transferPayload(this.filterPayload);
                }, 250);
            }
        },
        toggleShowSorter(){
            this.showSorter = !this.showSorter;
        },
        async resetSorter() {
            let items = document.getElementsByName('sortBy');
            for (var i = 0; i < items.length; i++){
                document.getElementsByName('sortBy')[i].checked = false;
            }
            document.querySelector("[data-key='newest']").checked = true;
            this.sortBy.newest.clicked = true;
        
            for (var s in this.sortBy) {
                this.sortBy[s].clicked = false;
            }
            this.sortProducts();
        },
        sortProducts() {
            let items = document.getElementsByName('sortBy');
            let key = "";
            for(var i=0; i< items.length;i++){
                if(document.getElementsByName('sortBy')[i].checked) key = document.getElementsByName('sortBy')[i].dataset.key;
            }
            for(var s in this.sortBy){
                this.sortBy[s].clicked = false;
            }
            if (key) this.sortBy[key].clicked = true;

            this.productsFiltered.sort((a,b) => {
                if (this.sortBy.newest.clicked) return b.id - a.id;
                if (this.sortBy.oldest.clicked) return a.id - b.id;
                let priceA = parseFloat(a.price);
                let priceB = parseFloat(b.price);
                if(!isEmpty(a.variants)){
                    a.variants.sort((x,y) => { return parseFloat(x.price) - parseFloat(y.price) });
                    priceA = parseFloat(a.variants[0].price);
                }
                if(!isEmpty(b.variants)) {
                    b.variants.sort((x,y) => { return parseFloat(x.price) - parseFloat(y.price) });
                    priceB = b.variants[0];
                }
                if(this.sortBy.lowestPrice.clicked) {
                    return priceA - priceB;
                }
                if(this.sortBy.highestPrice.clicked) {
                    return priceB - priceA;
                }
                if(this.sortBy.productAsc.clicked) {
                    return a.name.localeCompare(b.name);
                }
                if(this.sortBy.productDesc.clicked) {
                    return b.name.localeCompare(a.name);
                }
                return a.id - b.id;
            });
            this.showSorter = false;
            // this.$refs.productGrid_category.finalizeProducts(this.productsFiltered);
            this.$refs.productGrid_category.currentProducts = [];
            this.$refs.productGrid_category.loading = true;
            setTimeout(() => {
                this.$refs.productGrid_category.setCurrentProducts();
                this.$refs.productGrid_category.loading = false;
                this.showSorter = false;
            }, 1);
        },
        async storeChanged() {
            try {
                let currentOutlet = this.$store.getters.getCurrentOutlet;
                this.loading = true;
                await this.refreshMainData(true, undefined, currentOutlet.apiCode);
                let params = {
                    outlet: currentOutlet.apiCode,
                    brandCode: this.$route.params.brandCode,
                    categoryId: this.$route.params.categoryId
                }
                this.goToWithParams('FilterPage', params);
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        emitFilterPayload(payload) {
            this.filterPayload = {
                range: payload.range,
                prices: payload.prices,
                selectedPriceIndexes: payload.selectedPriceIndexes,
                available: payload.available,
            }
            if (!this.isDesktop && this.showFilter && !isEmpty(payload) && payload.isMinAndMaxPrice) {
                this.setProductsFiltered(payload);
            }
        },
        setFilterPayload() {
            this.setProductsFiltered(this.filterPayload);
            if (isEmpty(this.filterPayload)) this.sortProducts();
        },
        resizeHandler() {
            this.isDesktop = window.innerWidth >= 672;
            this.showFilter = false;
            if (!this.filterPayload) return;
            setTimeout(() => {
                if (this.isDesktop) {
                    this.$refs.filterAccordionDesktop.transferPayload(this.filterPayload);
                }
            }, 250);
        },
        setProductsFiltered(payload) {
            this.showFilter = false;
            
            if (!payload) {
                this.productsFiltered = this.products.sort((a, b) => {
                    return b.id - a.id;
                });
                this.filterPayload = null;
                return;
            }
            this.emitFilterPayload(payload);

            let priceRanges = payload.prices;
            let rangeFrom = payload.range.from;
            let rangeTo = payload.range.to;
            let availability = payload.available;

            let products = this.products.filter((it) => {
                let stocks = it.inventories.filter((st) => { return st.stock > 0 });
                if (availability == 1) return stocks.length > 0;
                if (availability == 2) return it.inventories.filter((st) => { return st.stock <= 0 }).length == it.inventories.length;
                return true;
            }).sort((a, b) => {
                return b.id - a.id;
            });

            products = products.filter((it) => {
                let prices = [it.price];
                if (!isEmpty(it.variants)) prices = it.variants.map(v => v.price);

                if (priceRanges.length > 0) {
                    return priceRanges.filter((range) => {
                        return prices.filter((price) => {
                            if (range.isMax) return price > range.from;
                            return price >= range.from && price <= range.to;
                        }).length > 0;
                    }).length > 0;
                } else if (rangeFrom || rangeTo) {
                    return prices.filter((price) => {
                        if (!rangeTo) return price >= rangeFrom;
                        return price >= (rangeFrom || 0) && price <= rangeTo;
                    }).length > 0;
                }
                return true;
            });

            this.productsFiltered = products;
            this.sortProducts();
        },
        async mapInventories() {
            let products = this.$store.getters.getProducts;
            let outletCode = this.$route.params.outlet;
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            let brandCode = this.$route.params.brandCode;

            if (!isEmpty(products)) {
                const binding = async () => {
                    products.forEach(async (it) => {
                        it.inventories = [];
                        var res = await getInventory(outletCode, it.id);
                        it.inventories = res.inventories.filter((inv) => {
                            return inv.status == "ACTIVE" && inv.store.brandCode == brandCode && currentOutlet.stores.find(s => s.id == inv.store.id);
                        });
                    });
                }
                await binding();
                this.products = products.filter((prd) => {
                    return prd.categories.indexOf(this.category.id) > -1;
                });
            }
            this.setProductsFiltered();
            this.loading = false;
        }
    },
    async created() {
        try {
            let outletCode = this.$route.params.outlet;
            this.isDesktop = window.innerWidth >= 672;
            this.loading = true;
            if (!this.$store.getters.hasInited) await this.refreshMainData(false, undefined, outletCode);
            let categories = this.$store.getters.getCategories;
            this.category = categories.find(it => it.id == this.$route.params.categoryId);
            if (!this.category) {
                this.loading = false;
                this.showNotification("alert", "error_outline", "Category is not found!");
                return;
            }
            await this.mapInventories();
            window.addEventListener('resize', this.resizeHandler);
        } catch (error) {
            this.loading = false;
            this.showNotification("alert", "error_outline", error);
        }
    },
    beforeUnmount(){
        window.removeEventListener('resize', this.resizeHandler);
    }
};
</script>

<style scoped lang="scss">
    .back-btn {
        cursor: pointer;
        &:hover{
            opacity: 0.7;
        }
    }
    .modal-body {
        .radio-list {
            padding: 24px 0 !important;
        }
    }
    .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid $secondary-color-20;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        .button {
            padding: 12px 24px;
            border-radius: 8px;
            border: 1px solid transparent;
            background: $primary-color-60;
            color: $white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-weight: bold;
            &.lite {
                border-color: $primary-color-20;
                color: $primary-color-60;
                background: $white;
            }
        }
    }
    .top-head {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 24px;
        align-items: flex-start;
        h1 {
            padding-top: 24px;
            font-size: 1.8em;
        }
    }
    .main-container {
        width: 100%;
        display: flex;
        gap: 32px;
        flex-direction: column;
        padding: 24px;
        .filter-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            .filter-label {
                font-weight: bold;
                font-size: 1.5em;
                padding: 8px 0;
            }
        }
        .products-container {
            flex: 3;
            .products-head {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0px;
                .product-length {
                    font-weight: bold;
                    font-size: 1.2em;
                }
                .btn-filter {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    border-radius: 24px;
                    border: 1px solid $secondary-color-20;
                    cursor: pointer;
                    &:hover{
                        opacity: 0.7;
                    }
                    * {
                        white-space: nowrap;
                    }

                    .sort-by {
                        color: $secondary-color-50;
                    }
                }
            }
        }
    }
    .header-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        &.centered {
            flex: 3;
        }
        &.guest {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    @media (min-width: 672px) {
        .top-head {
            padding: 24px 7% !important;
        }
        .main-container {
            padding: 24px 7% !important;
            flex-direction: row !important;
            .products-container {
                .products-head {
                    padding: 0 8px !important;
                }
            }
            .filter-container {
                .range-content {
                    .range-wrapper {
                        .range-item {
                            input {
                                max-width: 100px !important;
                            }
                        }
                    }
                }
            }
        }
	}
</style>