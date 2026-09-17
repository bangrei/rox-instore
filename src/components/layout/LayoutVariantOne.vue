<template>
	<div class="sd-base-con">
		<div class="sd-header">
			<slot name="header"> header </slot>
		</div>
		<div class="sd-main-con">
			<slot name="body"> body</slot>
		</div>
	</div>
</template>

<script>
export default {
	name: "LayoutVariantOne",
};
</script>

<style scoped lang="scss">
.sd-header {
	display: none;
	width: 100%;
}

.sd-main-con {
	height: 100%;
	width: 100%;
	position: relative;
	padding-bottom: 100px;
}

@media (min-width: 480px) {
	.sd-main-con {
		max-width: 480px;
	}
}

@media (min-width: 1056px) {
	.sd-header {
		padding: 32px;
		display: block;
	}
	.sd-main-con {
		max-width: none;
		margin: 0;
		padding: 0 32px 100px 32px;
	}
}
</style>
