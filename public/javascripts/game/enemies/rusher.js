var Rusher = Class.extend({
    init: function (args) {
        var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture(textures.bullets.dark)
        });
        var geometry = new THREE.CubeGeometry(32, 32, 32);
        this.mesh = new THREE.Mesh(geometry, material);
    },
    health: 15,
    velocity: 3*speedMultiplier,
    initialVelocity: 3,
    damage: 25,
    pathFindingCooldown: 0,
    timeout: 60,
    size : 24,
    spawnAt: function (x, y, z) {
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.enemies.push(this);
        this.mesh.position.set(x, 100, z);
    },
    follow: function () {
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
                //console.log("skracam")
            }
        }

        var playerVector = new THREE.Vector3().copy(this.destination);
        var enemyVector = new THREE.Vector3().copy(this.mesh.position);

        this.checkPlayerDistance();

        this.direction = playerVector.sub(enemyVector).normalize();
        this.direction.y = 0;

        this.mesh.position.add(this.direction.multiplyScalar(this.velocity));
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
    checkPlayerDistance: function(){
        if(this.timeout > 0){
            this.timeout -= 1;
        } else if (parseInt(distance(this.mesh.position, basicScene.user.mesh.position)) < 48) {
            basicScene.user.applyDamage(this);
            this.timeout = 60;
        }
    },
    onPlayerHit: function () {
        this.timeout = 60;
        //this.die();
        console.log("Bah")
    }
});