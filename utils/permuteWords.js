'use strict';
let words = [];

let swap = (str, idx1, idx2) => {
  let temp = str[idx1];
  str[idx1] = str[idx2];
  str[idx2] = temp;
};

let permutations = (str, l, r) => {
  if (l === r) {
    if (words.length >= 25) return;
    let res = str.join('');
    if (!words.includes(res)) words.push(res);
  } else {
    for (let i = 0; i < r + 1; i++) {
      swap(str, i, l);
      permutations(str, l + 1, r);
      swap(str, i, l);
    }
  }
};

let getJumbledWords = (str) => {
  words = [];
  let strArr = Array.from(str);
  let n = strArr.length;
  permutations(strArr, 0, n - 1);
  let idx = words.indexOf(str);
  words.splice(idx, 1);
  return words;
};

module.exports = getJumbledWords;