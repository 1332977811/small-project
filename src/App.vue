<template>
  <div class="game-container">
    <GameCanvas
      :currentMap="currentMap"
      :currentTerritories="currentTerritories"
      :currentEnemySpots="currentEnemySpots"
      :currentTaverns="currentTaverns"
      :regions="regions"
      :player="player"
      :camera="camera"
      :currentRegionIndex="currentRegionIndex"
      :TILE_SIZE="TILE_SIZE"
      :CANVAS_WIDTH="CANVAS_WIDTH"
      :CANVAS_HEIGHT="CANVAS_HEIGHT"
      :TERRAIN="TERRAIN"
    />
    
    <UIPanel
      :stats="stats"
      :player="player"
      :totalRegions="totalRegions"
      @save="saveGame"
      @load="loadGame"
      @openEquipment="openEquipment"
    />
    
    <EquipmentModal
      :visible="showEquipment"
      :playerStats="stats"
      :equipment="player.equipment"
      @close="closeEquipment"
      @buy="buyEquip"
      @equip="equipItem"
    />
    
    <RandomEventModal
      :visible="showRandomEvent"
      :event="currentEvent"
      @close="closeRandomEvent"
      @choose="handleEventChoice"
    />
    
    <BattleModal
      :visible="isBattling"
      :player="player"
      :enemy="currentEnemy"
      :battleResult="battleResult"
      :isBossBattle="isBossBattle"
      :bossRegion="currentBossRegion"
      :isFollowerAttacking="isFollowerAttacking"
      :attackingFollowerIndex="attackingFollowerIndex"
      :damageNumbers="damageNumbers"
      :showSkills="true"
      :skillsConfig="SKILLS_CONFIG"
      :playerSkills="player.skills"
      @attack="attack"
      @flee="flee"
      @useSkill="useSkill"
    />
    
    <ShopModal
      :visible="isRecruiting"
      :stats="stats"
      :player="player"
      @buy="buyItem"
      @close="closeShop"
    />
    
    <EndingModal
      :visible="showEnding"
      :isWin="endingWin"
      @restart="restartGame"
    />
    
    <AlertModal
      :visible="showAlert"
      :message="alertMessage"
      @close="closeAlert"
    />
  </div>
</template>

<script setup>
import GameCanvas from './components/GameCanvas.vue'
import UIPanel from './components/UIPanel.vue'
import BattleModal from './components/BattleModal.vue'
import ShopModal from './components/ShopModal.vue'
import EndingModal from './components/EndingModal.vue'
import EquipmentModal from './components/EquipmentModal.vue'
import RandomEventModal from './components/RandomEventModal.vue'
import { useGame } from './composables/useGame'

const {
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
  showEnding,
  endingWin,
  alertMessage,
  showAlert,
  conqueredCount,
  totalRegions,
  isFollowerAttacking,
  attackingFollowerIndex,
  damageNumbers,
  showEquipment,
  showRandomEvent,
  currentEvent,
  SKILLS_CONFIG,
  attack,
  flee,
  useSkill,
  buyItem,
  closeShop,
  openEquipment,
  closeEquipment,
  buyEquip,
  equipItem,
  handleEventChoice,
  closeRandomEvent,
  restartGame,
  saveGame,
  loadGame,
  closeAlert,
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TERRAIN
} = useGame()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'STKaiti', 'Kaiti SC', 'SimKai', serif;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-container {
  position: relative;
  display: flex;
  gap: 20px;
}
</style>