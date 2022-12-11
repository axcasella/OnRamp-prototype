const arrayRemove = (arr, value) => {
  return arr.filter(function (ele) {
    return ele !== value;
  });
};

const getRandomFromMinMax = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

module.exports = { arrayRemove, getRandomFromMinMax };
