import _ from 'lodash'

// Edges only pll (EPLL)
export const Epll = {
    simple: ['U', 'H', 'Z'],
    detailed: ['Ua', 'Ub', 'H', 'Z']
}

// Corners only pll (CPLL)
export const Cpll = {
    simple: ['A', 'E'],
    detailed: ['Aa', 'Ab', 'E']
}

// Two adjacent corners + 2 edges
export const AdjacentPll = {
    simple: ['J', 'T', 'R', 'F'],
    detailed: ['Ja', 'Jb', 'T', 'Ra', 'Rb', 'F']
}

// Two diagonal corners + 2 edges
export const DiagonalPll = {
    simple: ['V', 'N', 'Y'],
    detailed: ['V', 'Na', 'Nb', 'Y']
}

// Cycling three corners and three edges
export const CyclingPll = {
    simple: ['G'],
    detailed: ['Ga', 'Gb', 'Gc', 'Gd']
}


// Corners have only 2 colors:
//  - this tells me that all corners are correct / that is there are at least lights on every side, could be a 3-bar but at least lights
//  - This is a EPLL case since all corners are solved (EPLL = U|H|Z)
// Corners have 3 colors:
//  - Somewhere on the cube, on exactly one side there is a light or a 3-bar, and only on one side
//  - This is therefore not an EPLL and not V|Y|N since those have diagonal corners
//  - Hence this is one of A|R|G|T|F|J
// Corners have 4 colors
//  - this tells me that we have a diagonal corner swap, thus no lights anywhere, and no 3-bar anywhere either
//  - Hence this is one of E|Y|V|N
const getCasesByCornerColorCount = (count, detailed = false) => {
    switch (count) {
        case 2: {
            if (detailed) return Epll.detailed
            return Epll.simple
            // U|H|Z
        }
        case 3: {
            if (detailed) return ['Aa', 'Ab', ...AdjacentPll.detailed, ...CyclingPll.detailed]
            return ['A', ...AdjacentPll.simple, ...CyclingPll.simple]
            // A|R|G|T|F|J
        }
        case 4: {
            if (detailed) return ['E', ...DiagonalPll.detailed]
            return ['E', ...DiagonalPll.simple]
            // E|Y|V|N
        }
    }
    return []
}

const getCasesByEdgeRelations = (solved, reversed, opposite, detailed = false) => {
    if (solved) {
        if (detailed) {
            return [
                ...Cpll.detailed,
                ...CyclingPll.detailed,
                'Ua', 'Ub', 'H',
                'Ja', 'Jb', 'Ra', 'Rb',
                'V', 'Y']
        }

        return [
            ...Cpll.simple,
            ...CyclingPll.simple,
            'U', 'H',
            'J', 'R',
            'V', 'Y']
    } else if (reversed) {
        if (detailed) {
            return [
                'Ua', 'Ub',
                'Z',
                ...AdjacentPll.detailed,
                ...CyclingPll.detailed,
                ...DiagonalPll.detailed]
        }
        return [
            'U',
            'Z',
            ...AdjacentPll.simple,
            ...CyclingPll.simple,
            ...DiagonalPll.simple]
    } else if (opposite) {
        if (detailed) {
            return [
                'Ua', 'Ub',
                'Ja', 'Jb', 'Ra', 'Rb',
                ...CyclingPll.detailed,
                'V', 'Y']
        }
        return [
            'U',
            'J', 'R',
            ...CycllingPll.simple,
            'V', 'Y']
    }
}

const getCasesByCornerColorCountAndEdgeRelations = (count, solved, reversed, opposite, detailed = false) => {
    const cornerCases = getCasesByCornerColorCount(count, detailed)
    const edgeCases = getCasesByEdgeRelations(solved, reversed, opposite, detailed)
    return _.intersection(cornerCases, edgeCases)
}

