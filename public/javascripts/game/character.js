var Character = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the different geometries composing the humanoid
        var head = new THREE.SphereGeometry(32, 16, 16),
            hand = new THREE.SphereGeometry(8, 8, 8),
            foot = new THREE.SphereGeometry(16, 4, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            nose = new THREE.SphereGeometry(4, 8, 8),
            // Set the material, the "skin"
            material = new THREE.MeshLambertMaterial(args);
        // Set the character modelisation object
        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 48;
        this.mesh.position.x = map.playerSpawnPoint.x;
        this.mesh.position.z = map.playerSpawnPoint.y;
        // Set and add its head
        this.head = new THREE.Mesh(head, material);
        this.head.position.y = 0;
        this.mesh.add(this.head);
        // Set and add its hands
        this.hands = {
            left: new THREE.Mesh(hand, material),
            right: new THREE.Mesh(hand, material)
        };
        this.hands.left.position.x = -40;
        this.hands.left.position.y = -8;
        this.hands.right.position.x = 40;
        this.hands.right.position.y = -8;
        this.mesh.add(this.hands.left);
        this.mesh.add(this.hands.right);
        // Set and add its feet
        this.feet = {
            left: new THREE.Mesh(foot, material),
            right: new THREE.Mesh(foot, material)
        };
        this.feet.left.position.x = -20;
        this.feet.left.position.y = -48;
        this.feet.left.rotation.y = Math.PI / 4;
        this.feet.right.position.x = 20;
        this.feet.right.position.y = -48;
        this.feet.right.rotation.y = Math.PI / 4;
        this.mesh.add(this.feet.left);
        this.mesh.add(this.feet.right);
        // Set and add its nose
        this.nose = new THREE.Mesh(nose, material);
        this.nose.position.y = 0;
        this.nose.position.z = 32;
        this.mesh.add(this.nose);
        // Set the vector of the current motion
        this.direction = new THREE.Vector3(0, 0, 0);
        // Set the current animation step
        this.step = 0;
        this.position = this.mesh.position;
        this.collider = new SAT.Box(new SAT.Vector(this.position.x-36,this.position.z-36),60,60);

        var colliderPolygon = this.collider.toPolygon();
        console.log(colliderPolygon);
        for(var x = 0; x < colliderPolygon.points.length; x++){
            var test = new THREE.Mesh(new THREE.CubeGeometry(8,8,8),material);
            test.position.x = colliderPolygon.pos.x + colliderPolygon.calcPoints[x].x;
            test.position.z = colliderPolygon.pos.y + colliderPolygon.calcPoints[x].y;
            this.mesh.add(test)
        }
    },
    maxHealth: 100,
    health: 100,
    velocity: 1 * speedMultiplier,
    initialVelocity: 1,
    stats:{
        killed: 0,
        points: 0
    },
    // Update the direction of the current motion
    setDirection: function (controls) {
        'use strict';
        // Either left or right, and either up or down (no jump or dive (on the Y axis), so far ...)
        var x = controls.left ? 1 : controls.right ? -1 : 0,
            y = 0,
            z = controls.up ? 1 : controls.down ? -1 : 0;
        this.direction.set(x, y, z);
    },
    // Process the character motions
    motion: function () {
        'use strict';
        // If we're not static
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // Move the character
            this.move();
            return true;
        }
    },
    // Rotate the character
    rotate: function () {
        'use strict';
        // Set the direction's angle, and the difference between it and our Object3D's current rotation
        var angle = Math.atan2(this.direction.x, this.direction.z),
            difference = angle - this.mesh.rotation.y;
        // If we're doing more than a 180°
        if (Math.abs(difference) > Math.PI) {
            // We proceed to a direct 360° rotation in the opposite way
            if (difference > 0) { this.mesh.rotation.y += 2 * Math.PI; } else { this.mesh.rotation.y -= 2 * Math.PI; }
            // And we set a new smarter (because shorter) difference
            difference = angle - this.mesh.rotation.y;
            // In short : we make sure not to turn "left" to go "right"
        }
        // Now if we haven't reach our target angle
        if (difference !== 0) {
            // We slightly get closer to it
            this.mesh.rotation.y += difference / 4;
        }
    },
    isHeavy : false,
    walkingSound: new Audio("assets/sounds/sfx/walk/stone.wav"),
    move: function () {
        'use strict';
        // We update our Object3D's position from our "direction"
        this.mesh.position.x += this.direction.x * ((this.direction.z === 0) ? 4 : Math.sqrt(8)) * this.velocity;
        this.mesh.position.z += this.direction.z * ((this.direction.x === 0) ? 4 : Math.sqrt(8)) * this.velocity;

        document.getElementById("position").innerHTML = "x: "+this.collider.pos.x + " z: "+this.collider.pos.y;
        // Now some trigonometry, using our "step" property ...
        this.step += 1 / 4;
        // ... to slightly move our feet and hands
        this.feet.left.position.setZ(Math.sin(this.step) * 16);
        this.feet.right.position.setZ(Math.cos(this.step + (Math.PI / 2)) * 16);
        this.hands.left.position.setZ(Math.cos(this.step + (Math.PI / 2)) * 8);
        this.hands.right.position.setZ(Math.sin(this.step) * 8);
    },
    die: function(){
        basicScene.running = false;
        document.getElementById("ded").style.display = "block";
    },
    applyDamage: function(enemy){
        this.health -= enemy.damage;
        basicScene.stats.setHealth();
        enemy.onPlayerHit();
        if(this.health <= 0)
            this.die()
    },
    update: function(){
        this.collider.pos.x = this.mesh.position.x - 32;
        this.collider.pos.y = this.mesh.position.z - 32;
    },
    currentWeapon: new DefaultWeapon()
});