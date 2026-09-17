<template>
	<div class="sd-discount-card">
		<div class="top-container">
			<div class="disc">{{ discountCodeName }}</div>

			<div>
				<i
					v-if="showIcon"
					class="material-icons md-18 copyIcon"
					@click="doCopy"
				>
					copy_all
				</i>
				<p v-else class="copied">Copied!</p>
			</div>
		</div>
		<div class="btm-container">
			<div class="disc-info">
				<div class="disc-text">
					min. purchase ${{ minPurchase }} <br />
					max. disc to ${{ maxDiscount }}
				</div>
			</div>

			<div class="tc">T&C</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "BaseDiscountCard",
	props: {
		discountCodeName: {
			type: String,
			requried: true,
		},
		minPurchase: {
			type: [String, Number],
			required: true,
		},
		maxDiscount: {
			type: [String, Number],
			required: true,
		},
	},
	methods: {
		doCopy() {
			this.showIcon = !this.showIcon;
			setTimeout(() => (this.showIcon = true), 2000);
			navigator.clipboard.writeText(this.discountCodeName);
		},
	},
	data() {
		return {
			showIcon: true,
		};
	},
};
</script>

<style lang="scss" scoped>
.sd-discount-card {
	background-color: #e3fada;
	padding: 12px 12px;
	display: flex;
	flex-direction: column;
	border-radius: 4px;
}

.top-container {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.btm-container {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
.disc {
	color: $success-dark;
	font-weight: 700;
	font-size: 16px;
	line-height: 22px;
	margin-bottom: 9px;
}

.copyIcon {
	cursor: pointer;
	user-select: none;
}
.disc-text {
	text-align: left;
	font-weight: 400;
	font-size: 14px;
	letter-spacing: 0.2px;
	color: $secondary-color-60;
}
.tc {
	display: flex;
	align-self: flex-end;
	color: $secondary-color-100;
	font-weight: 500;
	font-size: 16px;
}

.copied {
	color: $success-dark;
	font-weight: 500;
	font-size: 16px;
}
</style>
