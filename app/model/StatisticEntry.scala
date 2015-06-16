package model

import play.api.libs.json.Json

object StatisticEntry {
  implicit val statisticEntryFormat = Json.format[StatisticEntry]
}
case class StatisticEntry(name: String, width:Int, height:Int, points: Int, killed: Int, seed: Long)