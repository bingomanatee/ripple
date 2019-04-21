import {bottle} from "../dist";
import {inspect} from 'util';

export default async function () {
    let RestPool;
    let userPool;
    const b = bottle();
    RestPool = b.container.RestPool;

    userPool = new RestPool('user', {
        baseURL: 'http://localhost:9000/user',
        identityField: '_id',
        responseToData(response, impulse) {
            let data = response.data;
            switch (impulse.vector.name) {
                case 'getAll':
                    data = Object.values(data.docs);
                    break;
            }
            return data;
        }
    });
    const allImpulse = userPool.impulse('getAll');
    let signal = await allImpulse.send();

    while (signal.response.length) {
        const record = signal.response.pop();
        if (!(record && record._id)) return;
        await userPool.impulse('delete', record._id).send();
    }

    return {userPool};
};
