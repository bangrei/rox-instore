<template>
  <layout-variant-two :show-loading-screen="loading">
    <template v-slot:body>
      <h1 class="stores-head">Our Stores</h1>
      <div class="stores-content">
        <div class="outlet" v-for="(outlet, index) in outlets" :key="index">
          <label>{{ outlet.name }}</label>
          <div class="line">
            <!-- <i class="material-icons">phone</i> -->
            <span>📞 {{ outlet.phone }}</span>
          </div>
          <div class="line">
            <!-- <i class="material-icons">place</i> -->
            <span>📍 {{ outlet.address }}</span>
          </div>
          <div class="line">
            <!-- <i class="material-icons">email</i> -->
            <span>📧 {{ outlet.email }}</span>
          </div>
          <div class="line">
            <!-- <i class="material-icons">access_time</i> -->
            <span v-if="outlet.openingHours">🕒 {{ outlet.openingHours }}</span>
          </div>
        </div>
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
  name: "OurStoresPage",
  components: {
    LayoutVariantTwo
  },
  mixins: [utility],
  data(){
    return {
      loading: true,
      outlets: []
    }
  },
  methods: {
    fetchOutlets(){
      this.outlets = [
        {
          name: "R.O.X. AYALA ABREEZA",
          phone: "0967 677 2651",
          address: "Level 1 Space 1E Abreeza Ayala Malls Jp Laurel Ave. Bajada, Davao City",
          email: "rox.abreeza@primergrp.com",
          openingHours: "Daily: 10AM - 7PM"
        },
        {
          name: "R.O.X. AYALA BONIFACIO HIGH STREET",
          phone: "0916 267 5528",
          address: "B1, 7th Ave. Cor. Lane O Bonifacio High St. Bonifacio Global City, Taguig City",
          email: "rox.bhs@primergrp.com",
          openingHours: "Sun-Thurs 11AM - 10PM, Fri-Sat: 11AM - 11PM"
        },
        {
          name: "R.O.X. AYALA CAMP JOHN HAY",
          phone: "0949 718 7873",
          address: "Retail Cluster C Ordonio Drive, Camp John Hay, Loakan Road, Baguio City",
          email: "rox.campjohnhay@primergrp.com",
          openingHours: "Sun-Thurs 11AM - 10PM, Fri-Sat: 11AM - 11PM"
        },
        {
          name: "R.O.X. AYALA CENTER CEBU",
          phone: "0992 401 9642",
          address: "Space L240 And L241A-L214B, Level 2, Ayala Center Cebu, Active Zone, Cebu Business Park, Cebu City",
          email: "rox.ayalacebu@primergrp.com",
          openingHours: "Sun-Mon 10AM - 9PM; Fri-Sat 10AM - 10PM"
        },
        {
          name: "R.O.X. AYALA MALLS LEGAZPI",
          phone: "0967 062 0539",
          address: "Unit 237-239 2F Liberty City Center Mall, Cor. Rizal St. Legazpi City, Albay",
          email: "rox.legazpi@primergrp.com",
          openingHours: "Daily 10AM - 8PM"
        },
        {
          name: "R.O.X. AYALA MARQUEE MALL",
          phone: "0992 667 8826",
          address: "Ground Floor, Marquee Mall, Aniceto Gueco St. corner NLEX, Angeles City, Pampanga",
          email: "rox.marqueemall@primergrp.com",
          openingHours: ""
        },
        {
          name: "R.O.X. Ayala Centrio",
          phone: "0995 382 5880",
          address: "R.O.X- Level 2 Space 2013,2014 & 2163 Centrio Mall Barangay 24, Cagayan De Oro City",
          email: "rox.centrio@primergrp.com",
          openingHours: "Daily: 10AM - 9PM"
        },
        {
          name: "R.O.X. One Ayala Makati",
          phone: "0976 550 3526",
          address: "Unit J-302, 3rd Floor, One Ayala, San Lorenzo Village, Makati City 1224",
          email: "rox.oneayalamakati@primergrp.com",
          openingHours: "Mon-Thurs: 10AM - 9PM; Fri-Sun: 10AM - 10PM"
        },
        {
          name: "R.O.X. PLAYGRND SM SEASIDE CEBU",
          phone: "0953 340 4688",
          address: "Space No. 2082 SM Seaside City Mall South Road Properties, Mambaling, Cebu City.",
          email: "rox.sscebu@primergrp.com",
          openingHours: "Sun-Thurs 10AM - 9PM, Fri-Sat 10AM - 10PM"
        },
        {
          name: "R.O.X. PLAYGROUND SM OLONGAPO",
          phone: "0966 133 8267",
          address: "Space 248A SM City Olongapo Central Level 2 KBG Complex East Tapinac, Olongapo City, Zambales",
          email: "rox.smolongapo@primergrp.com",
          openingHours: "Daily 10AM - 9PM"
        },
        {
          name: "R.O.X. PLAYGROUND SM BUTUAN",
          phone: "0930 927 1028",
          address: "Space No. 127-128 SM City Butuan, J C Aquino Ave, Butuan City, Agusan Del Norte",
          email: "rox.smbutuan@primergrp.com",
          openingHours: "Daily 10AM - 10PM"
        },
        {
          name: "R.O.X. PLAYGROUND AYALA ALABANG TOWN CENTER",
          phone: "0956 966 4584",
          address: "2nd Level 3010B New Wing, Atc, Ayala Alabang",
          email: "rox.atc@primergrp.com",
          openingHours: "Mon-Fri: 11AM - 9PM, Sat-Sun: 10AM - 9PM"
        },
        {
          name: "R.O.X. PLAYGRND Nustar",
          phone: "0976 576 4065",
          address: "Unit 216 - 217 Level 2 The Mall At Nustar, Cebu",
          email: "rox.nustar@primergrp.com",
          openingHours: "Daily 11AM-11PM"
        },
        {
          name: "R.O.X. SM Megamall",
          phone: "0976 565 6127",
          address: "Unit 335A, Bldg A, SM Megamall Greenhills Wackwack, Mandaluyong City",
          email: "alvin.reyes@primergrp.com",
          openingHours: "Daily 10AM - 10PM"
        },
      ];
    }
  },
  async created(){
    if(!this.$store.getters.hasInited){
      await this.refreshMainData();
    }
    this.fetchOutlets();
    this.loading = false;
  }
}
</script>
<style scoped lang="scss">
.stores-head {
  margin-top: 150px;
  margin-bottom: 48px;
  display: block;
}
.stores-content {
  margin-top: 32px;
  margin-bottom: 64px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 48px;
  column-gap: 24px;
  text-align: left;
  padding-inline: 24px;
}
.outlet {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
label {
  font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
  color: $main-red;
}
.line {
  display: inline;
  .material-icons,
  .material-icons-outlined {
    font-size: 18px !important;
    margin-right: 4px;
  }
  span {
    line-height: 12px;
  }
}
@media (min-width: 672px) {
  .stores-content {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr !important;
  }
}
@media (min-width: 1024px) and (max-width: 1100px) {
  .stores-content {
    grid-template-columns: 1fr 1fr 1fr 1fr !important;
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .stores-content {
    grid-template-columns: 1fr 1fr !important;
  }
}
</style>