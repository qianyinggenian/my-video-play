<template>
<div class="container">
  <video-play></video-play>
  111
</div>
</template>

<script>
import videoPlay from '@/components/videoPlay/index.vue';
export default {
  name: 'index',
  components: {
    videoPlay
  },
  data () {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
