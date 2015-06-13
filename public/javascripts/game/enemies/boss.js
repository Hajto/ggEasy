var Boss = Class.extend({
    init: function (args) {
        this.mesh = new THREE.Object3D();

        var head = new THREE.Mesh(
            new THREE.SphereGeometry(16, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xF5F5F5
            })
        );
        head.translateY(64);

        var body = new THREE.Mesh(
            new THREE.SphereGeometry(64, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xF5F5F5
            })
        );

        var crown = new THREE.Mesh(new THREE.TorusGeometry(16,12,8,6), new THREE.MeshLambertMaterial({
            color: 0x373AED
        }));
        crown.translateY(96);
        crown.rotation.x = Math.PI/2;


        this.mesh.add(head);
        this.mesh.add(crown);
        this.mesh.add(body);

    },
    health: 150,
    velocity: 2*speedMultiplier,
    initialVelocity: 2,
    damage: 20,
    timeout: 90,
    specialAbility: 300,
    size: 24,
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 32, z);
    },
    follow: function () {
        var playerVector = new THREE.Vector3();
        playerVector.x = basicScene.user.mesh.position.x;
        playerVector.z = basicScene.user.mesh.position.z;
        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        if (this.specialAbility <= 0) {
            basicScene.world.randomSpawn();
            this.specialAbility = 300;
        }
        else
            this.specialAbility -= 1;

        if (this.timeout > 0) {
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
        if (this.health <= 0) {
            this.die();
        }

    },
    die: function () {
        if(Math.round(Math.random()*100) > 50){
            var hp = new HealthPacket();
            hp.spawnAt(this.mesh.position)
        } else {
            var point = new Point();
            point.spawnAt(this.mesh.position);
        }

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
