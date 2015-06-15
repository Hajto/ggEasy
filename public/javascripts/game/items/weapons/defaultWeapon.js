var DefaultWeapon = Class.extend({
    init: function () {
        document.getElementById("weapon").innerHTML = this.name + " " + this.ammo + "/" + this.maxAmmo
    },
    name: "Pew pew gun",
    isIninityAmmo: true,
    maxAmmo: 0,
    ammo: 0,
    damage: 5,
    delay: 15,
    bulletMaterial: new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        map: THREE.ImageUtils.loadTexture(textures.bullets.defaul)
    }),
    shoot: function (direction) {
        var bullet = new Bullet();
        bullet.mesh.material = this.bulletMaterial;
        bullet.damage = this.damage;
        bullet.direction = direction;
        bullet.shoot(basicScene.user.mesh.position);
        this.updateAmmo();
    },
    updateAmmo: function () {
        document.getElementById("weapon").innerHTML = this.name + " " + this.ammo+"/"+this.maxAmmo
    }
});
