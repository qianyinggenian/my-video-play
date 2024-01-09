import isBase64 from 'is-base64';
import { Base64 } from 'js-base64';
export function uniqueArray (arr, key) {
  const obj = {};
  arr = arr.reduce(function (item, next) {
    // eslint-disable-next-line no-unused-expressions
    obj[next[key]] = obj[next[key]] ? '' : item.push(next);
    // obj[next[key]] ? '' : obj[next[key]] = item.push(next);
    return item;
  }, []);
  return arr;
}

/**
 *判断对象是否是一个纯粹的对象
 */
function isPlainObject (obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 *深度合并多个对象的方法
 */
export function deepAssign () {
  const len = arguments.length;
  let target = arguments[0];
  if (!isPlainObject(target)) {
    target = {};
  }
  for (let i = 1; i < len; i++) {
    const source = arguments[i];
    if (isPlainObject(source)) {
      for (const s in source) {
        if (s === '__proto__' || target === source[s]) {
          continue;
        }
        if (isPlainObject(source[s])) {
          target[s] = deepAssign(target[s], source[s]);
        } else {
          target[s] = source[s];
        }
      }
    }
  }
  return target;
}

/**
 * @Description 升序
 * @author qianyinggenian
 * @date 2023/10/11 011
 */
export function sortUpDate (a, b) {
  return Date.parse(a.creatDate) - Date.parse(b.creatDate);
}

/**
 * @Description 降序
 * @author qianyinggenian
 * @date 2023/10/11 011
 */
export function sortDownDate (a, b, sortValue = 'creatDate') {
  return Date.parse(b[sortValue]) - Date.parse(a[sortValue]);
}

/**
 * @Description 文件下载
 * @author wangkangzhang
 * @date 2023/11/16
 */
export function download (blob, filename = '新建文件.xlsx') {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.style.display = 'none';
  a.click();
  document.body.removeChild(a);
}
/**
 * @Description base64解密
 * @author qianyinggenian
 * @date 2024/01/09
*/
export const base64ToStr = (base64Str) => {
  if (isBase64(base64Str)) {
    return Base64.decode(base64Str);
  }
  return base64Str;
};

/**
 * @Description base64加密
 * @author qianyinggenian
 * @date 2024/01/09
 */
export const strToBase64 = (str) => Base64.encode(str);
/**
 * @Description 生成随机数
 * @author qianyinggenian
 * @date 2024/01/09
*/
export function generateRandomNumbers () {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}
