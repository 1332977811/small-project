import { reactive } from 'vue'

// 技能配置
export const SKILLS_CONFIG = {
  critical_strike: {
    id: 'critical_strike',
    name: '致命一击',
    icon: '⚔️',
    cooldown: 5,
    description: '下次攻击伤害×2',
    unlockCondition: (stats) => stats.enemiesDefeated >= 50
  },
  iron_body: {
    id: 'iron_body',
    name: '铁布衫',
    icon: '🛡️',
    cooldown: 8,
    description: '3 回合内防御力 +50%',
    unlockCondition: (stats) => stats.money >= 200,
    cost: 200
  },
  berserk: {
    id: 'berserk',
    name: '狂暴',
    icon: '💪',
    cooldown: 10,
    description: '3 回合内攻击 +50%，防御 -30%',
    unlockCondition: (stats) => stats.prestige >= 100
  },
  heal: {
    id: 'heal',
    name: '疗伤',
    icon: '🩹',
    cooldown: 6,
    description: '恢复 30HP',
    unlockCondition: (stats) => stats.money >= 150,
    cost: 150
  },
  follower_charge: {
    id: 'follower_charge',
    name: '小弟冲锋',
    icon: '🌪️',
    cooldown: 8,
    description: '所有小弟同时攻击，总伤害×1.5',
    unlockCondition: (stats) => stats.followers >= 10
  }
}

// 创建技能状态
export function createSkillsState() {
  return reactive({
    critical_strike: { unlocked: false, cooldown: 0, active: false },
    iron_body: { unlocked: false, cooldown: 0, active: false, turnsLeft: 0 },
    berserk: { unlocked: false, cooldown: 0, active: false, turnsLeft: 0 },
    heal: { unlocked: false, cooldown: 0 },
    follower_charge: { unlocked: false, cooldown: 0 }
  })
}

// 检查技能是否解锁
export function checkSkillUnlocked(skillId, stats) {
  const skill = SKILLS_CONFIG[skillId]
  if (!skill) return false
  
  if (skill.unlockCondition) {
    return skill.unlockCondition(stats)
  }
  return false
}

// 计算技能效果
export function calculateSkillEffect(skillId, playerStats, enemyStats) {
  switch (skillId) {
    case 'critical_strike':
      return { damageMultiplier: 2.0 }
    
    case 'iron_body':
      return { defenseMultiplier: 1.5, turns: 3 }
    
    case 'berserk':
      return { attackMultiplier: 1.5, defenseMultiplier: 0.7, turns: 3 }
    
    case 'heal':
      return { healAmount: 30 }
    
    case 'follower_charge':
      return { followerDamageMultiplier: 1.5 }
    
    default:
      return {}
  }
}

// 应用技能效果到玩家
export function applySkillToPlayer(skillId, player, skillEffects) {
  const effect = calculateSkillEffect(skillId, player)
  
  switch (skillId) {
    case 'iron_body':
      skillEffects.playerDefenseBuff = effect.defenseMultiplier
      player.skills.iron_body.turnsLeft = effect.turns
      break
    
    case 'berserk':
      skillEffects.playerAttackBuff = effect.attackMultiplier
      skillEffects.playerDefenseBuff = effect.defenseMultiplier
      player.skills.berserk.turnsLeft = effect.turns
      break
  }
}

// 移除技能效果
export function removeSkillEffect(skillId, skillEffects) {
  switch (skillId) {
    case 'iron_body':
      skillEffects.playerDefenseBuff = 1
      break
    
    case 'berserk':
      skillEffects.playerAttackBuff = 1
      skillEffects.playerDefenseBuff = 1
      break
  }
}

// 技能使用主函数
export function useSkill(skillId, gameState) {
  const { player, stats, currentEnemy, battleResult, skillEffects, isBattling } = gameState
  
  // 检查是否在战斗中
  if (!isBattling.value && skillId !== 'heal') {
    return { success: false, message: '只能在战斗中使用技能！' }
  }
  
  const skill = SKILLS_CONFIG[skillId]
  const skillState = player.skills[skillId]
  
  // 检查是否解锁
  if (!skillState.unlocked) {
    if (checkSkillUnlocked(skillId, stats)) {
      skillState.unlocked = true
      return { success: false, message: `技能【${skill.name}】已解锁！但冷却中。` }
    }
    return { success: false, message: '技能未解锁！' }
  }
  
  // 检查冷却
  if (skillState.cooldown > 0) {
    return { success: false, message: `技能冷却中（${skillState.cooldown}回合）！` }
  }
  
  // 检查消耗
  if (skill.cost && stats.money < skill.cost) {
    return { success: false, message: '大洋不足！' }
  }
  
  // 消耗资源
  if (skill.cost) {
    stats.money -= skill.cost
  }
  
  // 设置冷却
  skillState.cooldown = skill.cooldown
  
  // 应用技能效果
  const effect = calculateSkillEffect(skillId, player, currentEnemy.value)
  
  switch (skillId) {
    case 'critical_strike':
      skillEffects.criticalStrike = true
      battleResult.value = '使用了【致命一击】！下次攻击伤害×2'
      return { success: true, message: '下次攻击将造成双倍伤害！' }
    
    case 'iron_body':
      skillEffects.playerDefenseBuff = effect.defenseMultiplier
      player.skills.iron_body.active = true
      player.skills.iron_body.turnsLeft = effect.turns
      battleResult.value = '使用了【铁布衫】！防御力提升 50%，持续 3 回合'
      return { success: true, message: '防御力大幅提升！' }
    
    case 'berserk':
      skillEffects.playerAttackBuff = effect.attackMultiplier
      skillEffects.playerDefenseBuff = effect.defenseMultiplier
      player.skills.berserk.active = true
      player.skills.berserk.turnsLeft = effect.turns
      battleResult.value = '使用了【狂暴】！攻击力 +50%，防御力 -30%，持续 3 回合'
      return { success: true, message: '进入狂暴状态！' }
    
    case 'heal':
      const healAmount = Math.min(effect.healAmount, player.maxHp - player.hp)
      if (healAmount <= 0) {
        return { success: false, message: 'HP 已满！' }
      }
      player.hp += healAmount
      battleResult.value = `使用了【疗伤】！恢复了${healAmount}点 HP`
      return { success: true, message: `HP 恢复${healAmount}点！` }
    
    case 'follower_charge':
      skillEffects.followerCharge = true
      battleResult.value = '使用了【小弟冲锋】！小弟伤害×1.5'
      return { success: true, message: '小弟们准备冲锋！' }
    
    default:
      return { success: false, message: '未知技能！' }
  }
}

// 回合结束减少冷却
export function reduceSkillCooldowns(player) {
  Object.keys(player.skills).forEach(skillId => {
    const skill = player.skills[skillId]
    if (skill.cooldown > 0) {
      skill.cooldown--
    }
    
    // 减少持续回合
    if (skill.turnsLeft !== undefined) {
      skill.turnsLeft--
      if (skill.turnsLeft <= 0) {
        skill.active = false
      }
    }
  })
}

// 清除所有技能效果
export function clearSkillEffects(skillEffects) {
  skillEffects.playerAttackBuff = 1
  skillEffects.playerDefenseBuff = 1
  skillEffects.enemyAttackBuff = 1
  skillEffects.enemyDefenseBuff = 1
  skillEffects.criticalStrike = false
  skillEffects.followerCharge = false
}
