export default bottle => {
    bottle.factory('DataMap', () => {
        return class DataMap {
            constructor(records, pool) {
                this._map = new Map();
                this.pool = pool;
                (Array.isArray(records) ? records : [records]).forEach(data => {
                    const id = data[pool.idField];
                    this.set(id, data);
                })
            }

            get size() {
                return this._map.size;
            }

            entries() {
                return this._map.entries();
            }

            get(k){
                return this._map.get(k);
            }

            set(...a) {
                return this._map.set(...a);
            }

            has(k) {
                return this._map.has(k);
            }

            keys() {
                return this._map.keys()
            }

            clear() {
                return this._map.clear()
            }

            delete(k) {
                return this._map.delete(k)
            }

            values() {
                return this._map.values()
            }

            forEach(fn) {
                return this._map.forEach(fn)
            }

            overlaps(otherDataMap) {
                if (!otherDataMap instanceof DataMap) {
                    return false;
                }
                if (otherDataMap.size < this.size) {
                    return otherDataMap.overlaps(this);
                }
                let keys = this.keys();
                let next = keys.next();
                while (!next.done) {
                    if (otherDataMap.has(next.value)) {
                        return true;
                    }
                    next = keys.next();
                }

                return false;
            }

            sharedKeys(otherDataMap) {
                if (!otherDataMap instanceof DataMap) {
                    return false;
                }
                if (otherDataMap.size < this.size) {
                    return otherDataMap.sharedKeys(this);
                }
                let keys = this.keys();
                let shared = [];
                let next = keys.next();

                while (!next.done) {
                    if (otherDataMap.has(next.value)) {
                        shared.push(next.value);
                    }
                    next = keys.next();
                }

                return shared;
            }

            clone(){
                let dm = new DataMap([], this.pool);
                dm.updateFrom(this, true);
                return dm;
            }

            /**
             * copy shared values from the other map into this one.
             * @param otherMap
             * @param useAll {bool}
             * @param merge {bool} if true (default), new data is combined with old data. So fields can be added but not deleted.
             */
            updateFrom(otherMap, useAll = false, merge = true) {
                if (otherMap.pool !== this.pool) {
                    console.log(error('attempt to merge data from wrong pool', {
                        map: this,
                        otherMap
                    }))
                }

                otherMap.forEach((value, key) => {
                    if ((this.has(key))) {
                        let merged = merge ? Object.assign({}, this.get(key), value): value;
                        this.set(key, merged);
                    } else if (useAll) {
                        this.set(key, value);
                    }
                });
                return this;
            }
        }
    });
}
