<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <div class="modal-title">🍶 酒馆商店</div>
      <div class="recruit-info">
        <p><span class="gold">💰 当前大洋: {{ stats.money }}</span></p>
        <p>❤️ 当前HP: {{ player.hp }}/{{ player.maxHp }}</p>
        <p>⚔️ 当前攻击力: {{ player.attack }}</p>
        <p>🛡️ 当前防御力: {{ player.defense }}</p>
        <p>👥 小弟数量: {{ stats.followers }}</p>
      </div>
      <div class="shop-items">
        <div class="shop-item">
          <h3>🥤 跌打药酒</h3>
          <p>回复30点HP</p>
          <p class="price">30 大洋</p>
          <button class="btn btn-attack" @click="$emit('buy', 'heal')">购买</button>
        </div>
        <div class="shop-item">
          <h3>💪 大力丸</h3>
          <p>永久增加攻击力 +3</p>
          <p class="price">80 大洋</p>
          <button class="btn btn-attack" @click="$emit('buy', 'attack')">购买</button>
        </div>
        <div class="shop-item">
          <h3>🛡️ 铁布衫</h3>
          <p>永久增加防御力 +2</p>
          <p class="price">80 大洋</p>
          <button class="btn btn-attack" @click="$emit('buy', 'defense')">购买</button>
        </div>
        <div class="shop-item">
          <h3>👥 招募小弟</h3>
          <p>永久增加攻击力 +5</p>
          <p class="price">50 大洋</p>
          <button class="btn btn-attack" @click="$emit('buy', 'follower')">购买</button>
        </div>
        <div class="shop-item">
          <h3>❤️ 医疗箱</h3>
          <p>完全回复HP</p>
          <p class="price">100 大洋</p>
          <button class="btn btn-attack" @click="$emit('buy', 'fullHeal')">购买</button>
        </div>
      </div>
      <div class="recruit-buttons">
        <button class="btn btn-flee" @click="$emit('close')">离开酒馆</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  stats: Object,
  player: Object
})

defineEmits(['buy', 'close'])
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

.recruit-info {
  text-align: center;
  color: #ccc;
  font-size: 16px;
  line-height: 2;
  margin-bottom: 20px;
}

.gold {
  color: #ffd700;
  font-weight: bold;
}

.shop-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.shop-item {
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border: 2px solid #5a5a5a;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.shop-item h3 {
  color: #ffd700;
  font-size: 16px;
  margin: 0 0 8px 0;
}

.shop-item p {
  color: #ccc;
  font-size: 13px;
  margin: 4px 0;
}

.shop-item .price {
  color: #ffd700;
  font-weight: bold;
  font-size: 15px;
}

.shop-item .btn {
  width: 100%;
  margin-top: 8px;
  font-size: 13px;
  padding: 8px;
}

.recruit-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
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
  width: 150px;
  background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
  border-color: #666;
  color: #ccc;
}
</style>