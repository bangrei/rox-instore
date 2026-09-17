<template>
	<div class="product-grid">
		<div :class="['loading-container', {'grid-3': gridColumns == 3}]" v-if="loading">
			<div class="loading-item" v-for="item in loadingArray" :key="item">
				<div class="loading-item-box"></div>
				<div class="loading-item-title"></div>
				<div class="loading-item-text"></div>
				<div class="loading-item-price"></div>
			</div>
		</div>
		<div ref="etalaseCon"
			:class="['etalase-con', {
				'in-line': inLine, 
				'nobox': nobox, 
				'grid-3': gridColumns == 3,
				'with-padding': withPadding
			}]" 
			v-if="!isEmpty(currentProducts)">
			<div class="etalase-nav first" v-if="showScrollNav" @click="scrollLeft($event)">
				<i class="material-icons-outlined">chevron_left</i>
			</div>
			<div
				class="etalase-item" 
				:class="{'changing': changing, 'prepare': !changing, 'image-only': imageOnly}"
				v-for="prd in currentProducts" 
				:key="prd.id">
				<div class="overlay" 
					:class="{'no-image': !getImage(prd)}"
					@click="seeProductDetails(prd)">
					<span class="cart-marker material-icons-outlined" v-if="prd.cart">assignment_turned_in</span>
					<img v-if="prd.images.length > 0" :src="prd.images[0].image" :alt="prd.name"/>
					<img v-else :src="require('@/assets/images/rox-logo-2025.jpeg')" :alt="prd.name"/>
				</div>
				<div class="etalase-content" v-if="!imageOnly">
					<router-link :to="getProductLink(prd)" class="router-link label">{{ prd.brandNames }}</router-link>
					<router-link :to="getProductLink(prd)" class="router-link sub-label">{{ prd.name }}</router-link>
					<div class="price-wrapper">
						<span class="promo-price" v-if="hasPromoPrice(prd)">{{ displayPrice(prd) }}</span>
						<span class="price">{{ prdPrice(prd) }}</span>
					</div>
					<!-- <div class="icons" v-if="!nobox">
						<div class="icon-wrapper">
							<span class="material-icons-outlined" :class="{'favorite': prd.favorite }" @click="clickFavorite(prd)">{{ prd.favorite ? 'favorite' : 'favorite_border' }}</span>
							<span class="material-icons-outlined" @click="toggleZoom(prd)">visibility</span>
						</div>
						<div class="icon-wrapper" @click="seeProductDetails(prd)">
							<span class="dark icon-lg material-icons-outlined">add_circle</span>
						</div>
					</div> -->
				</div>
			</div>
			<div class="etalase-nav last" v-if="showScrollNav" @click="scrollRight($event)">
				<i class="material-icons-outlined">chevron_right</i>
			</div>
		</div>
		<base-empty-product-state :is-filter="true" v-if="showEmptyState"/>
		<div class="load-more" v-if="showMore" @click="loadMore()">Load More</div>

		<base-modal :show="zoom">
			<template v-slot:header>
				<div class="modal-header">
					<span @click="toggleZoom()" class="modal-close-btn material-icons-outlined">close</span>
					<h3>{{ zoomProduct.name }}</h3>
				</div>
			</template>
			<template v-slot:body>
				<div class="modal-body">
					<vue-image-zoomer v-if="zoom"
						:src="zoomProduct.imageDisplay"
						:zoom-src="zoomProduct.imageDisplay"
						:zoom-type="'click'"
						:zoom-scale="1.5"
						:fullscreen-on-mobile="false"
					></vue-image-zoomer>
				</div>
			</template>
		</base-modal>
	</div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
