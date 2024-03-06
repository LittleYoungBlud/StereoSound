/**
 * @name StereoSound
 * @version 0.0.9
 * @authorLink https://github.com/LittleYoungBlud
 * @updateUrl https://github.com/LittleYoungBlud/StereoSound/blob/main/StereoSound.plugin.js
 */
module.exports = (() => {
    const config = {"main":"index.js","info":{"name":"StereoSound","authors":[{"name":"LittleYoungBlud","discord_id":"0","github_username":"LittleYoungBlud"}],"authorLink":"https://github.com/LittleYoungBlud","version":"0.0.9","description":"Adds stereo sound to your input","github":"https://github.com/LittleYoungBlud","github_raw":"https://raw.githubusercontent.com/LittleYoungBlud/StereoSound/main/StereoSound.plugin.js"},"changelog":[{"title":"Changes","items":["Set bitrate to max and should cause less lag"]}],"defaultConfig":[{"type":"switch","id":"enableToasts","name":"Enable Toasts","note":"Allows the plugin to warn you about voice settings","value":true}]};

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
        if (obj.encodingVoiceBitRate < 510000 ) { // Do not put it over 510kbps it will cause problems and lag
                obj.encodingVoiceBitRate = 510000
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
        voiceSettingsStore.getAutomaticallydetermineinputsensitivity() ||
        voiceSettingsStore.getAdvancedVoiceActivity() ||
        voiceSettingsStore.getAutomaticGainControl() ||
        voiceSettingsStore.getEchoCancellation()
      ) {
        if (this.settings.enableToasts) {
          Toasts.show(
            "Please disable echo cancellation, noise reduction, and noise suppression for StereoSound",
            { type: "warning", timeout: 5000 }
          );
        }
         const voiceSettings = WebpackModules.getByProps("setNoiseSuppression");
        // 2nd arg is for analytics
         voiceSettings.setNoiseSuppression(false, {});
         voiceSettings.setAutomaticallydetermineinputsensitivity(false,{});
         voiceSettings.setAdvancedVoiceActivity(false, {});
         voiceSettings.setAutomaticGainControl(false, {});
         voiceSettings.setEchoCancellation(false, {});
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
