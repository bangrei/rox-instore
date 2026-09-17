<template>
  <div class="ig-main">
    <h1>Follow us on Instagram</h1>
    <div class="ig-container">
      <button class="button-nav prev" @click="scrollLeft">
        <i class="material-icons-outlined">chevron_left</i>
      </button>
      <button class="button-nav next" @click="scrollRight">
        <i class="material-icons-outlined">chevron_right</i>
      </button>
      <div class="ig-feeds">
        <div class="ig-feed" v-for="link in links" :key="link">
          <div class="feed-wrapper">
            <div class="overlay"></div>
            <iframe :src="`${baseurl}/${link}/embed`" 
              frameborder="0" 
              scrolling="no" 
              allowtransparency="true"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "IGFeed",
  data() {
    return {
      baseurl: "https://www.instagram.com",
      useSingle: false,
      singleLink: "DGnGfb0yMQC",
      links: [],
    }
  },
  methods: {
    scrollRight() {
      let target = document.querySelector('.ig-feeds');
      target.scrollLeft += target.clientWidth;
    },
		scrollLeft() {
      let target = document.querySelector('.ig-feeds');
      if (target.scrollLeft <= 0) return;
      target.scrollLeft -= target.clientWidth;
    },
  },
  async created() {
    if (!this.useSingle) {
      this.links = [
        "/p/DOFfAfljFtu",
        "/p/DODjX0SAWMx",
        "/p/DN9ONo-jRTj",
        "/p/DN2yUEEWHX1",
        // "/reel/DOGPLJWDK-z",
        // "/p/DOBRCoICSMw",
        // "/reel/DN-Z0DVjHCp",
        "/p/DN8HoOvEqLt",
        "/p/DN10iflUtuc",
        "/p/DNhHXsDPDZF"
        // "/p/DN0NhJ62G0m"
      ]
    }
  }
} 
</script>
<style scoped lang="scss">
.button-nav {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 42px;
  width: 42px;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  margin-block: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $white;
  border: none;
  z-index: 10;
  color: $main-red;
  box-shadow: 0 0px 8px rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 0 0px 8px rgba(0, 0, 0, 0.2);
  &.next {
    right: 0;
  }
}
.ig-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-block: 32px;
  margin-top: 32px;
  h1 {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-inline: 24px;
    margin-bottom: 32px;
    font-size: 24px;
    color: $main-red;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-weight: normal !important;
  }
}
.ig-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.ig-feeds {
  flex: 2;
  width: 100%;
  display: flex;
  gap: 18px;
  overflow: hidden;
  overflow-x: auto;
  padding-inline: 24px;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    height: 0 !important;
  }
  .ig-feed {
    min-width: 200px;
    max-width: 200px;
    overflow: hidden;
    .feed-wrapper {
      width: 100%;
      height: 100%;
      aspect-ratio: 3/4;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s linear;
      -webkit-transition: all 0.3s linear;
      .overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: rgba(0,0,0,.5);
        z-index: 2;
        opacity: 0;
        transition: all 0.3s linear;
        -webkit-transition: all 0.3s linear;
      }
      iframe {
        height: 143%;
        aspect-ratio: 3/4;
      }
    }
  }
  &:hover .ig-feed:is(:hover) {
    .feed-wrapper {
      transform: scale(1.1);
      -webkit-transform: scale(1.1);
    }
  }
  &:hover .ig-feed:not(:hover) {
    .overlay {
      opacity: 1 !important;
    }
  }
}
@media(min-width: 672px){
  .ig-feed {
    min-width: 300px !important;
    max-width: 300px !important;
  }
}
@media(min-width: 672px) and (max-width: 1024px){
  .ig-container {
    flex-direction: column !important;
  }
  .ig-feeds {
    .ig-feed {
      min-width: 250px !important;
      max-width: 250px !important;
    }
    iframe {
      height: 150% !important;
    }
  }
}
</style>
