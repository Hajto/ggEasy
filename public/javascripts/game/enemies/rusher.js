var Rusher = Class.extend({
    init: function (args) {
        var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture('assets/textures/evilBox.png')
        });
        var geometry = new THREE.CubeGeometry(32, 32, 32);
        this.mesh = new THREE.Mesh(geometry, material);
    },
    health: 15,
    velocity: 3*speedMultiplier,
    initialVelocity: 3,
    damage: 25,
    timeout: 60,
    size : 24,
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 100, z);
    },
    follow: function () {
        var playerVector = new THREE.Vector3();
        playerVector.x = basicScene.user.mesh.position.x;
        playerVector.z = basicScene.user.mesh.position.z;
        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        if(this.timeout > 0){
            this.timeout -= 1;
        } else if (parseInt(distance(enemyVector, playerVector)) < 48) {

            basicScene.user.applyDamage(this);
            this.direction = new THREE.Vector3(0, 0, 0);

        }
        else {
            this.direction = playerVector.sub(enemyVector).normalize();
            this.direction.y = 0;
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