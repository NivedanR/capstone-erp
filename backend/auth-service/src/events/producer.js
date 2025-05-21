// const { producer } = require('../config/constants');

// const sendUserRegisteredEvent = async (userData) => {
//   await producer.connect();
//   await producer.send({
//     topic: process.env.KAFKA_TOPIC,
//     messages: [{ value: JSON.stringify(userData) }]
//   });
//   await producer.disconnect();
// };

// module.exports = {
//   sendUserRegisteredEvent
// };
