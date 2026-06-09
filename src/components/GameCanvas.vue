<template>
  <canvas ref="canvas" width="800" height="600"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentMap: Array,
  currentTerritories: Array,
  currentEnemySpots: Array,
  currentTaverns: Array,
  regions: Array,
  player: Object,
  camera: Object,
  currentRegionIndex: Number,
  TILE_SIZE: Number,
  CANVAS_WIDTH: Number,
  CANVAS_HEIGHT: Number,
  TERRAIN: Object
})

const canvas = ref(null)
let ctx = null
let animationId = null

const TILE_SIZE = 40
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

function draw() {
  if (!ctx || !props.currentMap || !props.currentMap.length) return
  
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  
  drawMap()
  drawRegions()
  drawTerritories()
  drawEnemySpots()
  drawBossSpots()
  drawTaverns()
  drawPlayer()
  drawExits()
}

function drawMap() {
  const MAP_WIDTH = 30
  const MAP_HEIGHT = 25
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const screenX = x * TILE_SIZE - props.camera.x
      const screenY = y * TILE_SIZE - props.camera.y
      
      if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
          screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
        continue
      }
      
      switch (props.currentMap[y][x]) {
        case props.TERRAIN.GRASS:
          drawGrassTile(screenX, screenY, x, y)
          break
        case props.TERRAIN.ROAD:
          drawRoadTile(screenX, screenY, x, y)
          break
        case props.TERRAIN.BUILDING:
          drawBuildingTile(screenX, screenY)
          break
      }
      
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 0.5
      ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE)
    }
  }
}

function drawGrassTile(x, y, tileX, tileY) {
  const gradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE)
  gradient.addColorStop(0, '#2d5a27')
  gradient.addColorStop(1, '#1a3d16')
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
  
  ctx.fillStyle = '#3d7a37'
  const grassCount = 3 + (tileX + tileY) % 4
  for (let i = 0; i < grassCount; i++) {
    const gx = x + 5 + (i * 10) % 30
    const gy = y + TILE_SIZE - 5 - ((tileX + tileY + i) * 3) % 15
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.lineTo(gx - 2, gy - 6)
    ctx.lineTo(gx + 2, gy - 6)
    ctx.fill()
  }
}

function drawRoadTile(x, y, tileX, tileY) {
  const gradient = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE)
  gradient.addColorStop(0, '#a07030')
  gradient.addColorStop(0.5, '#8b5a2b')
  gradient.addColorStop(1, '#7a4a20')
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
  
  ctx.strokeStyle = '#6a3a15'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + TILE_SIZE / 2, y + 5)
  ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 5)
  ctx.stroke()
  
  ctx.fillStyle = '#6a3a15'
  ctx.beginPath()
  ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawBuildingTile(x, y) {
  const gradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE)
  gradient.addColorStop(0, '#5a5a5a')
  gradient.addColorStop(1, '#3a3a3a')
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
  
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE * 0.4)
  
  const windowRows = 2
  const windowCols = 3
  const ww = 6
  const wh = 8
  const wx = (TILE_SIZE - windowCols * (ww + 4)) / 2 + x
  const wy = y + TILE_SIZE * 0.5
  
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      ctx.fillStyle = '#ffcc66'
      ctx.fillRect(wx + col * (ww + 4), wy + row * (wh + 4), ww, wh)
    }
  }
  
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(x + TILE_SIZE * 0.3, y + TILE_SIZE - 4, TILE_SIZE * 0.4, 4)
}

function drawRegions() {
  props.regions.forEach((region) => {
    const screenX = region.x * TILE_SIZE - props.camera.x
    const screenY = region.y * TILE_SIZE - props.camera.y
    const screenW = region.w * TILE_SIZE
    const screenH = region.h * TILE_SIZE
    
    if (screenX + screenW < 0 || screenX > CANVAS_WIDTH ||
        screenY + screenH < 0 || screenY > CANVAS_HEIGHT) {
      return
    }
    
    ctx.strokeStyle = region.conquered ? '#00FF00' : '#FF6600'
    ctx.lineWidth = 3
    ctx.strokeRect(screenX, screenY, screenW, screenH)
    
    if (!region.conquered && region.boss) {
      const bossScreenX = region.boss.x * TILE_SIZE - props.camera.x
      const bossScreenY = region.boss.y * TILE_SIZE - props.camera.y
      
      if (bossScreenX + TILE_SIZE > 0 && bossScreenX < CANVAS_WIDTH &&
          bossScreenY + TILE_SIZE > 0 && bossScreenY < CANVAS_HEIGHT) {
        ctx.fillStyle = 'rgba(139, 0, 0, 0.7)'
        ctx.fillRect(bossScreenX, bossScreenY, TILE_SIZE, TILE_SIZE)
      }
    }
  })
}

