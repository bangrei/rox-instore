<template>
	<div class="modal__backdrop">
		<div class="modal">
			<div class="modal__body">
				<slot> This is the default body! </slot>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "BaseModal",
	data() {
		return {};
	},
	methods: {
		close() {
			this.$emit("close");
		},
	},
};
</script>

<style scoped lang="scss">
.modal {
	background: #ffffff;
	overflow-x: auto;
	display: flex;
	flex-direction: column;
	max-width: 672px;
	height: 100vh;

	&__backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
</style>
