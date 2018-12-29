'use strict';

const datetime = require('./utils/datetime');
const file = require('./utils/file');

const parseLogEntries = (rawLogEntries) => {
    const logEntryRegex = /^\[(.*)\]\s+(.*)$/;
    const logEntries = rawLogEntries.map((rawLogEntry) => {
        const logEntryMatches = logEntryRegex.exec(rawLogEntry);
        if (logEntryMatches.length < 3) {
            throw 'Invalid input';
        }
        return {
            datetime: datetime.parseDatetime(logEntryMatches[1]),
            event: logEntryMatches[2]
        };
    });

    return logEntries.sort((logEntry, otherLogEntry) => {
        return datetime.compareDatetimes(logEntry.datetime, otherLogEntry.datetime);
    });
};

const determineGuardsSleepPeriods = (logEntries) => {
    const addSleepPeriod = (guardsSleepPeriods, guardId, fallAsleepDatetime, wakeUpDatetime) => {
        if (!guardId || !fallAsleepDatetime) {
            throw 'Invalid order of log entries';
        }

        const sleepPeriod = {
            start: fallAsleepDatetime,
            end: wakeUpDatetime
        };
        if (!guardsSleepPeriods.hasOwnProperty(guardId)) {
            guardsSleepPeriods[guardId] = [sleepPeriod];
        } else {
            const currentGuardsSleepPeriods = guardsSleepPeriods[guardId];
            currentGuardsSleepPeriods.push(sleepPeriod);
            guardsSleepPeriods[guardId] = currentGuardsSleepPeriods;
        }
        return guardsSleepPeriods;
    }

    const beginsShiftRegex = /^Guard #(\d+) begins shift$/;
    return logEntries.reduce((currentInfoAndSleepPeriods, logEntry) => {
        if (beginsShiftRegex.test(logEntry.event)) {
            const beginsShiftMatches = beginsShiftRegex.exec(logEntry.event);
            currentInfoAndSleepPeriods.currentGuardId = beginsShiftMatches[1];
            currentInfoAndSleepPeriods.currentFallAsleepDatetime = null;
        } else if (logEntry.event === 'falls asleep') {
            currentInfoAndSleepPeriods.currentFallAsleepDatetime = logEntry.datetime;
        } else if (logEntry.event === 'wakes up') {
            currentInfoAndSleepPeriods.guardsSleepPeriods = addSleepPeriod(currentInfoAndSleepPeriods.guardsSleepPeriods,
                currentInfoAndSleepPeriods.currentGuardId,
                currentInfoAndSleepPeriods.currentFallAsleepDatetime,
                logEntry.datetime);
            currentInfoAndSleepPeriods.currentFallAsleepDatetime = null;
        } else {
            throw 'Invalid log entry';
        }
        return currentInfoAndSleepPeriods;
    }, {
        currentGuardId: null,
        currentFallAsleepDatetime: null,
        guardsSleepPeriods: {}
    }).guardsSleepPeriods;
};

const findMinuteWithMostTimesAsleep = (sleepPeriods) => {
    const timesAsleepPerMinute = sleepPeriods.reduce((cumulativeTimesAsleepPerMinute, sleepPeriod) => {
        for (let i = sleepPeriod.start.minute; i < sleepPeriod.end.minute; i++) {
            if (!cumulativeTimesAsleepPerMinute.hasOwnProperty(i)) {
                cumulativeTimesAsleepPerMinute[i] = 1;
            } else {
                cumulativeTimesAsleepPerMinute[i]++;
            }
        }
        return cumulativeTimesAsleepPerMinute;
    }, {});

    const minutesWithATimeAsleep = Object.keys(timesAsleepPerMinute);
    const minuteWithMostTimesAsleep = minutesWithATimeAsleep.reduce((currentMinuteWithMostTimesAsleep, minute) => {
        return timesAsleepPerMinute[minute] > timesAsleepPerMinute[currentMinuteWithMostTimesAsleep] ?
            minute :
            currentMinuteWithMostTimesAsleep;
    }, minutesWithATimeAsleep[0]);

    return {
        minute: minuteWithMostTimesAsleep,
        timesAsleep: timesAsleepPerMinute[minuteWithMostTimesAsleep]
    }
}

const calculateStrategyOneIdTimesMinute = (guardsSleepPeriods) => {
    const guardIds = Object.keys(guardsSleepPeriods);
    const guardIdsTotalSleepTime = guardIds.reduce((cumulativeGuardIdsTotalSleepTime, guardId) => {
        const sleepPeriods = guardsSleepPeriods[guardId];
        cumulativeGuardIdsTotalSleepTime[guardId] = sleepPeriods.reduce((cumulativeSleepTime, sleepPeriod) => {
            return cumulativeSleepTime + datetime.getTimeDifferenceInMinutes(sleepPeriod.start, sleepPeriod.end);
        }, 0);
        return cumulativeGuardIdsTotalSleepTime;
    }, {});
    
    const guardIdWithMostSleep = guardIds.reduce((currentGuardIdWithMostSleep, guardId) => {
        return guardIdsTotalSleepTime[guardId] > guardIdsTotalSleepTime[currentGuardIdWithMostSleep] ?
        guardId :
        currentGuardIdWithMostSleep;
    }, guardIds[0]);
    
    const minuteWithMostTimesAsleep = findMinuteWithMostTimesAsleep(guardsSleepPeriods[guardIdWithMostSleep]).minute;
    
    return guardIdWithMostSleep * minuteWithMostTimesAsleep;
};

const calculateStrategyTwoIdTimesMinute = (guardsSleepPeriods) => {
    const guardIds = Object.keys(guardsSleepPeriods);
    const guardIdsWithMinuteMostTimesAsleep = guardIds.reduce((cumulativeGuardIdsWithMinuteMostTimesAsleep, guardId) => {
        cumulativeGuardIdsWithMinuteMostTimesAsleep[guardId] = findMinuteWithMostTimesAsleep(guardsSleepPeriods[guardId]);
        return cumulativeGuardIdsWithMinuteMostTimesAsleep;
    }, {});

    const guardIdWithMinuteMostTimesAsleep = guardIds.reduce((currentGuardIdWithMinuteMostTimesAsleep, guardId) => {
        return guardIdsWithMinuteMostTimesAsleep[guardId].timesAsleep > guardIdsWithMinuteMostTimesAsleep[currentGuardIdWithMinuteMostTimesAsleep].timesAsleep ?
            guardId :
            currentGuardIdWithMinuteMostTimesAsleep;
    }, guardIds[0]);

    return guardIdWithMinuteMostTimesAsleep * guardIdsWithMinuteMostTimesAsleep[guardIdWithMinuteMostTimesAsleep].minute;
};

try {
    const rawLogEntries = file.readStringInputs('day4');
    const logEntries = parseLogEntries(rawLogEntries);
    const guardsSleepPeriods = determineGuardsSleepPeriods(logEntries);

    const strategyOneGuardIdTimesMinute = calculateStrategyOneIdTimesMinute(guardsSleepPeriods);
    console.log('Strategy one guard ID times minute most slept: ' + strategyOneGuardIdTimesMinute);

    const strategyTwoGuardIdTimesMinute = calculateStrategyTwoIdTimesMinute(guardsSleepPeriods);
    console.log('Strategy two guard ID times minute most slept: ' + strategyTwoGuardIdTimesMinute);
} catch (err) {
    console.log(err);
}
