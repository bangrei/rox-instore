<template>
	<div class="empty-nudge-image-con">
		<img
			:src="require('@/assets/images/home-empty.png')"
			alt="all nudges read"
		/>
	</div>
</template>

<script>
export default {};
</script>

<style scoped lang="scss">
.empty-nudge-image-con {
	position: absolute;
	bottom: 0;
	width: 100%;

	img {
		width: 100%;
		height: 100%;
	}
}
</style>
