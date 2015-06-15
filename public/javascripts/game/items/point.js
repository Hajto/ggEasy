var Point = Class.extend({
    init: function (args) {
        this.mesh = new THREE.Object3D();

        this.lamp = new THREE.Mesh(new THREE.SphereGeometry(32, 32, 32), new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            wireframe: true
        }));

        this.mesh.add(this.lamp)
    },
    size: 32,
    timeout: 300,
    spawnAt: function (vector3) {
        this.mesh.position.set(vector3.x, 48, vector3.z);
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.collectibles.push(this);
    },
    update: function(){
        this.rotate();
        if(distance(basicScene.user.mesh.position,this.mesh.position) < this.size){
            this.onCollect();
            this.die();
        }
    },
    rotate: function () {
        if (this.timeout > 0) {
            this.mesh.rotation.y += 0.01;
            this.mesh.rotation.z += 0.01;
            this.mesh.rotation.x += 0.01;
            this.timeout -= 1;
        } else {
            this.die();
        }
    },
    maxDistance: 32,
    onCollect: function () {
        basicScene.stats.addPoint(Math.round(Math.random() * 3))
    },
    die: function () {
        removeA(basicScene.world.collectibles, this);
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
    }
});