import { addFavorite, unFavorite } from "@/connector/v4/productConnector";
import BaseModal from "@/components/base/BaseModal.vue";
import VueImageZoomer from 'vue-inner-image-zoom';
import 'vue-inner-image-zoom/lib/vue-inner-image-zoom.css';
export default {
	mixins: [utility],
	props: {
		products: {
			type: Array,
			default: () => []
		},
		moreButton: {
			type: Boolean,
			default: true,
		},
		inLine: {
			type: Boolean,
			default: false,
		},
		nobox: {
			type: Boolean,
			default: false,
		},
		maxGrid: {
			type: Number,
			default: 0,
		},
		gridColumns: {
			type: Number,
			default: 4,
		},
		currentCategory: {
			type: Object,
			default: () => {}
		},
		withPadding: {
			type: Boolean,
			default: false,
		},
		hideEmpty: {
			type: Boolean,
			default: false,
		},
		imageOnly: {
			type: Boolean,
			default: false,
		},
		loading: {
			type: Boolean,
			default: false,
		}
	},
	components: {
    BaseModal,
		VueImageZoomer,
	},
	data() {
		return {
			zoom: false,
			zoomProduct: "",
			currentProducts: [],
			productSize: 4,
			isDesktop: false,
			changing: false,
			canScrollHorizontally: false,
			scrollNavObserver: null,
		};
	},
	watch: {
		products: {
			handler(){
				this.isDesktop = window.innerWidth >= 672;
				this.productSize = this.isDesktop ? 8 : 4;
				this.setCurrentProducts();
			},
			deep: true
		},
		loading(val){
			if(val) this.currentProducts = []
		}
	},
	computed: {
		loadingArray(){
			if(!this.loading) return [];
			return Array.from({length: 8}).map((_, index) => ({index}));
		},
		showEmptyState(){
			if(this.hideEmpty) return false;
			if(this.loading) return false;
			return isEmpty(this.currentProducts);
		},
		showMore(){
			if(isEmpty(this.products)) return false;
			return this.moreButton && this.productSize < this.products.length;
		},
		showMoreGrid() {
			return this.maxGrid > 0 && this.products.length > this.maxGrid;
		},
		showScrollNav() {
			return this.inLine && this.canScrollHorizontally;
		}
	},
	methods: {
		scrollRight(event) {
      let target = event.target.closest('.etalase-con');
      target.scrollLeft += event.target.closest('.etalase-con').clientWidth;
    },
		scrollLeft(event) {
      let target = event.target.closest('.etalase-con');
      if (target.scrollLeft <= 0) return;
      target.scrollLeft -= event.target.closest('.etalase-con').clientWidth;
    },
		updateScrollNav() {
			if (!this.inLine) {
				this.canScrollHorizontally = false;
				return;
			}
			const el = this.$refs.etalaseCon;
			if (!el) {
				this.canScrollHorizontally = false;
				return;
			}
			const items = el.querySelectorAll('.etalase-item');
			if (!items.length) {
				this.canScrollHorizontally = false;
				return;
			}
			const styles = getComputedStyle(el);
			const gap = parseFloat(styles.columnGap || styles.gap) || 0;
			let itemsWidth = 0;
			items.forEach((item) => {
				itemsWidth += item.offsetWidth;
			});
			if (items.length > 1) itemsWidth += gap * (items.length - 1);
			this.canScrollHorizontally = itemsWidth > el.clientWidth + 1;
		},
		bindScrollNavObserver() {
			this.unbindScrollNavObserver();
			const el = this.$refs.etalaseCon;
			if (!el || typeof ResizeObserver === 'undefined') return;
			this.scrollNavObserver = new ResizeObserver(() => {
				window.requestAnimationFrame(() => this.updateScrollNav());
			});
			this.scrollNavObserver.observe(el);
		},
		unbindScrollNavObserver() {
			if (this.scrollNavObserver) {
				this.scrollNavObserver.disconnect();
				this.scrollNavObserver = null;
			}
		},
		getProductLink(prd) {
			let names = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
				if (it.toUpperCase() == it) return it;
				return it.toLowerCase();
			});
			if(!isEmpty(prd.variants)) {
				prd.variants.sort((a,b) => a.sortIndex - b.sortIndex);
				let variant = prd.variants[0];
				if(!isEmpty(prd.cart)) variant = prd.cart.variant;
				
				let variantSlugs = variant.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
					if (it.toUpperCase() == it) return it;
					return it.toLowerCase();
				});
				names = [...names, ...variantSlugs];
			}
			return `/product/${prd.id}/${names.join('-')}`;
		},
		viewCategory() {
			this.$emit('moreCategory', this.currentCategory.id);
		},
		seeProductDetails(prd){
			let currentOutlet = this.$store.getters.getCurrentOutlet;
			let names = prd.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
				if (it.toUpperCase() == it) return it;
				return it.toLowerCase();
			});
			if(!isEmpty(prd.variants)) {
				prd.variants.sort((a,b) => a.sortIndex - b.sortIndex);
				let variant = prd.variants[0];
				if(!isEmpty(prd.cart)) variant = prd.cart.variant;

				let variantSlugs = variant.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')?.map((it) => {
					if (it.toUpperCase() == it) return it;
					return it.toLowerCase();
				});
				names = [...names, ...variantSlugs];
			}
			this.$router.push({
				name: "ProductDetails",
				params: {
					outlet: currentOutlet.apiCode,
					productId: prd.id,
					productName: names.join('-'),
					edit: !isEmpty(prd.cart) ? prd.cart.id : null
				},
			});
		},
		loadMore(){
			this.productSize += 10;
			let newProducts = this.products.slice(this.currentProducts.length, this.productSize);
			if (!isEmpty(newProducts)) {
				this.setupProducts(newProducts).forEach((p) => {
					this.currentProducts.push(p);
				});
				setTimeout(() => {
					this.resizeImageHandler();
					this.updateScrollNav();
				}, 10);
			}
			this.$emit('loadMore');
		},
		finalizeProducts(prd) {
			if (this.maxGrid > 0) {
				let items = this.setupProducts(this.productsMap(prd));
				this.currentProducts = items.slice(0, this.maxGrid);
			} else {
				this.currentProducts = this.setupProducts(this.productsMap(prd));
			}
			/*
			if(this.imageOnly){
				this.currentProducts = this.currentProducts?.filter((it) => it.images.length > 0);
			}
			*/
			this.changing = false;
			window.addEventListener('resize', this.resizeImageHandler);
			this.$nextTick(() => {
				this.changing = true;
				this.resizeImageHandler();
				this.updateScrollNav();
				this.bindScrollNavObserver();
			});
		},
		productsMap(products) {
			if (isEmpty(products)) return [];
			let categories = this.$store.getters.getCategories.map((n) => { return { id: n.id, name: n.name } });
			return products.map((it) => {
				let categoriesDisplay = categories.filter((n) => {
					return it.categories.indexOf(n.id) > -1;
				}).map((n) => { return n.name });
				let brands = it.brands.map((b) => b.name);
				it.brandNames = brands.join(' | ');
				it.categoriesDisplay = categoriesDisplay.join(" | ");
				it.favorite = it.favorite || this.isFavorite(it.id);
				it.images = this.getImages(it);
				return it;
			});
		},
		setCurrentProducts() {
			if(this.moreButton && this.products.length > this.productSize){
				let prd = this.products.slice(0,this.productSize);
				return this.finalizeProducts(prd);
			}
			this.finalizeProducts(this.products);
		},
		isFavorite(productId){
			return this.isFavoriteProduct(productId)
		},
		toggleZoom(prd){
			if(!this.zoom){
				if(isEmpty(prd.imageId)) return;
			}
			this.zoom = !this.zoom;
			if(isEmpty(prd)) return;
			this.zoomProduct = prd;
			this.zoomProduct.imageDisplay = this.getImage(prd);
		},
		async clickFavorite(prd) {
			if (this.isGuestCustomer()) return;
			try {
				let idx = this.currentProducts.findIndex((it) => {
					return it.id == prd.id;
				});
				if(idx == -1) return;
				if(prd.favorite){
					let res = await unFavorite(prd.id);
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("unFavorite", prd.id);
					this.currentProducts[idx].favorite = false;
				} else {
					let res = await addFavorite(prd.id);
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("addFavorite", prd.id);
					this.currentProducts[idx].favorite = true;
				}
			} catch (error) {
				this.showNotification("warning", "error_outline", error);
			}
		},
		prdDesc(prd){
			if(isEmpty(prd.description)) return "";
			return prd.description.substring(0,20);
		},
		displayPrice(prd) {
      if (isEmpty(prd.variants)) return this.currency(prd.originalPrice);
      let variants = prd.variants.filter((v) => v.promoPrice > 0);
      if (variants.length > 0) {
        return this.currency(variants[0].price)
      }
      return this.currency(prd.originalPrice);
    },
		prdPrice(prd) {
			if (isEmpty(prd.variants)) return prd.price == 0 ? 'Free' : this.currency(prd.price);
			let hasVariantPromo = this.hasPromoPrice(prd);
			if (hasVariantPromo) return hasVariantPromo;
			let variantPrice = prd.variants.find((v) => v.price > 0);
			return variantPrice ? this.currency(variantPrice.price) : 'Free';
		},
		hasPromoPrice(prd) {
			let promoPrice = prd.promoPrice;
			if (!isEmpty(prd.variants)) {
				let variants = prd.variants.filter((v) => v.promoPrice > 0);
				if (variants.length > 0) {
					promoPrice = variants[0].promoPrice;
				}
			}
			if (promoPrice > 0) return this.currency(promoPrice);
			return null;
		},
		getImage(prd) {
			let images = [];
			if (!isEmpty(prd.imageId)) images.push({ id: prd.imageId });
			if (!isEmpty(prd.image2Id)) images.push({ id: prd.image2Id });
			if (!isEmpty(prd.image3Id)) images.push({ id: prd.image3Id });
			if (!isEmpty(prd.images)) {
				images = prd.images;
				images.sort((a, b) => a.sortIndex - b.sortIndex);
			}
			if (isEmpty(images)) return "";
			let image = images[0].id;
			return `${this.$store.getters.cloudinaryURL}${image.id}?width=300`;
		},
		getImages(prd) {
			let images = [];
			if (!isEmpty(prd.imageId)) images.push({ sortIndex: 0, id: prd.imageId, image: `${this.$store.getters.cloudinaryURL}${prd.imageId}?width=300` });
			if (!isEmpty(prd.image2Id)) images.push({ sortIndex: 1, id: prd.image2Id, image: `${this.$store.getters.cloudinaryURL}${prd.image2Id}?width=300` });
			if (!isEmpty(prd.image3Id)) images.push({ sortIndex: 2, id: prd.image3Id, image: `${this.$store.getters.cloudinaryURL}${prd.image3Id}?width=300` });
			if (!isEmpty(prd.images)) {
				images = prd.images.map((im) => {
					return {
						...im,
						image: `${this.$store.getters.cloudinaryURL}${im.id}?width=300`
					}
				});
				images.sort((a, b) => a.sortIndex - b.sortIndex);
			}
			return images;
		}
	},
	async created() {
		setTimeout(() => {
			this.isDesktop = window.innerWidth >= 672;
			this.productSize = this.isDesktop ? 8 : 4;
		}, 100);
		window.addEventListener('resize', this.updateScrollNav);
	},
	beforeUnmount(){
		window.removeEventListener('resize', this.resizeImageHandler);
		window.removeEventListener('resize', this.updateScrollNav);
		this.unbindScrollNavObserver();
	}
};
</script>

