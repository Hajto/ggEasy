package model

import play.api.libs.json.Json

object Level{
  implicit val format = Json.format[Level]
}
case class Level(name: String, width: Int, height: Int, map: List[List[Int]], playerSpawnPoint: Point, mobSpawnPoints: List[Point], rating: List[Int])
//case class Level(name: String, width: Int, height: Int, map: List[List[Int]])