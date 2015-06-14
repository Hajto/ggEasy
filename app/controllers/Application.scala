package controllers

import model.Level
import model.Point
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

import scala.util.Random

object Application extends Controller with MongoController {

  def $(a: (String, JsValueWrapper)*) = Json.obj(a: _*)

  val idReads: Reads[String] = (JsPath \ "_id").read[String]

  def collection(repo: String): JSONCollection = db.collection[JSONCollection](repo)

  def maps = collection("maps")

  def game(levelName: String) = Action.async {
    selectMaps($("name" -> levelName)).map { elems =>
      if (elems.nonEmpty)
        Ok(views.html.game(Html(Json.toJson(elems.head).toString())))
      else
        Ok("No such level")
    }
  }

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

  def gameFromRandomSeed = Action.async {
    Future.successful(Redirect(routes.Application.gameFromSeed(System.currentTimeMillis / 1000)))
  }

  def gameFromSeed(seed: Long) = Action.async {
    val gen = new Random(seed)

    val height = gen.nextInt(15) + 10
    val width = gen.nextInt(15) + 10

    val list = List.fill(width)(List.fill(height)(if (gen.nextInt(0 to 100 length) > 90) 0 else 1))

    def generateSpawnPoints(count: Int) = {
      def loop(count: Int, acc: List[Point]): List[Point] = {
        if (count > 0) {
          val x = gen.nextInt(height)
          val y = gen.nextInt(width)

          if (list(y)(x) == 1) loop(count - 1, Point(y, x) :: acc)
          else loop(count, acc)
        } else
          acc
      }

      loop(count, List())
    }

    val level = new Level("generated",width,height,list,new Point(0,0),generateSpawnPoints(3),None)

    Future.successful(Ok(views.html.editor("generated",Html(Json.toJson(level).toString()))))
  }
}
