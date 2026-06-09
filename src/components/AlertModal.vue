<template>
  <div class="modal" v-if="visible">
    <div class="modal-content alert-box">
      <div class="alert-content">{{ message }}</div>
      <button class="btn btn-attack" @click="$emit('close')">确定</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  message: String
})

defineEmits(['close'])
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 3px solid #b8860b;
  border-radius: 12px;
  padding: 20px 30px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 0 40px rgba(184, 134, 11, 0.4);
  text-align: center;
}

.alert-content {
  font-size: 16px;
  color: #ffd700;
  margin-bottom: 20px;
  white-space: pre-line;
  line-height: 1.6;
}

.btn {
  padding: 10px 30px;
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
</style>