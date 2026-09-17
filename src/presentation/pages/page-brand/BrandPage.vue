<template>
    <layout-variant-two id="brand-page" :show-loading-screen="loading" :hideFooter="isDesktop" active-menu-index="0">
        <template v-slot:body>
            <div class="main-container" v-if="inited && brand">
                <div class="brands-con" :class="{'show': brands.length > 1 && showAll}">
                    <div class="brand-wrapper" 
                        :class="{'active': item.apiCode == brand.apiCode}"
                        v-for="(item, x) in brands" 
                        :key="x"
                        @click="changeBrand(item.apiCode)">
                        <img v-if="item.imageId" :src="brandImageDisplay(item)" :alt="item.name">
                        <span class="brand-avatar" v-else>{{ avatar(item.name) }}</span>
                    </div>
                </div>
                <div class="head-container">
                    <div class="head-wrapper">
                        <div class="head-logo">
                            <img v-if="brand.imageId" :src="brandImage" :alt="brand.name">
                            <span class="brand-avatar" v-else>{{ avatar(brand.name) }}</span>
                        </div>
                        <div class="head-content">
                            <span class="head-content-title">{{ brand.name }}</span>
                            <span class="head-content-subtitle" v-if="brand.description">{{  brand.description }}</span>
                        </div>
                        <div class="more-brands-btn" v-if="brands.length > 1" @click="toggleShowBrands()">
                            <span class="material-icons-outlined">{{ showAll ? 'expand_more' : 'chevron_right' }}</span>
                        </div>
                    </div>
                </div>
                <div class="spacer" v-if="!isEmpty(tags)"></div>
                <div class="body-container">
                    <shop-activity v-if="!isEmpty(tags)" :activities="tags" :smaller="true"></shop-activity>
                    <div class="categories-container">
                        <div class="category-wrapper" v-for="(cat, i) in categories" :key="i">
                            <div class="head-category">
                                <div class="head-category-title">{{ cat.name }}</div>
                                <div class="head-category-navigator">
                                    <div class="navigator" @click="scrollLeft(cat.id)">
                                        <i class="material-icons-outlined">arrow_back</i>
                                    </div>
                                    <div class="navigator" @click="scrollRight(cat.id)">
                                        <i class="material-icons-outlined">arrow_forward</i>
                                    </div>
                                </div>
                            </div>
                            <product-grid :ref="'productGrid_' + cat.id" :products="cat.products" :more-button="false" :inLine="true" :maxGrid="3" :currentCategory="cat" @moreCategory="viewCategory"></product-grid>
                        </div>
                        <base-empty-product-state :is-filter="true" v-if="isEmpty(categories)"/>
                    </div>
                </div>
            </div>
            <div class="not-found-container" v-if="inited && !brand">
                <span class="material-icons-outlined">search_off</span>
                <span>Brand not found...</span>
            </div>
        </template>
        <template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="-1"></base-footer-nav> -->
            <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
    </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import ShopActivity from "../page-store/components/ShopActivity.vue";
import ProductGrid from "../page-store/components/ProductGrid.vue";

