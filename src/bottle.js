import Bottle from 'bottlejs';

import collFactory from './Vector';
import fetcherFactory from './Pool';
import impulseFactory from './Impulse';
import catchFactory from './rxCatch';
import promiserFactory from './Promiser';
import unsetFactory from './utils';
import restPoolFactory from './RestPool';
import restPoolUtilFactory from './RestPoolUtils';
import dataMapFactory from './DataMap';

export default () => {
    let bottle = new Bottle();
    unsetFactory(bottle);
    collFactory(bottle);
    fetcherFactory(bottle);
    catchFactory(bottle);
    impulseFactory(bottle);
    promiserFactory(bottle);
    restPoolFactory(bottle);
    dataMapFactory(bottle);
    restPoolUtilFactory(bottle);
    return bottle;
}
