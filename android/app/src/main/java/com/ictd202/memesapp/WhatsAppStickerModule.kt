package com.ictd202.memesapp

import android.content.Intent
import android.content.ActivityNotFoundException
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class WhatsAppStickerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String = "WhatsAppStickerModule"

    @ReactMethod
    fun sendToWhatsApp(packId: String, packName: String, promise: Promise) {
        val intent = Intent().apply {
            action = "com.whatsapp.intent.action.ENABLE_STICKER_PACK"
            putExtra("sticker_pack_id", packId)
            putExtra("sticker_pack_name", packName)
            putExtra("sticker_pack_publisher", "Multimodal App")
            putExtra("sticker_pack_authority", "com.ictd202.memesapp.stickercontentprovider")
            setPackage("com.whatsapp")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        
        try {
            reactApplicationContext.startActivity(intent)
            promise.resolve("Intent envoyé avec succès")
        } catch (e: ActivityNotFoundException) {
            promise.reject("ERR_WHATSAPP_NOT_FOUND", "WhatsApp n'est pas installé sur cet appareil")
        } catch (e: Exception) {
            promise.reject("ERR_STICKER_EXPORT", e.message)
        }
    }
}
