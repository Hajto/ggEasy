function ajaxAPI(haitoRequest){
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    } else {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4) {
            if (xmlhttp.status == 200) {
                haitoRequest.onSuccess(xmlhttp.responseText);
            } else {
                haitoRequest.onError(xmlhttp.responseText);
            }
        }
    };
    xmlhttp.open(haitoRequest.method,haitoRequest.url,true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.setRequestHeader("Accept","application/json, application/json");
    xmlhttp.send(haitoRequest.data);
}

function _haitoRequest(url, method, data, onSuccess, onError){
    this.url = url;
    this.method = method;
    this.data = data;
    this.onSuccess = onSuccess;
    this.onError = onError;
}

function uploadMap() {
    var data = exportToJson();
    var connection = new _haitoRequest(
        "upsert",
        "POST",
        data,
        function (response) {
            if(confirm("Informacja została zapisana pomyślnie czy chcesz przejść do widoku gry?"))
                document.location.href = "../game/usermade/"+document.getElementById("mapName").value;
        }, function (response) {
            alert(response)
        }
    );
    console.log(connection + "connection");

    ajaxAPI(connection)
}
