<template>
    <div class="voucher-wrapper">
        <div class="vouchers-con" v-if="!isGuestCustomer()"
            :class="{'active': appliedVouchersDisplay != ''}">
            <div class="offer-con">
                <div class="offer-head">
                    <span class="offer-title">Offer</span>
                    <div class="offer-nav" @click="toggleVoucherModal">
                        Apply voucher
                        <span 
                            class="material-icons-outlined voucher-anchor"
                            :class="{'spinning': voucherModal.loading }"
                        >
                            {{ voucherModal.loading ? 'cached' : 'chevron_right' }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="voucher-info" v-if="countAppliedVouchers">
                <span class="voucher-info-title">
                    {{ countAppliedVouchersDisplay }}
                </span>
                <span class="voucher-info-subtitle" v-html="appliedVouchersDisplay"></span>
            </div>
            <!-- <span 
                class="material-icons-outlined voucher-anchor"
                :class="{'spinning': voucherModal.loading }"
            >
                {{ voucherModal.loading ? 'cached' : 'chevron_right' }}
            </span> -->
        </div>

        <base-modal :show="voucherModal.show">
            <template v-slot:header>
                <div class="modal-header header-flex justify-between">
                    <h3>Available Vouchers</h3>
                    <span class="close-btn material-icons-outlined" @click="toggleVoucherModal">close</span>
                </div>
            </template>
            <template v-slot:body>
                <div class="modal-body">
                    <div class="voucher-list">
                        <div class="voucher-item"
                            v-for="voucher in vouchers"
                            :key="voucher.id"
                            :class="{'active': selectedVoucher && selectedVoucher.id == voucher.id, 'applied': voucher.applied}"
                            @click="selectVoucher(voucher)"
                        >
                            <span class="voucher-selector material-icons">{{ selectedVoucher && selectedVoucher.id == voucher.id ? 'radio_button_checked' : 'radio_button_unchecked' }}</span>
                            <div class="voucher-content">
                                <span class="voucher-name">{{ voucher.display.name }}</span>
                                <span class="voucher-desc">
                                    {{ voucher.display.description }}
                                </span>
                                <span class="voucher-desc">
                                    Validity: {{ voucher.validity }}
                                </span>
                            </div>
                            <div v-if="voucher.applied" class="voucher-flag">applied</div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:footer>
                <div class="modal-footer voucher-footer">
                    <div class="voucher-message">
                        <div class="voucher-message-content" v-if="voucherModal.message">
                            <span 
                                class="material-icons-outlined message-icon"
                                :class="{'spinning': voucherModal.loading}"
                            >{{ voucherModal.loading ? 'cached' : 'info' }}</span>
                            <span>{{ voucherModal.message }}</span>
                        </div>
                    </div>
                    <div class="voucher-actions">
                        <div class="voucher-action cancel" @click="toggleVoucherModal">Cancel</div>
                        <div class="voucher-action" @click="applyVoucher">Apply Voucher</div>
                    </div>
                </div>
            </template>
        </base-modal>
    </div>
</template>

<script>
import { storeService } from "@/bloc/services";
import { getTransactionalPoints } from "@/connector/v4/customerConnector";
import utility from "@/presentation/mixins/utility.js";
import moment from 'moment-timezone';

export default {
	name: "WidgetVoucher",
    mixins: [utility],
    props: {
        isEvent: {
            type: Boolean,
            default: false,
        }
    },
	data() {
		return {
            voucherModal: {
                show: false,
                loading: false,
                message: ""
            },
            selectedVoucher: null,
            vouchers: [],
            appliedCashVouchers: [],
            appliedVouchers: [],
		};
	},
    computed: {
        appliedVouchersDisplay() {
            let vouchers = [...this.appliedVouchers, ...this.appliedCashVouchers];
            if (!vouchers.length) return "";
            return vouchers.map((it) => {
                return it.display.name
            }).join('<br/>');
        },
        countAppliedVouchers() {
            let vouchers = [...this.appliedVouchers, ...this.appliedCashVouchers];
            return vouchers.length;
        },
        countAppliedVouchersDisplay() {
            let count = this.countAppliedVouchers;
            let txt = count > 1 ? 'vouchers' : 'voucher';
            if (count <= 0) return 'Apply voucher';
            return `${count} ${txt} applied`;
        }
    },
    methods: {
        async toggleVoucherModal() {
            if (this.voucherModal.loading) return;
            if (this.voucherModal.show) {
                this.voucherModal.show = false;
                this.voucherModal.loading = false;
                this.selectedVoucher = null;
                return;
            }
            if (this.isEvent) {
                return this.$emit('select-voucher', () => {
                    this.showVouchers();
                });
            }
            this.showVouchers();
        },
        async showVouchers() {
            this.voucherModal.message = "";
            this.voucherModal.loading = true;
            const res = await getTransactionalPoints();
            this.voucherModal.loading = false;
            
            if (!res.success) {
                this.showNotification("alert", "error_outline", `Something went wrong! ${res.message}`);
                return;
            }
            this.vouchers = res.customer.vouchers ? res.customer.vouchers.map((it) => {
                let isCash = it.promotion.publishType ? false : true;
                let name = it.promotion.name;
                let desc = '';
                let validity = [];
                let appliedVs = [];

                it.applied = false;
                it.validity = 'UNLIMITED';
                if (it.promotion.periodFrom && it.promotion.periodTo) {
                    validity.push(moment.tz(it.promotion.periodFrom, 'Asia/Singapore').format('DD MMM YYYY'))
                    validity.push(moment.tz(it.promotion.periodTo, 'Asia/Singapore').format('DD MMM YYYY'))
                    it.validity = validity.join(' to ');
                }
                if (isCash) {
                    name = `${this.currency(it.promotion.amount)} ${it.promotion.name}`;
                    desc = `Cash voucher no. ${it.promotion.number}`;
                    appliedVs = this.appliedCashVouchers;
                } else {
                    desc = it.promotion.benefitType.split('_').join(' ').toLowerCase();
                    appliedVs = this.appliedVouchers;
                }

                if (appliedVs) {
                    it.applied = appliedVs.filter((v) => { return v.id == it.id }).length > 0;
                }

                it.isCashVoucher = isCash;
                it.display = {
                    name: name,
                    description: desc
                }
                return it;
            }) : [];
            if (this.vouchers.length == 0) {
                this.showNotification("alert", "error_outline", "You don't have any vouchers!");
                return;
            }
            this.voucherModal.show = true;
            this.initAppliedVouchers();
        },
        selectVoucher(voucher) {
            if (voucher.applied) return;
            if (this.selectedVoucher && this.selectedVoucher.id == voucher.id) {
                this.selectedVoucher = null;
                return;
            }
            this.selectedVoucher = voucher;
        },
        async applyVoucher() {
            if (this.voucherModal.loading) return;
            if (!this.selectedVoucher) {
                this.voucherModal.message = 'Please select a voucher!';
                return;
            }
            this.voucherModal.loading = true;
            this.voucherModal.message = 'Please wait...';
            if (this.selectedVoucher.isCashVoucher) {
                let number = this.selectedVoucher.promotion.number;
                let res = await storeService.retrieveCashVoucherDetails(number);
                if (!res.success) {
                    this.voucherModal.loading = false;
                    this.voucherModal.message = `Unable to get voucher PIN! ${res.message}. Please try again!`;
                    return;
                }
                this.selectedVoucher.promotion.pin = res.voucher.pin;
                
                this.$store.dispatch('addAppliedCashVouchers', this.selectedVoucher);
            } else {
                this.$store.dispatch('addAppliedVouchers', this.selectedVoucher);
            }

            let self = this;

            if (self.isEvent) {
                return self.$emit('on-apply-voucher', (res) => {
                    if (!res.success) {
                        if (self.selectedVoucher.isCashVoucher) {
                            self.$store.dispatch('removeAppliedCashVoucher', self.selectedVoucher.id);
                        } else {
                            self.$store.dispatch('removeAppliedVoucher', self.selectedVoucher.id);
                        }
                    }
                    self.voucherModal.loading = false;
                    self.selectedVoucher = null;
                    self.toggleVoucherModal();
                });
            }
            let vcs = this.$store.getters.getAppliedVouchers || {};
            if(this.selectedVoucher.isCashVoucher){
                vcs = this.$store.getters.getAppliedCashVouchers || {};
            }
            let errors = {};
            let outletCodes = [];
            const parentCarts = this.$store.getters.getCarts || {};
            const parentKeys = Object.keys(parentCarts);
            for(let outletCode in vcs) {
                if(!parentKeys.includes(outletCode)) continue;
                outletCodes.push(outletCode);
            }
            await Promise.all(outletCodes.map((outletCode) => self.testOrder(false, (res) => {
                if(!res?.success) errors[outletCode] = res;
            }, (error) => {
                errors[outletCode] = error;
            }, false, true, parentCarts[outletCode], outletCode)));

            const errorKeys = Object.keys(errors);
            if(errorKeys.length > 0){
                let outlets = self.$store.getters.getOutlets;
                let errorMessages = "";
                for(let outletCode in errors){
                    let outlet = outlets.find((it) => it.apiCode == outletCode);
                    let error = errors[outletCode];
                    let payload = {voucherId: self.selectedVoucher.id, key: outletCode};
                    if (self.selectedVoucher.isCashVoucher) {
                        self.$store.dispatch('removeAppliedCashVoucherOutlet', payload);
                    } else {
                        self.$store.dispatch('removeAppliedVoucherOutlet', payload);
                    }
                    if (error.promoCodes) {
                        const msg = error.promoCodes.map((prm) => {
                            return `${prm.message} : ${prm.code}`;
                        }).join('. ')
                        errorMessages += `Unable to apply voucher on outlet ${outlet?.name}! ${msg}`;
                    } else {
                        errorMessages += `Unable to apply voucher on outlet ${outlet?.name}! ${error.message || ""}`;
                    }
                }
                this.showNotification(
                    "warning",
                    "error_outline",
                    `${errorMessages || "Something went wrong!"}`
                );
            }
            self.voucherModal.loading = false;
            self.selectedVoucher = null;
            self.toggleVoucherModal();
            self.voucherModal.message = "";
            self.initAppliedVouchers();
        },
        initAppliedVouchers(){
            let parentCash = this.$store.getters.getAppliedCashVouchers || {};
            let cashVouchers = [];
            for(let k in parentCash){
                let filtered = parentCash[k].filter((it) => !cashVouchers?.map((v) => v.id).includes(it.id));
                cashVouchers = [...cashVouchers, ...filtered];
            }
            this.appliedCashVouchers = cashVouchers;
            let parent = this.$store.getters.getAppliedVouchers || {};
            let vouchers = [];
            for(let k in parent){
                let filtered = parent[k].filter((it) => !vouchers?.map((v) => v.id).includes(it.id));
                vouchers = [...vouchers, ...filtered];
            }
            this.appliedVouchers = vouchers;
        }
    },
    created(){
        this.initAppliedVouchers();
    }
};
</script>
<style scoped lang="scss">
    .close-btn {
        cursor: pointer;
        &:hover {
            opacity: 0.7;
        }
    }
    .voucher-wrapper {
        display: block;
    }
    .vouchers-con {
        margin: 0;
        display: flex;
        gap: 8px;
        flex-direction: column;
        &.active {
            .voucher-info {
                padding: 8px 16px;
                border-radius: 8px;
                background: $primary-color-10;
                border-color: $primary-color-10;
            }
        }
        .offer-con {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            flex-wrap: wrap;
            .offer-head {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 24px;
                flex-wrap: wrap;
                .offer-title {
                    font-weight: normal;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                }
                .offer-nav {
                    color: $main-red;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8em;
                    font-weight: normal;
                    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
                    cursor: pointer;
                    &:hover {
                        opacity: 0.7;
                    }
                    .voucher-anchor {
                        font-size: 1.4em !important;
                    }
                }
            }
        }
        .voucher-icon {
            color: $secondary-color-80;
        }
        .voucher-anchor {
            color: $main-red;
        }
        .voucher-info {
            display: flex;
            flex-direction: column;
            text-align: left;
            .voucher-info-title {
                font-size: 0.9em;
                font-weight: bold;
                color: $secondary-color-80;
            }
            .voucher-info-subtitle {
                font-size: 0.8em;
                color: $main-red;
            }
        }
    }
    .voucher-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        .voucher-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            background: $secondary-color-10;
            padding: 12px;
            border-radius: 6px;
            text-align: left;
            cursor: pointer;
            opacity: 0.7;
            &:hover {
                opacity: 1;
            }
            &.active {
                opacity: 1;
                .voucher-selector {
                    color: $main-red;
                }
            }
            &.applied {
                pointer-events: none;
                .voucher-selector {
                    color: $secondary-color-30;
                }
            }
            .voucher-content {
                flex: 3;
                display: flex;
                flex-direction: column;
                .voucher-name {
                    font-family: "Berthold Akzidenz Grotesk Medium", sans-serif;
                    font-size: 1.1em;
                }
                .voucher-desc {
                    color: $secondary-color-60;
                    font-size: 0.8em;
                }
            }
            .voucher-flag {
                font-size: 0.7em;
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid $custom-blue-color;
                color: $link-blue-color;
            }
        }
    }
    .voucher-footer {
        flex-direction: column;
        gap: 16px;
    }
    .voucher-message {
        width: 100%;
        display: block;
        .voucher-message-content {
            display: flex;
            align-items: center;
            gap: 6px;
            text-align: left;
            .message-icon {
                color: $main-red;
            }
        }
    }
    .voucher-actions {
        width: 100%;
        display: flex;
        gap: 24px;
        align-items: center;
        justify-content: space-between;
        .voucher-action {
            flex: 1;
            border-radius: 999px;
            border: 1px solid $main-red;
            background: $main-red;
            padding: 12px 24px;
            color: $white;
            cursor: pointer;
            font-family: "Berthold Akzidenz Grotesk Medium", sans-serif;
            font-weight: normal !important;
            text-align: center;
            &:hover {
                opacity: 0.7;
            }
            &.cancel {
                background: $white !important;
                color: $main-red !important;
            }
        }
    }
</style>
