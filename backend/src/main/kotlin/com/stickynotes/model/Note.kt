package com.stickynotes.model

data class Note(
    val id: String,
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double,
    val content: String,
    val color: String
)
