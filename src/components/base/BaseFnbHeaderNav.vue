<template>
	<div class="header-nav">
        <base-fnb-top-nav-mobile :products="products"/>
        <router-link to="/" class="desktop-logo">
            <img
                width="90"
                height="50"
                alt="rxc logo"
                :src="require('@/assets/images/rox-logo-2025.jpeg')"
            />
        </router-link>
        <base-fnb-top-nav :products="products"/>
        <router-link to="/" class="router-nav mobile-logo">
            <img class="mobile-logo"
                width="90"
                height="50"
                alt="rxc logo"
                :src="require('@/assets/images/rox-logo-2025.jpeg')"
            />
        </router-link>
        <div class="header-nav-part right">
            <div class="header-nav-item nav-cart-with-trigger" v-if="!menuOnly">
                <div class="nav-cart-trigger">
                    <div class="nav-cart-trigger">
                        <img class="nav-icon" :src="shoppingCartIcon" width="30" height="30" alt="cart"/>
                    </div>
                    <span class="cart-count nav-cart-trigger" v-if="countCart">{{ countCart }}</span>
                </div>
                <div :class="['cart-dropdown', {'active': showCart, 'empty': countCart == 0}]">
                    <div class="cart-dropdown-container">
                        <div class="cart-dropdown-header">
                            <span class="cart-h1">Cart ({{ countCart }} items)</span>
                            <span class="cart-link close-cart material-icons-outlined">close</span>
                        </div>
                        <div class="cart-dropdown-body" v-if="showCart">
                            <CartItem 
                                v-for="cart in carts" 
                                :key="cart.id"
                                :cart="cart"
                                :carts="carts"
                                displayOnly
                            />
                            <base-cart-empty v-if="carts.length == 0"/>
                            <div class="cart-links">
                                <div class="subtotal">
                                    Subtotal:
                                    <span class="subtotal-price">{{ currency(this.subTotal) }}</span>
                                </div>
                                <div class="subtotal-notes">
                                    Taxes, discounts and shipping calculated at checkout.
                                </div>
                                <span class="cart-link outlined" @click="openCart">Manage Cart</span>
                                <span class="cart-link" @click="openCheckout">Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <router-link to="/profile" class="header-nav-item nav-account-with-trigger" v-if="isLoggedIn()">
                <div class="nav-account-trigger">
                    <img class="nav-icon" :src="userIcon" width="30" height="30" alt="User"/>
                </div>
            </router-link>
            <router-link to="/login" class="header-nav-item nav-account-with-trigger btn-trigger" v-else-if="!isLoggedIn() && !noAuth">
                <span class="nav-account-trigger">Sign Up / Login</span>
            </router-link>
        </div>
    </div>
    <div class="side-bar" :class="{'active': showSideBar}" v-if="!noMenu">
        <base-menu v-if="openSideBar" @hide-menu="toggleSideBar()"/>
    </div>
</template>

