<template>
  <div class="video-wrapper">
    <video
      ref="videoPlayer"
      width="600"
      controls2
      :src="videoSrc"
      muted
      playsinline
      loop
    ></video>
  </div>
</template>

<script>
export default {
  props: {
    videoSrc: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.createObserver();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    createObserver() {
      const options = {
        root: null, // viewport
        threshold: 0.5, // 50% of the video should be visible to trigger
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = this.$refs.videoPlayer;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      }, options);

      this.observer.observe(this.$refs.videoPlayer);
    },
  },
};
</script>

<style scoped lang="scss">
video {
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
}
.video-wrapper {
  padding-inline: 20px;
  width: 100%;
}
@media (min-width: 672px) and (max-width: 820px){
  video {
    float: left;
    max-width: 100% !important;
    min-width: 100% !important;
  }
  .video-wrapper {
    max-width: 100% !important;
    min-width: 100% !important;
  }
}
@media (min-width: 672px) and (max-width: 1024px){
  video {
    float: left;
    max-width: 400px !important;
    min-width: 400px !important;
  }
  .video-wrapper {
    max-width: 400px !important;
    min-width: 400px !important;
  }
}
@media (min-width: 672px) {
  video {
    float: left;
    max-width: 560px;
    min-width: 560px;
  }
  .video-wrapper {
    max-width: 560px;
    min-width: 560px;
  }
}
</style>
