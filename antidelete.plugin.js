

class NoDeleteMessages {
  getName() {
    return "NoDeleteMessages";
  }
  getShortName() {
    return "NoDeleteMessages";
  }
  getDescription() {
    return 'Prevents the client from removing deleted messages (until restart).\nUse ".message.antidelet-deleted-message .markup" to edit the CSS of deleted messages.\n\nMy Discord server: https://join-nebula.surge.sh\nDM me @Lucario ðŸŒŒ V5.0.0#7902 or create an issue at https://github.com/Mega-Mewthree/BetterDiscordPlugins for support.';
  }
  getVersion() {
    return "0.0.7";
  }
  getAuthor() {
    return "Mega_Mewthree"; //Current Discord account: @Lucario ðŸŒŒ V5.0.0#7902 (438469378418409483) Wonder how long this one will last...
  }
  constructor() {
    this.deletedMessages = {};
  }
  load() {}
  unload() {}
  start() {
    let libraryScript = document.getElementById("zeresLibraryScript");
    if (!window.ZeresLibrary || window.ZeresLibrary.isOutdated) {
      if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
      libraryScript = document.createElement("script");
      libraryScript.setAttribute("type", "text/javascript");
      libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
      libraryScript.setAttribute("id", "zeresLibraryScript");
      document.head.appendChild(libraryScript);
    }
    if (window.ZeresLibrary) this.initialize();
    else libraryScript.addEventListener("load", () => { this.initialize(); });
  }
  initialize() {
    window.updateDeletedMessages = () => this.updateDeletedMessages;
    PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), `https://raw.githubusercontent.com/Mega-Mewthree/BetterDiscordPlugins/master/Plugins/${this.getName()}/${this.getName()}.plugin.js`);
    BdApi.injectCSS("NoDeleteMessages-CSS", ".da-message.NoDeleteMessages-deleted-message .da-markup {color: #F00!important;}");
    Patcher.instead(this.getName(), InternalUtilities.WebpackModules.find(m => m.dispatch), "dispatch", (thisObject, args, originalFunction) => {
      let shouldFilter = this.filter(args[0]);
      if (!shouldFilter) return originalFunction(...args);
    });
    PluginUtilities.showToast("NoDeleteMessages has started!");
  }
  stop() {
    this.deletedMessages = {};
    BdApi.clearCSS("NoDeleteMessages-CSS");
    Patcher.unpatchAll(this.getName());
  }
  filter(evt) {
    if (evt.type === "MESSAGE_DELETE") {
      if (Array.isArray(this.deletedMessages[evt.channelId])){
        if (this.deletedMessages[evt.channelId].length > 149) this.deletedMessages[evt.channelId].shift(); // 150 because only 150 messages are stored per channel.
        this.deletedMessages[evt.channelId].push(evt.id);
      } else {
        this.deletedMessages[evt.channelId] = [evt.id];
      }
      if (evt.channelId === this.getCurrentChannelID()) this.updateDeletedMessages();
      return true;
    } else if (evt.type === "MESSAGE_DELETE_BULK") {
      if (Array.isArray(this.deletedMessages[evt.channelId])){
        if (this.deletedMessages[evt.channelId].length + evt.ids.length > 149) this.deletedMessages[evt.channelId].splice(0, this.deletedMessages[evt.channelId].length + evt.ids.length - 150);
        this.deletedMessages[evt.channelId].push(...evt.ids);
      } else {
        this.deletedMessages[evt.channelId] = [...evt.ids];
      }
      if (evt.channelId === this.getCurrentChannelID()) this.updateDeletedMessages();
      return true;
    }
    return false;
  }
  observer({addedNodes}) {
    let len = addedNodes.length;
    let change;
    while (len--){
      change = addedNodes[len];
      if (change.classList && change.classList.contains("da-messagesWrapper")) {
        this.updateDeletedMessages();
        break;
      }
    }
  }
  updateDeletedMessages() {
    const channelDeletedMessages = this.deletedMessages[this.getCurrentChannelID()];
    if (!channelDeletedMessages) return;
    let maybeAMessageID;
    $(".da-message").each((index, elem) => {
      try {
        maybeAMessageID = elem[Object.keys(elem).find(k => k.startsWith("__reactInternalInstance"))].return;
        if (channelDeletedMessages.includes(maybeAMessageID.return.return.key) || channelDeletedMessages.includes(maybeAMessageID.return.return.key) || channelDeletedMessages.includes(maybeAMessageID.return.key) || channelDeletedMessages.includes(maybeAMessageID.key)) {
          elem.classList.add("NoDeleteMessages-deleted-message");
        }
      } catch (e) {}
    });
  }
  getCurrentChannelID() {
    return DiscordModules.SelectedChannelStore.getChannelId();
  }
}

/*
-----BEGIN PGP SIGNATURE-----

iQEzBAEBCAAdFiEEGTGecftnrhRz9oomf4qgY6FcSQsFAltnx9QACgkQf4qgY6Fc
SQsblAf/a4savAKVpxwXIIMyn8wlACwrEleOV/WykFIVqzEo3MHWM/8tZcBDxjsJ
1NhgUtXbk7qNVgt2XKvjyRfYsWKdPBhrWrlZCJ934yUruQQoRgb5RkCV5XeQ+En8
DYZRHM548EifbXT9Jf5uvBo4Wk2yni3ycOuQbjznB10lg15tl2sl5O5bIjtjqlwu
b02Ybu2JhDDJoiBTAQkAPUWwYYZ0TAzz1wh/Vq16MtNTQDJjP5KCI/az0LFrQl5L
JRvY3z7irJOGngaJcfLf+pCgQlAL4j3AKutIaWdWFOmohPfUau7JUBYrqfasjepI
Qm1BKyRKAfe9vbow3tl31yxcUoCiwA==
=j/0E
-----END PGP SIGNATURE-----
*/