<script>
import userIcon from "@/assets/icons/user-icon.png";
import shoppingCartIcon from "@/assets/icons/shopping-cart.png";
import utility from "@/presentation/mixins/utility.js";
import CartItem from "@/presentation/pages/page-cart/components/CartItem.vue";
import { isEmpty } from "lodash";
import { productService } from "@/bloc/services";
export default {
    props: {
        preText: {
            type: String,
            default: ""
        },
        menuOnly: {
            type: Boolean,
            default: false
        },
        noMenu: {
            type: Boolean,
            default: false
        },
        noSearch: {
            type: Boolean,
            default: false
        },
        scannerOn: {
            type: Boolean,
            default: false
        },
        noAuth: {
            type: Boolean,
            default: false
        },
        triggerOpenCart: {
			type: Boolean,
			default: false,
		}
    },
    emits: [
        'on-search',
        'scanner-clicked',
        'open-text'
    ],
    components: {
        CartItem,
    },
    data() {
        return {
            userIcon: userIcon,
            shoppingCartIcon: shoppingCartIcon,
            showInput: false,
            searchText: "",
            showSideBar: false,
            openSideBar: false,
            searchItems: [],
            showCart: false,
            showAccount: false,
            carts: [],
            products: []
        };
    },
    mixins: [utility],
    computed: {
        countCart() {
            let parentCarts = this.$store.getters.getCarts;
            let outlets = this.$store.getters.getOutlets;
            if (isEmpty(outlets)) return 0;
            let storeIds = [];
            for (let i = 0; i < outlets.length; i++){
                storeIds = [...storeIds, ...outlets[i].stores.map((s) => s.id)];
            }
            let countNum = 0;
            for(let k in parentCarts){
                let carts = parentCarts[k] || [];
                countNum += carts.filter((c) => {
                    return storeIds.includes(c.storeId) && this.products?.map((p) => p.id).includes(c.product.id)
                }).length;
            }
            return countNum;
        },
        cartLink() {
            // let cartId = this.$store.getters.getCartId || 0;
            let outletCode = this.getOutletCode();
            return `/cart/${outletCode}`
        },
        shopLink() {
            let outletCode = this.getOutletCode();
            return `/shop/${outletCode}`;
        },
        subTotal(){
            let subtotal = this.carts.reduce((sum, item) => sum + item.accPrice, 0);
            return subtotal;
        }
    },
    methods: {
        openCheckout() {
            this.$router.push(`/checkout`);
        },
        goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
        },
        openCart() {
            // this.$router.push(this.cartLink);
            document.body.removeEventListener('click', this.eventHandler);
            this.$router.push(`/cart`);
        },
        outletByCart(cart) {
            if (!isEmpty(cart.outletStore)) return cart.outletStore;
            let outletList = this.$store.getters.getOutlets;
            let hq = this.$store.getters.getHeadquarter;
            let outletCart = outletList.find((o) =>
                o.stores.filter((s) => s.id == cart.storeId).length > 0
            );
            let store = outletCart?.stores?.find((s) => s.id == cart.storeId);
            let brand = hq.headquarter.brand.find(
                (it) => it.apiCode == store?.brandCode
            );
            outletCart = {
                ...outletCart,
                brand: brand,
                isOmisell:
                    outletCart?.enableOmisellIntegration == true &&
                    outletCart?.stores.filter((s) => {
                        return s.delivery;
                    }).length > 0,
            };
            return outletCart;
        },
        toggleCart() {
            this.showCart = !this.showCart;
        },
        showScanner() {
            this.$emit('scanner-clicked');
        },
        toggleSideBar() {
            this.showSideBar = !this.showSideBar;
        },
        hideSearch() {
            this.showInput = false;
            this.searchText = "";
            this.$emit('open-text', true);
        },
        toggleSearch() {
            this.showInput = !this.showInput;
            if (!this.showInput) {
                return this.hideSearch();
            }
            this.$emit('open-text', false);
        },
        clickSearch() {
            if (!this.searchText) return;
            let items = this.searchItems || [];
            let found = items.filter((it) => { return it == this.searchText }).length > 0;
            if (!found) {
                let newItems = [this.searchText, ...items];
                localStorage.setItem("search-items", JSON.stringify(newItems));
            }
            let currentStore = this.getCurrentStore();
            let currrentOutlet = this.$store.getters.getCurrentOutlet;
            this.goToWithParams('SearchPage', {
                storeId: currentStore.id,
                outlet: currrentOutlet?.apiCode,
                key: this.searchText
            });
        },
        searchPrevious(txt) {
            this.toggleSearch();
            this.$emit('on-search', txt);
            this.goToWithParams('SearchPage', {
                storeId: Math.random(12),
                key: txt
            });
        },
        eventHandler(e){
            let self = this;
            if(e.target.closest('.nav-cart-with-trigger')) {
                let preStat = self.showCart == true;
                self.toggleCart();
                if(!preStat) {
                    self.prepareOpenCart();
                }
                self.showAccount = false;
                return;
            }
            if(e.target.closest('.cart-dropdown')) {
                return;
            }
            self.showCart = false;
            self.showAccount = false;
        },
        async prepareOpenCart(){
            let parentCarts = this.$store.getters.getCarts;
            let carts = [];
            let productsInCarts = [];
            for(let k in parentCarts){
                carts = [...carts, ...parentCarts[k]];
                let prds = parentCarts[k] ? parentCarts[k].map((it) => it.product) : []
                productsInCarts = [...productsInCarts, ...prds];
            }
            const json = isEmpty(carts) ? {} : await productService.retrieveProductsList({
                pageNumber: 0,
                pageSize: Math.max(...[productsInCarts.length, 1000]),
                brands: productsInCarts?.map((p) => p.brand)
            });
            this.carts = carts;
            this.products = this.mapProducts(json);
            this.$store.dispatch('setProducts', this.products);
            this.showCart = true;
        },
        mapProducts(json){
            if(!json?.products?.length) return [];
            return json?.products.map((prd) => {
                prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
                return prd;
            })
        },
        initCarts(){
            let parentCarts = this.$store.getters.getCarts;
            let carts = [];
            let productsInCarts = [];
            for(let k in parentCarts){
                carts = [...carts, ...parentCarts[k]];
                let prds = parentCarts[k] ? parentCarts[k].map((it) => it.product) : []
                productsInCarts = [...productsInCarts, ...prds];
            }
            let outlets = this.$store.getters.getOutlets;
            let storeIds = [];
            for (let i = 0; i < outlets.length; i++){
                storeIds = [...storeIds, ...outlets[i].stores.map((s) => s.id)];
            }
            if (isEmpty(outlets)) {
                this.carts = [];
                this.$store.dispatch('setCarts', []);
                return;
            }
            if (!isEmpty(carts)) {
                let xcarts = carts.filter((c) => {
                    return storeIds.includes(c.storeId) && productsInCarts.map((p) => p.id).includes(c.product.id)
                });
                carts = xcarts?.map((cart) => {
                    cart.product.imageDisplay = this.getCartImage(cart);
                    cart.outletStore = this.outletByCart(cart);
                    return cart;
                });
            }
            this.carts = carts;
            this.products = productsInCarts;
            this.$store.dispatch('setProducts', this.products);
        }
    },
    watch: {
        showSideBar(val) {
            if (val) this.openSideBar = true;
            else {
                setTimeout(() => {
                    this.openSideBar = false;
                }, 300);
            }
        },
        showCart(val) {
            if (!val) return;
            this.initCarts();
        },
        triggerOpenCart(val){
            if(!val) return;
            this.prepareOpenCart()
        }
    },
    async created() {
        let items = localStorage.getItem("search-items");
        if (items) this.searchItems = JSON.parse(items);
        document.body.addEventListener('click', this.eventHandler);
        this.initCarts();
    },
    beforeUnmount(){
        document.body.removeEventListener('click', this.eventHandler);
    }
};
</script>
<style scoped lang="scss">
    .nav-icon {
        min-width: 30px;
        min-height: 30px;
        max-width: 30px;
        max-height: 30px;
        object-fit: contain;
        opacity: 0.7;
    }
    .btn-trigger {
        background: $main-red;
        border-radius: 24px;
        padding: 6px 16px;
        color: $white;
        cursor: pointer;
        white-space: nowrap;
        .nav-account-trigger {
            color: $white;
            font-size: 13px;
            font-family: 'Berthold Akzidenz Grotesk Medium';
        }
    }
    .router-nav {
        text-decoration: none;
        color: $secondary-color-90;
        &.mobile-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            position: absolute;
            margin-inline: auto;
            left: 0;
            right: 0;
        }
    }
    .cart-dropdown {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100%;
        background: $white;
        transform: translateX(100%);
        transition: transform 0.5s ease;
        -webkit-transition: transform 0.5s ease;
        z-index: 999;
        overflow: hidden;
        &.active {
            transform: translateX(0);
            -webkit-transform: translateX(0);
            max-width: 100% !important;
            display: block;
            overflow: visible !important;
            min-width: 300px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
            -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
            &.empty {
                min-width: 250px;
                padding: 0px;
            }
        }
        .cart-dropdown-container {
            display: flex;
            flex-direction: column;
            border-radius: 6px;
            background: $white;
            overflow: hidden;
            gap: 16px;
            height: 100%;
        }
        .cart-dropdown-header{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-block: 12px;
            padding-inline: 24px;
            border-bottom: 1px solid $secondary-color-20;
            height: 75px;
            overflow: hidden;
            .cart-h1 {
                font-family: 'Berthold Akzidenz Grotesk Medium';
                font-size: 15px;
                color: $dark-color-1;
                line-height: 22px;
            }
            .cart-link {
                text-decoration: none;
                font-size: 24px;
                line-height: 38px;
                cursor: pointer;
                color: $dark-color-4 !important;
            }
        }
        .cart-dropdown-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            height: calc(100% - 75px);
            overflow-y: auto;
            &::-webkit-scrollbar {
                height: 0 !important;
                width: 0 !important;
            }
            &.loading {
                align-items: center;
                justify-content: center;
                aspect-ratio: 5/2;
                padding: 24px;
                position: relative;
                &::before {
                    content: "";
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid $secondary-color-30;
                    border-right-color: transparent;
                    transition: all 0.3s ease-in-out;
                    -webkit-transition: all 0.3s ease-in-out;
                    margin: auto;
                    animation: spin 1s linear infinite;
                    -webkit-animation: spin 1s linear infinite;
                }
                &::after {
                    content: "Loading...";
                    font-size: 0.8em;
                }
            }
        }
        .cart-links {
            margin-top: auto;
            width: 100%;
            padding-top: 20px;
            .cart-link {
                color: $white;
                outline: none;
                padding: 13px;
                background: $dark-color-4;
                font-size: 15px;
                line-height: 22px;
                align-items: center;
                white-space: nowrap;
                gap: 4px;
                cursor: pointer;
                display: block;
                text-align: center;
                width: 100%;
                margin-bottom: 10px;
                font-family: 'Berthold Akzidenz Grotesk Medium';
                border-radius: 999px;
                border: 1px solid transparent;
                &.outlined {
                    background: $white;
                    border-color: $dark-color-4;
                    color: $dark-color-4;
                }
                &:hover {
                    opacity: 0.7;
                }
            }
            .subtotal {
                color: $main-red;
                font-family: 'Berthold Akzidenz Grotesk Medium';
                font-size: 22px;
                text-align: left;
                margin-bottom: 13px;
            }

            .subtotal-notes {
                text-align: left;
                line-height: 18px;
                margin-bottom: 26px;
            }
            span.subtotal-price {
                float: right;
            }
        }
    }
    .side-bar {
        width: 100%;
        transform: translateX(100%);
        position: fixed;
        z-index: 100000;
        top: 0;
        left: 0;
        bottom: 0;
        background: $white;
        color: $secondary-color-90;
        -webkit-transition: all 0.2s ease-in-out 0.2s;
        -moz-transition: all 0.2s ease-in-out 0.2s;
        -o-transition: all 0.2s ease-in-out 0.2s;
        transition: all 0.2s ease-in-out 0.2s;

        &.active {
            transform: translateX(0);
        }
    }
    .desktop-logo {
        display: none;
    }
    .mobile-logo {
        object-fit: contain;
    }
    .header-nav {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        position: relative;
        .header-nav-part {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 16px;
            &.right {
                justify-content: flex-end;
            }
        }
    }
    .header-nav-item {
        display: flex;
        align-items: center;
        position: relative;
        text-decoration: none;
        color: $dark-color-1;
        &.absolute {
            position: absolute;
            left: 32px;
        }
        &.nav-cart-with-trigger {
            justify-content: flex-end;
            cursor: auto;
        }
        .nav-cart-trigger {
            display: flex;
            align-items: center;
            position: relative;
            justify-content: flex-end;
            cursor: pointer;
        }
        .cart-count {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            position: absolute;
            top: -5px;
            right: -5px;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: $main-red;
            color: $white;
            font-size: 0.6em;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        }
    }
    .search {
        &__overlay {
            transition: opacity 0.3s ease;
            position: fixed;
            top: 110px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            z-index: 100;
            cursor: auto;

            &__content {
                transition: all 0.3s ease;
                background: $secondary-color-90;
                width: 100%;
                height: 100%;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 36px;
                color: $white;
                overflow: hidden;
                overflow-y: auto;

                &__input {
                    width: 100%;
                    padding: 12px 24px;
                    border: none;
                    margin: 0 auto;
                    border-radius: 12px;
                    background: $white;
                    display: flex;
                    align-items: center;
                    gap: 16px;

                    input.search-input {
                        width: 100%;
                        border: none;
                        outline: 0;
                        background: $white;
                    }
                    .overlay-icon {
                        color: $secondary-color-80;
                        cursor: pointer;
                    }
                }
                &__previous {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;

                    &__title {
                        font-size: 1.5em;
                    }
                    &__items {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                        flex-wrap: wrap;

                        .item {
                            padding: 6px 20px;
                            background: $white;
                            color: $secondary-color-90;
                            cursor: pointer;
                            border-radius: 18px;
                        }
                    }
                }
            }
        }

    }
    @media (min-width: 672px) {
        .cart-dropdown{
            &.active {
                padding-right: 0 !important;
                right: 0px !important;
                min-width: 380px !important;
            }
        }
        .side-bar {
            &.active{
                background: linear-gradient(45deg, #00000085, transparent);
            }
        }
        .desktop-logo {
            display: block;
            min-width: 70px;
            object-fit: contain;
            margin-right: 12px;
            text-decoration: none;
        }
        .mobile-logo {
            display: none !important;
        }
        .burger-menu {
            display: none !important;
        }
        .search {
            &__overlay {
                &__content {
                    padding: 16px 7% !important;

                    &__input {
                        width: 80%;
                    }
                }
            }

        }
        .header-nav-item {
            color: $secondary-color-90 !important;
            &.absolute {
                position: static !important;
            }
        }
        .router-nav.mobile-logo {
            max-width: 0 !important;
            overflow: hidden;
            display: none;
            pointer-events: none;
            position: absolute;
        }
    }
    @media (min-width:672px) and (max-width: 1024px){
        .desktop-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            position: absolute;
            margin-inline: auto;
            left: 0;
            right: 0;
        }
        .header-nav-item {
            &.absolute {
                position: absolute !important;
                left: 32px;
            }
        }
    }
</style>