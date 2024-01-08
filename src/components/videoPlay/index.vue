<template>
  <!--  视频组件-->
    <div class="video-container" :class="{'fullTransform': isFullTransform}">
      <video
          ref="myVideo"
          :id="videoId"
          :class="className"
          preload="auto"
          :poster="imgUrl"
      >

        <!--      x-webkit-airplay="allow"-->
        <!--      x5-video-player-type="h5"-->
        <!--      x5-video-player-fullscreen="false"-->
        <!--      x5-video-orientation="landscape"-->
        <!--      webkit-playsinline="true"-->
        <!--      playsinline="true"-->
        <source :src="videoUrl" type="application/x-mpegURL"/>
      </video>
      <van-popup
          v-model="showList"
          round
          position="bottom"
          :style="{ height: '50%' }"
          @close="closePopup"
      >
        <van-form @submit="onSubmit">
          <van-tree-select
              :items="defaultList"
              :active-id.sync="activeId"
              :main-active-index.sync="activeIndex"
              @click-nav="clickNav"
              @click-item="clickItem"
          >
          </van-tree-select>
          <div style="margin: 16px;">
            <van-button round block type="info" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </van-popup>
      <van-popup
          v-model="showSetting"
          round
          position="bottom"
          :style="{ height: '50%' }"
          @close="closePopupSetting"
      >
        <van-form @submit="onSubmitSetting">
          <van-field
              readonly
              clickable
              name="picker"
              :value="sourcePath"
              label="源来源"
              placeholder="点击选择源来源"
              @click="showPicker = true"
          />
          <van-cell-group v-if="sourcePath === '远程自定义'">
            <van-field v-model="value" label="远程地址" placeholder="请输入远程地址" />
          </van-cell-group>
          <van-cell-group  v-if="sourcePath === '本地'">
            <van-cell title="文件类型：.m3u,.m3u8,.txt,.json" />
            <van-uploader
                v-model="fileList"
                :max-count="1"
                accept=".m3u,.m3u8,.txt,.json"
                :deletable="false"
                :after-read="afterRead"
            />
          </van-cell-group>
          <van-popup v-model="showPicker" position="bottom">
            <van-picker
                show-toolbar
                :columns="columns"
                @confirm="onConfirmPicker"
                @cancel="showPicker = false"
            />
          </van-popup>
          <div style="margin: 16px;">
            <van-button round block type="info" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </van-popup>
    </div>
</template>
<script>
import axios from 'axios';
import 'video.js/dist/video-js.css';
import imgUrl from './images/oceans.png';
// import videojs from 'video.js'
import 'videojs-contrib-hls';
import '@videojs/http-streaming';
// import 'videojs-youtube';
// import 'videojs-landscape-fullscreen';
import { defaultList } from '@/components/videoPlay/list';

