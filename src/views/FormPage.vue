```vue
<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-cyan-100 p-4 animate-fade-in">
    <h1 class="text-3xl font-bold mb-8 text-pink-600 font-cute">🍼 猜猜寶寶性別！ 💖</h1>
    <div class="flex flex-col space-y-4 w-full max-w-md bg-white p-6 rounded-xl shadow-md">
      <select v-model="name"
        placeholder="你的名字 ✨"
        class="p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50 text-gray-700 font-cute"
        required>
        <option disabled value="">請選擇...</option>
        <option v-for="name in nameOptions" :key="name" :value="name">
          {{ name }}
        </option>

      </select>
        
      
      <select
        v-model="gender"
        class="p-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50 text-gray-700 font-cute"
        required
      >
        <option disabled value="">請選擇...</option>
        <option value="boy">男 👶</option>
        <option value="girl">女 👧</option>
      </select>
      <textarea
        v-model="reason"
        placeholder="為什麼這樣猜呢？💭"
        class="p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 text-gray-700 font-cute resize-none h-24"
        required
      ></textarea>
      <!-- <input
        type="file"
        @change="handleFileUpload"
        accept="image/*"
        class="p-3 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pink-400 file:text-white file:font-cute text-gray-700"
      /> -->
      <button
        @click="submitGuess"
        class="px-6 py-3 bg-gradient-to-r from-pink-400 to-cyan-400 text-white rounded-lg font-cute text-lg hover:bg-gradient-to-l hover:from-cyan-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
        :disabled="!name || !gender || isSubmitting"
      >
        {{ isSubmitting ? '提交中...' : '送出猜測！🎉' }}
      </button>
      <transition name="fade">
        <div
          v-if="showSuccess"
          class="mt-4 p-4 bg-green-100 text-green-700 rounded-lg font-cute text-center"
        >
          感謝你的猜測！🎊
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { namePhotoMap } from '../data/namePhotoMap';

export default {
  name: 'FormPage',
  setup() {
    const route = useRoute();
    const name = ref('');
    const gender = ref('');
    const reason = ref('');
    const avatar = ref(null);
    const isSubmitting = ref(false);
    const showSuccess = ref(false);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          avatar.value = e.target.result;
        };
        reader.onerror = (e) => {
          console.error('圖片讀取失敗:', e);
          alert('圖片上傳失敗，請重試');
        };
        reader.readAsDataURL(file);
      }
    };

    const submitGuess = async () => {
      if (!name.value || !gender.value) {
        alert('請填寫名字和性別');
        return;
      }

      isSubmitting.value = true;
      try {
        const partyId = route.query.party;
        if (!partyId) {
          throw new Error('缺少 partyId');
        }
        await addDoc(collection(db, `parties/${partyId}/guesses`), {
          name: name.value,
          gender: gender.value,
          reason: reason.value || '',
          avatar: namePhotoMap[name.value] || 'https://via.placeholder.com/64',
          timestamp: Date.now(),
        });
        // 清空表單
        name.value = '';
        gender.value = 'boy';
        reason.value = '';
        avatar.value = null;
        // 顯示成功訊息
        showSuccess.value = true;
        setTimeout(() => {
          showSuccess.value = false;
        }, 3000);
      } catch (error) {
        console.error('提交失敗:', error);
        alert(`提交失敗: ${error.message}`);
      } finally {
        isSubmitting.value = false;
      }
    };
    const nameOptions = Object.keys(namePhotoMap);
    return { name, gender, reason, handleFileUpload, submitGuess, isSubmitting, showSuccess, nameOptions };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```