export default {
    name: "BrandPage",
    components: {
        LayoutVariantTwo,
        ShopActivity,
        ProductGrid,
    },
    mixins: [utility],
    data() {
        return {
            loading: false,
            isDesktop: true,
            brand: null,
            inited: false,
            products: [],
            categories: [],
            tags: [],
            brands: [],
            showAll: false,
        };
    },
    computed: {
        brandImage() {
            return this.$store.getters.cloudinaryURL + this.brand?.imageId;
        },
    },
    methods: {
        viewCategory(categoryId) {
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            let params = {
                outlet: currentOutlet.apiCode,
                brandCode: this.brand.apiCode,
                categoryId: categoryId
            }
            this.goToWithParams('FilterPage', params);
        },
        toggleShowBrands() {
            this.showAll = !this.showAll;
        },
        changeBrand(code) {
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            if (code == this.brand.apiCode && currentOutlet.apiCode == this.$route.params.outlet) return;
            let params = {
                outlet: currentOutlet.apiCode,
                brandCode: code,
            }
            if (this.showAll) params.seeAll = true;
            this.goToWithParams('BrandPage', params);
        },
        brandImageDisplay(brand) {
            return this.$store.getters.cloudinaryURL + brand?.imageId;
        },
        scrollLeft(id) {
            let target = this.$refs[`productGrid_${id}`][0].$el.firstChild;
			if (target.scrollLeft <= 0) return;
			target.scrollLeft -= this.isDesktop ? 600 : 300;
		},
		scrollRight(id) {
            let target = this.$refs[`productGrid_${id}`][0].$el.firstChild;
			target.scrollLeft += this.isDesktop ? 600 : 300;
		},
        async storeChanged(){
            try {
                let currentOutlet = this.$store.getters.getCurrentOutlet;
                this.loading = true;
                await this.refreshMainData(true, undefined, currentOutlet.apiCode);
                this.goToWithParams('ShopPage', {
                    outlet: currentOutlet.apiCode
                });
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        showScanner(){
            this.$refs.baseStoreHeader.toggleScanner();
        },
        resizeBannerHandler(){
            this.isDesktop = window.innerWidth >= 672;
        },
        initBrand() {
            this.tags = this.$store.getters.getTags.filter((t) => {
                return t.brands.indexOf(this.brand?.apiCode) > -1;
            });
            this.products = this.$store.getters.getProducts.filter((t) => {
                return t.brands.map((b) => { return b.apiCode }).indexOf(this.brand?.apiCode) > -1;
            });
            this.categories = this.$store.getters.getCategories.filter((c) => {
                return this.products.filter((p) => { return p.categories.indexOf(c.id) > -1 }).length > 0;
            }).map((c) => {
                c.products = this.products.filter((p) => {
                    return p.categories.indexOf(c.id) > -1;
                });
                return c;
            });
            this.inited = true;
            this.loading = false;
        },
        initPage() {
            let brandCode = this.$route.params.brandCode;
            let hq = this.$store.getters.getHeadquarter;
            if (!hq?.headquarter?.brand) return;

            this.brands = hq.headquarter.brand.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            this.brand = this.brands.find((it) => {
                return it.apiCode == brandCode;
            });
        }
    },
    async created() {
        this.loading = true;
        if (!this.$store.getters.hasInited) {
            await this.refreshMainData(false);
        }
        this.initPage();
        this.showAll = this.$route.params.seeAll;
        this.initBrand();
        window.addEventListener("resize",  this.resizeBannerHandler);
        setTimeout(() => {
            this.resizeBannerHandler();
        }, 100);
    },
    beforeUnmount(){
        window.removeEventListener("resize",  this.resizeBannerHandler);
    }
}
</script>

<style scoped lang="scss">
    .header-wrapper {
        display: flex;
        align-items: center;
        gap: 24px;

        &.centered {
            flex: 3;
        }
    }
    .not-found-container {
        width: 100%;
        height: calc(100vh - 120px);
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        color: $secondary-color-70;
        font-weight: bold;
        .material-icons-outlined {
            font-size: 1.5em;
        }
    }
    .main-container {
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: column;

        .brand-avatar {
            color: $primary-color-60;
            font-size: 1.5em;
            font-weight: bold;
        }

        .brands-con {
            height: 0;
            // background: rgb(16,24,40);
            background: $white;
            flex-wrap: wrap;
            width: 100%;
            overflow: hidden;
            transition: all 200ms linear;
            -webkit-transition: all 200ms linear;
            &:is(.show) {
                display: flex;
                align-items: center;
                padding: 24px;
                height: unset !important;
                overflow-x: auto;
                gap: 8px;
            }
            .brand-wrapper {
                // width: 40px;
                // height: 40px;
                // min-width: 40px;
                // min-height: 40px;
                flex-grow: 1;
                flex-basis: 60px;
                height: 60px;
                min-height: 60px;
                padding: 4px;
                border: 2px solid transparent;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: $white;
                border-radius: 4px;
                cursor: pointer;
                &:hover {
                    opacity: 0.7;
                }

                &.active {
                    position: relative;
                    border-color: $primary-color-60;
                    // &::before {
                    //     content: "";
                    //     width: 20px;
                    //     height: 20px;
                    //     border: 10px solid transparent;
                    //     border-bottom-color: $primary-color-60 !important;
                    //     position: absolute;
                    //     left: 50;
                    //     top: -20px;
                    // }
                }
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .brand-avatar {
                    font-size: 1em !important;
                }
            }
        }

        .head-container {
            background: rgb(16,24,40);
            color: $white;
            padding: 24px;
            display: flex;
            align-items: flex-start;
            // border-top: 0.5px solid #6d6a6a;
            width: 100%;

            .head-wrapper {
                display: flex;
                align-items: center;
                gap: 24px;
                width: 100%;
                .head-logo {
                    min-width: 55px;
                    min-height: 55px;
                    max-width: 55px;
                    max-height: 55px;
                    border: 1px solid $white;
                    background: $white;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        mix-blend-mode: multiply;
                    }
                }
                .head-content {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    justify-content: flex-start;
                    align-items: flex-start;
                    text-align: left;
                    width: 100%;
                    .head-content-title {
                        font-weight: bold;
                        font-size: 1.5em;
                        line-height: 1;
                    }
                    .head-content-subtitle {
                        font-size: 0.8em;
                        font-weight: bold;
                    }
                }
                .more-brands-btn {
                    cursor: pointer;
                    &:hover {
                        opacity: 0.7;
                    }
                    .material-icons-outlined {
                        font-size: 2em !important;
                        color: $white;
                    }
                }
            }
        }
        .spacer {
            height: 150px;
            width: 100%;
            background: rgb(16,24,40);
        }
        .body-container {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
            padding-left: 24px;
            .tags {
                width: 100%;
                overflow: hidden;
                overflow-x: auto;
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .categories-container {
                display: flex;
                width: 100%;
                flex-direction: column;
                gap: 36px;
                padding: 24px 0;

                .category-wrapper {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    .head-category {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 24px;
                        .head-category-title {
                            font-weight: bold;
                            font-size: 1.2em;
                        }
                        .head-category-navigator {
                            display: flex;
                            align-items: center;
                            gap: 16px;

                            .navigator {
                                cursor: pointer;
                                width: 25px;
                                height: 25px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: $secondary-color-90;
                                color: $white;
                                .material-icons-outlined {
                                    font-size: 1.1em !important;
                                    pointer-events: none;
                                }
                            }
                        }
                    }
                }
                .category-empty {
                    height: 250px;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }

    @media (min-width: 672px) {
        .not-found-container {
            font-size: 2em !important;
            .material-icons-outlined {
                font-size: 2em !important;
            }
        }
        .brands-con { 
            &.show {
                padding: 24px 7% !important;
            }
            .brand-wrapper {
                flex-basis: 100px !important;
                height: 100px !important;
                min-height: 100px !important;
            }
        }
        .head-container {
            padding: 48px !important;

            .head-logo {
                min-width: 125px !important;
                min-height: 125px !important;
                max-width: 125px !important;
                max-height: 125px !important;
            }
            .head-content {
                .head-content-title {
                    font-size: 2em !important;
                }
                .head-content-subtitle {
                    font-size: 1em !important;
                }
            }
        }
        .body-container {
            .categories-container {
                .category-wrapper {
                    .head-category {
                        padding-left: 0px !important;
                    }
                }
            }
        }
    }
    @media (max-width: 800px) {
        .head-container {
            .head-logo {
                min-width: 75px !important;
                max-width: 75px !important;
                min-height: 75px !important;
                max-height: 75px !important;
            }
            .head-content {
                .head-content-title {
                    font-size: 1.2em !important;
                }
                .head-content-subtitle {
                    line-height: 1;
                }
            }
        }
    }
</style>