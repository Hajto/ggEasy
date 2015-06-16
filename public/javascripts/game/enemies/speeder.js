var Speeder = Class.extend({
    init: function (args) {
        var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture(textures.mobs.evilBox)
        });
        var geometry = new THREE.TorusGeometry(20, 6, 16, 100);
        this.mesh = new THREE.Mesh(geometry, material);

        this.collider = new SAT.Box(new SAT.Vector(this.mesh.position.x - 20, this.mesh.position.z - 10), 40, 40)
    },
    health: 10,
    velocity: 4 * speedMultiplier,
    initialVelocity: 5,
    damage: 25,
    timeout: 60,
    size: 20,
    pathFindingCooldown: 60,
    destination: new THREE.Vector3(),
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 100, z);
    },
    follow: function () {
        this.collider.pos.x = this.mesh.position.x - 20;
        this.collider.pos.y = this.mesh.position.z - 20;

        this.mesh.rotation.y += 0.05;

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

        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        this.direction = playerVector.sub(enemyVector).normalize();
        this.direction.y = 0;

        this.checkPlayerDistance();

        this.mesh.position.add(this.direction.multiplyScalar(this.velocity));
    },
    applyDamage: function (damage) {
        this.health -= damage;
        if (this.health <= 0) {
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
    },
    checkPlayerDistance: function(){
        if(this.timeout > 0){
            this.timeout -= 1;
        } else if (parseInt(distance(this.mesh.position, basicScene.user.mesh.position)) < 48) {
            basicScene.user.applyDamage(this);
            this.timeout = 60;
        }
    }
});