import bottle from './bottle';

const myBottle = bottle();
const {
  Pool,
  RestPool,
  Vector,
  Impulse,
  DataMap,
  axios
} = myBottle.container;

export default {
  Pool,
  RestPool,
  Vector,
  Impulse,
  DataMap,
  bottle,
  axios
};
