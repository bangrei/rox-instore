<template>
  <div class="contact-container">
    <div class="contact-head">Contact Us</div>
    <div class="contact-description">For questions and inquiries, email us at: <span class="contact-email">{{ contact }}</span></div>
    <div class="contact-icons">
      <a target="_blank" href="https://www.instagram.com/roxphilippines/?hl=en" class="contact-icon">
        <img :src="instagramIcon" width="35" height="35" alt="Instagram"/>
      </a>
      <a target="_blank" href="https://www.facebook.com/share/19xjq4tn88/" class="contact-icon">
        <img :src="facebookIcon" width="35" height="35" alt="Facebook"/>
      </a>
    </div>
  </div>
</template>
<script>
import instagramIcon from "@/assets/icons/instagram-icon.png";
import facebookIcon from "@/assets/icons/facebook-icon.png";
export default {
  name: "ContactUs",
  data(){
    return {
      contact: "shop@rox.com.ph",
      instagramIcon: instagramIcon,
      facebookIcon: facebookIcon
    }
  }
}
</script>
<style scoped lang="scss">
.contact-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-block: 32px;
}
.contact-head {
  font-size: 30px;
  font-family: "Berthold Akzidenz Grotesk Medium";
}
.contact-description {
  color: $secondary-color-70;
  font-size: 16px;
}
.contact-email {
  font-family: "Berthold Akzidenz Grotesk Medium";
}
.contact-icons {
  display: flex;
  align-items: center;
  gap: 16px;
  .contact-icon {
    text-decoration: none;
  }
  img {
    min-width: 35px;
    min-height: 35px;
    max-width: 35px;
    max-height: 35px;
    object-fit: contain;
    filter: grayscale(1);
    &:hover {
      filter: grayscale(0);
    }
  }
}
</style>