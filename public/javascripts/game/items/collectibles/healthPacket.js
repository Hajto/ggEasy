var HealthPacket = Class.extend({
    init: function (args) {
        'use strict';
        this.mesh = new THREE.Object3D();

        this.lamp = new THREE.Mesh(new THREE.CubeGeometry(32, 32, 32), new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(textures.collectibles.hp),
            side: THREE.DoubleSide
        }));

        this.mesh.add(this.lamp);
        this.update();
        this.size = 16
    },
    spawnAt: function (vector3) {
        this.mesh.position.set(vector3.x, 48, vector3.z);
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.collectibles.push(this);
    },
    rotate: function () {
        this.mesh.rotation.y += 0.01;
        this.mesh.rotation.z += 0.01;
        this.mesh.rotation.x += 0.01
    },
    update: function () {
        this.rotate();
        if (distance(basicScene.user.mesh.position, this.mesh.position) < this.size) {
            this.onCollect();
            this.die();
        }
    },
    maxDistance: 32,
    onCollect: function () {
        if (basicScene.user.health + 20 < basicScene.user.maxHealth)
            basicScene.user.health += 20;
        else
            basicScene.user.health = basicScene.user.maxHealth;
        basicScene.stats.setHealth()
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