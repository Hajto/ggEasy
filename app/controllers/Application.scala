package controllers

import model.Level
import play.api._
import play.api.libs.json._
import play.modules.reactivemongo.json.BSONFormats._
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.twirl.api.Html
import reactivemongo.api.Cursor
import reactivemongo.bson.BSONObjectID
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

import scala.io.Source

import model.Level.format
import model.Point.format

object Application extends Controller with MongoController {

  def $(a: (String, JsValueWrapper)*) = Json.obj(a: _*)

  val idReads: Reads[String] = (JsPath \ "_id").read[String]

  def collection(repo: String): JSONCollection = db.collection[JSONCollection](repo)

  def maps = collection("maps")

  def selectMaps(selector: JsValue) = {
    val cursor: Cursor[JsValue] = maps.find(selector).cursor[JsValue]
    val futureSlavesList: Future[List[JsValue]] = cursor.collect[List]()
    futureSlavesList
  }

  def edit(map: String) = Action.async {
    selectMaps($("name" -> map)).map { elems =>
      if (elems.nonEmpty)
        Ok(views.html.editor(map, Html(Json.toJson(elems.head).toString())))
      else
        Ok(views.html.editor(map, Html("{}")))
    }
  }

  def upsertMap = Action.async(parse.json) { implicit req =>
    req.body.validate[Level] match {
      case JsSuccess(level, _) => {
        maps.update($("name" -> level.name),
          $("$set" -> Json.toJson(level), "$setOnInsert" -> $("rating" -> Json.toJson(List[Int]()))),
          upsert = true).map { last =>
          if (last.ok)
            Ok("ok")
          else
            BadRequest("DBError")
        }
      }
      case err@JsError(_) => Future.successful(BadRequest(err.toString))
    }
  }

  def selectAll = Action.async {
    selectMaps($()).map { elem =>
      elem.map { jsValue =>
        jsValue.validate[Level].get
      }: List[Level]
    }.collect {
      case (list: List[Level]) => Ok(list.toString)
    }
  }

  def showAll = Action.async {
    selectMaps($()).map { elem =>
      elem.map { jsValue =>
        jsValue.validate[Level].get
      }: List[Level]
    }.collect {
      case (list: List[Level]) => Ok(views.html.levelChooser(list))
    }
  }

}
