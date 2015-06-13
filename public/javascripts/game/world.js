var World = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the different geometries composing the room
        var mapWidth = map.width*64, mapHeight = map.width*64;
        this.offsetX = map.width/2*64;
        this.offsetZ = map.height/2*64;
        var background = new THREE.Mesh(new THREE.SphereGeometry(3000, 64, 64), new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: THREE.ImageUtils.loadTexture('assets/textures/background.png')
        }));

        var ground = new THREE.PlaneGeometry(mapWidth, mapHeight),
            height = 128,
            walls = [
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height),
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height)
            ],
            material = new THREE.MeshLambertMaterial(args),
            i;
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
        }
        this.walls[0].rotation.y = -Math.PI / 2;
        this.walls[0].position.x = ground.width / 2;
        this.walls[1].rotation.y = Math.PI;
        this.walls[1].position.z = ground.height / 2;
        this.walls[2].rotation.y = Math.PI / 2;
        this.walls[2].position.x = -ground.width / 2;
        this.walls[3].position.z = -ground.height / 2;

        this.obstacles = [
            new SAT.Box(new SAT.Vector( -mapWidth/2,-mapWidth/2), mapWidth, 1),
            new SAT.Box(new SAT.Vector( -mapWidth/2,-mapWidth/2), 1, mapHeight),
            new SAT.Box(new SAT.Vector( -mapWidth/2,mapWidth/2), mapWidth, 1),
            new SAT.Box(new SAT.Vector( mapWidth/2,-mapWidth/2), 1, mapHeight)
        ];

        for(var i =0; i<map.map.length; i++){
            for(var j=0; j<map.map[i].length; j++){
                if(map.map[i][j] == 0){
                    var cubeMesh = new THREE.Mesh(new THREE.CubeGeometry(64,64,64),new THREE.MeshBasicMaterial({
                        wireframe:true,
                        color: 0xff0000
                    }));
                    cubeMesh.translateX(i*64-this.offsetX);
                    cubeMesh.translateZ(j*64-this.offsetZ);
                    cubeMesh.translateY(32);
                    this.mesh.add(cubeMesh);

                    var collider = new SAT.Box(new SAT.Vector(cubeMesh.position.x-30,cubeMesh.position.z-30),60,60);
                    this.obstacles.push(collider);
                    var colliderPolygon = collider.toPolygon();
                    console.log(colliderPolygon);
                    for(var x = 0; x < colliderPolygon.points.length; x++){
                        var test = new THREE.Mesh(new THREE.CubeGeometry(8,8,8),material);
                        test.position.x = colliderPolygon.pos.x + colliderPolygon.calcPoints[x].x;
                        test.position.z = colliderPolygon.pos.y + colliderPolygon.calcPoints[x].y;
                        this.mesh.add(test)
                    }

                }
            }
        }

    },
    playerCollide: function(){
        for(var a = 0; a < this.obstacles.length; a++){

            var response = new SAT.Response();
            var col = SAT.testPolygonPolygon(this.obstacles[a].toPolygon(), basicScene.user.collider.toPolygon(), response);

            if(col){
                var player = basicScene.user;
                player.mesh.position.add(new THREE.Vector3(response.overlapV.x,0,response.overlapV.y));
                player.direction = new THREE.Vector3(0,0,0);
                basicScene.stopMove();
                player.mesh.position.add(new THREE.Vector3(response.overlapV.x,0,response.overlapV.y));
            }
        }
    },
    spawnPoints: [
        
    ],
    spawnDelay: 240,
    currentWave: 0,
    enemyKinds: [Rusher, Speeder],
    update: function(){
        this.playerCollide();
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
        } else{
            this.spawnDelay -= 1;
            document.getElementById("clock").innerHTML = "Remaining time: "+Math.round(this.spawnDelay/60)
        }
    },
    randomSpawn: function () {
        var enemy = new this.enemyKinds[getRandomFrom(this.enemyKinds.length - 1)]();
        var chosenSpawnPoint = this.spawnPoints[getRandomFrom(this.spawnPoints.length - 1)];
        enemy.velocity = enemy.initialVelocity * speedMultiplier;
        enemy.spawnAt(chosenSpawnPoint.x, chosenSpawnPoint.y, chosenSpawnPoint.z);
    }
});

function getRandomFrom(n) {
    return Math.round(Math.random() * n);
}

var map = {
"_id": {
    "$oid": "557bf35e0db630d7038a3828"
},
"name": "level1",
    "width": 20,
    "height": 20,
    "map": [
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1
    ],
    [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
    ]
],
    "playerSpawnPoint": {
    "x": 2,
        "y": 3
},
"mobSpawnPoints": [
    {
        "x": 3,
        "y": 8
    },
    {
        "x": 6,
        "y": 6
    },
    {
        "x": 7,
        "y": 9
    },
    {
        "x": 6,
        "y": 10
    },
    {
        "x": 19,
        "y": 9
    },
    {
        "x": 19,
        "y": 17
    }
],
    "rating": []
}