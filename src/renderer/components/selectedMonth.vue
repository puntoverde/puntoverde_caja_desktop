<template>
  <v-card elevation=0 :disabled="disabled">
    <v-toolbar color="secondary">
      <div class="d-flex justify-space-between align-center py-5 w-100">
        <v-btn @click="lastYear" icon="mdi-chevron-left"></v-btn>
        <span class="text-h6">{{ annio_selected }}</span>
        <v-btn @click="nextYear" icon="mdi-chevron-right"></v-btn>
      </div>
    </v-toolbar>
    <v-card-text class="mb-3">
      <v-item-group
        v-model="periodos_selected"
        multiple
        selected-class="primary"
      >
        <v-window v-model="annio_selected">
          <v-window-item
            class="body-grid-month"
            v-for="annio in annios"
            :key="annio"
            :value="annio"
          >
            <v-item
              v-slot="{ isSelected, selectedClass, toggle }"
              v-for="mes in meses"
              :key="mes.value"
              :value="`${mes.value}-${annio}`"
            >
              <v-card
                @click="toggle"                
                class="text-h6 text-center py-1"
                :color="isSelected?'primary':'blue-grey-lighten-5'"
              >
                {{ mes.text }}
              </v-card>
            </v-item>
          </v-window-item>
        </v-window>
      </v-item-group>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import dayjs from "dayjs";

const emit = defineEmits(["emit-add-periodo"]);
const props=defineProps<{disabled:boolean}>()

const annio_selected = ref<number>(dayjs().year());

const annios = ref<number[]>([annio_selected.value]);

const meses: { text: string; value: string }[] = [
  { text: "Ene", value: "01" },
  { text: "Feb", value: "02" },
  { text: "Mar", value: "03" },
  { text: "Abr", value: "04" },
  { text: "May", value: "05" },
  { text: "Jun", value: "06" },
  { text: "Jul", value: "07" },
  { text: "Ago", value: "08" },
  { text: "Sep", value: "09" },
  { text: "Oct", value: "10" },
  { text: "Nov", value: "11" },
  { text: "Dic", value: "12" },
];

const periodos_selected = ref<string[]>([]);

function nextYear() {
  const next_year = annio_selected.value + 1;
  annio_selected.value = next_year;
  if (!annios.value.some((i) => i === next_year)) annios.value.push(next_year);
}
function lastYear() {
  const last_year = annio_selected.value - 1;
  annio_selected.value = last_year;
  if (!annios.value.some((i) => i === last_year)) annios.value.push(last_year);
}

watch(periodos_selected, (v) => {
  emit("emit-add-periodo", Object.values(v));
});

watch(()=>props.disabled,(v)=>{
     
    if(v)periodos_selected.value=[]
    console.log("🚀 ~ file: selectedMonth.vue ~ line 91 ~ watch ~ v", v)
})

</script>

<style scoped>
.body-grid-month {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
}
</style>