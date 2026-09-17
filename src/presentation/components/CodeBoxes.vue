<template>
	<div class="code__wrapper">
		<div class="code__placeholder" id="test" @click="inputFocus()"></div>
		<div class="code__con">
			<input
				type="number"
				v-for="(box, ix) in totalBoxes"
				:key="box"
				:id="'codes-' + ix"
				v-model="codes[ix]"
				class="code__box active heading-1"
				v-on:input="inputEvent($event)"
				v-on:keyup="keyUpEvent($event)"
				v-on:paste="paste($event)"
				:class="{
					redeemed: isRedeemed,
					success: isSuccess,
					failed: isFailed,
				}"
				:disabled="isRedeemed || isSuccess"
			/>
		</div>
	</div>

	<div class="code__message__con" v-show="showMessage">
		<span
			class="body-2-tight regular code__message"
			:class="{
				redeemed: isRedeemed,
				success: isSuccess,
				failed: isFailed,
			}"
		>
			{{ redeemMessage }}
		</span>
	</div>
</template>

<script>
export default {
	emits: ["submit-code"],
	props: {
		totalBoxes: Number,
		isSuccess: {
			type: Boolean,
			default: false,
		},
		isFailed: {
			type: Boolean,
			default: false,
		},
		isRedeemed: {
			type: Boolean,
			default: false,
		},
		showMessage: {
			type: Boolean,
			default: false,
		},
		redeemMessage: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			codes: [],
			index: 0,
			isPasted: false,
		};
	},
	methods: {
		getCodeBoxElement(index) {
			return document.getElementById("codes-" + index);
		},
		isNumeric: function (n) {
			return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
		},
		paste(event){
			let pasted = event.clipboardData.getData('text').trim().replace(/[^\d]/g, ''); // replace no-numeric/chars
			if(!pasted || !this.isNumeric(pasted)) return;
			let arr = pasted.split('');
			this.isPasted = true;
			let lastIndex = 0;
			arr.forEach((n, i) => {
				let idx = this.index + i;
				if(idx > (this.totalBoxes - 1)) return;
				n = n.trim();
				this.codes[idx] = n;
				this.getCodeBoxElement(idx).focus();
				this.getCodeBoxElement(idx).value = n;
				lastIndex = idx;
			});
			if(this.codes.length !== this.totalBoxes) {
				this.isPasted = false;
				return;
			}
			this.getCodeBoxElement(lastIndex).blur();
			this.$emit("submit-code", this.codes.join(""));
			this.isPasted = false;
		},
		inputEvent(event) {
			if(event.type == "paste" || this.isPasted) return;
			const maxLength = 1;
			const slicedValue = this.getCodeBoxElement(this.index).value.slice(
				0,
				maxLength
			);
			this.getCodeBoxElement(this.index).value = slicedValue;
			this.codes[this.index] = slicedValue;

			if (this.getCodeBoxElement(this.index).value.length === 1) {
				if (this.index !== this.totalBoxes - 1) {
					this.getCodeBoxElement(this.index + 1).focus();
					this.index += 1;
				} else {
					this.getCodeBoxElement(this.index).blur();
					this.$emit("submit-code", this.codes.join(""));
				}
			}
		},
		keyUpEvent(event) {
			if(event.type == "paste" || this.isPasted) return;
			const eventCode = event.which || event.keyCode;
			if (eventCode === 8 && this.index !== 0) {
				if (this.codes.length - 1 != this.index) {
					this.getCodeBoxElement(this.index - 1).focus();
					this.getCodeBoxElement(this.index - 1).value = null;
					this.index -= 1;
				}
				this.codes = this.codes.slice(0, -1);
			}
		},
		inputFocus() {
			if(this.isPasted) return;
			if (!this.isRedeemed && !this.isSuccess) {
				const codesLength = this.codes.length;
				if (codesLength > 0) {
					this.index = codesLength - 1;
					this.getCodeBoxElement(codesLength - 1).focus();
				} else {
					this.getCodeBoxElement(0).focus();
				}
			}
		},
	},
};
</script>

<style scoped lang="scss">
.code__wrapper {
	position: relative;
}

.code__placeholder {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	z-index: 2;
}

.code__con {
	// padding: 16px 20px;
	display: flex;
	justify-content: center;
	gap: 6px;
	z-index: 1;

	.code__box {
		width: 40px;
		border: none;
		text-align: center;
	}

	input.code__box::-webkit-outer-spin-button,
	input.code__box::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input.code__box[type="number"] {
		-moz-appearance: textfield;
	}

	.code__box.active {
		background-color: $primary-color-10;
		border-radius: 12px;
		padding: 4px 8px;

		&.success {
			border: 1px solid $success-base;
		}

		&.redeemed {
			background-color: $secondary-color-10;
			color: $secondary-color-30;
		}

		&.failed {
			border: 1px solid $alert-base;
		}
	}
}

.code__message__con {
	padding-top: 16px;
	padding-bottom: 32px;

	.code__message {
		font-weight: bold;
		&.redeemed {
			color: $info-base;
		}

		&.success {
			color: $success-base;
		}

		&.failed {
			color: $alert-base;
		}
	}
}

@media (min-width: 672px) {
	.code__con {
		.code__box {
			width: 50px;
		}
	}
}
</style>
