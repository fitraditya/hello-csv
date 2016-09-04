// please use promise approach to fight the naive one in parse-callback.js

'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

function parsePromise() {
    fs.readFile(__dirname + '/sample.csv', function thenParse(err, loadedCsv) {
        parse(loadedCsv, function transformEachLine(err, parsed) {
            let lineParsed = Promise.all(parsed.map(function eachLine(data, index) {
                return new Promise(function eachLinePromise(resolve, reject) {
                    if (index > 0) {
                        let line = data[0] + ' ' + data[1];
                        resolve(line);
                    } else {
                        reject(true);
                    }
                }).then(function sendSms(data) {
                    return new Promise(function sendSmsPromise(resolve, reject) {
                        helper.sendSms(data, function afterSending(err, sendingStatus) {
                            if (err) {
                                debug(err.message);
                                reject(err.message);
                            } else {
                                let lineToLog = {
                                    sendingStatus,
                                    data,
                                };
                                resolve(lineToLog);
                            }
                        });
                    }).then(function logToS3(data) {
                        return new Promise(function logToS3Promise(resolve, reject) {
                            helper.logToS3(data, function afterLogging(err, loggingStatus) {
                                if (err || !data) {
                                    debug(err.message);
                                    reject(err.message);
                                } else {
                                    resolve(data);
                                }
                            });
                        });
                    });
                });
            }));

            lineParsed.then(function endPromise(data) {
                debug('Done');
            });
        });
    });
}

parsePromise();
