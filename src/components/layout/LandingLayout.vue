<template>
	<div class="layout-flex">
        <div class="notification__con" :class="{ active: notification.show }">
			<base-notification :class="{ active: notification.show }"/>
		</div>
        <slot name="header"></slot>
        <div class="flex-item-image">
            <img class="img-desktop" :src="require('@/assets/images/rox-login.png')" alt="Landing">
            <img class="img-mobile" :src="require('@/assets/images/mobile_login.png')" alt="Landing">
        </div>
        <div class="flex-item-content">
            <img class="logo"
                width="70"
                height="50"
                alt="rxc logo"
                :src="require('@/assets/images/rox-logo-2025.jpeg')"
            />
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script>
import { useStore } from "vuex";
export default {
	name: "LayoutLanding",
	data() {
		return {};
	},
	computed: {
        notification(){
            const store = useStore();
            return store.state.notification;
        }
    },
};
</script>

<style scoped lang="scss">
    .notification__con {
        min-width: 288px;
        position: fixed;
        left: 50%;
        top: 56px;
        transform: translateX(-50%);
        z-index: 100000;
        width: 100%;
        &:not(.active) {
            pointer-events: none;
        }

        .notification {
            width: 100%;
            margin: 0 auto;
            opacity: 0;
            transition: all 0.5s;

            &.active {
                opacity: 100%;
            }
        }
    }
    .layout-flex {
        width: 100%;
        height: 100%;
        display: flex;
        position: relative;

        .flex-item-image {
            flex: 2;
            width: 100%;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
        .flex-item-content {
            width: 100%;
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 400px;
            .logo {
                object-fit: contain;
                display: none;
            }
        }
    }
    .img-desktop {
        display: none;
        max-width: 0;
        overflow: hidden;
    }
    @media (min-width: 672px){
        .img-mobile {
            display: none;
            max-width: 0;
            overflow: hidden;
        }
        .img-desktop {
            display: block;
            max-width: unset;
        }
        .flex-item-content {
            .logo {
                display: block !important;
            }
        }
    }
    @media (min-width: 672px) and (max-width: 1024px){
        .img-mobile {
            display: block !important;
            max-width: unset !important;
        }
        .img-desktop {
            display: none !important;
            max-width: 0 !important;
            overflow: hidden;
        }
    }
    @media (max-width: 800px) {
        .layout-flex {
            flex-direction: column;
            .flex-item-image {
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .flex-item-content {
                width: 100%;
                position: relative;
                max-width: 100% !important;

                .logo {
                    z-index: 2;
                    position: absolute;
                    top: -40px;
                    display: none !important;
                }

                &::before {
                    content: "";
                    position: absolute;
                    top: -24px;
                    left: 0;
                    right: 0;
                    height: 25px;
                    z-index: 1;
                    background: linear-gradient(180deg, transparent, $white);
                }
            }
        }
    }
</style>
