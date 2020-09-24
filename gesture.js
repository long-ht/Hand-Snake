(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const VIDEO_WIDTH = 500;
const VIDEO_HEIGHT = 500;
let loadStatus = false;
let left = document.getElementById("left");
let right = document.getElementById("right");
let up = document.getElementById("up");
let down = document.getElementById("down");
let leftGesture = undefined;
let rightGesture = undefined;
let upGesture = undefined;
let downGesture = undefined;
let predictions = undefined;

const upEvent = new Event('up');
const downEvent = new Event('down');
const leftEvent = new Event('left');
const rightEvent = new Event('right');
const loadedEvent = new Event('model loaded');

const similarity = require('compute-cosine-similarity');

function cosineDistanceMatching(poseVector1, poseVector2) {
    if (!poseVector1 || !poseVector2) {
        return 1;
    }
    let cosineSimilarity = similarity(poseVector1, poseVector2);
    let distance = 2 * (1 - cosineSimilarity);
    return Math.sqrt(distance);
}

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

const main = async () => {
    let video;
    try {
        video = await loadVideo();
    } catch (e) {
        throw new Error('Failed to load handpose model')
    }

    landmarksRealTime(video);
}

const landmarksRealTime = async (video) => {
    const model = await handpose.load();
    if (!loadStatus) {
        loadStatus = true;
        window.dispatchEvent(loadedEvent);
    }
    video.width = VIDEO_WIDTH;
    video.height = VIDEO_HEIGHT;

    async function frameLandmarks() {
        predictions = await model.estimateHands(video);
        if (predictions.length > 0) {

            const keypoints = predictions[0].landmarks;

            const gesture = []
            for (let i = 0; i < keypoints.length; i++) {
                gesture.push(keypoints[i][0])
                gesture.push(keypoints[i][1])
            }

            try {
                if (cosineDistanceMatching(gesture, leftGesture) < 0.1) {
                    window.dispatchEvent(leftEvent);
                    left.style.borderColor = "red";
                    right.style.borderColor = "white";
                    down.style.borderColor = "white";
                    up.style.borderColor = "white";
                } else if (cosineDistanceMatching(gesture, rightGesture) < 0.1) {
                    window.dispatchEvent(rightEvent);
                    left.style.borderColor = "white";
                    right.style.borderColor = "red";
                    down.style.borderColor = "white";
                    up.style.borderColor = "white";
                } else if (cosineDistanceMatching(gesture, downGesture) < 0.1) {
                    window.dispatchEvent(downEvent);
                    left.style.borderColor = "white";
                    right.style.borderColor = "white";
                    down.style.borderColor = "red";
                    up.style.borderColor = "white";
                } else if (cosineDistanceMatching(gesture, upGesture) < 0.1) {
                    window.dispatchEvent(upEvent);
                    left.style.borderColor = "white";
                    right.style.borderColor = "white";
                    down.style.borderColor = "white";
                    up.style.borderColor = "red";
                }
            } catch (e) {
                console.log(err)
            }
        }
        requestAnimationFrame(frameLandmarks);
    };

    frameLandmarks();
};
main();

function takepicture(element) {
    let canvas = document.getElementById("control")
    let context = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    context.drawImage(video, 0, 0, 100, 100);
    element.setAttribute('src', canvas.toDataURL('image/png'));
}

left.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            leftGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                leftGesture.push(predictions[0].landmarks[i][0])
                leftGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(left)
        }
    }
})
right.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            rightGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                rightGesture.push(predictions[0].landmarks[i][0])
                rightGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(right)
        }
    }
})
down.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            downGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                downGesture.push(predictions[0].landmarks[i][0])
                downGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(down)
        }
    }
})
up.addEventListener('click', () => {
    if (loadStatus) {
        if (predictions[0]) {
            upGesture = []
            for (let i = 0; i < predictions[0].landmarks.length; i++) {
                upGesture.push(predictions[0].landmarks[i][0])
                upGesture.push(predictions[0].landmarks[i][1])
            }
            takepicture(up)
        }
    }
})


},{"compute-cosine-similarity":2}],2:[function(require,module,exports){
'use strict';

// MODULES //

var dot = require( 'compute-dot' ),
	l2norm = require( 'compute-l2norm' ),
	isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// FUNCTIONS //

/**
 * FUNCTION: partial( fn, j )
 *	Partially applied function from the right.
 *
 * @private
 * @param {Function} fn - input function
 * @param {Number} j - array index
 * @returns {Function} partially applied function
 */
function partial( fn, j ) {
	return function accessor( d, i ) {
		return fn( d, i, j );
	};
} // end FUNCTION partial()


// COSINE SIMILARITY //

/**
* FUNCTION: similarity( x, y[, accessor] )
*	Computes the cosine similarity between two arrays.
*
* @param {Number[]|Array} x - input array
* @param {Number[]|Array} y - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} cosine similarity or null
*/
function similarity( x, y, clbk ) {
	var a, b, c;
	if ( !isArray( x ) ) {
		throw new TypeError( 'cosine-similarity()::invalid input argument. First argument must be an array. Value: `' + x + '`.' );
	}
	if ( !isArray( y ) ) {
		throw new TypeError( 'cosine-similarity()::invalid input argument. Second argument must be an array. Value: `' + y + '`.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'cosine-similarity()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	if ( x.length !== y.length ) {
		throw new Error( 'cosine-similarity()::invalid input argument. Input arrays must have the same length.' );
	}
	if ( !x.length ) {
		return null;
	}
	if ( clbk ) {
		a = dot( x, y, clbk );
		b = l2norm( x, partial( clbk, 0 ) );
		c = l2norm( y, partial( clbk, 1 ) );
	} else {
		a = dot( x, y );
		b = l2norm( x );
		c = l2norm( y );
	}
	return a / ( b*c );
} // end FUNCTION similarity()


// EXPORTS //

module.exports = similarity;

},{"compute-dot":3,"compute-l2norm":4,"validate.io-array":5,"validate.io-function":6}],3:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// DOT PRODUCT //

/**
* FUNCTION: dot( x, y[, accessor] )
*	Computes the dot product between two arrays.
*
* @param {Array} x - input array
* @param {Array} y - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} dot product
*/
function dot( x, y, clbk ) {
	if ( !isArray( x ) ) {
		throw new TypeError( 'dot()::invalid input argument. First argument must be an array. Value: `' + x + '`.' );
	}
	if ( !isArray( y ) ) {
		throw new TypeError( 'dot()::invalid input argument. Second argument must be an array. Value: `' + y + '`.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'dot()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	var len = x.length,
		sum = 0,
		i;

	if ( len !== y.length ) {
		throw new Error( 'dot()::invalid input argument. Arrays must be of equal length.' );
	}
	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			sum += clbk( x[ i ], i, 0 ) * clbk( y[ i ], i, 1 );
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			sum += x[ i ] * y[ i ];
		}
	}
	return sum;
} // end FUNCTION dot()


// EXPORTS //

module.exports = dot;

},{"validate.io-array":5,"validate.io-function":6}],4:[function(require,module,exports){
'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isFunction = require( 'validate.io-function' );


// L2NORM //

/**
* FUNCTION: l2norm( arr[, accessor] )
*	Calculates the L2 norm (Euclidean norm) of an array.
*
* @param {Array} arr - input array
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number|Null} L2 norm or null
*/
function l2norm( arr, clbk ) {
	if ( !isArray( arr ) ) {
		throw new TypeError( 'l2norm()::invalid input argument. Must provide an array.  Value: `' + arr + '`.' );
	}
	if ( arguments.length > 1 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'l2norm()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	var len = arr.length,
		t = 0,
		s = 1,
		r,
		val,
		abs,
		i;

	if ( !len ) {
		return null;
	}
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			val = clbk( arr[ i ], i );
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			val = arr[ i ];
			abs = ( val < 0 ) ? -val : val;
			if ( abs > 0 ) {
				if ( abs > t ) {
					r = t / val;
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
				}
			}
		}
	}
	return t * Math.sqrt( s );
} // end FUNCTION l2norm()


// EXPORTS //

module.exports = l2norm;

},{"validate.io-array":5,"validate.io-function":6}],5:[function(require,module,exports){
'use strict';

/**
* FUNCTION: isArray( value )
*	Validates if a value is an array.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is an array
*/
function isArray( value ) {
	return Object.prototype.toString.call( value ) === '[object Array]';
} // end FUNCTION isArray()

// EXPORTS //

module.exports = Array.isArray || isArray;

},{}],6:[function(require,module,exports){
/**
*
*	VALIDATE: function
*
*
*	DESCRIPTION:
*		- Validates if a value is a function.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isFunction( value )
*	Validates if a value is a function.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a function
*/
function isFunction( value ) {
	return ( typeof value === 'function' );
} // end FUNCTION isFunction()


// EXPORTS //

module.exports = isFunction;

},{}]},{},[1]);
