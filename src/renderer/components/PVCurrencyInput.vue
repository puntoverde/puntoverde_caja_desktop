<template>
    <v-text-field ref="inputRef" v-model="formattedValue"></v-text-field>
</template>

<script setup lang="ts">
import {useCurrencyInput} from 'vue-currency-input'
import type {CurrencyInputOptions} from 'vue-currency-input'
import {watch} from 'vue'

const props=defineProps<{modelValue:number,options:CurrencyInputOptions}>()

const {inputRef,formattedValue,setValue} =useCurrencyInput(props.options)

watch(()=>props.modelValue,value=>setValue(value))
</script>