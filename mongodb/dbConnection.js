const mongoose = require('mongoose');

const mongooseConnection = {

    connect: () => {
        mongoose.connect(process.env.MONGODB_URI);
        // mongoose.connect("mongodb://localhost/mp3player");
        mongoose.connection.once('open', () => {
            console.log("mongodb connection established");
        }).on('error', (err) => {
            console.log("mongodb connection failed", err);
        })
    }
}

module.exports = mongooseConnection;
