<template>
  <div class="wrapper">
    <div class="inner">
      <div class="top-block">
        <span class="material-icons-outlined">local_shipping</span>
        <div class="top-block-title">Free Shipping</div>
        <div class="top-block-text">Spend P3,000 to unlock this deal</div>
      </div>

      <div class="top-block">
        <span class="material-icons-outlined">map</span>
        <router-link to="/" class="top-block-link">Go</router-link>
        <div class="top-block-title">Find R.O.X</div>
        <div class="top-block-text">Find the nearest R.O.X. store</div>
      </div>
      <div class="top-block">
        <span class="material-icons-outlined">sell</span>
        <div class="top-block-title">Get P150 OFF</div>
        <div class="top-block-text">Your first purchase just got better</div>
      </div>
      <div class="top-block">
        <span class="material-icons-outlined">build</span>
        <div class="top-block-title">Services</div>
        <div class="top-block-text">Something exciting is on the way</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {};
</script>

<style scoped lang="scss">
.top-block {
  border: 1px solid hsl(0deg, 0%, 88%);
  border-radius: 20px;
  width: 184px;
  padding: 15px;
  float: left;
  height: 160px;
  text-align: left;
}

.inner {
  width: max-content;
  overflow: auto;
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
}

.wrapper {
  overflow: auto !important;
  padding-inline: 20px;
}

.material-icons-outlined {
  color: $primary-color-60;
  font-size: 35px;
}

.top-block-link {
  background-color: $primary-color-60;
  color: $white;
  text-decoration: none;
  padding: 7px 17px;
  border-radius: 999px;
  float: right;
  box-shadow: -1px 1px 8px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease;
  font-family: "Berthold Akzidenz Grotesk Medium";
}

.top-block-title {
  font-weight: 800;
  margin-bottom: 8px;
  margin-top: 12px;
  font-family: "Berthold Akzidenz Grotesk Medium";
}

@media (min-width: 672px) {
  .inner {
    width: 100%;
  }
  .top-block {
    flex: 1;
    height: 149px;
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .inner {
    width: max-content !important;
  }
  .top-block {
    flex: unset !important;
    width: 265px;
  }
}
</style>
