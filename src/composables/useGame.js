import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { SKILLS_CONFIG, createSkillsState, useSkill as useSkillLogic, reduceSkillCooldowns, clearSkillEffects } from './skills'
import { EQUIPMENT_CONFIG, createEquipmentState, getEquipmentStats, buyEquipment, equipItem as doEquipItem } from './equipment'
import { PRESTIGE_LEVELS_CONFIG, getPrestigeLevel, getPrestigeInfo, checkPrestigeLevelUp, checkWinConditionByPrestige } from './prestige'
import { WEATHER_CONFIG, createWeatherState, updateWeather as updateWeatherLogic, getWeatherEffects } from './weather'
import { RANDOM_EVENTS_CONFIG, createRandomEventState, checkRandomEventTrigger, selectRandomEvent, handleEventChoice } from './randomEvents'

// 游戏常量
const TILE_SIZE = 40
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

// 每个区域的独立地图尺寸
const REGION_MAP_WIDTH = 30
const REGION_MAP_HEIGHT = 25

const TERRAIN = {
  GRASS: 0,
  ROAD: 1,
  BUILDING: 2,
  FOREST: 3,
  MOUNTAIN: 4,
  RIVER: 5,
  BRIDGE: 6,
  STRONGHOLD: 7
}

const REGIONS_TEMPLATE = [
  { 
    name: '南市', 
    x: 0, y: 0, w: REGION_MAP_WIDTH, h: REGION_MAP_HEIGHT, 
    boss: null, conquered: false,
    entrance: { x: 14, y: 24 },
    exits: [{ x: 14, y: 0, targetRegion: 1 }]
  },
  { 
    name: '闸北', 
    x: 0, y: 0, w: REGION_MAP_WIDTH, h: REGION_MAP_HEIGHT, 
    boss: null, conquered: false,
    entrance: { x: 14, y: 24 },
    exits: [{ x: 14, y: 0, targetRegion: 2 }, { x: 29, y: 12, targetRegion: 3 }]
  },
  { 
    name: '虹口', 
    x: 0, y: 0, w: REGION_MAP_WIDTH, h: REGION_MAP_HEIGHT, 
    boss: null, conquered: false,
    entrance: { x: 14, y: 24 },
    exits: [{ x: 0, y: 12, targetRegion: 1 }]
  },
  { 
    name: '法租界', 
    x: 0, y: 0, w: REGION_MAP_WIDTH, h: REGION_MAP_HEIGHT, 
    boss: null, conquered: false,
    entrance: { x: 0, y: 12 },
    exits: [{ x: 29, y: 12, targetRegion: 1 }]
  }
]

