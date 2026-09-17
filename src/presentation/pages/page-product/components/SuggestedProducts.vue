<template>
  <div class="div-con">
    <span class="label-suggested" v-if="products.length > 0">You Might Also Like</span>
    <product-grid v-if="products.length > 0" 
      :products="products" 
      :more-button="false" 
      :in-line="true"
      withPadding></product-grid>
  </div>
</template>
<script>
import { isEmpty } from "lodash";
import ProductGrid from "../../page-store/components/ProductGrid.vue";
import { productService } from "@/bloc/services";
export default {
  name: "SuggestedProducts",
  components: {
    ProductGrid,
  },
  props: {
    productsList: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      products: [],
    }
  },
  watch: {
    productsList: {
      handler(){
        this.initProducts();
      },
      deep: true,
    }
  },
  methods: {
    async initProducts(){
      if (isEmpty(this.productsList)) return;
      let categories = [];
      for (let i = 0; i < this.productsList.length; i++){
        categories = [...categories, ...this.productsList[i].categories];
      }
      const params = {
        pageNumber: 0,
        pageSize: 10,
        stockStatus: "INSTOCK",
        sortBy: "newest",
        categories: categories.map((it) => it.name),
        brands: this.productsList.map((prd) => prd.brand)
      }
      const json = await productService.retrieveProductsList(params);
      if(!json?.products){
        this.products = [];
        return;
      }
      this.products = json?.products.map((prd) => {
        prd.brands = json?.brands?.length ? json.brands?.filter((brand) => brand.apiCode == prd.brand) : [];
        return prd;
      })?.filter((it) => !this.productsList.map((p) => p.id).includes(it.id));
    }
  }
}
</script>
<style scoped lang="scss">
  .div-con {
    width: 100%;
    padding-block: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .label-suggested {
    display: block;
    width: 100%;
    margin-top: 24px;
    font-size: 1.3em;
    color: $blue-powder;
    font-weight: normal;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    padding-inline: 20px;
    text-align: left;
  }
  @media (min-width: 672px) {
    .div-con {
      padding-inline: 4%;
    }
    .label-suggested {
      padding-inline: 0;
    }
  }
</style>
