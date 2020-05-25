export * from './Color';
export * from './Math';
export * from './Vector2';
export * from './Vector3';
export * from './Pool';
export * from './IntSet';
export * from './Interpolation';

const SUPPORTS_TYPED_ARRAYS = typeof Float32Array !== 'undefined';

function arrayCopy(source, sourceStart, dest, destStart, numElements) {
  for (let i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
    dest[j] = source[i];
  }
}

function setArraySize(array, size, value = 0) {
  const oldSize = array.length;

  if (oldSize === size) {
    return array;
  }

  array.length = size;

  if (oldSize < size) {
    for (let i = oldSize; i < size; i++) {
      array[i] = value;
    }
  }
  return array;
}

function ensureArrayCapacity(array, size, value = 0) {
  if (array.length >= size) {
    return array;
  }

  return setArraySize(array, size, value);
}

function newArray(size, defaultValue) {
  const array = new Array(size);

  for (let i = 0; i < size; i++) {
    array[i] = defaultValue;
  }
  return array;
}

function newFloatArray(size) {
  if (SUPPORTS_TYPED_ARRAYS) {
    return new Float32Array(size);
  } else {
    const array = new Array(size);

    for (let i = 0; i < array.length; i++) {
      array[i] = 0;
    }
    return array;
  }
}

function newShortArray(size) {
  if (SUPPORTS_TYPED_ARRAYS) {
    return new Int16Array(size);
  } else {
    const array = new Array(size);

    for (let i = 0; i < array.length; i++) {
      array[i] = 0;
    }
    return array;
  }
}

function toFloatArray(array) {
  return SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
}

function toSinglePrecision(value) {
  return SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
}

// This function is used to fix WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
function webkit602BugfixHelper(alpha, blend) {

}

function contains(array, element, identity = true) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === element) {
      return true;
    }
  }
  return false;
}

export {
  SUPPORTS_TYPED_ARRAYS,
  arrayCopy,
  setArraySize,
  ensureArrayCapacity,
  newArray,
  newFloatArray,
  newShortArray,
  toFloatArray,
  toSinglePrecision,
  webkit602BugfixHelper,
  contains,
};
