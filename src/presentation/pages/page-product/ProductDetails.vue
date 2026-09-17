<template>
    <layout-variant-two :show-loading-screen="loading" active-menu-index="0" :open-cart="triggerOpenCart" :footer-red="true">
        <template v-slot:body>
            <div class="product-page">
                <div class="product-breadcrumbs" v-show="!loading">
                    <router-link to="/shop" class="breadcrumbs-nav">Home</router-link>
                    <router-link v-if="isFoodBrand" to="/shop/fnb" class="breadcrumbs-nav">Food & Beverage</router-link>
                    <router-link :to="brandNav" class="breadcrumbs-nav">{{ productBrands }}</router-link>
                    <span v-if="product">{{ product.name }}</span>
                </div>
                <div class="product-info mobile" v-if="product">
                    <div class="product-label">{{ productBrands }}</div>
                    <h1 :class="['product-sublabel', {'animate': startAnimate}]" :data-label="product.name">{{ product.name }}</h1>
                    <div class="product-more">
                        <div class="product-price-wrapper">
                            <div class="original-price" v-if="hasPromoPrice">{{ hasPromoPrice }}</div>
                            <div class="product-price">{{ productPrice }}</div>
                        </div>
                        <div class="wishlist-button" 
                            v-if="isFavoriteProduct(product.id, variant?.id)"
                            @click="wishList()">
                            <span>Added to Wishlist</span>
                            <span class="favorite material-icons-outlined active">favorite</span>
                        </div>
                        <div v-else class="wishlist-button"
                            @click="wishList()">
                            <span>Add to Wishlist</span>
                            <span class="favorite material-icons-outlined">favorite_border</span>
                        </div>
                    </div>
                </div>
                <div class="product-container" v-if="product && !isFoodBrand">
                    <div class="product-banners-wrapper">
                        <div class="product-banners" :class="{'empty': isEmpty(bannersAndVariantImages)}">
                            <product-carousel 
                                :banners="bannersAndVariantImages" 
                                :isDesktop="isDesktop"
                                :description="productDesc"
                                v-if="inited && !isEmpty(bannersAndVariantImages)"
                            />
                        </div>
                    </div>
                    <div class="product-wrapper" :class="{'empty-image': isEmpty(bannersAndVariantImages)}">
                        <div class="product-content">
                            <div class="product-info desktop" v-if="product">
                                <div class="product-label">{{ productBrands }}</div>
                                <h1 :class="['product-sublabel', {'animate': startAnimate}]" :data-label="product.name">{{ product.name }}</h1>
                                <div class="product-more">
                                    <div class="product-price-wrapper">
                                        <div class="original-price" v-if="hasPromoPrice">{{ hasPromoPrice }}</div>
                                        <div class="product-price">{{ productPrice }}</div>
                                    </div>
                                    <div class="wishlist-button" 
                                        v-if="isFavoriteProduct(product.id, variant?.id)"
                                        @click="wishList()">
                                        <span>Added to Wishlist</span>
                                        <span class="favorite material-icons-outlined active">favorite</span>
                                    </div>
                                    <div v-else class="wishlist-button"
                                        @click="wishList()">
                                        <span>Add to Wishlist</span>
                                        <span class="favorite material-icons-outlined">favorite_border</span>
                                    </div>
                                </div>
                            </div>
                            <product-variants 
                                v-if="hasVariant" 
                                :product="product"
                                :inventories="inventories"
                                :preSelectVariant="variant"
                                :is-empty-banners="isEmpty(bannersAndVariantImages)"
                                @emit-variant="emitVariant"
                            />
                            <div class="product-line-actions">
                                <div class="product-actions">
                                    <button @click="minusQty()" class="product-increment material-icons-outlined" :class="{'disabled': totalQty <= 1}">remove</button>
                                    <!-- <span>{{ totalQty }}</span> -->
                                    <input v-if="!isEmpty(availableInventory) || isFnB" type="number" min="1" v-model="productQuantity"/>
                                    <input v-else type="number" min="0" value="0" disabled/>
                                    <button @click="plusQty()" class="product-increment material-icons-outlined" :class="{'disabled': !this.isFnB && totalQty > 0 && totalQty >= maxStock}">add</button>
                                </div>
                                <button @click="toggleShowSizeGuide" class="size-guide">Size Guide</button>
                            </div>
                            <div class="product-button lite" v-if="hasModifierGroup()" @click="toggleVariants()">
                                <span class="product-text-nowrap">{{ !isEmpty(selectedModifiers()) ? selectedModifiers(true) : 'Select Addons' }}</span>
                                <span class="material-icons-outlined">expand_more</span>
                            </div>
                            <div class="product-button-group responsive-group">
                                <div class="product-button add-to-cart" 
                                    :class="{'disabled': !hasStoreAvailable, 'dark': hasStoreAvailable && !isEditProductCart, 'processing': processing && !buyNow}" @click="productAdded()">
                                    <span>{{ isEditProductCart ? 'Update' : 'Add to' }} Cart</span>
                                    <span class="material-icons-outlined">shopping_cart</span>
                                </div>
                                <div v-if="!isEditProductCart" @click="buyItNow()" class="product-button" :class="{'disabled': !hasStoreAvailable, 'processing': processing && buyNow}">
                                    <span>Buy It Now</span>
                                </div>
                            </div>
                        </div>
                        <base-accordion ref="productAccordion"
                            class="product-accordion" 
                            accordionTitle="Features" 
                            :noBorder="true"
                            isDark>
                            <div class="accordion-content" v-html="productDesc"></div>
                        </base-accordion>
                        <base-accordion ref="stockAccordion" isDark class="product-accordion" :accordionTitle="isFnB ? 'Outlet Information' : 'Inventory Status'">
                            <div class="accordion-content">
                                <div class="stock-item" v-if="isFnB">
                                    <span class="stock-icon material-icons-outlined">location_on</span>
                                    <div class="stock-elem">
                                        <div class="stock-elem-actions">
                                            <span class="elem-label">Location</span>
                                            <div class="stock-button" @click="toggleInventories()">View Stores</div>
                                        </div>
                                        <div class="elem-location">
                                            <span>{{ fnbStoreAvailable?.name }}</span>
                                        </div>
                                        <div class="stock-wrapper">
                                            <span  :class="['stock-status fnb', stockStatus[0]]"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="stock-item freeze" v-else-if="isEmpty(availableInventory)">
                                    <span class="stock-icon material-icons-outlined">location_on</span>
                                    <div class="stock-elem">
                                        <div class="stock-elem-actions">
                                            <span class="elem-label">Location</span>
                                            <div class="stock-button" v-if="!isEmpty(filteredInventories)" @click="toggleInventories()">View Stock</div>
                                        </div>
                                        <div class="stock-wrapper">
                                            <span 
                                                :class="['stock-status', stockStatus[0]]"
                                            ></span>
                                            <span>{{ stockStatus[1] }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="stock-item" v-else>
                                    <span class="stock-icon material-icons-outlined">location_on</span>
                                    <div class="stock-elem">
                                        <div class="stock-elem-actions">
                                            <span class="elem-label">Location</span>
                                            <div class="stock-button" @click="toggleInventories()">View Stock</div>
                                        </div>
                                        <div class="elem-location">
                                            <span>{{ availableInventory.store.name }}</span>
                                        </div>
                                        <div class="stock-wrapper">
                                            <span 
                                                :class="['stock-status', stockStatus[0]]"
                                            ></span>
                                            <!-- <span>{{ stockStatus[1] }}</span> -->
                                        </div>
                                    </div>
                                </div>
                                <!-- <div class="stock-item" v-if="!isEmpty(availableInventory) || isFnB">
                                    <span class="stock-icon material-icons-outlined">{{ isFnB ? 'shopping_bag' : 'local_shipping'}}</span>
                                    <div class="stock-elem">
                                        <span class="elem-label">{{ isFnB ? 'Sold by' : 'Sold and ship by' }}</span>
                                        <span class="elem-location">{{ selectedOutletName }}</span>
                                    </div>
                                </div> -->
                            </div>
                        </base-accordion>
                    </div>
                </div>
                <div class="product-container" v-if="product && isFoodBrand">
                    <div class="product-banners-wrapper">
                        <div class="product-banners food-banners" :class="{'empty': isEmpty(bannersAndVariantImages)}">
                            <product-carousel 
                                :banners="bannersAndVariantImages" 
                                :isDesktop="isDesktop"
                                :isFood="true"
                                :description="productDesc"
                                v-if="inited && !isEmpty(bannersAndVariantImages)"
                            />
                        </div>
                        <div class="product-incrementor">
                            <button @click="minusQty()"><i class="material-icons">remove</i></button>
                            <input type="number" min="1" v-model="productQuantity">
                            <button @click="plusQty()"><i class="material-icons">add</i></button>
                        </div>
                        <div class="product-food-actions desktop">
                            <button class="light left" @click="goBack"><i class="material-icons">chevron_left</i> Back</button>
                            <button :class="['middle',{'processing': processing && !buyNow}]" @click="productAdded()">{{ isEditProductCart ? 'Update' : 'Add to' }} cart {{ productPrice }}</button>
                            <button :class="['light right', {'disabled': isEditProductCart}]" @click="buyItNow()">Checkout</button>
                        </div>
                    </div>
                    <div class="food-addons-content">
                        <div class="food-name" v-if="product">{{ product.name }}</div>
                        <span>{{ productPrice }}</span>
                        <span style="margin-top:10px;">{{ product?.description }}</span>
                        <span class="food-name" v-if="product?.variants?.length && modifierGroups?.length">Customize</span>
                        <div class="modifier-list" v-if="product?.variants?.length">
                            <div class="modifier"
                                v-for="variant in product?.variants"
                                :key="variant.id">
                                <div class="modifier-radio" 
                                    :class="{'checked': variant.selected}"
                                    @click="variantClicked(variant.id)">
                                    <span class="modifier-label">{{ variant.name }} ({{ currency(variant.price) }})</span>
                                </div>
                            </div>
                        </div>
                        <div class="product-form-input" v-for="(mg, n) in modifierGroups" :key="n">
                            <span class="input-label">{{ mg.name }}:</span>
                            <div class="modifier-list">
                                <div class="modifier" v-for="(md, i) in mg.modifiers" :key="i">
                                    <div class="modifier-radio" 
                                        v-if="md.maxQuantity == 1"
                                        :class="{'checked': md.selectedAmount > 0, 'multiple-selection': mg.maxModifiers > 1}"
                                        @click="modifierClicked(md.id, mg.id)">
                                        <span class="modifier-label">{{ md.name }} ({{ currency(md.price) }})</span>
                                    </div>
                                    <div class="modifier-wrapper" 
                                        v-if="md.maxQuantity > 1"
                                        :class="{'checked': md.selectedAmount > 0}">
                                        <span class="modifier-label">{{ md.name }} ({{ currency(md.price) }})</span>
                                        <div class="modifier-selections">
                                            <div @click="modifierMinus(md.id)" class="modifier-increment material-icons-outlined">remove</div>
                                            <span>{{ md.selectedAmount }}</span>
                                            <div @click="modifierPlus(md,mg)" class="modifier-increment material-icons-outlined">add</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="product-food-actions mobile">
                        <button :class="['middle',{'processing': processing && !buyNow}]" @click="productAdded()">{{ isEditProductCart ? 'Update' : 'Add to' }} cart {{ productPrice }}</button>
                    </div>
                </div>
                <suggested-products v-if="product" :productsList="[product]"/>
            </div>
            <base-modal :show="showVariants">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="material-icons-outlined" @click="toggleVariants">close</span>
                        <h3>Product Selection</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="product-form-input" v-for="(mg, n) in modifierGroups" :key="n">
                            <span class="input-label">{{ mg.name }}:</span>
                            <div class="modifier-list">
                                <div class="modifier" v-for="(md, i) in mg.modifiers" :key="i">
                                    <div class="modifier-radio" 
                                        v-if="md.maxQuantity == 1"
                                        :class="{'checked': md.selectedAmount > 0, 'multiple-selection': mg.maxModifiers > 1}"
                                        @click="modifierClicked(md.id, mg.id)"
                                    >
                                        <span class="modifier-label">{{ md.name }} ({{ currency(md.price) }})</span>
                                    </div>
                                    <div class="modifier-wrapper" 
                                        v-if="md.maxQuantity > 1"
                                        :class="{'checked': md.selectedAmount > 0}"
                                    >
                                        <span class="modifier-label">{{ md.name }} ({{ currency(md.price) }})</span>
                                        <div class="modifier-selections">
                                            <div @click="modifierMinus(md.id)" class="modifier-increment material-icons-outlined">remove</div>
                                            <span>{{ md.selectedAmount }}</span>
                                            <div @click="modifierPlus(md,mg)" class="modifier-increment material-icons-outlined">add</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="total-price">{{ currency(totalAmount) }}</div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="showInventories">
                <template v-slot:header>
                    <div class="modal-header header-flex  justify-between">
                        <h3>Availability</h3>
                        <span class="close-btn material-icons-outlined" 
                            @click="toggleInventories()"
                        >close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="inventory-con" v-if="isFnB">
                            <div class="inventory-item" 
                                v-for="fnb in fnbStores" 
                                :key="fnb.id"
                                @click="selectFnBStore(fnb)">
                                <div class="inventory-wrapper">
                                    <div class="inventory-store">{{ fnb.name }}</div>
                                    <div class="inventory-address">{{ fnb.address.string }}</div>
                                    <div class="inventory-desc"><i class="material-icons-outlined">schedule</i>&nbsp;{{ getStoreDesc(fnb.id) }}</div>
                                    <div :class="['stock-status fnb', getStockStatus(fnb)[0]]"></div>
                                </div>
                                <div class="inventory-icon" :class="{'active': fnbStoreAvailable?.id == fnb.id}">
                                    <span class="material-icons-outlined">
                                        radio_button_{{ fnbStoreAvailable?.id == fnb.id ? 'checked' : 'unchecked' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="inventory-con" v-else>
                            <div class="inventory-item" 
                                v-for="inv in filteredInventories" 
                                :key="inv.id"
                                @click="selectInventory(inv)">
                                <div class="inventory-wrapper">
                                    <div class="inventory-store">{{ inv.store.name }}</div>
                                    <div class="inventory-address">{{ inv.store.address.string }}</div>
                                    <div class="inventory-desc"><i class="material-icons-outlined">schedule</i>&nbsp;{{ getStoreDesc(inv.store.id) }}</div>
                                    <div :class="['stock-status', getStockStatus(inv)[0]]"></div>
                                </div>
                                <div class="inventory-icon" :class="{'active': selectedInventoryId == inv.id}">
                                    <span class="material-icons-outlined">
                                        radio_button_{{ selectedInventoryId == inv.id ? 'checked' : 'unchecked' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="modal-footer">
                        <div class="btn-groups">
                            <div class="btn lite" @click="toggleInventories()">Cancel</div>
                            <div class="btn" @click="changeStore()">Select</div>
                        </div>
                    </div> -->
                </template>
            </base-modal>

            <base-modal :show="showSizeGuide">
                <template v-slot:header>
                    <div class="modal-header header-flex justify-between">
                        <h3>Size Guide</h3>
                        <span class="material-icons-outlined close-btn" @click="toggleShowSizeGuide">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <p>No size chart available</p>
                    </div>
                </template>
            </base-modal>
        </template>
        <template v-slot:footer>
			<base-side-nav v-if="!loading" active-index="0"/>
		</template>
    </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import { addFavorite, unFavorite } from "@/connector/v4/productConnector";
import { getPromotions } from "@/connector/v4/storeConnector.js";
import { productService } from "@/bloc/services";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty, isEqual } from "lodash";
import moment from 'moment-timezone';
import ProductVariants from "./components/ProductVariants.vue";
import ProductCarousel from "./components/ProductCarousel.vue";
import SuggestedProducts from "./components/SuggestedProducts.vue";

export default {
	name: "ProductDetails",
	components: {
        LayoutVariantTwo,
        ProductCarousel,
        SuggestedProducts,
        ProductVariants,
	},
	mixins: [utility],
	data() {
		return {
			loading: true,
            processing: false,
            inited: false,
            banners: [],
            showVariants: false,

            cartEditProductId: null,
            carts: [],

            product: null,
            productQuantity: 1,
            variants: [],
            modifierGroups: [],
            showInventories: false,
            inventories: [],
            selectedInventoryId: null,
            store: null,
            activeBanner: null,
            activeBannerLoading: false,
            isDesktop: true,
            buyNow: false,
            startAnimate: false,
            showSizeGuide: false,
            triggerOpenCart: false,
            fnbStoreAvailable: null,
            selectedVariant: null,
		};
    },
    watch: {
        startAnimate(val) {
            if (!val) return;
            this.triggerOpenCart = true;
            setTimeout(() => {
                this.startAnimate = false;
                // document.querySelector(".nav-cart-trigger").click();
                this.revalidateCart();
                this.triggerOpenCart = false;
            }, 900);
        },
        productQuantity(newVal, val) {
            if(this.isFnB || this.isFoodBrand) return;
            let inv = this.currentStoreInventory();
            let stock = inv?.stock || 0;
            let store = inv?.store;
            if (newVal > stock) {
                this.productQuantity = val || 1;
                this.showNotification("alert", "error_outline", stock > 0 ? `Max. ${stock} pcs stock is available` : 'This product is out of stock');
                return;
            }
            if (newVal > 0) {
                if (store && this.isOmisellOutlet) {
                    if (newVal < store.deliveryMinOrderValue) {
                        this.productQuantity = val;
                        this.showNotification("alert", "error_outline", `Min. order ${store.deliveryMinOrderValue} pcs is required.`);
                    } else if (newVal > store.deliveryMaxOrderValue) {
                        this.productQuantity = val;
                        this.showNotification("alert", "error_outline", `Max. order ${store.deliveryMaxOrderValue} pcs is required.`);
                    }
                }
                return;
            }
            this.productQuantity = val || 1;
        }
    },
    computed: {
        enabledInventory(){
            if(!this.product) return false;
            return this.isInventoryEnabled(this.product.brand);
        },
        filteredInventories() {
            if (isEmpty(this.variant)) return this.inventories;
            return this.inventories.filter((it) => it.product.id == this.product.id && it.status == "ACTIVE" && it.variant?.id == this.variant.id);
        },
        availableInventory() {
            if (!this.selectedInventoryId) return null;
            return this.inventories.find((it) => it.id == this.selectedInventoryId);
        },
        productPrice() {
            // if(this.totalAmount > 0) return this.currency(this.totalAmount * (this.totalQty - this.sameItemQty));
            if(this.totalAmount > 0) return this.currency(this.totalAmount);
            if (isEmpty(this.product)) return this.currency(0);
            let prices = new Set([this.product.price == 0 ? 'Free' : this.currency(this.product.price)]);
            if(!isEmpty(this.product.variants)){
                prices = [];
                this.product.variants.forEach((variant) => {
                    prices = new Set([...Array.from(prices), variant.price == 0 ? 'Free' : this.currency(variant.price)]);
                });
            }
            if (!isEmpty(this.variant)) {
                return this.variant.price == 0 ? 'Free' : this.currency(this.variant.price);
                // return this.currency(this.variant.price * (this.totalQty - this.sameItemQty));
            }
            return Array.from(prices).join(' | ');
        },
        hasPromoPrice() {
            if (isEmpty(this.product)) return null;
            let promoPrice = 0;
            if (this.product.promoPrice > 0 && this.product.price !== this.product.originalPrice) {
                // promoPrice = this.product.originalPrice * this.productQuantity;
                promoPrice = this.product.originalPrice;
            }
            if (!isEmpty(this.variant) && this.variant.promoPrice > 0) {
                // return this.currency(this.variant.price * this.productQuantity);
                return this.currency(this.variant.price);
            }
            if (promoPrice > 0) {
                // return this.currency(this.product.originalPrice * this.productQuantity);
                return this.currency(this.product.originalPrice);
            }
            return null;
        },
        currentCarts(){
            let parentCarts = Object.assign({}, this.$store.getters.getCarts);
            if(isEmpty(parentCarts)) return [];
            let outletCode = this.currentSelectedOutlet?.apiCode;
            return parentCarts[outletCode] || [];
        },
        sameItemQty() {
            if (!this.cartEditProductId) return 0;
            if (isEmpty(this.product)) return 0;
            let carts = this.currentCarts;
            let qty = 0;
            carts = carts?.filter((c) => {
                return c.product.id == this.product.id && c.id != this.cartEditProductId;
            });
            if (!isEmpty(carts)) {
                let tmpCart = {
                    product: this.product,
                    variant: this.variant,
                    modifierGroups: this.modifierGroups,
                    modifiers: this.modifiersMap,
                }
                carts.forEach((cart) => {
                    if (this.isEqualItem(cart, tmpCart)) qty += cart.quantity;
                });
            }
            return qty;
        },
        totalQty() {
            return this.productQuantity + this.sameItemQty;
        },
        currentStore(){
            return this.getCurrentStore();
        },
        products(){
            let items = this.$store.getters.getProducts;
            if(!isEmpty(this.product)){
                return items.filter((prd) => { 
                    return prd.id != this.product.id && prd.categories.filter((c) => { this.product.categories.indexOf(c.id) > -1 }).length > 0;
                });
            }
            return items;
        },
        totalAmount(){
            if(isEmpty(this.product)) return 0;
            let price = this.product.price;
            if(!isEmpty(this.product.variants)){
                if (!isEmpty(this.variant)) {
                    price = this.variant.price;
                    if (this.variant.promoPrice > 0) price = this.variant.promoPrice;
                }
            }
            if(!isEmpty(this.modifierGroups)){
                this.modifierGroups.forEach((mg) => {
                    mg.modifiers.forEach((md) => {
                        price += md.selectedAmount * md.price;
                    })
                });
            }
            return price;
        },
        hasVariant(){
            if(isEmpty(this.product)) return false;
            return !isEmpty(this.product.variants);
        },
        variant(){
            return this.variants.find((it) => { return it.selected });
        },
        bannersAndVariantImages() {
            if (isEmpty(this.variantImages)) {
                if(isEmpty(this.banners)){
                    return [{
                        image: require('@/assets/images/rox-logo-2025.jpeg'),
                        thumbnail: require('@/assets/images/rox-logo-2025.jpeg'),
                        index: 0,
                        sortIndex: 0
                    }]
                }
                return this.banners?.map((it, index) => {
                    return { ...it, index: index };
                });
            }
            let banners = JSON.parse(JSON.stringify(this.banners));
            return [...this.variantImages, ...banners]?.map((it, index) => {
                return { ...it, index: index };
            });
        },
        variantImages() {
            if (!this.hasVariant) return [];
            if (isEmpty(this.variant.images)) return [];
            let images = this.variant.images.map((img, ix) => {
                return {
                    index: this.banners.length + ix,
                    thumbnail: this.getImage(img.id, 'width=300'),
                    image: this.getImage(img.id),
                    sortIndex: img.sortIndex
                };
            });
            return images.sort((a, b) => a.sortIndex - b.sortIndex);
        },
        modifiersMap() {
            let modifiers = [];
            if (this.hasModifierGroup()) {
                const groups = this.prepareModifierGroup(this.modifierGroups);
                groups.forEach(function (modifierGroup) {
                    if(modifierGroup.modifiers?.length){
                        modifierGroup.modifiers.forEach(function (modifier) {
                            if(modifier.selectedAmount > 0){
                                modifiers.push({
                                    modifierId: modifier.id,
                                    name: modifier.name,
                                    quantity: modifier.selectedAmount,
                                    price: modifier.price
                                });
                            }
                        });
                    }
                });
            }
            return modifiers;
        },
        isFoodBrand(){
            if(!this.product) return false;
            let brands = this.collectBrandsList();
            let brand = brands?.find((b) => b.apiCode == this.product.brand);
            return brand?.type === "FOOD";
        },
        isFnB(){
            if(!this.product) return false;
            if(this.enabledInventory) return false;
            let brands = this.collectBrandsList();
            let brand = brands?.find((b) => b.apiCode == this.product.brand);
            return brand?.type === "FOOD";
        },
        hasStoreAvailable(){
            if(this.isFnB || this.isFoodBrand){
                return this.fnbStoreAvailable ? true : false;
            }
            return this.currentStoreInventory() ? true : false;
        },
        fnbStores(){
            if(!this.isFnB && !this.isFoodBrand) return [];
            let outletList = this.$store.getters.getOutlets;
            let oneOutlet = outletList.find((o) => o.stores.find((s) => s.brandCode == this.product.brand));
            let ss = oneOutlet?.stores.map((s) => {
                let ok = s.takeAway && s.brandCode == this.product.brand;
                s.isOpenToday = ok;
                let hours = s.takeAwayHours;
                let now = moment();
                let day = moment.tz(now, "Asia/Singapore").format("dddd").toUpperCase();
                let date = moment.tz(now, "Asia/Singapore").format("YYYY-MM-DD");
                let todayHour = hours?.find((h) => h.dayOfWeek == day);
                if(todayHour && ok){
                    let from = moment.tz(`${date} ${todayHour.startTime}`, "Asia/Singapore");
                    let to = moment.tz(`${date} ${todayHour.endTime}`, "Asia/Singapore");
                    if(now.isBetween(from, to, null, "[]")){
                        s.isOpenToday = true;
                    }
                }
                return s;
            });
            return [...ss];
        },
        fnbAvailableStores(){
            if(!this.isFnB && !this.isFoodBrand) return [];
            return [...this.fnbStores.filter((s) => s.isOpenToday)];
        },
        isEditProductCart() {
            let parent = Object.assign({}, this.$store.getters.getCarts || {});
            let carts = [];
            for(let k in parent){
                carts = [...carts, ...parent[k]];
            }
            let editCart = carts?.find(c => c.id == this.cartEditProductId);
            if(!isEmpty(this.variant)){
                editCart = carts?.find(c => c.id == this.cartEditProductId && this.product?.id == c.product?.id && this.variant?.id == c.variant?.id);
            }
            let tempCart = {
                product: this.product,
                variant: this.variant,
                modifierGroups: this.modifierGroups,
                modifiers: this.modifiersMap,
            };
            if (!isEmpty(editCart)) {
                let ok = this.isEqualItem({
                    product: editCart.product,
                    variant: editCart.variant,
                    modifierGroups: editCart.modifierGroups,
                    modifiers: editCart.modifiers,
                }, tempCart);
                if(ok) return editCart;
            }
            return carts.find((c) => this.isEqualItem(tempCart, {
                product: c.product,
                variant: c.variant,
                modifierGroups: c.modifierGroups,
                modifiers: c.modifiers,
            }));
        },
        maxStock(){
            let inv = this.inventories.find((it) => { return it.id == this.selectedInventoryId });
            return !isEmpty(inv) ? inv.stock : 0;
        },
        productBrands(){
            if(isEmpty(this.product)) return "";
            let brands = this.product.brands.map((brand) => {
                return brand.name;
            });
            return isEmpty(brands) ? '' : brands.join(', ');
        },
        productDesc() {
            if(isEmpty(this.product)) return "";
            if (isEmpty(this.product.description)) return "";
            let desc = this.product.description.split('\n');
            let arr = [];
            desc.forEach((it) => {
                arr.push(it.trim());
            });
            return arr.join('');
        },
        currentSelectedOutlet(){
            let outlets = this.$store.getters.getOutlets;
            if(this.isFnB || this.isFoodBrand){
                return outlets.find((o) => o.stores.filter((s) => s.id == this.fnbStoreAvailable?.id).length > 0);
            }
            if (isEmpty(this.availableInventory)) return null;
            let st = this.availableInventory.store;
           return outlets.find((o) => o.stores.filter((s) => s.id == st.id).length > 0);
        },
        selectedOutletName() {
            if (isEmpty(this.availableInventory)) return "";
            return this.currentSelectedOutlet?.name;
        },
        isOmisellOutlet() {
            let outlet = this.currentSelectedOutlet;
            if (!outlet) return false;
            return outlet.enableOmisellIntegration == true && outlet.stores.filter((s) => { return s.delivery }).length > 0;;
        },
        currentActiveBanner() {
            if (!isEmpty(this.activeBanner)) return this.activeBanner;
            return this.bannersAndVariantImages[0];
        },
        shopNav() {
            let outlet = this.$route.params.outlet;
            if (!outlet) return "";
            return `/shop/${outlet}`;
        },
        brandNav() {
            if (!this.product) return "";
            let brands = this.product.brands?.map((brand) => {
                return brand.apiCode;
            });
            if (brands.length == 0) return "";
            return `/collections/brand/${brands[0]}`;
        },
        stockStatus() {
            if(this.isFnB && this.fnbStoreAvailable){
                return ['available', 'Available'];
            }
            return this.getStockStatus(this.availableInventory);
        },
    },
    methods: {
        selectFnBStore(store){
            if(!store.isOpenToday) return;
            this.fnbStoreAvailable = store;
        },
        revalidateCart(){
            let tempCart = {
                product: this.product,
                variant: this.variant,
                modifierGroups: this.modifierGroups,
                modifiers: this.modifiersMap,
            };
            let parentCarts = this.$store.getters.getCarts;
            let carts = parentCarts[this.currentSelectedOutlet?.apiCode];
            let cart = carts?.find((c) => {
                return this.isEqualItem(tempCart, {
                    product: c.product,
                    variant: c.variant,
                    modifierGroups: c.modifierGroups,
                    modifiers: c.modifiers,
                })
            });
            this.cartEditProductId = cart?.id;
        },
        toggleShowSizeGuide(){
            this.showSizeGuide = !this.showSizeGuide;
        },
        getStockStatus(inv) {
            if(this.isFnB){
                if(inv.isOpenToday) return ['available', 'Available'];
                return ['disabled', 'Not available today']
            }
            if (isEmpty(inv)) return ['disabled', 'This product is unavailable at the moment.'];
            let stock = inv.stock;
            if (stock <= 0) return ['unavailable', 'Currently unavailable. Check other store'];
            if (stock > 5) return ['available', `${stock} pcs available`];
            return ['limited', `Only ${stock} pcs left`];
        },
        getStoreDesc(storeId){
            let store = this.$store.getters.getStoreList.find((s) => {
                return s.id == storeId;
            });
            if(isEmpty(store)) return "";
            let today = moment.tz(moment(), 'Asia/Singapore').format('dddd').toUpperCase();
            let hour = store.openingHours.find((it) => { return it.dayOfWeek == today });
            if(isEmpty(hour)) return 'Closed';
            let from = hour.startTime.substr(0, 5);
            let to = hour.endTime.substr(0, 5);
            return `${from} - ${to}`;
        },
        changeStore(){
            this.showInventories = false;
            let inventory = this.inventories.find((it) => {
                return it.id == this.selectedInventoryId;
            });
            if(isEmpty(inventory)) return;
            let dineType = this.$store.getters.getDineType;
            let allow = true;
            let info = "";
            this.store = this.$store.getters.getStoreList.find((s) => { return s.id == inventory.store.id });
            if(isEmpty(this.store)) return;
            switch(dineType){
                case "DELIVERY": 
                    info = "Delivery";
                    if(!this.store.delivery) allow = false;
                    break;
                case "TAKE_AWAY": 
                    info = "pick up";
                    if(!this.store.takeAway) allow = false;
                    break;
            }
            if(!allow) return this.showNotification("alert", "error_outline", `Store ${this.store.name} is not available for ${info} service!`);
        },
        selectInventory(inv, allowZero){
            if(isEmpty(inv)) return;
            if(inv.stock <= 0 && !allowZero) return;
            this.selectedInventoryId = inv.id;
        },
        toggleInventories(){
            // if (this.isOmisellOutlet) return;
            this.showInventories = !this.showInventories;
        },
        selectedModifiers(display){
            let groups = [];
            if (this.hasModifierGroup()) {
                groups = this.modifierGroups.filter((mg) => {
                    return mg.modifiers.filter((md) => {
                        return md.selectedAmount > 0
                    }).length > 0;
                });
                if(display){
                    let items = [];
                    if(!isEmpty(groups)){
                        groups.forEach((mg) => {
                            mg.modifiers.forEach((md) => {
                                if(md.selectedAmount > 0){
                                    items.push(`${md.selectedAmount}x ${md.name}`)
                                }
                            });
                        });
                    }
                    return items.join(', ');
                }
            }
            return groups;
        },
        getCartIndex(){
            let parentCarts = this.$store.getters.getCarts;
            if(isEmpty(parentCarts)) return 0;
            let carts = [];
            for(let k in parentCarts){
                carts = [...carts, ...parentCarts[k]];
            }
            let cartIds = carts.map((c) => c.id);
            return Math.max(...cartIds);
        },
        hasModifierGroup() {
            if(this.hasVariant) {
                return !isEmpty(this.variant.modifierGroups);
            } 
            return !isEmpty(this.modifierGroups);
        },
        async productAdded() {
            let self = this;
            if (self.processing) return;
            if (!this.hasStoreAvailable) return;
            const px = this.$store.getters.getCarts;
            let cx = [];
            for(let k in px){
                cx = [...cx, ...px[k]];
            }
            const isCartFoodOrder = cx.filter((c) => c.product.brands.filter((pb) => pb.type == "FOOD").length > 0)?.length > 0;
            if(cx.length > 0 && this.isFoodBrand && !isCartFoodOrder){
                return this.showNotification("alert", "error_outline", `We are sorry! You have non-food product in the cart which cannot be mixed with food product`);
            }
            if(cx.length > 0 && !this.isFoodBrand && isCartFoodOrder){
                return this.showNotification("alert", "error_outline", `We are sorry! You have food product in the cart which cannot be mixed with non-food product`);
            }

            /*
            if (!self.isLoggedIn()) {
                let prdNames = this.product.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                    if (it.toUpperCase() == it) return it;
                    return it.toLowerCase();
                });
                let variantSlugs = [];
                if (this.variant) {
                    variantSlugs = this.variant.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                        if (it.toUpperCase() == it) return it;
                        return it.toLowerCase();
                    });
                }
                return self.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/product/${self.$route.params.productId}/${[...prdNames, ...variantSlugs].join('-')}`
                    }
                });
            }
            */
            let isMixnMatch = this.$store.getters.isMixnMatch;
            let parentOrderRequest = this.$store.getters.getOrderRequest;
            if(!isMixnMatch){
                let orderRequest = parentOrderRequest[this.currentSelectedOutlet?.apiCode];
                if(!isEmpty(orderRequest) && !isEmpty(orderRequest.orders)){
                    let oStores = orderRequest.orders.map((o) => {
                        return o.store;
                    });
                    if(oStores.indexOf(this.store.id) == -1) return this.showNotification("alert", "error_outline", "Mix n match orders is not allowed!");
                }
            }
            this.$store.dispatch("setCurrentStore", this.store);
            let bookings = this.$store.getters.getBooking;
            if(!isEmpty(bookings)){
                let parentPromoCodes = this.$store.getters.getPromoCodes || {};
                let promoCodes = {};
                for(let k in parentPromoCodes) {
                    if(k == "event") continue;
                    promoCodes[k] = parentPromoCodes[k];
                };
                this.$store.dispatch("setPromoCodes", promoCodes);
                this.$store.dispatch("clearBooking");
            }
            let errorMessages = [];
            let errorCount = 0;
            let parentCarts = this.$store.getters.getCarts;
            let outletCode = this.currentSelectedOutlet?.apiCode;
            let carts = parentCarts[outletCode] || [];
            let currentCartIndex = this.getCartIndex();
            let modifiers = [];
            let modifierPrice = 0;
            let modifierGroups = [];
            if (self.hasModifierGroup()) {
                modifierGroups = [...this.modifierGroups];
                modifierGroups.forEach(function (it) {
                    let totalSelectedModifier = 0;
                    it.modifiers.forEach(function (modifier) {
                        if(modifier.selectedAmount > 0){
                            modifiers.push({
                                modifierId: modifier.id,
                                name: modifier.name,
                                quantity: modifier.selectedAmount,
                                price: modifier.price
                            });
                            modifierPrice += modifier.price * modifier.selectedAmount;
                            totalSelectedModifier += modifier.selectedAmount;
                        }
                    });
                    it.totalSelectedAmount = totalSelectedModifier;

                    if (it.minModifiers === it.maxModifiers) {
                        if (totalSelectedModifier < it.minModifiers || totalSelectedModifier > it.maxModifiers) {
                            errorMessages.push("Please select " + it.minModifiers + " of " + it.name);
                            errorCount += 1;
                        }
                    } else if (it.minModifiers > 0) {
                        if (totalSelectedModifier < it.minModifiers) {
                            errorMessages.push("Please select at least " + it.minModifiers + " of " + it.name);
                            errorCount += 1;
                        }
                    } else {
                        if (totalSelectedModifier > it.maxModifiers) {
                            errorMessages.push("Please select up to " + it.maxModifiers + " of " + it.name);
                            errorCount += 1;
                        }
                    }
                });
            }
            if (errorCount > 0) {
                return this.showNotification("alert", "error_outline", errorMessages[0]);
            }
            let variantPrice = 0;
            let price = self.product.price + modifierPrice;
            if (self.hasVariant) {
                variantPrice = self.variant.price + modifierPrice;
                if (self.variant.promoPrice > 0) variantPrice = self.variant.promoPrice + modifierPrice;
                price = variantPrice;
            }
            let updateProduct = self.cartEditProductId != null;
            let storeId = self.currentStoreInventory() ? self.currentStoreInventory().store.id : "";
            if(this.isFnB || this.isFoodBrand) storeId = this.fnbStoreAvailable.id;
            let outletStore = this.$store.getters.getOutlets.find((out) => {
                return out.stores?.filter((os) => os.id == storeId).length > 0
            });
            let hq = this.$store.getters.getHeadquarter;
            let brCode = this.isFnB ? this.fnbStoreAvailable.brandCode : self.currentStoreInventory()?.store?.brandCode
            let brand = hq.headquarter.brand.find((b) => b.apiCode == brCode);
            let stName = this.isFnB ? this.fnbStoreAvailable.name : self.currentStoreInventory()?.store?.name;
            outletStore.brand = brand;
            let accPrice = price * self.productQuantity;
            if (self.isEditProductCart) {
                let cartIdx = carts.findIndex((c) => {
                    return c.id == self.isEditProductCart.id
                });
                let cart = {...carts[cartIdx]};
                if (cart.freeProduct) {
                    let cartIdx2 = carts.findIndex((c) => { return c.product.id == cart.product.id && c.id !== self.cartEditProductId && c.price > 0 });
                    if (cartIdx2 > -1) {
                        cartIdx = cartIdx2;
                        cart = {...carts[cartIdx]};
                        self.cartEditProductId = cart.id;
                    } else {
                        self.cartEditProductId = null;
                        self.productQuantity--;
                        if (self.productQuantity == 0) self.productQuantity = 1;
                        return self.productAdded();
                    }
                }
                carts[cartIdx].beforeEdit = cart,
                carts[cartIdx].outletStore = outletStore,
                carts[cartIdx].quantity = self.productQuantity,
                carts[cartIdx].variant = self.variant,
                carts[cartIdx].modifierGroups = modifierGroups,
                carts[cartIdx].price = price,
                carts[cartIdx].accPrice = accPrice,
                carts[cartIdx].specialInstructions = "",
                carts[cartIdx].modifiers = modifiers,
                carts[cartIdx].processing = true,
                carts[cartIdx].storeName = stName,
                carts[cartIdx].storeId = storeId,
                carts[cartIdx].inventory = self.currentStoreInventory(),
                carts[cartIdx].checked = true;
            } else {
                let tempCart = {
                    outletStore: outletStore,
                    id: currentCartIndex,
                    showEdit: false,
                    product: self.product,
                    quantity: self.productQuantity,
                    variant: self.variant,
                    modifierGroups: modifierGroups,
                    price: price,
                    accPrice: accPrice,
                    specialInstructions: "",
                    modifiers: modifiers,
                    storeName: stName,
                    storeId: storeId,
                    inventory: self.currentStoreInventory(),
                    processing: true,
                    freeProduct: "",
                    checked: true
                };
                
                let isNewItem = true;
                carts.some(function (it) {
                    if (self.isEqualItem(it, tempCart)) {
                        it.outletStore = outletStore;
                        it.storeName = stName;
                        it.storeId = storeId;
                        it.inventory = self.currentStoreInventory();
                        it.quantity = tempCart.quantity;
                        it.accPrice = accPrice;
                        isNewItem = false;
                        return true;
                    }
                });
                if (isNewItem) {
                    currentCartIndex += 1;
                    tempCart.id = currentCartIndex;
                    carts.push(tempCart);
                }
            }
            this.$store.dispatch("setCarts", {
                ...parentCarts,
                [outletCode]: carts
            });
            this.$store.dispatch("setAutoPromocodes", []);
            this.processing = true;
            // let cartId = this.$store.getters.getCartId || null;
            // let draft = cartId ? false : true;
            this.testOrder(false, function () {
                if(!updateProduct) {
                    window.dataLayer.push({
                        event: "add_to_cart",
                        item_id: self.product.id,
                        item_name: self.product.name
                    });
                }
                self.processing = false;
                parentCarts = self.$store.getters.getCarts;
                carts = parentCarts[outletCode];
                carts.map((c) => {
                    c.processing = false;
                    return c;
                });
                self.$store.dispatch("setCarts", {
                    ...parentCarts,
                    [outletCode]:carts
                });
                if (self.buyNow) {
                    return self.$router.push({ name: "CheckoutPage" });
                }
                self.startAnimate = true;
                // self.$router.back();
            }, function(error){
                self.processing = false;
                let idx = carts.findIndex((c) => {
                    return c.processing == true;
                });
                let editIdx = carts.findIndex((c) => {
                    return !isEmpty(c.beforeEdit);
                });
                if(editIdx > -1){
                    let revertCart = carts[editIdx].beforeEdit;
                    carts[editIdx] = revertCart;
                } else {
                    carts.splice(idx, 1);
                }
                self.$store.dispatch("setCarts", {
                    ...parentCarts,
                    [outletCode]: carts
                });
                if (error.promoCodes) {
                    error.message = error.promoCodes.map((prm) => {
                        return `${prm.message} : ${prm.code}`;
                    }).join('. ');
                }
                self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);

                let parentPromoCodes = self.$store.getters.getPromoCodes;
                let promoCodes = parentPromoCodes[outletCode];
                let items = error.items || [];
                if (!isEmpty(items) && !isEmpty(promoCodes)) {
                    self.loading = true;
                    const checkItems = async () => {
                        let json = await getPromotions(outletCode);
                        let promo = json.promotions.find((it) => {
                            return promoCodes.indexOf(it.code) > -1;
                        });
                        if (promo && promoCodes.indexOf(promo.code) > -1) {
                            parentCarts = self.$store.getters.getCarts;
                            carts = parentCarts[outletCode];
                            let errorItem = items[0].id;
                            switch (promo.benefitType) {
                                case "FREE_ITEM":
                                    if (!isEmpty(promo.freeProduct)) {
                                        if (errorItem == promo.freeProduct.id) {
                                            /* if errorItem is promo item
                                                tell BE to remove promo code to fix the error:
                                            */
                                            promoCodes = promoCodes.filter((code) => { return code != promo.code });
                                            self.$store.dispatch("setPromoCodes", {
                                                ...parentPromoCodes,
                                                [outletCode]: promoCodes
                                            });
                                            await self.testOrder(false, async () => {
                                                // tell BE to remove product from cart
                                                parentCarts = self.$store.getters.getCarts;
                                                carts = parentCarts[outletCode];
                                                carts = carts.filter((c) => { return c.product.id !== self.product.id });
                                                self.$store.dispatch("setCarts", {
                                                    ...parentCarts,
                                                    [outletCode]: carts
                                                });
                                                // and re-apply promocode:
                                                promoCodes.push(promo.code);
                                                parentPromoCodes = self.$store.getters.getPromocodes || {};
                                                self.$store.dispatch("setPromoCodes", {
                                                    ...parentPromoCodes,
                                                    [outletCode]: promoCodes
                                                });
                                                await self.testOrder(false, undefined, undefined, true, true, carts, outletCode);
                                            }, undefined, true, true, carts, outletCode);
                                        } else if (errorItem == self.product.id) {
                                            /* if errorItem is this product
                                                tell BE to remove product to fix the error:
                                            */
                                            parentCarts = self.$store.getters.getCarts;
                                            carts = parentCarts[outletCode];
                                            carts = carts.filter((c) => { return c.product.id !== self.product.id });
                                            self.$store.dispatch("setCarts", {
                                                ...parentCarts,
                                                [outletCode]: carts
                                            });
                                            await self.testOrder(false, undefined, undefined, true, true, carts, outletCode);
                                        }
                                    }
                                    break;
                            }
                        }
                        items.splice(0, 1);
                        if (!isEmpty(items)) return checkItems();
                        self.loading = false;
                    }
                    checkItems();
                }
            }, true, true, carts, outletCode);
        },
        isEqualItem(item1, item2) {
            if(!item1 || !item2) return false;
            let data1 = {
                product: item1.product?.id,
                variant: item1.variant?.id,
                modifierGroups: item1.modifierGroups,
                modifiers: item1.modifiers,
            };
            let data2 = {
                product: item2.product?.id,
                variant: item2.variant?.id,
                modifierGroups: item2.modifierGroups,
                modifiers: item2.modifiers,
            };
            return isEqual(data1, data2);
        },
        modifierPlus(md, mg) {
            this.modifierGroups.some(function (it) {
                it.modifiers.some(function (modifier) {
                    if (modifier.id === md.id) {
                        if (it.totalSelectedAmount < mg.maxModifiers) {
                            if (modifier.selectedAmount === 0) {
                                if(!it.selectedModifiers) it.selectedModifiers = [];
                                it.selectedModifiers.push(modifier);
                            }
                            modifier.selectedAmount += 1;
                            it.totalSelectedAmount += 1;
                        }
                        return true;
                    }
                });
                if(it.totalSelectedAmount === mg.maxModifiers) {
                    it.max = true;
                }
            });
            this.revalidateCart();
        },
        modifierMinus(modifierId) {
            this.modifierGroups.some(function (it) {
                it.modifiers.some(function (modifier) {
                    if (modifier.id === modifierId) {
                        if (modifier.selectedAmount > 0) {
                            modifier.selectedAmount -= 1;
                            it.totalSelectedAmount -= 1;
                            if (modifier.selectedAmount === 0) {
                                let index = it.selectedModifiers.indexOf(modifier);
                                if (index > -1) {
                                    it.selectedModifiers.splice(index, 1);
                                }
                            }
                            return true;
                        }
                    }
                });
                it.max = false;
            });
            this.revalidateCart();
        },
        modifierClicked(modifierId, modifierGroupId) {
            this.modifierGroups.some(function (it) {
                if (it.id != modifierGroupId) return;
                if (it.minModifiers === it.maxModifiers && it.maxModifiers === 1) {
                    it.modifiers.forEach(function (modifier) {
                        if (modifier.maxQuantity === 1) {
                            if (modifier.id === modifierId) {
                                modifier.selectedAmount = 1;
                            } else {
                                modifier.selectedAmount = 0;
                            }
                        }
                    });
                } else {
                    it.modifiers.forEach(function (modifier) {
                        if (modifier.maxQuantity === 1) {
                            if (modifier.id === modifierId) {
                                if (modifier.selectedAmount > 0) {
                                    modifier.selectedAmount -= 1;
                                    it.totalSelectedAmount -= 1;
                                    it.max = false;
                                } else {
                                    if(it.totalSelectedAmount == it.maxModifiers) {
                                        it.max = true;
                                        return
                                    }
                                    if (it.totalSelectedAmount < it.maxModifiers) {
                                        modifier.selectedAmount += 1;
                                        it.totalSelectedAmount += 1;
                                    }
                                }
                            }
                        }
                    });
                }
                return true;
            });
            this.revalidateCart();
        },
        toggleVariants(){
            this.showVariants = !this.showVariants;
        },
        prepareModifierGroup(modifierGroup) {
            modifierGroup.totalSelectedAmount = 0;
            if (modifierGroup.modifiers && modifierGroup.modifiers.length > 0) {
                modifierGroup.modifiers.forEach(function (modifier) {
                    modifier.selectedAmount = 0;
                    if (modifier.maxQuantity === 1) {
                        if (modifier.preSelected) {
                            modifier.selectedAmount = 1;
                            modifierGroup.totalSelectedAmount = 1;
                        }
                    } else {
                        modifier.selectedAmount = modifier.preSelected ? 1 : 0;
                        modifierGroup.totalSelectedAmount += modifier.preSelected ? 1 : 0;
                    }
                    modifierGroup.max = false;
                });
            }
            return modifierGroup;
        },
        setModifierGroups(variant, cart = null) { // variant can also mean product in case of single modifier group
            if(isEmpty(variant.modifierGroups)) return;
            let self = this;
            variant.modifierGroups.forEach(function (modifierGroup) {
                if (modifierGroup.minModifiers === modifierGroup.maxModifiers) {
                    modifierGroup.help = "Please select " + modifierGroup.minModifiers;
                } else if (modifierGroup.minModifiers > 0) {
                    modifierGroup.help = "Please select at least " + modifierGroup.minModifiers;
                } else {
                    modifierGroup.help = (modifierGroup.maxModifiers == 999) ?
                        "" : "Please select up to " + modifierGroup.maxModifiers;
                }
                let mg = self.prepareModifierGroup(modifierGroup);
                if (!isEmpty(cart) && !isEmpty(cart.modifierGroups)){
                    let cmg = cart.modifierGroups.find((gr) => {
                        return gr.id == modifierGroup.id;
                    });
                    if(!isEmpty(cmg)) {
                        mg.modifiers = cmg.modifiers;
                        mg.selectedModifiers = cmg.selectedModifiers;
                        mg.totalSelectedAmount = cmg.totalSelectedAmount;
                    }
                }
                modifierGroup = mg;
            });
        },
        emitVariant(variant) {
            if (this.variant && this.variant.id == variant.id) return;
            this.loading = true;
            this.activeBannerLoading = true;
            // let curr = this.getCurrentStore();
            let inv = this.inventories?.find((item) => {
                return item.product.id == this.product.id && item.status == "ACTIVE" && item.variant?.id == variant.id;
            });
            this.selectedInventoryId = !isEmpty(inv) ? inv.id : null;
            this.variantClicked(variant.id);
            this.productQuantity = 1;
            if (this.isEditProductCart) this.productQuantity = this.isEditProductCart.quantity;
            this.$store.dispatch("setClickedVariant", {
                product: this.product,
                variant: variant,
                selectedInventoryId: this.selectedInventoryId,
                inventories: this.inventories,
                cartProductEdit: this.cartEditProductId
            });
            let prdNames = this.product.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                if (it.toUpperCase() == it) return it;
                return it.toLowerCase();
            });
            let variantSlugs = variant.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                if (it.toUpperCase() == it) return it;
                return it.toLowerCase();
            });
            this.$router.replace({
                name: 'ProductDetails',
                params: {
                    outlet: this.$route.params.outlet,
                    productId: this.$route.params.productId,
                    productName: [...prdNames, ...variantSlugs].join('-')
                }
            });
        },
        variantClicked(variantId) {
            let self = this;
            let parentCarts = self.$store.getters.getCarts;
            let carts = [];
            for(let k in parentCarts){
                carts = [...carts, ...parentCarts[k]];
            }
            let editCart = carts.find((c) => {
                return c.id == self.cartEditProductId;
            });
            /*
            if(!isEmpty(editCart)){
                mg = editCart.modifierGroups;
            }
            */
            self.variants.forEach(function (variant) {
                variant.selected = variant.id === variantId;
                return variant;
            });
            let variant = self.variants.find((it) => { return it.selected });
            if (!isEmpty(variant)) {
                self.setModifierGroups(variant, editCart);
                self.setModifier(variant.modifierGroups);
            }
            self.revalidateCart();
        },
        setModifier(modifierGroups) {
            let self = this;
            this.modifierGroups = modifierGroups?.map((mg) => self.prepareModifierGroup(mg));
        },
        resizeBannerHandler() {
            this.isDesktop = window.innerWidth >= 672;
            setTimeout(() => {
                this.resizeImageHandler();
            }, 50);
        },
        setActiveBanner(banner) {
            let self = this;
            if (isEmpty(banner)) return;
            this.activeBannerLoading = true;
            this.activeBanner = banner;
            let im = new Image();
            im.onload = () => {
                self.activeBannerLoading = false;
            }
            im.onerror = () => {
                self.activeBannerLoading = false;
            }
            im.src = banner.thumbnail;
        },
        async getProduct(currentVariant) {
            try {
                this.store = this.getCurrentStore();
                let outlets = this.$store.getters.getOutlets;
                let productId = this.$route.params.productId;
                let editCart = null;
                let parentCarts = this.$store.getters.getCarts;
                let carts = [];
                for(let k in parentCarts){
                    carts = [...carts, ...parentCarts[k]];
                }
                let cartProductEdit = !isEmpty(currentVariant) ? currentVariant.cartProductEdit : this.$store.getters.getCartProductEdit;
                if (cartProductEdit != null) {
                    editCart = carts?.find(c => c.id == cartProductEdit);
                    let outlet = outlets.find((o) => o.stores.filter((s) => s.id == editCart?.storeId).length > 0);
                    this.store = outlet?.stores.find((s) => { return s.id == editCart?.storeId });
                } else {
                    let cartIndex = carts?.findIndex((c) => { return c.product.id == productId });
                    if (cartIndex >= 0) {
                        let outlet = outlets.find((o) => o.stores.filter((s) => s.id == carts[cartIndex].storeId).length > 0);
                        this.store = outlet?.stores.find((s) => { return s.id == carts[cartIndex].storeId });
                        if (this.store) {
                            cartProductEdit = carts[cartIndex].id;
                            editCart = carts[cartIndex];
                        }
                    }
                }
                const stateStorePage = this.$store.getters.getStateStorePage;
                let products = this.$store.getters.getProducts;
                let res = await productService.retrieveProductsList({
                    productId: productId,
                    pageNumber: 0,
                    pageSize: 1,
                });
                let prd = res?.products ? res.products[0] : null;
                if(prd) {
                    prd = {
                        ...prd,
                        brands: res?.brands?.filter((b) => b.apiCode == prd.brand)
                    }
                }
                let categories = this.$store.getters.getCategories;
                if(stateStorePage.lastUpdated){
                    categories = stateStorePage.categories;
                }
                if(!prd) prd = products.find((p) => p.id == productId);

                window.dataLayer.push({
                    event: "view_item",
                    item_id: productId,
                    item_name: !isEmpty(prd) ? prd.name : "",
                    page_location: window.location.href
                });
                
                this.banners = [];
                if (!isEmpty(prd)) {
                    prd.freeProduct = null;
                    parentCarts = this.$store.getters.getCarts;
                    carts = [];
                    for(let k in parentCarts){
                        carts = [...carts, ...parentCarts[k]];
                    }
                    if (!isEmpty(carts)) {
                        let freeProducts = carts.filter(it => !isEmpty(it.freeProduct) && it.product.id == prd.id);
                        if (!isEmpty(freeProducts)) prd.freeProduct = freeProducts[0].freeProduct;
                    }
                    if (!isEmpty(prd.imageId)) this.banners.push({ index: 0, thumbnail: this.getImage(prd.imageId, 'width=300'), image: this.getImage(prd.imageId) });
                    if (!isEmpty(prd.image2Id)) this.banners.push({ index: 1, thumbnail: this.getImage(prd.image2Id, 'width=300'), image: this.getImage(prd.image2Id) });
                    if (!isEmpty(prd.image3Id)) this.banners.push({ index: 2, thumbnail: this.getImage(prd.image3Id, 'width=300'), image: this.getImage(prd.image3Id) });
                    if (!isEmpty(prd.images)) {
                        prd.images.sort((a, b) => a.sortIndex - b.sortIndex);
                        this.banners = prd.images.map((it, ix) => {
                            return {
                                index: ix,
                                thumbnail: this.getImage(it.id, 'width=300'),
                                image: this.getImage(it.id)
                            }
                        });
                    }
                    prd.categoryDisplay = categories.filter((cat) => {
                        return prd.categories.indexOf(cat.id) > -1;
                    }).map((cat) => {
                        return cat.name
                    }).join(' | ');
                    prd.favorite = prd.favorite || this.isFavoriteProduct(prd.id);
                    if(!isEmpty(prd.variants)){
                        this.variants = prd.variants;
                        let prdNames = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                            if (it.toUpperCase() == it) return it;
                            return it.toLowerCase();
                        });
                        let clickVariant = prd.variants[0].id;
                        if(editCart && !isEmpty(editCart.variant)) {
                            let vr = prd.variants.find((v) => { return v.id == editCart.variant.id });
                            if(!isEmpty(vr)) clickVariant = vr.id;
                        }
                        let variantBySlug = prd.variants.find((v) => {
                            let vSlugs = v.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                                if (it.toUpperCase() == it) return it;
                                return it.toLowerCase();
                            });
                            return [...prdNames, ...vSlugs].join('-') == this.$route.params.productName;
                        });
                        if (variantBySlug) {
                            clickVariant = variantBySlug.id;
                            editCart = carts.find((c) => c.product?.id == prd.id && c.variant?.id == clickVariant);
                            if(!editCart) {
                                cartProductEdit = null;
                                this.cartEditProductId = null;
                                this.$store.dispatch("setCartProductEdit", null);
                            }
                        }
                        this.variantClicked(clickVariant);
                    }
                    if(!isEmpty(editCart?.modifierGroups)){
                        this.modifierGroups = editCart?.modifierGroups.map((mg) => {
                            let totalSelectedAmount = 0;
                            mg.modifiers.map((mod) => {
                                let one = editCart.modifiers?.find((md) => md.modifierId == mod.id);
                                mod.selectedAmount = one?.quantity || 0;
                                if(mod.preSelected && mod.selectedAmount < 1) mod.selectedAmount = 1;
                                totalSelectedAmount += mod.selectedAmount;
                                return mod;
                            });
                            mg.totalSelectedAmount = totalSelectedAmount;
                            return mg;
                        });
                    } else if(!isEmpty(prd.modifierGroups)) {
                        this.setModifier(prd.modifierGroups);
                    }
                }
                this.product = prd;
                await this.setInventories(currentVariant);
                let inventories = this.mapInventories(this.$store.getters.getInventory || []);
                if (editCart) {
                    this.$store.dispatch("setCartProductEdit", null);
                    this.cartEditProductId = cartProductEdit;
                    this.productQuantity = editCart.quantity;
                }
                let storeIds = [];
                for (let i = 0; i < outlets.length; i++){
                    storeIds = [...storeIds, ...outlets[i].stores.map((s) => s.id)];
                }
                let one = inventories.find((item) => {
                    let passValue = item.product.id == productId && item.status == "ACTIVE" && item.stock > 0 && storeIds.includes(item.store.id);
                    if (!isEmpty(currentVariant)) {
                        return item.variant?.id == currentVariant.variant?.id && passValue;
                    }
                    return passValue;
                });
                this.selectedInventoryId = one?.id;
                window.addEventListener("resize",  this.resizeBannerHandler);
                this.$nextTick(() => {
                    this.resizeBannerHandler();
                    if (isEmpty(this.product)) return;
                    if(this.isFoodBrand) return;
                    this.$refs.stockAccordion.isClosed = true;
                    this.$refs.productAccordion.isClosed = true;
                });
            } finally {
                this.$store.dispatch("setClickedVariant", null);
                this.inited = true;
                this.loading = false;
            }
        },
        currentStoreInventory() {
            if (!isEmpty(this.variant)) {
                return this.inventories.find((it) => it.product.id == this.product.id && it.variant?.id == this.variant.id && it.status == "ACTIVE" && it.stock > 0);
            }
            return this.inventories?.find((inv) => {
                return inv.id == this.selectedInventoryId && inv.stock > 0;
            });
        },
        mapInventories(items){
            return items?.map((inv) => {
                inv.isOpenToday = false;
                let hours = inv.store.openingHours;
                let now = moment();
                let day = moment.tz(now, "Asia/Singapore").format("dddd").toUpperCase();
                let date = moment.tz(now, "Asia/Singapore").format("YYYY-MM-DD");
                let todayHour = hours?.find((h) => h.dayOfWeek == day);
                if(todayHour){
                    let from = moment.tz(`${date} ${todayHour.startTime}`, "Asia/Singapore").format("YYYY-MM-DD HH:mm:ss");
                    let to = moment.tz(`${date} ${todayHour.endTime}`, "Asia/Singapore").format("YYYY-MM-DD HH:mm:ss");
                    if(now.isBetween(from, to, null, "[]")){
                        inv.isOpenToday = true;
                    }
                }
                return inv;
            });
        },
        async setInventories(currentVariant){
            if(this.fnbAvailableStores?.length){
                this.fnbStoreAvailable = this.fnbAvailableStores[0];
            } else if(this.fnbStores?.length){
                this.fnbStoreAvailable = this.fnbStores[0];
            }
            if (isEmpty(this.product)) {
                this.loading = false;
                return [];
            }
            if(isEmpty(currentVariant) && this.enabledInventory) {
                await this.retrieveInventory(false, "", this.$route.params.productId);
            }
            this.loading = false;
            let storeIds = [];
            let outlets = this.$store.getters.getOutlets;
            for (let i = 0; i < outlets.length; i++){
                storeIds = [...storeIds, ...outlets[i].stores.map((s) => s.id)];
            }
            let items = this.mapInventories(this.$store.getters.getInventory || []);
            this.inventories = items?.filter((item) => {
                return item.product.id == this.product.id && item.status == "ACTIVE" && storeIds.includes(item.store.id);
            });
            if (!this.selectedInventoryId) {
                this.selectedInventoryId = this.inventories?.find((item) => {
                    return item.product.id == this.product.id && item.status == "ACTIVE" && item.stock > 0;
                })?.id;
            }
        },
        plusQty() {
            if(this.isFnB || this.isFoodBrand){
                this.productQuantity++;
                return;
            }
            let inv = this.inventories.find((it) => { return it.id == this.selectedInventoryId });
            let stock = inv?.stock || 0;
            if(this.productQuantity >= stock) return;
            this.productQuantity++;
        },
        minusQty() {
            if(this.productQuantity == 1) return;
            this.productQuantity--;
        },
        async wishList() {
            if (this.processing) return;
            if (!this.isLoggedIn()) return;
            try {
                if(isEmpty(this.product)) return;
                this.processing = true;
				if(this.isFavoriteProduct(this.product.id, this.variant?.id)){
					let res = await unFavorite(this.product.id, this.variant?.id);
                    this.processing = false;
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
                    this.$store.dispatch("unFavorite", {
                        product: this.product.id,
                        variant: this.variant?.id
                    });
					this.product.favorite = false;
                } else {
                    let res = await addFavorite(this.product.id, this.variant?.id);
                    this.processing = false;
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
                    this.$store.dispatch("addFavorite", {
                        product: this.product.id,
                        variant: this.variant?.id,
                        time: parseInt(moment().format('x'))
                    });
					this.product.favorite = true;
				}
			} catch (error) {
                this.processing = false;
				this.showNotification("warning", "error_outline", error);
			}
        },
        buyItNow() {
            this.buyNow = true;
            this.productAdded();
        },
        resizeHandler(){
            this.isDesktop = window.innerWidth >= 672;
        }
    },
	async created() {
        this.buyNow = false;
        this.loading = true;
        this.inited = false;
        this.isDesktop = window.innerWidth >= 672;
        window.addEventListener("resize",  this.resizeHandler);
        if (!this.$store.getters.hasInited) {
            await this.refreshMainData(true);
            this.$store.dispatch('setInited', true);
        }
        let variantClicked = this.$store.getters.getClickedVariant;
        if (!isEmpty(variantClicked)) {
            this.getProduct(variantClicked);
            return;
        }
        this.getProduct();
	},
    beforeUnmount(){
        window.removeEventListener("resize",  this.resizeBannerHandler);
        window.removeEventListener("resize",  this.resizeHandler);
    }
};
</script>
<style scoped lang="scss">
    .product-page {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
        padding-block: 20px;
        background: $brown-dark;
        color: $white;
        aspect-ratio: 5/2.5;
    }
    .close-btn {
        cursor: pointer;
        &:hover{ opacity: 0.7;}
    }
    .back-btn {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    }
    .product-header {
        padding: 16px 24px;
        text-align: left;
        color: $secondary-color-50;

        .x-title {
            font-weight: bold;
            color: $secondary-color-90;
        }
        .x-subtitle {
            color: $secondary-color-90;
        }
    }
    @keyframes processingElem {
        0% { 
            width: 0;
            background: linear-gradient(90deg, $main-red 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $main-red 100%, $secondary-color-20);
        }
    }
    @-webkit-keyframes processingElem {
        0% {
            width: 0;
            background: linear-gradient(90deg, $main-red 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $main-red 100%, $secondary-color-20);
        }
    }
    .product-breadcrumbs {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        gap: 6px;
        text-decoration: none;
        color: $white;
        padding: 20px;
        text-align: left;
        .breadcrumbs-nav {
            text-decoration: none;
            color: $white;
            margin-right: 8px;
            position: relative;
            &::after {
                content: "/";
                margin-left: 8px;
            }
        }
    }
    .product-info {
        padding-inline: 20px;
        width: 100%;
        display: flex;
        justify-content: baseline;
        align-items: baseline;
        flex-direction: column;
        text-align: left;
        gap: 8px;
        &.desktop {
            display: none;
        }

        &.strected {
            padding: 24px 0;

            .product-label {
                font-family: 'Berthold Akzidenz Grotesk Medium';
            }
            .product-sublabel {
                padding: 0 24px;
            }
        }

        .product-label {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            color: $blue-powder;
            font-weight: normal;
            text-transform: uppercase;
            font-size: 15px;
            line-height: 22px;
            letter-spacing: 0px;
        }

        .product-sublabel {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            font-weight: normal;
            font-size: 24px;
            line-height: 38px;
            letter-spacing: 0px;
            color: $white;
            /*
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            */
            &::before {
                transition: all 1s ease-in-out 0.2s;
                -webkit-transition: all 1s ease-in-out 0.2s;
                content: attr(data-label);
                position: fixed;
                opacity: 0;
                z-index: 10;
                top: 220px;
            }
            &.animate {
                &::before {
                    top: 0;
                    transform: translate(250px, 0px) scale(0.5);
                    -webkit-transform: translate(250px, 0px) scale(0.5);
                    animation: cartAnim 1s linear forwards;
                    -webkit-animation: cartAnim 1s linear forwards;
                }
            }
        }
        .product-more {
            padding-block: 16px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            width: 100%;
        }
        .wishlist-button {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            padding: 4px 16px;
            padding-top: 6px;
            border-radius: 24px;
            border: 1px solid $dark-color-4;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            &:hover {
                opacity: 0.7;
            }
            .favorite {
                font-size: 1em;
                &.active {
                    color: $primary-color-60;
                }
            }
        }
        .product-price,
        .original-price {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            font-size: 24px;
            line-height: 38px;
            letter-spacing: 0px;
        }
    }
    .product-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        text-align: left;
        margin-bottom: 32px;

        .product-banners-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
            flex: 3;
            height: fit-content;
        }

        .product-banners {
            display: flex;
            flex-direction: column;
            gap: 16px;
            height: fit-content;
            &:is(.food-banner){
                aspect-ratio: 5/3;
                height: fit-content;
                overflow: hidden;
            }

            .banners-desktop {
                &.invisible {
                    visibility: hidden;
                    max-height: 0;
                }
                .banner-desktop-active {
                    width: 100%;
                    position: relative;
                    aspect-ratio: 3/4;
                    &.loading {
                        background: $secondary-color-10;
                        img {
                            display: none;
                        }
                        &::before {
                            content: "";
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border: 3px solid $secondary-color-30;
                            position: absolute;
                            margin: auto;
                            left: 0;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            border-bottom-color: transparent;
                            border-top-color: transparent;
                            animation: spin 2.5s linear infinite;
                        }
                        &::after {
                            content: "";
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border: 3px solid $secondary-color-50;
                            position: absolute;
                            margin: auto;
                            left: 0;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            border-left-color: transparent;
                            border-right-color: transparent;
                            animation: spin 4s ease-out infinite;
                        }
                    }
                    img {
                        object-fit: contain;
                        width: 100%;
                        height: 100%;
                        aspect-ratio: 3/4;
                    }
                }
            }

            &.empty {
                background: $secondary-color-10;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                &:is(.food-banners){
                    aspect-ratio: 5/3;
                }
                &:not(.food-banners){
                    aspect-ratio: 3/4;
                }

                &::before {
                    color: $secondary-color-50;
                    content: "no image";
                }
            }
            .banner-thumbnails {
                // visibility: hidden;
                // max-height: 0;
                display: flex;
                gap: 16px;
                padding-inline: 24px;
                width: 100%;
                overflow-x: auto;
                .thumbnail {
                    min-width: 85px;
                    max-width: 85px;
                    border-radius: 5px;
                    border: 1px solid $secondary-color-20;
                    overflow: hidden;
                    cursor: pointer;
                    background: $white;
                    aspect-ratio: 3/4;
                    position: relative;

                    img {
                        object-fit: contain;
                        width: 100%;
                        height: 100%;
                        aspect-ratio: 3/4;
                        mix-blend-mode: multiply;
                    }

                    &.active {
                        border-color: $primary-color-60;
                    }
                }
            }
        }

        .product-wrapper {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .product-content {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding-inline: 20px;
            }
            .product-line-actions {
                width: 100%;
                display: flex;
                justify-content: space-between;
                gap: 12px;
            }
            .size-guide {
                cursor: pointer;
                margin-left: auto;
                height: fit-content;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                font-size: 12px;
                border-radius: 999px;
                border-width: 1px;
                &:hover {
                    background: $secondary-color-20;
                }
            }

            .product-actions {
                width: 100%;
                max-width: 200px;
                padding-block: 24px;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 18px;
                font-weight: bold;
                input {
                    outline: none;
                    border-color: transparent;
                    border-bottom-color: $secondary-color-30;
                    background: $brown-medium;
                    color: $white;
                    max-width: 100px;
                    height: 50px;
                    text-align: center;
                    appearance: textfield;
                    -webkit-appearance: textfield;
                    -moz-appearance: textfield;
                    &::-webkit-outer-spin-button,
                    &::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    &:focus{
                        border-bottom-color: $blue-powder;
                    }
                }

                .product-increment {
                    background: $brown-medium;
                    color: $white;
                    cursor: pointer;
                    outline: none;
                    border: none;
                    border-radius: 50%;
                    min-width: 40px;
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &.disabled {
                        color: $secondary-color-50 !important;
                        pointer-events: none;
                    }
                }
            }
            .product-text-nowrap {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .product-button-group {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
                &:is(.responsive-group){
                    flex-direction: row !important;
                    padding-inline: 20px;
                    left: 0px;
                    right: 0px;
                    position: fixed;
                    bottom: 20px;
                    z-index: 10;
                }
            }
            .product-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                background: $blue-powder;
                color: $brown-dark;
                border: 1px solid transparent;
                width: 100%;
                margin: 0 auto;
                border-radius: 24px;
                font-weight: normal;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                white-space: nowrap;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                height: 42px;
                padding-inline: 32px;
                font-size: 17px;
                line-height: 26px;

                &.disabled {
                    background: $secondary-color-20;
                    color: $secondary-color-50;
                    pointer-events: none;
                }
                &.processing {
                    background: $secondary-color-20;
                    & span {
                        z-index: 3;
                    }
                    &::before {
                        position: absolute;
                        content: "";
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 24px;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        transition: all 1s;
                        -webkit-transition: all 1s;
                        animation: processingElem 1s ease-in-out infinite;
                        -webkit-animation: processingElem 1s ease-in-out infinite;
                        z-index: 1;
                    }
                    &::after {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                        content: "";
                        z-index: 2;
                        background: linear-gradient(90deg, $secondary-color-20, transparent);
                    }
                }
                
                &.dark {
                    border-color: $blue-powder;
                    color: $blue-powder;
                    background: $secondary-color-80;
                }

                &.lite {
                    border-color: $primary-color-20;
                    background: $white;
                    color: $secondary-color-90;
                }

                .favorite {
                    &.active {
                        color: $primary-color-60;
                    }
                }
            }
        }
        .product-accordion {
            padding: 0 24px;
            &.desktop {
                display: none;
            }

            .accordion-content {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 16px;
                color: $white;

                .stock-item {
                    width: 100%;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    & + .stock-item {
                        padding-top: 24px;
                        border-top: 1px solid $secondary-color-20;
                    }

                    .stock-icon {
                        color: $white;
                        padding-top: 12px;
                        display: block;
                    }
                    .stock-elem {
                        display: flex;
                        flex-direction: column;
                        flex: 3;
                        gap: 6px;
                        .stock-elem-actions {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            gap: 16px;
                        }

                        .elem-label {
                            color: $white;
                        }
                        .elem-location {
                            color: $blue-powder;
                            font-weight: normal;
                            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .stock-wrapper {
                            display: flex;
                            align-items: center;
                            flex-wrap: wrap;
                            gap: 6px;
                            font-size: 1em;
                        }
                    }
                    .stock-button {
                        color: $white;
                        white-space: nowrap;
                        font-weight: normal;
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                        cursor: pointer;
                        font-size: 17px;
                        line-height: 26px;

                        &.disabled {
                            pointer-events: none;
                        }
                        &:not(.disabled):hover {
                            color: $blue-powder;
                        }
                    }
                }
            }
        }
        .product-food-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding-inline: 20px;
            button {
                border: none;
                outline: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                white-space: nowrap;
                border-radius: 999px;
                background: $blue-powder;
                border: 1px solid transparent;
                color: $brown-dark;
                padding: 8px 32px;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                &:hover {
                    background: $primary-color-80;
                }
                &:is(.light){
                    border-color: $blue-powder;
                    background: transparent;
                    color: $white;
                    &:hover {
                        opacity: 0.7;
                    }
                }
                &:is(.left){
                    grid-row-start: 2;
                }
                &:is(.right){
                    grid-row-start: 2;
                }
                &:is(.middle){
                    grid-column-end: 3;
                    grid-column-start: 1;
                }
                &.processing {
                    position: relative;
                    background: transparent;
                    overflow: hidden;
                    border-color: transparent;
                    & span {
                        z-index: 3;
                    }
                    &::before {
                        position: absolute;
                        content: "";
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 999px;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        transition: all 1s;
                        -webkit-transition: all 1s;
                        animation: processingElem 1s ease-in-out infinite;
                        -webkit-animation: processingElem 1s ease-in-out infinite;
                        z-index: 1;
                    }
                    &::after {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                        content: "";
                        z-index: 2;
                        border-radius: 999px;
                        background: linear-gradient(90deg, $secondary-color-20, transparent);
                    }
                }
            }
            &:is(.desktop){
                button {
                    &:is(.middle){
                        display: none;
                    }
                }
            }
            &:is(.mobile){
                position: fixed;
                bottom: 20px;
            }
        }
        .product-incrementor {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            text-align: center;
            input {
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                max-width: 50px;
                padding: 3px 4px;
                text-align: center;
                appearance: textfield;
                -moz-appearance: textfield;
                border: none;
                outline: none;
                background: transparent;
                color: $white;
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            }
            button {
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                cursor: pointer;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
                max-width: 40px;
                aspect-ratio: 1/1;
                border-radius: 50%;
                background: transparent;
                color: $white;
            }
        }
        .food-addons-content {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 20px;
            border-radius: 20px;
            border: 1px solid $blue-powder;
            height: 100%;
            width: 100%;
            max-width: calc(100% - 40px);
            margin-inline: auto;
            max-height: 500px;
            overflow: hidden;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: $blue-powder #f1f1f1;
            &::-webkit-scrollbar {
                width: 10px !important;
            }
            &::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 5px;
            }
            &::-webkit-scrollbar-thumb {
                background: $blue-powder;
                border-radius: 5px;
            }
            &::-webkit-scrollbar-thumb:hover {
                background: darken($blue-powder, 10%);
            }
            .food-name {
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                color: $white;
            }
        }
    }
    @keyframes cartAnim {
        from {
            opacity: 1;
            top: 250px;
        }
        to {
            opacity: 0;
        }
    }
    @media (min-width: 672px) {
        .product-breadcrumbs {
            padding-inline: 4%;
        }
        .product-food-actions {
            display: flex !important;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            padding-inline: 0px;
            &:is(.mobile){
                display: none;
                button {
                    &:is(.middle){
                        display: none;
                    }
                }
            }
            &:is(.desktop) {
                button {
                    &:is(.middle){
                        display: flex !important;
                    }
                }
            }
        }
        .food-addons-content {
            max-width: 100% !important;
        }
        .product-header {
            margin-top: 24px;
            padding: 16px 7% !important;
            padding-bottom: 0;
            text-align: left;
        }
        .product-accordion {
            padding-inline: 0 !important;
            &.mobile {
                display: none;
            }
            &.desktop {
                display: block !important;
                border-top: 1px solid $secondary-color-10;
            }
        }
        .product-info {
            &.mobile {
                display: none;
                padding: 0 !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden;
            }
            &.desktop {
                display: flex !important;
                flex-direction: column;
                padding-inline:  0 !important;
            }
        }
        .product-more {
            gap: 24px;
        }
		.product-container {
            padding-inline: 4%;
            display: grid !important;
            grid-template-columns: 50% 50%;

            .product-banners {
                flex: 3;
                display: flex;
                flex-direction: row-reverse;
                gap: 16px;
                
                .banner-carousel {
                    border: 1px solid $secondary-color-20;
                    border-radius: 8px;
                    overflow: hidden;
                    flex: 6;

                    img {
                        width: 100%;
                        object-fit: contain;
                    }
                }
                .banners-desktop {
                    width: 100%;
                    height: 100%;
                }
                .banner-thumbnails {
                    visibility: visible !important;
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    flex: 1;
                    height: fit-content;
                    max-height: 100% !important;

                    .thumbnail {
                        width: 100%;
                        min-width: 65px !important;
                        max-width: 65px !important;
                        border-radius: 5px;
                        border: 1px solid $secondary-color-20;
                        overflow: hidden;
                        cursor: pointer;
                        background: $white;
                        aspect-ratio: 3/4;
                        position: relative;

                        img {
                            object-fit: contain;
                            width: 100%;
                            height: 100%;
                            aspect-ratio: 3/4;
                            mix-blend-mode: multiply;
                        }
                    }
                }
            }
            .product-wrapper {
                flex: 2;

                &.empty-image {
                    flex-direction: column;
                    gap: 48px;
                    .product-info {
                        padding: 0 !important;
                    }
                    .accordion {
                        padding: 0 !important;
                    }
                }
            }
            .product-button-group {
                flex-direction: row;
                justify-content: space-between;
                gap: 24px !important;
                .product-button {
                    flex: 1;
                }
                &:is(.responsive-group){
                    flex-direction: row !important;
                    padding-inline: 0 !important;
                    position: static !important;
                }
            }
            .product-content {
                padding-inline: 0 !important;
            }
		}
	}
    @media(min-width: 768px) and (max-width: 1180px){
        .product-food-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            padding-inline: 20px !important;
        }
        .food-addons-content {
            max-width: calc(100% - 40px) !important;
        }
    }

    .arrow {
        color: $primary-color-60;
    }
    .product-form-input {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;

        .input-label {
            font-family: 'Berthold Akzidenz Grotesk Regular', sans-serif;
            font-weight: normal !important;
        }

        & + * {
            padding-top: 24px;
        }
    }
    .modifier-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 10px;
        .modifier-radio {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 10px;
            position: relative;
            cursor: pointer;
            width: fit-content;
            &::before {
                content: "radio_button_unchecked";
				color: $secondary-color-30;
				width: 25px;
				height: 25px;
				border-radius: 4px;
				background: transparent;
				font-family: 'Material Icons Outlined';
				font-weight: normal;
				font-style: normal;
				font-size: 28px;
				letter-spacing: normal;
				text-transform: none;
				display: inline-block;
				white-space: nowrap;
				word-wrap: normal;
				direction: ltr;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
            }

            &:is(.checked)::before {
                content: "radio_button_checked";
                color: $blue-powder;
            }

            &:is(.multiple-selection) {
                &:before {
                    content: "check_box_outline_blank" !important;
                }
                &:is(.checked)::before{
                    content: "check_box" !important;
                }
            }
        }

        .modifier-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;

            .modifier-selections {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;

                .modifier-increment {
                    font-size: 0.8em;
                    border: 1px solid $secondary-color-60;
                    padding: 4px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            }
        }
    }
    .total-price {
        border-top: 1px solid $secondary-color-10;
        width: 100%;
        font-family: 'Berthold Akzidenz Grotesk Medium';
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
        padding-top: 24px;
    }
    .inventory-con {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 24px;
        text-align: left;

        .inventory-item {
            width: 100%;
            display: flex;
            gap: 24px;
            align-items: center;
            & + .inventory-item {
                padding-top: 24px;
                border-top: 1px solid $secondary-color-20;
            }
        }
        .inventory-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 6px;

            .inventory-store {
                color: $dark-color-1;
                font-weight: bold;
            }
            .inventory-address {
                color: $dark-color-3;
                font-size: 15px;
                line-height: 22px;
            }
            .inventory-desc {
                width: 100%;
                display: flex;
                gap: 8px;
                align-items: center;
                color: $secondary-color-70;
                .material-icons,
                .material-icons-outlined {
                    font-size: 1em;
                }
            }
            .inventory-info {
                padding: 4px 8px;
                background: $success-green;
                color: $white;
                border-radius: 8px;
                width: fit-content;

                &.disabled {
                    background: $secondary-color-30;
                    color: secondary-color-50;
                }
            }
        }
        .inventory-icon {
            cursor: pointer;
            color: $secondary-color-50;

            &.active {
                color: $primary-color-60;
            }
        }
    }
    .btn-groups {
        width: 100%;
        display: flex;
        gap: 24px;
        align-items: center;
        justify-content: space-between;

        .btn {
            padding: 12px 32px;
            text-align: center;
            background: $primary-color-60;
            cursor: pointer;
            border-radius: 12px;
            color: $white;

            &.lite {
                background: $white;
                color: $primary-color-60;
                border: 1px solid $primary-color-60;
            }
        }
    }
    .modal-footer {
        border-top: 1px solid $secondary-color-10;
    }
</style>
