<template>
	<layout-variant-two :show-loading-screen="loading" :active-menu-index="2">
		<template v-slot:body>
            <div class="top-body" v-if="showContent">
                <div class="wrapper" v-if="!isEmpty(banners)">
                    <banner-carousel v-if="inited" :banners="banners" :use-image="true"/>
                    <div v-if="isEmpty(banners)" class="empty-banners"></div>
                </div>
                <TopBlocks/>
                <div class="title centered" v-if="!isEmpty(featuredProducts)">
                    <span>Featured</span>
                </div>
                <product-grid v-if="!isEmpty(featuredProducts)"
                    :products="featuredProducts"
                    :more-button="false"
                    :in-line="true"
                    :nobox="false"
                />
                <!-- <div class="shop-spots-wrapper">
                    <ItemSpots/>
                    <div class="shop-categories" v-if="!isEmpty(filterBrands('',''))">
                        <shop-category ref="shopCategoryA" v-if="!isEmpty(filterBrands('',''))" :is-desktop="isDesktop" :activities="filterBrands('','')"/>
                    </div>
                </div> -->
                <FeaturedProducts :products="products"/>
                <BrandsCarousel v-if="!isEmpty(filterBrands('',''))" :activities="filterBrands('','')"/>
                <div class="wrapper wrapper-2">
                    <span class="title">Designed for Adventure</span>
                    <TagsContent/>
                    <!-- <shop-activity v-if="!isEmpty(tags)" :activities="tags" :noScrollNav="true"/> -->
                </div>
                <brand-products :brands="brandsProductsList"/>
                <div class="video-featured-products-wrapper" v-if="!isEmpty(featuredProducts)">
                    <VideoPopup :videoSrc="videoSrc"/>
                    <div class="featured-products-wrapper">
                        <span class="featured-title">As seen in the Video</span>
                        <product-grid
                            :products="featuredProducts"
                            :more-button="false"
                            :in-line="true"
                            :nobox="false"
                        />
                    </div>
                </div>
                <IGFeed/>
            </div>
            <div class="top-body empty" v-if="showContent && !outletFound">Outlet not found..</div>
		</template>
        <template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="activeFooterNavId"/> -->
            <base-side-nav v-if="!loading" :active-index="2"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import BannerCarousel from "./components/BannerCarousel.vue";
// import ShopActivity from "./components/ShopActivity.vue";
// import ShopCategory from "./components/ShopCategory.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import { storeService, productService } from "@/bloc/services";
import initData from "@/init";
import BrandProducts from "./components/BrandProducts.vue";
import TopBlocks from "./components/TopBlocks.vue";
// import ItemSpots from "./components/ItemSpots.vue";
import VideoPopup from "./components/VideoPopup.vue";
import ProductGrid from "./components/ProductGrid.vue";
import IGFeed from "../page-start/components/IGFeed.vue";
import TagsContent from "./components/TagsContent.vue";
import BrandsCarousel from "./components/BrandsCarousel.vue";
import FeaturedProducts from "./components/FeaturedProducts.vue";
import moment from 'moment-timezone';

