<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <div class="modal-title">⚔️ 战斗！</div>
      <div class="battle-info">
        <div class="combatant player">
          <div class="name">阿龙 (Lv.1)</div>
          <div class="stats">
            <div>❤️ HP: {{ player.hp }}/{{ player.maxHp }}</div>
            <div>⚔️ 攻击：{{ player.attack }}</div>
            <div>🛡️ 防御：{{ player.defense }}</div>
          </div>
          <!-- 小弟展示区 -->
          <div class="followers-display" v-if="player.followers > 0">
            <div 
              v-for="i in Math.min(player.followers, 5)" 
              :key="i"
              class="follower"
              :class="{ 
                'attacking': isFollowerAttacking && attackingFollowerIndex === i - 1,
                'highlight': isFollowerAttacking
              }"
            >
              👥
            </div>
            <div class="follower-count" v-if="player.followers > 5">
              +{{ player.followers - 5 }}
            </div>
          </div>
        </div>
        <div class="vs">VS</div>
        <div class="combatant enemy">
          <div class="name">{{ enemyName }}</div>
          <div class="stats">
            <div>❤️ HP: {{ enemy?.hp }}/{{ enemy?.maxHp }}</div>
            <div>⚔️ 攻击：{{ enemy?.attack }}</div>
            <div>🛡️ 防御：{{ enemy?.defense }}</div>
          </div>
        </div>
      </div>
      <!-- 伤害数字显示 -->
      <div class="damage-numbers">
        <div 
          v-for="num in damageNumbers" 
          :key="num.id"
          class="damage-number"
          :class="num.type"
          :style="{ left: num.x + '%', top: num.y + '%' }"
        >
          -{{ num.value }}
        </div>
      </div>
      <div class="battle-result">{{ battleResult }}</div>
      <!-- 技能按钮 -->
      <div class="skills-section" v-if="showSkills">
        <div class="skills-title">📜 技能</div>
        <div class="skills-container">
          <button 
            v-for="(skill, skillId) in skillsConfig" 
            :key="skillId"
            class="skill-btn"
            :class="{ 
              'unlocked': playerSkills[skillId]?.unlocked, 
              'active': playerSkills[skillId]?.active,
              'cooldown': playerSkills[skillId]?.cooldown > 0
            }"
            :disabled="!playerSkills[skillId]?.unlocked || playerSkills[skillId]?.cooldown > 0"
            @click="$emit('useSkill', skillId)"
          >
            <div class="skill-icon">{{ skill.icon }}</div>
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-desc">{{ skill.description }}</div>
            <div class="skill-cd" v-if="playerSkills[skillId]?.cooldown > 0">
              CD: {{ playerSkills[skillId].cooldown }}
            </div>
          </button>
        </div>
      </div>
      <div class="battle-buttons">
        <button class="btn btn-attack" @click="$emit('attack')">攻击</button>
        <button class="btn btn-flee" @click="$emit('flee')" :disabled="isBossBattle">逃跑</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  player: Object,
  enemy: Object,
  battleResult: String,
  isBossBattle: Boolean,
  bossRegion: Object,
  isFollowerAttacking: Boolean,
  attackingFollowerIndex: Number,
  damageNumbers: Array,
  showSkills: Boolean,
  skillsConfig: Object,
  playerSkills: Object
})

const enemyName = computed(() => {
  if (props.isBossBattle && props.bossRegion) {
    return `👹 ${props.bossRegion.name}大佬 Lv.${props.enemy?.level}`
  }
  return `敌人 Lv.${props.enemy?.level}`
})

defineEmits(['attack', 'flee', 'useSkill'])
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 3px solid #b8860b;
  border-radius: 12px;
  padding: 30px;
  min-width: 450px;
  box-shadow: 0 0 40px rgba(184, 134, 11, 0.4);
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: #ffd700;
  margin-bottom: 20px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.battle-info {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
}

.combatant {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
}

.combatant.player {
  background: rgba(0, 100, 0, 0.2);
  border: 1px solid #00aa00;
}

.combatant.enemy {
  background: rgba(100, 0, 0, 0.2);
  border: 1px solid #aa0000;
}

.combatant .name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
}

.combatant .stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #ccc;
}

.vs {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.battle-result {
  text-align: center;
  font-size: 16px;
  color: #ffd700;
  margin-bottom: 20px;
  min-height: 24px;
}

.battle-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  width: 150px;
  padding: 10px;
  border: 2px solid #b8860b;
  border-radius: 4px;
  background: linear-gradient(180deg, #4a3728 0%, #2d1f15 100%);
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn-attack {
  background: linear-gradient(180deg, #8b0000 0%, #4a0000 100%);
  border-color: #ff4444;
  color: #fff;
}

.btn-attack:hover {
  background: linear-gradient(180deg, #a50000 0%, #5a0000 100%);
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
}

.btn-flee {
  background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
  border-color: #666;
  color: #ccc;
}

.btn-flee:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 小弟展示区 */
.followers-display {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 15px;
  align-items: center;
}

.follower {
  font-size: 24px;
  transition: all 0.3s;
  opacity: 0.7;
  filter: grayscale(0.3);
}

.follower.highlight {
  opacity: 1;
  filter: grayscale(0);
}

.follower.attacking {
  transform: translateX(30px) scale(1.5);
  filter: brightness(1.5) hue-rotate(30deg);
  opacity: 1;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

.follower-count {
  font-size: 12px;
  color: #ffd700;
  align-self: center;
  font-weight: bold;
}

/* 伤害数字 */
.damage-numbers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.damage-number {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: #ff4444;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: damageFloat 1.5s ease-out forwards;
  pointer-events: none;
}

.damage-number.player {
  color: #ffd700;
  font-size: 28px;
}

.damage-number[class*="follower"] {
  color: #ff6600;
  font-size: 22px;
}

@keyframes damageFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-30px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) scale(1.5);
  }
}

/* 技能区域 */
.skills-section {
  margin: 20px 0;
  padding: 15px;
  background: rgba(74, 55, 40, 0.3);
  border: 2px solid #b8860b;
  border-radius: 8px;
}

.skills-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 15px;
}

.skills-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.skill-btn {
  width: 140px;
  padding: 10px;
  border: 2px solid #666;
  border-radius: 6px;
  background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
  color: #999;
  cursor: not-allowed;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.skill-btn.unlocked {
  border-color: #ffd700;
  background: linear-gradient(180deg, #5a4a28 0%, #3a2a18 100%);
  color: #ffd700;
  cursor: pointer;
}

.skill-btn.unlocked:hover {
  background: linear-gradient(180deg, #6a5a38 0%, #4a3a28 100%);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.skill-btn.active {
  border-color: #ff4444;
  background: linear-gradient(180deg, #8b2a2a 0%, #5a1a1a 100%);
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
}

.skill-btn.cooldown {
  border-color: #666;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  color: #666;
  cursor: not-allowed;
}

.skill-icon {
  font-size: 28px;
}

.skill-name {
  font-size: 14px;
  font-weight: bold;
}

.skill-desc {
  font-size: 11px;
  text-align: center;
  opacity: 0.8;
}

.skill-cd {
  font-size: 12px;
  font-weight: bold;
  color: #ff6600;
}

.skill-btn:disabled {
  opacity: 0.7;
}
</style>