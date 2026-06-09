# 游戏素材资源指南

## 📁 素材目录结构

在 `public/` 目录下创建以下结构：

```
public/
└── assets/
    ├── tileset/
    │   ├── grass.png          # 草地瓦片 (32x32 或 40x40)
    │   ├── road.png           # 道路瓦片
    │   ├── building.png       # 建筑瓦片
    │   ├── forest.png         # 森林瓦片
    │   ├── mountain.png       # 山地瓦片
    │   ├── river.png          # 河流瓦片
    │   ├── bridge.png         # 桥梁瓦片
    │   └── stronghold.png     # 据点瓦片
    ├── characters/
    │   ├── player.png         # 主角精灵
    │   ├── enemy_lv1.png      # Lv.1 敌人
    │   ├── enemy_lv2.png      # Lv.2 敌人
    │   ├── enemy_lv3.png      # Lv.3 敌人
    │   └── boss.png           # BOSS 精灵
    ├── items/
    │   ├── tavern.png         # 酒馆图标
    │   └── exit_marker.png    # 出口标记
    └── effects/
        ├── damage_number.png  # 伤害数字（可选）
        └── attack_effect.png  # 攻击特效（可选）
```

---

## 🎨 推荐素材包（免费，CC0 许可）

### 方案 1：Kenney Assets（最推荐）

**来源**: https://www.kenney.nl/

**推荐素材包**:

1. **Pixel Shmup** - 包含地形瓦片
   - https://www.kenney.nl/assets/pixel-shmup
   - 包含：草地、道路、建筑等
   - 尺寸：32x32 像素
   - 许可：CC0（完全免费）

2. **RPG Urban Pack**
   - https://www.kenney.nl/assets/rpg-urban-pack
   - 包含：城市建筑、道路
   - 尺寸：32x32 像素
   - 许可：CC0

3. **Isometric Tiles**
   - https://www.kenney.nl/assets/isometric-tiles
   - 包含：各种地形
   - 许可：CC0

**下载方法**:
```bash
# 1. 访问上述链接
# 2. 点击 "Download" 按钮
# 3. 解压后将 PNG 文件复制到对应的目录
```

---

### 方案 2：itch.io 免费素材

**推荐作者**:

1. **0x72**
   - https://0x72.itch.io/
   - 推荐：16x16 Fantasy Tileset
   - 风格：复古像素

2. **ansimuz**
   - https://ansimuz.itch.io/
   - 推荐：Dungeon & Castle Tileset
   - 风格：高质量像素

3. **LimeZu**
   - https://limezu.itch.io/
   - 推荐：Modern Interiors
   - 风格：现代像素

**热门素材包**:

1. **16x16 Fantasy Tileset**
   - https://limezu.itch.io/moderninteriors
   - 包含：完整地形、建筑
   - 尺寸：16x16 像素
   - 许可：免费（需署名）

2. **Pixel Art Top Down Dungeon**
   - https://opengameart.org/content/pixel-art-top-down-dungeon-tileset-and-rpg-character-with-animations
   - 包含：地牢、角色
   - 许可：CC0

---

### 方案 3：OpenGameArt

**推荐素材**:

1. **Liberated Pixel Cup (LPC)**
   - https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
   - 包含：完整 RPG 素材包
   - 尺寸：32x32 像素
   - 许可：CC-BY-SA 3.0

2. **Hyptosis 的素材包**
   - https://opengameart.org/content/lots-of-free-2d-tiles-and-sprites-by-hyptosis
   - 包含：多种地形
   - 许可：CC-BY 3.0

3. **16x16 Puny Dungeon**
   - https://opengameart.org/content/16x16-puny-dungeon-tileset
   - 包含：地牢、陷阱
   - 许可：CC0

---

## 🔧 代码集成方法

### 步骤 1：创建素材加载器

在 `src/composables/` 下创建 `assetLoader.js`：

