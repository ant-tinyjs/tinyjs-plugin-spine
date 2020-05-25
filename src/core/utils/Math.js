export const PI = 3.1415927;
export const PI2 = PI * 2;
export const radians2Degrees = 180 / PI;
export const radDeg = radians2Degrees;
export const degrees2Radians = PI / 180;
export const degRad = degrees2Radians;

Math.fround = Math.fround || (function (array) {
  return function(x) {
    array[0] = x;
    return array[0];
  };
})(new Float32Array(1));

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;

  return value;
}

export function cosDeg(degrees) {
  return Math.cos(degrees * degRad);
}

export function sinDeg(degrees) {
  return Math.sin(degrees * degRad);
}

export function signum(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

export function toInt(x) {
  return x > 0 ? Math.floor(x) : Math.ceil(x);
}

export function cbrt(x) {
  const y = Math.pow(Math.abs(x), 1 / 3);

  return x < 0 ? -y : y;
}

export function randomTriangular(min, max) {
  return randomTriangularWith(min, max, (min + max) * 0.5);
}

export function randomTriangularWith(min, max, mode) {
  const u = Math.random();
  const d = max - min;

  if (u <= (mode - min) / d) {
    return min + Math.sqrt(u * d * (mode - min));
  }

  return max - Math.sqrt((1 - u) * d * (max - mode));
}
