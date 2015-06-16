var tileSize = 64;

function mapXToPosX(x) {
    return x * 64 - (map.width / 2 * 64) + 32;
}
function mapYToPosZ(y) {
    return y * 64 - (map.height / 2 * 64) + 32;
}


var World = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';

        this.spawnPointsObjects = [];
        this.bullets = [];
        this.playerTargetedBullets = [];
        this.enemies = [];
        this.collectibles = [];
        // Set the different geometries composing the room
        var mapWidth = map.width * 64, mapHeight = map.height * 64;
        this.offsetX = map.width / 2 * 64;
        this.offsetZ = map.height / 2 * 64;

        var background = new THREE.Mesh(new THREE.SphereGeometry(3000, 64, 64), new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture(textures.general.background)
        }));

        var ground = new THREE.PlaneGeometry(mapWidth, mapHeight),
            height = 128,
            walls = [
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height),
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height)
            ],
            material = new THREE.MeshLambertMaterial(args);
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();

        // Set and add the ground
        this.ground = new THREE.Mesh(ground, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.mesh.add(this.ground);
        this.mesh.add(background);
        // Set and add the walls
        this.walls = [];
        for (i = 0; i < walls.length; i += 1) {
            this.walls.push(new THREE.Mesh(walls[i], material));
            this.walls[i].position.y = height / 2;
            this.mesh.add(this.walls[i]);

            this.light = new THREE.PointLight();
            this.light.position.set(this.walls[i].position.x, 5000, this.walls[i].position.z);
            this.light.intensity = 1;
            this.light.distance = 1000;
            this.mesh.add(this.light);
        }
        this.walls[0].rotation.y = -Math.PI / 2;
        this.walls[0].position.x = this.offsetX;
        this.walls[1].rotation.y = Math.PI;
        this.walls[1].position.z = this.offsetZ;
        this.walls[2].rotation.y = Math.PI / 2;
        this.walls[2].position.x = -this.offsetX;
        this.walls[3].position.z = -this.offsetZ;

        this.obstacles = [
            new SAT.Box(new SAT.Vector(-mapWidth / 2, -mapHeight / 2), mapWidth, 1),
            new SAT.Box(new SAT.Vector(-mapWidth / 2, -mapHeight / 2), 1, mapHeight),
            new SAT.Box(new SAT.Vector(-mapWidth / 2, mapHeight / 2), mapWidth, 1),
            new SAT.Box(new SAT.Vector(mapWidth / 2, -mapHeight / 2), 1, mapHeight)
        ];

        for (var i = 0; i < map.map.length; i++) {
            for (var j = 0; j < map.map[i].length; j++) {
                if (map.map[i][j] == 0) {
                    var cubeMesh = new THREE.Mesh(new THREE.CubeGeometry(64, 64, 64), material);
                    cubeMesh.translateX(i * 64 - this.offsetX + 32);
                    cubeMesh.translateZ(j * 64 - this.offsetZ + 32);
                    cubeMesh.translateY(32);
                    this.mesh.add(cubeMesh);

                    var collider = new SAT.Box(new SAT.Vector(cubeMesh.position.x - 32, cubeMesh.position.z - 32), 64, 64);
                    this.obstacles.push(collider);
                }
            }
        }

        for (var i = 0; i < map.mobSpawnPoints.length; i++) {
            this.spawnPoints.push(new THREE.Vector3(mapXToPosX(map.mobSpawnPoints[i].x), 32, mapYToPosZ(map.mobSpawnPoints[i].y)));
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(64, 64),
                new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    map: THREE.ImageUtils.loadTexture(textures.environment.mobSpawn),
                    transparent: true, opacity: 0.5, color: 0xFF0000
                })
            );
            mesh.position = new THREE.Vector3(mapXToPosX(map.mobSpawnPoints[i].x), 2, mapYToPosZ(map.mobSpawnPoints[i].y));
            mesh.rotation.x = Math.PI / 2;
            this.spawnPointsObjects.push(mesh);
            this.mesh.add(mesh)
        }

    },
    playerCollide: function () {
        for (var a = 0; a < this.obstacles.length; a++) {

            var response = new SAT.Response();
            var col = SAT.testPolygonPolygon(this.obstacles[a].toPolygon(), basicScene.user.collider.toPolygon(), response);

            if (col) {
                var player = basicScene.user;
                player.mesh.position.add(new THREE.Vector3(response.overlapV.x, 0, response.overlapV.y));
            }
        }
    },
    fluBullets: function () {
        for (var i = 0; i < this.bullets.length; i++)
            this.bullets[i].fly()
    },
    collectiblesUpdate: function () {
        for (var i = 0; i < this.collectibles.length; i++)
            this.collectibles[i].update();
    },
    spawnPoints: [],
    spawnDelay: 240,
    currentWave: 0,
    enemyKinds: [Rusher, Speeder],
    update: function () {
        /*for(var i = 0; i< this.spawnPointsObjects.length; i++)
         this.spawnPointsObjects[i].rotation.z += 0.03*/

        this.playerCollide();
        this.fluBullets();
        this.updateEnemies();
        //this.spawn();
        this.collectiblesUpdate();
        basicScene.user.update();
    },
    spawn: function () {
        if (this.spawnDelay <= 0) {
            for (var i = 0; i < waves[this.currentWave].numberOfEnemies; i++) {
                this.randomSpawn();
            }
            for (var j = 0; j < waves[this.currentWave].extra.length; j++) {
                var enemy = new waves[this.currentWave].extra[j]();
                var chosenSpawnPoint = this.spawnPoints[getRandomFrom(this.spawnPoints.length - 1)];
                enemy.velocity = enemy.initialVelocity * speedMultiplier;
                enemy.spawnAt(chosenSpawnPoint.x, chosenSpawnPoint.y, chosenSpawnPoint.z);
            }
            if (this.currentWave < waves.length - 1)
                this.currentWave += 1;
            basicScene.stats.setWave(this.currentWave);
            this.spawnDelay = waves[this.currentWave].duration;
            speedMultiplier += 0.3;
            basicScene.user.velocity = speedMultiplier * basicScene.user.initialVelocity;
            basicScene.stats.addPoint(5);
        } else {
            if (this.enemies.length > 0 && this.spawnDelay > 300) {
                this.spawnDelay = 300
            } else
                this.spawnDelay -= 1;
            document.getElementById("clock").innerHTML = "Remaining time: " + Math.round(this.spawnDelay / 60)
        }
    },
    randomSpawn: function () {
        var enemy = new this.enemyKinds[getRandomFrom(this.enemyKinds.length - 1)]();
        var chosenSpawnPoint = this.spawnPoints[getRandomFrom(this.spawnPoints.length - 1)];
        enemy.velocity = enemy.initialVelocity * speedMultiplier;
        enemy.spawnAt(chosenSpawnPoint.x, chosenSpawnPoint.y, chosenSpawnPoint.z);
    },
    updateEnemies: function () {
        for (var i = 0; i < this.enemies.length; i++)
            this.enemies[i].follow();
    }
});

function getRandomFrom(n) {
    return Math.round(Math.random() * n);
}

