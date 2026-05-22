package com.stickynotes

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class StickyNotesApplication

fun main(args: Array<String>) {
	runApplication<StickyNotesApplication>(*args)
}
