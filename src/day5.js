'use strict';

const file = require('./utils/file');

const getUnitOfOppositePolarity = (unit) => {
    const isLowercaseLetter = /^[a-z]$/.test(unit);
    const isUppercaseLetter = /^[A-Z]$/.test(unit);
    if (!(isLowercaseLetter || isUppercaseLetter)) {
        throw 'Invalid unit input';
    }
    return isLowercaseLetter ? unit.toUpperCase() : unit.toLowerCase();
};

const getReactedPolymer = (polymer) => {
    const willReact = (unit, lastUnit) => {
        return unit === getUnitOfOppositePolarity(lastUnit)
    };

    const units = Array.from(polymer);

    const lastUnitAndUnreactedUnits = units.reduce((currentLastUnitAndUnreactedUnits, unit) => {
        if (!currentLastUnitAndUnreactedUnits.lastUnit) {
            currentLastUnitAndUnreactedUnits.lastUnit = unit;
        } else {
            if (willReact(unit, currentLastUnitAndUnreactedUnits.lastUnit)) {
                currentLastUnitAndUnreactedUnits.lastUnit = null;
            } else {
                currentLastUnitAndUnreactedUnits.unreactedUnits += currentLastUnitAndUnreactedUnits.lastUnit;
                currentLastUnitAndUnreactedUnits.lastUnit = unit;
            }
        }
        return currentLastUnitAndUnreactedUnits;
    }, {
        lastUnit: null,
        unreactedUnits: ''
    });

    const unreactedUnits = lastUnitAndUnreactedUnits.lastUnit ?
        lastUnitAndUnreactedUnits.unreactedUnits + lastUnitAndUnreactedUnits.lastUnit :
        lastUnitAndUnreactedUnits.unreactedUnits;

    return unreactedUnits.length === polymer.length ? unreactedUnits : getReactedPolymer(unreactedUnits);
};

const findShortestReactedPolymerLength = (polymer) => {
    const unitTypes = Array.from(new Set(Array.from(polymer.toLowerCase())));

    return unitTypes.reduce((currentShortestReactedPolymerLength, unitType) => {
        const polymerWithUnitTypeRemoved = polymer.replace(new RegExp(unitType, 'gi'), '');
        const reactedPolymerLength = getReactedPolymer(polymerWithUnitTypeRemoved).length;
        return reactedPolymerLength < currentShortestReactedPolymerLength ? reactedPolymerLength : currentShortestReactedPolymerLength;
    }, Number.POSITIVE_INFINITY);
}

try {
    const polymer = file.readStringInputs('day5')[0];

    const reactedPolymer = getReactedPolymer(polymer);
    console.log('Reacted polymer length: ' + reactedPolymer.length);

    const shortestReactedPolymerLength = findShortestReactedPolymerLength(polymer);
    console.log('Shortest reacted polymer length: ' + shortestReactedPolymerLength);
} catch (err) {
    console.log(err);
}