export default {
	name: "ShopPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
        BannerCarousel,
        // ShopActivity,
        TagsContent,
        // ShopCategory,
        BrandProducts,
        TopBlocks,
        // ItemSpots,
        VideoPopup,
        ProductGrid,
        IGFeed,
        BrandsCarousel,
        FeaturedProducts,
	},
	data() {
        return {
            serverInited: false,
            activeFooterNavId: 2,
			customer: {},
			loading: false,
            stores: [],
            currentStore: null,
            brand: null,
            banners: [],
            products: [],
            parentCategories: [],
            categories: [],
            tags: [],
            inited: false,
            showContent: false,
            outletFound: false,
            isDesktop: false,
            scrollTop: 0,
            brandScrollLeft: 0,
            categoryScrollLeft: 0,
            currentBrand: null,
            currentCategory: null,
            featuredProducts: [],
            brandsProductsList: []
		};
	},
	watch: {
        currentStore(val){
            this.$store.dispatch("setCurrentStore", val);
        },
        stores(val){
            this.$store.dispatch("setStoreList", val);
        },
        products(val){
            this.$store.dispatch("setProducts", val);
        },
        categories(val){
            this.$store.dispatch("setCategories", val);
        },
        brand(val){
            this.$store.dispatch("setStoreBrand", val);
        },
    },
    computed: {
        filterCategories() {
            if(isEmpty(this.categories)) return [];
            let ctg = [];
            this.categories.forEach((it) => {
                let item = it;
                item.products = this.products.filter((prd) => {
                    return prd.categories.indexOf(it.id) > -1;
                });
                if(!isEmpty(item.products)) ctg.push(item);
            });
            ctg.sort((a,b) => { return a.name.localeCompare(b.name) })
            return ctg;
        },
        videoSrc() {
            const hq = this.$store.getters.getHeadquarter;
            const app = hq?.app?.properties;
            const video = app?.shopVideoPopup;
            return video;
        },
    },
    methods: {
        goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
		},
        showScanner(){
            this.$refs.baseStoreHeader.toggleScanner();
        },
        seeBrands(){
            let hq = this.$store.getters.getHeadquarter;
            if (!hq?.headquarter?.brand) return;
            let brands = hq.headquarter.brand.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            let filteredBrands = brands.filter((br) => {
                let products = this.$store.getters.getProducts.filter((t) => {
                    return t.brands.map((b) => { return b.apiCode }).indexOf(br.apiCode) > -1;
                });
                let categories = this.$store.getters.getCategories.filter((c) => {
                    return products.filter((p) => { return p.categories.indexOf(c.id) > -1 }).length > 0;
                }).map((c) => {
                    c.products = products.filter((p) => {
                        return p.categories.indexOf(c.id) > -1;
                    });
                    return c;
                });
                return categories.length > 0;
            });
            let brand = !isEmpty(filteredBrands) ? filteredBrands[0] : brands[0];
            return `/brand/${brand.apiCode}`
		},
        goSearch(){
			this.goToWithParams('SearchPage', {
				storeId: this.$store.getters.getCurrentStore.id,
			});
		},
        filterBrands(from, to){
            let cat = [];
            let list = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
            let startIndex = from ? list.indexOf(from) : 0;
            let endIndex = to ? list.indexOf(to) : 0;
            let brands = this.$store.getters.getCuratedBrands;
            if(!isEmpty(brands)){
                brands.sort((a, b) => { return a.id - b.id });
                brands.forEach((it) => {
                    let str = it.name;
                    if(!str) return;
                    if (from == 0 && to == 0) {
                        cat.push(it);
                    } else {
                        let idx = list.indexOf(str.substring(0, 1));
                        if (idx == -1) return;
                        if (idx >= startIndex && idx <= endIndex) {
                            cat.push(it);
                        }
                    }
                });
            }
            if(!isEmpty(cat)) cat.sort((a,b) => { return a.name.localeCompare(b.name) });
            if(isEmpty(cat)) return;
            return cat;
            /*return {
                from: from,
                to: to,
                brands: cat
            }*/
        },
        async retrieveBanners() {
            let now = moment();
            this.inited = false;
            this.banners = [];
            let json = {};
            let callAPI = true;
            let homeState = this.$store.getters.getStateHomePage || {};
            if (!this.serverInited || !homeState.lastUpdated) {
                json = initData["promotionData"] ? initData["promotionData"] : {};
                if (!isEmpty(json) && json.success) callAPI = false;
            }
            if(homeState.lastUpdated){
                let expDate = moment(homeState.lastUpdated);
				callAPI = !expDate.isAfter(now);
				if(!callAPI) {
                    json = { success: true, promotions: homeState.promotions }
                }
			}
            if (!isEmpty(json) && json.success) callAPI = false;
            if (callAPI) {
                json = await storeService.retrievePromotions();
                let nextUpdate = homeState.lastUpdated ? moment(homeState.lastUpdated).add(1, 'minutes') : moment().add(3, 'minutes');
				let payload = {
					...JSON.parse(JSON.stringify(homeState)),
					promotions: json.promotions || [],
					lastUpdated: parseInt(nextUpdate.format('x'))
				}
				this.$store.dispatch("setStateHomePage", payload);
            }
            if(json.promotions && json.promotions.length > 0){
                this.banners = json.promotions.filter(function (item) {
                    return item.displayAsBanner;
                }).sort(function (a, b) {
                    return a.id - b.id;
                }).map((item, ix) => {
                    item.index = ix;
                    item.image = this.$store.getters.cloudinaryURL + item.imageId;
                    return item;
                }).sort(function (a, b) {
                    return a.sortIndex - b.sortIndex;
                });
            }
            this.inited = true;
        },
        resizeBannerHandler(){
            this.isDesktop = window.innerWidth >= 672;
            let length = document.getElementsByClassName('empty-banners').length;
            for(var i=0; i<length; i++){
                let w = document.getElementsByClassName('empty-banners')[i].clientWidth;
                let h = (9/16) * w;
                document.getElementsByClassName('empty-banners')[i].style['height'] = !isEmpty(this.banners) ? `unset !important` : `${h}px`;
            }
        },
        async startPage() {
            await this.retrieveBanners();
            this.outletFound = true;
            let storeState = this.$store.getters.getStateStorePage || {};
            const hq = this.$store.getters.getHeadquarter;
            let curatedBrands = this.$store.getters.getCuratedBrands;
            let brands = hq?.headquarter?.brand || [];
            let featuredBrands = brands?.filter((it) => it.custom?.shopFeaturedBrand == true);
            if (!featuredBrands.length) featuredBrands = curatedBrands;
            if (!this.$store.getters.hasInited) {
				await this.refreshMainData(this.serverInited == true);
                this.products = this.$store.getters.getProducts;
                this.categories = this.$store.getters.getCategories;
                this.tags = this.$store.getters.getTags;
                this.featuredProducts = this.products.filter((it) =>
                    it.tags.some((tag) => tag.name.toLowerCase() == "featured")
                );
                this.setBrandsProductsList(this.products || []);
			} else {
                if(!storeState.lastUpdated){
                    const outletsMenu = initData?.outletsMenu || {};
                    let productsList = [];
                    let categoryList = [];
                    let tagsList = [];
                    for(let code in outletsMenu){
                        let stores = outletsMenu[code].stores;
                        for(let i = 0; i < stores.length; i++){
                            let prods = stores[i].menu.products;
                            categoryList = [...categoryList, ...stores[i].menu.categories];
                            tagsList = [...tagsList, ...stores[i].menu.tags];
                            prods.map((p) => {
                                p.brands = brands.length ? brands.filter((brand) => brand.apiCode == p.brand) : [];
                                return p;
                            });
                            productsList = [...productsList, ...prods];
                        }
                    }
                    this.products = productsList.filter((it) => { return it.available });
                    this.categories = categoryList;
                    this.tags = tagsList;
                    this.featuredProducts = this.products.filter((it) =>
                        it.tags.some((tag) => tag.name.toLowerCase() == "featured")
                    );
                    this.setBrandsProductsList(this.products);
                } else {
                    let now = moment();
                    let expDate = moment(storeState.lastUpdated);
                    if(!expDate.isAfter(now)){
                        const json = await productService.retrieveProductsList({
                            pageNumber: 0,
                            pageSize: 10,
                            sortBy: "newest",
                            tags: ['featured'],
                            customFields: ['hotSpotLocation'],
                            customBrands: brands.map((b) => b.apiCode),
                            splitByParams: true,
                        });
                        let productsList = [];
                        let featuredProducts = [];
                        let categories = [];
                        let tags = [];
                        let products = [];
                        let fp = json?.products.find((it) => it.key == "tags");
                        let cp = json?.products.find((it) => it.key == "customFields");
                        let bp = json?.products.find((it) => it.key == "customBrands");
                        if(fp){
                            featuredProducts = fp.products?.map((prd) => {
                                prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                                return prd;
                            });
                        }
                        categories = json?.categories || [];
                        tags = json?.tags || [];
                        if(cp){
                            products = cp?.products?.map((prd) => {
                                prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                                return prd;
                            });
                        }
                        if(bp) {
                            productsList = bp?.products?.map((prd) => {
                                prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                                return prd;
                            });
                        }
                        let brandsProductsList = featuredBrands.map((brand) => ({
                            ...brand,
                            products: productsList?.filter((p) => p.brands.map((b) => b.id).includes(brand.id))
                        }));
                        let nextUpdate = moment().add(3, 'minutes');
                        let payload = {
                            ...JSON.parse(JSON.stringify(storeState)),
                            featuredProducts: featuredProducts,
                            productsList: products,
                            categories: categories,
                            tags: tags,
                            brandsProductsList: brandsProductsList,
                            lastUpdated: parseInt(nextUpdate.format('x'))
                        }
                        storeState = payload;
                        this.$store.dispatch("setStateStorePage", payload);
                    }
                }
                const {featuredProducts, productsList, categories, tags, brandsProductsList} = storeState;
                this.products = productsList;
                this.categories = categories;
                this.tags = tags;
                this.featuredProducts = featuredProducts;
                this.brandsProductsList = brandsProductsList;
            }
            this.currentStore = this.$store.getters.getCurrentStore;
            this.stores = this.$store.getters.getStoreList || [];
            this.parentCategories = this.categories.filter((item) => { return !isEmpty(item.children) });
        },
        setBrandsProductsList(products){
            const hq = this.$store.getters.getHeadquarter;
            let curatedBrands = this.$store.getters.getCuratedBrands;
            let brands = hq?.headquarter?.brand || [];
            let featuredBrands = brands?.filter((it) => it.custom?.shopFeaturedBrand == true);
            if (!featuredBrands.length) featuredBrands = curatedBrands;
            if(products.length){
                products = products.map((prd) => {
                    prd.brands = brands?.length ? brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                    return prd;
                });
            }
            let items = featuredBrands.map((brand) => ({
                ...brand,
                products: products?.filter((p) => p.brands.map((b) => b.id).includes(brand.id))
            }));
            this.brandsProductsList = items.filter((b) => b.products.length > 0);

            let storeState = this.$store.getters.getStateStorePage || {};
            let now = moment();
            let nextUpdate = moment(now).add(3, 'minutes');
            let payload = {
                ...JSON.parse(JSON.stringify(storeState)),
                featuredProducts: this.featuredProducts,
                productsList: this.products,
                categories: this.categories,
                tags: this.tags,
                brandsProductsList: this.brandsProductsList,
                lastUpdated: parseInt(nextUpdate.format('x'))
            }
            this.$store.dispatch("setStateStorePage", payload);
        },
        dispatchState() {
            let etalase = this.$refs.shopEtalase;
            let productSize = etalase?.$refs.productGrid.productSize || 0;
            let storeState = this.$store.getters.getStateStorePage || {};

            let payload = {
                currentBrand: this.currentBrand,
                currentCategory: this.currentCategory,
                productSize: productSize,
                scrollTop: this.scrollTop,
                brandScrollLeft: this.brandScrollLeft,
                categoryScrollLeft: this.categoryScrollLeft,
                ...storeState
            }
            this.$store.dispatch("setStateStorePage", payload);
        },
        onCategoryClicked(data) {
            if (data && data.category && this.currentCategory && data.category.id != this.currentCategory.id) this.categoryScrollLeft = 0;
            this.currentBrand = data?.brand;
            this.currentCategory = data?.category;
            this.dispatchState();
        },
    },
    async created() {
        try {
            this.serverInited = this.$store.getters.isServerInited;
            this.loading = true;
            let self = this;
            this.startPage().then(() => {
                self.showContent = true;
                self.loading = false;
                window.addEventListener("resize", this.resizeBannerHandler);

                let storeState = this.$store.getters.getStateStorePage;
                self.scrollTop = storeState.scrollTop || 0;
                self.brandScrollLeft = storeState.brandScrollLeft || 0;
                self.categoryScrollLeft = storeState.categoryScrollLeft || 0;
                setTimeout(() => self.resizeBannerHandler, 100);

                const initSize = async () => {
                    let etalase = self.$refs.shopEtalase;
                    if (etalase && storeState.productSize > 0) {
                        etalase.$refs.productGrid.productSize = storeState.productSize;
                        etalase.$refs.productGrid.setCurrentProducts();
                    }
                }

                setTimeout( async() => {
                    await initSize();
                    if (document.querySelector('.sd-base-con')) {
                        document.querySelector('.sd-base-con').scrollTop = self.scrollTop;
                        document.querySelector('.sd-base-con')?.addEventListener("scroll", (e) => {
                            self.scrollTop = e.target.scrollTop;
                            self.dispatchState();
                        });
                    }
                    if (document.querySelector('.etalase-tabs')) {
                        document.querySelector('.etalase-tabs').scrollLeft = self.brandScrollLeft;
                        document.querySelector('.etalase-tabs')?.addEventListener("scroll", (e) => {
                            self.brandScrollLeft = e.target.scrollLeft;
                            self.dispatchState();
                        });
                    }
                    if (document.querySelector('.etalase-tabs-children')) {
                        document.querySelector('.etalase-tabs-children').scrollLeft = self.categoryScrollLeft;
                        document.querySelector('.etalase-tabs-children')?.addEventListener("scroll", (e) => {
                            self.categoryScrollLeft = e.target.scrollLeft;
                            self.dispatchState();
                        });
                    }
                }, 500);
            });
		} catch (error) {
			this.loading = false;
            window.addEventListener("resize",  this.resizeBannerHandler);
            setTimeout(() => {
                this.resizeBannerHandler();
            }, 100);
			this.showNotification("alert", "error_outline", error);
		}
    },
    beforeUnmount(){
        window.removeEventListener("resize",  this.resizeBannerHandler);
    }
};
</script>

