var MineDroper = Class.extend({
    init: function (args) {
        this.mesh = new THREE.Object3D();

        var head = new THREE.Mesh(
            new THREE.SphereGeometry(16, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xde0000
            })
        );

        this.body = new THREE.Mesh(
            new THREE.SphereGeometry(32, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xF5F5F5
            })
        );

        this.body.translateY(-16);

        this.mesh.add(head);
        this.mesh.add(this.body);

    },
    health: 30,
    velocity: 0.5 * speedMultiplier,
    initialVelocity: 1,
    damage: 15,
    timeout: 120,
    specialAbility: 1,
    size: 24,
    pathFindingCooldown: 0,
    destination: new THREE.Vector3(0, 0, 0),
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 32, z);
    },
    follow: function () {
        this.body.rotation.y += 0.5;

        if (this.specialAbility <= 0) {
            var bullet = new Mine();
            bullet.damage = this.damage;
            bullet.shootPlayer(this.mesh.position);

            this.specialAbility = 60;
        } else
            this.specialAbility -= 1;

        if (this.pathFindingCooldown <= 0) {
            this.path = pathFinder.findShortestPath(this.mesh.position, basicScene.user.mesh.position);

            if (this.path.length > 0)
                this.pathFindingCooldown = 60;
        } else
            this.pathFindingCooldown -= 1;

        if (this.path != undefined && this.path.length > 0) {

            this.destination = new THREE.Vector3();
            this.destination.x = mapXToPosX(this.path[0].x);
            this.destination.z = mapYToPosZ(this.path[0].y);

            if (this.path[0].x == Math.round(pathFinder.findXInMapByPosX(this.mesh.position.x))
                && this.path[0].y == Math.round(pathFinder.findYInMapByPosZ(this.mesh.position.z))) {
                this.path.splice(0, 1);
            }
        }

        var playerVector = new THREE.Vector3().copy(this.destination);
        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        this.direction = playerVector.sub(enemyVector).normalize();
        this.direction.y = 0;

        this.mesh.position.add(this.direction.multiplyScalar(this.velocity));
    },
    applyDamage: function (damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }

    },
    die: function () {
        if (Math.round(Math.random() * 100) > 50) {
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
        //console.log("Bah")
    }
});

var Mine = Class.extend({
    init: function (args) {
        var dot= new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshLambertMaterial({
            color: 0xED0000
        }));
        dot.translateY(-4);

        var bottom = new THREE.Mesh(new THREE.SphereGeometry(8, 8, 8), new THREE.MeshLambertMaterial({
            color: 0xEFEFEF
        }));
        bottom.translateY(-12);

        this.mesh = new THREE.Object3D;
        this.mesh.add(dot);
        this.mesh.add(bottom);
        this.collider = new SAT.Circle(new SAT.Vector(this.mesh.position.x - 8, this.mesh.position.z - 8), 8);

    },
    velocity: 10,
    collisionRemaining: 3,
    life: 300,
    direction: new THREE.Vector3(0, 0, 0),
    shootPlayer: function (position) {
        this.mesh.position.set(position.x, 16, position.z);
        var playerVector = new THREE.Vector3().copy(basicScene.user.mesh.position);
        var enemyVector = this.mesh.position;
        this.direction = playerVector.sub(enemyVector).normalize();
        basicScene.world.bullets.push(this);
        basicScene.world.mesh.add(this.mesh);
        this.playerTarget = true;
    },
    fly: function () {
        if (this.life > 0) {
            if (distance(this.mesh.position, basicScene.user.mesh.position) < 32) {
                basicScene.user.applyDamage(this)
            }
            this.life -= 1;
        } else
            this.die();

    },
    die: function () {
        removeA(basicScene.world.bullets, this);
        basicScene.world.mesh.remove(this.mesh);

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
        this.die();
    }
});
