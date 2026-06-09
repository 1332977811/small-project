// 天气配置
export const WEATHER_CONFIG = {
  sunny: {
    id: 'sunny',
    name: '晴天',
    icon: '☀️',
    color: '#FFD700',
    effects: {
      movement: 1.0,      // 移动力正常
      combat_hit: 1.0,    // 命中率正常
      visibility: 1.0,    // 视野正常
      stealth: 1.0,       // 隐蔽正常
      defense: 1.0        // 防御正常
    },
    description: '阳光明媚，一切正常'
  },
  rainy: {
    id: 'rainy',
    name: '雨天',
    icon: '🌧️',
    color: '#4169E1',
    effects: {
      movement: 0.8,      // 移动力 -20%
      combat_hit: 0.9,    // 命中率 -10%
      visibility: 0.8,    // 视野 -20%
      stealth: 1.3,       // 隐蔽 +30%
      defense: 1.1        // 防御 +10%
    },
    description: '雨水降低了移动和视野，但提升了隐蔽性'
  },
  snowy: {
    id: 'snowy',
    name: '雪天',
    icon: '❄️',
    color: '#87CEEB',
    effects: {
      movement: 0.7,      // 移动力 -30%
      combat_hit: 0.85,   // 命中率 -15%
      visibility: 0.6,    // 视野 -40%
      stealth: 1.5,       // 隐蔽 +50%
      defense: 1.0        // 防御正常
    },
    description: '大雪纷飞，移动困难，视野受限'
  },
  foggy: {
    id: 'foggy',
    name: '雾天',
    icon: '🌫️',
    color: '#A9A9A9',
    effects: {
      movement: 0.9,      // 移动力 -10%
      combat_hit: 0.8,    // 命中率 -20%
      visibility: 0.4,    // 视野 -60%
      stealth: 2.0,       // 隐蔽 +100%
      defense: 1.0        // 防御正常
    },
    description: '浓雾弥漫，视野极差，适合偷袭'
  }
}

// 创建天气状态
export function createWeatherState() {
  return {
    current: 'sunny',
    turn: 0,  // 当前天气持续回合
    nextChange: 3  // 下次变化剩余回合
  }
}

// 获取天气效果
export function getWeatherEffects(weatherId) {
  const weather = WEATHER_CONFIG[weatherId]
  return weather ? weather.effects : WEATHER_CONFIG.sunny.effects
}

// 更新天气（每 3 天变化）
export function updateWeather(weatherState, day) {
  weatherState.turn++
  weatherState.nextChange--
  
  // 每 3 天变化一次天气
  if (weatherState.nextChange <= 0) {
    const newWeather = getRandomWeather()
    weatherState.current = newWeather
    weatherState.turn = 0
    weatherState.nextChange = 3
    
    return {
      changed: true,
      newWeather,
      name: WEATHER_CONFIG[newWeather].name,
      icon: WEATHER_CONFIG[newWeather].icon,
      description: WEATHER_CONFIG[newWeather].description
    }
  }
  
  return { changed: false }
}

// 随机获取天气（晴天概率高）
export function getRandomWeather() {
  const rand = Math.random()
  if (rand < 0.5) {
    return 'sunny'      // 50% 晴天
  } else if (rand < 0.75) {
    return 'rainy'      // 25% 雨天
  } else if (rand < 0.9) {
    return 'snowy'      // 15% 雪天
  } else {
    return 'foggy'      // 10% 雾天
  }
}

// 检查天气对战斗的影响
export function getWeatherCombatBonus(weatherId, isAttacker) {
  const effects = getWeatherEffects(weatherId)
  
  // 雨天和雾天增加偷袭成功率
  if (weatherId === 'rainy' || weatherId === 'foggy') {
    if (isAttacker && effects.stealth > 1.0) {
      return {
        firstStrike: Math.random() < 0.3,  // 30% 概率先手
        damageBonus: 1.1  // 伤害 +10%
      }
    }
  }
  
  return {
    firstStrike: false,
    damageBonus: 1.0
  }
}

// 获取天气对移动的影响
export function getWeatherMovementPenalty(weatherId) {
  const effects = getWeatherEffects(weatherId)
  return effects.movement
}
