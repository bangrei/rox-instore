<template>
  <div class="promo-con">
    <input
      type="text"
      v-model="promoCode"
      placeholder="enter promo code"
      @keypress.enter="applyPromo()"
    />
    <div 
			class="promo-btn" 
			:class="{'processing': processing}"
			@click="applyPromo()"
		>Apply</div>
  </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";

export default {
  name: "WidgetPromoCode",
  mixins: [utility],
  props: {
    isEvent: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
			promoCode: "",
			processing: false,
    };
  },
  computed: {
    appliedPromoCodes() {
      let parent = this.$store.getters.getPromoCodes || {};
      let codes = [];
      for(let k in parent){
        codes = Array.from(new Set([...codes, ...parent[k]]))
      }
      return codes;
    },
  },
  methods: {
    async applyPromo() {
			if (!this.promoCode) return;
			if (this.processing) return;
      let parentPromoCodes = this.$store.getters.getPromoCodes || {};
      let keys = Object.keys(parentPromoCodes);
      if(this.isEvent){
        keys = ['event'];
      } else {
        let parentCarts = this.$store.getters.getCarts || {};
        for(let k in parentCarts){
          if(!parentPromoCodes[k]) {
            parentPromoCodes[k] = [];
            keys.push(k);
          }
        }
        /*
        let cartKeys = Object.keys(parentCarts);
        parentPromoCodes[cartKeys[0]] = [];
        keys = [cartKeys[0]];
        */
      }
      let promoCodes = [];
      let countApplied = 0;
      for(let k in parentPromoCodes) {
        if(parentPromoCodes[k].includes(this.promoCode)) countApplied += 1;
        promoCodes = Array.from(new Set([...promoCodes, ...parentPromoCodes[k]]));
      };
      if (countApplied == keys.length) {
        this.showNotification(
          "warning",
          "error_outline",
          `${this.promoCode} is already applied!`
        );
        return;
      }

      let currentPromocode = this.promoCode;
      promoCodes.push(this.promoCode);
      let mappedCodes = {};
      for(let i=0; i < keys.length;i++){
        let k = keys[i];
        if(!mappedCodes[k]) mappedCodes[k] = [];
        mappedCodes[k] = Array.from(new Set([...mappedCodes[k], ...promoCodes]));
      }
			this.$store.dispatch("setPromoCodes", mappedCodes);
			let self = this;
			this.processing = true;
			this.$emit("emit-promocode", currentPromocode, promoCodes, () => {
				self.promoCode = "";
				self.processing = false;
			});
    },
  },
};
</script>
<style scoped lang="scss">
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
  height: 100%;
  border-radius: 24px;
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
    border-radius: 24px;
    color: $white;
    margin: 0 auto;
    height: 100%;
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
    content: "Apply";
    z-index: 2;
    background: linear-gradient(90deg, $secondary-color-20, transparent);
  }
}
.promo-con {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
  height: 35px;

  input {
    border: 1px solid $secondary-color-30;
    padding: 8px 16px;
    outline: none;
    flex: 3;
    background: transparent;
    border-radius: 8px;
    height: 100%;
  }
  .promo-btn {
    cursor: pointer;
    border-radius: 24px;
    padding: 4px 24px;
    background: $white;
    border: 1px solid $main-red;
    color: $main-red;
    font-size: 0.9em;
    font-weight: normal;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
@media (min-width: 672px) {
  .promo-con {
    margin: 0;
  }
}
</style>