<style scoped lang="scss">
    .shop-spots-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 40px;
    }
    .video-featured-products-wrapper {
        width: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        overflow: hidden;
        .featured-products-wrapper {
            min-width: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .featured-title {
            width: 100%;
            text-align: left;
            color: $main-red;
            margin-left: 20px;
            font-size: 24px;
            font-weight: 600;
            line-height: 38px;
        }
    }
    .header-con {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;

        .header-wrapper {
            display: flex;
            align-items: center;
            gap: 24px;

            &.centered {
                flex: 3;
                &.guest {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
    .top-body {
        padding-bottom: 24px;

        &.empty {
            position: fixed;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        * + .wrapper {
            margin-top: 32px;
        }

        .wrapper {
            width: 100%;
            height: 100%;
            position: relative;

            &.wrapper-2 {
                height: unset;
                display: block;
                position: unset;
                .title {
                    width: 100%;
                    justify-content: center;
                }
            }
        }
        .gap {
            height: 150px;
        }

        .title {
            margin-top: 40px;
            font-family: 'Berthold Akzidenz Grotesk Medium';
            color: $main-red;
            padding-inline: 20px;
            display: block;
            line-height: 38px;
            text-align: center;
            font-size: 24px;

            &.flex {
                display: flex !important;
                justify-content: space-between;
            }

            &.dark {
                color: #000;
            }

            .anchor {
                cursor: pointer;
                font-family: 'Berthold Akzidenz Grotesk';
                color: $primary-color-60;
                font-size: 0.8em;
                font-weight: bold;
                text-decoration: none;
            }
        }

        .subtitle {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            font-size: 1em;
            color: $secondary-color-60;
            padding-inline: 24px;
            padding-bottom: 24px;
            display: block;
            line-height: 1.5;
            text-align: left;
        }
    }
    .empty-carousel {
        width: 100%;
        background: $secondary-color-10;
    }
    .shop-categories {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    @media (min-width: 672px) and (max-width: 820px){
        .video-featured-products-wrapper {
            display: grid;
            grid-template-columns: 1fr !important;
            gap: 20px;
        }
    }
    @media (min-width: 672px) and (max-width: 1024px){
        .video-featured-products-wrapper {
            display: grid;
            grid-template-columns: 400px auto !important;
        }
        .shop-spots-wrapper {
            display: grid;
            grid-template-columns: 400px auto !important;
        }
    }
    @media (min-width: 672px) {
        .shop-spots-wrapper {
            display: grid;
            grid-template-columns: 560px auto;
            padding-inline: 20px;
        }
        .video-featured-products-wrapper {
            display: grid;
            grid-template-columns: 560px auto;
            gap: 20px;
            padding-top: 20px;
            .featured-products-wrapper {
                justify-content: center;
            }
        }
		.shop-categories {
			flex-direction: row;
            gap: 24px;
		}
        .top-body {
            .title {
                display: flex !important;
                gap: 32px;
                align-items: center;
                justify-content: flex-start;
                text-align: left;

                &.flex {
                    justify-content: flex-start !important;
                }
                &.centered {
                    justify-content: center !important;
                }

                & + .subtitle {
                    padding-top: 0 !important;
                }
            }
            .subtitle {
                padding-left: 0 !important;
                text-align: left;
            }
        }
	}
</style>