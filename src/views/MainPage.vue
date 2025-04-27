```vue
<template>
  <div class="relative flex h-screen overflow-hidden">
    <div class="w-1/2 p-5 bg-cyan-100">
      <h2 class="text-5xl font-bold text-center pt-4">男寶寶 👶</h2>
      <GenderAvatar
        v-for="guess in boyGuesses"
        :key="guess.id"
        :guess="guess"
        :is-revealed="isRevealed"
        @hover="handleHover"
        @leave="handleLeave"
      />
    </div>
    <div class="w-1/2 p-5 bg-pink-100">
      <h2 class="text-5xl font-bold text-center pt-4">女寶寶 👧</h2>
      <GenderAvatar
        v-for="guess in girlGuesses"
        :key="guess.id"
        :guess="guess"
        :is-revealed="isRevealed"
        @hover="handleHover"
        @leave="handleLeave"
      />
    </div>
    <button
      v-if="!isRevealed"
      class="absolute top-7/8 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 text-3xl bg-gradient-to-r from-pink-400 to-blue-300 border-none rounded-full text-white cursor-pointer shadow-md transition-transform duration-200 ease hover:-translate-y-[50%] hover:shadow-lg"
      @click="revealResults"
    >
      <span class="text-2xl mx-1">💖</span> 揭曉猜測結果 <span class="text-2xl mx-1">💖</span>
    </button>

    <transition name="fade">
      <div
        v-if="hoveredGuess && isRevealed"
        class="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-5xl w-full flex items-center space-x-4"
        :class="{ 'flex-row': hoveredGuess.gender === 'boy', 'flex-row-reverse space-x-reverse': hoveredGuess.gender === 'girl' }"
        @mouseenter="handleBubbleEnter"
        @mouseleave="handleBubbleLeave"
      >
        <!-- 頭像 -->
        <div class="flex-shrink-0">
          <img
            v-if="hoveredGuess.avatar"
            :src="hoveredGuess.avatar"
            class="w-40 h-40 rounded-full"
          />
          <div
            v-else
            class="w-40 h-40 aspect-square rounded-full bg-gray-400 flex items-center justify-center text-2xl text-white border-2 border-white"
          >
            {{ hoveredGuess.name }}
          </div>
        </div>
        <!-- 對話氣泡 -->
        <div
          class="relative bg-white rounded-2xl p-4 border-2 shadow-lg max-w speech-bubble w-200 text-center"
          :class="{
            'speech-bubble-boy border-blue-300': hoveredGuess.gender === 'boy',
            'speech-bubble-girl border-pink-300': hoveredGuess.gender === 'girl',
          }"
        >
          <p class="text-4xl font-bold text-gray-800 ">
            {{ hoveredGuess.name }}
          </p>
          <p class="text-3xl text-gray-600 mt-4">
            猜測原因：{{ hoveredGuess.reason }}
          </p>
        </div>
      </div>
    </transition>
    <div v-if="!isRevealed" class="fixed bottom-5 right-5">
      <div class="text-center pt-2 text-3xl">掃描猜測性別</div>
      <qrcode-vue :value="formUrl" :size="200" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import QrcodeVue from 'qrcode.vue';
import { v4 as uuidv4 } from 'uuid';
import GenderAvatar from '../components/GenderAvatar.vue';

export default {
  name: 'MainPage',
  components: { QrcodeVue, GenderAvatar },
  setup() {
    const route = useRoute();

    // 檢查 localStorage 中的 partyId
    const getStoredPartyId = () => {
      const stored = localStorage.getItem('partyData');
      if (stored) {
        const { partyId, createdAt } = JSON.parse(stored);
        const now = Date.now();
        const twoDays = 2 * 24 * 60 * 60 * 1000; // 2 天
        if (now - createdAt < twoDays) {
          return partyId;
        }
      }
      return null;
    };

    // 保存 partyId 到 localStorage
    const savePartyId = (id) => {
      const partyData = {
        partyId: id,
        createdAt: Date.now(),
      };
      localStorage.setItem('partyData', JSON.stringify(partyData));
    };

    // 優先使用 URL 的 partyId，否則檢查 localStorage 或生成新 UUID
    const partyId = ref(route.query.party || getStoredPartyId() || uuidv4());
    if (!getStoredPartyId() || route.query.party) {
      savePartyId(partyId.value);
    }

    const formUrl = computed(() => {
         const isDev = process.env.NODE_ENV === 'development';
         const baseUrl = isDev
           ? `http://${window.location.hostname}:5173/gender-reveal`
           : 'https://chengjietsai.github.io/gender-reveal';
         return `${baseUrl}/#/form?party=${partyId.value}`;
       });

    const guesses = ref([]);
    const isRevealed = ref(false);

    // 隨機初始位置，根據性別調整 x 範圍
    const getRandomPosition = () => {
      const maxX = window.innerWidth * 0.9 - 80;
      const x = Math.max(80, Math.min(maxX, Math.random() * maxX));
      const maxY = window.innerHeight * 0.9 - 80; // 畫面高度 - 頭像高度
      const y = Math.max(100, Math.min(maxY, Math.random() * maxY));
     
       
      
      return { x, y };
    };

    // 隨機移動動畫
    const driftIntervals = new Map();
    const startDrift = (guess) => {
      if (driftIntervals.has(guess.id)) {
        clearInterval(driftIntervals.get(guess.id));
        driftIntervals.delete(guess.id);
      }
      console.log(`Starting drift for guess: ${guess.id}`);
      const interval = setInterval(() => {
        if (!isRevealed.value) {
          const { x, y } = getRandomPosition(guess.gender);
          guess.style.top = `${y}px`;
          guess.style.left = `${x}px`;
          // console.log(`Moved ${guess.id} to x:${x}, y:${y}`);
        } else {
          clearInterval(interval);
          driftIntervals.delete(guess.id);
        }
      }, 2000 + Math.random()*2000);
      driftIntervals.set(guess.id, interval);
    };

    const stopDrift = () => {
      console.log('Stopping all drifts');
      driftIntervals.forEach((interval, id) => {
        clearInterval(interval);
        driftIntervals.delete(id);
      });
    };

    // 揭曉時整齊排列（每行 4 個）
    const revealResults = () => {
      isRevealed.value = true;
      stopDrift();
      const avatarSize = 80; // 頭像尺寸

      const boyGuesses = guesses.value.filter(g => g.gender === 'boy');
      const girlGuesses = guesses.value.filter(g => g.gender === 'girl');

      
      guesses.value.forEach((guess) => {
        const side = guess.gender === 'boy' ? '.bg-cyan-100' : '.bg-pink-100';
        const container = document.querySelector(side);
        if (!container) {
          console.error(`Container not found for ${side}`);
          return;
        }
        const rect = container.getBoundingClientRect();
        const index = guess.gender === 'boy'
          ? boyGuesses.findIndex(g => g.id === guess.id)
          : girlGuesses.findIndex(g => g.id === guess.id);

        let useFour = true;
        let row = 1;
        let i = 0
        while (i <= index) {
          const count = useFour ? 4 : 3
          if (index < i + count) break
          i += count
          useFour = !useFour
          row++
        }
        const countInRow = useFour ? 4 : 3
        const indexInRow = index - i

        const gapX = avatarSize * (countInRow === 4 ? 1.75:2)
        const left = gapX * (countInRow === 4 ? 0.5:1) + indexInRow * (avatarSize + gapX)-20
        const top = row * avatarSize*3 -30
        guess.style.left = `${left + rect.x}px`;
        guess.style.top = `${top + rect.y}px`;
      });
    };

    // 即時監聽 Firestore 資料
    onMounted(() => {
      console.log('Mounted, listening to Firestore');
      const guessesRef = collection(db, `parties/${partyId.value}/guesses`);
      onSnapshot(guessesRef, (snapshot) => {
        const newGuesses = [];
        snapshot.docs.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          const existing = guesses.value.find(g => g.id === data.id);
          const style = reactive({
            position: 'absolute',
            top: existing ? existing.style.top : `${getRandomPosition(data.gender).y}px`,
            left: existing ? existing.style.left : `${getRandomPosition(data.gender).x}px`,
            transition: 'all 5s ease-in-out ',
          });
          newGuesses.push({ ...data, style });
          if (!isRevealed.value) {
            startDrift(newGuesses[newGuesses.length - 1]);
          }
        });
        guesses.value = newGuesses;
        console.log('Guesses updated:', guesses.value.length, 'items');
        if (!isRevealed.value) {
          guesses.value.forEach(guess => {
            if (!driftIntervals.has(guess.id)) {
              startDrift(guess);
            }
          });
        }
      }, (error) => {
        console.error('Firestore 監聽失敗:', error);
      });
    });

    // 清除定時器
    onUnmounted(() => {
      console.log('Unmounted, stopping drifts');
      stopDrift();
    });

    // 分類猜測
    const boyGuesses = computed(() => guesses.value.filter((g) => g.gender === 'boy'));
    const girlGuesses = computed(() => guesses.value.filter((g) => g.gender === 'girl'));

    const hoveredGuess = ref(null);
    let isMouseInBubble = false;
    let leaveTimeout = null;
    const handleHover = (guess) => {
      clearTimeout(leaveTimeout);
      hoveredGuess.value = guess;
    };

    const handleLeave = () => {
      if (isMouseInBubble) return;
      leaveTimeout = setTimeout(() => {
        if (!isMouseInBubble) {
          hoveredGuess.value = null;
        }
      }, 100);
    };

    // 處理對話氣泡滑鼠事件
    const handleBubbleEnter = () => {
      isMouseInBubble = true;
      clearTimeout(leaveTimeout);
    };

    const handleBubbleLeave = () => {
      isMouseInBubble = false;
      leaveTimeout = setTimeout(() => {
        if (!isMouseInBubble) {
          hoveredGuess.value = null;
        }
      }, 100);
    };

    return { boyGuesses, girlGuesses, formUrl, revealResults, isRevealed, hoveredGuess,handleHover,handleLeave,handleBubbleEnter,
      handleBubbleLeave};
  },
};
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* 男生：左側 < 三角形 */
.speech-bubble-boy::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-right: 10px solid white;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  filter: drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.1));
}
/* 女生：右側 > 三角形 */
.speech-bubble-girl::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 10px solid white;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  filter: drop-shadow(2px 0 2px rgba(0, 0, 0, 0.1));
}

</style>