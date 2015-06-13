var HealthPacket = Class.extend({
    init: function (args) {
        this.mesh = new THREE.Object3D();

        this.lamp = new THREE.Mesh(new THREE.CubeGeometry(32, 32, 32), new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("assets/textures/healthPacket.png"),
            side: THREE.DoubleSide
        }));

        this.mesh.add(this.lamp)
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
    maxDistance: 32,
    onCollect: function () {
        if (basicScene.user.health + 20 < basicScene.user.maxHealth)
            basicScene.user.health += 20;
        else
            basicScene.user.health = basicScene.user.maxHealth;
        basicScene.stats.setHealth()
    }
});