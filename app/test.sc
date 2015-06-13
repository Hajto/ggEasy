import model.Level
import play.api.libs.json.{JsString, Json}

val testString = """{"map":[[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,0,0,1,1,1,1],[1,1,1,0,0,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1]],"width":10,"height":10,"playerSpawnPoint":{"x":3,"y":7},"mobSpawnPoints":[{"x":1,"y":2}],"name":"temp","rating":[]}"""

val value = Json.parse(testString)

val parsed = Json.fromJson[Level](value)