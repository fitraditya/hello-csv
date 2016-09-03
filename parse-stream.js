// 0. Please use readline (https://nodejs.org/api/readline.html) to deal with per line file reading
// 1. Then use the parse API of csv-parse (http://csv.adaltas.com/parse/ find the Node.js Stream API section)

'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const readline = require('readline');
const helper = require('./helper');

function parseStream() {
    let readFile = readline.createInterface({
        input: fs.createReadStream(__dirname + '/sample.csv')
    });

    let index = 0
    readFile.on('line', function eachLine(line) {
        if (index++ == 0) {
            return;
        }

        parse(line, function transformEachLine(err, parsed) {
            // Since it has only one row, let's use index 0 to obtain the data
            let data = parsed[0][0] + ' ' + parsed[0][1];

            helper.sendSms(data, function afterSending(err, sendingStatus) {
                let lineToLog;
                if (err) {
                    debug(err.message);
                    return;
                }

                lineToLog = {
                    sendingStatus,
                    data,
                };

                helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
                    if (err) {
                        debug(err.message);
                        return;
                    }
                });
            });
        });
    });

    readFile.on('close', function endFile() {
        debug('EOF');
    });
}

parseStream();
