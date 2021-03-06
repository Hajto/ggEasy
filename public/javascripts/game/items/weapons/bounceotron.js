var Bounceotron = Class.extend({
    init: function () {
        this.updateAmmo();
    },
    name: "Bounce-o-tron 9001",
    isIninityAmmo: false,
    maxAmmo: 20,
    ammo: 20,
    damage: 5,
    delay: 15,
    bulletMaterial: new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0x3e3e3e
    }),
    shoot: function (direction) {
        var bullet = new Bullet();
        bullet.mesh = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 16), this.bulletMaterial);
        bullet.collisionRemaining = 10;
        bullet.damage = this.damage;
        bullet.velocity = 30;
        bullet.direction = direction;
        bullet.shoot(basicScene.user.mesh.position);
        this.ammo -= 1;
        this.updateAmmo();
    },
    updateAmmo: function () {
        document.getElementById("weapon").innerHTML = this.name + " " + this.ammo + "/" + this.maxAmmo
    },
    dropAt: function (vector3) {
        var drop = new WeaponDrop();
        drop.setWeaponMesh(new THREE.Mesh(new THREE.CubeGeometry(32, 32, 32),
            new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture(textures.weapons.bounceotron),
                side: THREE.DoubleSide
            })
        ));
        drop.setWeapon(this);
        drop.spawnAt(vector3)
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
