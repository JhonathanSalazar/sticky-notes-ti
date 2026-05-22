package com.stickynotes.controller

import com.stickynotes.model.Note
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.concurrent.ConcurrentHashMap

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = ["http://localhost:5173"])
class NoteController {

    private val notes = ConcurrentHashMap<String, Note>()

    @GetMapping
    fun getAll(): List<Note> = notes.values.toList()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody note: Note): Note {
        notes[note.id] = note
        return note
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: String, @RequestBody note: Note): ResponseEntity<Note> {
        if (!notes.containsKey(id)) return ResponseEntity.notFound().build()
        val updated = note.copy(id = id)
        notes[id] = updated
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: String): ResponseEntity<Void> {
        notes.remove(id)
        return ResponseEntity.noContent().build()
    }
}
