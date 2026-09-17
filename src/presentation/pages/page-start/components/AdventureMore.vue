<template>
  <div class="adventure-container">
    <div class="adventure-head">Experience more adventures</div>
    <div class="adventure-image">
      <img :src="image" width="1920" height="200" alt="Experience more adventures"/>
      <router-link to="/events" class="button-link">Browse more adventures</router-link>
    </div>
  </div>
</template>
<script>
import grabMartImage from "@/assets/bannerslider/grab-mart-banner.png";
export default {
  name: "AdventureMore",
  data(){
    return {
      image: grabMartImage
    }
  }
}
</script>
<style scoped lang="scss">
.adventure-container {
  width: 100%;
  padding-block: 48px;
  background: $custom-bg;
  overflow: hidden;
  padding-inline: 20px;
}
.adventure-head {
  font-size: 30px;
  font-family: "Berthold Akzidenz Grotesk Medium";
  color: $main-red;
  margin-bottom: 20px;
  line-height: normal;
  text-align: left;
}
.adventure-image {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  img {
    min-width: 100%;
    max-width: 100%;
    height: auto !important;
    border-radius: 16px;
  }
  button,
  .button-link {
    text-decoration: none;
    color: $secondary-color-90;
    position: sticky;
    bottom: 10%;
    border-radius: 999px;
    padding: 6px 24px;
    background: $white;
    font-family: "Berthold Akzidenz Grotesk Medium";
    cursor: pointer;
    border: none;
    box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
    &:hover {
      background: $secondary-color-20;
    }
  }
}
</style>