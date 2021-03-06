var Bullet = Class.extend({
    init: function (args) {
        var geometry = new THREE.SphereGeometry(8, 8, 8);
        var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture(textures.bullets.defaul)
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.collider = new SAT.Circle(new SAT.Vector(this.mesh.position.x - 8, this.mesh.position.z - 8), 8);

    },
    velocity: 10,
    collisionRemaining: 3,
    collisionCooldown: 0,
    direction: new THREE.Vector3(0, 0, 0),
    setTarget: function (target) {
        var playerVector = new THREE.Vector3().copy(target.position);
        var enemyVector = this.mesh.position;
        this.direction = playerVector.sub(enemyVector).normalize();
        return this.direction;
    },
    shoot: function (startVector) {
        this.mesh.position.set(startVector.x, startVector.y, startVector.z);
        basicScene.world.bullets.push(this);
        basicScene.world.mesh.add(this.mesh);
        this.playerTarget = false;
    },
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
        this.collider.pos.x = this.mesh.position.x;
        this.collider.pos.y = this.mesh.position.z;

        var position = this.mesh.position;
        var direction = new THREE.Vector3().copy(this.direction);
        direction.multiplyScalar(this.velocity);

        if (this.collisionCooldown <= 0 && this.collisionRemaining > 0) {
            var obstacles = basicScene.world.obstacles;

            for (var i = 0; i < obstacles.length; i++) {
                var response = new SAT.Response();
                var col = SAT.testPolygonCircle(obstacles[i].toPolygon(), this.collider, response);

                if (col) {
                    if (response.overlapV.x != 0) this.direction.x *= -1;
                    else this.direction.z *= -1;
                    this.mesh.position.add(new THREE.Vector3(response.overlapV.x, 0, response.overlapV.y));
                    this.collisionCooldown = 2;
                    this.collisionRemaining -= 1;
                }
            }
        } else if (this.collisionRemaining == 0) {
            this.die();
        } else {
            this.collisionCooldown -= 1
        }

        if(this.playerTarget){
           if(distance(this.mesh.position, basicScene.user.mesh.position) < 32){
               basicScene.user.applyDamage(this)
           }
        } else {
            var mobs = basicScene.world.enemies;
            for (var i = 0; i < mobs.length; i++) {
                var mob = mobs[i];
                if (distance(mob.mesh.position, this.mesh.position) < mob.size + 5) {
                    mob.applyDamage(this.damage);
                    this.die();
                }

            }
        }

        this.mesh.position.add(direction)
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

function distance(v1,v2){
    var dx = v1.x - v2.x;
    var dz = v1.z - v2.z;
    return Math.sqrt(dx*dx + dz*dz)
}