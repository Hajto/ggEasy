var PathFinder = Class.extend({
    init: function () {
        this.graph = new Graph(map.map)
    },
    findXInMapByPosX: function (x) {
        return Math.round((x + map.width / 2 * 64-32) / 64)
    },
    findYInMapByPosZ: function (y) {
        return Math.round((y + map.height / 2 * 64-32) / 64)
    },
    findPosInGrapthByVector: function (Vector3) {
        var x = this.findXInMapByPosX(Vector3.x);
        var y = this.findYInMapByPosZ(Vector3.z);
        return {x: x, y: y}
    },
    getGridFromVector: function(Vector3){
        var graphPos = this.findPosInGrapthByVector(Vector3);
        console.log();
        return this.graph.grid[graphPos.x][graphPos.y]
    },
    findShortestPath: function(source, destination){
        var path = astar.search(this.graph,this.getGridFromVector(source),this.getGridFromVector(destination),true);
        if(path.length == 0){
            this.graph = new Graph(map.map)
        }
        return path
    },
    findPlayer: function(source){
        this.findShortestPath(source, basicScene.user.mesh.position)
    },
    debug: function(){
        var debugPath = pathFinder.findShortestPath(new THREE.Vector3(0,0,0), basicScene.user.mesh.position)
        for(var i = 0; i < debugPath.length; i++){
            var mesh = new THREE.Mesh(new THREE.CubeGeometry(16,4*i,16), new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0xff00ff
            }));
            mesh.position.x = mapXToPosX(debugPath[i].x);
            mesh.position.z = mapYToPosZ(debugPath[i].y);
            basicScene.world.mesh.add(mesh);
        }
    }
});
var pathFinder = new PathFinder();