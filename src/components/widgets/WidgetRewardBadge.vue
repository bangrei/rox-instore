<template>
  <div class="rewards-badges">
    <div></div>
    <div class="rewards-badge-item" @click="goTo('PointsPage')">
      <div class="badge-circle">
        <svg width="40" height="40" 
          viewBox="0 0 40 40" 
          class="circular-progress"
          :style="{'--progress': myProgress}">
          <circle class="bg"></circle>
          <circle class="fg"></circle>
        </svg>
        <span class="badge-icon material-icons">flag_circle</span>
      </div>
      <div class="badge-info">
        <div class="badge-info-title">
          <span>R.O.X. Heights</span>
          <span class="separator"></span>
          <span>{{ myLevel.name }}</span>
        </div>
        <div class="badge-point">
          <span class="badge-point-number">{{ activityPoints }}</span>
          <span class="badge-point-info" v-if="nextLevel">/ {{ nextLevel.minPoints - activityPoints }} to {{ nextLevel.name }}</span>
          <span class="badge-point-info" v-else>points</span>
        </div>
      </div>
      <span class="badge-nav material-icons">chevron_right</span>
    </div>
  </div>
</template>

<script>
import { getTransactionalPoints } from "@/connector/v4/customerConnector";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
  name: "WidgetRewardBadge",
  mixins: [utility],
  data() {
    return {
      customer: {},
      activityPoints: 0,
      transactionalPoints: 0,
    };
  },
  computed: {
    myLevel() {
			let levels = this.$store.getters.getActivityLevels;
			let myPoints = this.activityPoints || 0;
			let myLevels = levels.filter((it) => {
				return myPoints >= it.minPoints && myPoints <= it.maxPoints;
			});
			if(myLevels.length == 0) return levels[levels.length - 1];
			return myLevels[0];
    },
    nextLevel() {
      let levels = this.$store.getters.getActivityLevels;
			let myLevel = this.myLevel;
			if (!myLevel) return levels[0];
			return levels.find((it) => {
				return it.minPoints > myLevel.maxPoints;
      });
    },
    myProgress() {
      let current = this.activityPoints;
      let nextPoints = this.nextLevel?.minPoints || 0;
      return (current / nextPoints) * 100;
    }
  },
  methods: {},
  async created() {
    this.customer = this.$store.getters.getCustomer;
    let res = await getTransactionalPoints();
    if (res.success && !isEmpty(res.customer.rewards)) {
      this.transactionalPoints = res.customer.rewards.totalRewardPoints;
      this.customer.rewards = res.customer.rewards;
      this.customer.eunoiaId = res.customer.id;
    }
    this.activityPoints = this.customer?.points || 0;
  }
};
</script>
<style scoped lang="scss">
.rewards-badges {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  .rewards-badge-item {
    background: #FAF9F6;
    padding: 16px;
    width: fit-content;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    position: relative;
    height: 80px;
    max-height: 80px;
    overflow: hidden;
    &::before {
      width: 60px;
      height: 60px;
      content: "";
      background: $white;
      position: relative;
      margin-left: -40px;
      transform: rotate(45deg);
    }
    .badge-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 40px;
      height: 40px;
      .badge-icon {
        color: #CE7E2A !important;
      }
      .circular-progress {
        position: absolute;
        --size: 40px;
        --half-size: calc(var(--size) / 2);
        --stroke-width: 4px;
        --radius: calc((var(--size) - var(--stroke-width)) / 2);
        --circumference: calc(var(--radius) * pi * 2);
        --dash: calc((var(--progress) * var(--circumference)) / 100);
        // animation: progress-animation 5s linear 0s 1 forwards;
        circle {
          cx: var(--half-size);
          cy: var(--half-size);
          r: var(--radius);
          stroke-width: var(--stroke-width);
          fill: none;
          stroke-linecap: round;
          &.bg {
            stroke: #ddd;
          }
          &.fg {
            transform: rotate(-90deg);
            transform-origin: var(--half-size) var(--half-size);
            stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
            transition: stroke-dasharray 0.3s linear 0s;
            stroke: #CE7E2A;
          }
        }
      }
    }
    .badge-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      .badge-info-title {
        font-weight: bolder;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #CE7E2A;
        opacity: 0.7;
      }
      .badge-point {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 8px;
        font-size: 0.9em;
        line-height: 1;
        .badge-point-number {
          font-size: 1.4em;
          font-weight: bold;
        }
        .badge-point-info {
          color: $secondary-color-60;
          font-weight: bold;
        }
      }
    }
    .separator {
      width: 6px;
      height: 6px;
      content: "";
      border-radius: 50%;
      background: #CE7E2A;
    }
    .badge-nav {
      font-size: 2em !important;
      color: #CE7E2A;
      &:hover {
        opacity: 0.6;
      }
    }
  }
}
</style>
