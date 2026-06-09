// src/composables/assetLoader.js
// 游戏素材加载器 - 支持图片加载和 Canvas 绘制后备

const imageCache = new Map()

// 素材配置列表
const ASSET_LIST = [
  // 地形瓦片
  { key: 'grass', src: '/assets/tileset/grass.png' },
  { key: 'road', src: '/assets/tileset/road.png' },
  { key: 'building', src: '/assets/tileset/building.png' },
  { key: 'forest', src: '/assets/tileset/forest.png' },
  { key: 'mountain', src: '/assets/tileset/mountain.png' },
  { key: 'river', src: '/assets/tileset/river.png' },
  { key: 'bridge', src: '/assets/tileset/bridge.png' },
  { key: 'stronghold', src: '/assets/tileset/stronghold.png' },
  
  // 角色和敌人
  { key: 'player', src: '/assets/characters/player.png' },
  { key: 'enemy_lv1', src: '/assets/characters/enemy_lv1.png' },
  { key: 'enemy_lv2', src: '/assets/characters/enemy_lv2.png' },
  { key: 'enemy_lv3', src: '/assets/characters/enemy_lv3.png' },
  { key: 'boss', src: '/assets/characters/boss.png' },
  
  // 物品和建筑
  { key: 'tavern', src: '/assets/items/tavern.png' },
  { key: 'exit_green', src: '/assets/items/exit_green.png' },
  { key: 'exit_red', src: '/assets/items/exit_red.png' },
]

/**
 * 预加载所有素材
 * @returns {Promise<void>}
 */
export async function preloadAssets() {
  console.log('🎨 开始加载游戏素材...')
  
  const promises = ASSET_LIST.map(asset => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = asset.src
      
      img.onload = () => {
        imageCache.set(asset.key, img)
        console.log(`✅ 加载成功：${asset.key}`)
        resolve(img)
      }
      
      img.onerror = () => {
        console.warn(`⚠️ 素材加载失败：${asset.key}，将使用 Canvas 绘制`)
        resolve(null) // 加载失败时返回 null，使用 Canvas 绘制
      }
    })
  })
  
  await Promise.all(promises)
  console.log('🎨 素材加载完成')
}

/**
 * 获取素材图片
 * @param {string} key - 素材键名
 * @returns {HTMLImageElement|null}
 */
export function getAsset(key) {
  return imageCache.get(key) || null
}

/**
 * 检查素材是否已加载
 * @param {string} key - 素材键名
 * @returns {boolean}
 */
export function isAssetLoaded(key) {
  return imageCache.has(key)
}

/**
 * 获取所有已加载的素材键名
 * @returns {string[]}
 */
export function getLoadedAssets() {
  return Array.from(imageCache.keys())
}

/**
 * 清除素材缓存（用于释放内存）
 */
export function clearAssetCache() {
  imageCache.clear()
}
