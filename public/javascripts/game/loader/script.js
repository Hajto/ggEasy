var currentPlaying;
Modernizr.load([
    'assets/libs/javascript/three.min.js',
    'assets/libs/javascript/SAT.js',
    {
        load: [
            'assets/javascripts/game/utils.js',
            'assets/javascripts/game/app.js',
            'assets/javascripts/game/items/bullet.js',
            'assets/javascripts/game/items/point.js',
            'assets/javascripts/game/items/weapons/defaultWeapon.js',
            'assets/javascripts/game/items/weapons/bounceotron.js',
            'assets/javascripts/game/items/collectibles/healthPacket.js',
            "assets/javascripts/game/enemies/rusher.js",
            "assets/javascripts/game/enemies/speeder.js",
            "assets/javascripts/game/enemies/fatty.js",
            "assets/javascripts/game/enemies/boss.js",
            "assets/javascripts/game/enemies/shooter.js",
            'assets/javascripts/game/system/waves.js',
            'assets/javascripts/game/world.js',
            'assets/javascripts/game/character.js'
        ],
        complete: function () {

            basicScene = new BasicScene();
            function animate() {
                requestAnimationFrame(animate);
                basicScene.frame();
            }

            document.getElementById("menu").style.display = "none";
            basicScene.running = true;

            animate();
        }
    }, {
        load: [
            'assets/stylesheets/game/game.css',
            'assets/stylesheets/game/ui.css'
        ]
    }
]);