// Corners only have 2 colors:l
//  - Bar on all sides
// Corners have 3 colors:
//  - Bar on opposite side to the side that has opposite corners
// Corners have 4 colors:
//  - No bar anywhere
// fl, fr, rf, rb => oneOf('F', 'R', 'B', 'L')
const getBarLocationsByCornerColors = (fl, fr, rf, rb) => {
    // All corners solved => bar on all sides
    if (fl === fr && rf === rb) return ['F', 'R', 'B', 'L']

    // Bar only on front
    if (fl === fr) return ['F']

    // Bar only on right
    if (rf === rb) return ['R']

    // 4 colors => no bar
    if (fl !== rf && fl !== rb && fr !== rf && fr !== rb) {
        return []
    }

    const colors = { 'F': 1, 'R': 2, 'B': 3, 'L': 4 }

    // Opposite colors on front
    if (colors[fl] % 2 === colors[fr] % 2) return ['B']

    if (colors[rf] % 2 === colors[rb] % 2) return ['L']

    throw 'This should not be possible'
}

export default getPllFromColors = (fl, fc, fr, rf, rc, rb) => {
    const colors = { 'F': 1, 'R': 2, 'B': 3, 'L': 4 }

    // First see if already solved
    // if (fl === fc && fl === fr && rf === rc && rf === rb) return ''

    // Good to use this to calculate all the pll cases given a set of colors
    // But for production it is probably faster to have a dictionary with
    // all 84 possibilites, but I can use this function to generate the
    // dictionary
    const patterns = getPatternsFromColors(fl, fc, fr, rf, rc, rb)
    // // First see if the case contains a 3-Bar
    // if (fl === fc && fl === fr || rf === rc && rf === rb) {
    //     // What about headlights
    // }

    return patterns

    // if 2 3bars
    if (patterns.threeBar.count === 2) {
        return 'Solved'    
    }

    // if 3bar
    if (patterns.threeBar.count === 1) {
        // If headlights (U)
        //   if threebar left => Ua (headlights contain adjacent) threebar: front | Ub (headlights contain opposite) threebar: right
        //   Ua (headlights contain opposite) threebar: right | Ub (headlights contain adjacent) threebar: right
        // If twobar (J)
        //   if bar left => Ja (twobar inner) bar: front | Jb (twobar outer) bar: front
        //   Ja (twobar outer) bar: right | Jb (twobar inner) bar: front
        // F bar: (threebar left ? front : right)
        if (patterns.headligths.count === 1) {
            if (patterns.threeBar.left) {
                if (patterns.headligths.right.adjacent) {
                    return { case: 'U', subCase: 'Ua', bar: 'front' }
                } else {
                    return { case: 'U', subCase: 'Ub', bar: 'front' }
                }
            } else {
                if (patterns.headligths.left.adjacent) {
                    return { case: 'U', subCase: 'Ub', bar: 'right' }
                } else {
                    return { case: 'U', subCase: 'Ua', bar: 'right' }
                }
            }
        }
        if (patterns.twoBar.count === 1) {
            if (patterns.threeBar.left) {
                if (patterns.twoBar.right.outer) {
                    return { case: 'J', subCase: 'Jb', bar: 'front' }
                } else {
                    return { case: 'J', subCase: 'Ja', bar: 'front' }
                }
            } else {
                if (patterns.twoBar.left.outer) {
                    return { case: 'J', subCase: 'Ja', bar: 'right' }
                } else {
                    return { case: 'J', subCase: 'Jb', bar: 'right' }
                }
            }
        }
        return { case: 'F', bar: patterns.threeBar.left ? 'front' : 'right' }
    }

    // if 2 lights
    if (patterns.headligths.count === 2) {
        // if 2-color 6-checker => Z
        // if 2:1 pattern (and 3 colors) (U)
        //   if left => Ub bar: (left lights adjacent ? back : left)
        //   Ua bar: (right lights adjacent ? left : back)
        // if lights contain adjacent (and 4 colors) => Z
        // (lights contain opposite (and 4 colors)) => H 
        if (patterns.checkers.size === 6) {
            return { case: 'Z', bar: 'none' }
        }
        if (patterns.checkers.left.half) {
            let bar
            if (patterns.headligths.left.adjacent) {
                bar = 'back'
            } else {
                bar = 'left'
            }
            return { case: 'U', subCase: 'Ub', bar }
        }
        if (patterns.checkers.right.half) {
            let bar
            if (patterns.headligths.right.adjacent) {
                bar = 'left'
            } else {
                bar = 'back'
            }
            return { case: 'U', subCase: 'Ua', bar }
        }
        if (patterns.headligths.left.adjacent) {
            return { case: 'Z', bar: 'none' }
        }
        if (!patterns.headligths.left.adjacent) {
            return { case: 'H', bar: 'none' }
        }
    }

    // if lights + 2bar
    if (patterns.headligths.count === 1 && patterns.twoBar.count === 1) {
        // if bar inside
        //   if 3 colors => T lights: (lights left ? front : right)
        //   (4 colors) Ra (lights left) lights: front | Rb (lights right) lights: right
        // (outer bar)
        //   if 3 colors => Aa (lights left) lights: front | Ab (lights right) lights: right
        //   (4 colors) Ga (lights left) lights: front | Gc (lights right) lights: right
        if (patterns.headligths.left.has) {
            if (patterns.twoBar.right.inner) {
                if (patterns.colorCount.total === 3) {
                    return { case: 'T', lights: 'front' }
                }
                return { case: 'R', subCase: 'Ra', lights: 'front' }
            } else {
                if (patterns.colorCount.total === 3) {
                    return { case: 'A', subCase: 'Aa', lights: 'front' }
                }
                return { case: 'G', subCase: 'Ga', lights: 'front' }
            }
        } else {
            if (patterns.twoBar.left.inner) {
                if (patterns.colorCount.total === 3) {
                    return { case: 'T', lights: 'right' }
                }
                return { case: 'R', subCase: 'Rb', lights: 'right' }
            } else {
                if (patterns.colorCount.total === 3) {
                    return { case: 'A', subCase: 'Ab', lights: 'right' }
                }
                return { case: 'G', subCase: 'Gc', lights: 'right' }
            }
        }
    }

    // if lone lights
    if (patterns.headligths.count === 1) {
        // if checker === 5 => Ra (right) lights: right | Rb (left) lights: front
        // if checker === 4 => Ga (right) lights: right | Gc (left) lights: front
        // if lights opposite => Gb (left) lights: front | Gd (right) lights: right
        // => Aa (right) lights: right | Ab (left) lights: front (checkers.half)
    }

    // if double twobars
    if (patterns.twoBar.count === 2) {
        // If both on outside => Y
        // Both inside
        //  bookends => Aa (opposite on right) lights: back | Ab (opposite on left) lights left
        //  V
        // (one outside && one inside)
        //  bookends => Ja (twobar on left is outside) threebar: left | Jb (twobar on right is outside) threebar: back
        //  Na (twobar on right is outside) | Nb (twobar on left is outside)
    }

    // If twobar on outside
    {
        // If no bookends => V
        // if next to bookend and twobar is same color (3 colors)
        //   if same color is adjacent to twobar (or bookends)
        //     => Ra (bar on left) lights: left | Rb (bar on right) lights: back
        //   if opposite to twobar (or bookends)
        //     => Gb (twobar on right) lights: left | Gd (twobar on left) lights: back
        // (4 colors)
        //   if (next to twobar is adjacent) => T lights: (twobar on left ? left : back)
        //   (next is opposite)
        //     => Aa (twobar on left) lights: back | Ab (twobar on right) lights: left
    }

    // If twobar on inside
    {
        // if no bookends => Y
        // if (bookends|next to twobar adjacent to twobar)
        //   => Ga (twobar on left) lights: left | Gc (twobar on right) lights: back
        // (opposite to twobar)
        //   => Gb (twobar on left) lights: back | Gd (twobar on right) lights: left
    }

    // if bookends
    if (patterns.bookends) {
        // if inner 4 checker => F bar: ()
        // if adj to bookends appears twice (outside color in checker)
        //   => Ra (inner 3 checker on left) lights: back | Rb (inner 3 checker on right) lights: left
        // (opposite to bookends appears twice (outside color in checker))
        //   => Ga (inner 3 checker on right) lights: back | Gc (inner 3 checker on left) lights: left
    }

    // if no bookends
    if (!patterns.bookends) {
        // if inner 4 checker => V
        // if outer checker => Y
        // (5 checker with opposite middle) => E
    }

    return patterns
}

