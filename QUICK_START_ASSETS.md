# 游戏素材快速开始指南

## ✅ 已完成的工作

我已经完成了以下工作来支持素材图片：

1. **创建素材加载器** - [`assetLoader.js`](file:///D:/workcode/AI-Vibe-Coding/sht-game/src/composables/assetLoader.js)
   - 预加载所有素材
   - 提供 `getAsset()` 函数获取素材
   - 加载失败时自动回退到 Canvas 绘制

2. **修改渲染系统** - [`GameCanvas.vue`](file:///D:/workcode/AI-Vibe-Coding/sht-game/src/components/GameCanvas.vue)
   - 地形、酒馆、出口、主角都支持图片绘制
   - 保留 Canvas 绘制作为后备方案
   - 使用 `imageSmoothingEnabled = false` 保持像素风格

3. **创建素材目录**
   ```
   public/
   └── assets/
       ├── tileset/      # 地形瓦片
       ├── characters/   # 角色和敌人
       └── items/        # 物品和建筑
   ```

4. **集成到 App.vue**
   - 游戏启动时自动预加载素材
   - 素材加载完成后才开始游戏

---

## 📥 如何下载和添加素材

### 方案 1：使用 Kenney 素材（推荐）

#### 步骤 1：下载素材

访问：https://www.kenney.nl/assets/pixel-shmup

点击 **Download (1.5MB)** 下载

#### 步骤 2：解压并复制文件

解压下载的 ZIP 文件，找到 `Tiles/` 目录，复制以下文件：

```
从下载的包中复制 → 到项目目录
─────────────────────────────────────────────────
grassCenter.png    → public/assets/tileset/grass.png
road.png           → public/assets/tileset/road.png
building.png       → public/assets/tileset/building.png
（可选）
dirt.png           → public/assets/tileset/forest.png
mountain.png       → public/assets/tileset/mountain.png
water.png          → public/assets/tileset/river.png
```

#### 步骤 3：运行游戏

```bash
npm run dev
```

游戏会自动加载素材图片！

---

### 方案 2：使用占位图片（快速测试）

如果你只是想快速测试，可以使用简单的占位图片：

#### 创建简单的 40x40 PNG 图片

使用任何图片编辑工具（如 Paint、Photoshop、GIMP）创建：

**grass.png** - 绿色方块
```
颜色：#2d5a27（深绿）
尺寸：40x40 像素
```

**road.png** - 土黄色方块
```
颜色：#8b5a2b（土黄）
尺寸：40x40 像素
```

**building.png** - 灰色方块
```
颜色：#5a5a5a（灰色）
尺寸：40x40 像素
```

保存到对应的目录即可。

---

### 方案 3：在线生成像素素材

使用在线工具快速生成：

1. **Piskel** - https://www.piskelapp.com/
   - 在线像素画编辑器
   - 导出为 PNG

2. **Pixel Art Maker** - https://pixelartmaker.com/
   - 简单易用的像素画工具
   - 支持导出 PNG

3. **Bfxr** - https://www.bfxr.net/
   - 生成像素风格图标

---

## 🎨 素材规格要求

### 尺寸
- **推荐**: 40x40 像素（与游戏 TILE_SIZE 匹配）
- **可接受**: 32x32 像素（会自动缩放）
- **格式**: PNG（支持透明背景）

### 风格
- **像素艺术**（Pixel Art）
- **俯视视角**（Top-down）
- **复古 RPG 风格**

### 颜色
- 有限的调色板（16-32 色）
- 避免渐变（用色块表现）
- 边缘清晰，不要模糊

---

## 📋 需要的素材清单

### 必需素材（最少）

| 文件名 | 描述 | 尺寸 | 优先级 |
|--------|------|------|--------|
| `grass.png` | 草地瓦片 | 40x40 | ⭐⭐⭐ |
| `road.png` | 道路瓦片 | 40x40 | ⭐⭐⭐ |
| `building.png` | 建筑瓦片 | 40x40 | ⭐⭐⭐ |

### 推荐素材（更好效果）

| 文件名 | 描述 | 尺寸 | 优先级 |
|--------|------|------|--------|
| `forest.png` | 森林瓦片 | 40x40 | ⭐⭐ |
| `mountain.png` | 山地瓦片 | 40x40 | ⭐⭐ |
| `river.png` | 河流瓦片 | 40x40 | ⭐⭐ |
| `bridge.png` | 桥梁瓦片 | 40x40 | ⭐ |
| `stronghold.png` | 据点瓦片 | 40x40 | ⭐ |
| `player.png` | 主角精灵 | 40x40 | ⭐⭐ |
| `tavern.png` | 酒馆图标 | 40x40 | ⭐⭐ |

### 可选素材（完美效果）

| 文件名 | 描述 | 尺寸 |
|--------|------|------|
| `enemy_lv1.png` | Lv.1 敌人 | 40x40 |
| `enemy_lv2.png` | Lv.2 敌人 | 40x40 |
| `enemy_lv3.png` | Lv.3 敌人 | 40x40 |
| `boss.png` | BOSS 精灵 | 40x40 |
| `exit_green.png` | 绿色出口标记 | 40x40 |
| `exit_red.png` | 红色出口标记 | 40x40 |

---

## 🔧 测试素材加载

### 检查素材是否加载成功

打开浏览器控制台（F12），你会看到：

```
🎨 开始加载游戏素材...
✅ 加载成功：grass
✅ 加载成功：road
✅ 加载成功：building
⚠️ 素材加载失败：forest，将使用 Canvas 绘制
🎨 素材加载完成
```

### 查看已加载的素材

在浏览器控制台输入：

```javascript
import { getLoadedAssets } from './composables/assetLoader'
console.log(getLoadedAssets())
```

会显示所有成功加载的素材键名。

---

## ⚠️ 常见问题

### Q: 素材不显示？

**A**: 检查以下几点：
1. 文件路径是否正确（区分大小写）
2. 文件名是否匹配
3. 图片格式是否为 PNG
4. 浏览器控制台是否有错误信息

### Q: 素材显示模糊？

**A**: 
1. 确保图片尺寸是 40x40 像素
2. 或使用整数倍缩放（如 20x20, 80x80）
3. 代码已设置 `imageSmoothingEnabled = false`

### Q: 加载失败怎么办？

**A**: 
- 游戏会自动回退到 Canvas 绘制
- 检查控制台错误信息
- 确认图片文件存在且格式正确

### Q: 可以混合使用素材和 Canvas 吗？

**A**: 可以！这正是设计的目的：
- 有素材的用素材
- 没素材的自动用 Canvas
- 可以逐步替换

---

## 🎯 下一步建议

### 阶段 1：基础测试（现在）
1. 下载 Kenney 素材包
2. 复制 grass.png, road.png, building.png
3. 运行游戏测试

### 阶段 2：完善地形（之后）
1. 添加 forest.png, mountain.png
2. 测试新地形效果
3. 调整颜色和风格

### 阶段 3：角色和物品（可选）
1. 添加 player.png
2. 添加 tavern.png
3. 添加敌人和 BOSS 图片

---

## 📞 需要帮助？

如果遇到任何问题：
1. 查看浏览器控制台错误信息
2. 检查文件路径和文件名
3. 确认图片格式和尺寸
4. 参考 [`ASSETS_GUIDE.md`](file:///D:/workcode/AI-Vibe-Coding/sht-game/ASSETS_GUIDE.md) 详细指南

祝游戏开发顺利！🎮
