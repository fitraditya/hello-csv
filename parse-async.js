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
            let index = 0;
            async.forEach(parsed, function eachLine(line) {
                line = line[0] + ' ' + line[1];

                if (index++ == 0) {
                    return;
                }

                async.waterfall([
                    function sendSms(callback) {
                        helper.sendSms(line, function afterSending(err, sendingStatus) {
                            let lineToLog;
                            if (err) {
                                callback(err.message);
                            }

                            lineToLog = {
                                sendingStatus,
                                line,
                            };
                            callback(null, lineToLog);
                        });
                    },

                    function logToS3(lineToLog, callback) {
                        helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
                            if (err) {
                                callback(err.message);
                            }
                        });
                    },
                ], function endWaterfall(err, result) {
                    if (err) {
                        debug(err.message);
                    }
                });
            });
        });
    });
}

parseAsync();
