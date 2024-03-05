/**
 * @name StereoSound
 * @version 0.0.4
 * @authorLink https://github.com/LittleYoungBlud
 * @updateUrl https://github.com/LittleYoungBlud/StereoSound/blob/main/StereoSound.plugin.js
 */
module.exports = (() => {
    const config = {"main":"index.js","info":{"name":"StereoSound","authors":[{"name":"LittleYoungBlud","discord_id":"1168698907287621713","github_username":"LittleYoungBlud"}],"authorLink":"https://github.com/LittleYoungBlud","version":"0.0.4","description":"Adds a 2 channel input sound to your Better Discord requires a stereo supported mic aka 2 channel microphone.","github":"https://github.com/LittleYoungBlud","github_raw":"https://raw.githubusercontent.com/LittleYoungBlud/StereoSound/main/StereoSound.plugin.js"},"changelog":[{"title":"Changes","items":["This plugin is originally fixed by Riolubruh i just edited some stuff."]}],"defaultConfig":[{"type":"switch","id":"enableToasts","name":"Enable Toasts","note":"Allows the plugin to warn you about voice settings","value":true}]};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
  const { WebpackModules, Patcher, Toasts } = Library;

  return class StereoSound extends Plugin {
    onStart() {
      this.settingsWarning();
      const voiceModule = WebpackModules.getModule(BdApi.Webpack.Filters.byPrototypeFields("updateVideoQuality"));
      BdApi.Patcher.after("StereoSound", voiceModule.prototype, "updateVideoQuality", (thisObj, _args, ret) => {
	  if(thisObj){
      const setTransportOptions = thisObj.conn.setTransportOptions;
      thisObj.conn.setTransportOptions = function (obj) {
        if (obj.audioEncoder) {
          obj.audioEncoder.params = {
            stereo: "2",
          };
          obj.audioEncoder.channels = 2;
        }
        if (obj.fec) {
          obj.fec = false;
        } 
        if (obj.encodingVoiceBitRate < 510000 ) { // Discord uses Opus audio encoding if you look it up yourself its max bitrate is 510kbps, 512kbps is incorrect.
                obj.encodingVoiceBitRate = 510000 // if its over 510kbps its technically overloading and can cause unnecessary lag.
        }
        
        setTransportOptions.call(thisObj, obj);
      };
      return ret;
	  }});
    }
    settingsWarning() {
      const voiceSettingsStore = WebpackModules.getByProps("getEchoCancellation");
      if (
        voiceSettingsStore.getNoiseSuppression() ||
        voiceSettingsStore.getAutomaticGainControl() ||
        voiceSettingsStore.getEchoCancellation()
      ) {
        if (this.settings.enableToasts) {
          Toasts.show(
            "If you are seeing this you must turn off Noise Suppression, Echo Cancellation and Automatic Gain Control For StereoSound.",
            { type: "warning", timeout: 10000 }
          );
        }
        // This would not work, noise reduction would be stuck to on
         const voiceSettings = WebpackModules.getByProps("setNoiseSuppression");
        // 2nd arg is for analytics
         // For Noise Suppression it might put it to "Standard" even if its on false so maybe still manually put it to "none" in your Voice & Video settings.
         voiceSettings.setNoiseSuppression(false, {});
         voiceSettings.setEchoCancellation(false, {});
         voiceSettings.setAutomaticGainControl(false, {});
        return true;
      } else return false;
    }
	
    onStop() {
      Patcher.unpatchAll();
    }
    getSettingsPanel() {
      const panel = this.buildSettingsPanel();
      return panel.getElement();
    }
  };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();


/*@end@*/
