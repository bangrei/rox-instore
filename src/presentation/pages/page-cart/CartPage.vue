<template>
    <layout-variant-two :show-loading-screen="false" :free-footer="true" :active-menu-index="0">
        <template v-slot:body>
            <div :class="['cart-layout-page', {'full': carts.length == 0 && !loading}]">
                <div class="cart-tabs">
                    <div class="cart-tabs-wrapper">
                        <div @click="setActiveTab(0)" :class="['cart-tab-button', {'active': activeTabIndex == 0}]">Cart ({{ carts?.length }})</div>
                        <div @click="setActiveTab(1)" :class="['cart-tab-button', {'active': activeTabIndex == 1}]">Wishlist ({{ wishListCount }})</div>
                    </div>
                    <!-- <h1 v-if="activeTabIndex == 0">Cart ({{ carts.length }} item{{ carts.length > 1 ? 's' : '' }})</h1> -->
                    <TabCart ref="tabCart"
                        v-if="activeTabIndex == 0" 
                        @cart-loaded="onCartLoaded" 
                        @update-cart="onUpdateCart"
                        @edit-cart="editCart"
                    />
                    <div :class="['tab-cart-shimmer-container', {'with-margin': activeTabIndex == -1}]">
                        <div class="tab-cart-shimmer-item" v-for="index in tabCartShimmerArray" :key="index">
                            <div class="tab-cart-shimmer-image"></div>
                            <div class="tab-cart-shimmer-content">
                            <div class="tab-cart-shimmer-subtitle"></div>
                            <div class="tab-cart-shimmer-title"></div>
                            <div class="tab-cart-shimmer-text"></div>
                            <div class="tab-cart-shimmer-button"></div>
                            </div>
                        </div>
                    </div>
                    <TabWishList 
                        v-if="activeTabIndex == 1" 
                        @loaded="onWishlistLoaded" 
                        @update-cart="onUpdateCart"
                        @edit-cart="editCart"
                    />
                </div>
                <div class="cart-shimmer" v-if="loading && activeTabIndex != 1">
                    <div class="cart-shimmer-block">
                        <div class="cart-shimmer-row">
                            <div class="cart-shimmer-button"></div>
                        </div>
                        <div class="cart-shimmer-row">
                            <div class="cart-shimmer-line">
                                <div class="cart-shimmer-text"></div>
                                <div class="cart-shimmer-text"></div>
                            </div>
                            <div class="cart-shimmer-line">
                                <div class="cart-shimmer-text"></div>
                                <div class="cart-shimmer-text"></div>
                            </div>
                        </div>
                        <div class="cart-shimmer-row">
                            <div class="cart-shimmer-title"></div>
                            <div class="cart-shimmer-line">
                                <div class="cart-shimmer-text"></div>
                                <div class="cart-shimmer-text"></div>
                            </div>
                            <div class="cart-shimmer-line">
                                <div class="cart-shimmer-text"></div>
                                <div class="cart-shimmer-text"></div>
                            </div>
                            <div class="cart-shimmer-line">
                                <div class="cart-shimmer-title"></div>
                                <div class="cart-shimmer-title"></div>
                            </div>
                        </div>
                    </div>
                    <div class="cart-shimmer-block">
                        <div class="cart-shimmer-row">
                            <div class="cart-shimmer-button"></div>
                        </div>
                        <div class="cart-shimmer-row">
                            <div class="cart-shimmer-title"></div>
                            <div class="cart-shimmer-text"></div>
                        </div>
                    </div>
                </div>
                <TabCartDetails v-if="!loading && carts?.length > 0 && activeTabIndex == 0"
                    :totalAmount="total" 
                    :subTotalAmount="subTotal" 
                    :totalUnselected="totalUnselected"
                    :cartsCount="cartsCount"
                    @add-more-products="onAddMoreProducts"
                    @update-cart="onUpdateCart"
                />
            </div>
        </template>
        <template v-slot:footer>
			<base-side-nav v-if="!loading" :active-index="0"/>
		</template>
    </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import TabCart from "./components/TabCart.vue";