<style lang="scss">
	.loading-container {
		width: 100%;
		display: grid;
		gap: 20px;
		.loading-item {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 10px;
			.loading-item-box {
				aspect-ratio: 1/1;
				width: 100%;
				background: $secondary-color-20;
			}
			.loading-item-title {
				width: 65%;
				min-height: 20px;
				background: $secondary-color-20;
			}
			.loading-item-text {
				width: 100%;
				min-height: 12px;
				background: $secondary-color-20;
			}
			.loading-item-price {
				width: 30%;
				min-height: 20px;
				background: $secondary-color-20;
			}
		}
	}
	.router-link {
		text-decoration: none;
	}
	.empty-products {
		height: 400px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.product-grid {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		position: relative;
	}
	.etalase-con {
		width: 100%;
		display: grid;
		column-gap: 20px;
		row-gap: 20px;
		grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
		overflow: hidden;
		overflow-x: auto;
		scroll-behavior: smooth;
		&:is(.with-padding){
			padding-inline: 20px;
		}
		&::-webkit-scrollbar {
    	height: 0 !important;
  	}
		.etalase-nav {
			display: none;
			position: absolute;
			left: 0px;
		}

		&.in-line {
			display: flex;
			gap: 16px;

			.etalase-item {
				max-width: 250px;
				min-width: 250px;
				-webkit-animation-duration: 0.3s;
				animation-duration: 0.3s;
				-webkit-animation-fill-mode: both;
				animation-fill-mode: both;
				-webkit-animation-name: fadeInDown;
				animation-name: fadeInDown;

				.overlay {
					width: 100%;
					min-width: 250px;
					max-width: 250px;
					aspect-ratio: 1/1;
				}
			}
			.etalase-nav {
				display: flex;
				align-items: center;
				justify-content: center;
				min-height: 42px;
				min-width: 42px;
				max-height: 42px;
				max-width: 42px;
				border-radius: 50%;
				background: $brown-medium;
				top: 0;
				bottom: 0;
				margin-block: auto;
				z-index: 2;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
        -webkit-box-shadow: 0 0px 8px rgba(0, 0, 0, 0.33);
				cursor: pointer;
				color: $white;
				&:hover {
					background: $blue-powder;
					color: $brown-dark;
				}
				&.first {
					left: 0px;
				}
				&.last {
					left: unset !important;
					right: 0px;
					margin-left: auto;
				}
				i {
					font-size: 32px !important;
				}
			}
		}

		&.nobox {
			.overlay {
				-webkit-box-shadow: none !important;
				-moz-box-shadow: none !important;
				-o-box-shadow: none !important;
				box-shadow: none !important;
				aspect-ratio: 1/1;
			}
			.etalase-content {
				.label {
					text-align: left;
				}
				.sub-label {
					text-align: left;
					margin-bottom: 16px;
				}
				.price-wrapper {
					.price {
						font-weight: bold;
						color: $dark-color-1 !important;
						font-size: 1.2em;
					}
				}
			}
		}
		&:is(.no-padding) {
			padding: 16px 8px !important;
		}

		.etalase-item {
			flex: 1;
			position: relative;
			// border: 1px solid $secondary-color-20;
			border-radius: 6px;
			overflow: hidden;
			background: $white;
			&.image-only {
				border-radius: 0 !important;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        -webkit-box-shadow: 0 0px 8px rgba(0, 0, 0, 0.1);
				border: none;
				aspect-ratio: 4/3;
				.cart-marker {
					display: none !important;
				}
				.overlay {
					aspect-ratio: 4/3 !important;
					img {
						aspect-ratio: 4/3;
					}
				}
			}
			&.prepare {
				opacity: 0;
			}

			&.changing {
				-webkit-animation-duration: 0.3s;
				animation-duration: 0.3s;
				-webkit-animation-fill-mode: both;
				animation-fill-mode: both;
				-webkit-animation-name: fadeInDown;
				animation-name: fadeInDown;
			}

			.overlay {
				width: 100%;
				aspect-ratio: 1/1;
				background: $white;
				overflow: hidden;
				border-radius: 8px;
				/* -webkit-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				-moz-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				-o-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1); */
				position: relative;
				&.grid-layer {
					display: flex;
					flex-direction: column;
					gap: 8px;
					align-items: center;
					justify-content: center;
					background: $primary-color-10;
					color: $primary-color-80;
					font-weight: bold;
					cursor: pointer;
					&:hover{
						opacity: 0.7;
					}
				}

				.cart-marker {
					position: absolute;
					top: 8px;
					right: 8px;
					color: $success-green;
				}

				&.no-image {
					background: $secondary-color-10 !important;
					display: flex;
					align-items: center;
					justify-content: center;
					-webkit-box-shadow: none;
					-moz-box-shadow: none;
					-o-box-shadow: none;
					box-shadow: none;
					background: $primary-color-10 !important;

					img {
						transform: scale(0.5);
						opacity: 0.5;
					}
				}

				img {
					width: 100%;
					height: 100%;
					object-fit: contain;
					mix-blend-mode: multiply;
				}
			}

			.etalase-content {
				width: 100%;
				padding: 12px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-start;
			}

			.label {
				text-align: left;
				font-size: 12px;
				display: block;
				color: $main-red;
				font-weight: bold;
				text-transform: uppercase;
				width: 100%;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				line-height: 14px;
			}
			.sub-label {
				text-align: left;
				font-size: 15px;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				margin-top: 8px;
				width: 100%;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				color: $secondary-color-80;
				text-overflow: ellipsis;
			}
			.price-wrapper {
				font-size: 18px;
				line-height: 28px;
				text-align: left;
				margin-top: 8px;
				display: flex;
				font-weight: bold;
				align-items: center;
				gap: 10px;
				color: $dark-color-1;
				.promo-price {
					position: relative;
					display: flex;
					&::before {
						content: "";
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						height: 2px;
						margin: auto;
						background: $primary-color-60;
					}
				}
			}
			.action {
				display: block;
				width: fit-content;
				padding: 8px 18px;
				border-radius: 12px;
				background: $white;
				color: #000;
				font-weight: bold;
				margin: 16px auto;
			}
			.icons {
				width: 100%;
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 16px;
				padding: 6px 0;

				.icon-wrapper {
					display: flex;
					gap: 16px;
					align-items: center;

					* {
						color: $secondary-color-50;

						&.dark {
							color: $secondary-color-90 !important;
						}
						&.favorite {
							color: $primary-color-60 !important;
						}
					}

					.icon-lg {
						font-size: 2em;
					}
				}
			}
		}
	}
	.zoom-image {
		object-fit: cover;
		margin: auto;
		height: 100%;
		object-position: center;
	}

	.load-more {
		width: fit-content;
		margin: 16px auto;
		padding: 12px 32px;
		background: $primary-color-60;
		border-radius: 16px;
		color: $white;
		font-weight: bold;
	}
	@media (min-width: 672px) {
		.loading-container {
			grid-template-columns: repeat(auto-fill, minmax(22%, 1fr));
			&:is(.grid-3) {
				grid-template-columns: repeat(auto-fill, minmax(30%, 1fr)) !important;
			}
		}
		.etalase-con {
			grid-template-columns: repeat(auto-fill, minmax(22%, 1fr));
			&:is(.grid-3) {
				grid-template-columns: repeat(auto-fill, minmax(30%, 1fr)) !important;
			}
			&:is(.with-padding){
				padding-inline: 0 !important;
			}

			.label {
				cursor: pointer;
			}
			.action {
				cursor: pointer;
			}
			.icons {
				.icon-wrapper {
					cursor: pointer;
				}
			}
		}
		.load-more {
			cursor: pointer;
		}
		.etalase-nav {
			position: sticky;
			left: 0px;
		}
	}
	@media (min-width: 672px) and (max-width: 1024px) {
		.loading-container {
			grid-template-columns: repeat(auto-fill, minmax(33%, 1fr));
		}
		.etalase-con {
			grid-template-columns: repeat(auto-fill, minmax(33%, 1fr));
		}
	}
	    
	@keyframes fadeInDown {
        0% {
            opacity: 0;
            transform: translateY(-20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
