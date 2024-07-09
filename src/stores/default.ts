import { FilePlatformData } from "@/services/file-writer.service";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useDefaultStore = defineStore("default", () => {
  const _testImage = ref<FilePlatformData | null>(null);
  const testImage = computed(() => _testImage.value);

  const setTestImage = (data: FilePlatformData) => {
    _testImage.value = data;
  };

  return { testImage, setTestImage };
});