const cubeColors = Object.freeze({
    Front: 1,
    Left: 2,
    Back: 3,
    Right: 4,
})

const colorRelation = Object.freeze({
    Adjacent: 1,
    Opposite: 2,
    Same: 3,
})

const twoBarPosition = Object.freeze({
    Inner: 1,
    Outer: 2,
})

const getPatternsFromColors = (fl, fc, fr, rf, rc, rb) => {
    const colors = Object.freeze({ 'F': 1, 'R': 2, 'B': 3, 'L': 4 })

    const frontSide = {
        solved: false,
        innerBar: false,
        outerBar: false,
        lights: false,
        color1: '',
        color2: '',
        color3: '',
    }

    const rightSide = {
        solved: false,
        innerBar: false,
        outerBar: false,
        lights: false,
        color1: '',
        color2: '',
        color3: '',
    }

    const patterns = {
        bookends: false,
        outerChecker: false,
        innerChecker: false,
        checkerBoard: false,
        fromFront: {
            checker: 0,
            oddChecker: false,
            middleChecker: false,
        },
        fromRight: {
            checker: 0,
            oddChecker: false,
            middleChecker: false,
        },
    }
    
    const colorCount = {
        total: 0,
        corners: 0,
        sides: 2,
    }

    const caseData = {
        cornersSolved: false,
        cornersAdjacent: false,
        cornersDiagonal: false,
        lightsOrSolvedSides: '',
        edgesSolved: false,
        edgesReversed: false,
        edgesOpposites: false,
        possibleCases: [],
    }

    frontSide.solved = fl === fc && fl === fr
    frontSide.innerBar = !frontSide.solved && fc === fr
    frontSide.outerBar = !frontSide.solved && fl === fc
    frontSide.lights = !frontSide.solved && fl === fr
    if (frontSide.solved) frontSide.color1 = fl
    if (frontSide.innerBar) {
        frontSide.color1 = fc
        frontSide.color2 = fl
    }
    if (frontSide.outerBar) {
        frontSide.color1 = fc
        frontSide.color2 = fr
    }
    if (frontSide.lights) {
        frontSide.color1 = fl
        frontSide.color2 = fc
    }
    if (frontSide.color1 === '') {
        frontSide.color1 = fl
        frontSide.color2 = fc
        frontSide.color3 = fr
    }

    rightSide.solved = rf === rc && rf === rb
    rightSide.innerBar = !rightSide.solved && rc === rf
    rightSide.outerBar = !rightSide.solved && rb === rc
    rightSide.lights = !rightSide.solved && rf === rb
    if (rightSide.solved) rightSide.color1 = rf
    if (rightSide.innerBar) {
        rightSide.color1 = rc
        rightSide.color2 = rb
    }
    if (rightSide.outerBar) {
        rightSide.color1 = rc
        rightSide.color2 = rf
    }
    if (rightSide.lights) {
        rightSide.color1 = rf
        rightSide.color2 = rb
    }
    if (rightSide.color1 === '') {
        rightSide.color1 = rf
        rightSide.color2 = rc
        rightSide.color3 = rb
    }

    let counter = { F: 0, L: 0, R: 0, B: 0 }

    counter[fl] = 1
    counter[fr] = 1
    counter[rf] = 1
    counter[rb] = 1

    colorCount.corners = _.sum(_.values(counter))

    counter[fc] = 1
    counter[rc] = 1

    colorCount.total = _.sum(_.values(counter))

    patterns.bookends = fl === rb
    patterns.checkerBoard = fl === fr && fl === rc && fc === rf && fc === rb
    patterns.outerChecker = !patterns.checkerBoard && fl === rc && fc === rb
    
    if (!patterns.checkerBoard && !patterns.outerChecker) {
        if (fl === fr && fc === rf) {
            patterns.fromFront.checker = 4
            if (fl === rc) {
                patterns.fromFront.checker += 1
            }
        } else if (rb === rf && rc === fr) {
            patterns.fromRight.checker = 4
            if (rb === fc) {
                patterns.fromRight.checker += 1
            }
        } else if (fc === rf && fr === rc) {
            patterns.innerChecker = true
        } else if (frontSide.lights && fl === rc) {
            patterns.fromFront.oddChecker = true
        } else if (rightSide.lights && rf === fc) {
            patterns.fromRight.oddChecker = true
        } else if (fl === rc && fl !== fr && fl % 2 === fr % 2 && fc === rf) {
            patterns.fromFront.middleChecker = true
        } else if (rb === fc && rb !== rf && rb % 2 === rf % 2 && rc === fr) {
            patterns.fromRight.middleChecker = true
        } else if (fc === rf) {
            patterns.fromFront.checker = 3
        } else if (rc === fr) {
            patterns.fromRight.checker = 3
        }
    }

    caseData.cornersSolved = colorCount.corners === 2
    caseData.cornersAdjacent = colorCount.corners === 3
    caseData.cornersDiagonal = colorCount.corners === 4

    if (caseData.cornersSolved) {
        caseData.lightsOrSolvedSides = 'All'
    } else if (caseData.cornersDiagonal) {
        caseData.lightsOrSolvedSides = 'None'
    } else if (caseData.cornersAdjacent) {
        if (frontSide.solved || frontSide.light) {
            caseData.lightsOrSolvedSides = 'Front'
        } else if (rightSide.solved || rightSide.light) {
            caseData.lightsOrSolvedSides = 'Right'
        } else if (fl % 2 === fr % 2) {
            caseData.lightsOrSolvedSides = 'Back'
        } else if (rf % 2 === rb % 2) {
            caseData.lightsOrSolvedSides = 'Left'
        }
    }

    caseData.possibleCases = getCasesByCornerColorCount(colorCount.corners, true)

    if (colors[fc] % 2 === colors[rc] % 2) {
        caseData.edgesOpposites = true
    } else if (colors[fc] + 1 === colors[rc]) {
        caseData.edgesSolved = true
    } else if (colors[rc] + 1 === colors[fc]) {
        caseData.edgesReversed = true
    } else if (colors[fc] === 4 && colors[rc] === 1) {
        caseData.edgesSolved = true
    } else if (colors[rc] === 4 && colors[fc] === 1) {
        caseData.edgesReversed = true
    }

    caseData.possibleCases =
        getCasesByCornerColorCountAndEdgeRelations(
            colorCount.corners,
            caseData.edgesSolved,
            caseData.edgesReversed,
            caseData.edgesOpposites,
            true)

    return {
        frontSide,
        rightSide,
        colorCount,
        patterns,
        caseData,
    }

    // const solvedSides = {
    //     left: false,
    //     right: false,
    //     count: 0
    // }

    // const bars = {
    //     left: {
    //         color: '',
    //         position: '',
    //         neighbourColor: '',
    //     },
    //     right: {
    //         color: '',
    //         position: '',
    //         neighbourColor: '',
    //     },
    //     count: 0,
    // }

    // const lights = {
    //     left: {
    //         color: '',
    //         containedColor: '',
    //     }
    // }

    // const result = {
    //     threeBar: {
    //         left: false,
    //         right: false,
    //         count: 0,
    //     },
    //     headligths: {
    //         left: {
    //             has: false,
    //             adjacent: false,
    //         },
    //         right: {
    //             has: false,
    //             adjacent: false,
    //         },
    //         count: 0
    //     },
    //     twoBar: {
    //         left: {
    //             inner: false,
    //             outer: false,
    //             adjacent: false,
    //         },
    //         right: {
    //             inner: false,
    //             outer: false,
    //             adjacent: false,
    //         },
    //         count: 0,
    //     },
    //     bookends: false,
    //     colorCount: {
    //         total: 0,
    //         corners: 0,
    //         edges: 2
    //     },
    //     checkers: {
    //         inner: false,
    //         outer: false,
    //         left: {
    //             regular: false,
    //             half: false,
    //             oppositeMiddle: false,
    //         },
    //         right: {
    //             regular: false,
    //             half: false,
    //             oppositeMiddle: false,
    //         },
    //         size: 0,
    //     }
    // }

    // if (fl === fc && fl === fr) {
    //     result.threeBar.left = true
    //     result.threeBar.count += 1
    // }

    // if (rf === rc && rf === rb) {
    //     result.threeBar.right = true
    //     result.threeBar.count += 1
    // }

    // if (!result.threeBar.left && fl === fr) {
    //     result.headligths.left.has = true
    //     result.headligths.left.adjacent = colors[fl] % 2 !== colors[fc] % 2
    //     result.headligths.count += 1
    // }

    // if (!result.threeBar.right && rf === rb) {
    //     result.headligths.right.has = true
    //     result.headligths.right.adjacent = colors[rf] % 2 !== colors[rc] % 2
    //     result.headligths.count += 1
    // }

    // if (!result.threeBar.left && !result.headligths.left.has) {
    //     if (fl === fc) {
    //         result.twoBar.left.outer = true
    //         result.twoBar.left.adjacent = colors[fl] % 2 !== colors[fr] % 2
    //         result.twoBar.count += 1
    //     } else if (fr === fc) {
    //         result.twoBar.left.inner = true
    //         result.twoBar.left.adjacent = colors[fl] % 2 !== colors[fr] % 2
    //         result.twoBar.count += 1
    //     }
    // }

    // if (!result.threeBar.right && !result.headligths.right.has) {
    //     if (rb === rc) {
    //         result.twoBar.right.outer = true
    //         result.twoBar.right.adjacent = colors[rf] % 2 !== colors[rb] % 2
    //         result.twoBar.count += 1
    //     } else if (rf === rc) {
    //         result.twoBar.right.inner = true
    //         result.twoBar.right.adjacent = colors[rf] % 2 !== colors[rb] % 2
    //         result.twoBar.count += 1
    //     }
    // }

    // if (fl === rb) {
    //     result.bookends = true
    // }

    // let counter = { F: 0, L: 0, R: 0, B: 0 }

    // counter[fl] = 1
    // counter[fr] = 1
    // counter[rf] = 1
    // counter[rb] = 1

    // result.colorCount.corners = _.sum(_.values(counter))

    // counter[fc] = 1
    // counter[rc] = 1

    // result.colorCount.total = _.sum(_.values(counter))

    // if (result.headligths.left.has && fc === rf) {
    //     result.checkers.size = 4
    //     if (fr === rc) {
    //         result.checkers.size = 5
    //         if (fc === rb) {
    //             result.checkers.size = 6
    //         }
    //     }
    //     result.checkers.left.regular = true
    // }

    // if (result.headligths.right.has && rc === fr) {
    //     result.checkers.size = 4
    //     if (rf === fc) {
    //         result.checkers.size = 5
    //         if (rc === fl) {
    //             result.checkers.size = 6
    //         }
    //     }
    //     result.checkers.right.regular = true
    // }

    // // if (result.checkers.size === 0) {
    //     if (fl === rc && fc === rb) {
    //         result.checkers.outer = true
    //     } else if (fc === rf && fr === rc) {
    //         result.checkers.inner = true
    //     } else if (result.headligths.left.has && fl === rc) {
    //         result.checkers.left.half = true
    //     } else if (result.headligths.right.has && rb === fc) {
    //         result.checkers.right.half = true
    //     } else if (fl === rc && fc === rf && fl !== fr && colors[fl] % 2 === colors[fr] % 2) {
    //         result.checkers.left.oppositeMiddle = true
    //     } else if (rb === fc && rc === fr && rb !== rf && colors[rb] % 2 === colors[rf] % 2) {
    //         result.checkers.right.oppositeMiddle = true
    //     }
    // // }

    // return result
}

window.getPatternsFromColors = getPatternsFromColors
window.getCasesByCornerColorCount = getCasesByCornerColorCount
window.getBarLocationsByCornerColors = getBarLocationsByCornerColors
window.getPllFromColors = getPllFromColors
