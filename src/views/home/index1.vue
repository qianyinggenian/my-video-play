<template>
  <div>
    <video-player :options="videoOptions" />
  </div>
</template>

<script>
import VideoPlayer from '@/components/h5/index.vue';
const clientWidth = document.documentElement.clientWidth;

export default {
  name: 'VideoExample',
  components: {
    VideoPlayer
  },
  data () {
    return {
      videoOptions: {
        width: clientWidth > 1000 ? 1000 : clientWidth,
        autoplay: true,
        controls: true,
        fluid: true,
        sources: [
          {
            src: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8',
            type: 'application/x-mpegURL'
          }
        ]
      }
    };
  },
  mounted () {
    console.log(document.body.clientWidth, document.documentElement.clientWidth);
  }
};
</script>
