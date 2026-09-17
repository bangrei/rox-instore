<template>
	<layout-variant-two class="main-con" :show-loading-screen="loading" @on-search="onSearch">
		<template v-slot:body>
            <collections-content ref="collectionPage" @initDone="initDone" :showSearchBar="true" :searchKey="keywords"/>
		</template>
        <template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="-1"></base-footer-nav> -->
            <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import CollectionsContent from "../page-collections/components/CollectionsContent.vue";

export default {
    name: "SearchPage",
    components: {
        LayoutVariantTwo,
        CollectionsContent,
    },
    data() {
        return {
            loading: false,
            keywords: "",
        };
    },
    methods: {
        initDone() {
            this.loading = false;
        },
        onSearch(key) {
            let same = key == this.keywords;
            this.keywords = key;
            this.$refs['collectionPage'].keywords = key;
            if (same) this.$refs['collectionPage'].searchProducts();
        }
    },
    async created() {
        this.keywords = this.$route.params.key || "";
        this.loading = true;
    }
};
</script>