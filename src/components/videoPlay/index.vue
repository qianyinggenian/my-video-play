<template>
<!--  视频组件-->
  <div class="video-container">
    <video
        :id="videoId"
        :class="className"
        preload="auto"
        h5-playsinline
        x5-video-player-fullscreen="true"
        :poster="imgUrl"
    >
      <source :src="videoUrl" type="application/x-mpegURL"/>
    </video>
<!--    <van-tabbar v-model="active" @change="onChange">-->
<!--      <van-tabbar-item icon="home-o">标签</van-tabbar-item>-->
<!--      <van-tabbar-item icon="search">标签</van-tabbar-item>-->
<!--      <van-tabbar-item icon="friends-o">标签</van-tabbar-item>-->
<!--      <van-tabbar-item icon="setting-o">标签</van-tabbar-item>-->
<!--    </van-tabbar>-->
    <van-popup
        v-model="show"
        round
        position="bottom"
        :style="{ height: '30%' }"
        @close="closePopup"
    >
      <van-form @submit="onSubmit">
        <van-field
            v-model="updateVideoUrl"
            name="地址"
            label="地址"
            clearable
            placeholder="地址"
            :rules="[{ required: true, message: '请填写地址' }]"
        />
        <div style="margin: 16px;">
          <van-button round block type="info" native-type="submit">确定</van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>
<script>
import 'video.js/dist/video-js.css';
import imgUrl from './images/oceans.png';
// import videojs from 'video.js'
import 'videojs-contrib-hls';
import '@videojs/http-streaming';
// import videoZhCN from 'video.js/dist/lang/zh-CN.json';
// videojs.addLanguage('zh-CN', videoZhCN);
// const vidUrl = require('./vid/1.mp4');
export default {
  name: 'index',
  data () {
    return {
      active: 0,
      show: false,
      imgUrl: imgUrl,
      updateVideoUrl: '',
      videoUrl: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8',
      player: null,
      className: [
        'video-js',
        'vjs-default-skin',
        'vjs-big-play-centered',
        'vjs-visible-text'
      ],
      listUrl: [
        'http://cfss.cc/api/ysp/cctv1.m3u8',
        'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8']
      // videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4'
    };
  },
  props: {
    videoId: {
      type: String,
      default: 'videoId'
    }
    // videoUrl: {
    //   type: String,
    //   default: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8'
    //   // default: vidUrl
    //   // default: 'https://vjs.zencdn.net/v/oceans.mp4'
    // }
  },
  mounted () {
    this.$nextTick(() => {
      this.init();
      // this.updateUrl();
    });
  },
  methods: {
    init () {
      // 播放器初始化
      this.player = this.$videojs(this.videoId, {
        language: 'zh-CN',
        autoplay: false,
        bigPlayButton: true,
        posterImage: false,
        errorDisplay: false,
        controlBar: { // 总控制条
          // 这里可以自己控制各小组件的顺序和显示方式
          children: [
            { name: 'playToggle' }, // 播放按钮
            { name: 'currentTimeDisplay' }, // 当前已播放时间
            { name: 'progressControl' }, // 播放进度条
            { name: 'durationDisplay' }, // 总时间
            { name: 'audioTrackButton' },
            { // 倍数播放
              name: 'playbackRateMenuButton',
              playbackRates: [0.5, 1, 1.5, 2, 2.5]
            },
            {
              name: 'volumePanel', // 音量控制
              inline: false // 不使用水平方式
            }
          ],
          Menu: true,
          playbackRateMenuButton: true,
          timeDivider: true,
          currentTimeDisplay: true,
          playbackRate: true,
          remainingTimeDisplay: true,
          PictureInPictureToggle: true, // 画中画
          FullscreenToggle: true // 全屏
        },
        playbackRates: [0.5, 1, 1.5, 2],
        liveDisplay: false,
        liveui: true,
        preferFullWindow: true,
        // LiveDisplay: true, // 是否显示直播文字图标
        controls: true, // 是否显示控件
        loop: true, // 循环播放
        muted: true // 静音模式 、、 解决首次页面加载播放。
      }, function () {
        // this.play() // 自动播放
      });
      this.$nextTick(() => {
        // this.addMenu();
        this.addButton();
        this.updateUrl();
      });
    },
    onChange (index) {
      console.log('index', index);
    },
    /**
     * @Description 添加menu菜单
     * @author wangkangzhang
     * @date 2023/12/22
    */
    addMenu () {
      const MenuButton = this.$videojs.getComponent('MenuButton');
      const Menu = this.$videojs.getComponent('Menu');
      const MenuItem = this.$videojs.getComponent('MenuItem');

      const items = ['100%', '80%', '50%', 'auto'];
      const myMenu = new Menu(this.player);

      const myMenuItemList = [];

      for (let i = 0; i < items.length; i++) {
        myMenuItemList.push(new MenuItem(this.player, { label: items[i] }));
        const that = this;
        const item = items[i];
        myMenuItemList[i].on('click', ($event) => {
          that.setShowPercent($event, item);
        });
        myMenu.addItem(myMenuItemList[i]);
      }
      this.player.myMenu = myMenu;
      this.player.myMenuItemList = myMenuItemList;
      const myMenuButton = new MenuButton(this.player);
      myMenuButton.addChild(myMenu);
      myMenuButton.controlText('显示比例');
      myMenuButton.addClass('my-menu-button');
      myMenuButton.children()[0].addClass('vjs-visible-text');
      this.player.myMenuButton = myMenuButton;
      this.player.controlBar.addChild(myMenuButton);
    },
    onSubmit () {
      this.show = false;
      this.videoUrl = this.updateVideoUrl;
      console.log('videoUrl', this.videoUrl);

      this.player.src(this.videoUrl);
      this.player.play();
    },
    /**
     * @Description 添加按钮
     * @author wangkangzhang
     * @date 2023/12/22
    */
    addButton () {
      const Button = this.$videojs.getComponent('Button');
      const button = new Button(this.player, {
        className: 'vjs-visible-text custom-list',
        controlText: '列表',
        clickHandler: (event) => {
          // 点击函数
          console.log('aaaaaaaaaaaaaa');
          this.show = true;
          this.updateVideoUrl = this.videoUrl;
          // this.$videojs.log('Clicked');
        }
      });
      this.player.getChild('ControlBar').addChild(button);
    },
    /** 关闭弹出触发
     * @param e
     * @param item
     */
    closePopup () {
      this.show = false;
      console.log(996969696969);
    },
    setShowPercent (e, item) {
      console.log('e', e);
      console.log('item', item);
    },
    //  修改video的src
    updateUrl () {
      this.player.src(this.videoUrl);
      // this.player.play()
    }
  },
  beforeDestroy () {
    if (this.player != null) {
      this.player.dispose(); // dispose()会直接删除Dom元素
    }
  }
};
</script>

