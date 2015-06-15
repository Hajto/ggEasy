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
    pathFindingCooldown: 0,
    specialAbility: 300,
    size: 24,
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 32, z);
    },
    follow: function () {
        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        if (this.specialAbility <= 0) {
            basicScene.world.randomSpawn();
            this.specialAbility = 300;
        }
        else
            this.specialAbility -= 1;

        if (this.pathFindingCooldown <= 0) {
            this.path = pathFinder.findShortestPath(this.mesh.position, basicScene.user.mesh.position);

            if(this.path.length > 0)
                this.pathFindingCooldown = 15;
        } else
            this.pathFindingCooldown -= 1;

        if (this.path != undefined && this.path.length > 0) {

            this.destination = new THREE.Vector3();
            this.destination.x = mapXToPosX(this.path[0].x);
            this.destination.z = mapYToPosZ(this.path[0].y);

            if (this.path[0].x == Math.round(pathFinder.findXInMapByPosX(this.mesh.position.x))
                && this.path[0].y == Math.round(pathFinder.findYInMapByPosZ(this.mesh.position.z))) {
                this.path.splice(0, 1);
                console.log("skracam")
            }
        }

        var playerVector = new THREE.Vector3().copy(this.destination);

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
