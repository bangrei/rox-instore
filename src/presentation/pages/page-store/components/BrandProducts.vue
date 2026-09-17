<template>
	<div class="brands-con">
		<div class="brand-item" 
			v-for="brand in brands" 
      :key="brand.id"
    >
      <div class="brand-wrapper">
        <img :src="brandImage(brand)" :alt="brand.name">
        <router-link class="brand-button" :to="goToBrand(brand)">Shop {{ brand.name }}</router-link>
      </div>
      <div class="brand-products">
        <div class="brand-name">
          <img :src="brandImage(brand)" :alt="brand.name">
          <span>{{ brand.name }}</span>
        </div>
        <product-grid
          :products="brand.products"
          :more-button="false"
          :in-line="true"
          :nobox="false"
        />
      </div>
    </div>
	</div>
</template>

<script>
// import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
// import ProductsBrand from "./ProductsBrand.vue";
import ProductGrid from "./ProductGrid.vue";
export default {
  name: "BrandProducts",
  mixins: [utility],
  props: {
    brands: {
			type: Array,
			default: () => []
		},
  },
	components: {
    ProductGrid
	},
	data() {
		return {};
	},
  methods: {
    goToBrand(brand) {
			return `/brand/${brand.apiCode}`;
		},
    brandImage(brand) {
      const domain = this.$store.getters.cloudinaryURL;
      let image = brand.imageId;
      return `${domain}${image}?width=300`;
    },
	},
};
</script>

<style scoped lang="scss">
	.brands-con {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 64px;
    .brand-item {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      .brand-wrapper {
        flex: 1;
        min-width: calc(100% - 40px);
        max-width: calc(100% - 40px);
        margin-inline: auto;
        overflow: hidden;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-inline: 24px;
        border: 1px solid $secondary-color-20;
        background: $white;
        position: relative;
        img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .brand-button {
          text-decoration: none;
          color: $secondary-color-80;
          cursor: pointer;
          outline: none;
          border: none;
          padding: 8px 24px;
          border-radius: 24px;
          background: $white;
          -webkit-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
          -moz-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
          -o-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
          box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
          position: absolute;
          bottom: 24px;
          margin-inline: auto;
          font-size: 0.9em;
          font-weight: bold;
        }
      }
      .brand-products {
        flex: 1;
        max-width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .brand-name {
          display: none;
        }
      }
    }
  }
  @media (min-width: 672px) {
    .brands-con {
      padding-left: 20px;
      .brand-item {
        grid-template-columns: 560px auto;
        .brand-wrapper {
          padding-inline: 0 !important;
          max-width: 560px !important;
          min-width: 560px !important;
          aspect-ratio: 1/1;
          img {
            aspect-ratio: unset !important;
            mix-blend-mode: multiply;
          }
        }
        .brand-products {
          .brand-name {
            display: flex !important;
            align-items: center;
            gap: 24px;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            font-size: 2em;
            text-align: left;
            margin-top: 10px;
            margin-left: 20px;
            img {
              display: none;
            }
          }
        }
      }
    }
  }
  @media (min-width: 672px) and (max-width: 1024px){
    .brands-con {
      padding-left: 0 !important;
      .brand-item {
        grid-template-columns: 0 auto !important;
        gap: 0 !important;
        .brand-wrapper {
          max-width: 0 !important;
          min-width: 0 !important;
          border-color: transparent !important;
          img {
            aspect-ratio: unset !important;
          }
        }
        .brand-name {
          display: flex !important;
          align-items: baseline;
          img {
            display: block !important;
            height: 50px;
            mix-blend-mode: multiply;
          }
        }
      }
    }
    .brand-name,
    .products-wrapper {
      padding-left: 20px !important;
    }
  }
</style>
