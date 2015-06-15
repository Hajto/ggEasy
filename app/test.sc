import java.nio.charset.StandardCharsets
import java.nio.file.{Paths, Files}

import scala.io._
import scala.reflect.io.File

val html = Source.fromURL("https://github.com/Hajtosek/actorWebSocketRequestKicker.git")
val s = html.mkString
println(s)

File("filename").writeAll("hello world")