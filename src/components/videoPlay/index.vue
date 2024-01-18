<template>
  <!--  视频组件-->
    <div class="video-container" :class="{'fullTransform': isFullTransform}">
      <v-touch
          class="touch-container"
          @swipeleft="nowLeft"
          @swiperight="nowRight"
          @tap="onTap"
          @doubletap="dblclickFn"
          @pinchout="pinchout"
          @pinchin="pinchin"
          @pinch="pinch"
          @swipeup="swipeup"
          @swipedown="swipedown"
      >
        <video
            ref="myVideo"
            :id="videoId"
            :class="className"
            preload="auto"
            :poster="imgUrl"
            data-setup="{}"
            x-webkit-airplay="allow"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            x5-video-orientation="landscape"
            webkit-playsinline="true"
            playsinline="true"
        >

          <source :src="videoUrl" type="application/x-mpegURL"/>
          <source :src="videoUrl" type="video/mp4">
        </video>
      </v-touch>
      <van-popup
          v-model="showList"
          round
          position="bottom"
          :style="{ height: '70%' }"
          @close="closePopup"
      >
        <van-form @submit="onSubmit">
          <van-search show-action v-model="searchValue" shape="square" @search="onSearch" placeholder="请输入搜索关键词">
            <template #action>
<!--              <div @click="onSearch">搜索</div>-->
              <van-button plain size="small" type="info"  @click="onSearch">搜索</van-button>
            </template>
          </van-search>
          <div class="list-menu">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list
                    v-model="loading"
                    :finished="finished"
                    finished-text="没有更多了"
                    @load="onLoad"
                >
                  <van-cell
                      v-for="(item,index) in list"
                      :key="index"
                      :title="item.text"
                      :class="{'active-list': activeItemText === item.text }"
                      @click="handleVanCell(item,index)"
                  />
                </van-list>
            </van-pull-refresh>
            <div class="source-menu">
              <van-cell
                  v-for="(item,index) in sourceMenuList"
                  :key="index"
                  :title="item.text"
                  :class="{'active-list': activeSource === item.url }"
                  @click="handleSourceMenuVanCell(item)"
              />
            </div>
          </div>
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
            <van-field v-model="remoteAddress" label="远程地址" placeholder="请输入远程地址" />
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
      <van-popup
          class="more-popup"
          v-model="showMore"
          position="right"
          @close="closeMorePopup"
      >
        <div class="more-btn">
          <van-button plain type="primary" @click="handleShowList">列表</van-button>
          <van-button plain type="info" @click="handleShowSetting">设置</van-button>
        </div>
      </van-popup>
      <div class="custom-title" v-if="isShowTopRightBtn">
        <div class="title">
          <van-icon name="arrow-left" :size="24"  @click="handleReturn" />
          <span :title="activeItemText">{{activeItemText}}</span>
        </div>
        <div class="more">
          <van-icon name="more" :size="30" color="#ffffff"  @click="handleMore" />
        </div>
      </div>
    </div>
