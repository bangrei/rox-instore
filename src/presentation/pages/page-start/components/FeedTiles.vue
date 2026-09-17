<template>
  <div class="highlight-tiles-wrapper">
    <div class="tags">
      <div class="tags-inner">
        <div @click="selectTag(null)" :class="['tag', {'active': activeTag == null}]">
          <div class="tag-text">All</div>
        </div>
        <div v-for="(tag, index) in tagArray" :key="index" @click="selectTag(tag.tag)" class="tag"
          :class="{ 'active': activeTag === tag.tag }">
          <div class="material-icons-outlined">{{ tag.icon }}</div>
          <div class="tag-text">{{ tag.tag }}</div>
        </div>
      </div>
    </div>
    <div class="tiles">
      <div v-for="(nudge, index) in finalNudges" :key="index" class="tile">
        <div class="tile-wrapper">
          <img :src="getImageUrl(nudge.image)" :alt="nudge.name">
          <p class="description" v-html="nudge.name"></p>
          <div class="content">
            <span class="content-tag" v-for="(tag, x) in nudge.tags" :key="x">{{ tag }}</span>
          </div>
        </div>
      </div>
      <div v-if="loadingData" class="loading-data">
        <div class="spinning"></div>
        <span class="loading-label">Fetching data...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { homeService } from "@/bloc/services";

export default {
  props: {
    serverInited: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      activeTag: null,
      loadingData: false,
      nudges: [],
      tags: [],
      finalTags: [],
      icons: [
        { tag: "Camping", icon: "home" },
        { tag: "Birthday", icon: "cake" },
        { tag: "Checklists", icon: "checklist" },
        { tag: "Info", icon: "info" },
        { tag: "*Digital Passport", icon: "book_5" },
        { tag: "Webinar", icon: "home" },
        { tag: "testnudgetag", icon: "home" },
        { tag: "Events", icon: "event" },
        { tag: "Cycling", icon: "directions_bike" },
        { tag: "Skills", icon: "home" },
        { tag: "nudge_1", icon: "home" },
        { tag: "UAT Nudges", icon: "home" },
        { tag: "Gear Guide", icon: "home" },
        { tag: "Gear Guides", icon: "home" }
      ],
      tiles: [
        {
          image: 'adventure_tips_1.png',
          link_text: "View Story",
          content: "Campfire cooking made easy",
          link_url: "/",
          custom_class: "small small-left small-1",
        },
        {
          image: "adventure_tips_2.png",
          link_text: "See More",
          content: "Setting up camp efficiently",
          link_url: "/",
          custom_class: "small small-right small-2",
        },
        {
          image: "adventure_tips_3.png",
          link_text: "Watch Now",
          content: "Finding the perfect spot",
          link_url: "/",
          custom_class: "big",
        },
      ],
    };
  },
  methods: {
    selectTag(tag) {
      if(tag == this.activeTag) return;
      this.activeTag = tag;
      this.retrieveNudges();
    },
    getImageUrl(imageName) {
      return imageName ? imageName : require('@/assets/images/no_image.png')
    },
    async retrieveNudges(local) {
      try {
        this.loadingData = true;
        const { nudges, tags } = await homeService.getNudgesPaginate({
          local: local,
          pageNum: 0,
				  pageSize: 8,
          tags: this.activeTag ? [this.activeTag] : []
        });
        this.nudges = homeService.getValidNudges(nudges);
        this.loadingData = false;
        const finalTags = [];
        this.tags = tags;
        const uniqueTags = [...new Set(this.tags)];
        uniqueTags.forEach((tag) => {
          finalTags[tag] = this.icons.find(item => item.tag === tag)?.icon || "home";
        });
        this.finalTags = finalTags;
      } catch (error) {
        this.loadingData = false;
      }
    },
  },
  async created() {
    this.retrieveNudges(!this.serverInited)
  },
  computed: {
    tagArray() {
      return Object.entries(this.finalTags).map(([tag, icon]) => ({ tag, icon }));
    },
    getSelectedNudges() {
      return this.finalNudges;
    },
    finalNudges(){
      let nudges = JSON.parse(JSON.stringify(this.nudges));
      if(!this.activeTag){
        return nudges?.splice(0, 8);
      }
      return nudges.filter(nudge => nudge.tags.includes(this.activeTag))?.splice(0,8);
    }
  }
};
</script>

