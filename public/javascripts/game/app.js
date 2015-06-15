var basicScene;
var speedMultiplier = 2;
var BasicScene = Class.extend({
    // Class constructor
    init: function () {
        'use strict';
        // Create a scene, a camera, a light and a WebGL renderer with Three.JS
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
        this.scene.add(this.camera);

        this.light = new THREE.PointLight();
        this.light.position.set(-256, 256, -256);
        this.scene.add(this.light);

        this.renderer = new THREE.WebGLRenderer();
        this.container = document.getElementById('basic-scene');
        this.user = new Character({
            color: 0x7A43B6
        });

        this.scene.add(this.user.mesh);

        this.world = new World({
            color: 0xF5F5F5
        });
        this.scene.add(this.world.mesh);
        // Define the size of the renderer
        this.setAspect();
        // Insert the renderer in the container
        this.container.appendChild(this.renderer.domElement);
        // Set the camera to look at our user's character
        this.setFocus(this.user.mesh);
        // Start the events handlers
        this.setControls();

    },
    stats: {
        setHealth: function () {
            document.getElementById("hpProgressBar").style.width = 2 * basicScene.user.health + "px";
            document.getElementById("hpProgressBar").innerHTML = basicScene.user.health + "/100";
        },
        addPoint: function (numberOf) {
            basicScene.user.stats.points += numberOf;
            document.getElementById("points").innerHTML = "Points: " + basicScene.user.stats.points;
        },
        addKill: function () {
            basicScene.user.stats.killed += 1;
            document.getElementById("kills").innerHTML = "Killed: " + basicScene.user.stats.killed;
        },
        setWave: function (wave) {
            document.getElementById("wave").innerHTML = "Wave: " + wave
        }

    },
    shoootingTimeout: 15,
    running: false,
    clock: new THREE.Clock(),
    // Event handlers
    setControls: function () {
        'use strict';
        // Within jQuery's methods, we won't be able to access "this"
        var user = this.user,
        // State of the different controls
            controls = {
                left: false,
                up: false,
                right: false,
                down: false,
                cameraLeft: false,
                cameraRight: false
            };

        this.refControls = controls;
        // When the user push a key down
        document.addEventListener("click", function (event) {
            if (basicScene.shoootingTimeout <= 0) {
                var mouseVector = new THREE.Vector2();
                mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

                var currentWeapon = basicScene.user.currentWeapon;
                if (currentWeapon.isIninityAmmo || currentWeapon.ammo > 0) {
                    currentWeapon.shoot(new THREE.Vector3(mouseVector.x, 0, -mouseVector.y).normalize())
                } else
                    basicScene.user.currentWeapon = new DefaultWeapon();
                basicScene.shoootingTimeout = currentWeapon.delay
            }

        });
        document.addEventListener("keydown", function (e) {
            var prevent = true;
            // Update the state of the attached control to "true"
            switch (e.keyCode) {
                case 65:
                    controls.right = true;
                    break;
                case 87:
                    controls.down = true;
                    break;
                case 68:
                    controls.left = true;
                    break;
                case 83:
                    controls.up = true;
                    break;
                case 27:
                    if (basicScene.user.health > 0)
                        basicScene.running = !basicScene.running;
                    break;
                default:
                    prevent = false;
            }
            // Avoid the browser to react unexpectedly
            if (prevent) {
                e.preventDefault();
            } else {
                return;
            }
            // Update the character's direction
            user.setDirection(controls);
        });
        // When the user release a key up
        document.addEventListener("keyup", function (e) {
            var prevent = true;
            // Update the state of the attached control to "false"
            switch (e.keyCode) {
                case 65:
                    controls.right = false;
                    break;
                case 87:
                    controls.down = false;
                    break;
                case 68:
                    controls.left = false;
                    break;
                case 83:
                    controls.up = false;
                    break;
                default:
                    prevent = false;
            }
            // Avoid the browser to react unexpectedly
            if (prevent) {
                e.preventDefault();
            } else {
                return;
            }
            // Update the character's direction
            user.setDirection(controls);
        });
        // On resize
        if (window.attachEvent) {
            window.attachEvent('onresize', function () {
                basicScene.setAspect();
            });
        }
        else if (window.addEventListener) {
            window.addEventListener('resize', function () {
                basicScene.setAspect();
            }, true);
        }
    },
    stopMove: function(){
        this.refControls.up = false;
        this.refControls.down = false;
        this.refControls.left = false;
        this.refControls.right = false;
    },
    setAspect: function () {
        'use strict';
        // Fit the container's full width
        var w = window.innerWidth - 5,
        // Fit the initial visible area's height
            h = window.innerHeight - 5;
        // Update the renderer and the camera
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    },
    // Updating the camera to follow and look at a given Object3D / Mesh
    setFocus: function (object) {
        'use strict';
        this.light.lookAt(object.position);
        this.camera.position.set(object.position.x, object.position.y + 512, object.position.z + 400);
        this.camera.lookAt(object.position);
    },
    // Update and draw the scene
    frame: function () {
        'use strict';
        // Run a new step of the user's motions
        if (basicScene.running) {
            this.user.motion();

            if (this.shoootingTimeout > 0)
                this.shoootingTimeout -= 1;

            this.world.update();

            this.setFocus(this.user.mesh);
            this.renderer.render(this.scene, this.camera);
        }

    },
    onReady: function(){
        var test = new Shooter();
        test.spawnAt(264,0,264)
    }
});
