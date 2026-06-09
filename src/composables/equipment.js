import { reactive } from 'vue'

// 装备配置
export const EQUIPMENT_CONFIG = {
  weapons: {
    stick: { 
      id: 'stick', 
      name: '木棍', 
      type: 'weapon', 
      attack: 5, 
      defense: 0, 
      price: 0, 
      description: '最基础的武器，随处可见' 
    },
    iron_blade: { 
      id: 'iron_blade', 
      name: '铁刀', 
      type: 'weapon', 
      attack: 15, 
      defense: 0, 
      price: 100, 
      description: '普通的铁制刀，比木棍强多了' 
    },
    steel_sword: { 
      id: 'steel_sword', 
      name: '钢剑', 
      type: 'weapon', 
      attack: 22, 
      defense: 3, 
      price: 300, 
      description: '精钢打造的剑，削铁如泥' 
    },
    dragon_blade: { 
      id: 'dragon_blade', 
      name: '青龙刀', 
      type: 'weapon', 
      attack: 30, 
      defense: 5, 
      price: 0, 
      source: 'boss',
      description: '青龙帮老大的武器，传说级神兵' 
    }
  },
  armors: {
    cloth: { 
      id: 'cloth', 
      name: '布衣', 
      type: 'armor', 
      attack: 0, 
      defense: 3, 
      price: 0, 
      description: '普通的布衣服，提供基本防护' 
    },
    leather: { 
      id: 'leather', 
      name: '皮甲', 
      type: 'armor', 
      attack: 0, 
      defense: 7, 
      price: 100, 
      description: '皮革制成的甲，轻便且结实' 
    },
    iron_armor: { 
      id: 'iron_armor', 
      name: '铁甲', 
      type: 'armor', 
      attack: 0, 
      defense: 10, 
      price: 150, 
      description: '铁制的铠甲，防御力出众' 
    },
    gold_armor: { 
      id: 'gold_armor', 
      name: '金丝甲', 
      type: 'armor', 
      attack: 5, 
      defense: 25, 
      price: 0, 
      source: 'prestige',
      description: '金丝编织的宝甲，刀枪不入' 
    }
  },
  accessories: {
    none: null,
    ruby_ring: { 
      id: 'ruby_ring', 
      name: '红宝石戒指', 
      type: 'accessory', 
      attack: 5, 
      prestige_bonus: 0.1, 
      price: 200, 
      description: '镶嵌红宝石的戒指，威望获取 +10%' 
    },
    amulet: { 
      id: 'amulet', 
      name: '护身符', 
      type: 'accessory', 
      special: 'immune_10', 
      price: 0, 
      source: 'boss', 
      description: '神秘的护身符，10% 概率免疫伤害' 
    },
    lucky_charm: { 
      id: 'lucky_charm', 
      name: '幸运符', 
      type: 'accessory', 
      special: 'crit_5', 
      price: 0, 
      source: 'achievement', 
      description: '带来好运的符咒，暴击率 +5%' 
    }
  }
}

// 创建装备状态
export function createEquipmentState() {
  return reactive({
    weapon: 'stick',
    armor: 'cloth',
    accessory: null,
    inventory: reactive({
      weapons: ['stick'],
      armors: ['cloth'],
      accessories: []
    })
  })
}

// 获取装备总属性
export function getEquipmentStats(equipment) {
  let totalAttack = 0
  let totalDefense = 0
  let prestigeBonus = 0
  let specialEffects = []
  
  // 武器
  const weapon = EQUIPMENT_CONFIG.weapons[equipment.weapon]
  if (weapon) {
    totalAttack += weapon.attack
    totalDefense += weapon.defense
  }
  
  // 防具
  const armor = EQUIPMENT_CONFIG.armors[equipment.armor]
  if (armor) {
    totalDefense += armor.defense
    totalAttack += armor.attack
  }
  
  // 饰品
  if (equipment.accessory) {
    const accessory = EQUIPMENT_CONFIG.accessories[equipment.accessory]
    if (accessory) {
      totalAttack += accessory.attack || 0
      prestigeBonus += accessory.prestige_bonus || 0
      if (accessory.special) {
        specialEffects.push(accessory.special)
      }
    }
  }
  
  return {
    attack: totalAttack,
    defense: totalDefense,
    prestigeBonus,
    specialEffects
  }
}

// 购买装备
export function buyEquipment(equipmentId, type, stats, equipment) {
  let item = null
  
  if (type === 'weapon') {
    item = EQUIPMENT_CONFIG.weapons[equipmentId]
  } else if (type === 'armor') {
    item = EQUIPMENT_CONFIG.armors[equipmentId]
  } else if (type === 'accessory') {
    item = EQUIPMENT_CONFIG.accessories[equipmentId]
  }
  
  if (!item) {
    return { success: false, message: '装备不存在！' }
  }
  
  if (item.price && stats.money < item.price) {
    return { success: false, message: '大洋不足！' }
  }
  
  if (item.price) {
    stats.money -= item.price
  }
  
  // 添加到背包
  if (type === 'weapon') {
    equipment.inventory.weapons.push(equipmentId)
  } else if (type === 'armor') {
    equipment.inventory.armors.push(equipmentId)
  } else if (type === 'accessory') {
    equipment.inventory.accessories.push(equipmentId)
  }
  
  return {
    success: true,
    message: `购买了【${item.name}】！${item.description}`,
    item
  }
}

// 装备物品
export function equipItem(itemId, type, equipment) {
  // 检查是否在背包中
  let hasItem = false
  if (type === 'weapon') {
    hasItem = equipment.inventory.weapons.includes(itemId)
  } else if (type === 'armor') {
    hasItem = equipment.inventory.armors.includes(itemId)
  } else if (type === 'accessory') {
    hasItem = equipment.inventory.accessories.includes(itemId)
  }
  
  if (!hasItem) {
    return { success: false, message: '没有该装备！' }
  }
  
  // 装备
  if (type === 'weapon') {
    equipment.weapon = itemId
  } else if (type === 'armor') {
    equipment.armor = itemId
  } else if (type === 'accessory') {
    equipment.accessory = itemId
  }
  
  const item = EQUIPMENT_CONFIG[type === 'weapon' ? 'weapons' : type === 'armor' ? 'armors' : 'accessories'][itemId]
  
  return {
    success: true,
    message: `装备了【${item.name}】！`
  }
}

// 检查装备获取条件
export function checkEquipmentUnlock(item) {
  if (!item || !item.source) return { unlocked: true }
  
  switch (item.source) {
    case 'boss':
      return { unlocked: false, message: '需要通过击败 BOSS 获得' }
    case 'prestige':
      return { unlocked: false, message: '需要通过威望兑换' }
    case 'achievement':
      return { unlocked: false, message: '需要完成成就' }
    default:
      return { unlocked: true }
  }
}

// 获取可购买的装备列表
export function getAvailableEquipment(stats, equipment) {
  const available = []
  
  // 武器
  Object.values(EQUIPMENT_CONFIG.weapons).forEach(item => {
    if (item.price && !equipment.inventory.weapons.includes(item.id)) {
      available.push({ ...item, category: 'weapon' })
    }
  })
  
  // 防具
  Object.values(EQUIPMENT_CONFIG.armors).forEach(item => {
    if (item.price && !equipment.inventory.armors.includes(item.id)) {
      available.push({ ...item, category: 'armor' })
    }
  })
  
  // 饰品
  Object.values(EQUIPMENT_CONFIG.accessories).forEach(item => {
    if (item && item.price && !equipment.inventory.accessories.includes(item.id)) {
      available.push({ ...item, category: 'accessory' })
    }
  })
  
  return available
}
