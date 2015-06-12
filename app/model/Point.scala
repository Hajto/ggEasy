package model

import play.api.libs.json.Json

object Point{
  implicit val format = Json.format[Point]
}
case class Point(x: Int, y: Int)