```javascript
// src/composables/assetLoader.js

const assets = {
  tileset: {},
  characters: {},
  items: {},
  effects: {}
}

const imageCache = new Map()

// 预加载所有素材
export function preloadAssets() {
  const assetList = [
    // 地形瓦片
    { key: 'grass', src: '/assets/tileset/grass.png', type: 'tileset' },
    { key: 'road', src: '/assets/tileset/road.png', type: 'tileset' },
    { key: 'building', src: '/assets/tileset/building.png', type: 'tileset' },
    { key: 'forest', src: '/assets/tileset/forest.png', type: 'tileset' },
    { key: 'mountain', src: '/assets/tileset/mountain.png', type: 'tileset' },
    
    // 角色
    { key: 'player', src: '/assets/characters/player.png', type: 'characters' },
    { key: 'enemy_lv1', src: '/assets/characters/enemy_lv1.png', type: 'characters' },
    { key: 'enemy_lv2', src: '/assets/characters/enemy_lv2.png', type: 'characters' },
    { key: 'enemy_lv3', src: '/assets/characters/enemy_lv3.png', type: 'characters' },
    { key: 'boss', src: '/assets/characters/boss.png', type: 'characters' },
    
    // 物品
    { key: 'tavern', src: '/assets/items/tavern.png', type: 'items' },
  ]
  
  const promises = assetList.map(asset => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = asset.src
      img.onload = () => {
        assets[asset.type][asset.key] = img
        imageCache.set(asset.key, img)
        resolve(img)
      }
      img.onerror = () => {
        console.warn(`Failed to load asset: ${asset.key} (${asset.src})`)
        resolve(null) // 加载失败时返回 null，使用 Canvas 绘制
      }
    })
  })
  
  return Promise.all(promises)
}

// 获取素材
export function getAsset(key) {
  return imageCache.get(key) || null
}

// 检查素材是否加载完成
export function isAssetLoaded(key) {
  return imageCache.has(key)
}
```

---

### 步骤 2：修改 GameCanvas.vue 使用素材

修改 `src/components/GameCanvas.vue` 的绘制函数：

```javascript
import { getAsset, isAssetLoaded } from '../composables/assetLoader'

// 修改 drawMap 函数
function drawMap(ctx, map, territories) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const tile = map[y][x]
      const pixelX = x * TILE_SIZE - camera.x
      const pixelY = y * TILE_SIZE - camera.y
      
      // 只绘制可见区域
      if (pixelX + TILE_SIZE < 0 || pixelX > CANVAS_WIDTH ||
          pixelY + TILE_SIZE < 0 || pixelY > CANVAS_HEIGHT) {
        continue
      }
      
      // 尝试使用素材图片
      let tileImage = null
      switch (tile) {
        case TERRAIN.GRASS:
          tileImage = getAsset('grass')
          break
        case TERRAIN.ROAD:
          tileImage = getAsset('road')
          break
        case TERRAIN.BUILDING:
          tileImage = getAsset('building')
          break
        case TERRAIN.FOREST:
          tileImage = getAsset('forest')
          break
        case TERRAIN.MOUNTAIN:
          tileImage = getAsset('mountain')
          break
      }
      
      if (tileImage) {
        // 使用素材图片
        ctx.drawImage(tileImage, pixelX, pixelY, TILE_SIZE, TILE_SIZE)
      } else {
        // 回退到 Canvas 绘制
        drawTileFallback(ctx, tile, pixelX, pixelY)
      }
      
      // 绘制已占领标记
      if (territories[y][x]) {
        drawTerritoryMarker(ctx, pixelX, pixelY)
      }
    }
  }
}

// Canvas 绘制后备方案
function drawTileFallback(ctx, tile, x, y) {
  switch (tile) {
    case TERRAIN.GRASS:
      drawGrass(ctx, x, y)
      break
    case TERRAIN.ROAD:
      drawRoad(ctx, x, y)
      break
    case TERRAIN.BUILDING:
      drawBuilding(ctx, x, y)
      break
    // ... 其他地形
  }
}

// 绘制主角（使用素材）
function drawPlayer(ctx, x, y) {
  const playerImage = getAsset('player')
  
  if (playerImage) {
    ctx.drawImage(
      playerImage,
      x * TILE_SIZE - camera.x,
      y * TILE_SIZE - camera.y,
      TILE_SIZE,
      TILE_SIZE
    )
  } else {
    // 回退到 Canvas 绘制
    drawPlayerFallback(ctx, x, y)
  }
}
```

