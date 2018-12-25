'use strict';

const fs = require('fs');

const readStringInputs = (fileName) => {
    const inputs = fs.readFileSync('inputs/' + fileName + '.txt', 'utf-8');
    
    return inputs.toString().split('\n')
        .map((input) => input.trim())
        .filter((input) => input);
}

const readNumericInputs = (fileName) => {
    return readStringInputs(fileName)
        .map((input) => parseInt(input))
        .filter((input) => !isNaN(input));
}

module.exports = {
    readStringInputs: readStringInputs,
    readNumericInputs: readNumericInputs
};
