'use strict';

const fs = require('fs');

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
}

try {
    const inputs = fs.readFileSync('inputs/day1.txt', 'utf-8');
    
    const frequencyChanges = inputs.toString().split('\n')
        .map((input) => parseInt(input.trim()))
        .filter((change) => Number.isInteger(change));
    
    const endFrequency = frequencyChanges.reduce((total, change) => total + change, 0);

    console.log('End frequency: ' + endFrequency);

    const firstDuplicateFrequency = findDuplicateFrequency(frequencyChanges);

    console.log('First duplicate frequency: ' + firstDuplicateFrequency);
} catch (err) {
    console.log(err);
}
