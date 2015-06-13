var Bullet = Class.extend({
    init: function (args) {
        var geometry = new THREE.SphereGeometry(8, 8, 8);
        var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture('assets/textures/evilBox.png')
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.collider = new SAT.Circle(new SAT.Vector(this.mesh.position.x,this.mesh.position.z),8);

    },
    velocity: 10,
    collisionRemaining: 1,
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
    },
    shootPlayer: function(position){
        this.mesh.position.set(position.x,16,position.z);
        var playerVector = new THREE.Vector3().copy(basicScene.user.mesh.position);
        var enemyVector = this.mesh.position;
        this.direction = playerVector.sub(enemyVector).normalize();
        basicScene.world.playerTargetedBullets.push(this);
        basicScene.world.mesh.add(this.mesh);
    },
    fly: function () {
        this.collider.pos.x = this.mesh.position.x;
        this.collider.pos.y = this.mesh.position.z;

        var position = this.mesh.position;
        var direction = new THREE.Vector3().copy(this.direction);
        direction.multiplyScalar(this.velocity);

        var obstacles = basicScene.world.obstacles;

        for(var i=0; i < obstacles.length; i++){
            var response = new SAT.Response();
            var col = SAT.testPolygonCircle(obstacles[i].toPolygon(), this.collider,response);

            if(col) {
                this.mesh.position.add(new THREE.Vector3(response.overlapV.x,0,response.overlapV.y));
                this.direction.negate();
            }
            //console.log(col)
        }



        if (position.x > 1000 || position.x < -1000)
            if (this.collisionRemaining > 0) {
                direction.x *= -1;
                this.direction.x *= -1;
                this.collisionRemaining -= 1;
            } else
                this.die();
        if (position.z > 1000 || position.z < -1000)
            if (this.collisionRemaining > 0) {
                direction.z *= -1;
                this.direction.z *= -1;
                this.collisionRemaining -= 1;
            } else
                this.die();


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
    onPlayerHit: function(){
        this.die();
    }
});