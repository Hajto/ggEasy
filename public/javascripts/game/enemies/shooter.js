var Shooter = Class.extend({
    init: function (args) {
        this.mesh = new THREE.Object3D();

        var head = new THREE.Mesh(
            new THREE.SphereGeometry(16, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xF5F5F5
            })
        );


        this.body = new THREE.Mesh(
            new THREE.SphereGeometry(32, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xF5F5F5,
                wireframe: true
            })
        );

        this.mesh.add(head);
        this.mesh.add(this.body);

    },
    health: 30,
    velocity: 0.5*speedMultiplier,
    initialVelocity: 0.5,
    damage: 15,
    timeout: 120,
    specialAbility: 1,
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

        this.body.rotation.y += 0.5;

        if (this.specialAbility <= 0) {
            var bullet = new Bullet();
            bullet.damage = this.damage;
            bullet.mesh.material = new THREE.MeshBasicMaterial({
                color: 0xff0000
            });
            bullet.shootPlayer(this.mesh.position);
            console.log("Shooting");

            this.specialAbility = 60;
        } else
            this.specialAbility -= 1;

        if (this.timeout > 0) {
            this.timeout -= 1;
        } else if (parseInt(distance(enemyVector, playerVector)) < 48) {
            basicScene.user.applyDamage(this);
            this.direction = new THREE.Vector3(0, 0, 0);
        } else {
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
