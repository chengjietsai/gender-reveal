```vue
<template>
  <div class="relative flex h-screen overflow-hidden">
    <div class="w-1/2 p-5 bg-cyan-100">
      <h2 class="text-4xl font-bold text-center pt-4 font-zcool">男生</h2>
      <GenderAvatar
        v-for="guess in boyGuesses"
        :key="guess.id"
        :guess="guess"
        :is-revealed="isRevealed"
      />
    </div>
    <div class="w-1/2 p-5 bg-pink-100">
      <h2 class="text-4xl font-bold text-center pt-4 font-zcool">女生</h2>
      <GenderAvatar
        v-for="guess in girlGuesses"
        :key="guess.id"
        :guess="guess"
        :is-revealed="isRevealed"
      />
    </div>
    <button
      v-if="!isRevealed"
      class="absolute top-7/8 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 text-lg bg-gradient-to-r from-pink-400 to-blue-300 border-none rounded-full text-white cursor-pointer shadow-md transition-transform duration-200 ease hover:-translate-y-[54%] hover:shadow-lg"
      @click="revealResults"
    >
      <span class="text-xl mx-1">💖</span> 揭曉猜測結果 <span class="text-xl mx-1">💖</span>
    </button>
    <div class="fixed bottom-5 right-5">
      <div class="text-center pt-1 font-zcool">猜測性別</div>
      <qrcode-vue :value="formUrl" :size="100" />
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
      const perRow = 4; // 每行 4 個頭像
      const avatarSize = 80; // 頭像尺寸
      const spacing = 10; // 間距

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

        const row = Math.floor(index / perRow);
        const col = index % perRow;
        const x = col * (avatarSize + spacing) + 10; // 左邊距
        const y = row * (avatarSize + spacing) + 100; // 頂部考慮標題

        guess.style.top = `${y + rect.top}px`;
        guess.style.left = `${x + rect.left}px`;
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
            transition: 'all 3s ease-in-out',
          });
          newGuesses.push({ ...data, style });
          if (!existing && !isRevealed.value) {
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

    return { boyGuesses, girlGuesses, formUrl, revealResults, isRevealed };
  },
};
</script>
```