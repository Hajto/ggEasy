package controllers

import controllers.Application._
import model.{Level, StatisticEntry}
import play.api.libs.json.{JsError, JsSuccess, JsValue}
import play.api.mvc.{Action, Controller}
import play.modules.reactivemongo.MongoController
import reactivemongo.api.Cursor
import scala.concurrent.ExecutionContext.Implicits.global

import utils.helpers.Mongo._

import scala.concurrent.Future

object Stats extends Controller with MongoController{
  def stats = collection("stats")

  def registerEntry = Action.async(parse.json){ implicit request =>
    request.body.validate[StatisticEntry] match {
      case JsSuccess(entry,_) => stats.update($("name" -> entry.name),$("$set"->entry),upsert = true).map { last =>
        if(last.ok) Ok("Success")
        else BadRequest("DatabaseError")
      }
      case err@JsError(_) => Future.successful(BadRequest(err.toString))
    }
  }

  def select(selector: JsValue) = {
    val cursor: Cursor[JsValue] = stats.find(selector).cursor[JsValue]
    val futureSlavesList: Future[List[JsValue]] = cursor.collect[List]()
    futureSlavesList
  }

  def listEntries = Action.async {
    select($()).map { elem =>
      elem.map { jsValue =>
        jsValue.validate[StatisticEntry].get
      }: List[StatisticEntry]
    }.collect {
      case (list: List[StatisticEntry]) => Ok(views.html.statsdisplay(list))
    }
  }
}
