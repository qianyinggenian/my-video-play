<template>
  <!--  视频组件-->
    <div class="video-container" :class="{'fullTransform': isFullTransform}">
      <video
          ref="myVideo"
          :id="videoId"
          :class="className"
          preload="auto"
          :poster="imgUrl"
          data-setup="{}"
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
              :items="videoMenu"
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
                accept="audio/x-mpegurl,application/x-mpegurl,text/plain,application/json"
                :deletable="true"
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
import { Toast } from 'vant';
import { base64ToStr, generateRandomNumbers } from '@/utils/util';

export default {
  name: 'index',
  data () {
    return {
      active: 0,
      showList: false,
      showSetting: false,
      imgUrl: imgUrl,
      activeId: '',
      activeIndex: '',
      updateVideoUrl: '',
      sourcePath: '默认',
      fileList: [],
      value: '',
      columns: ['默认', '本地', '远程自定义'],
      showPicker: false,
      activeItem: {},
      // videoUrl: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8',
      videoUrl: '',
      player: null,
      defaultList: defaultList,
      videoMenu: [],
      fileType: '',
      fileContent: null,
      isFullTransform: false,
      isFull: false,
      className: [
        'video-js',
        'vjs-default-skin',
        'vjs-big-play-centered',
        'vjs-visible-text',
        'vjs-sublime-skin',
        'vjs-fluid'
      ]
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
    this.videoMenu = this.defaultList;
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
      this.fileType = fileType;
      const reader = new FileReader();
      reader.onloadend = () => {
        this.getFileInfo(reader.result, fileType);
      };
      reader.readAsDataURL(file);
    },

    /**
     * @Description 获取本地文件中的内容
     * @author qianyinggenian
     * @date 2024/01/08
     */
    getFileInfo (path, fileType) {
      console.log('fileType', fileType);
      axios.get(path) // 这里的路径应根据实际情况修改
        .then(response => {
          this.fileContent = response.data;
        })
        .catch(error => {
          console.log('Error:', error);
        });
    },

    /**
     * @Description 设置确定后触发
     * @author qianyinggenian
     * @date 2024/01/08
     */
    onSubmitSetting () {
      if (this.sourcePath === '默认') {
        this.videoMenu = this.defaultList;
      } else if (this.sourcePath === '本地') {
        if (this.fileList.length === 0) {
          Toast('请选择文件');
          return false;
        } else {
          if (this.fileType === '.json') {
            this.videoMenu = this.fileContent;
          } else if (['.m3u', '.m3u8'].includes(this.fileType)) {
            this.handleFormatM3u8ToJson(this.fileContent);
          } else if (['.txt'].includes(this.fileType)) {
            this.handleFormatTxtToJson(this.fileContent);
          }
        }
      }
      this.activeIndex = null;
      this.activeId = null;
      this.showSetting = false;
    },
    fetchFileContent () {
      const t = new Date().getTime();
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/video-play.json?access_token=8592859e7e54a38c469c554361fd8b54&t=${t}`;
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/video-play.json?t=${t}`;
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/tv4.m3u8?t=${t}`;
      // const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/tv.txt?t=${t}`;
      const fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/tv.txt?access_token=6127914b469c0e96f6cc6a552d68cb04&t=${t}`;
      axios({
        method: 'get',
        timeout: 6000,
        baseURL: 'https://gitee.com/',
        responseType: 'json', // default
        responseEncoding: 'utf8',
        url: fileUrl
      })
        .then((response) => {
          // const decodedText = atob(response.data.content); // 解码得到明文
          const decodedText = base64ToStr(response.data.content); // 解码得到明文
          this.handleFormatTxtToJson(decodedText, '.txt');
          // 这里可以对返回的文件内容进行处理
        }).catch((error) => {
          console.error('获取文件失败:', error);
        });
    },

    /**
     * @Description 格式转化 m3u8转json
     * @author qianyinggenian
     * @date 2024/11/08
     */
    handleFormatM3u8ToJson (decodedText) {
      if (decodedText.includes('#genre#')) {
        Toast('m3u8格式源错误');
        return false;
      }
      const lines = decodedText.split('\n');
      let originalChannelName = null;
      const jsonList = [];
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine !== '') {
          if (trimmedLine.includes('group-title')) {
            const endIndex = trimmedLine.lastIndexOf('",');
            originalChannelName = trimmedLine.slice(endIndex, trimmedLine.length).replace(/",/, '').trim();
          } else if (!trimmedLine.includes('#EXTM3U') && !trimmedLine.includes('#EXTINF')) {
            const index = jsonList.findIndex(item => item.text === originalChannelName);
            if (index === -1) {
              const params = {
                text: originalChannelName,
                children: [
                  {
                    text: '源1',
                    // id: 1,
                    id: generateRandomNumbers(),
                    url: trimmedLine
                  }
                ]
              };
              jsonList.push(params);
            } else {
              const len = jsonList[index].children.length;
              const params = {
                text: `源${len + 1}`,
                // id: len + 1,
                id: generateRandomNumbers(),
                url: trimmedLine
              };
              jsonList[index].children.push(params);
            }
          }
        }
      }
      this.videoMenu = jsonList;
    },
    /**
     * @Description txt 转换 json
     * @author qianyinggenian
     * @date 2024/01/09
    */
    handleFormatTxtToJson (decodedText) {
      if (decodedText.includes('#EXTINF') || decodedText.includes('#EXTM3U')) {
        Toast('TXT格式源错误');
        return false;
      }
      const lines = decodedText.split('\n');
      const jsonList = [];
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine !== '') {
          if (!trimmedLine.includes('#genre#')) {
            const [originalChannelName, channelLink] = trimmedLine.split(',').map(item => item.trim());
            const index = jsonList.findIndex(item => item.text === originalChannelName);
            if (index === -1) {
              const params = {
                text: originalChannelName,
                children: [
                  {
                    text: '源1',
                    // id: 1,
                    id: generateRandomNumbers(),
                    url: channelLink
                  }
                ]
              };
              jsonList.push(params);
            } else {
              const len = jsonList[index].children.length;
              const params = {
                text: `源${len + 1}`,
                // id: len + 1,
                id: generateRandomNumbers(),
                url: channelLink
              };
              jsonList[index].children.push(params);
            }
          }
        }
      }
      this.videoMenu = jsonList;
    },
    init () {
      // 播放器初始化
      // const that = this;
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
          // Menu: true,
          // playbackRateMenuButton: true,
          timeDivider: true,
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
        // this.on('fullscreenchange', () => {
        //   if (this.isFullscreen()) {
        //     this.enterFullWindow();
        //     // that.player.landscapeFullscreen();
        //   } else {
        //     this.exitFullWindow();
        //   }
        // });
      });
      this.$nextTick(() => {
        this.addButton();
        this.addButtonFull();
        this.addSettingBtn();
        this.updateUrl();
      });
    },
    customFullFn () {
      const app = document.querySelector('.video-container');
      const body = app;
      const max = body.clientHeight;
      const min = body.clientWidth;
      app.style.width = max + 'px';
      app.style.height = min + 'px';
      this.isFullTransform = !this.isFullTransform;
    },
    clickNav (index) {
      console.log('index', index);
      this.activeItem = this.videoMenu[index].children[0];
      console.log('activeItem', this.activeItem);
    },
    clickItem (item) {
      console.log('item', item);
      this.activeItem = item;
    },
    /**
     * @Description 列表点击确定触发
     * @author qianyinggenian
     * @date 2024/01/09
    */
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
    //  修改video的src
    updateUrl () {
      this.videoUrl = this.defaultList[0].children[0].url;
      this.player.src({
        type: 'application/x-mpegURL',
        src: this.videoUrl
      });
      this.player.play();
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
  .video-js {
    width: 100%;
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
::v-deep  .video-js .vjs-time-control { display:block; }
::v-deep  .video-js .vjs-remaining-time { display: none; }
::v-deep .vjs-live-control {
  width: 6em;
  .vjs-live-display {
    margin-left: 1em;
    font-size: 1.75em;
  }
}
::v-deep .vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: block;
}
/* 点击屏幕播放/暂停 */
::v-deep .video-js.vjs-playing .vjs-tech {
  pointer-events: auto;
}
.videoId-dimensions.vjs-fluid:not(.vjs-audio-only-mode) {
  padding-top: 0;
}
.fullTransform {
  transform: rotate(90deg);
  transform-origin: 50vw 50vw;
}

::v-deep .van-form {
  height: 100%;
  .van-tree-select {
    height: calc(100% - 76px) !important;
    .van-tree-select__content {
      flex: 1 !important;
      -webkit-box-flex: 1 !important;
      -webkit-flex: 1 !important;
    }
  }
}

</style>
