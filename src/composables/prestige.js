// 威望等级配置
export const PRESTIGE_LEVELS_CONFIG = {
  0: { title: '街头混混', attack: 0, defense: 0, followerLimit: 5, description: '刚入门的小喽啰' },
  30: { title: '小喽啰', attack: 2, defense: 1, followerLimit: 8, description: '有点名气了' },
  60: { title: '堂主', attack: 5, defense: 3, followerLimit: 12, description: '一方势力的头目' },
  100: { title: '香主', attack: 10, defense: 5, followerLimit: 15, unlock: ['berserk'], description: '帮派核心人物' },
  150: { title: '护法', attack: 15, defense: 8, followerLimit: 20, unlock: ['gold_armor'], description: '帮派元老' },
  200: { title: '上海滩霸主', attack: 20, defense: 10, followerLimit: 25, winCondition: true, description: '称霸上海滩' },
  300: { title: '传奇大亨', attack: 30, defense: 15, followerLimit: 30, title: true, description: '传说级人物' }
}

// 获取当前威望等级
export function getPrestigeLevel(prestige) {
  const levels = Object.keys(PRESTIGE_LEVELS_CONFIG).map(Number).sort((a, b) => b - a)
  for (const level of levels) {
    if (prestige >= level) {
      return level
    }
  }
  return 0
}

// 获取威望等级信息
export function getPrestigeInfo(level) {
  return PRESTIGE_LEVELS_CONFIG[level] || PRESTIGE_LEVELS_CONFIG[0]
}

// 检查威望升级
export function checkPrestigeLevelUp(currentLevel, newPrestige) {
  const newLevel = getPrestigeLevel(newPrestige)
  
  if (newLevel > currentLevel) {
    const info = getPrestigeInfo(newLevel)
    return {
      leveledUp: true,
      newLevel,
      title: info.title,
      attackBonus: info.attack,
      defenseBonus: info.defense,
      followerLimit: info.followerLimit,
      unlocks: info.unlock || []
    }
  }
  
  return { leveledUp: false, newLevel: currentLevel }
}

// 检查胜利条件
export function checkWinConditionByPrestige(prestige) {
  const level = getPrestigeLevel(prestige)
  const info = getPrestigeInfo(level)
  return info.winCondition || false
}

// 获取下一个等级
export function getNextPrestigeLevel(currentLevel) {
  const levels = Object.keys(PRESTIGE_LEVELS_CONFIG).map(Number).sort((a, b) => a - b)
  const currentIndex = levels.indexOf(currentLevel)
  
  if (currentIndex >= 0 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1]
  }
  
  return null
}

// 计算距离下一级还需要多少威望
export function getPrestigeNeeded(currentPrestige) {
  const currentLevel = getPrestigeLevel(currentPrestige)
  const nextLevel = getNextPrestigeLevel(currentLevel)
  
  if (nextLevel === null) {
    return 0  // 已满级
  }
  
  return nextLevel - currentPrestige
}