---

### 步骤 3：在 App.vue 中预加载素材

修改 `src/App.vue`：

```javascript
import { onMounted } from 'vue'
import { preloadAssets } from './composables/assetLoader'
import { useGame } from './composables/useGame'

const { initGame, ...rest } = useGame()

onMounted(async () => {
  // 预加载素材
  await preloadAssets()
  
  // 初始化游戏
  initGame()
})
```

---

## 🎯 快速开始（使用 Kenney 素材）

### 1. 下载素材

访问：https://www.kenney.nl/assets/pixel-shmup

点击 **Download** 下载（约 2MB）

### 2. 解压并复制文件

解压后，将以下文件复制到项目：

```bash
# 从下载的包中复制
Pixel Shmup/Tiles/
├── grassCenter.png      → public/assets/tileset/grass.png
├── road.png             → public/assets/tileset/road.png
├── building.png         → public/assets/tileset/building.png
└── ... (其他需要的文件)
```

### 3. 运行项目

```bash
npm run dev
```

游戏会自动加载素材图片，如果加载失败则使用 Canvas 绘制作为后备。

---

## 📊 素材尺寸建议

### 推荐尺寸
- **瓦片**: 32x32 或 40x40 像素（与游戏 TILE_SIZE 匹配）
- **角色**: 32x32 或 40x40 像素
- **物品图标**: 32x32 像素

### 如果素材尺寸不匹配
- 可以缩放（但可能失真）
- 或修改游戏的 `TILE_SIZE` 常量

---

## ⚠️ 注意事项

### 许可协议
- **CC0**: 完全免费，无需署名，可商用
- **CC-BY**: 免费，但需要署名
- **CC-BY-SA**: 免费，需要署名，衍生作品使用相同许可

### 性能优化
1. **预加载**: 游戏启动时一次性加载所有素材
2. **缓存**: 使用 Map 缓存已加载的图片
3. **后备方案**: 加载失败时使用 Canvas 绘制
4. **按需加载**: 大型素材包可以按需加载

### 文件大小
- 单个瓦片图片：< 5KB
- 完整素材包：< 5MB
- 总加载时间：< 2 秒（本地）

---

## 🎨 自定义素材

如果你想自己绘制素材：

### 工具推荐
1. **Aseprite** - 专业像素画工具（付费）
2. **Piskel** - 免费在线像素画工具
3. **GraphicsGale** - 免费像素画工具
4. **Photoshop** - 通用图像编辑

### 绘制建议
- 保持风格统一（颜色、线条粗细）
- 使用有限的调色板（16-32 色）
- 注意瓦片接缝（确保无缝拼接）
- 导出为 PNG 格式（无损压缩）

---

## 📞 问题排查

### 素材不显示？
1. 检查文件路径是否正确
2. 检查文件名是否匹配（区分大小写）
3. 查看浏览器控制台是否有加载错误
4. 确认图片格式为 PNG

### 素材显示模糊？
1. 确保图片尺寸与 TILE_SIZE 匹配
2. 在 Canvas 设置 `imageSmoothingEnabled = false`
3. 使用整数倍缩放（如 32x32 → 40x40 会模糊）

### 性能问题？
1. 减少同时加载的素材数量
2. 使用更小的图片尺寸
3. 压缩 PNG 文件（使用 TinyPNG 等工具）

---

祝你游戏开发顺利！🎮
