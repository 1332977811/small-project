<template>
  <div class="modal" v-if="visible">
    <div class="modal-content ending">
      <div class="ending-title">{{ title }}</div>
      <div class="ending-content">{{ content }}</div>
      <button class="btn btn-attack" @click="$emit('restart')">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  isWin: Boolean
})

const title = computed(() => props.isWin ? '🎉 胜利！' : '💀 失败！')
const content = computed(() => 
  props.isWin 
    ? '恭喜！斧头帮在你的带领下称霸上海滩！\n阿龙的名字将被永远铭记！'
    : '30天期限已到，斧头帮未能称霸上海滩...\n江湖路远，从头再来！'
)

defineEmits(['restart'])
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

.modal-content.ending {
  text-align: center;
}

.ending-title {
  font-size: 36px;
  margin-bottom: 20px;
  color: #ffd700;
}

.ending-content {
  font-size: 18px;
  color: #ccc;
  line-height: 1.8;
  margin-bottom: 25px;
  white-space: pre-line;
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