<template>
  <div>
    <video class="video-js vjs-big-play-centered" ref="videoPlayer"></video>
  </div>
</template>

<script>
import videojs from 'video.js';

export default {
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  data () {
    return {
      player: null
    };
  },
  mounted () {
    this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady () {
      console.log('onPlayerReady', this);
      this.on('fullscreenchange', function () {
        console.log(9639633);
        if (this.isFullscreen()) {
          alert('全屏');
          this.enterFullWindow();
        } else {
          alert('非全屏');
          this.exitFullWindow();
        }
      });
    });
  },
  beforeDestroy () {
    if (this.player) {
      this.player.dispose();
    }
  }
};
</script>
<style lang="scss" scoped>
.video-js {
  margin: 0 auto;
}
</style>
