<template>
  <div :class="['footer-container', {'red': footerRed}]">
    <span class="footer-app">&copy; Copyright {{ thisYear }} R.O.X. Recreational Outdoor eXchange.<br/>All rights reserved</span>
    <div class="footer-wrapper">
      <div class="footer-content">
        <label>Support</label>
        <router-link to="/our-stores" class="router-item">Our Stores</router-link>
        <router-link to="/about-us" class="router-item">About Us</router-link>
        <router-link to="/faq" class="router-item">FAQ</router-link>
      </div>
      <div class="footer-media">
        <label>Legal</label>
        <router-link to="/privacy-policy" class="router-item">Privacy Policy</router-link>
        <router-link to="/terms-of-services" class="router-item">Terms and Conditions</router-link>
        <router-link to="/return-policy" class="router-item">Return Policy</router-link>
      </div>
      <div class="footer-content">
        <label>Account</label>
        <router-link to="/profile" class="router-item">My Account</router-link>
        <router-link to="/my-order" class="router-item">My Orders</router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "BaseFnbFooter",
  props: {
    footerRed: {
			type: Boolean,
			default: false,
		},
  },
  computed: {
    thisYear(){
      const date = new Date();
			return date.getFullYear();
    }
  }
}
</script>
<style scoped lang="scss">
.footer-container {
	padding-inline: 20px;
  padding-block: 64px;
	display: flex;
  flex-direction: column-reverse;
	width: 100%;
	align-items: baseline;
	justify-content: space-between;
	gap: 32px;
	margin-top: auto;
  color: $white;
  &:not(.red){
    background: $brown-dark;
  }
  &:is(.red){
    background: $main-red;
  }
  .footer-app {
    text-align: left;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    margin-top: 32px;
  }
  .footer-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    justify-content: space-between;
    gap: 48px;
    flex-wrap: wrap;
  }
  label {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 17px;
    text-transform: uppercase;
  }
	.footer-content {
		display: flex;
    flex-direction: column;
		gap: 16px;
		align-items: baseline;
    flex: 1;
	}
  .footer-media {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 16px;
    flex: 1;
  }
  .router-item {
    text-decoration: none;
    text-align: left;
    white-space: nowrap;
    color: $secondary-color-10;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    &:hover {
      cursor: pointer;
      color: $white;
    }
  }
}
@media (min-width: 672px) {
  .footer-container {
    flex-direction: row !important;
    padding-inline: 4% !important;
  }
  .footer-app {
    margin-top: 0 !important;
    width: 100%;
  }
  .footer-wrapper {
    flex-direction: row !important;
    gap: 32px !important;
  }
}
</style>