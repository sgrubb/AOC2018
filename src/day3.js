'use strict';

const file = require('./utils/file');

const parseClaims = (rawClaims) => {
    const claimRegex = /^#(\d+)\s+@\s+(\d+),(\d+):\s+(\d+)x(\d+)$/;
    return rawClaims.map((rawClaim) => {
        const claimMatches = claimRegex.exec(rawClaim);
        if (claimMatches.length < 6) {
            throw 'Invalid input';
        }
        return {
            id: parseInt(claimMatches[1]),
            left: parseInt(claimMatches[2]),
            top: parseInt(claimMatches[3]),
            width: parseInt(claimMatches[4]),
            height: parseInt(claimMatches[5]),
        };
    });
};

const generateSquareInchCoord = (claim, i, j) => {
    const left = claim.left + i;
    const top = claim.top + j;
    return left + ',' + top;
};

const generateClaimedSquareInches = (claims) => {
    return claims.reduce((claimedSquares, claim) => {
        for (let i = 0; i < claim.width; i++) {
            for (let j = 0; j < claim.height; j++) {
                const coord = generateSquareInchCoord(claim, i, j);
                if (claimedSquares.hasOwnProperty(coord)) {
                    claimedSquares[coord]++;
                } else {
                    claimedSquares[coord] = 1;
                }
            }
        }
        return claimedSquares;
    }, {});
};

const calculateNumberOfContestedSquareInches = (claimedSquareInches) => {
    return Object.values(claimedSquareInches).reduce((numberOfContestedSquares, numberOfClaimsOnSquare) => {
        if (numberOfClaimsOnSquare > 1) {
            numberOfContestedSquares++;
        }
        return numberOfContestedSquares;
    }, 0);
};

const findUncontestedClaimId = (claims, claimedSquareInches) => {
    return claims.reduce((uncontestedClaimId, claim) => {
        if (!uncontestedClaimId) {
            let isUncontested = true;
            for (let i = 0; i < claim.width; i++) {
                for (let j = 0; j < claim.height; j++) {
                    const coord = generateSquareInchCoord(claim, i, j);
                    if (claimedSquareInches[coord] > 1) {
                        isUncontested = false;
                    }
                }
            }
            if (isUncontested) {
                uncontestedClaimId = claim.id;
            }
        }
        return uncontestedClaimId;
    }, null);
};

try {
    const rawClaims = file.readStringInputs('day3');
    const claims = parseClaims(rawClaims);

    const claimedSquareInches = generateClaimedSquareInches(claims);

    const numberOfContestedSquareInches = calculateNumberOfContestedSquareInches(claimedSquareInches);
    console.log('Number of contested square inches: ' + numberOfContestedSquareInches);

    const uncontestedClaim = findUncontestedClaimId(claims, claimedSquareInches);
    console.log('Uncontested claim ID: ' + uncontestedClaim);
} catch (err) {
    console.log(err);
}
