package com.ictd202.memesapp

import android.content.ContentProvider
import android.content.ContentValues
import android.content.UriMatcher
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import java.io.File
import java.io.FileNotFoundException

class StickerContentProvider : ContentProvider() {
    companion object {
        private const val AUTHORITY = "com.ictd202.memesapp.stickercontentprovider"
        private const val METADATA_CODE = 1
        private const val STICKERS_CODE = 2
        private val MATCHER = UriMatcher(UriMatcher.NO_MATCH).apply {
            addURI(AUTHORITY, "stickers_asset/*", METADATA_CODE)
            addURI(AUTHORITY, "stickers_asset/*/*", STICKERS_CODE)
        }
    }

    override fun onCreate(): Boolean = true

    override fun query(uri: Uri, projection: Array<out String>?, selection: String?, selectionArgs: Array<out String>?, sortOrder: String?): Cursor? {
        val context = context ?: return null
        val code = MATCHER.match(uri)
        
        if (code == METADATA_CODE) {
            val file = File(context.cacheDir, "stickers/contents.json")
            if (!file.exists()) return null
            val cursor = MatrixCursor(arrayOf("_data", "_size"))
            cursor.addRow(arrayOf(file.absolutePath, file.length()))
            return cursor
        } else if (code == STICKERS_CODE) {
            val segments = uri.pathSegments
            val fileName = segments[segments.size - 1]
            val file = File(context.cacheDir, "stickers/$fileName")
            if (!file.exists()) return null
            val cursor = MatrixCursor(arrayOf("_data", "_size"))
            cursor.addRow(arrayOf(file.absolutePath, file.length()))
            return cursor
        }
        return null
    }

    override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor? {
        val context = context ?: return null
        val segments = uri.pathSegments
        val file = if (segments.size == 2) {
            File(context.cacheDir, "stickers/contents.json")
        } else {
            File(context.cacheDir, "stickers/${segments[2]}")
        }
        if (!file.exists()) throw FileNotFoundException(uri.path)
        return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
    }

    override fun getType(uri: Uri): String? {
        return if (MATCHER.match(uri) == METADATA_CODE) "application/json" else "image/webp"
    }

    override fun insert(uri: Uri, values: ContentValues?): Uri? = null
    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int = 0
    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int = 0
}