<style lang="scss" scoped>
.video-container {
  width: 100%;
  //height: 100%;
  height: 100vh;
  /* 将videojs  视频铺满容器 */
  //.video-js .vjs-tech {
  //  object-fit: fill;
  //}
  .video-js {
    width: 100%;
   //height: calc(100% - 50px);
   height: 100%;
  }

}
::v-deep .video-js .vjs-big-play-button {
  font-size: 2.5em !important;
  line-height: 2.3em !important;
  height: 2.5em !important;
  width: 2.5em !important;
  -webkit-border-radius: 2.5em !important;
  -moz-border-radius: 2.5em !important;
  border-radius: 2.5em !important;
  background-color: #73859f;
  background-color: rgba(115, 133, 159, 0.5) !important;
  border-width: 0.15em !important;
  margin-top: -1.25em !important;
  margin-left: -1.75em !important;
}
::v-deep .custom-list {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  cursor: pointer;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 4em !important;
  span {
    &:first-child {
      position: relative;
      font-family: VideoJS;
      font-weight: normal;
      font-style: normal;
      height: 100%;
      width: 100%;
      &::before {
        content: '\e73b';
        //font-family: element-icons;
        font-family: vant-icon;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    &:last-child {
      display: none;
    }
  }
}
::v-deep  .vjs-big-play-button .vjs-icon-placeholder {
  font-size: 1.63em !important;
}
::v-deep  .video-js .vjs-time-control{display:block;}
::v-deep  .video-js .vjs-remaining-time{display: none;}
::v-deep .vjs-live-control {
  width: 6em;
  .vjs-live-display {
    margin-left: 1em;
    font-size: 1.75em;
    .vjs-control-text {
    }
  }
}
</style>
