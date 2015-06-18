var WeaponDrop = Class.extend({
    init: function (args) {
        this.mesh = new THREE.Object3D();

        this.lamp = new THREE.Mesh(new THREE.CubeGeometry(32, 32, 32), new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("assets/textures/healthPacket.png"),
            side: THREE.DoubleSide
        }));

        this.mesh.add(this.lamp)
    },
    size:32,
    containingWeapon: null,
    spawnAt: function (vector3) {
        this.mesh.position.set(vector3.x, 48, vector3.z);
        basicScene.world.mesh.add(this.mesh);
        basicScene.world.collectibles.push(this);
    },
    update: function () {
        this.mesh.rotation.y += 0.01;
        this.mesh.rotation.z += 0.01;
        this.mesh.rotation.x += 0.01;

        if (distance(basicScene.user.mesh.position, this.mesh.position) < this.size) {
            this.onCollect();
            this.die();
        }
    },
    setWeapon: function(weapon){
        this.containingWeapon = weapon;
    },
    setWeaponMesh: function(mesh){
        this.mesh = mesh;
    },
    maxDistance: 32,
    onCollect: function () {
        basicScene.user.currentWeapon = this.containingWeapon;
    }
});