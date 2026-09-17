<template>
    <layout-variant-two :show-main-logo="false" :show-loading-screen="loading">
		<template v-slot:body>
			<base-scanner 
                @barcode-scanned="barcodeScanned"
                @stop-scanner="stopScanner"
                :title="'Scan Product'"
                :subtitle="'Scan the barcode of your product'"
            ></base-scanner>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import BaseScanner from "@/components/base/BaseScanner.vue";
export default {
    name: "ScannerBox",
    components: {
        LayoutVariantTwo,
        BaseScanner
    },
    data() {
        return {};
    },
    methods: {
        barcodeScanned(res) {
            this.$emit('scan-result', res);
        },
        stopScanner(){
            this.$router.back();
        }
    },
};
</script>
