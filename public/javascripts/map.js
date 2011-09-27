var selectedX;
var selectedY;
var selectedUnit;
var selectedSquare = null;
var unit_x;
var unit_y;

function selectSquare(evt) {
    if(evt.target.id.toString().indexOf("map_cell")>=0){
        if(selectedSquare != null) {
            selectedSquare.setAttribute("class", "map_cell");
        }

        ss = evt.target;
        ss.setAttribute("class", "selected_map_cell");
        selectedSquare = ss;

        xy = parseXYFromMapCellId(evt.target.id.toString());

        moveUnit(xy[0], xy[1]);
    }
}

function parseXYFromMapCellId(id){
    x_yString = id.split("map_cell_")[1];

    x_y = x_yString.split("_");

    return x_y;
}

function removeUnit(x,y) {
     mapCell = document.getElementById("map_cell_"+x+"_"+y);
     mapCell.innerHTML = ""
}

function moveUnit(x,y) {
    if(unit_x != null && unit_y != null) {
        removeUnit(unit_x,unit_y);
    }
    unit_x = x;
    unit_y = y;
    mapCell = document.getElementById("map_cell_"+x+"_"+y);
    mapCell.innerHTML = "<img alt=\"Green_knight_east\" class=\"unit_image\" height=\"50\" src=\"/images/green_knight_east.bmp\" width=\"50\" />"

}