</template>
<script>
import axios from 'axios';
import 'video.js/dist/video-js.css';
import imgUrl from './images/oceans.png';
import 'videojs-contrib-hls';
import '@videojs/http-streaming';
import { defaultList } from '@/components/videoPlay/list';
import { Toast } from 'vant';
import { base64ToStr, generateRandomNumbers } from '@/utils/util';
// import oceansUrl from './vid/oceans.mp4';
export default {
  name: 'index',
  data () {
    return {
      list: [],
      activeSource: '',
      activeItemText: '默认频道',
      activeItemIndex: null,
      isShowTopRightBtn: false,
      sourceMenuList: [],
      dropdownMenuValue: '列表',
      searchValue: '',
      loading: false,
      finished: false,
      refreshing: false,
      active: 0,
      showList: false,
      showMore: false,
      showSetting: false,
      imgUrl: imgUrl,
      activeId: '',
      activeIndex: '',
      updateVideoUrl: '',
      sourcePath: '默认',
      remoteAddress: '',
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
    const url = 'https://github.com/qianyinggenian/live/blob/main/live.txt';
    // const url = 'https://gitee.com/wkz_gitee/yuan/blob/master/video-play.txt';
    this.fetchFileContent(url);
  },
  methods: {
    /**
     * @Description 移动端双击
     * @author qianyinggenian
     * @date 2024/01/17
     */
    dblclickFn () {
      this.player.pause();
      this.isShowTopRightBtn = true;
    },
    /**
     * @Description 移动端手势放大
     * @author qianyinggenian
     * @date 2024/01/18
    */
    pinchout () {
      if (!this.isFullTransform) {
        this.customFullFn();
      }
    },
    /**
     * @Description 移动端手势收缩
     * @author qianyinggenian
     * @date 2024/01/18
    */
    pinchin () {
      if (this.isFullTransform) {
        this.customFullFn();
      }
    },
    /**
     * @Description 移动端缩放手势
     * @author qianyinggenian
     * @date 2024/01/18
    */
    pinch () {
      console.log('缩放手势缩放手势');
    },
    /**
     * @Description 快进
     * @author qianyinggenian
     * @date 2024/01/18
    */
    fastForwardFn (event) {
      // 获取滑动距离
      const distance = event.distance;
      // 获取容器总长度
      const clientWidth = document.querySelector('.video-container').clientWidth;
      // 获取总时长
      const duration = this.player.duration();
      if (duration === Infinity) {
        Toast({
          message: '不可快进',
          className: this.isFullTransform ? 'toastTransform' : ''
        });
        return false;
      }
      // 获取快进时长
      const percentage = distance / clientWidth * duration;
      const currentTime = this.player.currentTime();
      let newCurrentTime = currentTime + percentage;
      if (newCurrentTime >= duration) {
        newCurrentTime = distance;
      }
      this.player.currentTime(newCurrentTime);
      this.player.play();
    },
    /**
     * @Description 后退
     * @author qianyinggenian
     * @date 2024/01/18
    */
    backFn (event) {
      // 获取滑动距离
      const distance = event.distance;
      // 获取容器总长度
      const clientWidth = document.querySelector('.video-container').clientWidth;
      // 获取总时长
      const duration = this.player.duration();
      if (duration === Infinity) {
        Toast({
          message: '不可后退',
          className: this.isFullTransform ? 'toastTransform' : ''
        });
        return false;
      }
      // 获取快进时长
      const percentage = distance / clientWidth * duration;
      const currentTime = this.player.currentTime();
      let newCurrentTime = currentTime - percentage;
      if (newCurrentTime <= 0) {
        newCurrentTime = 0;
      }
      this.player.currentTime(newCurrentTime);
      this.player.play();
    },
    /**
     * @Description 移动端向上滑动
     * @author qianyinggenian
     * @date 2024/01/18
    */
    swipeup (event) {
      if (this.isFullTransform) {
        this.backFn(event);
      }
    },
    /**
     * @Description 移动端向下滑动
     * @author qianyinggenian
     * @date 2024/01/18
    */
    swipedown (event) {
      if (this.isFullTransform) {
        this.fastForwardFn(event);
      }
    },
    /**
     * @Description 移动端向左滑
     * @author qianyinggenian
     * @date 2024/01/18
    */
    nowLeft (event) {
      if (!this.isFullTransform) {
        this.backFn(event);
      }
    },
    /**
     * @Description 移动端向右滑
     * @author qianyinggenian
     * @date 2024/01/18
    */
    nowRight (event) {
      if (!this.isFullTransform) {
        this.fastForwardFn(event);
      }
    },
    /**
     * @Description 移动端单击
     * @author qianyinggenian
     * @date 2024/01/17
     */
    onTap (e) {
      this.isShowTopRightBtn = !this.isShowTopRightBtn;
    },
    /**
     * @Description 点击更多图标触发
     * @author qianyinggenian
     * @date 2024/01/17
     */
    handleMore () {
      this.showMore = true;
    },
    /**
     * @Description 关闭更多弹窗
     * @author qianyinggenian
     * @date 2024/01/18
    */
    closeMorePopup () {
      this.showMore = false;
    },
    /**
     * @Description 点击更多-设置按钮触发
     * @author qianyinggenian
     * @date 2024/01/18
    */
    handleShowSetting () {
      this.showList = false;
      this.showSetting = !this.showSetting;
    },
    /**
     * @Description 点击更多-列表按钮触发
     * @author qianyinggenian
     * @date 2024/01/18
     */
    handleShowList () {
      this.showSetting = false;
      this.showList = !this.showList;
    },
    /**
     * @Description 懒加载
     * @author qianyinggenian
     * @date 2024/01/17
    */
    onLoad () {
      setTimeout(() => {
        if (this.refreshing) {
          this.list = [];
          this.refreshing = false;
        }

        for (let i = 0; i < 10; i++) {
          const item = this.videoMenu[this.list.length];
          if (!item) {
            break;
          }
          this.list.push(item);
        }
        this.loading = false;

        if (this.list.length >= this.videoMenu.length) {
          this.finished = true;
        }
      }, 1000);
    },
    /**
     * @Description 下拉刷新
     * @author qianyinggenian
     * @date 2024/01/17
    */
    onRefresh () {
      // 清空列表数据
      this.finished = false;

      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    },
    /**
     * @Description 点击列表菜单项触发
     * @author qianyinggenian
     * @date 2024/01/17
    */
    handleVanCell (item, index) {
      this.sourceMenuList = item.children;
      this.activeItemText = item.text;
      this.activeItem = item.children[0];
      this.activeItemIndex = index;
    },
    /**
     * @Description 点击源触发
     * @author qianyinggenian
     * @date 2024/01/17
    */
    handleSourceMenuVanCell (item) {
      this.activeItem = item;
      this.activeSource = item.url;
    },
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
      this.list = [];
      this.sourceMenuList = [];
      if (this.sourcePath === '默认') {
        this.videoMenu = this.defaultList;
      } else if (this.sourcePath === '本地') {
        if (this.fileList.length === 0) {
          Toast({
            message: '请选择文件',
            className: this.isFullTransform ? 'toastTransform' : ''
          });
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
      } else if (this.sourcePath === '远程自定义') {
        if (!this.remoteAddress) {
          Toast({
            message: '请填写远程地址',
            className: this.isFullTransform ? 'toastTransform' : ''
          });
          return false;
        } else {
          if (!this.remoteAddress.includes('github.com') && !this.remoteAddress.includes('gitee.com')) {
            Toast({
              message: '请填github或gitee直播源地址',
              className: this.isFullTransform ? 'toastTransform' : ''
            });
            return false;
          }
          this.fetchFileContent(this.remoteAddress);
        }
      }
      this.activeIndex = null;
      this.activeId = null;
      this.showSetting = false;
    },
    fetchFileContent (url) {
      const t = new Date().getTime();
      let baseURL = 'https://gitee.com/';
      // https://gitee.com/wkz_gitee/yuan/blob/master/tv.txt
      let fileUrl;
      let fileType = '.txt';
      if (url) {
        const list = url.split('/');
        fileType = list.at(-1).substring(list.at(-1).lastIndexOf('.')).toLocaleLowerCase();
        if (url.includes('gitee.com')) {
          fileUrl = `api/v5/repos/${list[3]}/${list[4]}/contents/${list.at(-1)}?access_token=6127914b469c0e96f6cc6a552d68cb04&t=${t}`;
        } else if (url.includes('github.com')) {
          baseURL = 'https://api.github.com';
          fileUrl = `/repos/${list[3]}/${list[4]}/contents/${list.at(-1)}`;
        }
      } else {
        fileUrl = `api/v5/repos/wkz_gitee/yuan/contents/tv.txt?access_token=6127914b469c0e96f6cc6a552d68cb04&t=${t}`;
      }
      axios({
        method: 'get',
        timeout: 6000,
        baseURL: baseURL,
        responseType: 'json', // default
        responseEncoding: 'utf8',
        url: fileUrl
      })
        .then((response) => {
          // const decodedText = atob(response.data.content); // 解码得到明文
          const decodedText = base64ToStr(response.data.content); // 解码得到明文
          if (fileType === '.txt') {
            this.handleFormatTxtToJson(decodedText);
          } else if (['.m3u', '.m3u8'].includes(fileType)) {
            this.handleFormatM3u8ToJson(decodedText);
          } else if (fileType === 'json') {
            this.videoMenu = decodedText;
          } else {
            Toast({
              message: '格式错误',
              className: this.isFullTransform ? 'toastTransform' : ''
            });
          }
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
        Toast({
          message: 'm3u8格式源错误',
          className: this.isFullTransform ? 'toastTransform' : ''
        });
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
              const ind = jsonList[index].children.findIndex(item => item.url === trimmedLine);
              if (ind === -1) {
                jsonList[index].children.push(params);
              }
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
        Toast({
          message: 'TXT格式源错误',
          className: this.isFullTransform ? 'toastTransform' : ''
        });
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
              const ind = jsonList[index].children.findIndex(item => item.url === channelLink);
              if (ind === -1) {
                jsonList[index].children.push(params);
              }
            }
          }
        }
      }
      this.videoMenu = jsonList;
    },
    init () {
      // 播放器初始化
      const that = this;
      this.player = this.$videojs(this.videoId, {
        language: 'zh-CN',
        autoplay: false,
        bigPlayButton: true,
        posterImage: false,
        errorDisplay: false,
        sources: [
          {
            // type: 'application/x-mpegURL',
            src: 'https://live-play.cctvnews.cctv.com/cctv/merge_cctv13.m3u8' // 你的m3u8地址（必填）
            // src: oceansUrl // 你的m3u8地址（必填）
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
          timeDivider: false,
          currentTimeDisplay: true,
          playbackRate: true,
          remainingTimeDisplay: true,
          PictureInPictureToggle: true, // 画中画
          FullscreenToggle: false // 全屏
        },
        userActions: {
          // 单击  pc端生效， 移动端无效
          // click: that.myClickHandler,
          // 双击 pc端生效， 移动端无效
          // doubleClick: that.myDoubleClickHandler
        },
        // techOrder: ['html5', 'flash'],
        playbackRates: [0.5, 1, 1.5, 2],
        liveDisplay: false,
        liveui: true,
        // preferFullWindow: true,
        preferFullWindow: false,
        LiveDisplay: false, // 是否显示直播文字图标
        controls: true, // 是否显示控件
        loop: true, // 循环播放
        muted: true // 静音模式 、、 解决首次页面加载播放。
      }, function onPlayerReady () {
        console.log('视频可以播放啦~~~');
        // /**
        //  * 监听内部事件
        //  */
        // this.on('loadstart', function () {
        //   console.log('开始请求数据 ');
        // });
        // this.on('progress', function () {
        //   console.log('正在请求数据 ');
        // });
        // this.on('loadedmetadata', function () {
        //   console.log('获取资源长度完成 ');
        // });
        // this.on('canplaythrough', function () {
        //   console.log('视频源数据加载完成');
        // });
        // this.on('waiting', function () {
        //   console.log('等待数据');
        // });
        this.on('play', function () {
          console.log('视频开始播放');
          that.isShowTopRightBtn = false;
        });
        // this.on('playing', function () {
        //   console.log('视频播放中');
        // });
        // this.on('pause', function () {
        //   console.log('视频暂停播放');
        // });
        // this.on('ended', function () {
        //   console.log('视频播放结束');
        // });
        this.on('error', function () {
          // 报错信息
          that.errorFn();
        });
        // this.on('seeking', function () {
        //   console.log('视频跳转中');
        // });
        // this.on('seeked', function () {
        //   console.log('视频跳转结束');
        // });
        // this.on('ratechange', function () {
        //   console.log('播放速率改变');
        // });
        // this.on('timeupdate', function () {
        //   console.log('播放时长改变');
        // });
        // this.on('volumechange', function () {
        //   console.log('音量改变');
        // });
        // this.on('stalled', function () {
        //   console.log('网速异常');
        // });
      });
      this.$nextTick(() => {
        this.addButton();
        this.addButtonFull();
        this.addSettingBtn();
        this.updateUrl();
      });
    },
    /**
     * @Description PC端单击
     * @author qianyinggenian
     * @date 2024/01/18
    */
    myClickHandler () {
      console.log('PC端单击');
    },
    /**
     * @Description PC端双击
     * @author qianyinggenian
     * @date 2024/01/18
    */
    myDoubleClickHandler () {
      console.log('pc端双击');
    },
    errorFn () {
      const nextMenu = this.list[this.activeItemIndex + 1];
      if (nextMenu) {
        this.activeItemText = nextMenu.text;
        this.activeItemIndex += 1;
        this.sourceMenuList = nextMenu.children;
        this.activeItem = nextMenu.children[0];
        this.activeSource = this.activeItem.url;
        this.onSubmit(true);
      }
    },
    /**
     * @Description 点击顶部返回箭头触发
     * @author qianyinggenian
     * @date 2024/01/18
    */
    handleReturn () {
      if (this.isFullTransform) {
        this.customFullFn();
      }
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
    /**
     * @Description 列表点击确定触发
     * @author qianyinggenian
     * @date 2024/01/09
    */
    onSubmit (flag) {
      this.showList = false;
      this.videoUrl = this.activeItem.url;
      this.player.src({
        type: 'application/x-mpegURL',
        src: this.videoUrl
      });
      if (flag) {
        this.player.load();
      }
      this.player.play();
    },

    /**
     * @Description 列表-搜索按钮触发
     * @author qianyinggenian
     * @date 2023/12/22
     */
    onSearch () {
      console.log('searchValue', this.searchValue);
    },
    /**
     * @Description 添加按钮
     * @author qianyinggenian
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
     * @author qianyinggenian
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
     * @author qianyinggenian
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
  position: relative;
  .touch-container {
    width: 100%;
    height: 100%;
  }
  /* 将videojs  视频铺满容器 */
  .video-js {
    width: 100%;
    height: 100%;
    background-color: #242424;
  }
  .custom-btn {
    display: block;
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .custom-title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    display: flex;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background-color: rgba(255,255,255, 0.2);
    .title {
      flex: 5;
      flex-shrink: 0;
      display: flex;
      color: white;
      font-size: 18px;
      font-weight: bold;
      align-items: center;
      overflow: hidden;
      span {
        width: calc(100% - 30px);
        margin-left: 5px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
    }
    .more {
      flex: 1;
      display: flex;
      align-items: center;
      position: relative;
      flex-shrink: 0;
      .van-icon-more {
        position: absolute;
        right: 10px;
      }
    }
  }
}
.more-popup {
  height: 100%;
  top: 50%;
  right:0 !important;
  left: auto !important;
  width: 25% !important;
  background-color: rgba(255,255,255, 0.7);
  .more-btn {
    display: flex;
    padding: 10px;
    box-sizing: border-box;
    flex-direction: column;
    .van-button {
      margin-bottom: 5px;
    }
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
  .van-search__action {
    display: flex;
    align-items: center;
    padding: 0 8px 0 0;
  }
  .list-menu {
    height: calc(100% - 76px - 54px) !important;
    display: flex;
    .van-pull-refresh {
      height: 100%;
      flex: 2;
      flex-shrink: 0;
      overflow-y: auto;
    }
    .source-menu {
      flex: 1;
      height: 100%;
      flex-shrink: 0;
      overflow-y: auto;
    }
  }
  .active-list {
    color: white !important;
    background-color: rgba(25,137,250,0.8) !important;
  }
}

</style>
<style>
.toastTransform {
  transform: rotate(90deg) !important;;
}
</style>
