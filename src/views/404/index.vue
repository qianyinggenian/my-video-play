<template>
  <div class="container">
    <div class="content">
      <div class="btn">
        <el-button plain @click="handleClick">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'index',
  methods: {
    handleClick () {
      this.$router.push('/home');
    }
  }
};
</script>

<style lang="scss" scoped>
@mixin bg {

  background-image: -moz-linear-gradient(135deg, rgb(255, 194, 219), rgb(158, 186, 255));
  background-image: -webkit-linear-gradient(135deg, rgb(255, 194, 219), rgb(158, 186, 255));
  background-image: linear-gradient(135deg, rgb(255, 194, 219), rgb(158, 186, 255));
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include bg;

  .content {
    width: 75%;
    height: 60%;
    background-size: 100% 100%;
    background-image: url("../../assets/404.svg");
    position: relative;

    .btn {
      width: 100%;
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: 50px;

      .el-button {
        border-image: linear-gradient(135deg, rgb(255, 194, 219), rgb(158, 186, 255));
        @include bg;
      }
    }
  }
}
</style>
