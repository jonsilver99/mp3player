****************
Running this app
****************
To run localy:
    - at /mongodb/dbConnection.js, set mongoose.connect (line 6) to this: "mongoose.connect("mongodb://localhost/mp3player");"
    - at /package.json, set "start" to "webpack && nodemon server.js" (for dev mode)
    - run npm install (dependencies)

To run on hosted environment (heroku):
    - at /mongodb/dbConnection.js, set mongoose.connect (line 6) to this: "mongoose.connect(process.env.MONGODB_URI);"
    - at /package.json, set "start" to "node server.js"