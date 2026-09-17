<template>
    <div class="scan-con">
        <div class="scan-area">
            <StreamBarcodeReader 
                :class="`scan-box ` + flipClass" 
                @decode="(res,b,c) => onDecode(res,b,c)" 
                @loaded="() => onLoaded()"
                ref="scanReader">
            </StreamBarcodeReader>
        </div>
        <div class="scan-info">
            <div class="scan-header">
                <div class="scan-header-left">
                    <base-icon
                        class="sd-icon-btn-ghost sd-icon-btn-xsm"
                        iconName="arrow_back"
                        iconSize="lg"
                        @click="stopScanner()"
                    ></base-icon>
                </div>
                <div class="scan-label">{{ title }}</div>
                    <base-icon
                        class="sd-icon-btn-ghost sd-icon-btn-xsm"
                        iconName="flip_camera_android"
                        iconSize="lg"
                        @click="flipCamera"
                    ></base-icon>
            </div>
            <div class="scan-body">
                <div class="body-icon">
                    <base-icon
                        class="sd-icon-btn-ghost sd-icon-btn-xl"
                        iconName="hourglass_bottom"
                        iconSize="xxlg"
                    ></base-icon>
                </div>
                <h4 style="text-align: center;">{{ subtitle }}</h4>
            </div>
        </div>
    </div>
</template>

<script>
import { StreamBarcodeReader } from "vue-barcode-reader";
import utility from "@/presentation/mixins/utility.js";
export default {
    name: "BaseScanner",
    components: {
        StreamBarcodeReader,
    },
    mixins: [utility],
    props: {
        title: {
			type: String,
			default: 'Scan Product'
		},
        subtitle: {
            type: String,
            default: 'Scan the barcode of your product'
        }
	},
    data() {
        return {
            flipClass: "",
            loading: false,
            flip: false,
            barcodeObj: null,
        };
    },
    methods: {
        stopScanner(){
            this.$refs.scanReader.codeReader.reset();
            this.$emit('stop-scanner');
        },
        onDecode(res,b,c) {
            console.log(res,b,c);
            this.$refs.scanReader.codeReader.reset();
            this.$emit('barcode-scanned', res);
        },
        onLoaded() {
            this.loading = false;
        },
        flipCamera(){
            this.flip = !this.flip;
        }
    },
    watch: {
        flip(val){
            this.flipClass = "";
            if(val) this.flipClass = "flip-camera";
        }
    },
    async created() {
		try {
			this.loading = true;
            this.flip = false;
            this.barcodeObj = null;
		} catch (error) {
            this.barcodeObj = null;
			this.showNotification("alert", "error_outline", error);
		}
	},
    beforeUnmount(){
        this.$refs.scanReader.codeReader.reset();
    }
};
</script>
