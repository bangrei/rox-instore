<template>
	<scanner-box v-if="!barcodeObj" @scan-result="getScanned" @scan-loaded="onLoaded"></scanner-box>
    <product-content v-else :barcode="barcodeObj" @show-scan="showScan()"></product-content>
</template>

<script>
import ScannerBox from "./components/ScannerBox.vue";
import ProductContent from "./components/ProductContent.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
	name: "BarcodePage",
	components: {
        ScannerBox,
        ProductContent
	},
	mixins: [utility],
	data() {
		return {
			loading: false,
            barcodeObj: null,
		};
	},
	methods: {
        showScan(){
            this.barcodeObj = null;
        },
        getScanned(res){
            console.log('res', res);
            if(isEmpty(res)) return this.showNotification("alert", "error_outline", 'Invalid result!');
            this.parseParams(res);
        },
        parseParams(href){
            if(!href) return;
            var params = href;
            if(href.indexOf('?') > -1){
                var idx = href.indexOf('?');
                params = href.substring(idx+1);
                if(href.substring(idx+1,idx+2)=="&") params = href.substring(idx+2);
                window.location.href = href.substring(0,idx) + '?' + params;
            }
            params = new URLSearchParams(params);
            var obj = {
                brandCode: params.get('brandcode') || null,
                productId: params.get('product_id') || null,
                storeId: params.get('store_id') || null
            }
            this.barcodeObj = obj;
        }
    },
	async created() {
		try {
			this.loading = true;
            this.barcodeObj = null;
            var href = window.location.href;
            if(href.indexOf('?') > -1) this.parseParams(href);
		} catch (error) {
            this.barcodeObj = null;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>
