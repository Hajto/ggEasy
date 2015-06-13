package controllers

import controllers.Application._
import play.api.mvc.Action

import scala.concurrent.Future

object RoutingController {

  def index = Action.async {
    Future.successful(Ok(views.html.index()))
  }
  def menu = Action.async {
    Future.successful(Ok(views.html.menu()))
  }
}