export default {
  name: 'index',
  data () {
    return {
      active: 0,
      showList: false,
      showSetting: false,
      imgUrl: imgUrl,
      activeId: 1,
      activeIndex: 0,
      updateVideoUrl: '',
      sourcePath: '默认',
      fileList: [],
      value: '',
      columns: ['默认', '本地', '远程自定义'],
      showPicker: false,
      activeItem: {},
      // videoUrl: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8',
      // videoUrl: 'https://cfss.cc/ds/ysp/qp.php?id=cctv1&key=51397&Cf.m3u8',
      videoUrl: '',
      player: null,
      defaultList: defaultList,
      isFullTransform: false,
      isFull: false,
      className: [
        'video-js',
        'vjs-default-skin',
        'vjs-big-play-centered',
        'vjs-visible-text',
        'vjs-sublime-skin',
        'vjs-fluid'
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
  },
  mounted () {
    this.$nextTick(() => {
      this.init();
    });
    this.setOrientation(); // 初始化时设置视频方向
    window.addEventListener('orientationchange', () => {
      this.setOrientation(); // 当手机方向改变时重新设置视频方向
    });
    // this.fetchFileContent();
  },
  methods: {
    onConfirmPicker (value) {
      this.sourcePath = value;
      this.showPicker = false;
    },
    /**
     * @Description 选择文件后触发
     * @author qianyinggenian
     * @date 2024/01/08
    */
    afterRead (e) {
      const file = e.file;
      const fileType = file.name.substring(file.name.lastIndexOf('.')).toLocaleLowerCase();
      console.log(fileType);
      const reader = new FileReader();
      reader.onloadend = () => {
        this.getFileInfo(reader.result);
      };
      reader.readAsDataURL(file);
    },

    /**
     * @Description 获取文件中的内容
     * @author qianyinggenian
     * @date 2024/01/08
     */
    getFileInfo (path) {
      axios.get(path) // 这里的路径应根据实际情况修改
        .then(response => {
          this.fileContent = response.data;
          console.log('fileContent', this.fileContent);
        })
        .catch(error => {
          console.log('Error:', error);
        });
    },
    transformFn () {
      this.isFullTransform = !this.isFullTransform;
    },
    setOrientation () {
      // const video = this.$refs.myVideo;
      // console.log(video);
      if (window.matchMedia('(orientation: portrait)').matches) {
        // 如果是竖屏模式
        // alert('旋转竖屏');
        // console.log('竖屏');
        // video.style.width = '100%';
        // video.style.height = 'auto';
      } else {
        console.log('横屏');
        // alert('旋转横屏模式');
        // 如果是横屏模式
        // video.style.width = '';
        // video.style.height = '';
      }
    },
    fetchFileContent () {
      const t = new Date().getTime();
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/video-play.json?access_token=8592859e7e54a38c469c554361fd8b54&t=${t}`;
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/video-play.json?t=${t}`;
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/tv4.m3u8?t=${t}`;
      const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/tv.txt?t=${t}`;
      axios({
        method: 'get',
        timeout: 6000,
        baseURL: 'https://gitee.com/',
        responseType: 'json', // default
        url: fileUrl
      })
        .then((response) => {
          const decodedText = atob(response.data.content); // 解码得到明文
          // console.log('decodedText', JSON.parse(decodedText)); // 输出结果：Hello World!
          console.log('decodedText', decodedText); // 输出结果：Hello World!
          // this.defaultList = JSON.parse(decodedText).list;
          // this.$nextTick(() => {
          //   this.videoUrl = this.defaultList[0].children[0];
          //   console.log('aaa', this.videoUrl);
          //   this.init();
          // });
          this.formatUrl(decodedText);
          // 这里可以对返回的文件内容进行处理
        }).catch((error) => {
          console.error('获取文件失败:', error);
        });
    },
    formatUrl (decodedText) {
      const lines = decodedText.split('\n');
      console.log('lines', lines);
      let m3uOutput = '#EXTM3U x-tvg-url="https://live.fanmingming.com/e.xml"\n';
      let currentGroup = null;
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine !== '') {
          if (trimmedLine.includes('#genre#')) {
            currentGroup = trimmedLine.replace(/,#genre#/, '').trim();
          } else {
            const [originalChannelName, channelLink] = trimmedLine.split(',').map(item => item.trim());
            const processedChannelName = originalChannelName.replace(/(CCTV|CETV)-(\d+).*/, '$1$2');
            m3uOutput += `#EXTINF:-1 tvg-name="${processedChannelName}" tvg-logo="https://live.fanmingming.com/tv/${processedChannelName}.png"`;
            if (currentGroup) {
              m3uOutput += ` group-title="${currentGroup}"`;
            }
            m3uOutput += `,${originalChannelName}\n${channelLink}\n`;
          }
        }
      }
      console.log('m3uOutput', m3uOutput);
      // document.getElementById('m3uOutput').value = m3uOutput;
    },
    init () {
      // 播放器初始化
      const that = this;
      this.player = this.$videojs(this.videoId, {
        language: 'zh-CN',
        // techOrder: ['youtube'],
        autoplay: false,
        bigPlayButton: true,
        posterImage: false,
        errorDisplay: false,
        sources: [
          {
            // type: 'application/x-mpegURL',
            src: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8' // 你的m3u8地址（必填）
            // src: 'https://cfss.cc/ds/ysp/qp.php?id=cctv1&key=51397&Cf.m3u8' // 你的m3u8地址（必填）
          }
        ],
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
          timeDivider: false,
          currentTimeDisplay: true,
          playbackRate: true,
          remainingTimeDisplay: true,
          PictureInPictureToggle: true, // 画中画
          FullscreenToggle: false // 全屏
        },
        playbackRates: [0.5, 1, 1.5, 2],
        liveDisplay: false,
        liveui: true,
        preferFullWindow: true,
        LiveDisplay: false, // 是否显示直播文字图标
        controls: true, // 是否显示控件
        loop: true, // 循环播放
        muted: true // 静音模式 、、 解决首次页面加载播放。
      }, function onPlayerReady () {
        // const that = this;
        this.on('fullscreenchange', () => {
          if (this.isFullscreen()) {
            this.enterFullWindow();
            that.isFullTransform = true;
            // that.player.landscapeFullscreen();
          } else {
            that.isFullTransform = false;
            this.exitFullWindow();
          }
        });
      });
      this.$nextTick(() => {
        // this.addMenu();
        this.addButton();
        this.addButtonFull();
        this.addSettingBtn();
        this.updateUrl();
        // this.fetchFileContent();
      });
    },
    customFullFn () {
      const app = document.querySelector('.video-container');
      const body = app;
      const width = body.clientWidth;
      const height = body.clientHeight;
      const max = height;
      const min = width;
      app.style.width = max + 'px';
      app.style.height = min + 'px';
      this.isFullTransform = !this.isFullTransform;
    },
    clickNav (index) {
      this.activeItem = this.defaultList[index].children[0];
    },
    clickItem (item) {
      console.log('item', item);
      this.activeItem = item;
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
      this.showList = false;
      this.videoUrl = this.activeItem.url;
      this.player.src({
        type: 'application/x-mpegURL',
        src: this.videoUrl
      });
      this.player.play();
    },
    /**
     * @Description 设置确定后触发
     * @author qianyinggenian
     * @date 2024/01/08
    */
    onSubmitSetting () {
      this.showSetting = false;
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
          this.showList = true;
          this.updateVideoUrl = this.videoUrl;
        }
      });
      this.player.getChild('ControlBar').addChild(button);
    },
    /**
     * @Description 添加按钮
     * @author wangkangzhang
     * @date 2023/12/22
     */
    addButtonFull () {
      const Button = this.$videojs.getComponent('Button');
      const button = new Button(this.player, {
        className: 'vjs-visible-text custom-full',
        controlText: '全屏',
        clickHandler: (event) => {
          // 点击函数

          this.isFull = !this.isFull;
          this.customFullFn();
        }
      });
      this.player.getChild('ControlBar').addChild(button);
    },
    /**
     * @Description 添加按钮
     * @author wangkangzhang
     * @date 2023/12/22
     */
    addSettingBtn () {
      const Button = this.$videojs.getComponent('Button');
      const button = new Button(this.player, {
        className: 'vjs-visible-text custom-setting',
        controlText: '设置',
        clickHandler: (event) => {
          // 点击函数
          this.showSetting = !this.showSetting;
        }
      });
      this.player.getChild('ControlBar').addChild(button);
    },
    /** 关闭列表弹窗触发
     * @param e
     * @param item
     */
    closePopup () {
      this.showList = false;
    },
    /** 关闭设置弹窗触发
     * @param e
     * @param item
     */
    closePopupSetting () {
      this.showSetting = false;
    },
    setShowPercent (e, item) {
      console.log('e', e);
      console.log('item', item);
    },
    //  修改video的src
    updateUrl () {
      this.videoUrl = this.defaultList[0].children[0].url;
      this.player.src({
        type: 'application/x-mpegURL',
        src: this.videoUrl
      });
      this.player.play();
      // this.player.fullscreen({
      //   enterOnRotate: true, // 是否支持旋转设备进入全屏模式
      //   iOS: true, // 是否支持iOS系统
      //   iOSNative: false // 是否使用原生iOS全屏模式
      // });
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
@mixin customStyle {
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
}
.video-container {
  width: 100%;
  height: 100%;
  //height: 100vh;
  /* 将videojs  视频铺满容器 */
  //.video-js .vjs-tech {
  //  object-fit: fill;
  //}
  .video-js {
    width: 100%;
    //height: calc(100% - 50px);
    height: 100%;
  }
  //.vjs-tech {
  //    object-fit: cover;
  //  }

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

  @include customStyle;
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
::v-deep .custom-full {
  //display: flex;
  //align-items: center;
  //justify-content: center;
  //position: relative;
  //text-align: center;
  //cursor: pointer;
  //margin: 0;
  //padding: 0;
  //height: 100%;
  //width: 4em !important;
  @include customStyle;
  span {
    &:first-child {
      position: relative;
      font-family: VideoJS;
      font-weight: normal;
      font-style: normal;
      height: 100%;
      width: 100%;
      &::before {
        content: '\e6b2';
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
::v-deep .custom-setting {
  @include customStyle;
  span {
    &:first-child {
      position: relative;
      font-family: VideoJS;
      font-weight: normal;
      font-style: normal;
      height: 100%;
      width: 100%;
      &::before {
        content: '\e745';
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
.vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: block;
}

.video-js.vjs-playing .vjs-tech {
  pointer-events: auto;
}

.fullTransform {
  transform: rotate(90deg);
  transform-origin: 50vw 50vw;
}

::v-deep .van-form {
  height: 100%;
  .van-tree-select {
    height: calc(100% - 76px - 44px) !important;
    .van-tree-select__content {
      flex: 1 !important;
      -webkit-box-flex: 1 !important;
      -webkit-flex: 1 !important;
    }
  }
}
//@media screen and (max-aspect-ratio: 9/16) {
//  .video-container {
//    //background-color: red; /* 横屏模式下的背景色 */
//  }
//}
</style>
