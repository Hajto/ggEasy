package controllers

import controllers.Application._
import model.{Level, Point}
import play.api.libs.json.Json
import play.api.mvc.Action
import play.twirl.api.Html

import scala.concurrent.Future
import scala.util.Random

object LevelGen {

  def gameFromRandomSeed = Action.async {
    Future.successful(Redirect(routes.LevelGen.gameFromSeed(System.currentTimeMillis / 1000)))
  }

  def gameFromSeed(seed: Long) = Action.async {
    val gen = new Random(seed)
    val height = gen.nextInt(50) + 25
    val width = gen.nextInt(50) + 25

    Future.successful(Redirect(routes.LevelGen.gameFromWidthHeight(width,height,seed)))
  }

  def gameFromWidthSameAsHeight(width: Int, seed:Long) = Action.async {
    Future.successful(Redirect(routes.LevelGen.gameFromWidthHeight(width,width,seed)))
  }

  def gameFromWidthHeight(width: Int, height: Int, seed: Long) = Action.async {
    val mobSpawn = new Random(seed).nextInt(width*height/30)
    Future.successful(Redirect(routes.LevelGen.gameFromWidthHeightMobsSpawnCountAndSeed(width,height,mobSpawn,seed)))
  }

  def gameFromWidthHeightMobsSpawnCountAndSeed(width: Int, height: Int, mobSpawners: Int, seed: Long) = Action.async {
    val gen = new Random(seed)

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

    def generatePlayerSpawnPoint : Point = {
      val x = gen.nextInt(height)
      val y = gen.nextInt(width)
      if(list(y)(x) == 1) Point(y,x)
      else generatePlayerSpawnPoint
    }

    val level = new Level("generated",width,height,list,generatePlayerSpawnPoint,generateSpawnPoints(mobSpawners),None)

    Future.successful(Ok(views.html.game(Html(Json.toJson(level).toString()),seed)))
  }
}
