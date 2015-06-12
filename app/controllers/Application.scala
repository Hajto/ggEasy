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

  def index = Action.async {
    val cursor: Cursor[JsObject] = collection("default").find($("name"->"temp")).cursor[JsObject]
    val futureSlavesList: Future[List[JsObject]] = cursor.collect[List]()
    futureSlavesList.map { pins =>
      if(pins.nonEmpty)
        Ok(views.html.editor("default", Html(Json.toJson(pins.head).toString())))
      else
        Ok(views.html.editor("default", Html("{}")))
    }
  }

  def upsertMap = Action.async(parse.json) { implicit req =>
    req.body.validate[Level] match {
      case JsSuccess(level, _) => {
        collection("default").update($("name" -> level.name), $("$set" -> Json.toJson(level)), upsert = true).map { last =>
          if (last.ok)
            Ok("ok")
          else
            BadRequest("DBError")
        }
      }
      case err@JsError(_) => Future.successful(BadRequest(err.toString()))
    }
  }

  //def selectAll(mapName: String) =

}
