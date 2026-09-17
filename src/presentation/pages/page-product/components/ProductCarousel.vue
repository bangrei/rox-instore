<script setup>
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide } from 'vue3-carousel';
import { ref, defineProps, onBeforeUnmount } from 'vue';

const props = defineProps({
  banners: {
    type: Array,
    default: () => []
  },
  isDesktop: {
    type: Boolean,
    default: true
  },
  isFood: {
    type: Boolean,
    default: false
  }
});
const currentSlide = ref(props.banners.length > 0 ? props.banners[0].index : 0)
const slideTo = (nextSlide) => (currentSlide.value = nextSlide)
const galleryConfig = {
  itemsToShow: 1,
  wrapAround: true,
  slideEffect: 'fade',
  mouseDrag: false,
  touchDrag: false,
  transition: 500,
}
const getOrientationVertical = () => {
  let windowwidth = window.innerWidth;
  let isVertical = true;
  if (windowwidth < 672 || (windowwidth >= 672 && windowwidth <= 1024)) {
    isVertical = false;
  }
  return isVertical;
}
const checkNav = () => {
  if (!document.querySelector('.thumbnails-con')) return;
  let target = document.querySelector('.thumbnails-con');
  let isVertical = getOrientationVertical();
  const hasVerticalScrollbar = target.scrollHeight > target.clientHeight;
  const hasHorizontalScrollbar = target.scrollWidth > target.clientWidth;
  let setHidden = isVertical ? !hasVerticalScrollbar : !hasHorizontalScrollbar;
  if (setHidden) {
    document.querySelector('.thumbnails-nav.first').classList.add('hidden');
    document.querySelector('.thumbnails-nav.last').classList.add('hidden');
  } else {
    document.querySelector('.thumbnails-nav.first').classList.remove('hidden');
    document.querySelector('.thumbnails-nav.last').classList.remove('hidden');
  }
}
const resizehandler = () => {
  checkNav();
  if (!document.querySelector('.carousel-wrapper')) return;
  if (!document.querySelector('.thumbnails')) return;
  let isVertical = getOrientationVertical();
  if (!isVertical) {
    document.querySelector('.thumbnails').style.removeProperty('height');
    return;
  }
  let h = document.querySelector('.carousel-wrapper').clientHeight;
  document.querySelector('.thumbnails').style['height'] = `${h}px`;
}
const thumbnailFirst = () => {
  let isVertical = getOrientationVertical();
  if (isVertical) {
    document.querySelector('.thumbnails-con').scrollTop -= document.querySelector('.thumbnails-con').clientHeight;
    return
  }
  document.querySelector('.thumbnails-con').scrollLeft -= document.querySelector('.thumbnails-con').clientWidth;
}
const thumbnailLast = () => {
  let isVertical = getOrientationVertical();
  if (isVertical) {
    document.querySelector('.thumbnails-con').scrollTop += document.querySelector('.thumbnails-con').clientHeight;
    return
  }
  document.querySelector('.thumbnails-con').scrollLeft += document.querySelector('.thumbnails-con').clientWidth;
}
window.addEventListener('resize', resizehandler);
setTimeout(() => {
  resizehandler();
  if(props.banners.length > 1){
    document.querySelector('.thumbnails-nav.first').addEventListener('click', thumbnailFirst);
    document.querySelector('.thumbnails-nav.last').addEventListener('click', thumbnailLast);
  }
}, 100);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizehandler);
  if(props.banners.length > 1){
    document.querySelector('.thumbnails-nav.first').removeEventListener('click', thumbnailFirst);
    document.querySelector('.thumbnails-nav.last').removeEventListener('click', thumbnailLast);
  }
});
</script>
<template>
  <div :class="['carousel-container', {'desktop': props.isDesktop}]">
    <div :class="['carousel-wrapper', {'desktop': props.isDesktop, 'food' : props.isFood}]">
      <Carousel v-bind="galleryConfig" v-model="currentSlide">
        <Slide v-for="banner in props.banners" :key="banner.index">
          <img :src="banner.image" alt="Gallery Image" class="gallery-image" />
        </Slide>
      </Carousel>
    </div>
    <div v-if="props.banners.length > 1" :class="['thumbnails', {'desktop': props.isDesktop}]">
      <div class="thumbnails-nav first"></div>
      <div class="thumbnails-con">
        <div class="thumbnail-wrapper" v-for="banner in props.banners" :key="banner.index">
          <div
              :class="['thumbnail', {'is-active': banner.index == currentSlide}]"
              @click="slideTo(banner.index)"
            >
              <img :src="banner.image" alt="Thumbnail Image" class="thumbnail-image" />
            </div>
        </div>
      </div>
      <div class="thumbnails-nav last"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.carousel-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.carousel-wrapper {
  flex: 1;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 24px;
  & > * {
    background-color: $blue-powder;
    // border: 1px solid $secondary-color-10;
  }
  img {
    height: auto !important;
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: contain;
  }
}
.carousel-accordion {
  display: none;
}
.thumbnails {
  width: 100%;
  display: flex;
  align-items: center;
  .thumbnails-con {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-x: auto;
    padding: 24px;
    scroll-behavior: smooth;
  }
  .thumbnails-nav {
    position: relative;
    min-width: 22px;
    &::before {
      position: absolute;
      content: "";
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: $white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      -webkit-box-shadow: 0 0px 8px rgba(0, 0, 0, 0.1);
      margin: auto;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Material Icons Outlined";
      font-size: 22px !important;
      cursor: pointer;
      color: $primary-color-60;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
    &:hover::before {
      color: $secondary-color-80;
    }
    &.first::before {
      content: "chevron_left";
    }
    &.last::before {
      margin-right: 2px;
      content: "chevron_right";
    }
    &.hidden {
      display: none;
      min-width: 0 !important;
      max-width: 0 !important;
      max-height: 0 !important;
      overflow: hidden;
      &::before {
        display: none !important;
      }
    }
  }
  .thumbnail-wrapper {
    min-width: 90px !important;
    max-width: 90px !important;
  }
  .thumbnail-wrapper {
    min-width: 100px;
    max-width: 100px;
    aspect-ratio: 1/1;
    .thumbnail {
      width: 100%;
      aspect-ratio: 1/1;
      overflow: hidden;
      border: 2px solid transparent;
      border-radius: 10px;
      opacity: 0.7;
          &:not(.is-active){
        background: $secondary-color-10;
      }
      &.is-active,
      &:hover {
        border-color: $secondary-color-50;
        opacity: 1 !important;
      }
      img {
        width: 100%;
        aspect-ratio: 1/1 !important;
        object-fit: contain;
      }
    }
  }
}
.nav-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: $white;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  pointer-events: none;
  &::before {
    content: "";
    width: 12px;
    height: 12px;
    border: 2px solid #000;
    border-left-color: transparent;
    border-bottom-color: transparent;
  }
  &.prev::before {
    transform: rotate(-135deg);
    -webkkit-transform: rotate(-135deg);
    margin-left: 4px;
  }
  &.next::before {
    transform: rotate(45deg);
    -webkkit-transform: rotate(-135deg);
    margin-right: 6px;
  }
}
@media (min-width: 672px) {
  .carousel-container {
    flex-direction: row-reverse !important;
    gap: 24px;
  }
  .carousel-accordion {
    display: block !important;
    border-top: 1px solid $secondary-color-20;
  }
  .carousel-wrapper {
    & > * {
      width: 100%;
      overflow: hidden;
      border-radius: 12px;
    }
  }
  .thumbnails {
    width: unset !important;
    flex-direction: column;
    height: 65vh;
    .thumbnails-con {
      flex-direction: column;
      padding: 0 !important;
      overflow-y: auto;
      position: relative;
      &::-webkit-scrollbar {
        background: 0 0 !important;
        display: none;
        width: 0 !important;
      }
    }
    .thumbnails-nav {
      min-height: 22px;
      min-width: 100%;
      &.first::before {
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg);
      }
      &.last::before {
        margin-right: auto !important;
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg);
      }
    }
    .thumbnail-wrapper {
      cursor: pointer;
    }
  }
}
@media (min-width: 672px) and (max-width: 1024px) {
  .carousel-container {
    flex-direction: column !important;
  }
  .thumbnails {
    flex-direction: row !important;
    width: 100% !important;
    height: fit-content !important;
    .thumbnails-con {
      overflow-x: auto;
      flex-direction: row !important;
    }
    .thumbnails-nav {
      min-height: 22px;
      min-width: 12px !important;
      &.first::before {
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
      }
      &.last::before {
        margin-right: 2px !important;
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
      }
    }
  }
}
</style>
