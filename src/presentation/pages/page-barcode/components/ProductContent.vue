<template>
	<layout-variant-two :show-main-logo="true" :show-loading-screen="loading">
		<template v-slot:header>
			<div class="product-header">
				<div class="product-header-left">
					<base-icon
						class="sd-icon-btn-ghost sd-icon-btn-xsm"
						iconName="arrow_back"
						iconSize="lg"
						@click="goTo('WelcomePage')"
					></base-icon>
				</div>
				<base-badge
					@click="scanQR()"
					badgeLabel=""
					iconName="qr_code_scanner"
					class="qr-icon sd-badge-md"
				/>
			</div>
		</template>
		<template v-slot:body>
			<div v-if="product" :class="{'product-image': getImage(), 'product-no-image': !getImage()}">
				<img :src="getImage()" v-if="getImage()">
			</div>
			<div class="product-content" v-if="product">
				<div class="product-name">{{ product.name }}</div>
				<div class="product-price">
					<span class="price">{{ getPrices(product) }}</span>
					<span :class="{'available':product.available, 'unavailable':!product.available}">
					{{ product.available ? '' : 'Not' }} Available
					</span>
				</div>
				<div class="product-category" v-if="brand">
					<span class="label">Brand</span>
					<span>{{ getBrand(product) }}</span>
				</div>
				<div class="product-category" v-if="product.categories && product.categories.length > 0">
					<span class="label">Category</span>
					<span>{{ joinArray(product.categories,'name') }}</span>
				</div>
				<div class="product-category" v-if="product.description">
					<span class="label">Description</span>
					<div v-html="getDesc(product.description)"></div>
				</div>
				<div class="product-category" v-if="product.variants && product.variants.length > 0">
					<span class="label">Variants</span>
					<span>{{ joinArray(product.variants,'name') }}</span>
				</div>
				<div class="product-category" v-for="(modifierGroup, index) in modifierGroups" v-bind:key="index">
					<span class="label">{{ modifierGroup.name }}</span>
					<span>{{ modifierGroup.modifiers }}</span>
				</div>
				<div class="product-details" v-for="(store,i) in stores" v-bind:key="i">
					<div class="product-category">
						<span class="label">Store</span>
						<span>{{ store.name }}</span>
					</div>
					<div class="product-category">
						<span class="label">Address</span>
						<div>
							<span>{{ store.address.string }}</span>
							<div v-for="(hour,h) in convertOpeningHours(store.openingHoursString)" v-bind:key="h">{{ hour }}</div>
						</div>
					</div>
				</div>
			</div>
			<div v-if="!product && !loading" class="product-content">Product is not available</div>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { getImage } from "@/connector/imageConnector.js";
import { getProductDetails } from "@/connector/v4/productConnector";
import { isEmpty } from "lodash";

