var Speeder = Class.extend({
    init: function (args) {
        var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture('assets/textures/evilBox.png')
        });
        var geometry = new THREE.TorusGeometry( 20, 6, 16, 100 );
        this.mesh = new THREE.Mesh(geometry, material);

        this.collider = new SAT.Box(new SAT.Vector(this.mesh.position.x - 20,this.mesh.position.z - 10),40,40)
    },
    health: 10,
    velocity: 4*speedMultiplier,
    initialVelocity: 5,
    damage: 25,
    timeout: 60,
    size : 20,
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 100, z);
    },
    follow: function () {
        this.collider.pos.x = this.mesh.position.x - 20;
        this.collider.pos.y = this.mesh.position.z - 20;

        this.mesh.rotation.y += 0.05;

        var playerVector = new THREE.Vector3();
        playerVector.x = basicScene.user.mesh.position.x;
        playerVector.z = basicScene.user.mesh.position.z;

        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        this.direction = playerVector.sub(enemyVector).normalize();
        this.direction.y = 0;


        if(this.timeout > 0){
            this.timeout -= 1;
        } /*else if (parseInt(distance(enemyVector, playerVector)) < 48) {
            //basicScene.user.applyDamage(this);
            this.direction = new THREE.Vector3(0, 0, 0);
        }*/ else {
            var obstacles = basicScene.world.obstacles;

            for (var i = 0; i < obstacles.length; i++) {
                var response = new SAT.Response();
                var col = SAT.testPolygonPolygon(obstacles[i].toPolygon(), this.collider.toPolygon(), response);

                if (col) {
                    this.mesh.position.add(new THREE.Vector3(response.overlapV.x, 0, response.overlapV.y));
                    this.direction.negate();
                }
            }
            this.mesh.position.add(this.direction.multiplyScalar(this.velocity));

        }

        function distance(v1, v2) {
            var dx = parseInt(v1.x) - parseInt(v2.x);
            var dz = parseInt(v1.z) - parseInt(v2.z);

            return Math.sqrt(dx * dx + dz * dz);
        }
    },
    applyDamage: function (damage) {
        this.health -= damage;
        if (this.health <= 0){
            this.die();
        }

    },
    die: function () {
        var point = new Point();
        point.spawnAt(this.mesh.position);

        removeA(basicScene.world.enemies, this);
        basicScene.world.mesh.remove(this.mesh);
        basicScene.stats.addKill();

        function removeA(arr) {
            var what, a = arguments, L = a.length, ax;
            while (L > 1 && arr.length) {
                what = a[--L];
                while ((ax = arr.indexOf(what)) !== -1) {
                    arr.splice(ax, 1);
                }
            }
            return arr;
        }
    },
    onPlayerHit: function () {
        this.timeout = 60;
        //this.die();
        console.log("Bah")
    }
});