import Cookies from 'js-cookie';

export const yiAnToken = 'yiAnToken';
export const refreshTokenKey = 'refreshTokenKey';
export const tokenExpireTime = 24 * 60 * 60 * 1000; // 31分钟
export const refreshTokenExpireTime = 23.5 * 60 * 60 * 1000; // 半小时

/**
 * @Description 获取Cookie
 * @author qianyinggenian
 * @date 2023/9/26
 */
export function getToKen () {
  return Cookies.get(yiAnToken);
}

/**
 * @Description 刷新Cookie
 * @author qianyinggenian
 * @date 2023/9/26
 */
export function getRefreshToken () {
  return Cookies.get(refreshTokenKey);
}

/**
 * @Description 设置Cookie
 * @author qianyinggenian
 * @date 2023/9/26
 */
export function setToken (name, value) {
  const expires = new Date(new Date() * 1 + tokenExpireTime);
  Cookies.set(name, value, { expires: expires }); // 10 秒后失效
}

/**
 * @Description 移除Cookie
 * @author qianyinggenian
 * @date 2023/9/26
 */
export function removeToken () {
  Cookies.remove(yiAnToken);
  Cookies.remove(refreshTokenKey);
}

export function setRefreshToken (Token) {
  const rfExpireTime = new Date(new Date().getTime() + refreshTokenExpireTime); // 刷新令牌的过期时间
  Cookies.set(refreshTokenKey, Token, { expires: rfExpireTime }); // cookie设置刷新令牌
}
