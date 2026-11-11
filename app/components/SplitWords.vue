<script setup lang="ts">
// A heading's text, word by word, each word in its own mask so the story can raise it into view.
// Words only, never letters: Arabic letters join inside a word, and splitting them would break the
// shapes. The spaces stay real text between the masks, so the words read and wrap as one sentence.
// Without motion every word simply shows.
const props = defineProps<{
  text: string
}>()

const words = computed(() => props.text.split(/\s+/).filter(Boolean))
</script>

<template>
  <!-- Kept on one line (and out of the formatter's reach): the spaces keep the words apart when read
       aloud and let the sentence wrap. -->
  <!-- prettier-ignore -->
  <span class="split"><template v-for="(word, index) in words" :key="index"><span class="split__mask" data-mask><span class="split__word" data-mask-inner>{{ word }}</span></span><template v-if="index < words.length - 1">{{ ' ' }}</template></template></span>
</template>

<style scoped lang="scss">
// The mask is the word's own box, opened a little at the sides and below so no mark or dot under a
// letter is cut; a word leaving or arriving disappears through its top and bottom edges.
.split__mask {
  display: inline-block;
  clip-path: inset(-0.12em -0.3em -0.3em -0.3em);
}

.split__word {
  display: inline-block;
}
</style>
