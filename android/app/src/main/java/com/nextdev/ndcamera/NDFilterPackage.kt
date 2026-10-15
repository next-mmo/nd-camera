package com.nextdev.ndcamera

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NDFilterPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == NDFilterModule.NAME) {
            NDFilterModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val map = HashMap<String, ReactModuleInfo>()
            map[NDFilterModule.NAME] = ReactModuleInfo(
                NDFilterModule.NAME,
                NDFilterModule::class.java.name,
                false,
                false,
                false,
                false
            )
            map
        }
    }
}
