package controllers

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

object Application extends Controller with MongoController {

  def $(a: (String, JsValueWrapper)*) = Json.obj(a: _*)

  val idReads: Reads[String] = (JsPath \ "_id").read[String]
  def collection(repo: String): JSONCollection = db.collection[JSONCollection](repo)
  def maps = collection("maps")

  def index = Action.async {
    Future.successful(Ok(views.html.editor()))
  }

}
