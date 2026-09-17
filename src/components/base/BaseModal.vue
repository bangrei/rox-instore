<template>
	<Transition name="modal">
		<div v-if="show" class="modal-mask">
			<div class="modal-wrapper" :class="{'full-container': fullScreen, 'bottom': alignBottom}">
				<div :class="['modal-container', {'small-size': smallSize}]">
					<slot name="header"></slot>
					<slot name="body"></slot>
					<slot name="footer"></slot>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script>
export default {
	name: "BaseModal",
	props: {
		show: Boolean,
		fullScreen: {
			type: Boolean,
			default: false
		},
		alignBottom: {
			type: Boolean,
			default: false,
		},
		smallSize: {
			type: Boolean,
			default: false,
		}
	},
	data() {
		return {};
	},
	methods: {
		emitCloseModal() {
			this.$emit("close-modal");
		},
	},
	created() {},
	mounted() {},
	unmounted() {},
	watch: {
		show(val) {
			if (val) {
				// reset data, should be a re-render instead, find an effective way to do this in 'teleport'
			}
		},
	},
};
</script>
