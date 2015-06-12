function init(){
    document.getElementById("generateTable").addEventListener("click",function(){
        var width = parseInt(document.getElementById("mapWidth").value);
        var height = parseInt(document.getElementById("mapHeight").value);
        if(width % 64 == 0 && height % 64 == 0) {
            var table = generateEditTable(width/64, height/64);
            var holder = document.getElementById("wallEditor");
            holder.innerHTML = "";
            holder.appendChild(table);
            document.getElementById("64Warning").style.display = "none";
        } else {
            document.getElementById("64Warning").style.display = "block";
        }
    },false);

    function generateEditTable(width, height){
        var table = document.createElement("table");

        for(var i = 0; i < width; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < height; j++) {
                var cell = document.createElement("td");
                cell.setAttribute("data-row", i.toString());
                cell.setAttribute("data-col", j.toString());
                cell.setAttribute("data-selected","false");
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        return table;
    }

}
