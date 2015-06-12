var empty = {
    effect: function(i,j){
        map[i][j] = 1
    },
    className: "empty"
}, wall = {
    effect: function(i,j){
        map[i][j] = 0
    },
    className: "wall"
}, playerSpawn = {
    effect: function(i,j){
        playerSpawnPoint.x = parseInt(i);
        playerSpawnPoint.y = parseInt(j);
    },
    className: "playerSpawn"
}, mobSpawn = {
    effect: function(i,j){
        var indexOrNot = mobSpawnIsDefined(i,j);
        if( indexOrNot == -1)
            mobSpawnPoints.push({x:parseInt(i),y:parseInt(j)});
        else
            mobSpawnPoints.splice(indexOrNot,1);
    },
    className: "mobSpawn"
};

var map = [];
var nextPlace = wall;
var playerSpawnPoint = {
    x:0,
    y:0
};
var mobSpawnPoints = [];

function init(){
    var width = repoData.width;
    var height = repoData.height;

    playerSpawnPoint = repoData.playerSpawnPoint;
    mobSpawnPoints = repoData.mobSpawnPoints;
    var table = generateEditTable(width, height);
    var holder = document.getElementById("wallEditor");
    holder.innerHTML = "";
    holder.appendChild(table);
    document.getElementById("64Warning").style.display = "none";

    for(var i = 0; i < mobSpawnPoints.length; i++){
        var spawn = mobSpawnPoints[i];
        document.getElementById(spawn.x+ " " + spawn.y).className = "mobSpawn"
    }

    document.getElementById("generateTable").addEventListener("click",function(){
        var width = parseInt(document.getElementById("mapWidth").value);
        var height = parseInt(document.getElementById("mapHeight").value);
        if(width > 0 && height > 0) {
            var table = generateEditTable(width, height);
            var holder = document.getElementById("wallEditor");
            holder.innerHTML = "";
            holder.appendChild(table);
            document.getElementById("64Warning").style.display = "none";
        } else {
            document.getElementById("64Warning").style.display = "block";
        }
    },false);
    document.getElementById("wallPlacer").addEventListener("click", function () {
        nextPlace = wall;
    },false);
    document.getElementById("mobSpawnPointPlacer").addEventListener("click", function () {
        nextPlace = mobSpawn;
    },false);
    document.getElementById("playerSpawnPointPlacer").addEventListener("click", function () {
        nextPlace = playerSpawn;
    },false);

    function generateEditTable(width, height){
        var table = document.createElement("table");
        map = [];

        for(var i = 0; i < width; i++) {
            var row = document.createElement("tr");
            map[i] = [];
            for (var j = 0; j < height; j++) {
                var cell = document.createElement("td");
                if(repoData.map[i][j] == undefined || repoData.map[i][j]) {
                    map[i][j] = 1;
                    cell.className = "empty";
                } else if(repoData.map[i][j] == 0) {
                    map[i][j] = 0;
                    cell.className = "wall";
                }

                cell.id = i+" "+j;
                cell.setAttribute("data-row", i.toString());
                cell.setAttribute("data-col", j.toString());

                cell.addEventListener("click",function(event){
                    var target = event.target;
                    var i = target.getAttribute("data-row");
                    var j = target.getAttribute("data-col");
                    applyEffect(i,j,target)
                },false);

                row.appendChild(cell);
            }
            table.appendChild(row);
        }

        return table;
    }

}

function applyEffect(i,j,target){
    if(["wall","playerSpawn","mobSpawn"].indexOf(target.className) == -1){
        target.className = nextPlace.className;
        nextPlace.effect(i,j)
    } else
        target.className = "empty";
}

function mobSpawnIsDefined(x,y){
    for(var i = 0; i < mobSpawnPoints.length; i++)
        if(mobSpawnPoints[i].x == x && mobSpawnPoints[i].y == y)
            return i;
    return -1;
}

function exportToJson(){
    return JSON.stringify({
        map: map,
        width: map.length,
        height: map[0].length,
        playerSpawnPoint: playerSpawnPoint,
        mobSpawnPoints: mobSpawnPoints,
        name: "temp"
    })
}