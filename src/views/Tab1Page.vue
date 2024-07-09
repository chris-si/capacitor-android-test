<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />

      <div>
        <div>
          <span> Here should be an image of an apple </span>
        </div>
        <component :is="'img'" :src="imgSrc" style="height: 100px" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import ExploreContainer from "@/components/ExploreContainer.vue";
import type { FilePlatformData } from "@/services/file-writer.service";
import { useObjectUrl } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useDefaultStore } from "@/stores/default";

const defaultStore = useDefaultStore();
const imgSrc = ref<any>(null);

async function loadImageFromFile(file: FilePlatformData) {
  if (!file) {
    console.log("No file");
    return null;
  }
  if (file.platform === "web") {
    return useObjectUrl(file.blob);
  } else {
    return ref(file.uri);
  }
}

onMounted(async () => {
  console.log("Loading test image");
  const srcData = await loadImageFromFile(defaultStore.testImage!);
  imgSrc.value = srcData?.value!;
});
</script>
