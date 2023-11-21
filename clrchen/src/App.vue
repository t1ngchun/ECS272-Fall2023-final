<script lang="ts">
import Timeline from './components/Timeline.vue'

export default {
  data() {
    return {
      filter: []
    };
  },
  components: {
    Timeline,
  },
}
</script>

<!--This is using the grid component from Vuetify to do layout design-->
<template>
  <v-container id="main-container" class="d-flex flex-nowrap" fluid>
    <Timeline />
  </v-container>
</template>

<style scoped>
#main-container{
  height: 100%;
}
</style>
