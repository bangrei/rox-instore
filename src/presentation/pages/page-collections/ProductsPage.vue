<template>
  <layout-variant-two :show-loading-screen="false" :active-menu-index="3">
    <template v-slot:body>
      <collections-content @initDone="initDone" :showSearchBar="true"/>
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
import utility from "../../mixins/utility";

export default {
  name: "ProductsPage",
  mixins: [utility],
  components: {
		LayoutVariantTwo,
		CollectionsContent
  },
  computed: {
    loading() {
      return !this.$store.getters.hasInited;
    }
  },
  methods: {
    initDone() {}
  }
};
</script>
