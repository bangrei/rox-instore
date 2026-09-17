<template>
  <layout-variant-two :show-loading-screen="loading">
    <template v-slot:body>
      <div class="collection-info" v-if="!loading">
        <h1>Products on Sale</h1>
      </div>
      <collections-content @initDone="initDone" :saleOnly="true"/>
    </template>
    <template v-slot:footer>
      <!-- <base-footer-nav :active-footer-id="-1"></base-footer-nav> -->
      <base-side-nav v-if="!loading" :active-index="0" />
    </template>
  </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import CollectionsContent from "../page-collections/components/CollectionsContent.vue";

export default {
  name: "SaleProductsPage",
  components: {
		LayoutVariantTwo,
		CollectionsContent
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    initDone() {
      this.loading = false;
    }
  },
  async created() {
    this.loading = true;
  },
};
</script>
<style scoped lang="scss">
.collection-info {
  display: flex;
  gap: 24px;
  justify-content: space-between;
  padding-inline: 24px;
  padding-top: 24px;
  color: $primary-color-60;
  justify-content: center;
}
h1 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2em;
}
@media (min-width: 672px) {
  .collection-info {
    padding-inline: 7% !important;
  }
}
</style>