export default {
	components: {
		LayoutVariantTwo
	},
	mixins: [utility],
	data() {
		return {
			loading: false,
			available: false,
			modifierGroups: [],
			product: null,
			brand: null,
			stores: [],
		};
	},
    props: {
        barcode: null,
    },
	methods: {
		scanQR(){
			var href = window.location.href;
            if(href.indexOf('#') > -1) {
				var idx = href.indexOf('#');
				window.location.href = href.substring(0,idx) + '#/scan-barcode';
			}
			this.$emit('show-scan');
		},
		getImage() {
			if(isEmpty(this.product)) return;
			var imageId = this.product.imageId;
			if(!imageId && this.product.imageId2) imageId = this.product.imageId2;
			if(!imageId && this.product.imageId3) imageId = this.product.imageId3;
			if(!imageId) return;
			return getImage(imageId);
		},
		currency(value){
			let currencySymbol = this.brand ? this.brand.currencySymbol : "PHP";
			if (value != null) {
				value = value.toFixed(2);
				let curr = '';
				let positiveValue = value.toString().split(".")[0];
				let decimalValue = value.toString().split(".").length > 1 ? value.toString().split(".")[1] : "00";
				let currRev = positiveValue.toString().split('').reverse().join('');
				for (let i = 0; i < currRev.length; i++) {
					if (i % 3 == 0) {
						curr += currRev.substr(i, 3) + ',';
					}
				}

				let totalString = curr.split('', curr.length - 1).reverse().join('');
				return currencySymbol + totalString + (decimalValue > 0 ? "." + decimalValue : "");
			}
		},
		getPrices(prd){
			let self = this;
			if(!prd.variants || isEmpty(prd.variants)) return self.currency(prd.price);
			var prices = [];
			prd.variants.forEach(function(v){
				var price = self.currency(v.price);
				if(prices.indexOf(price) == -1)prices.push(price);
			});
			return prices.join(' | ');
		},
		getBrand(){
			let self = this;
			if(!isEmpty(self.product) && !isEmpty(self.product.categories)){
				let hasParent = self.product.categories.find((it) => { return !isEmpty(it.parent) });
				if(!isEmpty(hasParent)) return hasParent.parent.name;
			}
			return !isEmpty(self.brand) ? self.brand.name : "";
		},
		getDesc(str){
			if(!str) return "";
			let arr = str.split("n\r\n").map((it)=>{
				let idx = it.indexOf("-");
				if(idx > -1) it = it.substring(idx+1);
				return '<li style="display:flex;"><span style="padding-right:12px;">-</span><span>'+it+'</span></li>';
			});
			if(arr.length == 1) return str;
			return arr.join("");
		},
		convertOpeningHours(string){
			var hours = [];
			if(!string) return hours;
			var list = string.split(';');
			if(list.length == 1) return [string];
			list.forEach(function(item){
				hours.push(item.trim());
			});
			return hours;
		},
		joinArray(arr, key){
			var cat = [];
			if(!arr) return;
			if(!key) return '';
			arr.forEach(function(c){
				cat.push(c[key]);
			});
			return cat.join(', ');
		},
		async getProductDetails(obj){
			if(obj.storeId) {
				delete obj.storeId;
			}
            var response = await getProductDetails(obj);
			this.loading = false;
			if (!response || !response.success){
				this.showNotification(
					"alert",
					"error_outline",
					`Product is not available!`
				);
				return;
			}
			this.brand = response.brand;
			this.product = response.product;
			this.stores = [];
			if(this.product && this.product.availableStores) {
				var stores = this.product.availableStores;
				this.stores = stores;
			}

			let modifierGroups = [];
			if(this.product.modifierGroups.length > 0){
				this.product.modifierGroups.forEach((mg)=>{
					let mod = [];
					if(mg.modifiers){
						mg.modifiers.forEach((md)=>{
							mod.push(md.name);
						});
					}
					mg.modifiers = mod.join(', ');
					modifierGroups.push(mg);
				});
			}
			this.modifierGroups = modifierGroups;
        }
	},
	async created() {
		try {
			this.loading = true;
			this.brand = null;
			this.product = null;
			this.stores = [];
			this.getProductDetails(this.barcode);
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
.product-header {
	padding: 16px;
	height: 56px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	.qr-icon {
		color: $primary-color-80;
		gap: 0;
		cursor: pointer;
	}
}

.product-content {
	width: 100%;
	height: auto;
	padding: 24px;
}

.product-logo-con {
	width: fit-content;
	margin: auto;
	margin-bottom: 32px;
	margin-top: -64px;
}
.product-logo {
	margin: 0 auto;
}
.product-image,
.product-no-image {
	width: 100%;
	height: 300px;
	max-height: 450px;

	img{
		width: inherit;
		height: inherit;
		object-fit: contain;
	}
}
.product-no-image {
	background-color: $secondary-color-30;
}

.product-name {
	width: 100%;
	font-size: 1.6em;
	font-weight: bold;
	text-align: left;
	line-height: 1.3;
	+.product-price {
		padding-top: 12px;
	}
}
.product-price {
	width: 100%;
	text-align: left;
	display: flex;
	align-item: center;
	justify-content: flex-start;

	.price {
		font-size: 1.6em;
		font-weight: bold;

		+.available,
		+.unavailable {
			margin-left: 18px;
		}
	}
	.available,
	.unavailable {
		font-size: 1.1em;
		font-weight: normal;
	}
	.available{ color: green;}
	.unavailable{ color: $primary-color-70;}

	+.product-category {
		padding-top: 48px;
	}
}
.product-category {
	width: 100%;
	font-size: 1em;
	text-align: left;
	display: flex;
	align-item: flex-start;
	justify-content: flex-start;

	.label {
		font-weight: bold;
		flex: 1;
		+* {
			flex: 3;
			display: block;
			padding-left: 16px;
		}
	}

	+.product-category,
	+.product-details {
		padding-top: 12px;
	}
}
.product-details {
	width: 100%;
	font-size: 1em;
	text-align: left;

	.label {
		font-weight: bold;
	}
	+.product-category {
		padding-top: 12px;
	}
	+.product-details {
		padding-top: 24px;
	}
}
</style>
