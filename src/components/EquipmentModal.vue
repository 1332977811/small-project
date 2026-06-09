<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="equipment-modal modal-content">
      <h2>🎒 装备商店</h2>
      
      <!-- 当前装备 -->
      <div class="section">
        <h3>📌 当前装备</h3>
        <div class="equipment-grid">
          <div class="equip-slot">
            <div class="slot-label">🗡️ 武器</div>
            <div class="slot-item">
              {{ currentEquipment.weapon ? getEquipName(currentEquipment.weapon, 'weapon') : '无' }}
            </div>
            <div class="slot-stats" v-if="currentEquipment.weapon">
              <span v-if="getEquipStats(currentEquipment.weapon, 'weapon').attack > 0">
                攻击 +{{ getEquipStats(currentEquipment.weapon, 'weapon').attack }}
              </span>
              <span v-if="getEquipStats(currentEquipment.weapon, 'weapon').defense > 0">
                防御 +{{ getEquipStats(currentEquipment.weapon, 'weapon').defense }}
              </span>
            </div>
          </div>
          
          <div class="equip-slot">
            <div class="slot-label">🛡️ 防具</div>
            <div class="slot-item">
              {{ currentEquipment.armor ? getEquipName(currentEquipment.armor, 'armor') : '无' }}
            </div>
            <div class="slot-stats" v-if="currentEquipment.armor">
              <span v-if="getEquipStats(currentEquipment.armor, 'armor').defense > 0">
                防御 +{{ getEquipStats(currentEquipment.armor, 'armor').defense }}
              </span>
            </div>
          </div>
          
          <div class="equip-slot">
            <div class="slot-label">💍 饰品</div>
            <div class="slot-item">
              {{ currentEquipment.accessory ? getEquipName(currentEquipment.accessory, 'accessory') : '无' }}
            </div>
            <div class="slot-stats" v-if="currentEquipment.accessory">
              <span>特殊效果</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 背包 -->
      <div class="section">
        <h3>🎒 背包</h3>
        <div class="inventory-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'weapons' }]"
            @click="activeTab = 'weapons'"
          >
            🗡️ 武器
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'armors' }]"
            @click="activeTab = 'armors'"
          >
            🛡️ 防具
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'accessories' }]"
            @click="activeTab = 'accessories'"
          >
            💍 饰品
          </button>
        </div>
        
        <div class="inventory-grid">
          <div 
            v-for="itemId in getInventoryByTab(activeTab)" 
            :key="itemId"
            class="inventory-item"
            :class="{ equipped: isEquipped(itemId, activeTab) }"
            @click="equipItem(itemId, activeTab.slice(0, -1))"
          >
            <div class="item-name">{{ getEquipName(itemId, activeTab.slice(0, -1)) }}</div>
            <div class="item-stats">
              <span v-if="getEquipStats(itemId, activeTab.slice(0, -1)).attack > 0">
                攻击 +{{ getEquipStats(itemId, activeTab.slice(0, -1)).attack }}
              </span>
              <span v-if="getEquipStats(itemId, activeTab.slice(0, -1)).defense > 0">
                防御 +{{ getEquipStats(itemId, activeTab.slice(0, -1)).defense }}
              </span>
            </div>
            <div class="item-status" v-if="isEquipped(itemId, activeTab.slice(0, -1))">
              已装备
            </div>
            <div class="item-status" v-else>
              点击装备
            </div>
          </div>
          <div v-if="getInventoryByTab(activeTab).length === 0" class="empty-tip">
            背包空空如也
          </div>
        </div>
      </div>
      
      <!-- 商店 -->
      <div class="section">
        <h3>🏪 可购买装备</h3>
        <div class="shop-grid">
          <div 
            v-for="item in availableEquipment" 
            :key="item.id"
            class="shop-item"
            :class="{ 'can-afford': playerStats.money >= item.price }"
            @click="buyItem(item)"
          >
            <div class="item-icon">
              {{ getItemIcon(item.category) }}
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-desc">{{ item.description }}</div>
              <div class="item-stats">
                <span v-if="item.attack > 0">攻击 +{{ item.attack }}</span>
                <span v-if="item.defense > 0">防御 +{{ item.defense }}</span>
                <span v-if="item.prestige_bonus">威望 +{{ Math.floor(item.prestige_bonus * 100) }}%</span>
              </div>
            </div>
            <div class="item-price">💰 {{ item.price }}</div>
          </div>
          <div v-if="availableEquipment.length === 0" class="empty-tip">
            没有可购买的装备
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
import { ref, computed } from 'vue'
import { EQUIPMENT_CONFIG } from '../composables/equipment'

const props = defineProps({
  visible: Boolean,
  playerStats: Object,
  equipment: Object
})

