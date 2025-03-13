/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

THREE.OrbitControls = function(object, domElement) {
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = true;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, TOP: 38, RIGHT: 39, BOTTOM: 40, DOWN: 40 };

    // Mouse buttons
    this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

    // Touch fingers
    this.touches = { ONE: THREE.TOUCH.ONE, TWO: THREE.TOUCH.TWO };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    // the target DOM element for key events
    this._domElementKeyEvents = null;

    //
    // public methods
    //

    this.getPolarAngle = function() {
        var spherical = new THREE.Spherical();
        spherical.setFromCartesian(this.object.position);
        return spherical.phi;
    };

    this.getAzimuthalAngle = function() {
        var spherical = new THREE.Spherical();
        spherical.setFromCartesian(this.object.position);
        return spherical.theta;
    };

    this.saveState = function() {
        this.target0.copy(this.target);
        this.position0.copy(this.object.position);
        this.zoom0 = this.object.zoom;
    };

    this.reset = function() {
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent(changeEvent);

        this.update();

        state = STATE.NONE;
    };

    // this method is exposed, but internally it should be called after all object changes, if updateCamera is set to true
    this.update = function() {
        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().invert();

        offset.copy(position).sub(this.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (this.autoRotate && state === STATE.NONE) {
            rotateLeft(getAutoRotationAngle());
        }

        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;

        // restrict theta to be between desired limits
        spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, spherical.theta));

        // restrict phi to be between desired limits
        spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, spherical.phi));

        spherical.makeSafe();

        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, spherical.radius));

        // move target to panned location
        this.target.add(panOffset);

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(this.target).add(offset);

        this.object.lookAt(this.target);

        if (this.enableDamping === true) {
            sphericalDelta.theta *= (1 - this.dampingFactor);
            sphericalDelta.phi *= (1 - this.dampingFactor);
            panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            sphericalDelta.set(0, 0, 0);
            panOffset.set(0, 0, 0);
        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (zoomChanged ||
            lastPosition.distanceToSquared(this.object.position) > EPS ||
            8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
            this.dispatchEvent(changeEvent);

            lastPosition.copy(this.object.position);
            lastQuaternion.copy(this.object.quaternion);
            zoomChanged = false;

            return true;
        }

        return false;
    };

    this.dispose = function() {
        this.domElement.removeEventListener('contextmenu', onContextMenu, false);
        this.domElement.removeEventListener('mousedown', onMouseDown, false);
        this.domElement.removeEventListener('wheel', onMouseWheel, false);
        this.domElement.removeEventListener('touchstart', onTouchStart, false);
        this.domElement.removeEventListener('touchend', onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', onTouchMove, false);

        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);

        this._domElementKeyEvents.removeEventListener('keydown', onKeyDown, false);
        //this._domElementKeyEvents = null;
    };

    //
    // internals
    //

    var scope = this;

    var STATE = {
        NONE: - 1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_DOLLY_PAN: 4
    };

    var state = STATE.NONE;

    var EPS = 0.000001;

    // current position in spherical coordinates
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();

    var scale = 1;
    var panOffset = new THREE.Vector3();
    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
    }

    function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    }

    function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    }

    var panLeft = function() {
        var v = new THREE.Vector3();
        return function panLeft(distance, objectMatrix) {
            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(- distance);

            panOffset.add(v);
        };
    }();

    var panUp = function() {
        var v = new THREE.Vector3();
        return function panUp(distance, objectMatrix) {
            if (scope.screenSpacePanning === true) {
                v.setFromMatrixColumn(objectMatrix, 1);
            } else {
                v.setFromMatrixColumn(objectMatrix, 0);
                v.crossVectors(scope.object.up, v);
            }

            v.multiplyScalar(distance);

            panOffset.add(v);
        };
    }();

    // deltaX and deltaY are in pixels; right and down are positive
    var pan = function() {
        var offset = new THREE.Vector3();
        return function pan(deltaX, deltaY) {
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if (scope.object.isPerspectiveCamera) {
                // perspective
                var position = scope.object.position;
                offset.copy(position).sub(scope.target);
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

                // we use only clientHeight here so aspect ratio does not distort speed
                panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
                panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
            } else if (scope.object.isOrthographicCamera) {
                // orthographic
                panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
            } else {
                // camera neither orthographic nor perspective
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                scope.enablePan = false;
            }
        };
    }();

    function dollyIn(dollyScale) {
        if (scope.object.isPerspectiveCamera) {
            scale /= dollyScale;
        } else if (scope.object.isOrthographicCamera) {
            scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            scope.enableZoom = false;
        }
    }

    function dollyOut(dollyScale) {
        if (scope.object.isPerspectiveCamera) {
            scale *= dollyScale;
        } else if (scope.object.isOrthographicCamera) {
            scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
            scope.object.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            scope.enableZoom = false;
        }
    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {
        //console.log( 'handleMouseDownRotate' );

        rotateStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownDolly(event) {
        //console.log( 'handleMouseDownDolly' );

        dollyStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownPan(event) {
        //console.log( 'handleMouseDownPan' );

        panStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveRotate(event) {
        //console.log( 'handleMouseMoveRotate' );

        rotateEnd.set(event.clientX, event.clientY);

        rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth);
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

        rotateStart.copy(rotateEnd);

        scope.update();
    }

    function handleMouseMoveDolly(event) {
        //console.log( 'handleMouseMoveDolly' );

        dollyEnd.set(event.clientX, event.clientY);

        dollyDelta.subVectors(dollyEnd, dollyStart);

        if (dollyDelta.y > 0) {
            dollyIn(getZoomScale());
        } else if (dollyDelta.y < 0) {
            dollyOut(getZoomScale());
        }

        dollyStart.copy(dollyEnd);

        scope.update();
    }

    function handleMouseMovePan(event) {
        //console.log( 'handleMouseMovePan' );

        panEnd.set(event.clientX, event.clientY);

        panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

        pan(panDelta.x, panDelta.y);

        panStart.copy(panEnd);

        scope.update();
    }

    function handleMouseUp(event) {
        // console.log( 'handleMouseUp' );
    }

    function handleMouseWheel(event) {
        // console.log( 'handleMouseWheel' );

        if (event.deltaY < 0) {
            dollyOut(getZoomScale());
        } else if (event.deltaY > 0) {
            dollyIn(getZoomScale());
        }

        scope.update();
    }

    function handleKeyDown(event) {
        //console.log( 'handleKeyDown' );

        switch (event.keyCode) {
            case scope.keys.UP:
                pan(0, scope.keyPanSpeed);
                scope.update();
                break;

            case scope.keys.BOTTOM:
                pan(0, - scope.keyPanSpeed);
                scope.update();
                break;

            case scope.keys.LEFT:
                pan(scope.keyPanSpeed, 0);
                scope.update();
                break;

            case scope.keys.RIGHT:
                pan(- scope.keyPanSpeed, 0);
                scope.update();
                break;
        }
    }

    function handleTouchStartRotate(event) {
        //console.log( 'handleTouchStartRotate' );

        if (event.touches.length === 1) {
            rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        } else if (event.touches.length === 2) {
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            rotateStart.set(x, y);
        }
    }

    function handleTouchStartDollyPan(event) {
        //console.log( 'handleTouchStartDollyPan' );

        if (event.touches.length === 2) {
            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;

            var distance = Math.sqrt(dx * dx + dy * dy);

            dollyStart.set(0, distance);
        } else if (event.touches.length === 1) {
            panStart.set(event.touches[0].pageX, event.touches[0].pageY);
        }
    }

    function handleTouchMoveRotate(event) {
        //console.log( 'handleTouchMoveRotate' );

        if (event.touches.length === 1) {
            rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        } else if (event.touches.length === 2) {
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            rotateEnd.set(x, y);
        }

        rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth);
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

        rotateStart.copy(rotateEnd);

        scope.update();
    }

    function handleTouchMoveDollyPan(event) {
        //console.log( 'handleTouchMoveDollyPan' );

        if (event.touches.length === 2) {
            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;

            var distance = Math.sqrt(dx * dx + dy * dy);

            dollyEnd.set(0, distance);
        } else if (event.touches.length === 1) {
            panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        }

        dollyDelta.subVectors(dollyEnd, dollyStart);

        if (dollyDelta.y > 0) {
            dollyOut(getZoomScale());
        } else if (dollyDelta.y < 0) {
            dollyIn(getZoomScale());
        }

        panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

        pan(panDelta.x, panDelta.y);

        dollyStart.copy(dollyEnd);
        panStart.copy(panEnd);

        scope.update();
    }

    function handleTouchEnd(event) {
        //console.log( 'handleTouchEnd' );
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown(event) {
        if (scope.enabled === false) return;

        event.preventDefault();

        if (event.button === scope.mouseButtons.LEFT) {
            if (event.ctrlKey || event.metaKey || event.shiftKey) {
                if (scope.enablePan === false) return;
                handleMouseDownPan(event);
                state = STATE.PAN;
            } else {
                if (scope.enableRotate === false) return;
                handleMouseDownRotate(event);
                state = STATE.ROTATE;
            }
        } else if (event.button === scope.mouseButtons.MIDDLE) {
            if (scope.enableDolly === false) return;
            handleMouseDownDolly(event);
            state = STATE.DOLLY;
        } else if (event.button === scope.mouseButtons.RIGHT) {
            if (scope.enablePan === false) return;
            handleMouseDownPan(event);
            state = STATE.PAN;
        }

        if (state !== STATE.NONE) {
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);
        }
    }

    function onMouseMove(event) {
        if (scope.enabled === false) return;

        event.preventDefault();

        if (state === STATE.ROTATE) {
            if (scope.enableRotate === false) return;
            handleMouseMoveRotate(event);
        } else if (state === STATE.DOLLY) {
            if (scope.enableDolly === false) return;
            handleMouseMoveDolly(event);
        } else if (state === STATE.PAN) {
            if (scope.enablePan === false) return;
            handleMouseMovePan(event);
        }
    }

    function onMouseUp(event) {
        if (scope.enabled === false) return;

        handleMouseUp(event);

        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);

        state = STATE.NONE;
    }

    function onMouseWheel(event) {
        if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;

        event.preventDefault();
        event.stopPropagation();

        handleMouseWheel(event);
    }

    function onKeyDown(event) {
        if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

        handleKeyDown(event);
    }

    function onTouchStart(event) {
        if (scope.enabled === false) return;

        event.preventDefault();

        switch (event.touches.length) {
            case 1:
                switch (event.touches[0].target) {
                    case scope.domElement:
                        if (scope.enableRotate === false) return;
                        handleTouchStartRotate(event);
                        state = STATE.TOUCH_ROTATE;
                        break;
                    default:
                        state = STATE.NONE;
                }
                break;

            case 2:
                if (scope.enableZoom === false && scope.enablePan === false) return;
                handleTouchStartDollyPan(event);
                state = STATE.TOUCH_DOLLY_PAN;
                break;

            default:
                state = STATE.NONE;
        }

        if (state !== STATE.NONE) {
            document.addEventListener('touchmove', onTouchMove, false);
            document.addEventListener('touchend', onTouchEnd, false);
        }
    }

    function onTouchMove(event) {
        if (scope.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {
            case 1:
                if (scope.enableRotate === false) return;
                handleTouchMoveRotate(event);
                break;

            case 2:
                if (scope.enableZoom === false && scope.enablePan === false) return;
                handleTouchMoveDollyPan(event);
                break;

            default:
                state = STATE.NONE;
        }
    }

    function onTouchEnd(event) {
        if (scope.enabled === false) return;

        handleTouchEnd(event);

        document.removeEventListener('touchmove', onTouchMove, false);
        document.removeEventListener('touchend', onTouchEnd, false);

        state = STATE.NONE;
    }

    function onContextMenu(event) {
        event.preventDefault();
    }

    // force an update at start
    this.update();

    // DOM Event Listeners
    this.domElement.addEventListener('contextmenu', onContextMenu, false);

    this.domElement.addEventListener('mousedown', onMouseDown, false);
    this.domElement.addEventListener('wheel', onMouseWheel, false);

    this.domElement.addEventListener('touchstart', onTouchStart, false);
    this.domElement.addEventListener('touchend', onTouchEnd, false);
    this.domElement.addEventListener('touchmove', onTouchMove, false);

    // window event listeners

    window.addEventListener('keydown', onKeyDown, false);

    // make this element the target (for mouse events)
    this._domElementKeyEvents = this.domElement;

    // touch event

    // handle an active touch move source to a non-touch target
    var scope = this;
    var touchTimeout;

    function touchStart() {
        scope._domElementKeyEvents = scope.domElement;
    }

    function touchEnd() {
        touchTimeout = setTimeout(function() {
            scope._domElementKeyEvents = null;
        }, 500);
    }

    this.domElement.addEventListener('touchstart', touchStart, false);
    this.domElement.addEventListener('touchend', touchEnd, false);
}; 