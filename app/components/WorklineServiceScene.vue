<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <svg class="scene" viewBox="0 0 520 270" fill="none" aria-hidden="true">
    <!-- A shared isometric workplane and five distinct schematic service illustrations.
         These are explanatory diagrams, not screenshots or claims about existing work. -->
    <g class="scene__plane" stroke="var(--border-strong)" stroke-width="1.2" stroke-linejoin="round">
      <path d="M52 170 260 75 468 170 260 265Z M52 170V183L260 278 468 183V170"/>
      <path d="M104 146 312 241M156 123 364 217M208 99 416 194M104 194 312 99M156 217 364 123M208 241 416 146"/>
      <path d="M260 75V28M52 170V114M468 170V114" stroke-dasharray="3 6"/>
    </g>
    <g class="scene__object" stroke="var(--text)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" fill="var(--bg)">
      <g v-if="id === 'service-1'">
        <rect x="111" y="37" width="298" height="163" rx="10"/>
        <path d="M111 65H409"/><circle cx="129" cy="51" r="3" fill="var(--accent)" stroke="none"/><circle cx="141" cy="51" r="3" stroke="var(--border-strong)"/><circle cx="153" cy="51" r="3" stroke="var(--border-strong)"/>
        <rect x="133" y="86" width="122" height="88" rx="5" stroke="var(--accent)" fill="var(--accent-subtle)"/>
        <path d="m146 157 33-32 22 19 40-42M277 91H385M277 109H364M277 137H385M277 155H340" stroke="var(--border-strong)"/>
        <path d="M277 178h72" stroke="var(--accent)" stroke-width="7"/>
      </g>
      <g v-else-if="id === 'service-2'">
        <rect x="166" y="18" width="110" height="203" rx="17"/><rect x="177" y="39" width="88" height="153" rx="7" stroke="var(--border-strong)"/>
        <path d="M204 29h34M207 205h28"/><rect x="189" y="55" width="64" height="45" rx="4" fill="var(--accent-subtle)" stroke="var(--accent)"/><path d="M189 118h64M189 135h48M189 153h64" stroke="var(--border-strong)"/>
        <rect x="291" y="57" width="80" height="138" rx="10"/><path d="M306 80h50M306 98h39M306 131h50M306 146h33" stroke="var(--border-strong)"/><rect x="306" y="113" width="50" height="7" rx="2" stroke="var(--accent)" fill="var(--accent-subtle)"/>
      </g>
      <g v-else-if="id === 'service-3'">
        <rect x="104" y="37" width="312" height="160" rx="9"/><path d="M104 65h312M220 197v25M300 197v25M202 222h116"/>
        <path d="M128 87h96v86h-96zM144 104h64M144 123h47M144 142h64" stroke="var(--border-strong)"/>
        <g stroke="var(--accent)" fill="var(--accent-subtle)"><rect x="251" y="139" width="23" height="34" rx="2"/><rect x="288" y="116" width="23" height="57" rx="2"/><rect x="325" y="95" width="23" height="78" rx="2"/><rect x="362" y="80" width="23" height="93" rx="2"/></g>
      </g>
      <g v-else-if="id === 'service-4'">
        <g v-for="y in [26,89,152]" :key="y"><rect x="140" :y="y" width="240" height="53" rx="6"/><circle cx="161" :cy="y+26" r="4" stroke="var(--accent)" fill="var(--accent)"/><path :d="`M178 ${y+26}h63 M329 ${y+18}h30 M329 ${y+26}h30 M329 ${y+34}h30`" stroke="var(--border-strong)"/><path :d="`M253 ${y+26}h32`" stroke="var(--accent)"/></g>
        <path d="M260 79v10M260 142v10" stroke="var(--accent)"/>
      </g>
      <g v-else>
        <rect x="133" y="38" width="254" height="162" rx="9"/>
        <path d="M133 66h254M151 52h26" stroke="var(--border-strong)"/>
        <path d="m215 90-46 40 46 40m90-80 46 40-46 40m-28-92-34 104" stroke="var(--accent)" stroke-width="3"/>
      </g>
    </g>
    <path class="scene__trace" d="M52 170 104 146 156 170 208 146" stroke="var(--accent)" stroke-width="2" pathLength="1"/>
  </svg>
</template>

<style scoped lang="scss">
.scene{width:min(100%,560px);height:auto;max-height:300px;overflow:visible;display:block}
.scene__plane{opacity:.55}
@media(prefers-reduced-motion:no-preference){
  .scene__object{transform-box:fill-box;transform-origin:center;animation:scene-in .48s var(--ease-out) both}
  .scene__trace{stroke-dasharray:1;animation:trace-in .65s var(--ease-out) both}
  @keyframes scene-in{from{transform:translateY(9px) scale(.97)}to{transform:none}}
  @keyframes trace-in{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
}
</style>