<style scoped lang="scss">
.loading-data {
  width: 100%;
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  .spinning {
    width: 45px;
    height: 45px;
    margin: auto;
    border: 4px solid $secondary-color-40;
    border-left-color: transparent !important;
    border-radius: 50%;
  }
  .loading-label {
    font-size: 12px;
  }
}
.highlight-tiles-wrapper {
  padding-block: 24px;

  .tabs {
    margin-bottom: 20px;
    overflow: auto;
    border-bottom: 3px solid #999;

    .tab {
      float: left;
      padding: 10px;

      &.active {
        border-bottom: 4px solid red;
      }

      .material-icons-outlined {
        display: block;
        float: left;
        margin-right: 10px;
      }
    }
  }
  .tiles {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 20px;
    row-gap: 20px;
    padding: 20px;
  }
  .tile {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    .tile-wrapper {
      width: 100%;
      display: block;
    }
    img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
    }

    .content {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      padding-block: 8px;
      .content-tag {
        padding: 2px 12px;
        font-size: 0.8em;
        background: $white;
        border: 1px solid $secondary-color-20;
        border-radius: 12px;
      }
    }
    .description {
      margin-top: 12px;
      text-align: left;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      -webkit-box-orient: vertical;
    }
    img {
      border-radius: 10px;
    }

    &.small {
      width: 49%;
      float: left;
      height: 65vw;
      background-size: cover;
      border-radius: 20px;

      &.small-right {
        float: right !important;
      }
    }

    &.big {
      height: 30vh;
      clear: both;
      border-radius: 20px;
      width: 100%;

      .tile-details {
        text-align: center;
        left: 0;
        right: 0;
        margin: 0 auto;
        top: 10px;
      }

      .link-button {
        margin: 0 auto;
      }
    }

    .tile-details {
      overflow: auto;
      position: absolute;
      bottom: 0;
      width: 100%;
      z-index: 2;
      color: #fff;
      font-size: 20px;
      line-height: 23px;
      text-align: left;
      padding: 10px;
      margin-bottom: 15px;

      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 100%;

      .content {
        margin-bottom: 10px;
        font-size: 16px;
        line-height: 20px;
      }

      .mini-button-white {
        position: absolute;
        bottom: 0;
      }
    }
  }
}
.tags {
  position: relative;
  width: 100%;
  overflow: scroll;
  overflow-y: hidden;
  padding-inline: 24px;

  .tags-inner {
    display: flex;
    padding-bottom: 4px;
    width: 100%;
    border-bottom: 4px solid $secondary-color-20;

    .tag {
      padding-block: 9px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      gap: 8px;
      cursor: pointer;
      position: relative;
      padding-inline: 12px;
      font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
      &::before {
        position: absolute;
        content: "";
        border-bottom: 4px solid $secondary-color-20;
        left: 0;
        right: 0;
        bottom: -8px;
        z-index: 2;
      }

      .material-icons-outlined {
        line-height: 24px;
        display: block;
        float: left;
        width: 22px;
      }

      &.active {
        position: relative;
        color: $primary-color-60;
        &::before {
          border-bottom-color: $primary-color-60;
        }
      }

      .tag-text {
        float: right;
        display: block;
      }
    }
  }
}
@media (min-width: 672px) {
  .tags {
    &::-webkit-scrollbar {
      height: 0px !important;
    }
  }
  .tiles {
    grid-template-columns: 1fr 1fr 1fr 1fr !important;
  }
}
</style>