function drawTerritories() {
  const MAP_WIDTH = 30
  const MAP_HEIGHT = 25
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (props.currentTerritories[y] && props.currentTerritories[y][x]) {
        const screenX = x * TILE_SIZE - props.camera.x
        const screenY = y * TILE_SIZE - props.camera.y
        
        if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
            screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
          continue
        }
        
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4)
      }
    }
  }
}

function drawEnemySpots() {
  const levelColors = {
    1: { bg: '#1a4a1a', glow: 'rgba(50, 200, 50, ', border: '#2d8a2d', text: '#44FF44' },
    2: { bg: '#4a3a1a', glow: 'rgba(255, 200, 50, ', border: '#daa520', text: '#FFD700' },
    3: { bg: '#4a1a1a', glow: 'rgba(255, 50, 50, ', border: '#cc0000', text: '#FF4444' }
  }
  
  const levelNames = { 1: '杂鱼', 2: '打手', 3: '高手' }
  
  props.currentEnemySpots.forEach(spot => {
    const screenX = spot.x * TILE_SIZE - props.camera.x
    const screenY = spot.y * TILE_SIZE - props.camera.y
    const centerX = screenX + TILE_SIZE / 2
    const centerY = screenY + TILE_SIZE / 2
    
    if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
        screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
      return
    }
    
    const colors = levelColors[spot.level] || levelColors[1]
    const size = TILE_SIZE / 2.8 + spot.level * 2
    
    ctx.fillStyle = colors.bg
    ctx.beginPath()
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2)
    ctx.fill()
    
    const glowSize = TILE_SIZE / 2.5 + spot.level * 3
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
    glowGradient.addColorStop(0, colors.glow + '0.6)')
    glowGradient.addColorStop(1, colors.glow + '0)')
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = colors.text
    ctx.font = `bold ${16 + spot.level * 2}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚔', centerX, centerY - 2)
    
    ctx.fillStyle = colors.text
    ctx.font = 'bold 10px Arial'
    ctx.fillText(levelNames[spot.level], centerX, centerY + 10)
    
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 2 + spot.level
    ctx.beginPath()
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2)
    ctx.stroke()
    
    if (spot.level === 3) {
      ctx.strokeStyle = '#FF6600'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.arc(centerX, centerY, size + 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  })
}

function drawBossSpots() {
  props.regions.forEach(region => {
    if (!region.conquered && region.boss) {
      const screenX = region.boss.x * TILE_SIZE - props.camera.x
      const screenY = region.boss.y * TILE_SIZE - props.camera.y
      const centerX = screenX + TILE_SIZE / 2
      const centerY = screenY + TILE_SIZE / 2
      
      if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
          screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
        return
      }
      
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, TILE_SIZE / 2)
      bgGradient.addColorStop(0, '#6B0000')
      bgGradient.addColorStop(1, '#3B0000')
      ctx.fillStyle = bgGradient
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE)
      
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, TILE_SIZE)
      glowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)')
      glowGradient.addColorStop(0.5, 'rgba(200, 0, 0, 0.2)')
      glowGradient.addColorStop(1, 'rgba(200, 0, 0, 0)')
      ctx.fillStyle = glowGradient
      ctx.fillRect(screenX - TILE_SIZE * 0.2, screenY - TILE_SIZE * 0.2, TILE_SIZE * 1.4, TILE_SIZE * 1.4)
      
      ctx.fillStyle = '#4a0000'
      ctx.beginPath()
      ctx.moveTo(centerX - 12, centerY + 8)
      ctx.lineTo(centerX - 6, centerY - 12)
      ctx.lineTo(centerX, centerY - 8)
      ctx.lineTo(centerX + 6, centerY - 12)
      ctx.lineTo(centerX + 12, centerY + 8)
      ctx.closePath()
      ctx.fill()
      
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('👹', centerX, centerY + 4)
      
      ctx.strokeStyle = '#FF0000'
      ctx.lineWidth = 3
      ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4)
      
      ctx.strokeStyle = '#FF6600'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.strokeRect(screenX - 4, screenY - 4, TILE_SIZE + 8, TILE_SIZE + 8)
      ctx.setLineDash([])
    }
  })
}

function drawTaverns() {
  props.currentTaverns.forEach(tavern => {
    const screenX = tavern.x * TILE_SIZE - props.camera.x
    const screenY = tavern.y * TILE_SIZE - props.camera.y
    
    if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
        screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
      return
    }
    
    const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + TILE_SIZE)
    gradient.addColorStop(0, '#6B3E26')
    gradient.addColorStop(1, '#4A2C18')
    ctx.fillStyle = gradient
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE)
    
    ctx.fillStyle = '#3a2010'
    ctx.fillRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE * 0.35)
    
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(screenX + 4, screenY + TILE_SIZE * 0.38, TILE_SIZE - 8, TILE_SIZE * 0.58)
    
    const signGradient = ctx.createLinearGradient(
      screenX + TILE_SIZE * 0.2, screenY + TILE_SIZE * 0.15,
      screenX + TILE_SIZE * 0.8, screenY + TILE_SIZE * 0.25
    )
    signGradient.addColorStop(0, '#DAA520')
    signGradient.addColorStop(1, '#B8860B')
    ctx.fillStyle = signGradient
    ctx.fillRect(screenX + TILE_SIZE * 0.2, screenY + TILE_SIZE * 0.15, TILE_SIZE * 0.6, TILE_SIZE * 0.12)
    
    ctx.fillStyle = '#8B0000'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('酒 馆', screenX + TILE_SIZE / 2, screenY + TILE_SIZE * 0.22)
    
    ctx.fillStyle = '#CD853F'
    ctx.font = 'bold 22px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🍶', screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2 + 8)
    
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 2
    ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE)
  })
}

// 绘制区域出口
function drawExits() {
  const currentRegion = props.regions[props.currentRegionIndex]
  if (!currentRegion || !currentRegion.exits) return
  
  currentRegion.exits.forEach(exit => {
    const screenX = exit.x * TILE_SIZE - props.camera.x
    const screenY = exit.y * TILE_SIZE - props.camera.y
    
    if (screenX + TILE_SIZE < 0 || screenX > CANVAS_WIDTH ||
        screenY + TILE_SIZE < 0 || screenY > CANVAS_HEIGHT) {
      return
    }
    
    const targetRegion = props.regions[exit.targetRegion]
    const isConquered = targetRegion?.conquered
    
    // 绘制出口标记
    const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + TILE_SIZE)
    if (isConquered) {
      gradient.addColorStop(0, '#2E8B57')  // 绿色表示可通行
      gradient.addColorStop(1, '#006400')
    } else {
      gradient.addColorStop(0, '#8B0000')  // 红色表示未占领
      gradient.addColorStop(1, '#4a0000')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(screenX + 8, screenY + 8, TILE_SIZE - 16, TILE_SIZE - 16)
    
    // 绘制箭头
    ctx.fillStyle = isConquered ? '#90EE90' : '#FF6666'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('➤', screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2)
    
    // 绘制边框
    ctx.strokeStyle = isConquered ? '#00FF00' : '#FF0000'
    ctx.lineWidth = 3
    ctx.strokeRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8)
  })
}

function drawPlayer() {
  const screenX = props.player.x * TILE_SIZE - props.camera.x
  const screenY = props.player.y * TILE_SIZE - props.camera.y
  const centerX = screenX + TILE_SIZE / 2
  const centerY = screenY + TILE_SIZE / 2
  
  ctx.fillStyle = '#1a4d16'
  ctx.beginPath()
  ctx.arc(centerX, centerY + 4, TILE_SIZE / 2 - 2, 0, Math.PI * 2)
  ctx.fill()
  
  const bodyGradient = ctx.createRadialGradient(centerX - 5, centerY - 5, 0, centerX, centerY, TILE_SIZE / 2 - 4)
  bodyGradient.addColorStop(0, '#2d8a27')
  bodyGradient.addColorStop(1, '#1a5a16')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY + 4, TILE_SIZE / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#CC0000'
  ctx.beginPath()
  ctx.moveTo(centerX - 8, screenY + 8)
  ctx.lineTo(centerX, screenY)
  ctx.lineTo(centerX + 8, screenY + 8)
  ctx.fill()
  
  ctx.fillStyle = '#FF0000'
  ctx.beginPath()
  ctx.moveTo(centerX - 6, screenY + 6)
  ctx.lineTo(centerX, screenY + 2)
  ctx.lineTo(centerX + 6, screenY + 6)
  ctx.fill()
  
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('龍', centerX, centerY + 6)
  
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(centerX, centerY, TILE_SIZE / 2 + 4, 0, Math.PI * 2)
  ctx.stroke()
  
  ctx.strokeStyle = '#CCAA00'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(centerX, centerY, TILE_SIZE / 2 + 6, 0, Math.PI * 2)
  ctx.stroke()
}

// 监听数据变化重新绘制
watch(
  () => [props.currentMap, props.player, props.camera, props.currentTerritories, props.currentEnemySpots, props.currentTaverns, props.regions, props.currentRegionIndex],
  () => {
    requestAnimationFrame(draw)
  },
  { deep: true }
)

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  draw()
  animationId = setInterval(draw, 100)
})

onUnmounted(() => {
  if (animationId) {
    clearInterval(animationId)
  }
})
</script>

<style scoped>
canvas {
  border: 4px solid #b8860b;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(184, 134, 11, 0.3);
}
</style>