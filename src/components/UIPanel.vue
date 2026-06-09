<template>
  <div class="ui-panel">
    <div class="panel-title">斧头帮</div>
    <div class="panel-divider"></div>
    <div class="player-info">
      <div class="info-item">
        <span class="label">帮主:</span>
        <span class="value">阿龙</span>
      </div>
      <div class="info-item">
        <span class="label">威望:</span>
        <span class="value gold">✧ {{ stats.prestige }}</span>
      </div>
      <div class="info-item">
        <span class="label">大洋:</span>
        <span class="value gold">💰 {{ stats.money }}</span>
      </div>
      <div class="info-item">
        <span class="label">小弟:</span>
        <span class="value">👥 {{ stats.followers }}</span>
      </div>
      <div class="info-item">
        <span class="label">地盘:</span>
        <span class="value">🏠 {{ stats.conqueredRegions }}/{{ totalRegions }}</span>
      </div>
      <div class="info-item">
      <span class="label">剩余天数:</span>
      <span class="value red">📅 {{ stats.days }}</span>
    </div>
    <div class="info-item">
      <span class="label">天气:</span>
      <span class="value weather">{{ getWeatherDisplay() }}</span>
    </div>
  </div>
    <div class="panel-divider"></div>
    <div class="player-stats">
      <div class="info-item">
        <span class="label">HP:</span>
        <span class="value">❤️ {{ player.hp }}/{{ player.maxHp }}</span>
      </div>
      <div class="info-item">
        <span class="label">攻击:</span>
        <span class="value">⚔️ {{ player.attack }}</span>
      </div>
      <div class="info-item">
        <span class="label">防御:</span>
        <span class="value">🛡️ {{ player.defense }}</span>
      </div>
    </div>
    <div class="panel-divider"></div>
    <div class="buttons">
      <button class="btn" @click="$emit('openEquipment')">🎒 装备</button>
      <button class="btn" @click="$emit('save')">保存游戏</button>
      <button class="btn" @click="$emit('load')">读取游戏</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: Object,
  player: Object,
  totalRegions: Number
})

defineEmits(['save', 'load', 'openEquipment'])

function getWeatherDisplay() {
  if (!stats.weather) return '☀️ 晴天'
  const weatherId = stats.weather.current
  const weathers = {
    sunny: '☀️ 晴天',
    rainy: '🌧️ 雨天',
    snowy: '❄️ 雪天',
    foggy: '🌫️ 雾天'
  }
  return weathers[weatherId] || '☀️ 晴天'
}
</script>

<style scoped>
.ui-panel {
  width: 200px;
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #b8860b;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 0 20px rgba(184, 134, 11, 0.2);
}

.panel-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.panel-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #b8860b, transparent);
  margin: 12px 0;
}

.player-info, .player-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #aaa;
  font-size: 14px;
}

.value {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.value.gold {
  color: #ffd700;
}

.value.red {
  color: #ff4444;
}

.value.weather {
  color: #87CEEB;
  font-size: 13px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  width: 100%;
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

.btn:hover {
  background: linear-gradient(180deg, #5a4738 0%, #3d2f25 100%);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.btn:active {
  transform: scale(0.98);
}
</style>