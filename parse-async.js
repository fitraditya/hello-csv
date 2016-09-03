// Please use async lib https://github.com/caolan/async

'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const async = require('async');
const parse = require('csv-parse');
const helper = require('./helper');

function parseAsync() {
    fs.readFile(__dirname + '/sample.csv', function thenParse(err, loadedCsv) {
        parse(loadedCsv, function transformEachLine(err, parsed) {
            async.forEach(parsed, function eachLine(line) {
                line = line[0] + ' ' + line[1];

                helper.sendSms(line, function afterSending(err, sendingStatus) {
                    let lineToLog;
                    if (err) {
                        debug(err.message);
                        return;
                    }

                    lineToLog = {
                        sendingStatus,
                        line,
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
    });
}

parseAsync();
