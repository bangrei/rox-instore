<template>
  <layout-variant-two :show-loading-screen="false">
    <template v-slot:body>
      <div class="collection-info">
        <img :src="brandImage" :alt="brand?.name" v-if="brandImage">
        <div class="collection-title" v-if="collectionType" v-html="breadCrumbs"></div>
      </div>
      <collections-content
        :collectionType="collectionType"
        :collectionName="collectionName"
        @initDone="initDone"
      />
    </template>
    <template v-slot:footer>
      <!-- <base-footer-nav :active-footer-id="-1"></base-footer-nav> -->
      <base-side-nav v-if="!loading" :active-index="0" />
    </template>
  </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import CollectionsContent from "./components/CollectionsContent.vue";
import utility from "../../mixins/utility";

export default {
  name: "CollectionsPage",
  components: {
    LayoutVariantTwo,
    CollectionsContent,
  },
  mixins: [utility],
  data() {
    return {
      collectionType: "",
      collectionName: "",
      selectedCategories: [],
    };
  },
  computed: {
    brand() {
      let brands = this.collectBrandsList();
      let brand = brands.find((b) => b.apiCode == this.collectionName);
      return brand;
    },
    brandImage() {
      let image = this.brand?.imageId;
      if (!image) return "";
			return this.$store.getters.cloudinaryURL + "" + image;
    },
    breadCrumbs() {
      let text = "";
      let parents = this.mapProductCategories();
      let keys = this.collectionName.split("-");
      let keyRest = keys;
      let parentName = "";
      let subName = "";
      for (let i = 0; i < parents.length; i++){
        let parName = this.slugName(parents[i].name).toLowerCase();
        if (keys.map((k) => k.toLowerCase()).includes(parName)) {
          parentName = parents[i].name;
          keyRest = keyRest.filter((k) => k.toLowerCase() != parName);
          if (keyRest.length > 0) {
            let subs = parents[i].subCategories;
            let ex = subs.filter((f) => {
              return keyRest.map((s) => s.toLowerCase()).includes(f.toLowerCase());
            });
            if (ex.length) {
              subName = ex[0];
            }
          }
        }
      }
      let pks = [];
      if (parentName) pks = [parentName];
      if (subName) pks.push(subName);
      if (pks.length > 0) {
        let restkey = keys?.map((k) => k.toLowerCase()).filter((k) => !pks.map((x) => x.toLowerCase()).includes(k));
        if (restkey.length) pks = [...pks, ...[restkey.map((str) => {
          return str.charAt(0).toUpperCase() + str.slice(1)
        }).join(' ')]];
      }

      switch (this.collectionType) {
        case "brand":
          text = `Collections / ${this.brand?.name}`;
          break;
        case "category":
          text = `Collections / ${pks?.map((c) => `<a class="breadcrumb-link" href="/collections/category/${this.slugName(c.toLowerCase())}">${c}</a>`).join(' / ')}`
          break;
      }
      return text;
    },
    loading() {
      return !this.$store.getters.hasInited;
    }
  },
  methods: {
    initDone(categories) {
      this.selectedCategories = categories || [];
    }
  },
  created() {
    this.collectionType = this.$route.params.collectionType;
    this.collectionName = this.$route.params.collectionName;
  },
};
</script>
<style scoped lang="scss">
.collection-info {
  display: flex;
  gap: 8px;
  flex-direction: column;
  padding-inline: 20px;
  padding-top: 24px;
  img {
    height: 40px;
    width: fit-content;
    mix-blend-mode: multiply;
  }
  .collection-title {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 1.2em;
    display: flex;
    align-items: center;
    text-align: left;
    margin-block: 10px;
    gap: 6px;
  }
}
h1 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2em;
}
@media (min-width: 672px) {
  .collection-info {
    padding-inline: 4% !important;
  }
}
</style>

