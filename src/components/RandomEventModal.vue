<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="event-modal modal-content">
      <h2>{{ event.icon }} {{ event.name }}</h2>
      
      <div class="event-description">
        {{ event.description }}
      </div>
      
      <div class="choices-container">
        <div 
          v-for="(choice, index) in event.choices" 
          :key="index"
          class="choice-btn"
          :class="{ 'has-cost': choice.cost, 'has-risk': choice.risk }"
          @click="$emit('choose', index)"
        >
          <div class="choice-text">{{ choice.text }}</div>
          <div class="choice-hint" v-if="choice.cost">
            💰 {{ choice.cost }}
          </div>
          <div class="choice-hint" v-if="choice.risk === 'combat'">
            ⚔️ 可能触发战斗
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-close" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  event: Object
})

defineEmits(['close', 'choose'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 3px solid #b8860b;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 15px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.event-description {
  text-align: center;
  font-size: 16px;
  color: #ccc;
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(74, 55, 40, 0.3);
  border-radius: 8px;
  border: 1px solid #666;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.choice-btn {
  padding: 15px 20px;
  background: linear-gradient(180deg, #3a2a1a 0%, #2a1a0a 100%);
  border: 2px solid #666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.choice-btn:hover {
  border-color: #ffd700;
  background: linear-gradient(180deg, #4a3a2a 0%, #3a2a1a 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
}

.choice-btn.has-cost {
  border-left: 4px solid #ffd700;
}

.choice-btn.has-risk {
  border-left: 4px solid #ff4444;
}

.choice-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.choice-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.choice-btn.has-cost .choice-hint {
  color: #ffd700;
}

.choice-btn.has-risk .choice-hint {
  color: #ff4444;
}

.modal-footer {
  text-align: center;
}

.btn-close {
  padding: 12px 40px;
  font-size: 16px;
  background: linear-gradient(180deg, #8b2a2a 0%, #5a1a1a 100%);
  color: #fff;
  border: 2px solid #ffd700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  background: linear-gradient(180deg, #ab3a3a 0%, #7a2a2a 100%);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}
</style>
