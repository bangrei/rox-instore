<template>
  <layout-variant-two :show-loading-screen="loading">
    <template v-slot:body>
      <h1>About Us</h1>
      <div class="content-about">
        <p>
          Recreational Outdoor eXchange (R.O.X.) pushes the limits of where you can go and what you can do outdoors. 
          As the one-stop-shop for your adventure needs, we got you covered with the latest and greatest gear from our expansive roster of global outdoor brands. 
          Choose from a selection of the biggest labels known around the world such as The North Face, Salomon, Columbia Sportswear, Sea To Summit, Nalgene, 
          Fox Racing, Hydro Flask, Osprey, Billabong, Quicksilver, DC, Eagle Creek, Black Diamond, Mountain Hardwear, and much more.
        </p>
        <p>
          R.O.X. is the biggest outdoor superstore in Southeast Asia. 
          But our expertise go beyond just gearing you up. We also go all-in on supporting grassroots communities, 
          nature conservation efforts, and delivering programs that show you the ways you can enjoy the outdoors no matter who you may be.
        </p>
        <p>When it comes to adventure, we always go all out!</p>
      </div>
    </template>
    <template v-slot:footer>
			<base-side-nav/>
		</template>
  </layout-variant-two>
</template>
<script>
import LayoutVariantTwo from '../../../components/layout/LayoutVariantTwo.vue';
import utility from '../../mixins/utility';
export default {
  name: "AboutUsPage",
  components: {
    LayoutVariantTwo
  },
  mixins: [utility],
  data(){
    return {
      loading: true,
    }
  },
  async created(){
    if(!this.$store.getters.hasInited){
      await this.refreshMainData();
    }
    this.loading = false;
  }
}
</script>
<style scoped lang="scss">
h1 {
  margin-top: 150px;
  margin-bottom: 48px;
  color: $main-red;
}
.content-about {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-inline: 24px;
  max-width: 650px;
  margin-inline: auto;
  margin-bottom: 64px;
  text-align: left;
}
p {
  display: block;
  font-size: 17px;
  line-height: 28px;
}
</style>