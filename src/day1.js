'use strict';

const file = require('./utils/file');

const findDuplicateFrequency = (frequencyChanges) => {
    let index = 0;
    let cumulativeFrequency = 0;
    let cumulativeFrequencies = [cumulativeFrequency];

    while (true) {
        cumulativeFrequency = cumulativeFrequency + frequencyChanges[index % frequencyChanges.length];

        if (cumulativeFrequencies.includes(cumulativeFrequency)) {
            return cumulativeFrequency;
        }

        cumulativeFrequencies.push(cumulativeFrequency);
        index++;
    }
};

try {
    const frequencyChanges = file.readNumericInputs('day1');
    
    const endFrequency = frequencyChanges.reduce((total, change) => total + change, 0);
    console.log('End frequency: ' + endFrequency);

    const firstDuplicateFrequency = findDuplicateFrequency(frequencyChanges);
    console.log('First duplicate frequency: ' + firstDuplicateFrequency);
} catch (err) {
    console.log(err);
}
