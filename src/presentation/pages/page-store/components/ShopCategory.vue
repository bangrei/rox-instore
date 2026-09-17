<template>
  <div class="cat-con">
    <div class="cat-items">
      <router-link
        :to="goSearch(cat)"
        class="cat-item"
        v-for="(cat, index) in brands"
        :key="index"
      >
        <div class="cat-content" :class="{ 'with-image': cat.imageId != null }">
          <img
            v-if="cat.imageId"
            :alt="cat.name"
            :src="getImage(cat.imageId)"
          />
          <span class="cat-avatar" v-else>{{ avatar(cat.name) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
export default {
	mixins: [utility],
	props: {
		activities: {
			type: Object,
			default: () => { },
		},
		isDesktop: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			brands: [],
			label: "",
		};
	},
	methods: {
		goSearch(brand) {
			return `/collections/brand/${brand.apiCode}`;
		},
		getImage(image) {
			if (!image) return "";
			return this.$store.getters.cloudinaryURL + image + "?width=300";
		},
		init() {
			if (!isEmpty(this.activities)) {
				this.label = `From<br/>${this.activities.from} to ${this.activities.to}`;
				this.brands = this.activities.brands || [];
			}
		},
	},
	async created() {
		this.init();
	},
};
</script>

<style scoped lang="scss">
.cat-con {
  width: 100%;
  padding: 24px 0px;
  display: flex;
  gap: 12px;
  overflow: hidden;
  overflow-x: auto;

  .cat-items {
    display: flex;
    gap: 12px;
    padding-inline: 20px;
    align-items: center;
  }

  .cat-item {
    flex: 1;
    min-width: 100px;
    max-width: 100px;
    position: relative;
    text-decoration: none;
    height: fit-content;
    &.cat-title {
      min-width: 55px;
      max-width: 55px;
      padding: 0;
      font-weight: bold;
      font-family: "Berthold Akzidenz Grotesk Medium";
      text-align: left;
    }

    &:not(.cat-title) {
      .cat-content:not(.with-image) {
        background: $secondary-color-10;
      }
    }

    .cat-content {
      width: 100%;
      background-position: center;
      background-size: cover;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        width: 90%;
        mix-blend-mode:multiply;
      }

      & + .label {
        margin-top: 8px;
      }

      .cat-avatar {
        color: $primary-color-60;
        font-size: 1.5em;
        font-weight: bold;
      }
    }

    .label {
      color: $secondary-color-80;
      font-size: 1em;
      display: block;
      text-decoration: none;
    }
  }
}
@media (min-width: 672px) {
  .cat-con {
    .cat-items {
      display: grid;
      width: 100%;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      .cat-item {
        min-width: 100%;
        max-width: 100%;
      }
    }
  }
}
</style>
