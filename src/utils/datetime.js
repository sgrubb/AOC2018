'use strict';

const parseDatetime = (datetimeString) => {
    const datetimeRegex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;
    const datetimeMatches = datetimeRegex.exec(datetimeString);
    if (datetimeMatches.length < 6) {
        throw 'Invalid time format';
    }
    return {
        year: parseInt(datetimeMatches[1]),
        month: parseInt(datetimeMatches[2]),
        day: parseInt(datetimeMatches[3]),
        hour: parseInt(datetimeMatches[4]),
        minute: parseInt(datetimeMatches[5])
    };
}

const compareDatetimes = (datetime, otherDatetime) => {
    const isEqual = datetime.year === otherDatetime.year &&
        datetime.month === otherDatetime.month &&
        datetime.day === otherDatetime.day &&
        datetime.hour === otherDatetime.hour &&
        datetime.minute === otherDatetime.minute;

    const isAfter = datetime.year > otherDatetime.year || (datetime.year === otherDatetime.year &&
        (datetime.month > otherDatetime.month || (datetime.month === otherDatetime.month &&
        (datetime.day > otherDatetime.day || (datetime.day === otherDatetime.day &&
        (datetime.hour > otherDatetime.hour || (datetime.hour === otherDatetime.hour &&
        datetime.minute > otherDatetime.minute)))))));

    return isEqual ? 0 : (isAfter ? 1 : -1);
};

const compareTimes = (time, otherTime) => {
    const isEqual = time.hour === otherTime.hour &&
        time.minute === otherTime.minute;

    const isAfter = time.hour > otherTime.hour || (time.hour === otherTime.hour &&
        time.minute > otherTime.minute);

    return isEqual ? 0 : (isAfter ? 1 : -1);
};

const getTimeDifferenceInMinutes = (startTime, endTime) => {
    const timeComparison = compareTimes(startTime, endTime);
    if (timeComparison === 0) {
        return 0;
    } else if (timeComparison > 0) {
        return ((23 - startTime.hour) * 60) + (60 - startTime.minute) +
            (endTime.hour * 60) + endTime.minute;
    } else {
        return ((endTime.hour - startTime.hour) * 60) + (endTime.minute - startTime.minute);
    }
};

module.exports = {
    parseDatetime: parseDatetime,
    compareDatetimes: compareDatetimes,
    compareTimes: compareTimes,
    getTimeDifferenceInMinutes: getTimeDifferenceInMinutes
};