export function useGame() {
  // 游戏状态
  const canvasRef = ref(null)
  const ctx = ref(null)
  
  const regionMaps = ref([])
  const currentMap = ref([])
  const currentTerritories = ref([])
  const currentEnemySpots = ref([])
  const currentTaverns = ref([])
  const regions = ref([])
  
  const player = reactive({
    x: 14,
    y: 20,
    hp: 100,
    maxHp: 100,
    attack: 20,
    defense: 10,
    skills: createSkillsState(),
    equipment: createEquipmentState(),
    prestigeLevel: 0,
    enemiesDefeated: 0
  })
  
  const stats = reactive({
    money: 100,
    prestige: 0,
    followers: 0,
    days: 30,
    steps: 0,
    conqueredRegions: 1,
    conqueredTiles: 0,  // 占领的格子数
    // 天气系统
    weather: createWeatherState(),
    // 随机事件
    eventState: createRandomEventState()
  })
  
  const camera = reactive({ x: 0, y: 0 })
  const currentRegionIndex = ref(0)
  
  // 战斗状态
  const isBattling = ref(false)
  const isBossBattle = ref(false)
  const currentEnemy = ref(null)
  const currentBossRegion = ref(null)
  const battleResult = ref('')
  const skillEffects = reactive({
    playerAttackBuff: 1,
    playerDefenseBuff: 1,
    enemyAttackBuff: 1,
    enemyDefenseBuff: 1,
    criticalStrike: false,
    followerCharge: false
  })
  
  // 小弟助战
  const isFollowerAttacking = ref(false)
  const attackingFollowerIndex = ref(-1)
  const damageNumbers = ref([])
  
  // UI 状态
  const isRecruiting = ref(false)
  const showSkills = ref(false)
  const showEquipment = ref(false)
  const showRandomEvent = ref(false)
  const currentEvent = ref(null)
  const showEnding = ref(false)
  const endingWin = ref(false)
  const alertMessage = ref('')
  const showAlert = ref(false)
  
  // 计算属性
  const conqueredCount = computed(() => stats.conqueredRegions)
  const totalRegions = computed(() => regions.value.length)
  const MAP_WIDTH = computed(() => REGION_MAP_WIDTH)
  const MAP_HEIGHT = computed(() => REGION_MAP_HEIGHT)
  
  // 获取总攻击力
  function getTotalAttack() {
    const equipStats = getEquipmentStats(player.equipment)
    const prestigeInfo = getPrestigeInfo(player.prestigeLevel)
    const baseAttack = player.attack
    
    let total = baseAttack + equipStats.attack + prestigeInfo.attack
    
    if (player.skills.berserk.active) {
      total = Math.floor(total * 1.5)
    }
    
    if (stats.followers >= 10) {
      total = Math.floor(total * 1.1)
    }
    
    return total
  }
  
  // 获取总防御力
  function getTotalDefense() {
    const equipStats = getEquipmentStats(player.equipment)
    const prestigeInfo = getPrestigeInfo(player.prestigeLevel)
    const baseDefense = player.defense
    
    let total = baseDefense + equipStats.defense + prestigeInfo.defense
    
    if (player.skills.berserk.active) {
      total = Math.floor(total * 0.7)
    }
    
    if (player.skills.iron_body.active) {
      total = Math.floor(total * 1.5)
    }
    
    return total
  }
  
  // 初始化游戏
  function initGame() {
    generateAllRegionMaps()
    loadRegion(0)
    updateCamera()
  }
  
  // 生成所有区域地图
  function generateAllRegionMaps() {
    regionMaps.value = []
    regions.value = JSON.parse(JSON.stringify(REGIONS_TEMPLATE))
    
    for (let i = 0; i < REGIONS_TEMPLATE.length; i++) {
      const regionData = generateSingleRegionMap(i)
      regionMaps.value.push(regionData)
    }
    
    regions.value[0].conquered = true
  }
  
  // 生成单个区域地图
  function generateSingleRegionMap(regionIndex) {
    const map = []
    const territories = []
    const enemySpots = []
    const taverns = []
    const strongholds = []
    
    for (let y = 0; y < REGION_MAP_HEIGHT; y++) {
      map[y] = []
      territories[y] = []
      for (let x = 0; x < REGION_MAP_WIDTH; x++) {
        const rand = Math.random()
        if (rand < 0.1) {
          map[y][x] = TERRAIN.BUILDING
        } else if (rand < 0.25) {
          map[y][x] = TERRAIN.ROAD
        } else if (rand < 0.35) {
          map[y][x] = TERRAIN.FOREST
        } else if (rand < 0.40) {
          map[y][x] = TERRAIN.MOUNTAIN
        } else {
          map[y][x] = TERRAIN.GRASS
        }
        territories[y][x] = false
      }
    }
    
    const region = REGIONS_TEMPLATE[regionIndex]
    if (region.entrance) {
      map[region.entrance.y][region.entrance.x] = TERRAIN.GRASS
      for (let i = 0; i < 8; i++) {
        const dx = [-1, 1, 0, 0, -1, -1, 1, 1][i]
        const dy = [0, 0, -1, 1, -1, 1, -1, 1][i]
        const nx = region.entrance.x + dx
        const ny = region.entrance.y + dy
        if (nx >= 0 && nx < REGION_MAP_WIDTH && ny >= 0 && ny < REGION_MAP_HEIGHT) {
          map[ny][nx] = TERRAIN.GRASS
        }
      }
    }
    
    if (region.exits) {
      for (const exit of region.exits) {
        map[exit.y][exit.x] = TERRAIN.GRASS
        for (let i = 0; i < 8; i++) {
          const dx = [-1, 1, 0, 0, -1, -1, 1, 1][i]
          const dy = [0, 0, -1, 1, -1, 1, -1, 1][i]
          const nx = exit.x + dx
          const ny = exit.y + dy
          if (nx >= 0 && nx < REGION_MAP_WIDTH && ny >= 0 && ny < REGION_MAP_HEIGHT) {
            map[ny][nx] = TERRAIN.GRASS
          }
        }
      }
    }
    
    const enemyCount = 8 + Math.floor(Math.random() * 3)
    for (let i = 0; i < enemyCount; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * REGION_MAP_WIDTH)
        y = Math.floor(Math.random() * REGION_MAP_HEIGHT)
      } while (
        [TERRAIN.BUILDING, TERRAIN.RIVER, TERRAIN.MOUNTAIN].includes(map[y][x]) ||
        (region.entrance && x === region.entrance.x && y === region.entrance.y) ||
        enemySpots.some(spot => spot.x === x && spot.y === y)
      )
      enemySpots.push({ x, y, level: Math.floor(Math.random() * 3) + 1 })
    }
    
    const tavernCount = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < tavernCount; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * REGION_MAP_WIDTH)
        y = Math.floor(Math.random() * REGION_MAP_HEIGHT)
      } while (
        [TERRAIN.BUILDING, TERRAIN.RIVER, TERRAIN.MOUNTAIN].includes(map[y][x]) ||
        (region.entrance && x === region.entrance.x && y === region.entrance.y) ||
        taverns.some(t => t.x === x && t.y === y)
      )
      taverns.push({ x, y })
    }
    
    const strongholdCount = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < strongholdCount; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * REGION_MAP_WIDTH)
        y = Math.floor(Math.random() * REGION_MAP_HEIGHT)
      } while (
        [TERRAIN.BUILDING, TERRAIN.RIVER].includes(map[y][x]) ||
        (region.entrance && x === region.entrance.x && y === region.entrance.y)
      )
      map[y][x] = TERRAIN.STRONGHOLD
      strongholds.push({ x, y })
    }
    
    return { map, territories, enemySpots, taverns, strongholds }
  }
  
  // 加载区域
  function loadRegion(regionIndex) {
    if (regionIndex < 0 || regionIndex >= regionMaps.value.length) return
    
    currentRegionIndex.value = regionIndex
    const regionData = regionMaps.value[regionIndex]
    
    currentMap.value = JSON.parse(JSON.stringify(regionData.map))
    currentTerritories.value = JSON.parse(JSON.stringify(regionData.territories))
    currentEnemySpots.value = JSON.parse(JSON.stringify(regionData.enemySpots))
    currentTaverns.value = JSON.parse(JSON.stringify(regionData.taverns))
    
    if (regions.value[regionIndex].conquered) {
      for (let y = 0; y < REGION_MAP_HEIGHT; y++) {
        for (let x = 0; x < REGION_MAP_WIDTH; x++) {
          currentTerritories.value[y][x] = true
        }
      }
    }
    
    const region = regions.value[regionIndex]
    if (region.entrance && !region.conquered) {
      player.x = region.entrance.x
      player.y = region.entrance.y
    }
    
    if (!region.conquered && !region.boss) {
      generateRegionBoss(regionIndex)
    }
    
    updateCamera()
    
    if (!region.conquered) {
      setAlert(`进入${region.name}！找到并击败区域 BOSS 以占领此地！`)
    } else {
      setAlert(`进入${region.name}`)
    }
  }
  
  // 生成 BOSS
  function generateRegionBoss(regionIndex) {
    const region = regions.value[regionIndex]
    if (!region || region.conquered || region.boss) return
    
    let x, y
    do {
      x = Math.floor(Math.random() * REGION_MAP_WIDTH)
      y = Math.floor(Math.random() * REGION_MAP_HEIGHT)
    } while (
      regionMaps.value[regionIndex].map[y][x] === TERRAIN.BUILDING ||
      (region.entrance && x === region.entrance.x && y === region.entrance.y) ||
      region.exits?.some(exit => exit.x === x && exit.y === y)
    )
    
    region.boss = {
      x, y,
      level: regionIndex + 2,
      hp: 80 + regionIndex * 40,
      maxHp: 80 + regionIndex * 40,
      attack: 15 + regionIndex * 8,
      defense: 8 + regionIndex * 4,
      gold: 50 + regionIndex * 30,
      prestige: 20 + regionIndex * 15
    }
  }
  
  // 移动玩家
  function movePlayer(dx, dy) {
    if (isBattling.value || isRecruiting.value) return
    
    const newX = player.x + dx
    const newY = player.y + dy
    
    if (newX < 0 || newX >= REGION_MAP_WIDTH || newY < 0 || newY >= REGION_MAP_HEIGHT) return
    if (currentMap.value[newY][newX] === TERRAIN.BUILDING) return
    
    const currentRegion = regions.value[currentRegionIndex.value]
    const exitFound = currentRegion.exits?.find(exit => exit.x === newX && exit.y === newY)
    
    if (exitFound) {
      const targetRegionIndex = exitFound.targetRegion
      if (regions.value[targetRegionIndex].conquered) {
        loadRegion(targetRegionIndex)
        return
      } else {
        setAlert(`${regions.value[targetRegionIndex].name}还未被占领！`)
        return
      }
    }
    
    player.x = newX
    player.y = newY
    stats.steps++
    
    // 天气对移动的影响
    const weatherEffects = getWeatherEffects(stats.weather.current)
    if (weatherEffects.movement < 1.0) {
      // 移动力降低时，实际移动距离减少
      // 这里简化处理，不额外消耗步数
    }
    
    if (!currentTerritories.value[newY][newX]) {
      currentTerritories.value[newY][newX] = true
      stats.money += 20
      stats.prestige += 5
      stats.conqueredTiles++
      
      // 检查威望升级
      const levelUp = checkPrestigeLevelUp(player.prestigeLevel, stats.prestige)
      if (levelUp.leveledUp) {
        player.prestigeLevel = levelUp.newLevel
        setAlert(`🎉 威望提升！晋升为【${levelUp.title}】！\n攻击力 +${levelUp.attackBonus}，防御力 +${levelUp.defenseBonus}`)
      } else {
        setAlert('占领了一块地盘！\n大洋 +20，威望 +5')
      }
      
      checkRegionConquest()
    }
    
    // 检查随机事件
    stats.eventState.stepsSinceLastEvent++
    const eventTrigger = checkRandomEventTrigger(stats.steps, stats.conqueredTiles)
    if (eventTrigger.trigger) {
      triggerRandomEvent(eventTrigger.type)
      stats.steps = 0  // 重置步数
      stats.eventState.stepsSinceLastEvent = 0
    }
    
    checkStepCount()
    checkEnemySpot()
    checkBossSpot()
    checkTavern()
    updateCamera()
  }
  
  // 检查步数
  function checkStepCount() {
    if (stats.steps >= 10) {
      stats.steps = 0
      stats.days--
      deductWages()
      checkGameEnd()
    }
  }
  
  // 扣除工资
  function deductWages() {
    const wage = stats.followers * 2
    stats.money -= wage
    if (stats.money < 0) stats.money = 0
    
    // 更新天气
    const weatherResult = updateWeatherLogic(stats.weather, stats.days)
    if (weatherResult.changed) {
      setAlert(`🌤️ 天气变化：${weatherResult.icon} ${weatherResult.name}！\n${weatherResult.description}`)
    }
  }
  
  // 检查敌人
  function checkEnemySpot() {
    const index = currentEnemySpots.value.findIndex(spot => spot.x === player.x && spot.y === player.y)
    if (index !== -1) {
      startBattle(index, false)
    }
  }
  
  // 检查 BOSS
  function checkBossSpot() {
    const region = regions.value[currentRegionIndex.value]
    if (region && !region.conquered && region.boss &&
        region.boss.x === player.x && region.boss.y === player.y) {
      startBossBattle(region)
    }
  }
  
  // 检查酒馆
  function checkTavern() {
    const exists = currentTaverns.value.some(tavern => tavern.x === player.x && tavern.y === player.y)
    if (exists) {
      isRecruiting.value = true
    }
  }
  
  // 触发随机事件
  function triggerRandomEvent(eventType) {
    const event = selectRandomEvent(eventType)
    currentEvent.value = event
    showRandomEvent.value = true
  }
  
  // 处理事件选择
  function handleEventChoiceWrapper(choiceIndex) {
    if (!currentEvent.value) return
    
    const result = handleEventChoice(currentEvent.value, choiceIndex, {
      stats,
      player
    })
    
    if (result.success) {
      setAlert(result.message)
      
      // 处理战斗风险
      if (currentEvent.value.choices[choiceIndex].risk === 'combat') {
        // 触发战斗
        const enemy = generateEnemy(1, 3)
        currentEnemy.value = enemy
        isBattling.value = true
      }
    } else {
      setAlert(result.message)
    }
    
    showRandomEvent.value = false
    currentEvent.value = null
  }
  
  // 关闭随机事件
  function closeRandomEvent() {
    showRandomEvent.value = false
    currentEvent.value = null
  }
  
  // 检查区域占领
  function checkRegionConquest() {
    const regionIndex = currentRegionIndex.value
    const region = regions.value[regionIndex]
    
    if (region.conquered) return
    
    let allConquered = true
    for (let y = 0; y < REGION_MAP_HEIGHT; y++) {
      for (let x = 0; x < REGION_MAP_WIDTH; x++) {
        if (currentMap.value[y][x] === TERRAIN.BUILDING) continue
        if (!currentTerritories.value[y][x]) {
          allConquered = false
          break
        }
      }
      if (!allConquered) break
    }
    
    if (allConquered) {
      region.conquered = true
      stats.conqueredRegions++
      setAlert(`恭喜！你已完全占领${region.name}！`)
      checkGameEnd()
    }
  }
  
  // 开始战斗
  function startBattle(enemyIndex, isBoss) {
    isBattling.value = true
    battleResult.value = ''
    damageNumbers.value = []
    clearSkillEffects(skillEffects)
    
    if (isBoss) {
      isBossBattle.value = true
      currentEnemy.value = JSON.parse(JSON.stringify(currentBossRegion.value.boss))
    } else {
      isBossBattle.value = false
      const spot = currentEnemySpots.value[enemyIndex]
      const level = spot.level
      
      currentEnemy.value = {
        level,
        hp: 30 + level * 20,
        maxHp: 30 + level * 20,
        attack: 10 + level * 5,
        defense: 5 + level * 2,
        gold: 15 + level * 10,
        prestige: 3 + level * 2,
        spotIndex: enemyIndex
      }
    }
  }
  
  // 开始 BOSS 战
  function startBossBattle(region) {
    isBattling.value = true
    isBossBattle.value = true
    currentBossRegion.value = region
    currentEnemy.value = JSON.parse(JSON.stringify(region.boss))
    battleResult.value = ''
    damageNumbers.value = []
    clearSkillEffects(skillEffects)
  }
  
  // 使用技能
  function useSkill(skillId) {
    const result = useSkillLogic(skillId, {
      player,
      stats,
      currentEnemy,
      battleResult,
      skillEffects,
      isBattling
    })
    
    if (result.success) {
      // 疗伤技能立即生效
      if (skillId === 'heal') {
        // 已经在 useSkillLogic 中处理
      }
    }
    
    return result
  }
  
  // 攻击
  async function attack() {
    if (!isBattling.value || !currentEnemy.value) return
    
    // 1. 主角攻击
    let playerDamage = Math.max(1, getTotalAttack() - currentEnemy.value.defense + Math.floor(Math.random() * 5))
    
    // 致命一击
    if (skillEffects.criticalStrike) {
      playerDamage *= 2
      skillEffects.criticalStrike = false
    }
    
    currentEnemy.value.hp -= playerDamage
    battleResult.value = `你造成了 ${playerDamage} 点伤害！`
    addDamageNumber(playerDamage, 'player')
    
    if (currentEnemy.value.hp <= 0) {
      battleVictory()
      return
    }
    
    // 2. 小弟助战
    if (stats.followers > 0) {
      await executeFollowerAttack()
      
      if (currentEnemy.value.hp <= 0) {
        battleVictory()
        return
      }
    }
    
    // 3. 敌人反击
    await wait(300)
    const enemyDamage = Math.max(1, currentEnemy.value.attack - getTotalDefense() + Math.floor(Math.random() * 5))
    player.hp -= enemyDamage
    
    setTimeout(() => {
      battleResult.value = `敌人造成了 ${enemyDamage} 点伤害！`
      if (player.hp <= 0) {
        battleDefeat()
      }
    }, 500)
  }
  
  // 等待
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // 小弟攻击
  async function executeFollowerAttack() {
    const followerCount = Math.min(stats.followers, 5)
    let totalDamage = 0
    let damageMultiplier = 1
    
    if (skillEffects.followerCharge) {
      damageMultiplier = 1.5
      skillEffects.followerCharge = false
    }
    
    battleResult.value = `小弟们助战！`
    await wait(500)
    
    for (let i = 0; i < followerCount; i++) {
      attackingFollowerIndex.value = i
      isFollowerAttacking.value = true
      
      await wait(200)
      
      const baseDamage = 3
      const followerBonus = Math.min(stats.followers, 10) * 0.5
      const randomFactor = Math.random() * 2
      const damage = Math.floor((baseDamage + followerBonus + randomFactor) * damageMultiplier)
      totalDamage += damage
      
      addDamageNumber(damage, `follower-${i}`)
      
      await wait(400)
      isFollowerAttacking.value = false
    }
    
    battleResult.value = `小弟们共造成 ${totalDamage} 点伤害！`
    
    if (currentEnemy.value) {
      currentEnemy.value.hp -= totalDamage
    }
    
    if (followerCount >= 3) {
      battleResult.value = `连击！x${followerCount} ${battleResult.value}`
    }
    
    attackingFollowerIndex.value = -1
  }
  
  // 添加伤害数字
  function addDamageNumber(value, type) {
    const id = Date.now() + Math.random()
    damageNumbers.value.push({
      id,
      value,
      type,
      x: type === 'player' ? 30 : type.startsWith('follower') ? 45 : 70,
      y: 50 + Math.random() * 20
    })
    
    setTimeout(() => {
      damageNumbers.value = damageNumbers.value.filter(n => n.id !== id)
    }, 2000)
  }
  
  // 逃跑
  function flee() {
    if (!isBattling.value) return
    
    if (isBossBattle.value) {
      setAlert('BOSS 战无法逃跑！')
      return
    }
    
    if (stats.prestige < 5) {
      setAlert('威望不足！')
      return
    }
    
    stats.prestige -= 5
    isBattling.value = false
    currentEnemy.value = null
    setAlert('成功逃跑！威望 -5')
  }
  
  // 战斗胜利
  function battleVictory() {
    const enemy = currentEnemy.value
    stats.money += enemy.gold
    stats.prestige += enemy.prestige
    player.enemiesDefeated++
    
    // 检查技能解锁
    Object.keys(SKILLS_CONFIG).forEach(skillId => {
      if (!player.skills[skillId].unlocked) {
        if (SKILLS_CONFIG[skillId].unlockCondition && 
            SKILLS_CONFIG[skillId].unlockCondition(stats)) {
          player.skills[skillId].unlocked = true
          setAlert(`🎉 解锁技能：【${SKILLS_CONFIG[skillId].name}】！`)
        }
      }
    })
    
    if (!isBossBattle.value) {
      currentEnemySpots.value.splice(enemy.spotIndex, 1)
    } else {
      conquerRegion()
    }
    
    player.hp = Math.min(player.maxHp, Math.floor(player.hp * 1.1))
    
    isBattling.value = false
    isBossBattle.value = false
    currentEnemy.value = null
    clearSkillEffects(skillEffects)
    
    if (isBossBattle.value) {
      setAlert(`🎉 击败${currentBossRegion.value.name}大佬！\n占领${currentBossRegion.value.name}！`)
    } else {
      setAlert(`战斗胜利！获得 ${enemy.gold} 大洋，威望 +${enemy.prestige}`)
    }
    
    checkWinCondition()
  }
  
  // 占领区域
  function conquerRegion() {
    const regionIndex = currentRegionIndex.value
    const region = regions.value[regionIndex]
    region.conquered = true
    stats.conqueredRegions++
    
    for (let y = 0; y < REGION_MAP_HEIGHT; y++) {
      for (let x = 0; x < REGION_MAP_WIDTH; x++) {
        if (currentMap.value[y][x] !== TERRAIN.BUILDING) {
          currentTerritories.value[y][x] = true
        }
      }
    }
    
    region.boss = null
  }
  
  // 战斗失败
  function battleDefeat() {
    stats.days--
    stats.money = Math.floor(stats.money / 2)
    
    const startRegion = regions.value.find(r => r.conquered)
    if (startRegion) {
      player.x = startRegion.x + Math.floor(startRegion.w / 2)
      player.y = startRegion.y + Math.floor(startRegion.h / 2)
    }
    player.hp = player.maxHp
    
    isBattling.value = false
    isBossBattle.value = false
    currentEnemy.value = null
    clearSkillEffects(skillEffects)
    
    updateCamera()
    setAlert('战斗失败！时间 -1 天，金钱减半')
    checkGameEnd()
  }
  
  // 购买商品
  function buyItem(itemType) {
    let price = 0
    let message = ''
    
    switch (itemType) {
      case 'heal':
        price = 30
        if (stats.money < price) { setAlert('大洋不足！'); return }
        if (player.hp >= player.maxHp) { setAlert('HP 已满！'); return }
        player.hp = Math.min(player.hp + 30, player.maxHp)
        message = '使用跌打药酒，恢复了 30 点 HP！'
        break
        
      case 'fullHeal':
        price = 100
        if (stats.money < price) { setAlert('大洋不足！'); return }
        if (player.hp >= player.maxHp) { setAlert('HP 已满！'); return }
        player.hp = player.maxHp
        message = '使用医疗箱，HP 完全恢复！'
        break
        
      case 'attack':
        price = 80
        if (stats.money < price) { setAlert('大洋不足！'); return }
        player.attack += 3
        message = '服用大力丸，攻击力永久 +3！'
        break
        
      case 'defense':
        price = 80
        if (stats.money < price) { setAlert('大洋不足！'); return }
        player.defense += 2
        message = '学会铁布衫，防御力永久 +2！'
        break
        
      case 'follower':
        price = 50
        if (stats.money < price) { setAlert('大洋不足！'); return }
        stats.followers++
        player.attack += 5
        message = '招募一名小弟！攻击力永久 +5！'
        break
    }
    
    stats.money -= price
    setAlert(message)
  }
  
  // 关闭商店
  function closeShop() {
    isRecruiting.value = false
  }
  
  // 打开装备界面
  function openEquipment() {
    showEquipment.value = true
  }
  
  // 关闭装备界面
  function closeEquipment() {
    showEquipment.value = false
  }
  
  // 购买装备
  function buyEquip(equipmentId, type) {
    const result = buyEquipment(equipmentId, type, stats, player.equipment)
    if (result.success) {
      setAlert(result.message)
    } else {
      setAlert(result.message)
    }
  }
  
  // 装备物品
  function equipItem(itemId, type) {
    const result = doEquipItem(itemId, type, player.equipment)
    if (result.success) {
      setAlert(result.message)
    } else {
      setAlert(result.message)
    }
  }
  
  // 检查胜利
  function checkWinCondition() {
    const prestigeWin = checkWinConditionByPrestige(stats.prestige)
    if (stats.conqueredRegions >= regions.value.length || prestigeWin) {
      showEnding.value = true
      endingWin.value = true
    }
  }
  
  // 检查游戏结束
  function checkGameEnd() {
    if (stats.days <= 0) {
      showEnding.value = true
      endingWin.value = false
    }
  }
  
  // 重新开始
  function restartGame() {
    showEnding.value = false
    
    player.x = 14
    player.y = 20
    player.hp = 100
    player.maxHp = 100
    player.attack = 20
    player.defense = 10
    player.skills = createSkillsState()
    player.equipment = createEquipmentState()
    player.prestigeLevel = 0
    player.enemiesDefeated = 0
    
    stats.money = 100
    stats.prestige = 0
    stats.followers = 0
    stats.days = 30
    stats.steps = 0
    stats.conqueredRegions = 0
    
    currentRegionIndex.value = 0
    isBattling.value = false
    isRecruiting.value = false
    isBossBattle.value = false
    currentEnemy.value = null
    clearSkillEffects(skillEffects)
    
    initGame()
  }
  
  // 更新摄像机
  function updateCamera() {
    const centerX = player.x * TILE_SIZE + TILE_SIZE / 2
    const centerY = player.y * TILE_SIZE + TILE_SIZE / 2
    
    camera.x = Math.max(0, Math.min(centerX - CANVAS_WIDTH / 2, REGION_MAP_WIDTH * TILE_SIZE - CANVAS_WIDTH))
    camera.y = Math.max(0, Math.min(centerY - CANVAS_HEIGHT / 2, REGION_MAP_HEIGHT * TILE_SIZE - CANVAS_HEIGHT))
  }
  
  // 保存游戏
  function saveGame() {
    const saveData = {
      regionMaps: regionMaps.value,
      regions: regions.value,
      player: JSON.parse(JSON.stringify(player)),
      stats: JSON.parse(JSON.stringify(stats)),
      currentRegionIndex: currentRegionIndex.value
    }
    
    localStorage.setItem('axeGameSave', JSON.stringify(saveData))
    setAlert('游戏已保存！')
  }
  
  // 读取游戏
  function loadGame() {
    const saveData = localStorage.getItem('axeGameSave')
    if (!saveData) {
      setAlert('没有找到存档！')
      return
    }
    
    const data = JSON.parse(saveData)
    
    regionMaps.value = data.regionMaps
    regions.value = data.regions
    
    Object.assign(player, data.player)
    Object.assign(stats, data.stats)
    
    loadRegion(data.currentRegionIndex || 0)
    updateCamera()
    
    setAlert('游戏已读取！')
  }
  
  // 设置提示
  function setAlert(msg) {
    alertMessage.value = msg
    showAlert.value = true
  }
  
  // 关闭提示
  function closeAlert() {
    showAlert.value = false
  }
  
  // 键盘事件
  function handleKeyDown(e) {
    let dx = 0, dy = 0
    
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': dy = -1; break
      case 'ArrowDown': case 's': case 'S': dy = 1; break
      case 'ArrowLeft': case 'a': case 'A': dx = -1; break
      case 'ArrowRight': case 'd': case 'D': dx = 1; break
      default: return
    }
    
    movePlayer(dx, dy)
  }
  
  // 生命周期
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    initGame()
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
  
  return {
    canvasRef,
    ctx,
    currentMap,
    currentTerritories,
    currentEnemySpots,
    currentTaverns,
    regions,
    player,
    stats,
    camera,
    currentRegionIndex,
    isBattling,
    isBossBattle,
    currentEnemy,
    currentBossRegion,
    battleResult,
    isRecruiting,
    showSkills,
    showEquipment,
    showRandomEvent,
    currentEvent,
    showEnding,
    endingWin,
    alertMessage,
    showAlert,
    isFollowerAttacking,
    attackingFollowerIndex,
    damageNumbers,
    SKILLS_CONFIG,
    EQUIPMENT_CONFIG,
    WEATHER_CONFIG,
    RANDOM_EVENTS_CONFIG,
    conqueredCount,
    totalRegions,
    initGame,
    movePlayer,
    attack,
    flee,
    useSkill,
    buyItem,
    closeShop,
    openEquipment,
    closeEquipment,
    buyEquip,
    equipItem,
    handleEventChoice: handleEventChoiceWrapper,
    closeRandomEvent,
    restartGame,
    saveGame,
    loadGame,
    closeAlert,
    TILE_SIZE,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    TERRAIN,
    getTotalAttack,
    getTotalDefense
  }
}
