<template>
	<div class="store-con" :class="{'desktop': isDesktop, 'hidden': !showContent}">
        <div class="location-icon" @click="toggleStoreModal()">
            <span class="material-icons-outlined">
                {{ !isEmpty(currentOutlet) && currentOutlet.isOmisell ? 'local_shipping' : 'location_on' }}
            </span>
        </div>
        <div class="location-details" v-if="!isEmpty(currentOutlet)">
            <div class="label" v-if="!currentOutlet.isOmisell">Welcome to</div>
            <div class="info" @click="toggleStoreModal()">
                <span class="info-text">{{ currentOutlet.isOmisell ? 'Delivery' : currentOutlet.name }}</span>
                <span class="info-icon material-icons">chevron_right</span>
            </div>
        </div>
        <div class="scan-button" @click="toggleScanner()">
            <span v-if="showLabel">Scan</span>
            <span class="material-icons">qr_code_scanner</span>
        </div>
        <div class="stores-modal" :class="{'show-modal': showStoreModal}">
            <div class="stores-modal-overlay" @click="toggleStoreModal()"></div>
            <div class="stores-dialog" :class="{'show-anim': showStoreModal}">
                <div class="stores-dialog-header">
                    <span class="dialog-title">Options</span>
                    <span class="dialog-close material-icons-outlined" @click="toggleStoreModal()">close</span>
                </div>
                <div class="stores-dialog-body">
                    <div class="store-list opened" v-if="!isEmpty(omisellOutlet)">
                        <div class="store-item store-delivery" @click="clickOutlet(omisellOutlet)">
                            <div class="store-wrapper">
                                <div class="store-name">Delivery</div>
                            </div>
                            <div class="store-action">
                                <span class="store-selector material-icons-outlined" :class="{'selector-active': isClickedOutlet(omisellOutlet)}">{{ isClickedOutlet(omisellOutlet) ? 'radio_button_checked' : 'radio_button_unchecked' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="store-dialog-title" v-if="!isEmpty(bopisOutlets)">
                        <div class="store-current-info">
                            <span>Shop From</span>
                            <small v-if="!isEmpty(clickedOutlet) && !clickedOutlet.isOmisell" v-html="clickedOutlet.name"></small>
                        </div>
                        <span class="store-opener" 
                            :class="{'active': isBopisOutletClicked, 'opened': bopisExpanded}"
                            @click="bopisExpanded = !bopisExpanded"></span>
                    </div>
                    <div class="store-list" :class="{'opened': bopisExpanded}">
                        <div class="store-item" 
                            v-for="(st, i) in bopisOutlets" 
                            :key="i"
                            @click="clickOutlet(st)">
                            <div class="store-wrapper store-delivery" v-if="st.isOmisell">
                                <div class="store-name">Delivery</div>
                            </div>
                            <div class="store-wrapper" v-else>
                                <div class="store-name">{{ st.name }}</div>
                                <div class="store-info">
                                    <span class="store-distance">{{ st.distance || '- ' }}km</span>
                                    <span class="store-hours" v-if="st.availabelToday">
                                        {{ getOpeningTime(st.openingHours, 'from') }} - {{ getOpeningTime(st.openingHours, 'to') }}
                                    </span>
                                    <span class="store-hours" v-if="!st.availabelToday">Unavailable</span>
                                </div>
                                <div class="store-address">{{ st.address ? st.address.string : "" }}</div>
                            </div>
                            <div class="store-action">
                                <span class="store-selector material-icons-outlined" :class="{'selector-active': isClickedOutlet(st)}">{{ isClickedOutlet(st) ? 'radio_button_checked' : 'radio_button_unchecked' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="stores-dialog-footer">
                    <div class="btn-groups">
                        <div class="btn-cancel" @click="toggleStoreModal()">Cancel</div>
                        <div class="btn-select" @click="changeOutlet()">Select</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="stores-modal" :class="{'show-modal': showScanner}">
            <div class="stores-modal-overlay" @click="toggleScanner()"></div>
            <div class="stores-dialog" :class="{'dialog-full show-anim': showScanner}">
                <div class="stores-dialog-body">
                    <base-scanner v-if="showScanner"
                        @barcode-scanned="barcodeScanned"
                        @stop-scanner="toggleScanner"
                        :title="'Scan Item'"
                        :subtitle="'Please scan the QR code'"
                    ></base-scanner>
                </div>
            </div>
        </div>

        <base-modal :show="askChangeOutlet">
            <template v-slot:header>
                <div class="modal-header header-flex">
                    <span class="material-icons-outlined" @click="askChangeOutlet = false">close</span>
                    <h3>Confirmation</h3>
                </div>
            </template>
            <template v-slot:body>
                <div class="modal-body">
                    <p>The product which you scanned is from different outlet. If you change the outlet then we will remove all products from the cart</p>
                    <p>Would you like to change the outlet?</p>
                </div>
                <div class="modal-footer">
                    <div class="actions">
                        <div class="action-button light" @click="askChangeOutlet = false">No</div>
                        <div class="action-button" @click="changeScannedOutlet()">Yes</div>
                    </div>
                </div>
            </template>
        </base-modal>
    </div>
</template>

<script>
import BaseScanner from "@/components/base/BaseScanner.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
export default {
	props: {
        showContent: {
			type: Boolean,
			default: false
		},
        showLabel: {
			type: Boolean,
			default: false
		},
        isDesktop: {
			type: Boolean,
			default: true
		}
	},
    mixins: [utility],
    components: {
        BaseScanner,
	},
    data() {
		return {
            showStoreModal: false,
            showScanner: false,
            outlets: [],
            stores: [],
            clickedStore: null,
            clickedOutlet: null,
            scannedObj: null,
            askChangeOutlet: false,
            bopisExpanded: false,
		};
	},
    watch: {
        showStoreModal(val){
            if(val){
                this.initStoreModalHandler();
            }
        }
    },
	computed: {
        dayOfWeek(){
            return moment().format('dddd');
        },
        currentStore(){
            return this.getCurrentStore();
        },
        currentOutlet() {
            let outlet = this.getCurrentOutlet();
            if (isEmpty(outlet)) return;
            outlet.isOmisell = outlet.enableOmisellIntegration == true && outlet.stores.filter((s) => { return s.delivery }).length > 0;
            return outlet;
        },
        omisellOutlet() {
            return this.outlets.find((o) => o.isOmisell);
        },
        bopisOutlets() {
            return this.outlets.filter((o) => !o.isOmisell);
        },
        isBopisOutletClicked() {
            return this.bopisOutlets?.filter((it) => { return this.isClickedOutlet(it) }).length > 0;
        }
    },
    methods: {
        barcodeScanned(res){
            console.log(res);
            this.scannedObj = null;
            this.showScanner = false;
            this.parseParams(res);
        },
        changeScannedOutlet(){
            this.$store.dispatch("setCurrentOutlet", this.scannedOutlet);
            this.$store.dispatch("setCurrentStore", this.scannedStore);
            let products = this.$store.getters.getProducts;
            let prd = products.find((it) => it.id == this.scannedObj.productId);
            if (!prd) return this.showNotification("alert", "error_outline", "We are sorry, the product you scanned is not found!");
            let names = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                if (it.toUpperCase() == it) return it;
                return it.toLowerCase();
            });
            this.goToWithParams('ProductDetails', {
                outlet: this.scannedObj.outlet.apiCode,
                productId: this.scannedObj.productId,
                productName: names.join('-')
            });
        },
        parseParams(href){
            if(!href) return;
            let params = href;
            if(href.indexOf('?') > -1){
                var idx = href.indexOf('?');
                params = href.substring(idx+1);
                if(href.substring(idx+1,idx+2)=="&") params = href.substring(idx+2);
            }
            params = new URLSearchParams(params);
            var obj = {
                brandCode: params.get('brandcode') || null,
                productId: params.get('product_id') || null,
                storeId: params.get('store_id') || null
            }
            let outlets = this.$store.getters.getOutlets;
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            let outlet = outlets.find((it) => { return it.stores.filter((s) => { return s.id == obj.storeId }).length > 0 });
            if(isEmpty(outlet)) return this.showNotification("alert", "error_outline", "We are sorry, the product you scanned is not available in the outlet!");
            if(outlet.apiCode != currentOutlet.apiCode){
                let carts = this.$store.getters.getCarts;
                let store = outlet.stores.find((s) => { return s.id == obj.storeId });
                if(!isEmpty(carts)){
                    this.scannedObj = obj;
                    this.scannedObj.outlet = outlet;
                    this.scannedObj.store = store;
                    this.askChangeOutlet = true;
                    this.showNotification("alert", "error_outline", 'Store is unavailable today');
                    return;
                }
                this.$store.dispatch("setCurrentOutlet", outlet);
                this.$store.dispatch("setCurrentStore", store);
            }
            let products = this.$store.getters.getProducts;
            let prd = products.find((it) => it.id == this.scannedObj.productId);
            if (!prd) return this.showNotification("alert", "error_outline", "We are sorry, the product you scanned is not found!");
            let names = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                if (it.toUpperCase() == it) return it;
                return it.toLowerCase();
            });
            if(!isEmpty(prd.variants)) {
                prd.variants.sort((a,b) => a.sortIndex - b.sortIndex);
                let variantSlugs = prd.variants[0].name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
                    if (it.toUpperCase() == it) return it;
                    return it.toLowerCase();
                });
                names = [...names, ...variantSlugs];
            }
            this.goToWithParams('ProductDetails', {
                outlet: outlet.apiCode,
                productId: obj.productId,
                productName: names.join('-')
            });
        },
        toggleScanner(){
            this.showScanner = !this.showScanner;
        },
        toggleStoreModal(){
            this.showStoreModal = !this.showStoreModal;
        },
        isClickedOutlet(outlet){
            if(isEmpty(outlet)) return false;
            return !isEmpty(this.clickedOutlet) && outlet.id == this.clickedOutlet.id;
        },
        clickOutlet(outlet){
            this.clickedOutlet = outlet;
        },
        changeOutlet(){
            if(isEmpty(this.clickedOutlet)) return;
            if(!this.clickedOutlet.availabelToday) return this.showNotification("alert", "error_outline", 'Store is unavailable today');
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            if(!isEmpty(currentOutlet)){
                if(currentOutlet.apiCode == this.clickedOutlet.apiCode) {
                    this.showStoreModal = false;
                    return;
                }
            }
            this.$store.dispatch("setCurrentOutlet", this.clickedOutlet);
            this.$store.dispatch("setCurrentStore", this.clickedOutlet.stores ? this.clickedOutlet.stores[0] : null);
            this.showStoreModal = false;
            this.$emit('store-changed');
        },
        getOpeningTime(hours, target){
            let today = this.dayOfWeek;
            let time = hours.find((h) => {
                return h.dayOfWeek.toUpperCase() == today.toUpperCase();
            });
            if(isEmpty(time)) return target == "from" ? "24/7" : "daily";
            let obj = {
                fromTime : time.startTime.substring(0,5),
                toTime : time.endTime.substring(0,5),
            }
            return target == "from" ? obj.fromTime : obj.toTime;
        },
        initStoreModalHandler() {
            let dineType = this.$store.getters.getDineType;
            let day = this.dayOfWeek;
            let momente = moment();
            let milliseconds = momente.format('x');
            let userCoords = this.getCurrentLocation();
            this.outlets = this.getOutlets().filter((outlet) => {
                outlet.stores = outlet.stores.filter((st) => {
                    let active = true;
                    switch(dineType){
                        case "DELIVERY":
                            if(!st.delivery) active = false;
                            break;
                        case "TAKE_AWAY":
                            if(!st.takeAway) active = false;
                            break;
                    }
                    let hours = st.openingHours || [];
                    let activeHours = hours.filter((h) => {
                        return h.dayOfWeek.toUpperCase() == day.toUpperCase();
                    });
                    
                    if(!isEmpty(activeHours)){
                        let h = activeHours[0];
                        let date = moment().format('YYYY-MM-DD');
                        let fromTime = moment(date + ' ' + h.startTime.substring(0,5));
                        let endTime = moment(date + ' ' + h.endTime.substring(0,5));
                        st.availabelToday = milliseconds >= fromTime.format('x') && milliseconds < endTime.format('x');
                    }
                    return activeHours.length > 0 && active;
                }).map((st) => {
                    st.distance = null;
                    if (!isEmpty(userCoords) && !isEmpty(st.coord)) {
                        let radlat1 = Math.PI * userCoords.lat / 180;
                        let radlat2 = Math.PI * st.coord.lat / 180;
                        let theta = userCoords.lng - st.coord.lng;
                        let radtheta = Math.PI * theta / 180;
                        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                        if (dist > 1) dist = 1;
                        dist = Math.acos(dist);
                        dist = dist * 180 / Math.PI;
                        dist = dist * 60 * 1.1515;
                        dist = parseFloat(dist * 1.609344).toFixed(2) //in Kilometers
                        st.distance = dist;
                    }
                    return st;
                });
                outlet.isOmisell = outlet.enableOmisellIntegration == true && outlet.stores.filter((s) => { return s.delivery }).length > 0;
                outlet.availabelToday = outlet.stores.filter((s) => { return s.availabelToday }).length > 0;
                outlet.stores = outlet.stores.filter((s) => { return s.availabelToday });
                outlet.stores.sort((a,b) => { return a.distance - b.distance });
                outlet.distance = !isEmpty(outlet.stores) ? outlet.stores[0].distance : "";
                return outlet.stores.length > 0;
            });
            this.clickedOutlet = this.getCurrentOutlet();
        }
    },
};
</script>