const emit = defineEmits(['close', 'buy', 'equip'])

const activeTab = ref('weapons')

// 获取装备名称
function getEquipName(itemId, type) {
  const config = EQUIPMENT_CONFIG[type + 's'] || EQUIPMENT_CONFIG.accessories
  const item = config[itemId]
  return item ? item.name : '无'
}

// 获取装备属性
function getEquipStats(itemId, type) {
  const config = EQUIPMENT_CONFIG[type + 's'] || EQUIPMENT_CONFIG.accessories
  const item = config[itemId]
  if (!item) return { attack: 0, defense: 0 }
  
  return {
    attack: item.attack || 0,
    defense: item.defense || 0
  }
}

// 获取背包物品
function getInventoryByTab(tab) {
  if (!props.equipment?.inventory) return []
  
  switch (tab) {
    case 'weapons':
      return props.equipment.inventory.weapons
    case 'armors':
      return props.equipment.inventory.armors
    case 'accessories':
      return props.equipment.inventory.accessories
    default:
      return []
  }
}

// 检查是否已装备
function isEquipped(itemId, type) {
  if (!props.equipment) return false
  
  switch (type) {
    case 'weapon':
      return props.equipment.weapon === itemId
    case 'armor':
      return props.equipment.armor === itemId
    case 'accessory':
      return props.equipment.accessory === itemId
    default:
      return false
  }
}

// 装备物品
function equipItem(itemId, type) {
  if (isEquipped(itemId, type)) return
  emit('equip', itemId, type)
}

// 获取可购买装备
const availableEquipment = computed(() => {
  if (!props.equipment) return []
  
  const available = []
  
  // 武器
  Object.values(EQUIPMENT_CONFIG.weapons).forEach(item => {
    if (item.price && !props.equipment.inventory.weapons.includes(item.id)) {
      available.push({ ...item, category: 'weapon' })
    }
  })
  
  // 防具
  Object.values(EQUIPMENT_CONFIG.armors).forEach(item => {
    if (item.price && !props.equipment.inventory.armors.includes(item.id)) {
      available.push({ ...item, category: 'armor' })
    }
  })
  
  // 饰品
  Object.values(EQUIPMENT_CONFIG.accessories).forEach(item => {
    if (item && item.price && !props.equipment.inventory.accessories.includes(item.id)) {
      available.push({ ...item, category: 'accessory' })
    }
  })
  
  return available
})

// 购买物品
function buyItem(item) {
  if (props.playerStats.money < item.price) {
    alert('大洋不足！')
    return
  }
  emit('buy', item.id, item.category)
}

// 获取物品图标
function getItemIcon(category) {
  switch (category) {
    case 'weapon': return '🗡️'
    case 'armor': return '🛡️'
    case 'accessory': return '💍'
    default: return '📦'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
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
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  color: #ffd700;
}

h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 20px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

h3 {
  font-size: 18px;
  color: #ffd700;
  margin-bottom: 15px;
  border-bottom: 2px solid #b8860b;
  padding-bottom: 5px;
}

.section {
  margin-bottom: 25px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.equip-slot {
  background: rgba(74, 55, 40, 0.5);
  border: 2px solid #666;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.slot-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.slot-item {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.slot-stats {
  font-size: 12px;
  color: #4CAF50;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.inventory-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: rgba(74, 55, 40, 0.5);
  border: 2px solid #666;
  border-radius: 6px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: rgba(184, 134, 11, 0.3);
  border-color: #ffd700;
  color: #ffd700;
}

.tab-btn:hover {
  border-color: #b8860b;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  min-height: 150px;
}

.inventory-item {
  background: rgba(74, 55, 40, 0.3);
  border: 2px solid #666;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.inventory-item:hover {
  border-color: #b8860b;
  background: rgba(74, 55, 40, 0.5);
}

.inventory-item.equipped {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
}

.item-name {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.item-stats {
  font-size: 12px;
  color: #4CAF50;
  margin-bottom: 5px;
  display: flex;
  gap: 5px;
}

.item-status {
  font-size: 11px;
  color: #999;
}

.inventory-item.equipped .item-status {
  color: #4CAF50;
  font-weight: bold;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  min-height: 200px;
}

.shop-item {
  background: rgba(74, 55, 40, 0.3);
  border: 2px solid #666;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shop-item:hover {
  border-color: #b8860b;
  background: rgba(74, 55, 40, 0.5);
}

.shop-item.can-afford {
  border-color: #4CAF50;
}

.shop-item.can-afford:hover {
  background: rgba(76, 175, 80, 0.2);
}

.item-icon {
  font-size: 32px;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-desc {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
}

.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  padding: 30px;
  font-style: italic;
}

.modal-footer {
  text-align: center;
  margin-top: 20px;
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
