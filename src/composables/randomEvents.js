// 随机事件配置
export const RANDOM_EVENTS_CONFIG = {
  // 奇遇事件
  merchant: {
    id: 'merchant',
    name: '神秘商人',
    icon: '👨‍💼',
    triggerRate: 0.05,  // 5% 概率
    description: '遇到神秘商人，出售稀有商品',
    choices: [
      {
        text: '看看商品',
        effect: 'open_shop',
        result: '打开神秘商店'
      },
      {
        text: '离开',
        effect: 'nothing',
        result: '商人离开了'
      }
    ]
  },
  
  wounded_warrior: {
    id: 'wounded_warrior',
    name: '受伤武者',
    icon: '🤕',
    triggerRate: 0.03,
    description: '一个受伤的武者躺在路边，选择是否救助',
    choices: [
      {
        text: '救助（花费 50 大洋）',
        effect: 'help',
        cost: 50,
        result: '武者感激地送给你一本秘籍',
        reward: {
          type: 'random',
          items: ['skill_book', 'prestige', 'money']
        }
      },
      {
        text: '离开',
        effect: 'leave',
        result: '你选择了离开',
        penalty: { prestige: -5 }
      },
      {
        text: '打劫',
        effect: 'rob',
        result: '你打劫了武者',
        reward: { money: 100 },
        penalty: { prestige: -20 },
        risk: 'combat'  // 可能触发战斗
      }
    ]
  },
  
  treasure: {
    id: 'treasure',
    name: '发现宝藏',
    icon: '💰',
    triggerRate: 0.02,
    description: '你发现了一个埋藏的宝藏！',
    choices: [
      {
        text: '拿走',
        effect: 'take',
        result: '获得了一笔意外之财',
        reward: {
          type: 'random_range',
          min: 100,
          max: 300,
          stat: 'money'
        }
      }
    ]
  },
  
  trap: {
    id: 'trap',
    name: '遭遇陷阱',
    icon: '⚠️',
    triggerRate: 0.03,
    description: '小心！你踩中了陷阱！',
    choices: [
      {
        text: '挣脱',
        effect: 'escape',
        result: '你成功挣脱了陷阱',
        damage: {
          hp: 20,
          money: 30
        }
      }
    ]
  },
  
  gang_war: {
    id: 'gang_war',
    name: '帮派火并',
    icon: '⚔️',
    triggerRate: 0.02,
    description: '前方两帮人马正在火并！',
    choices: [
      {
        text: '帮助斧头帮',
        effect: 'help_axe',
        result: '你加入了战斗',
        risk: 'combat',
        reward: {
          win: { money: 200, prestige: 30 },
          lose: { hp: -50 }
        }
      },
      {
        text: '帮助青龙帮',
        effect: 'help_dragon',
        result: '你加入了战斗',
        risk: 'combat',
        reward: {
          win: { prestige: 20, item: 'dragon_equipment' },
          lose: { hp: -50 }
        }
      },
      {
        text: '跑路',
        effect: 'flee',
        result: '你悄悄离开了',
        safe: true
      }
    ]
  },
  
  // Buff 选择事件
  buff_selection: {
    id: 'buff_selection',
    name: '神秘力量',
    icon: '✨',
    triggerRate: 0.1,  // 每占领 5 块地触发
    description: '一股神秘的力量笼罩着你，选择一项加成',
    choices: [
      {
        text: '攻击强化（本局攻击 +20%）',
        effect: 'buff_attack',
        buff: {
          type: 'attack',
          value: 1.2,
          duration: 'game'
        }
      },
      {
        text: '防御强化（本局防御 +20%）',
        effect: 'buff_defense',
        buff: {
          type: 'defense',
          value: 1.2,
          duration: 'game'
        }
      },
      {
        text: '神行符（本局移动 +30%）',
        effect: 'buff_speed',
        buff: {
          type: 'movement',
          value: 1.3,
          duration: 'game'
        }
      },
      {
        text: '招财符（本局金钱 +50%）',
        effect: 'buff_money',
        buff: {
          type: 'money_bonus',
          value: 1.5,
          duration: 'game'
        }
      },
      {
        text: '人和符（本局招募费用 -50%）',
        effect: 'buff_recruit',
        buff: {
          type: 'recruit_discount',
          value: 0.5,
          duration: 'game'
        }
      }
    ]
  }
}

