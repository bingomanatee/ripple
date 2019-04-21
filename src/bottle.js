import Bottle from 'bottlejs';

import collFactory from './Vector';
import poolFactory from './Pool';
import impulseFactory from './Impulse';
import catchFactory from './rxCatch';
import unsetFactory from './utils';
import restPoolFactory from './RestPool';
import restPoolUtilFactory from './RestPoolUtils';
import signalFactory from './Signal';

export default () => {
  let bottle = new Bottle();

  unsetFactory(bottle);
  collFactory(bottle);
  poolFactory(bottle);
  catchFactory(bottle);
  impulseFactory(bottle);
  restPoolFactory(bottle);
  restPoolUtilFactory(bottle);
  signalFactory(bottle);
  return bottle;
};
