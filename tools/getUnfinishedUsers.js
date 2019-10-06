// Nova Trauben
// Script for getting registers that didnt finish signing up
// run with 'node getUnfinishedUsers.js'


const Mongoose = require('mongoose');
const Fs = require('fs');
const Users = require('../app/server/models/User');
const CliOptions = ['file', "copy", 'help'];

/**
 * Way of parsing args from cli
 */

let args = process.argv;
args = {
    "filename": args[1].split('/'),
    "peram": args[2]
};
if (!CliOptions.includes(args.peram)) {
    console.log("Script for getting registers that didnt finish signing up\n\n");
    console.log("Invalid Option");
    console.log("Please run with either file, paste, or help");
    console.log("example: 'node getUnfinishedUsers file");
    console.log("OPTIONS- \n        'file'- output file ready to be copied into your email client");
    console.log("        'copy'- return output straight to your terminal");
    process.exit();
} else {
    getUnfinishedUsers(format = args.peram)
} // end cli parser

/**
 * Make sure you have a .env file in this directory with 'DB_READER = xxx" being
 * a full connection string
 * example:
 * mongodb+srv://<userWithReadPermissions>:<password@cluster0-chhdr.mongodb.net/admin?retryWrites=true&w=majority
 */


const DotEnv = require('dotenv').config();
if (!process.env.DB_READER) {
    console.log("ERROR\n" +
        "Make sure you have a .env file in this directory with 'DB_READER = xxx\" being a full connection string\n" +
        "Example:\n" +
        "mongodb://<userWithReadPermissions>:<password@cluster0-shard-00-00-chhdr.mongodb.net:27017,cluster0-shard-" +
        "00-01-chhdr.mongodb.net:27017,cluster0-shard-00-02-chhdr.mongodb.net:27017/<DB_NAME>?ssl=true&replicaSet=Cluster" +
        "0-shard-0&authSource=admin&retryWrites=true&w=majority");
    process.exit()
}

Mongoose.connect(process.env.DB_READER, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true  // only here so it suppresses a dep warning
})
    .then(e =>
        console.log('Connected to DB')
    );

function getUnfinishedUsers(format = "paste", file = __dirname + "/exports/unfinishedUsers.txt") {
    /**
     * CLI script for exporting users that haven't completed registration
     *
     * @param format=emailReadyStdout {string} - Type of data you want to export from function
     *                                   - If "emailReady", will return users separated by ';'
     *                                   - so you can copy and paste straight into your email to send
     *                                   - if "file", makes a new out file ready for your email
     */
    const unfinishedUsers = [];
    Users.find({'status.completedProfile': false},
        function(err, docs) {
            {
                if (err) {
                    return "Try this connection string instead" +
                        "@cluster0-shard-00-00-chhdr.mongodb.net:27017,cluster0-shard-00-01-chhdr.mongodb.net:27017,cluster0-" +
                        "shard-00-02-chhdr.mongodb.net:27017/<DATABASE_NAME>?ssl=true&replicaSet=Cluster0-shard-0&authSource=" +
                        "admin&retryWrites=true&w=majority"
                }
                for (let i = 0; i < docs.length; i++) {
                    unfinishedUsers.push(docs[i].email);
                }

                if (format === 'copy') {
                    unfinishedUsers.forEach(function(user) {
                        console.log(user + ";")
                    });
                    process.exit();
                } // end copy

                if (format === "file") {
                    let exportString = "";
                    unfinishedUsers.forEach(function(user) {
                        exportString = exportString + user + ";\n"
                    });
                    Fs.writeFile(file, exportString, (err) => {
                        if (err) throw err;
                        console.log(`exported file to ${__dirname}/${file}`);
                        process.exit()
                    })
                } // end file
            }
        })
}