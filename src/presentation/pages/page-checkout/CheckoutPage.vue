<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:body>
            <div class="main-body">
                <div class="cart-items-wrapper">
                    <h1>
                        <span class="material-icons" @click="stepBack()">arrow_back</span>
                        Checkout
                    </h1>
                    <div class="cart-items" v-for="(one, num) in outletsCart" :key="one.id">
                        <div class="cart-items-outlet-header">
                            <div class="cart-items-outlet"> 
                                <span class="outlet-index" v-if="outletsCart.length > 1">Order {{ num + 1 }}</span>
                                <span class="outlet-name">{{ one.name }}</span>
                            </div>
                            <div class="shipping-info" v-if="one.enableOmisellIntegration">
                                <span class="shipping-label">Sold and ship by </span>
                                <span class="shipping-name">{{ one.name }}</span>
                            </div>
                        </div>
                        <div class="cart-item" v-for="(cart, i) in one.carts" :key="i">
                            <div class="cart-wrapper">
                                <div class="cart-product"
                                    :class="{'no-image': !getDisplayImage(cart)}">
                                    <img v-if="getDisplayImage(cart)" :src="getDisplayImage(cart)"/>
                                </div>
                                <div class="cart-info">
                                    <div class="cart-category">{{ brandNames(cart) }}</div>
                                    <div class="cart-name">{{ cart.product.name }}</div>
                                    <div class="cart-modifiers" v-if="hasVariant(cart) || hasModifiers(cart)">
                                        <span v-if="hasVariant(cart)">{{ getVariant(cart) }}</span>
                                        <span :class="{'separator': hasVariant(cart) && hasModifiers(cart)}"></span>
                                        <span>{{ getModifiers(cart) }}</span>
                                    </div>
                                    <div class="product-price-con">
                                        <span>x{{ cart.quantity }}</span>
                                        <div class="product-price-wrapper">
                                            <div class="original-price" v-if="hasPromoPrice(cart)">{{ hasPromoPrice(cart) }}</div>
                                            <div class="cart-price">{{ cart.freeProduct ? 'Free item' : currency(cart.accPrice) }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="cart-items-outlet-footer">
                            <div class="outlet-footer-item">
                                <span>{{ one.carts.length }} items</span>
                                <span>Sub Total: <b>{{ currency(one.subTotal) }}</b></span>
                            </div>
                            <div class="outlet-footer-item" v-for="(dc, ix) in one.voucherDiscounts" :key="ix">
                                <span>{{ dc && !dc.promotion && !dc.voucher ? 'Points' : dc.reason }}</span>
                                <span>
                                    <b>-{{ currency(dc.amount) }}</b>
                                </span>
                            </div>
                            <div class="outlet-footer-item" v-for="(dc, ix) in one.promoDiscounts" :key="ix">
                                <span>{{ dc && !dc.discount && !dc.discount.promotion && !dc.discount.voucher ? 'Points' : dc.discount.reason }}</span>
                                <span>
                                    <b>-{{ currency(dc.discount.amount) }}</b>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="checkout-box">
                    <widget-fulfillment-display v-if="isEmpty(booking)" @change-address="changeAddress"/>
                    <div class="payment-container">
                        <div class="widgets" v-if="totalAmount > 0">
                            <widget-promo-code
                                @emit-promocode="emitPromoCode" 
                                :is-event="!isEmpty(booking)"
                            />
                            <widget-voucher ref="voucherWidget"
                                :is-event="!isEmpty(booking)"
                                @select-voucher="showVouchers"
                                @on-apply-voucher="onApplyVoucher"
                            />
                        </div>
                        <div class="payment-header" v-if="totalAmount > 0">Pay With</div>
                        <div class="payment-body">
                            <div class="radio-list" v-if="totalAmount > 0">
                                <div class="radio has-logo" @click="resetTokenizedCards"
                                    v-for="pm in paymentAccounts" :key="pm.key">
                                    <input name="paymentAccount" type="radio" 
                                        :checked="pm.clicked == true" 
                                        :data-key="pm.key"
                                    >
                                    <span class="radio-logo" v-if="pm.logo">
                                        <img :src="pm.logo" :alt="pm.displayName"/>
                                    </span>
                                    <div class="radio-label">
                                        <span class="title">
                                            {{ pm.displayName }}<br>
                                            <span class="sub-title">{{ pm.displayTitle }}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="tokenized-cards" v-if="tokenizedCards?.length > 0">
                                    <span class="tokenized-cards-label">Saved Cards</span>
                                    <div :class="['card-token', {'active': card.id == selectedCardToken?.id}]" 
                                        v-for="card in tokenizedCards" :key="card.id">
                                        <div class="card-info">
                                            <i class="card-wallet material-icons-outlined">account_balance_wallet</i>
                                            <div class="card-wrapper">
                                                <span class="card-number">**** **** **** {{ card.maskedAccountNumber }}</span>
                                                <span class="card-type">{{ card.cardType || 'Unknown' }}</span>
                                            </div>
                                        </div>
                                        <span @click="clickCardToken(card)" class="card-action material-icons-outlined">{{ card.id == selectedCardToken?.id ? "radio_button_checked" : "radio_button_unchecked" }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="radio-list" v-else>
                                <div class="radio has-logo">
                                    <input name="paymentAccount" type="radio" 
                                        checked="true" 
                                        data-key="zero"
                                    >
                                    <span class="radio-logo material-icons-outlined">account_balance_wallet</span>
                                    <div class="radio-label">
                                        <span class="title">
                                            Zero Payment<br/>
                                            <span class="sub-title">No payment needed</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="customer-details" v-if="isGuestCustomer()">
                                <div class="customer-item">
                                    <div class="customer-item-label">First Name</div>
                                    <div class="customer-item-input">
                                        <input type="text" v-model="firstName"/>
                                    </div>
                                </div>
                                <div class="customer-item">
                                    <div class="customer-item-label">Last Name</div>
                                    <div class="customer-item-input">
                                        <input type="text" v-model="lastName"/>
                                    </div>
                                </div>
                                <div class="customer-item">
                                    <div class="customer-item-label">Email Address</div>
                                    <div class="customer-item-input">
                                        <input type="email" v-model="email"/>
                                    </div>
                                </div>
                                <div class="customer-item">
                                    <div class="customer-item-label">Phone</div>
                                    <div class="customer-item-input">
                                        <input type="text" v-model="phone"/>
                                    </div>
                                </div>
                            </div>
                            <small v-if="totalAmount > 0">Select ‘Place Order’ after you finish selecting the payment options</small>
                        </div>
                    </div>
                    <div class="cart-sum">
                        <div class="cart-sum-header">Payment Summary</div>
                        <div class="cart-sum-body">
                            <div class="cart-sum-item">
                                <div class="cart-sum-item-label">Subtotal</div>
                                <div class="cart-sum-item-label">{{ subTotalDisplay }}</div>
                            </div>
                            <div class="booking-extracharge-item" v-for="(extra, n) in groupedBookingExtracharges" :key="n">
                                <div class="extracharge-head retain-text font-bold" v-html="extra.parentName"></div>
                                <div class="extracharge-body">
                                    <div class="extracharge-title">{{ extra.qty }}x <span class="retain-text" v-html="extra.value"></span></div>
                                    <div class="extracharge-amount">{{ currency(extra.cost) }}</div>
                                </div>
                            </div>
                            <div class="cart-sum-item" v-for="(disc, x) in (!isEmpty(booking) ? booking.discounts : [])" :key="x">
                                <div class="cart-sum-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                                <div class="cart-sum-disc-label nowrap">
                                    <span>-{{ currency(disc.amount) }}</span>
                                    <span class="cart-sum-disc-action" @click="removeDiscount(disc)">Remove</span>
                                </div>
                            </div>
                            <div class="cart-sum-item" v-for="(extra, x) in extraCharges" :key="x">
                                <div class="cart-sum-item-label">{{ extra.name }} {{ extra.percentage ? '(' + extra.percentage + '%)' : '' }}</div>
                                <div class="cart-sum-item-label">{{ currency(extra.amount) }}</div>
                            </div>
                            <div class="cart-sum-item" v-for="(extra, x) in groupedOutletExtraCharges" :key="x">
                                <div class="cart-sum-item-label">{{ extra.name }} {{ extra.percentage ? '(' + extra.percentage + '%)' : '' }}</div>
                                <div class="cart-sum-item-label">{{ currency(extra.amount) }}</div>
                            </div>
                            <div class="cart-sum-item" v-for="(disc, x) in groupedDiscounts" :key="x">
                                <div class="cart-sum-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                                <div class="cart-sum-disc-label nowrap">
                                    <span>-{{ currency(disc.amount) }}</span>
                                    <span 
                                        v-if="removingDiscount && removingDiscount == disc.voucher" 
                                        class="cart-sum-disc-action"><i class="material-icons-outlined spinning">data_saver_off</i></span>
                                    <span v-else class="cart-sum-disc-action" @click="removeDiscount(disc)">Remove</span>
                                </div>
                            </div>
                            <div class="cart-sum-item" v-for="(disc, x) in groupedDiscountsPerBrand" :key="x">
                                <div class="cart-sum-disc-label">{{ disc && !disc.discount && !disc.discount.promotion && !disc.discount.voucher ? 'Points' : disc.discount.reason }}</div>
                                <div class="cart-sum-disc-label nowrap">
                                    <span>-{{ currency(disc.discount.amount) }}</span>
                                    <span 
                                        v-if="removingDiscount && removingDiscount == disc.discount.reason" 
                                        class="cart-sum-disc-action"><i class="material-icons-outlined spinning">data_saver_off</i></span>
                                    <span v-else class="cart-sum-disc-action" @click="removeDiscount(disc.discount)">Remove</span>
                                </div>
                            </div>
                            <div class="cart-sum-item" v-for="(extra, x) in groupedDeliveryCharges" :key="x">
                                <div class="cart-sum-item-label">{{ extra.name }} {{ extra.percentage ? '(' + extra.percentage + '%)' : '' }}</div>
                                <div class="cart-sum-item-label">{{ currency(extra.amount) }}</div>
                            </div>
                            <div class="cart-sum-item" v-for="(disc, x) in groupedDeliveryDiscounts" :key="x">
                                <div class="cart-sum-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                                <div class="cart-sum-disc-label nowrap">
                                    <span>-{{ currency(disc.amount) }}</span>
                                    <span 
                                        v-if="removingDiscount && removingDiscount == disc.voucher" 
                                        class="cart-sum-disc-action"><i class="material-icons-outlined spinning">data_saver_off</i></span>
                                    <span v-else class="cart-sum-disc-action" @click="removeDiscount(disc)">Remove</span>
                                </div>
                            </div>
                            <div class="cart-sum-item" v-for="(disc, x) in groupedDeliveryDiscountsPerBrand" :key="x">
                                <div class="cart-sum-disc-label">{{ disc && !disc.discount && !disc.discount.promotion && !disc.discount.voucher ? 'Points' : disc.discount.reason }}</div>
                                <div class="cart-sum-disc-label nowrap">
                                    <span>-{{ currency(disc.discount.amount) }}</span>
                                    <span 
                                        v-if="removingDiscount && removingDiscount == disc.discount.reason" 
                                        class="cart-sum-disc-action"><i class="material-icons-outlined spinning">data_saver_off</i></span>
                                    <span v-else class="cart-sum-disc-action" @click="removeDiscount(disc.discount)">Remove</span>
                                </div>
                            </div>
                            <div class="cart-sum-item bold total">
                                <div class="cart-sum-item-label">Total</div>
                                <div class="cart-sum-item-label">{{ totalDisplay }}</div>
                            </div>
                            <div class="checkbox-custom" @click="toggleAgree()">
                                <span class="checkbox-icon material-icons-outlined" :class="{'checked': agreement}">
                                    {{ agreement ? 'check_box' : 'check_box_outline_blank' }}
                                </span>
                                <span class="checkbox-label" style="white-space:nowrap;">
                                    I accept the <a :href="tncLink" target="_blank" class="link no-underlined">R.O.X Community Terms of Service</a>
                                </span>
                            </div>
                            <div class="checkbox-custom" @click="toggleAgree2()" v-if="totalAmount > 0">
                                <span class="checkbox-icon material-icons-outlined" :class="{'checked': agreement2}">
                                    {{ agreement2 ? 'check_box' : 'check_box_outline_blank' }}
                                </span>
                                <span class="checkbox-label" style="white-space:nowrap;">
                                    I agree to a separate payment for each order in this checkout.
                                </span>
                            </div>
                        </div>
                        <div class="cart-sum-footer">
                            <div  v-if="!isEmpty(booking) || !isEmpty(order)"
                                :class="['checkout-btn', {'disabled' : !agreement || (!agreement2 && totalAmount > 0), 'processing disabled': isPlaceOrder}]" 
                                @click="placeOrder()"
                            >Place {{ !isEmpty(booking) ? 'Ticket' : 'Order' }}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <base-modal :show="isOpenIframe">
                <template v-slot:header>
                    <div class="modal-header header-flex justify-between">
                        <h3>
                            <img :src="require('@/assets/images/maya-logo.svg')" alt="Paymaya Vault"/>
                            <span id="paymaya-title">Paymaya</span>
                        </h3>
                        <span class="material-icons-outlined close-btn" @click="toggleMayaModal(false)">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div v-if="isPlaceOrder">
                            <span class="material-icons-outlined spinning">refresh</span>
                        </div>
                        <div id="iframe-paymaya" v-else></div>
                    </div>
                </template>
            </base-modal>
            
            <base-modal :show="tryAgain">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="material-icons-outlined" @click="toggleTryAgain()">close</span>
                        <h3>Information</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <p>An error has occured while submitting your order.</p>
                        <p>Would you like to try again?</p>
                    </div>
                    <div class="modal-footer">
                        <div class="actions">
                            <div class="action-button light" @click="toggleTryAgain()">No</div>
                            <div class="action-button" @click="checkBookingStatus()">Yes</div>
                        </div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="showZeroPayment">
                <template v-slot:body>
                    <div class="modal-body">
                        <p>Please confirm if you wish to place this order.</p>
                    </div>
                    <div class="modal-footer">
                        <div class="actions">
                            <div class="action-button light" @click="showZeroPayment = false">No</div>
                            <div class="action-button" @click="checkBookingStatus()">Yes</div>
                        </div>
                    </div>
                </template>
            </base-modal>
		</template>
	</layout-variant-two>
</template>

<script>
import { productService, eventService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import WidgetFulfillmentDisplay from "@/components/widgets/WidgetFulfillmentDisplay.vue";
import WidgetPromoCode from "@/components/widgets/WidgetPromoCode.vue";
import WidgetVoucher from "@/components/widgets/WidgetVoucher.vue";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
import { postOutletOrder } from "@/connector/v4/productConnector";
import { getEunoiaCustomerDetails } from "@/connector/v4/customerConnector";
import paymayaSdkClient from "paymaya-js-sdk";

export default {
	name: "CheckoutPage",
	mixins: [utility],
	components: {
        LayoutVariantTwo,
        WidgetVoucher,
        WidgetPromoCode,
        WidgetFulfillmentDisplay,
	},
	data() {
		return {
			loading: false,
            booking: null,
            order: null,
            paymentAccounts: [],
            cartId: "",
            payment: null,
            tryAgain: false,
            agreement: false,
            agreement2: false,
            paymayaRedirectParams: null,
            customerDetails: {},
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            isPlaceOrder: false,
            showZeroPayment: false,
            carts: [],
            promoCode: "",
            processing: false,
            useCartId: false,
            billingFirstName: "",
            billingLastName: "",
            billingEmailAddress: "",
            billingPhone: "",
            removingDiscount: "",
            isOpenIframe: false,
            tokenizedCards: []
		};
	},
	watch: {},
    computed: {
        selectedCardToken(){
            if(isEmpty(this.tokenizedCards)) return;
            return this.tokenizedCards.find((card) => card.selected);
        },
        allowedPaymentTypes() {
            return this.$store.getters.getAllowedPaymentTypes;
        },
        tncLink(){
            let url = window.location.origin;
            return `${url}/faq`;
        },
        totalAmount(){
            let amount = 0;
            if(!isEmpty(this.booking)) {
                amount = this.booking.total;
            }
            if(!isEmpty(this.order)) {
                for(let k in this.order){
                    amount += this.order[k].total;
                }
            }
            return amount;
        },
        totalDisplay(){
            return this.currency(this.totalAmount);
        },
        subTotal(){
            if (this.booking) {
                return this.booking.selectedSession.price;
            }
            let orderRequest = this.$store.getters.getOrderRequest;
            if (isEmpty(orderRequest)) return 0;
            let subTotal = 0;
            for(let k in orderRequest){
                subTotal += orderRequest[k].subTotal;
            }
            return subTotal;
        },
        subTotalDisplay() {
            let amount = this.subTotal;
            if (this.booking) {
                amount = this.booking.selectedSession.price * this.booking.quantity;
            }
            if (amount > 0) return this.currency(amount);
            return 0;
        },
        extraCharges(){
            let parent = this.$store.getters.getExtraCharges || {};
            let items = [];
            for(let k in parent) items = [...items, ...parent[k]];
            return items;
        },
        outletExtraCharges(){
            let parent = this.$store.getters.getOutletExtraCharges || {};
            let items = [];
            for(let k in parent) items = [...items, ...parent[k]];
            return items;
        },
        discounts(){
            let parent = this.$store.getters.getDiscounts || {};
            let items = [];
            for(let k in parent) items = [...items, ...parent[k]];
            return items;
        },
        discountPerBrand(){
            let parent = this.$store.getters.getDiscountPerBrand || {};
            let items = [];
            for(let k in parent) items = [...items, ...parent[k]];
            return items;
        },
        groupedDiscounts(){
            return this.getGroupedDiscounts(false);
        },
        groupedDeliveryDiscounts(){
            return this.getGroupedDiscounts(true);
        },
        groupedDiscountsPerBrand(){
            return this.getGroupedDiscountsPerBrand(false);
        },
        groupedDeliveryDiscountsPerBrand(){
            return this.getGroupedDiscountsPerBrand(true);
        },
        groupedBookingExtracharges() {
            if (isEmpty(this.booking)) return [];
            if (isEmpty(this.booking.extraCharges)) return [];
            let extras = [];
            this.booking.extraCharges.forEach((it) => {
                let item = {
                    parentName: it.parent.name,
                    value: it.value,
                    qty: 1,
                    cost: it.cost,
                }
                let idx = extras.findIndex((x) => {
                    return x.parentName == item.parentName && x.value == item.value;
                });
                if (idx > -1) {
                    extras[idx].qty++;
                    extras[idx].cost += item.cost;
                } else {
                    extras.push(item);
                }
            });
            return extras;
        },
        groupedOutletExtraCharges(){
            return this.getGroupedOutletExtraCharges(false);
        },
        groupedDeliveryCharges(){
            return this.getGroupedOutletExtraCharges(true);
        },
        outletsCart() {
            let carts = JSON.parse(JSON.stringify(this.carts));
            let outlets = [];
            if (isEmpty(carts)) return [];
            let voucherDiscounts = this.$store.getters.getDiscounts || {};
            let promoDiscounts = this.$store.getters.getDiscountPerBrand || {};
            for(let i =0; i < carts.length; i++) {
                let cart = carts[i];
                if(!cart.checked) continue;
                let one = outlets.findIndex((o) => o.id == cart.outletStore.id);
                let oneCart = JSON.parse(JSON.stringify(cart));
                let discounts = [];
                let vouchers = [];
                if(!isEmpty(promoDiscounts)){
                    discounts = promoDiscounts[cart.outletStore.apiCode] || [];
                }
                if(!isEmpty(voucherDiscounts)){
                    vouchers = voucherDiscounts[cart.outletStore.apiCode] || []
                }
                delete oneCart.outletStore;
                if (one > -1) {
                    outlets[one].carts.push(oneCart);
                    outlets[one].subTotal += parseFloat(oneCart.accPrice);
                } else {
                    outlets.push({
                        ...cart.outletStore,
                        carts: [oneCart],
                        subTotal: oneCart.accPrice,
                        promoDiscounts: discounts,
                        voucherDiscounts: vouchers
                    })
                }
            }
            return outlets;
        },
        isMultipleOutletsOrder() {
            return this.outletsCart.length > 1;
        }
    },
    methods: {
        resetTokenizedCards(){
            if(isEmpty(this.tokenizedCards)) return;
            let cards = JSON.parse(JSON.stringify(this.tokenizedCards));
            this.tokenizedCards = cards.map((it) => ({
                ...it,
                selected: false
            }));
        },
        clickCardToken(card){
            if(!card) return;
            let cards = JSON.parse(JSON.stringify(this.tokenizedCards));
            this.tokenizedCards = cards.map((it) => ({
                ...it,
                selected: card.id == it.id
            }));
            let accounts = JSON.parse(JSON.stringify(this.paymentAccounts));
            this.paymentAccounts = accounts.map((acc) => ({...acc, clicked: false}));
            document
            .querySelectorAll("input[name='paymentAccount']")
            .forEach(r => (r.checked = false));
        },
        getGroupedDiscounts(isDelivery){
            let discs = !isEmpty(this.discounts) ? JSON.parse(JSON.stringify(this.discounts)) : [];
            let groups = [];
            for(let i = 0; i < discs.length; i++){
                let disc = discs[i];
                let ix = groups.findIndex((it) => it.reason == disc.reason);
                if(ix > -1) {
                    groups[ix].amount += parseFloat(disc.amount)
                } else {
                    groups.push(disc);
                }
            }
            if(isDelivery) return groups.filter((g) => g.discountOnDelivery);
            return groups.filter((g) => !g.discountOnDelivery);
        },
        getGroupedDiscountsPerBrand(isDelivery){
            let discs = !isEmpty(this.discountPerBrand) ? JSON.parse(JSON.stringify(this.discountPerBrand)) : [];
            let groups = [];
            for(let i = 0; i < discs.length; i++){
                let disc = discs[i];
                let ix = groups.findIndex((it) => it.discount?.reason == disc.discount?.reason);
                if(ix > -1) {
                    groups[ix].discount.amount += parseFloat(disc.discount.amount)
                } else {
                    groups.push(disc);
                }
            }
            if(isDelivery) return groups.filter((g) => g.discount.discountOnDelivery);
            return groups.filter((g) => !g.discount.discountOnDelivery);
        },
        getGroupedOutletExtraCharges(isDeliveryCharge) {
            let charges = this.outletExtraCharges;
            if (isEmpty(charges)) return [];
            if(isDeliveryCharge){
                charges = charges.filter((c) => c.extraCharges.type == "DELIVERY_CHARGE")
            } else {
                charges = charges.filter((c) => c.extraCharges.type != "DELIVERY_CHARGE")
            }
            let extras = [];
            for(let i = 0; i < charges.length; i++){
                let it = charges[i];
                let item = { ...it.extraCharges, ...{ qty: 1 } };
                let idx = extras.findIndex((x) => {
                    return x.percentage == item.percentage && x.type == item.type && x.name == item.name && x.inclusive == item.inclusive;
                });
                if (idx > -1) {
                    extras[idx].qty++;
                    extras[idx].amount += item.amount;
                } else {
                    extras.push(item);
                }
            }
            return extras;
        },
        toggleParticipantCollapse(i) {
            this.booking.participants[i].collapsed = !this.booking.participants[i].collapsed;
        },
        validateBillingInfo() {
            if (!this.billingFirstName) {
                this.showNotification("alert", "error_outline", "Please fill in the first name in the billing details");
                return false;
            }
            if (!this.billingLastName) {
                this.showNotification("alert", "error_outline", "Please fill in the last name in the billing details");
                return false;
            }
            if (!this.isValidEmail(this.billingEmailAddress)) {
                this.showNotification("alert", "error_outline", "Please fill in the valid email address in the billing details");
                return false;
            }
            if (this.billingPhone && !this.isValidPhone(this.billingPhone)) {
                this.showNotification("alert", "error_outline", "Please fill in the valid phone number in the billing details");
                return false;
            }
            return true;
        },
        brandNames(cart) {
            let brands = cart.product.brands?.map((it) => it.name);
            return brands.join(' | ');
        },
        async changeAddress() {
            let self = this;
            let callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : () => { };
            let address = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => null;
            this.$store.dispatch("setDeliveryAddress", address);
            self.processing = true;
            let parent = self.$store.getters.getCarts;
            const remakeCarts = () => {
                let carts = self.$store.getters.getCarts;
                let items = [];
                for(let k in carts){
                    items = [...items, ...carts[k]];
                }
                self.carts = items;
                self.$store.dispatch("setCarts", carts);
            }
            for(let outletCode in parent){
                await this.testOrder(false, function (json) {
                    self.$store.dispatch("setDeliveryAddress", null);
                    self.processing = false;
                    remakeCarts();
                    callback(json);
                }, function (error) {
                    self.processing = false;
                    remakeCarts();
                    self.$store.dispatch("setDeliveryAddress", null);
                    if (error.message) self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
                    callback(error);
                }, false, true, parent[outletCode], outletCode);
            }
        },
        hasVariant(cart){
            return !isEmpty(cart.variant);
        },
        getVariant(cart){
            return cart.variant.name;
        },
        hasModifiers(cart){
            return !isEmpty(cart.modifiers);
        },
        getModifiers(cart){
            let modifiers = [];
            if(!isEmpty(cart.modifiers)){
                cart.modifiers.forEach((mod) => {
                    modifiers.push(`${mod.quantity}x ${mod.name}`);
                });
            }
            return modifiers.join(', ');
        },
        getDisplayImage(cart) {
            return this.getCartImage(cart);
        },
        toggleAgree(){
            this.agreement = !this.agreement;
        },
        toggleAgree2(){
            this.agreement2 = !this.agreement2;
        },
        toggleTryAgain(){
            this.tryAgain = !this.tryAgain;
            /*if (!this.tryAgain && this.isMultipleOutletsOrder) {
                this.executeMultipleOutletOrders();
            }*/
        },
		randomString: function(max) {
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			const charsLength = chars.length;

			let result = "";

			for(let i = 0; i < (max || 32); ++i) {
				result += chars.charAt(Math.floor(Math.random() * charsLength));
			}

			return result;
		},
        randomNumber: function(max) {
			const chars = "0123456789";
			const charsLength = chars.length;

			let result = "";

			for(let i = 0; i < (max || 32); ++i) {
				result += chars.charAt(Math.floor(Math.random() * charsLength));
			}

			return result;
		},
        async checkout(){
            let test = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
			let callbackSuccess = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { };
			let skipToken = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            
            let customer = this.booking.customer;
            if(this.isGuestCustomer()) {
                skipToken = true;
                customer = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    phone: this.phone
                }
                this.booking.customer = customer;
                this.$store.dispatch("clearBooking");
                this.$store.dispatch("addToBooking", this.booking);
            }
            let parentPromoCodes = this.$store.getters.getPromoCodes || {};
            let promoCodes = [];
            for(let k in parentPromoCodes) {
                promoCodes = Array.from(new Set([...promoCodes, ...parentPromoCodes[k]]))
            };
            let cashVouchers = [];
            let vouchers = [];
            let vcash = this.$store.getters.getAppliedCashVouchers || {};
            for(let k in vcash){
                if(k != "event") continue;
                cashVouchers = [
                    ...cashVouchers, 
                    ...vcash[k].map((it) => {
                        return {
                            number: it.promotion.number,
                            pin: it.promotion.pin,
                        };
                    })
                ];
            }
            let vcs = this.$store.getters.getAppliedVouchers || {};
            for(let k in vcs){
                if(k != "event") continue;
                vouchers = [
                    ...vouchers,
                    ...vcs[k].map((it) => it.id)
                ]
            }
            let params = {
                type: this.booking.type,
                name: this.booking.name,
                payments: [],
                items: [],
				total: this.booking.total,
                promoCodes: promoCodes || [],
                vouchers: vouchers || [],
                cashVouchers: cashVouchers || []
            };

			if(skipToken || !customer.eunoiaAuthToken) {
				params.customer = {
					firstName: customer.firstName,
					lastName: customer.lastName,
					email: customer.email,
					phone: customer.phone
				}
			}
            if(this.payment) params.payments.push(this.payment);
            let item = {
                sessionTimeId: this.booking.sessionTimeId,
                quantity: this.booking.quantity,
				participants: this.booking.participants
            };

            let cartId = this.$store.getters.getCartId;

            params.test = test == true;
            params.draft = test == true;
            params.cartId = cartId;
            if (params.total <= 0) {
                params.draft = false;
                params.cartId = null;
            }
            if(!this.useCartId && !test) {
                params.draft = false;
                params.cartId = null;
                this.$store.dispatch("setCartId", null);
            }
            params.items.push(item);

            if(this.totalAmount <= 0 && !test) {
                params.test = false;
                params.draft = false;
            }
            let res = await eventService.bookEvent(params);
            if (res.cartId) {
                this.cartId = res.cartId;
                this.$store.dispatch("setCartId", res.cartId);
            }
			if(!res.success && res.code && res.code == "-666"){
				customer.eunoiaAuthToken = "";
				this.$store.dispatch('setCustomer', customer);
				this.$store.dispatch('setEunoiaToken', '');
				return this.checkout(test, callbackSuccess, true);
			}
			callbackSuccess(res);
        },
        async checkoutOrder(){
            let self = this;
            let test = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            let callbackSuccess = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { };

            let cartId = self.$store.getters.getCartId;
            let draft = false;
            if(self.isPlaceOrder) draft = true;
            if(this.totalAmount <= 0 && !test) {
                test = false;
                draft = false;
            }
            if(!this.useCartId && !test) {
                draft = false;
                cartId = null;
                this.$store.dispatch("setCartId", null);
            }
            let originalCarts = JSON.parse(JSON.stringify(this.$store.getters.getCarts));
            for(let outletCode in originalCarts){
                self.testOrder(false, (res) => {
                    self.isPlaceOrder = false;
                    if(cartId) self.cartId = cartId;
                    callbackSuccess(res);
                }, (error) => {
                    self.isPlaceOrder = false;
                    callbackSuccess(error);
                }, draft, test, originalCarts[outletCode], outletCode);
            }
        },
        async generateCartId(outlet, carts) {
            let callbackSuccess =
                arguments.length > 2 && arguments[2] !== undefined
                    ? arguments[2]
                    : function () { };
            let callbackError =
                arguments.length > 3 && arguments[3] !== undefined
                    ? arguments[3]
                    : function () { };
            let orderRequest = {
                draft: true,
                test: true,
            };
            let dineType = this.$store.getters.getDineType;
            orderRequest.address = null;
            let address = this.$store.getters.getDeliveryAddress;
            if (dineType == "RETAIL_DELIVERY") {
            // if (outlet.enableOmisellIntegration == true) {
                if (isEmpty(address)) {
                    callbackError({
                        success: false,
                        message: "Delivery address is required!"
                    });
                    return;
                }
                delete address.clicked;
                orderRequest.address = address;
            }
            orderRequest.fulfillmentTime = null;
            orderRequest.type = dineType;
            orderRequest.promoCodes = [];

            let parentPromoCodes = this.$store.getters.getPromoCodes;
            let parentRemovedPromocodes = this.$store.getters.getAutoPromoCodes;
            let promoCodes = [];
            let removedPromocodes = [];
            for(let k in parentPromoCodes){
                if(k == outlet.apiCode) promoCodes = [...promoCodes, ...parentPromoCodes[k]];
            }
            for(let k in parentRemovedPromocodes){
                if(k == outlet.apiCode) removedPromocodes = [...removedPromocodes, ...parentRemovedPromocodes[k]];
            }
            if (removedPromocodes && !isEmpty(promoCodes)) {
                removedPromocodes = removedPromocodes.filter((it) => {
                    return !promoCodes.includes(it);
                });
            }
            let cashVouchers = [];
            let vouchers = [];
            let vcash = this.$store.getters.getAppliedCashVouchers || {};
            if (!isEmpty(vcash[outlet.apiCode])) {
                cashVouchers = [
                    ...cashVouchers, 
                    ...vcash[outlet.apiCode].map((it) => {
                        return {
                            number: it.promotion.number,
                            pin: it.promotion.pin,
                        };
                    })
                ];
            }
            let vcs = this.$store.getters.getAppliedVouchers || {};
            if (!isEmpty(vcs[outlet.apiCode])) {
                vouchers = [
                    ...vouchers,
                    ...vcs[outlet.apiCode].map((it) => it.id)
                ];
            }
            orderRequest.promoCodes = promoCodes;
            orderRequest.cashVouchers = cashVouchers;
            orderRequest.vouchers = vouchers;
            orderRequest.removedPromos = removedPromocodes;
            if (!this.isGuestCustomer()) {
                orderRequest.customer = {
                    firstName: this.order[outlet.apiCode].customer.firstName,
                    lastName: this.order[outlet.apiCode].customer.lastName,
                    email: this.order[outlet.apiCode].customer.email,
                    phone: this.order[outlet.apiCode].customer.phone,
                };
            }
            orderRequest.orders = carts.reduce((arr, cart) => {
                let item = {
                  type: dineType,
                  store: cart.storeId,
                  fulfillmentTime: orderRequest.fulfillmentTime,
                  items: [
                    {
                      specialRequest: cart.specialInstructions,
                      quantity: cart.quantity,
                      product: cart.product.id,
                      modifiers: cart.modifiers,
                      variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                      storeName: cart.storeName,
                      freeProduct: cart.freeProduct,
                    },
                  ],
                }
                let idx = arr.findIndex((it) => it.store == cart.storeId);
                if (idx > -1) {
                    arr[idx].items.push({
                        specialRequest: cart.specialInstructions,
                        quantity: cart.quantity,
                        product: cart.product.id,
                        modifiers: cart.modifiers,
                        variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                        storeName: cart.storeName,
                        freeProduct: cart.freeProduct,
                    });
                } else {
                    arr.push(item);
                }
                return arr;
            }, []);
            let cartTotal = carts.reduce((acc, one) => {
                acc += one.accPrice;
                return acc;
            }, 0);
            orderRequest.total = cartTotal;
            orderRequest.subTotal = cartTotal;
            const res = await postOutletOrder(orderRequest, outlet.apiCode);
            if (res.success) return callbackSuccess(res);
            callbackError(res);
        },
        async prepareMultipleOutletsOrder(pm) {
            let self = this;
            let originalCarts = JSON.parse(JSON.stringify(this.$store.getters.getCarts));
            const restoreCarts = () => {
                let items = [];
                for(let k in originalCarts){
                    items = [...items, ...originalCarts[k]];
                }
                self.carts = items;
                self.$store.dispatch("setCarts", originalCarts);
            }
            try {
                let cartIds = [];
                let errorCarts = [];
                let activeCarts = self.outletsCart.filter((oneOutlet) => {
                    return oneOutlet.carts?.filter((c) => c.checked == true && isEmpty(c.freeProduct)).length > 0;
                });
                if(isEmpty(activeCarts)){
                    self.showNotification("alert", "error_outline", "Cart is empty!");
                    return;
                }
                const executeNow = () => {
                    if (!isEmpty(errorCarts)) {
                        self.loading = false;
                        self.isPlaceOrder = false;
                        if(!isEmpty(cartIds) && !self.useCartId){
                            let done = cartIds.filter((cid) => cid.orderNumber != "");
                            let numbers = done.map((cid) => cid.orderNumber);
                            let undone = errorCarts.map((ec) => ec.outlet.name);
                            let outletNames = undone.join(" & ");
                            self.showNotification("alert", "error_outline", "Unable to process order from " + (undone.length > 1 ? "these outlets: " : "this outlet: ") + outletNames);
                            return self.goToWithParams("OrderSummary", {
                                number: numbers.join('-')
                            });
                        }
                        self.showNotification("alert", "error_outline", "Something went wrong! " + errorCarts[0].error.message);
                        return;
                    }
                    if (isEmpty(cartIds)) {
                        self.loading = false;
                        self.isPlaceOrder = false;
                        restoreCarts();
                        self.showNotification("alert", "error_outline", "Unable to proceed your orders. Please try again");
                        return;
                    }
                    let finalCartIds = cartIds.map((c, ix) => {
                        if (ix == 0 && pm.type == "PAYMAYA") c.executed = true;
                        return c;
                    });
                    if (!this.useCartId) {
                        let numbers = cartIds.map((cid) => cid.orderNumber);
                        return this.goToWithParams("OrderSummary", {
                            number: numbers.join('-')
                        });
                    }
                    if(pm.type == "PAYMAYA"){
                        localStorage.setItem("cartIds", JSON.stringify(finalCartIds));
                        localStorage.setItem("errorCarts", JSON.stringify(errorCarts));
                        window.location.href = cartIds[0].paymentLink;
                    } else {
                        this.handleMayaVault(pm, "order", finalCartIds, errorCarts, 0);
                    }
                }
                const preparePaymaya = async (oneOutlet, carts) => {
                    let extraCharges = [];
                    let outletExtraCharges = [];
                    let totalAmt = 0;
                    let cartId = null;
                    let discounts = [];
                    await this.testOrder(false, (res) => {
                        cartId = res.cartId;
                        totalAmt = res.order.total;
                        extraCharges = res.order.extraCharges;
                        outletExtraCharges = res.order.orders.reduce((arr, o) => {
                            let xs = o.extraCharges;
                            if (!isEmpty(xs)) {
                                xs.forEach((x) => {
                                    let ix = arr.findIndex((it) => {
                                        return it.percentage == x.percentage && it.type == x.type && it.name == x.name && it.inclusive == x.inclusive;
                                    });
                                    if (ix > -1) arr[ix].amount += x.amount;
                                    else arr.push(x);
                                });
                            }
                            return arr;
                        }, []);
                        
                        if(!isEmpty(res.order.orderDiscounts)){
                            let discs = res.order.orderDiscounts.filter((ds) => !discounts?.map((it) => it.reason).includes(ds.reason));
                            discounts = [...discounts, ...discs];
                        }
                        if(!isEmpty(res.order.discounts)){
                            let xdiscs = res.order.discounts.filter((ds) => !discounts?.map((it) => it.reason).includes(ds.reason));
                            discounts = [...discounts, ...xdiscs];
                        }
                        for(let i = 0; i < res.order.orders.length; i++){
                            let one = res.order.orders[i];
                            if(!isEmpty(one.discounts)){
                                let oneDiscs = one.discounts.filter((ds) => !discounts?.map((it) => it.reason).includes(ds.reason));
                                discounts = [...discounts, ...oneDiscs];
                            }
                        }
                    }, (err) => {
                        console.log("PM ERROR", err);
                        self.showNotification("alert", "error_outline", `Something went wrong! ${err.message || ""}`);
                        errorCarts.push({
                            outlet: oneOutlet,
                            carts: carts,
                            error: err,
                        });
                    }, true, true, carts, oneOutlet.apiCode);
                    if (totalAmt <= 0) return;
                    let payloadItems = carts.map((s) => {
                        return {
                            name: s.product.name,
                            quantity: s.quantity,
                            totalAmount: {
                                value: s.accPrice
                            }
                        }
                    });
                    if (!isEmpty(outletExtraCharges)) {
                        payloadItems = [
                            ...payloadItems,
                            ...outletExtraCharges.map((s) => {
                                return {
                                    name: s.name,
                                    quantity: 1,
                                    totalAmount: {
                                        value: s.amount
                                    }
                                }
                            })
                        ];
                    }
                    if (!isEmpty(extraCharges)) {
                        payloadItems = [
                            ...payloadItems,
                            ...extraCharges.map((s) => {
                                return {
                                    name: s.name,
                                    quantity: 1,
                                    totalAmount: {
                                        value: s.amount
                                    }
                                }
                            })
                        ];
                    }
                    if(!isEmpty(discounts)){
                        payloadItems = [
                            ...payloadItems,
                            ...discounts.map((ds) => {
                                return {
                                    name: ds.reason,
                                    quantity: 1,
                                    totalAmount: {
                                        value: ds.amount
                                    }
                                }
                            })
                        ]
                    }
                    let hq = this.$store.getters.getHeadquarter;
                    let currency = hq.headquarter.currency;
                    if (!currency) currency = "PHP";
                    let trackingId = this.generateTrackingId();
                    let outletCode = EUNOIA_CONFIG.brandCode + "$" + oneOutlet.apiCode;
                    let payment = {
                        amount: totalAmt,
                        type: "PAYMAYA",
                        status: "DRAFT",
                        accountKey: pm.key,
                        currency: currency,
                        paidTime: moment().format('x'),
                        brand: hq.apiCode,
                        trackingId: trackingId
                    };
                    let baseUrl = EUNOIA_CONFIG.baseUrl.split('/api/');
                    let url = baseUrl[0];
                    let redirectFE = `${window.location.origin}/redirect/payment/order`;
                    let params = {
                        totalAmount: {
                            value: totalAmt,
                            currency: currency
                        },
                        buyer: {
                            firstName: this.order[oneOutlet.apiCode].customer.firstName || "Customer",
                            lastName: this.order[oneOutlet.apiCode].customer.lastName || "Customer",
                            contact: {
                                phone: this.order[oneOutlet.apiCode].customer.phone,
                                email: this.order[oneOutlet.apiCode].customer.email
                            }
                        },
                        redirectUrl: {
                            success: url + "/ipg/paymaya/paymentSuccess/" + trackingId,
                            failure: url + "/ipg/paymaya/paymentFail/" + trackingId,
                            cancel: url + "/ipg/paymaya/paymentFail/" + trackingId
                        },
                        requestReferenceNumber: trackingId,
                        items: payloadItems
                    }

                    let payload = {
                        body: JSON.stringify(params),
                        accountKey: payment.accountKey,
                        cartId: cartId,
                        trackingId: payment.trackingId,
                        amount: totalAmt,
                        successUrl: `${redirectFE}/${outletCode}/${payment.trackingId}/${payment.accountKey}/${cartId}/${totalAmt}`,
                        failUrl: `${redirectFE}/${outletCode}/${payment.trackingId}/${payment.accountKey}/${cartId}/0`
                    }
                    // let payload2 = this.generatePaymayaCheckoutPayload(pm);
                    let resJson = await productService.paymayaCreateCheckout(payload);
                    console.log(resJson);
                    let pmLink = resJson.redirectUrl || "";
                    if (pmLink) {
                        cartIds.push({
                            cartId: cartId,
                            outlet: oneOutlet,
                            carts: carts,
                            paymentLink: pmLink,
                            executed: false,
                            paid: false,
                            placed: false,
                            orderNumber: "",
                            type: pm.type
                        });
                    } else {
                        errorCarts.push({
                            outlet: oneOutlet,
                            carts: carts,
                            error: {
                                message: "Unable to generate the payment link"
                            },
                        });
                    }
                }
                self.loading = true;
                if(self.useCartId){
                    await Promise.all(activeCarts.map((oneOutlet) => {
                        self.cartId = "";
                        self.$store.dispatch("setCartId", null);
                        let carts = oneOutlet.carts?.filter((c) => c.checked == true && isEmpty(c.freeProduct));
                        if(isEmpty(carts)) return;
                        if(pm.type == "PAYMAYA"){
                            self.isPlaceOrder = true;
                            return preparePaymaya(oneOutlet, carts);
                        }
                        return self.testOrder(false, (res) => {
                            cartIds.push({
                                cartId: res.cartId,
                                outlet: oneOutlet,
                                carts: carts,
                                amount: res.order.total,
                                executed: false,
                                paid: false,
                                placed: false,
                                orderNumber: "",
                                type: pm.type,
                                accountKey: pm.key
                            });
                        }, (err) => {
                            console.log("PM ERROR", err);
                            self.showNotification("alert", "error_outline", `Something went wrong! ${err.message || ""}`);
                            errorCarts.push({
                                outlet: oneOutlet,
                                carts: carts,
                                error: err,
                            });
                        }, true, true, carts, oneOutlet.apiCode);
                    })).then(() => {
                        executeNow();
                    });
                } else {
                    self.isPlaceOrder = true;
                    let oneIndex = 0;
                    const prepareCashPayment = async (oneOutlet, carts, callback, retries, cashPayload) => {
                        let parentCartId = this.$store.getters.getCartId || {};
                        self.isPlaceOrder = true;
                        self.cartId = "";
                        self.$store.dispatch("setCartId", {
                            ...parentCartId,
                            [oneOutlet.apiCode]: cashPayload.cartId
                        });
                        await self.testOrder(false, (res) => {
                            if (res?.success) {
                                cartIds.push({
                                    cartId: "",
                                    outlet: oneOutlet,
                                    carts: carts,
                                    paymentLink: "",
                                    executed: false,
                                    paid: false,
                                    placed: false,
                                    orderNumber: res.order.number,
                                });
                                return callback();
                            }
                            if(retries == 0){
                                errorCarts.push({
                                    outlet: oneOutlet,
                                    carts: carts,
                                    error: {
                                        message: "Unable to proceed the order. " + res.message
                                    },
                                });
                                return callback();
                            }
                            setTimeout(() => {
                                prepareCashPayment(oneOutlet, carts, callback, retries-1, cashPayload);
                            }, 2000);
                        }, (error) => {
                            if(retries == 0){
                                errorCarts.push({
                                    outlet: oneOutlet,
                                    carts: carts,
                                    error: {
                                        message: "Unable to proceed the order. " + error.message
                                    },
                                });
                                return callback();
                            }
                            setTimeout(() => {
                                prepareCashPayment(oneOutlet, carts, callback, retries-1, cashPayload);
                            }, 2000);
                        }, false, false, carts, oneOutlet.apiCode, true);
                    }
                    const placeNextOrder = () => {
                        if((oneIndex + 1) == activeCarts.length){
                            return executeNow();
                        }
                        oneIndex += 1;
                        return placeOneOrder();
                    }
                    const placeOneOrder = async () => {
                        let oneOutlet = activeCarts[oneIndex];
                        console.log('placeOneOrder', oneOutlet);
                        let carts = oneOutlet.carts?.filter((c) => c.checked == true && isEmpty(c.freeProduct));
                        if(isEmpty(carts)) {
                            return placeNextOrder();
                        }
                        let cashPayload = null;
                        let isSuccess = false;
                        await this.testOrder(false, (res) => {
                            isSuccess = res?.success == true;
                            if(!isSuccess){
                                errorCarts.push({
                                    outlet: oneOutlet,
                                    carts: carts,
                                    error: {
                                        message: "Unable to proceed the order. " + res.message
                                    },
                                });
                                return placeNextOrder();
                            }
                            cashPayload = {
                                amount: res?.order?.total || 0,
                                cartId: res?.cartId || ""
                            }
                        }, (err) => {
                            errorCarts.push({
                                outlet: oneOutlet,
                                carts: carts,
                                error: {
                                    message: "Unable to proceed the order. " + err?.message
                                },
                            });
                        }, true, true, carts, oneOutlet.apiCode);
                        if(!isSuccess) return placeNextOrder();
                        const cash = await productService.payWithCash(cashPayload);
                        if(!cash?.success){
                            errorCarts.push({
                                outlet: oneOutlet,
                                carts: carts,
                                error: {
                                    message: "Unable to proceed the order. " + cash?.message
                                },
                            });
                            return placeNextOrder();
                        }
                        prepareCashPayment(oneOutlet, carts, placeNextOrder, 15, cashPayload);
                    }
                    placeOneOrder();
                }
            } catch (err) {
                restoreCarts();
                self.isPlaceOrder = false;
                self.showNotification("alert", "error_outline", "Something went wrong! Unable to generate Cart IDs. " + err.message);
            }
        },
        toggleMayaModal(open){
            this.isOpenIframe = open == true;
        },
        handleMayaVault(pm, typeOfOrder, finalCartIds, errorCarts, index){
            let self = this;
            if(this.selectedCardToken){
                return this.payWithTokenizedCard(pm, typeOfOrder, finalCartIds, errorCarts, index);
            }
            this.toggleMayaModal(true);
            let oneCart = typeOfOrder == "order" ? finalCartIds[index] : this.booking;
            setTimeout(() => {
                self.loading = false;
                self.isPlaceOrder = false;
                let orderTitle = `Order ${index + 1}: ${oneCart.outlet.name}`;
                if(typeOfOrder == "event") orderTitle = "Ticket Order";
                document.querySelector("#paymaya-title").innerHTML = orderTitle;
                const iframeContainer = document.getElementById("iframe-paymaya");
                paymayaSdkClient.createCreditCardForm(iframeContainer, {
                    buttonText: "Save And Pay",
                    showLogo: false,
                }).addTransactionHandler((paymentTokenId) => {
                    self.loading = true;
                    let cardToken = "";
                    const doPayment = async () => {
                        if(finalCartIds.length == index){
                            let paymentsMade = finalCartIds.filter((it) => it.paymentMade == true);
                            if(paymentsMade.length > 0) {
                                oneCart = finalCartIds[0];
                                localStorage.setItem("cartIds", JSON.stringify(finalCartIds));
                                localStorage.setItem("errorCarts", JSON.stringify(errorCarts));
                                let redirectFE = `${window.location.origin}/redirect/payment`;
                                let successUrl = `${redirectFE}/${typeOfOrder}/${oneCart.outlet.apiCode}/${oneCart.trackingId}/${pm.key}/${oneCart.cartId}/${oneCart.amount}`;
                                self.isPlaceOrder = true;
                                window.location.href = successUrl;
                            } else {
                                self.showNotification("alert", "error_outline", "Payment unsuccessful! You may need to try again.");
                            }
                            return;
                        }
                        oneCart = finalCartIds[index];
                        self.savePay(pm, typeOfOrder, finalCartIds[index], paymentTokenId, cardToken, (res) => {
                            cardToken = res?.token || "";
                            let verificationUrl = res?.verificationUrl || "";
                            if(!res?.success){
                                if(index == 0) {
                                    self.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                                    self.loading = false;
                                    return;
                                }
                                errorCarts.push({
                                    outlet: oneCart.outlet,
                                    carts: oneCart.carts,
                                    error: res
                                });
                            } else {
                                finalCartIds[index] = {
                                    ...finalCartIds[index],
                                    cardToken: cardToken,
                                    paymentTokenId: paymentTokenId,
                                    accountKey: pm.key,
                                    currency: res.currency,
                                    trackingId: res.trackingId,
                                    paymentMade: true,
                                }
                                if(verificationUrl){
                                    const storageData = finalCartIds.map((it, ix) => ({
                                        ...it,
                                        cardToken: cardToken,
                                        paymentTokenId: paymentTokenId,
                                        accountKey: pm.key,
                                        currency: res.currency,
                                        trackingId: ix == index ? res.trackingId : this.generateTrackingId()
                                    }))
                                    // redirect to 3DS verificationUrl
                                    localStorage.setItem("cartIds", JSON.stringify(storageData));
                                    localStorage.setItem("errorCarts", JSON.stringify(errorCarts));
                                    window.location.href = verificationUrl;
                                    return;
                                }
                            }
                            index++;
                            doPayment();
                        });
                    }
                    if(typeOfOrder == "order") doPayment();
                    else {
                        self.savePay(pm, typeOfOrder, self.booking, paymentTokenId, cardToken, (res) => {
                            if(!res?.success) {
                                self.loading = false;
                                self.showNotification("alert", "error_outline", "Something went wrong! " + res?.message);
                                return;
                            }
                            const verificationUrl = res?.verificationUrl || "";
                            if(verificationUrl) {
                                localStorage.setItem("cartIds", JSON.stringify(res));
                                window.location.href = verificationUrl;
                                return;
                            }
                            window.location.href = res.successUrl;
                        });
                    }
                });
            }, 250);
        },
        async payWithTokenizedCard(pm, typeOfOrder, finalCartIds, errorCarts, index){
            const cardTokenId = this.selectedCardToken.id;
            let oneCart = typeOfOrder == "order" ? finalCartIds[index] : this.booking;
            let outletCode = typeOfOrder == "order" ? oneCart.outlet.apiCode : this.getOutletCode();
            let total = typeOfOrder == "order" ? oneCart.amount : this.booking.total;
            let cartId = typeOfOrder == "order" ? oneCart.cartId : this.cartId;
            let hq = this.$store.getters.getHeadquarter;
            let currency = hq.headquarter.currency;
            let trackingId = this.generateTrackingId();
            let redirectFE = `${window.location.origin}/redirect/payment`;
            let successUrl = `${redirectFE}/${typeOfOrder}/${outletCode}/${trackingId}/${pm.key}/${cartId}/${total}`;
            let failUrl = `${redirectFE}/${typeOfOrder}/${outletCode}/${trackingId}/${pm.key}/${cartId}/0`;
            let payload = {
                cartId: cartId,
                accountKey: pm.key,
                amount: total,
                cardTokenId: cardTokenId,
                trackingId,
                currency,
                successUrl,
                failUrl,
            }
            
            if(typeOfOrder == "order"){
                finalCartIds[index] = {
                    ...finalCartIds[index],
                    successUrl,
                    failUrl
                }
                const res = await productService.mayaVaultCreatePayment(payload);
                if(!res?.success){
                    errorCarts.push({
                        outlet: oneCart.outlet,
                        carts: oneCart.carts,
                        error: res
                    });
                }
                let nextIndex = index + 1;
                if(nextIndex < finalCartIds.length){
                    return this.payWithTokenizedCard(pm, typeOfOrder, finalCartIds, errorCarts, nextIndex);
                }
                this.loading = false;
                this.isPlaceOrder = false;
                if(errorCarts.length == finalCartIds.length){
                    this.showNotification("alert", "error_outline", "Unable to pay! " + errorCarts[0].error?.message);
                    return;
                }
                localStorage.setItem("cartIds", JSON.stringify(finalCartIds));
                localStorage.setItem("errorCarts", JSON.stringify(errorCarts));
            } else {
                const res = await productService.mayaVaultCreatePayment(payload);
                if(!res?.success){
                    this.showNotification("alert", "error_outline", "Unable to pay! " + res?.message);
                    return;
                }
            }
            window.location.href = successUrl;
        },
        async savePay(pm, typeOfOrder, oneCart, paymentTokenId, cardTokenId, callback){
            let hq = this.$store.getters.getHeadquarter;
            let currency = hq.headquarter.currency;
            let trackingId = this.generateTrackingId();
            let redirectFE = `${window.location.origin}/redirect/maya-vault`;
            let outletCode = typeOfOrder == "order" ? oneCart.outlet.apiCode : this.getOutletCode();
            let total = typeOfOrder == "order" ? oneCart.amount : this.booking.total;
            let cartId = typeOfOrder == "order" ? oneCart.cartId : this.cartId;

            let successUrl = `${redirectFE}/order/${outletCode}/${pm.key}/${cartId}/${total}`;
            let failUrl = `${redirectFE}/order/${outletCode}/${pm.key}/${cartId}/0`;

            let payload = {
                cartId,
                accountKey: pm.key,
                amount: total,
                paymentTokenId,
                cardTokenId: cardTokenId || 0,
                trackingId,
                currency,
                successUrl,
                failUrl,
            }
            const res = await productService.mayaVaultCreatePayment(payload);
            const json = res || {}
            callback({
                ...json,
                ...payload
            });
        },
        generateTrackingId() {
            let trackingId = this.randomString(36);
            let hqData = this.$store.getters.getHeadquarter;
            if(!isEmpty(hqData) && !isEmpty(hqData.app) && !isEmpty(hqData.app.properties) && !isEmpty(hqData.app.properties.customReference)) {
                trackingId = hqData.app.properties.customReference + "" + this.randomNumber(12);
            }
            return trackingId;
        },
        generatePaymayaCheckoutPayload(pm) {
            let accountKey = pm.key;
            let trackingId = this.generateTrackingId();
            let brand = this.$store.getters.getStoreBrand;
            let isHQ = this.$store.getters.isHQ;
            let currency = "";
            let code = "";
            let outletCode = "";
            if(isHQ) {
                let hq = this.$store.getters.getHeadquarter;
                code = hq.apiCode;
                currency = this.$store.getters.getHeadquarter.headquarter?.currency;
                outletCode = EUNOIA_CONFIG.brandCode + "$" + this.getOutletCode();
            } else {
                code = brand.code;
                outletCode = code;
                brand.currency;
            }
            if(!currency) currency = "PHP";

            let totalAmt = 0;
            let customer = null;
            let items = [];
            let orderRequest = this.$store.getters.getOrderRequest;
            if(!isEmpty(this.booking)) {
                totalAmt = this.booking.total;
                // customer = this.booking.customer;
                customer = {
                    firstName: this.billingFirstName,
                    lastName: this.billingLastName,
                    phone: this.billingPhone,
                    email: this.billingEmailAddress
                }
                items = [
                    {
                        name: this.booking.selectedSession.name,
                        quantity: this.booking.quantity,
                        totalAmount: {
                            value: this.booking.total
                        }
                    }
                ];
            }
            if(!isEmpty(this.order)) {
                totalAmt = 0;
                customer = this.order.customer;
                let parent = this.$store.getters.getCarts;
                for(let k in parent){
                    totalAmt += orderRequest[k].total || 0;
                    parent[k].forEach((s) => {
                        items.push({
                            name: s.product.name,
                            quantity: s.quantity,
                            totalAmount: {
                                value: s.accPrice
                            }
                        });
                    });
                }

                this.groupedOutletExtraCharges?.forEach((s) => {
                    items.push({
                        name: s.name,
                        quantity: 1,
                        totalAmount: {
                            value: s.amount
                        }
                    });
                });

                this.extraCharges?.forEach((s) => {
                    items.push({
                        name: s.name,
                        quantity: 1,
                        totalAmount: {
                            value: s.amount
                        }
                    });
                });
            }

            if(isEmpty(customer)){
                customer = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    phone: this.phone
                }
            }
            orderRequest.customer = customer;
            this.$store.dispatch("setOrderRequest", orderRequest);

            let payment = {
                amount: totalAmt,
                type: "PAYMAYA",
                status: "DRAFT",
                accountKey: accountKey,
                currency: currency,
                paidTime: moment().format('x'),
                brand: code,
                trackingId: trackingId
            }
            
            let baseUrl = EUNOIA_CONFIG.baseUrl.split('/api/');
            let url = baseUrl[0];
            let redirectFE = `${window.location.origin}/redirect/payment`;
            if(!isEmpty(this.booking)) redirectFE = `${redirectFE}/event`;
            else redirectFE = `${redirectFE}/order`;

            let params = {
                totalAmount: {
                    value: totalAmt,
                    currency: currency
                },
                buyer: {
                    firstName: customer.firstName || "Customer",
                    lastName: customer.lastName || "Customer",
                    contact: {
                        phone: customer.phone,
                        email: customer.email
                    }
                },
                redirectUrl: {
                    success: url + "/ipg/paymaya/paymentSuccess/" + trackingId,
                    failure: url + "/ipg/paymaya/paymentFail/" + trackingId,
                    cancel: url + "/ipg/paymaya/paymentFail/" + trackingId
                },
                requestReferenceNumber: trackingId,
                items: items
            }

            let payload = {
                body: JSON.stringify(params),
                accountKey: payment.accountKey,
                cartId: this.cartId,
                trackingId: payment.trackingId,
                amount: totalAmt,
                successUrl: `${redirectFE}/${outletCode}/${payment.trackingId}/${payment.accountKey}/${this.cartId}/${totalAmt}`,
                failUrl: `${redirectFE}/${outletCode}/${payment.trackingId}/${payment.accountKey}/${this.cartId}/0`
            }
            return payload;
        },
        async handlePayMayaPayment(pm) {
            try {
                let payload = this.generatePaymayaCheckoutPayload(pm);
                this.loading = true;
                let json = await productService.paymayaCreateCheckout(payload);
                if(!json.redirectUrl || !json.success) {
                    this.loading = false;
                    this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
                    return;
                }
                
                // this.watchPaymaya(json, payment);
                window.location.href = json.redirectUrl;
            } catch(error){
                this.loading = false;
                this.showNotification("alert", "error_outline", error);
            }
		},
        async placeOrder(){
            try {
                let items = document.getElementsByName('paymentAccount');
                let key = "";
                for(var i=0; i< items.length;i++){
                    if(items[i].checked) key = items[i].dataset.key;
                }
                if(this.selectedCardToken) key = this.selectedCardToken.accountKey;
                let pm = this.paymentAccounts.find((p) => {
                    return p.key == key;
                });
                if (isEmpty(pm) && this.totalAmount > 0) return this.showNotification("alert", "error_outline", "Please select payment method!");
                if (!isEmpty(this.order) && this.$store.getters.getDineType == "RETAIL_DELIVERY") {
                    let address = this.$store.getters.getDeliveryAddress;
                    if(isEmpty(address)) return this.showNotification("alert", "error_outline", "Delivery address is required!");
                }

                if(this.isGuestCustomer()){
                    let firstName = this.firstName;
                    let lastName = this.lastName;
                    let email = this.email;
                    let phone = this.phone;
                    if(isEmpty(firstName)) return this.showNotification("alert", "error_outline", "First name is required!");
                    if(isEmpty(lastName)) return this.showNotification("alert", "error_outline", "Last name is required!");
                    if(!this.isValidEmail(email)) return this.showNotification("alert", "error_outline", "Please input a valid email address!");
                    if(!this.isValidPhone(phone)) return this.showNotification("alert", "error_outline", "Please input a valid phone number!");
                    let orderRequest = this.$store.getters.getOrderRequest;
                    orderRequest.customer = {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone
                    };
                    this.$store.dispatch("setOrderRequest", orderRequest);
                }
                if (!this.agreement) return this.showNotification("alert", "error_outline", "Please accept R.O.X Community Terms of Service");
                if (!this.agreement2) {
                    if(this.totalAmount <= 0) this.agreement2 = true;
                    else return this.showNotification("alert", "error_outline", "We unable to proceed without multiple payments agreement acceptance from you.");
                }

                window.dataLayer.push({
                    event: "begin_checkout",
                    page_location: window.location.href
                });

                if(this.totalAmount <= 0) {
                    this.showZeroPayment = true;
                    return;
                }

                let callback = (res) => {
                    this.showZeroPayment = false;
                    if(!res.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                    switch (pm.type) {
                        case "PAYMAYA":
                            this.handlePayMayaPayment(pm);
                            break;
                        case "MAYA_VAULT":
                            this.handleMayaVault(pm, "event");
                            break;
                        case "OFFLINE":
                            this.payment = {
                                amount: this.totalAmount,
                                type: "OFFLINE",
                                paidTime: moment().valueOf(),
                                trackingId: this.randomString(20),
                                accountKey: pm.key,
                                status: "PAID"
                            }
                            this.checkBookingStatus();
                            break;
                        case "CASH":
                            this.checkBookingStatus();
                            break;
                    }
                }
                this.useCartId = !["OFFLINE", "CASH"].includes(pm.type);
                // if (this.isMultipleOutletsOrder) {
                //     return this.prepareMultipleOutletsOrder(pm);
                // }
                if (!isEmpty(this.booking)) {
                    let isValidBilling = this.validateBillingInfo();
                    if (!isValidBilling) return;
                    this.checkout(true, (res) => {
                        callback(res);
                    });
                }
                if (!isEmpty(this.order)) {
                    let address = this.$store.getters.getDeliveryAddress;
                    if (isEmpty(address) && this.$store.getters.getDineType == "RETAIL_DELIVERY") return this.showNotification("alert", "error_outline", "Delivery address is required!");
                    /*
                    this.isPlaceOrder = true;
                    this.checkoutOrder(true, (res) => {
                        if(res.cartId) self.cartId = res.cartId;
                        callback(res);
                    });
                    */
                    this.prepareMultipleOutletsOrder(pm);
                }
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        async checkBookingStatus() {
            let returnRes =
                arguments.length > 0 && arguments[0] !== undefined
                    ? arguments[0]
                    : false;
            let tries = 10;
            let timeOut = 4000;
            let callback = (res) => {
                if (res.success) {
                    this.loading = false;
                    if (returnRes) {
                        let ress = {
                            success: true,
                            retry: false,
                            orderNumber: res.order.number
                        }
                        return ress;
                    }
                    window.dataLayer.push(this.generateGA(res));
                    let page = 'TicketPage';
                    if(!isEmpty(this.order)){
                        page = 'OrderSummary';
                    }
                    return this.goToWithParams(page, {
                        number: res.order.number
                    });
                }
                tries--;
                if (tries == 0) {
                    this.loading = false;
                    if (returnRes) {
                        console.log("callbackFailed", res);
                        return {
                            success: false,
                            retry: true,
                            orderNumber: ""
                        }
                    }
                    this.showZeroPayment = false;
                    this.loading = false;
                    return this.toggleTryAgain();
                }
                setTimeout(() => {
                    if(!isEmpty(this.booking)){
                        this.checkout(false, (response) => {
                            callback(response);
                        });
                    }
                    if(!isEmpty(this.order)){
                        this.checkoutOrder(false, (res) => {
                            callback(res);
                        });
                    }
                }, timeOut);
            }
            this.loading = true;
            this.tryAgain = false;
            if(!isEmpty(this.booking)){
                this.checkout(false, (response) => {
                    callback(response);
                });
            }
            if(!isEmpty(this.order)){
                this.checkoutOrder(false, (res) => {
                    callback(res);
                });
            }
        },
        watchPaymaya(json, payment){
            let paymentWindow = window.open();
            if(!paymentWindow) {
                this.loading = false;
                return this.showNotification("alert", "error_outline", ` Please check your browser settings. You might need to disable Popup-Blocker!`);
            }
            paymentWindow.location.href = json.redirectUrl;
            let onPayment = false;

            let callbackSuccess = (res) => {
                this.loading = false;
                if(!res) return this.showNotification("alert", "error_outline", "Payment failed/canceled!");
                onPayment = true;
                payment.status = "PAID";
                this.payment = payment;
                this.checkBookingStatus();
            }

            const messageListener = function (event) {
                const success = paymentWindow.closed === false && event.source.window === paymentWindow && event.target.window === window && event.data === "SUCCESS";
                callbackSuccess(success);
                paymentWindow.close();
                this.loading = false;
                window.removeEventListener("message", messageListener);
            };

            let timer = setInterval(() => {
                if (paymentWindow.closed) {
                    if(!onPayment) callbackSuccess(false);
                    window.removeEventListener("message", messageListener);
                    clearInterval(timer);
                }
            }, 500);

            window.addEventListener("message", messageListener);
        },
        getBookingImage(){
            if(isEmpty(this.booking)) return;
            let img = this.booking.selectedSession.image || (this.booking.details.banners?.length ? this.booking.details.banners[0].id : null);
            if(!img) return require('@/assets/images/rox-logo-2025.jpeg');
            return this.$store.getters.cloudinaryURL + img;
        },
        hasPromoPrice(cart) {
            let products = this.$store.getters.getProducts || [];
            let prd = products.find(it => it.id == cart.product.id);
            if (!prd) return null;
            if (prd.promoPrice > 0 && prd.price !== prd.originalPrice) return this.currency(prd.originalPrice);
            return null;
        },
        async emitPromoCode(currentPromocode, promoCodes, callbackEmit) {
            let self = this;
            self.processing = true;
            self.promoCode = currentPromocode;
            let parent = this.$store.getters.getCarts;
            let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
            for(let k in parent){
                if(removedPromocodes[k]) {
                    removedPromocodes[k] = removedPromocodes[k].filter((rm) => rm != currentPromocode);
                }
            }
            self.$store.dispatch("setAutoPromocodes", removedPromocodes);
            await self.executePromo(null, false, (json) => {
                let msg = `${currentPromocode} has been applied`;
                let icon = "success";
                if (!json.success) {
                    icon = "alert";
                    let errors = json.errors || {};
                    msg = json.message;
                    promoCodes.pop();
                    promoCodes = self.$store.getters.getPromoCodes || {};
                    for(let k in errors){
                        if(promoCodes[k] && !isEmpty(promoCodes[k])){
                            promoCodes[k] = promoCodes[k].filter((it) => it != currentPromocode);
                        }
                    }
                    for(let n in promoCodes){
                        promoCodes[n] = promoCodes[n].filter((it) => it != currentPromocode);
                    }
                    self.$store.dispatch("setPromoCodes", promoCodes);
                    self.executePromo(currentPromocode, false);
                    self.showNotification(icon, "error_outline", msg);
                    callbackEmit();
                    return;
                }
                self.promoCode = "";
                self.showNotification(icon, "error_outline", msg);
                callbackEmit();
            });
        },
        stepBack() {
            if (!isEmpty(this.booking)) {
                return this.$router.replace({
                    name: "EventSessionDetails",
                    params: this.booking.backParams
                });
            }
            this.$router.replace("/cart");
        },
        async showVouchers(callback) {
            callback();
        },
        onApplyVoucher(callback) {
            let self = this;
            self.$store.dispatch("clearBooking");
            self.$store.dispatch("addToBooking", self.booking);
            return self.checkoutEvent({
                booking: self.booking
            }, true, (res) => {
                callback(res);
                if (!res.success) {
                    let msg = res.message || "Something went wrong!";
                    return self.showNotification("alert", "error_outline", msg);
                }
                if (!isEmpty(res.order)) {
                    self.booking.discounts = res.order.discounts;
                    self.booking.total = res.order.total;
                }
                self.$store.dispatch("clearBooking");
                self.$store.dispatch("addToBooking", self.booking);
            });
        },
        async removeVoucher(disc) {
            if (this.processing) return;
            let parentCarts = this.$store.getters.getCarts || {};
            let outletCodes = Object.keys(parentCarts);
            let removedIndex = 0;
            this.removingDiscount = disc.voucher;
            const removeOne = async () => {
                let appliedVc = this.$store.getters.getAppliedVouchers || {};
                let cashVc = this.$store.getters.getAppliedCashVouchers || {};
                let outletCode = outletCodes[removedIndex];
                let outletCarts = parentCarts[outletCode] || [];
                let vcs = appliedVc[outletCode] || [];
                let vcash = cashVc[outletCode] || [];
                let voucher = vcs.find((it) => it.id == disc.voucher);
                if (!voucher) {
                    voucher = vcash.find((it) => it.id == disc.voucher);
                }
                if (!voucher) {
                    this.removingDiscount = "";
                    return;
                }

                let payload = {
                    voucherId: voucher.id,
                    key: outletCode
                }
                if (voucher.isCashVoucher) {
                    this.$store.dispatch("removeAppliedCashVoucherOutlet", payload);
                } else {
                    this.$store.dispatch("removeAppliedVoucherOutlet", payload);
                }
                let self = this;
                await this.testOrder(
                false,
                function () {
                    if(removedIndex == outletCodes.length - 1) {
                    self.removingDiscount = "";
                    return self.showNotification(
                        "success",
                        "error_outline",
                        `Voucher has been removed!`
                    );
                    }
                    removedIndex++;
                    removeOne();
                },
                function (error) {
                    self.showNotification(
                    "alert",
                    "error_outline",
                    `Something went wrong! ${error.message}`
                    );
                    if(removedIndex == outletCodes.length - 1) {
                        self.removingDiscount = "";
                        return
                    }
                    removedIndex++;
                    if (voucher.isCashVoucher) {
                        self.$store.dispatch("addAppliedCashVouchers", voucher);
                    } else {
                        self.$store.dispatch("addAppliedCashVouchers", voucher);
                    }
                    removeOne();
                }, true, true, outletCarts, outletCode);
                self.$refs['voucherWidget'].initAppliedVouchers();
            }
            removeOne();
        },
        removeDiscount(disc) {
            if (isEmpty(disc)) return;
            if (disc.voucher) return this.removeVoucher(disc);
            let reason = disc.reason.split(' ');
            this.removingDiscount = disc.reason;
            let code = !isEmpty(reason) ? reason[reason.length - 1] : "";
            let promoCodes = this.$store.getters.getPromoCodes;
            for(let k in promoCodes){
                promoCodes[k] = promoCodes[k].filter((it) => { return it != code });
            }
            this.$store.dispatch("setPromoCodes", promoCodes);
            this.executePromo(code);
        },
        async executePromo(removeCode, showAlert = true){
            let self = this;
            let callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () { };
            if(!isEmpty(self.booking)) {
                return self.checkoutEvent({
                    booking: self.booking
                }, true, (res) => {
                    self.processing = false;
                    let promoCodes = self.$store.getters.getPromoCodes || {};
                    if (!res.success) {
                        if (res.promoCodes) {
                            res.message = res.promoCodes.map((prm) => {
                                return `${prm.message} : ${prm.code}`;
                            }).join('. ');
                        }
                        if (showAlert) self.showNotification("alert", "error_outline", `Something went wrong! ${res.message}`);
                        callback(res);
                        return;
                    }
                    if (!isEmpty(res.order)) {
                        self.booking.discounts = res.order.discounts;
                        self.booking.total = res.order.total;
                    }
                    self.$store.dispatch("clearBooking");
                    self.$store.dispatch("addToBooking", self.booking);
                    if (removeCode) {
                        for(let k in promoCodes){
                            promoCodes[k] = promoCodes[k].filter((it) => { return it != removeCode });
                        }
                        self.$store.dispatch("setPromoCodes", promoCodes);
                        if (showAlert) self.showNotification("success", "error_outline", `${removeCode} has been removed`);
                        return;
                    }
                    callback(res);
                });
            }
            let parentCarts = this.$store.getters.getCarts || {};
            let promoCodes = this.$store.getters.getPromoCodes || {};
            let outletCodes = Object.keys(parentCarts);
            let errors = {};
            await Promise.all(outletCodes.map((key) => {
                if(removeCode){
                    let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
                    if(!removedPromocodes[key]) removedPromocodes[key] = [];
                    removedPromocodes[key].push(removeCode);
                    this.$store.dispatch("setAutoPromocodes", removedPromocodes);
                }
                return self.testOrder(false, (json) => {
                    if(!json?.success){
                        errors[key] = json;
                        return;
                    }
                    parentCarts = self.$store.getters.getCarts;
                    let carts = [];
                    for(let k in parentCarts){
                        carts = [...carts, ...parentCarts[k]];
                    }
                    self.carts = carts;
                    if (removeCode) {
                        if (showAlert) self.showNotification("success", "error_outline", `${removeCode} has been removed`);
                        return;
                    }
                    if (showAlert) self.showNotification("success", "error_outline", `${self.promoCode} has been applied`);
                }, (error) => {
                    errors[key] = error;
                }, true, true, parent[key], key)
            }));
            self.processing = false;
            self.promoCode = "";
            this.removingDiscount = "";

            let errorkeys = Object.keys(errors);
            if(errorkeys.length > 0){
                let errorMessages = "";
                let outlets = self.$store.getters.getOutlets;
                for(let k in errors){
                    let error = errors[k];
                    let oneOutlet = outlets.find((it) => it.apiCode == k);
                    let errorPromocodes = [];
                    if(error.promoCodes) errorPromocodes = error.promoCodes.map((x) => x.code);
                    else if(removeCode) errorPromocodes = [removeCode];
                    promoCodes = self.$store.getters.getPromoCodes || {};
                    if(errorPromocodes.length > 0){
                        if(promoCodes[k] && !isEmpty(promoCodes[k])){
                            promoCodes[k] = promoCodes[k].filter((it) => { return !errorPromocodes.includes(it) });
                        }
                    }
                    if(removeCode){
                        let removedPromocodes = self.$store.getters.getAutoPromoCodes || {};
                        if(removedPromocodes[k]) {
                            removedPromocodes[k] = removedPromocodes[k].filter((rm) => rm != removeCode);
                        }
                        self.$store.dispatch("setAutoPromocodes", removedPromocodes);
                    }
                    self.$store.dispatch("setPromoCodes", promoCodes);
                    errorMessages += `Unable to apply on outlet ${oneOutlet?.name}. ${error.message || ''}`;
                }
                if (showAlert) self.showNotification("alert", "error_outline", `${errorMessages || "Something went wrong!"}`);
                callback({
                    success: false,
                    message: errorMessages,
                    errors: errors
                })
            } else {
                callback({
                    success: true
                });
            }
        },
    },
	async created() {
		try {
            let redirectParams = this.$store.getters.getRedirectParams;
            if(!isEmpty(redirectParams)) this.paymayaRedirectParams = redirectParams;
            let booking = this.$store.getters.getBooking;
            let order = this.$store.getters.getOrderRequest;
            if (isEmpty(booking) && isEmpty(order) && isEmpty(redirectParams)) {
                if (isEmpty(order)) return this.$router.push({ name: "CartPage" });
                return this.$router.push({name: "WelcomePage"});
            }
            this.payment = null;
            this.customerDetails = this.$store.getters.getCustomer || {};
            this.billingFirstName = this.customerDetails.firstName;
            this.billingLastName = this.customerDetails.lastName;
            this.billingPhone = this.customerDetails.phone;
            this.billingEmailAddress = this.customerDetails.email;
            if(!isEmpty(booking)) this.booking = booking[0];
            let paymentAccounts = this.$store.getters.getPaymentAccounts;
            let hasMayaVault = paymentAccounts?.find((it) => it.type == "MAYA_VAULT");
            if(hasMayaVault){
                let isSandbox = process.env.VUE_APP_ENV != "production";
                paymayaSdkClient.init(hasMayaVault.publicKey, isSandbox);
            }
            paymentAccounts.map((pm) => {
                pm.clicked = false;
                pm.logo = "";
                switch(pm.type){
                    case "PAYMAYA": 
                        pm.displayName = "Credit Card/Debit Card";
                        pm.displayTitle = "Via PayMaya";
                        pm.logo = require('@/assets/images/paymaya-logo.png');
                        break;
                    case "MAYA_VAULT": 
                        pm.displayName = "Save & Pay";
                        pm.displayTitle = "Save Credit Card/Debit Card for future payments";
                        pm.logo = require('@/assets/images/maya-logo.svg');
                        break;
                    case "OFFLINE":
                    case "CASH":
                        pm.displayName = pm.name;
                        pm.displayTitle = "Cash On Delivery";
                        break;
                    default:
                        pm.displayName = pm.name;
                        pm.displayTitle = "";
                        break;
                }
                return pm;
            });
            this.paymentAccounts = paymentAccounts.filter((pm) => {
                if (!isEmpty(order)) return this.allowedPaymentTypes.includes(pm.type);
                return ["PAYMAYA", "MAYA_VAULT"].includes(pm.type);
            });
            if(this.paymentAccounts.length == 1) {
                this.paymentAccounts.map((pm) => {
                    pm.clicked = true;
                    return pm;
                });
            }
			this.loading = true;
            this.isPlaceOrder = false;
            this.carts = [];
            let parent = this.$store.getters.getCarts;
            if(!this.firstName && !this.lastName && !this.email && !this.phone && this.isGuestCustomer()){
                if(!isEmpty(order)){
                    this.booking = null;
                    this.$store.dispatch("clearBooking");
                    this.order = order;
                    for(let k in parent){
                        this.carts = [...this.carts, ...parent[k]];
                    }
                }
                this.loading = false;
                return;
            }
            
            if(!isEmpty(order)){
                this.booking = null;
                this.$store.dispatch("clearBooking");
                this.order = order;
                this.checkoutOrder(true, (res) => {
                    if(!res.success) this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                });
                let parent = this.$store.getters.getCarts;
                let carts = [];
                for(let k in parent){
                    carts = [...carts, ...parent[k]];
                }
                this.carts = carts;
            }
            if(!isEmpty(this.booking)){
                this.checkout(true, (res) => {
                    if(!res.success) this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                });
            }
            this.loading = false;
            const res = await getEunoiaCustomerDetails();
            let tokenizedCards = res?.customer?.creditCardTokens || [];
            if(!isEmpty(tokenizedCards)) {
                tokenizedCards = tokenizedCards.filter((card) => {
                    return this.paymentAccounts.map((pm) => pm.key).includes(card.accountKey)
                })
                this.tokenizedCards = tokenizedCards.map((card) => {
                    return {
                        ...card,
                        selected: false
                    }
                })
            }
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
.tokenized-cards {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    .card-token {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        &.active {
            .card-action {
                color: $primary-color-70 !important;
            }
            .card-wallet,
            .card-type {
                color: $secondary-color-90 !important;
            }
        }
    }
    .tokenized-cards-label {
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    }
    .card-info {
        display: flex;
        align-items: center;
        gap: 6px;
        .card-wallet {
            font-size: 2em !important;
            color: $secondary-color-40;
        }
        .card-wrapper {
            display: flex;
            flex-direction: column;
            line-height: 1em;
            .card-number {
                font-size: 1em;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            }
            .card-type {
                color: $secondary-color-50;
                font-size: 0.8em;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            }
        }
    }
    .card-action {
        font-size: 28px;
        cursor: pointer;
        color: $secondary-color-30;
    }
}
    .close-btn {
        cursor: pointer;
        &:hover {
            opacity: 0.7;
        }
    }
    .modal-header h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        img {
            width: 35px;
        }
    }
    .cart-outlet-discounts {
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        text-align: left;
        .cart-outlet-discount-label {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;

            &.nowrap {
                white-space: nowrap;
            }
        }
    }
    @keyframes processingAnim {
        0% { 
            width: 0;
            background: linear-gradient(90deg, $main-red 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $main-red 100%, $secondary-color-20);
        }
        }
    @-webkit-keyframes processingAnim {
        0% {
            width: 0;
            background: linear-gradient(90deg, $main-red 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $main-red 100%, $secondary-color-20);
        }
    }
    .processing {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 250px;
        margin: 0 auto;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: $secondary-color-20;
        &::before {
            position: absolute;
            content: "";
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            color: $white;
            margin: 0 auto;
            height: 10px;
            bottom: 0;
            left: 0;
            transition: all 1s;
            -webkit-transition: all 1s;
            animation: processingAnim 1s ease-in-out infinite;
            -webkit-animation: processingAnim 1s ease-in-out infinite;
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
    .booking-details {
        display: flex;
        flex-direction: column;
        gap: 24px;
        .booking-preview {
            display: flex;
            gap: 12px;
            padding-block: 24px;
            border-block: 1px solid $secondary-color-20;
            & + * {
                padding-top: 0 !important;
            }
            .booking-preview-image {
                width: 100px;
                min-width: 100px;
                aspect-ratio: 1/1;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid $secondary-color-20;
                padding: 4px;
                background: white;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .booking-preview-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                text-align: left;
            }
        }
    }
    .widgets {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        & + * {
            margin-top: 24px;
        }
    }
    .sd-footer {
        height: auto !important;
    }
    .header-con {
        padding: 16px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 70px;
        margin-block: auto;
        gap: 16px;
        color: $white;

        .back-btn {
            cursor: pointer;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .more {
            color: $main-red;
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
            text-align: left;
        }
    }
    .main-body {
        width: 100%;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        .cart-items-wrapper {
            flex: 3;
            display: flex;
            flex-direction: column;
            gap: 24px;
            h1 {
                font-size: 1.3em;
                width: fit-content;
                text-align: left;
                display: flex;
                align-items: center;
                gap: 6px;
                font-family: "Berthold Akzidenz Grotesk Medium", sans-serif;
                font-weight: normal !important;
                .material-icons,
                .material-icons-outlined {
                    cursor: pointer;
                }
            }
        }
        .cart-items {
            display: flex;
            flex-direction: column;
            gap: 36px;
            background: $white;
            border: 1px solid $secondary-color-20;
            border-radius: 12px;
            padding: 24px;
            height: fit-content;
            .cart-items-outlet-header {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
            }
            .shipping-info {
                font-size: 0.9em;
                .shipping-label {
                    color: $secondary-color-60;
                }
                .shipping-name {
                    font-family: "Berthold Akzidenz Grotesk Medium", sans-serif;
                }
            }
            .cart-items-outlet {
                width: fit-content;
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                .outlet-index {
                    background: $secondary-color-20;
                    border-radius: 24px;
                    padding: 3px 12px;
                    padding-top: 4px;
                    font-size: 0.8em;
                }
                .outlet-name {
                    font-size: 1em;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                }
            }
            .cart-items-outlet-footer {
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                gap: 8px;
                .outlet-footer-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }
            }

            .cart-item {
                height: fit-content;
                width: auto;

                & + .cart-item {
                    border-top: none !important;
                }

                .cart-wrapper {
                    width: 100%;
                    display: flex;
                    gap: 12px;

                    .cart-product {
                        width: 100%;
                        flex: 1;
                        overflow: hidden;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 100px;
                        max-width: 120px;
                        aspect-ratio: 3/4;

                        &.no-image {
                            height: auto;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: $primary-color-10 !important;

                            &::before {
                                content: "no image";
                                color: $secondary-color-50;
                                background-image: url("@/assets/images/rox-logo-2025.jpeg");
                                background-position: center;
                                background-repeat: no-repeat;
                                width: 40px;
                                height: 40px;
                                opacity: 0.4;
                                background-size: contain;
                                color: $secondary-color-50;
                            }
                        }

                        img {
                            height: 100%;
                            width: auto;
                            object-fit: contain;
                            object-position: top;
                            margin: auto;
                            mix-blend-mode: multiply;
                        }
                    }

                    .cart-info {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        text-align: left;
                        position: relative;
                        flex: 3;

                        .cart-acc-price {
                            margin-top: auto;
                            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                        }

                        .cart-category {
                            color: $main-red;
                            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                        }
                        .cart-name {
                            font-weight: normal;
                        }
                        .product-price-con {
                            width: 100%;
                            display: flex;
                            align-items: baseline;
                            justify-content: space-between;
                            .product-price-wrapper {
                                font-weight: normal !important;
                            }
                        }
                        .cart-modifiers {
                            width: 100%;
                            color: $info-light;

                            .separator {
                                content: "";
                                width: 5px;
                                height: 5px;
                                background: $info-light;
                                border-radius: 50%;
                                display: inline-block;
                                margin: 0 6px;
                            }
                        }
                    }
                }
            }
            .cart-details {
                flex: 2;
                height: fit-content;
                width: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
		}
        .cart-sum {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-radius: 12px;
            border: 1px solid $secondary-color-20;
            background: $white;

            .cart-sum-header {
                font-size: 1em;
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                text-align: left;
            }
            .cart-sum-body {
                display: flex;
                flex-direction: column;
                gap: 12px;
                .booking-extracharge-item {
                    display: flex;
                    flex-direction: column;
                    padding-inline: 24px;
                    .extracharge-head {
                        font-size: 0.7em;
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                        text-align: left;
                    }
                    .extracharge-body {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 0.8em;
                        padding: 4px 0;
                        .extracharge-title {
                            font-weight: normal;
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                        }
                        .extracharge-amount {
                            white-space: nowrap;
                            font-weight: normal;
                        }
                    }
                }
                .cart-sum-item {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    text-align: left;
                    padding-inline: 24px;
                    &.total {
                        padding-block: 16px;
                        border-top: 1px solid $secondary-color-20;
                        border-bottom: 1px solid $secondary-color-20;
                    }

                    &.bold {
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    }
                    .cart-sum-total-label {
                        font-family: 'Berthold Akzidenz Grotesk Medium';
                        color: $secondary-color-90;
                    }
                    .cart-sum-subtotal-label {
                        color: $secondary-color-60;
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    }

                    .cart-sum-disc-label {
                        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                        color: $success-green;

                        &.nowrap {
                            white-space: nowrap;
                        }
                    }
                    .cart-sum-disc-icon {
                        cursor: pointer;
                        color: $main-red;
                    }
                }
            }

            .cart-sum-footer {
                padding: 16px;
            }
        }
        .cart-footer {
            display: none;
        }
    }
    .checkout-box {
        flex: 2;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .payment-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        text-align: left;
        background: $white;
        border: 1px solid $secondary-color-20;
        border-radius: 12px;
        padding: 24px;
        height: fit-content;

        .payment-header {
            font-size: 1em;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            padding-top: 16px;
            border-top: 1px solid $secondary-color-20;
        }
        .payment-body {
            width: 100%;
            padding: 0px;
        }
        .radio-list {
            padding: 24px 0 !important;
        }

        .payment-footer {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 24px 0;
            background: $white;
            border-top: 1px solid $secondary-color-20;
        }

        .summary-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-size: 1.2em;
            font-family: 'Berthold Akzidenz Grotesk Medium';
        }
        .summary-con {
            cursor: pointer;
            display: flex;
            gap: 8px;
            align-items: center;
        }
    }
    .cart-sum {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-radius: 12px;
        margin-bottom: 24px;
        padding-block: 24px;

        .cart-sum-header {
            padding-inline: 24px;
            font-size: 1em;
            text-align: left;
        }
        .cart-sum-body {
            padding-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;

            .cart-sum-item {
                width: 100%;
                display: flex;
                justify-content: space-between;
                gap: 12px;
                text-align: left;

                &.bold {
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                }
                .cart-sum-total-label {
                    font-family: 'Berthold Akzidenz Grotesk Medium';
                    color: $secondary-color-90;
                }
                .cart-sum-subtotal-label {
                    color: $secondary-color-60;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                }

                .cart-sum-disc-label {
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    color: $success-green;
                    display: flex;
                    gap: 8px;

                    &.nowrap {
                        white-space: nowrap;
                    }
                }
                .cart-sum-disc-icon {
                    cursor: pointer;
                    color: $main-red;
                }
                .cart-sum-disc-action {
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    color: $main-red;
                    font-size: 0.8em;
                    cursor: pointer;
                    text-decoration: underline;
                    &:hover{ opacity: 0.7;}
                }
            }
        }

        .cart-sum-footer {
            padding: 16px;
            .checkout-btn {
                width: 100%;
                padding: 16px;
                background: $main-red;
                color: $white;
                align-items: center;
                justify-content: center;
                border-radius: 32px;
                font-family: 'Berthold Akzidenz Grotesk Medium';
                cursor: pointer;
                text-align: center;
                box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
                -webkit-box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
                &.disabled {
                    pointer-events: none;
                    background: $secondary-color-20;
                    color: $secondary-color-50;
                }
            }
        }
    }
    .actions {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 24px;

        .action-button {
            font-family: 'Berthold Akzidenz Grotesk Medium';
            flex: 1;
            border-radius: 32px;
            background: $main-red;
            border: 1px solid $main-red;
            padding: 16px;
            color: $white;
            text-align: center;
            cursor: pointer;

            &.light {
                border: 1px solid $main-red;
                background: $white;
                color: $main-red;
            }
        }
    }
    .checkbox-custom {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        cursor: pointer;
        width: 100%;
        margin: 0 auto;
        padding-top: 32px;
        padding-inline: 24px;
        & + .checkbox-custom {
            padding-top: 12px !important;
        }

        .checkbox-icon {
            color: $secondary-color-50;

            &.checked {
                color: $main-red;
            }
        }

        .checkbox-label {
            white-space: normal !important;
            text-align: left;
        }
    }
    .customer-details {
        padding: 24px;
        display: flex;
        gap: 16px;
        flex-direction: column;

        .customer-item {
            display: flex;
            width: 100%;
            gap: 12px;
            flex-direction: column;

            .customer-item-label {
                font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            }

            .customer-item-input {
                border: 1px solid $secondary-color-20;
                border-radius: 6px;
                overflow: hidden;

                input {
                    border: none;
                    outline:none;
                    padding: 8px 12px;
                    width: 100%;
                }
            }
        }
    }
    @media (min-width: 672px) {
        .main-body {
            flex-direction: row !important;
            flex-wrap: wrap;
            .cart-items-wrapper {
                max-width: 60%;
            }
        }
	}
    @media(min-width: 672px) and (max-width: 1024px){
        .cart-items-wrapper {
            max-width: 100% !important;
        }
    }
</style>