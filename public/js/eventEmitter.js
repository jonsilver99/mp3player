const eventEmitter = require('events');

const Emitter = new eventEmitter(); 

module.exports = Emitter;


// module.exports = {
//     emit: () => {
//         console.log('emitted');
//     }
// }