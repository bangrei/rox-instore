<template>
	<div class="sd-badge" :class="iconName ? 'sd-badge-icon' : ''">
		<span v-if="iconName" className="material-icons md-16">
			{{ iconName }}
		</span>
		<span class="sd-badge-font">{{ badgeLabel }}</span>
	</div>
</template>

<script>
export default {
	name: "BaseBadge",
	props: {
		badgeLabel: {
			type: String,
			default: "&nbsp;",
		},
		iconName: {
			type: String,
			required: false,
		},
	},
};
</script>

<style lang="scss" scoped>
.sd-badge {
	display: flex;
	align-items: center;
	flex-direction: row;
	border-radius: 4px;
	justify-content: center;
	color: $white;
	width: fit-content;
}

.sd-badge-md {
	padding: 5px 16px;
	font-size: 16px;
}

.sd-badge-sm {
	padding: 3px 12px;
	font-size: 14px;
}

.sd-badge-icon {
	gap: 10px;
}

.sd-badge-rounded {
	border-radius: 32px;
}

.sd-badge-success {
	background-color: $success-base;
}
.sd-badge-success-light {
	background-color: $success-light;
	color: $success-dark;
}

.sd-badge-alert {
	background-color: $alert-dark;
}
.sd-badge-alert-light {
	background-color: $alert-light;
	color: $alert-dark;
}

.sd-badge-warning {
	background-color: $warning-base;
}

.sd-badge-warning-light {
	background-color: $warning-light;
	color: $warning-dark;
}

.sd-badge-info {
	background-color: $info-base;
}
.sd-badge-info-light {
	background-color: $info-light;
	color: $info-dark;
}
</style>
