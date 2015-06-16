package utils.helpers

import controllers.Application._
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper
import play.modules.reactivemongo.json.collection.JSONCollection

object Mongo {
  def $(a: (String, JsValueWrapper)*) = Json.obj(a: _*)
  def collection(repo: String): JSONCollection = db.collection[JSONCollection](repo)
}