<style lang="scss">
	.store-con {
        width: 100%;
        padding: 16px;
        background: #595129;
        color: $white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        &.desktop {
            width: auto !important;
            padding: 0;
            background: transparent !important;
        }

        &.hidden {
            max-height: 0 !important;
            padding: 0 !important;
            overflow: hidden;

            .location-icon {
                display: none !important;
            }
            .location-details {
                display: none !important;
            }
            .scan-button {
                opacity: 0;
            }
        }

        .location-icon {
            font-size: 2.5em;
            pointer-events: none;
        }
        .location-details {
            display: flex;
            flex: 3;
            flex-direction: column;
            gap: 7px;

            .label {
                font-size: 1em;
                text-align: left;
            }
            .info {
                font-family: 'Berthold Akzidenz Grotesk Medium';
                font-size: 0.9em;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;

                .info-text {
                    text-align: left;
                    display: -webkit-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                }

                .info-icon {
                    color: $white;
                }
            }
        }
        .scan-button {
            cursor: pointer;
            background: $primary-color-60;
            color: $white;
            display: flex;
            gap: 10px;
            align-items: center;
            //padding: 8px 12px;
            border-radius: 12px;
            opacity: 0;
            max-width: 0;
        }
    }
    .stores-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        background: rgba(0,0,0,.2);
        z-index: 1000;
        display: none;
        color: $secondary-color-90;
        text-align: left;

        .stores-modal-overlay {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            z-index: -1;
            background: rgba(0,0,0,.3);
        }

        .stores-dialog {
            margin: 0 auto;
            width: 100%;
            max-width: 675px;
            background: white;
            height: calc(100% - 125px);
            position: absolute;
            bottom: -100%;
            left: 0;
            right: 0;
            border-radius: 12px 12px 0 0;
            -webkit-transition: all 0.5s ease-in-out;
            -moz-transition: all 0.5s ease-in-out;
            -o-transition: all 0.5s ease-in-out;
            transition: all 0.5s ease-in-out;
            transition-delay: 1s;
            display: flex;
            flex-direction: column;

            &.dialog-full {
                background: transparent !important;
                border-radius: 0 !important;

                .stores-dialog-body {
                    padding: 0 !important;
                }
            }

            &.show-anim {
                animation: float-anim 0.4s ease-in-out forwards;
                -ms-animation: float-anim 0.4s ease-in-out forwards;
                -moz-animation: float-anim 0.4s ease-in-out forwards;
                -webkit-animation: float-anim 0.4s ease-in-out forwards;
                -o-animation: float-anim 0.4s ease-in-out forwards;
            }
        }

        &.show-modal {
            display: block !important;
        }
        @keyframes float-anim {
            from {
                bottom: -100%;
            }
            to {
                bottom: 0%;
            }
        }
        @-webkit-keyframes float-anim {
            from {
                bottom: -100%;
            }
            to {
                bottom: 0%;
            }
        }
        .stores-dialog-header {
            padding: 24px 16px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid $secondary-color-10;

            .dialog-title {
                font-size: 1.3em;
                font-family: 'Berthold Akzidenz Grotesk Medium';
                color: $secondary-color-90;
            }

            .dialog-close {
                cursor: pointer;
                font-size: 2em;
                color: $secondary-color-60;
            }
        }
        .stores-dialog-body {
            padding: 16px;
            height: 100%;
            overflow: hidden;
            overflow-y: auto;
            text-align: left;
            .store-dialog-title {
                font-size: 1.1em;
                font-family: 'Berthold Akzidenz Grotesk Medium';
                color: $secondary-color-90;
                padding-bottom: 16px;
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                .store-current-info {
                    display: flex;
                    flex-direction: column;
                    small {
                        color: $info-light;
                        font-weight: 900;
                        font-size: 0.7em !important;
                        font-family: 'Berthold Akzidenz Grotesk';
                        display: flex;
                        gap: 8px;
                        align-items: center;
                        &::before {
                            font-family: 'Material Icons Outlined';
                            content: "location_on";
                        }
                    }
                }
                & .store-opener {
                    cursor: pointer;
                    font-size: 28px;
                    &::after {
                        content: "keyboard_arrow_down";
                        font-family: "Material Icons Outlined";
                        color: $secondary-color-40;
                    }
                    &.active::after {
                        color: $primary-color-60;
                    }
                    &.opened::after {
                        content: "keyboard_arrow_up";
                    }
                }
            }
            .store-list {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 24px;
                overflow: hidden;
                transition: max-height 0.5s ease-in-out;
                max-height: 0px;
                &.opened {
                    max-height: 10000px;
                }
                & + .store-dialog-title {
                    margin-top : 24px;
                }
            }

            .store-item {
                display: flex;
                align-items: center;
                gap: 12px;
                &:hover{ opacity: 0.7; cursor: pointer;}
                &.store-delivery {
                    border-bottom: 1px solid $secondary-color-10;
                    padding-bottom: 8px;
                    .store-name {
                        font-size: 1.1em;
                        font-family: 'Berthold Akzidenz Grotesk Medium';
                        color: $secondary-color-90;
                    }
                }
                & + .store-item {
                    padding-top: 12px;
                    border-top: 1px solid $secondary-color-10;
                }
            }

            .store-wrapper {
                display: flex;
                flex-direction: column;
                flex: 3;
            }

            .store-name {
                font-weight: bold;
                line-height: 2.2;
                font-size: 0.9em;
            }
            .store-info {
                display: flex;
                align-items: flex-start;
                gap: 18px;
                font-size: 0.9em;
            }
            .store-distance {
                line-height: 1.5;
                color: $secondary-color-60;
                font-size: 0.9em;
            }
            .store-hours {
                line-height: 1.5;
                color: $primary-color-60;
                position: relative;
                font-size: 0.9em;

                &::before {
                    content: "";
                    position: absolute;
                    width: 5px;
                    height: 5px;
                    background: $secondary-color-60;
                    margin: auto;
                    top: 0;
                    bottom: 0;
                    left: -12px;
                    border-radius: 50%;
                }
            }
            .store-address {
                line-height: 1.5;
                color: $secondary-color-60;
                font-size: 0.9em;
            }
            .store-selector {
                color: $secondary-color-40;
                cursor: pointer;

                &.selector-active {
                    color: $primary-color-60 !important;
                }
            }
        }
        .stores-dialog-footer {
            padding: 16px;
            display: flex;
            gap: 24px;
            border-top: 1px solid $secondary-color-10;

            .btn-groups {
                display: flex;
                align-items: center;
                gap: 32px;
                width: fit-content;
                margin: 0 auto;
            }

            .btn-cancel {
                font-weight: bold;
                cursor: pointer;
                padding: 12px 48px;
                border-radius: 12px;
                border: 1px solid $secondary-color-20;
            }

            .btn-select {
                font-weight: bold;
                cursor: pointer;
                padding: 12px 48px;
                border-radius: 12px;
                background: $primary-color-60;
                color: $white;
            }
        }
    }

    @media (min-width: 672px) {
		.store-con:not(.desktop) {
			padding: 16px 48px;
            width: auto !important;
		}
	}

    @media (min-width: 672px) and (max-width: 900px) {
		.store-con:is(.desktop) {
            .location-icon {
                pointer-events: auto !important;
                cursor: pointer;
            }
            .location-details {
                display: none !important;
            }
		}
	}

    @media (min-width: 672px) and (max-width: 1050px) {
		.store-con {
            &.desktop {
                .location-icon {
                    pointer-events: auto !important;
                    cursor: pointer;
                }
                &:not(.hidden){
                    .location-details {
                        display: flex !important;
                        
                        .label {
                            display: none !important;
                        }
                        .info {
                            font-family: 'Berthold Akzidenz Grotesk';
                            font-size: 0.7em;
                            font-weight: bold;
                        }
                    }
                }
            }
		}
	}

</style>