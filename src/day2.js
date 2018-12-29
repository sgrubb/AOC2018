'use strict';

const file = require('./utils/file');

const calculateChecksum = (boxIds) => {
    const initialDuplicateCounts = {
        '2': 0,
        '3': 0
    };
    const numbersOfDuplicatesToTrack = Object.keys(initialDuplicateCounts);

    const findDuplicateLetters = (boxId) => {
        const letters = Array.from(boxId);
    
        const letterCounts = letters.reduce((cumulativeLetterCounts, letter) => {
            if (!cumulativeLetterCounts.hasOwnProperty(letter)) {
                cumulativeLetterCounts[letter] = 1;
            } else {
                cumulativeLetterCounts[letter]++;
            }
            return cumulativeLetterCounts;
        }, {});
    
        const counts = Object.values(letterCounts);
        const hasDuplicates = {}
        numbersOfDuplicatesToTrack.forEach((number) => hasDuplicates[number] = counts.includes(parseInt(number)));
    
        return hasDuplicates;
    };

    const duplicateCounts = boxIds.reduce((cumulativeDuplicateCounts, boxId) => {
        const hasDuplicateLetters = findDuplicateLetters(boxId);
        numbersOfDuplicatesToTrack.forEach((number) => {
            if (hasDuplicateLetters[number]) {
                cumulativeDuplicateCounts[number]++;
            }
        });
        return cumulativeDuplicateCounts;
    }, initialDuplicateCounts);

    return Object.values(duplicateCounts).reduce((total, number) => total * number, 1);
};

const findSimilarIdsCommonLetters = (boxIds) => {
    const getCommonLetters = (boxId, otherBoxId) => {
        const idLetters = Array.from(boxId);
        const otherIdLetters = Array.from(otherBoxId);

        return idLetters.reduce((commonLetters, letter, index) => {
            if (letter === otherIdLetters[index]) {
                commonLetters += letter;
            }
            return commonLetters;
        }, '');
    };

    return boxIds.reduce((similarIdCommonLetters, boxId, index) => {
        if (!similarIdCommonLetters) {
            const otherBoxIds = boxIds.slice(index);
            similarIdCommonLetters = otherBoxIds.reduce((idCommonLetters, otherBoxId) => {
                if (!idCommonLetters) {
                    const commonLetters = getCommonLetters(boxId, otherBoxId);
                    if (boxId.length - commonLetters.length === 1) {
                        idCommonLetters = commonLetters;
                    }
                }
                return idCommonLetters;
            }, null);
        }
        return similarIdCommonLetters;
    }, null);
};

try {
    const boxIds = file.readStringInputs('day2');

    const checksum = calculateChecksum(boxIds);
    console.log('Checksum: ' + checksum);

    const commonLetters = findSimilarIdsCommonLetters(boxIds);
    console.log('Common letters: ' + commonLetters);
} catch (err) {
    console.log(err);
}
