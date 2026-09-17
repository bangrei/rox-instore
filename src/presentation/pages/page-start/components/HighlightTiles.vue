<template>
  <div class="highlight-tiles-wrapper">
    <div
      v-for="(item, index) in tiles"
      :key="index"
      :class="item.custom_class"
      class="tile"
    >
      <img :src="require('@/assets/images/' + item.image)" />
      <p class="content" v-html="item.content"></p>
      <router-link class="mini-button-white link-button" :to="item.link_url">
        {{ item.link_text }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    nudges: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tiles: [
        {
          image: "highlights_1.png",
          content: "",
          link_text: "Articles",
          link_url: "/feeds",
          custom_class: "big",
        },
        {
          image: "highlights_2.png",
          content: "",
          link_text: "Surprises",
          link_url: "/feeds",
          custom_class: "small small-left small-1",
        },
        {
          image: "highlights_3.png",
          content: "",
          link_text: "Survey",
          link_url: "/feeds",
          custom_class: "small small-right tile-text ",
        },
      ],
    };
  },
  created() {
    if (!this.nudges) return;
    let nudges = [...this.nudges];
    nudges.sort((a, b) => b.published - a.published);
    let article = this.nudges.find((it) => it.type == "ARTICLE");
    let survey = this.nudges.find((it) => it.type == "QUESTIONNAIRE");
    let surprise = this.nudges.find((it) => it.type == "SURPRISE");
    console.log(surprise);
    if (article) {
      this.tiles[0].link_url = `/article/${article.id}`;
      this.tiles[0].content = `<p style='margin-bottom:10px;'><b style='font-size:18px;'>${article.name}</b></p> ${article.description}`;

    }
    if (surprise) {
      this.tiles[1].link_url = `/surprise/${surprise.id}`;
      this.tiles[1].content = `<p style='margin-bottom:10px;'><b style='font-size:18px;'>${surprise.name}</b></p> ${surprise.description}`;
    }
    if (survey) {
      this.tiles[2].link_url = `/survey/${survey.id}`;
      this.tiles[2].content = `<p style='margin-bottom:10px;'><b style='font-size:18px;'>${survey.tags.join(', ')}</b></p> ${survey.name}`
    }
  }
};
</script>

<style scoped lang="scss">
.highlight-tiles-wrapper {
  padding: 20px;
  width: 100%;
  gap: 20px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;

  img {
    border-radius: 20px;
    height: 100%;
    object-fit: cover;
    min-width: 100%;
  }

  .link-button {
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    bottom: 3vh;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
  }

  .tile {
    position: relative;
    width: 100%;
    height: 200px;
  }

  p.content {
    font-size: 15px;
    color: $white;
    line-height: 20px;
    text-align: center;
    width: 100%;
    position: absolute;
    top: 16px;
    padding-inline: 12px;
  }

  .tile-text h1 {
    font-size: 22px;
  }

  .small.small-right {
    float: right !important;
  }
  .big {
    grid-column: span 2 / span 2;
  }
}
@media (min-width: 672px) {
  .highlight-tiles-wrapper {
    grid-template-columns: 1fr 1fr 1fr !important;
  }
  .tile {
    height: 250px !important;
  }
  .big {
    grid-column: span 1 / span 1 !important;
  }
}
</style>