// 创建随机事件状态
export function createRandomEventState() {
  return {
    stepsSinceLastEvent: 0,
    lastEvent: null,
    activeBuffs: []  // 当前激活的 Buff
  }
}

// 检查是否触发随机事件
export function checkRandomEventTrigger(steps, conqueredTiles) {
  // 每 20 步触发一次
  if (steps >= 20) {
    return {
      trigger: true,
      type: 'normal'
    }
  }
  
  // 每占领 5 块地触发 Buff 选择
  if (conqueredTiles > 0 && conqueredTiles % 5 === 0) {
    return {
      trigger: true,
      type: 'buff'
    }
  }
  
  return { trigger: false }
}

// 随机选择事件
export function selectRandomEvent(eventType) {
  const events = Object.values(RANDOM_EVENTS_CONFIG)
  
  if (eventType === 'buff') {
    return RANDOM_EVENTS_CONFIG.buff_selection
  }
  
  // 根据概率选择事件
  const rand = Math.random()
  let cumulative = 0
  
  for (const event of events) {
    if (event.id === 'buff_selection') continue  // 跳过 Buff 事件
    
    cumulative += event.triggerRate
    if (rand <= cumulative) {
      return event
    }
  }
  
  return events[0]  // 默认返回第一个
}

// 处理事件选择
export function handleEventChoice(event, choiceIndex, gameState) {
  const choice = event.choices[choiceIndex]
  
  if (!choice) {
    return {
      success: false,
      message: '无效的选择'
    }
  }
  
  const result = {
    success: true,
    message: choice.result,
    effects: {}
  }
  
  // 处理消耗
  if (choice.cost && gameState.stats.money >= choice.cost) {
    gameState.stats.money -= choice.cost
  } else if (choice.cost) {
    return {
      success: false,
      message: '大洋不足！'
    }
  }
  
  // 处理奖励
  if (choice.reward) {
    if (typeof choice.reward.money === 'number') {
      gameState.stats.money += choice.reward.money
      result.effects.money = choice.reward.money
    }
    
    if (choice.reward.prestige) {
      gameState.stats.prestige += choice.reward.prestige
      result.effects.prestige = choice.reward.prestige
    }
    
    if (choice.reward.type === 'random_range') {
      const value = Math.floor(
        Math.random() * (choice.reward.max - choice.reward.min + 1) + 
        choice.reward.min
      )
      gameState.stats[choice.reward.stat] += value
      result.effects[choice.reward.stat] = value
    }
  }
  
  // 处理惩罚
  if (choice.penalty) {
    if (choice.penalty.prestige) {
      gameState.stats.prestige += choice.penalty.prestige
      if (gameState.stats.prestige < 0) gameState.stats.prestige = 0
    }
  }
  
  // 处理伤害
  if (choice.damage) {
    if (choice.damage.hp) {
      gameState.player.hp -= choice.damage.hp
    }
    if (choice.damage.money) {
      gameState.stats.money -= choice.damage.money
      if (gameState.stats.money < 0) gameState.stats.money = 0
    }
  }
  
  // 处理 Buff
  if (choice.buff) {
    gameState.eventState.activeBuffs.push({
      ...choice.buff,
      id: Date.now()
    })
    result.effects.buff = choice.buff
  }
  
  return result
}

// 应用 Buff 效果
export function applyBuff(buffType, baseValue, activeBuffs) {
  let multiplier = 1
  
  activeBuffs.forEach(buff => {
    if (buff.type === buffType) {
      multiplier *= buff.value
    }
  })
  
  return Math.floor(baseValue * multiplier)
}

// 清除过期 Buff
export function clearExpiredBuffs(activeBuffs) {
  // 目前 Buff 都是永久持续到游戏结束
  // 未来可以添加回合限制的 Buff
  return activeBuffs
}

// 获取 Buff 描述
export function getBuffDescription(buff) {
  const descriptions = {
    attack: `攻击力 +${Math.floor((buff.value - 1) * 100)}%`,
    defense: `防御力 +${Math.floor((buff.value - 1) * 100)}%`,
    movement: `移动力 +${Math.floor((buff.value - 1) * 100)}%`,
    money_bonus: `金钱获取 +${Math.floor((buff.value - 1) * 100)}%`,
    recruit_discount: `招募费用 -${Math.floor((1 - buff.value) * 100)}%`
  }
  
  return descriptions[buff.type] || '未知效果'
}
