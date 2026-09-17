<template>
  <div class="empty-wrapper">
    <img :src="require('@/assets/images/feed-empty-state.png')"/>
    <label>Hmm... nothing turned up</label>
    <span>No articles match your search. Try tweaking filters or using other keywords.</span>
  </div>
</template>
<script>
export default {
  name: "BaseEmptyFeedState",
}
</script>
<style scoped lang="scss">
.empty-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 24px;
  img {
    max-width: 160px;
    width: 100%;
    margin-inline: auto;
  }
  label {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 24px;
    line-height: 38px;
  }
  span {
    font-family: "Akzidenz Grotesk Regular" !important;
  }
}
</style>