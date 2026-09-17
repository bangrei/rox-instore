<template>
  <div class="tags-content">
    <router-link :to="tag.link" class="tag-item" v-for="(tag, index) in tags" :key="index">
      <img :src="require('@/assets/images/' + tag.image)" :alt="tag.link">
    </router-link>
  </div>
</template>
<script>
export default {
  name: "TagsContent",
  data(){
    return {
      tags: [
        {link: "/collections/category/hike-climb-camp", image: "tags-1.webp"},
        {link: "/collections/category/ride", image: "tags-2.webp"},
        {link: "/collections/category/swim-surf", image: "tags-3.webp"},
        {link: "/collections/category/travel-adventure", image: "tags-4.webp"},
      ]
    }
  }
}
</script>
<style scoped lang="scss">
.tags-content {
  width: 100%;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 16px;
  column-gap: 16px;
  .tag-item {
    width: 100%;
    aspect-ratio: 1/1;
    text-decoration: none;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &:hover {
    .tag-item:not(:hover) {
      opacity: 0.7;
    }
  }
}
@media(min-width: 672px){
  .tags-content {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
</style>