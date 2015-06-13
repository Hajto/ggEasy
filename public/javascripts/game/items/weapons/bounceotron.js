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
        bullet.mesh = new THREE.Mesh(new THREE.SphereGeometry(16,16,16), this.bulletMaterial);
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
    }
});
