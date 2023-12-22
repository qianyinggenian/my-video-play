<template>
  <svg :class="svgClass" aria-hidden="true" v-on="$listeners" :style="{width: size + 'px', height: size + 'px', fill: fill}">
    <title>{{title}}</title>
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 20
    },
    fill: {
      type: String,
      default: '#034a6c'
    },
    title: {
      type: String
    }
  },
  computed: {
    iconName () {
      return `#icon-${this.iconClass}`;
    },
    svgClass () {
      if (this.className) {
        return 'svg-icon ' + this.className;
      } else {
        return 'svg-icon';
      }
    }
  }
};
</script>

<style scoped>

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}
</style>