import TabWishList from "./components/TabWishList.vue";
import TabCartDetails from "./components/TabCartDetails.vue";

export default {
	name: "CartPage",
	components: {
        LayoutVariantTwo,
        TabCart,
        TabWishList,
        TabCartDetails,
	},
	mixins: [utility],
	data() {
		return {
			loading: true,
            carts: [],
            wishList: [],
            activeTabIndex: -1,
            unselectedAmount: 0,
            cState: 0,
		};
	},
    computed: {
        hasInited() {
            return this.$store.getters.hasInited;
        },
        tabCartShimmerArray(){
            if(!this.loading) return [];
            if(this.activeTabIndex == 1) return [];
            return Array.from({length: 3}).map((_, index) => ({index}));
        },
        wishListCount() {
            return this.wishList.length || this.$store.getters.getFavorites?.length;
        },
        total() {
            let orderRequest = this.$store.getters.getOrderRequest;
            if (isEmpty(orderRequest)) return 0;
            let total = 0;
            for(let k in orderRequest) total += orderRequest[k].total;
            return total;
        },
        subTotal() {
            let orderRequest = this.$store.getters.getOrderRequest;
            let subTotal = 0;
            if (isEmpty(orderRequest)) return 0;
            for(let k in orderRequest) subTotal += orderRequest[k].subTotal;
            return subTotal;
        },
        selectedCarts() {
            return this.carts.filter((o) => o.checked == true);
        },
        ableToCheckout() {
            return this.cartsCount > 0;
        },
        cartsCount() {
            return this.selectedCarts.length
        },
        totalUnselected() {
            let totalUnselected = this.carts.reduce((acc, cart) => {
                let price = 0;
                if (!cart.checked) {
                price = cart.accPrice;
                }
                acc += price;
                return acc;
            }, 0);
            return totalUnselected;
        },
    },
    watch: {
        activeTabIndex() {
            this.loading = true;
        },
        hasInited: {
            immediate: true,
            async handler(val) {
                if (val) {
                    if(this.cState == 1) return;
                    this.cState = 1;
                    this.initPage();
                } else {
                    if(this.cState == 2) return;
                    this.cState = 2;
                    await this.refreshMainData();
                    this.$store.dispatch('setInited', true);
                }
            }
        },
    },
    methods: {
        initPage(){
            this.activeTabIndex = 0;
            let favorites = this.$store.getters.getFavorites;
            let products = this.$store.getters.getProducts;
            if (favorites.length > 0) {
                favorites = favorites.filter((it) => {
                    let one = products.find((p) => p.id == it.product);
                    return !isEmpty(one);
                });
            }
            this.wishList = favorites;
            this.loading = false;
        },
        setActiveTab(num){
            this.activeTabIndex = num;
        },
        editCart(cart) {
            let outlet = cart.outletStore;
            if (cart.freeProduct) {
                let otherCart = this.carts.find((c) => { return c.product.id == cart.product.id && c.id !== cart.id });
                if (!isEmpty(otherCart)) {
                    cart = otherCart;
                }
            }
            let product = cart.product;
            let store = outlet.stores.find((s) => {
                return s.id == cart.storeId;
            });
            if (!isEmpty(store)) {
                this.$store.dispatch("setCurrentStore", store);
            }
            this.$store.dispatch("setCartProductEdit", cart.id);
            let names = product.name
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .split(" ")
                ?.map((it) => {
                if (it.toUpperCase() == it) return it;
                return it.toLowerCase();
            });
            if(this.hasVariant(cart)) {
                let variantSlugs = cart.variant.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                    if (it.toUpperCase() == it) return it;
                    return it.toLowerCase();
                });
                names = [...names, ...variantSlugs];
            }
            this.goToWithParams('ProductDetails', {
                outlet: outlet.apiCode,
                productId: product.id,
                productName: names.join('-')
            });
        },
        onUpdateCart(xcarts, skip, callbackSuccess, callbackFailed) {
            let self = this;
            if(!callbackSuccess) callbackSuccess = () => {};
            if(!callbackFailed) callbackFailed = () => {};
            let originalCarts = JSON.parse(JSON.stringify(self.carts));
            let originalMappedCarts = self.rebuildCarts(originalCarts);
            let mappedCarts = self.rebuildCarts(xcarts);
            self.$store.dispatch("setCarts", mappedCarts);
            if (skip == true) {
                self.carts = xcarts;
                if(self.activeTabIndex == 0){
                    self.$refs.tabCart.handleCarts();
                    self.$refs.tabCart.setOutletsList();
                }
                callbackSuccess();
                return
            }
            self.proceedCarts(mappedCarts, (res) => {
                self.carts = xcarts;
                callbackSuccess(res);
            }, (error) => {
                if(isEmpty(xcarts)) {
                    self.carts = xcarts;
                    callbackSuccess();
                    return;
                }
                self.$store.dispatch("setCarts", originalMappedCarts);
                callbackFailed(error);
                self.showNotification(
                    "alert",
                    "error_outline",
                    `Something went wrong! ${error.message}`
                );
            });
        },
        async onCartLoaded(carts) {
            let self = this;
            // this.carts = carts;
            this.$store.dispatch('setInited', true);
            if(isEmpty(carts)) {
                self.carts = carts;
                this.loading = false;
                return;
            }
            let mappedCarts = this.rebuildCarts(carts);
            for(let k in mappedCarts){
                let promoCodes = this.$store.getters.getPromoCodes || {};
                let carts = mappedCarts[k];
                let freeItems = carts.filter((cart) => !isEmpty(cart.freeProduct));
                if(!isEmpty(freeItems)){
                    let freePromos = promoCodes[k] || [];
                    for(let n = 0; n < freeItems.length; n++){
                        let oneFree = freeItems[n].freeProduct;
                        if(freePromos.includes(oneFree)) continue;
                        freePromos.push(oneFree);
                    }
                    promoCodes[k] = freePromos;
                    this.$store.dispatch("setPromoCodes", promoCodes);
                }
            }
            self.proceedCarts(mappedCarts, () => {
                self.carts = carts;
                this.loading = false;
            }, (error) => {
                if(!isEmpty(error?.promoCodes)) {
                    let parentCarts = self.$store.getters.getCarts || {};
                    let promoCodesError = error?.promoCodes.map((c) => c.code);
                    let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
                    for(let k in parentCarts){
                        if(!removedPromocodes[k]) removedPromocodes[k] = [];
                        removedPromocodes[k] = [...removedPromocodes[k], ...promoCodesError];
                    }
                    self.$store.dispatch("setAutoPromocodes", removedPromocodes);
                    self.proceedCarts(mappedCarts, () => {
                        self.carts = carts;
                        this.loading = false;
                    });
                } else {
                    this.loading = false;
                    self.showNotification(
                        "alert",
                        "error_outline",
                        `Something went wrong! ${error.message}`
                    );
                }
            });
        },
        async proceedCarts(mappedCarts, callbackSuccess, callbackError){
            if (!callbackSuccess) callbackSuccess = () => {};
            if (!callbackError) callbackError = () => {};
            let keys = Object.keys(mappedCarts);
            let start = 0;
            const proceedOne = async () => {
                let key = keys[start];
                let childCarts = mappedCarts[key];
                this.testOrder(
                    false,
                    function (res) {
                        if(start < keys.length - 1){
                            start++;
                            return proceedOne()
                        }
                        callbackSuccess(res);
                    },
                    function (error) {
                        callbackError(error);
                    },
                    false,
                    true,
                    childCarts,
                    key
                );
            }
            proceedOne();
        },
        onWishlistLoaded(wishList) {
            this.wishList = wishList;
            this.loading = false;
        },
        onAddMoreProducts() {
            this.activeTabIndex = 1;
        }
    },
};
</script>
<style scoped lang="scss">
    .tab-cart-shimmer-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
        &:is(.with-margin){
            margin-top: 70px;
        }
        .tab-cart-shimmer-item {
            width: 100%;
            display: flex;
            gap: 20px;
            align-items: flex-start;
            justify-content: flex-start;
            width: 100%;
            text-align: left;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid $secondary-color-20;
            background: $white;
            .tab-cart-shimmer-image {
                width: 100%;
                max-width: 200px;
                min-width: 120px;
                aspect-ratio: 5/3;
                background: $secondary-color-20;
            }
            .tab-cart-shimmer-content {
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                gap: 10px;
                .tab-cart-shimmer-subtitle {
                    width: 35%;
                    height: 12px;
                    background: $secondary-color-20;
                }
                .tab-cart-shimmer-title {
                    width: 100%;
                    height: 20px;
                    background: $secondary-color-20;
                }
                .tab-cart-shimmer-text {
                    width: 20%;
                    height: 20px;
                    background: $secondary-color-20;
                }
                .tab-cart-shimmer-button {
                    width: 25%;
                    height: 35px;
                    border-radius: 999px;
                    background: $secondary-color-20;
                    margin-left: auto;
                }
            }
        }
    }
    .cart-shimmer {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 20px;
        .cart-shimmer-block {
            width: 100%;
            border-radius: 20px;
            border: 1px solid $secondary-color-20;
        }
        .cart-shimmer-row {
            width: 100%;
            display: flex;
            flex-direction: column;
            padding: 20px;
            gap: 20px;
            &:not(:first-child){
                border-top: 1px solid $secondary-color-20;
            }
            .cart-shimmer-title {
                width: 45%;
                height: 36px;
                background: $secondary-color-20;
            }
            .cart-shimmer-line {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
            }
            .cart-shimmer-text {
                width: 35%;
                height: 20px;
                background: $secondary-color-20;
            }
            .cart-shimmer-button {
                width: 100%;
                height: 45px;
                border-radius: 999px;
                background: $secondary-color-20;
            }
        }
    }
    .cart-layout-page {
        width: 100%;
        height: auto;
        padding-inline: 20px;
        &.full {
            .cart-tabs {
                height: 100% !important;
            }
        }
        h1 {
            font-size: 1.3em;
            text-align: left;
            margin: 0 !important;
            padding: 24px;
            background: $white;
            border-bottom: 1px solid $secondary-color-20;
        }
    }
    .cart-tabs {
        flex: 3;
        display: flex;
        flex-direction: column;
        .cart-tabs-wrapper {
            padding-inline: 24px;
            padding-top: 32px;
            background: $white;
            display: flex;
            align-items: flex-end;
            gap: 24px;
            position: relative;
            border-bottom: 1px solid $secondary-color-20;
            width: 100%;
            .cart-tab-button {
                padding-block: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                &:hover {
                    color: $main-red;
                }
                &.active {
                    color: $main-red;
                    border-bottom-color: $main-red !important;
                }
            }
        }
    }
    .back-btn {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    }
    @media (min-width: 672px) {
        .cart-layout-page {
            padding-inline: 4%;
            padding-block: 32px;
            display: flex;
            flex-direction: row !important;
            flex-wrap: wrap;
            gap: 24px;
            h1 {
                padding-inline: 0 !important;
                padding-bottom: 0 !important;
                background: transparent !important;
                border-bottom-color: transparent !important;
            }
        }
        .cart-tabs-wrapper {
            padding-inline: 0 !important;
            padding-top: 0 !important;
            background: transparent !important;
        }
    }
</style>
