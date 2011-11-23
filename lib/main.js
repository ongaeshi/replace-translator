const widgets = require("widget");
const tabs = require("tabs");
const contextMenu = require("context-menu");
const notifications = require("notifications");
const data = require("self").data;
const bingTranlator = require("bing-translator");
const panel = require("panel");
const locale = require("locale");
const { Hotkey } = require("hotkeys");
require("console-p");
const platformParam = require("platform-param");
const simpleStorage = require("simple-storage");
const storage = simpleStorage.storage;

// 通知文字最大数
const NOTIFY_LIMIT = 250;

// 登録されているワーカー
var gWorkers = [];

function textLimit(src, length) {
  if (src.length > length)
    return src.substr(0, length) + "...";
  else
    return src;
}

function notify(title, text) {
  notifications.notify({
    title: title,
    text: textLimit(text, NOTIFY_LIMIT),
    data: text,
    onClick: function (data) {
      console.log(data);
    }
  });
}

function postWorkers(msg) {
  // console.log("gWorkers.length : " + gWorkers.length);
  gWorkers.forEach(function (worker) {
      worker.port.emit(msg);
  });
}

function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

function setupSaveData() {
  // 翻訳時の言語設定
  if (!storage.translateLang)
    storage.translateLang = {from: "", to: ""};
}

function setupWorker() {
  var pageMod = require("page-mod");
  pageMod.PageMod({
    include: "*",
    contentScriptFile: [
      data.url("jquery-1.6.4.min.js"),
      data.url("dump.js"),
      data.url("range-traverse.js"),
      data.url("selection-text.js"),
      data.url("replace-safety.js"),
      data.url("text-anim.js"),
      data.url("active-window.js"),
      data.url("undo-translate.js"),
      data.url("insert-translate.js"),
      data.url("replace-translate.js")
    ],
    onAttach: function(worker) {
      gWorkers.push(worker);
      
      worker.port.on('translate', function (src) {
        // console.p(src.from);
        // console.p(storage.translateLang);
        var toLang =   (storage.translateLang.to != "")   ? storage.translateLang.to   : locale.getMylang(),
            fromLang = (storage.translateLang.from != "") ? storage.translateLang.from : locale.getFromLang(src.from);

        bingTranlator.translateArray(src.texts, fromLang, toLang, function(json) {
          //notify("Translate!!", json.map(function(v){return v.TranslatedText;}).join(", "));
          worker.port.emit(src.msg, json);
        });
      });
      
      worker.on('detach', function () {
        detachWorker(this, gWorkers);
      });
    }
  });
}

function setupPanel() {
  return panel.Panel({
    width: 730,
    height: 340,
    contentURL: data.url('text-translate.html'),
    contentScriptFile: [
      data.url('jquery-1.6.4.min.js'),
      data.url('jquery.unescape.js'),
      data.url("dump.js"),
      data.url('text-translate.js')
    ],
    contentScriptWhen: 'ready',
    onShow: function() {
    },
    onHide: function() {
    },
    onMessage: function(msg) {
      switch (msg.kind) {
       case 'translate':
        var self = this,
            fromLang = msg.from,
            toLang = (msg.to == "") ? locale.getMylang() : msg.to;
        
        bingTranlator.translate2(msg.text, fromLang, toLang, function(text) {
          // notify("Translate!!", text);
          self.postMessage(text);
        });
        break;
       case 'close':
        this.hide();
        break;
      }
    }
  });
}

function setupSettingPanel() {
  return panel.Panel({
    width: 420,
    height: 180,
    contentURL: data.url('setting.html'),
    contentScriptFile: [
      data.url('jquery-1.6.4.min.js'),
      data.url("dump.js"),
      data.url('setting.js')
    ],
    contentScriptWhen: 'ready',
    onShow: function() {
      this.postMessage({kind: "init", translateLang: storage.translateLang});
    },
    onHide: function() {
      this.postMessage({kind: "save"});
    },
    onMessage: function(msg) {
      switch (msg.kind) {
       case 'save':
        // console.p(msg);
        storage.translateLang.from = msg.from;
        storage.translateLang.to = msg.to;
        break;
       case 'close':
        this.hide();
        break;
      }
    }
  });
}

function setupContextMenu(textTranslatePanel, settingPanel) {
  var context_label = platformParam.getParam().context_label;
  
  // 非選択時
  contextMenu.Item({
    label: context_label.text,
    image: data.url("icon.png"),
    contentScript: 'self.on("click", function(){ self.postMessage(""); });',
    onMessage: function(msg) {
      textTranslatePanel.show();
    }
  });

  contextMenu.Item({
    label: context_label.undo,
    image: data.url("icon.png"),
    contentScript: 'self.on("click", function(){ self.postMessage(""); });',
    onMessage: function(msg) {
      postWorkers("undo-translate");
    }
  });

  contextMenu.Item({
    label: context_label.setting,
    image: data.url("icon.png"),
    contentScript: 'self.on("click", function(){ self.postMessage(""); });',
    onMessage: function(msg) {
      settingPanel.show();
    }
  });

  // 選択時
  contextMenu.Item({
    label: context_label.insert,
    image: data.url("icon.png"),
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function(){ self.postMessage(""); });',
    onMessage: function(msg) {
      postWorkers("insert-translate");
    }
  });

  contextMenu.Item({
    label: context_label.replace,
    image: data.url("icon.png"),
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function(){ self.postMessage(""); });',
    onMessage: function(msg) {
      postWorkers("replace-translate");
    }
  });

  contextMenu.Item({
    label: context_label.text,
    image: data.url("icon.png"),
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function(){ self.postMessage(""); });',
    onMessage: function(msg) {
      textTranslatePanel.show();
    }
  });
}

function setupHotkey(textTranslatePanel) {
  var keycombo = platformParam.getParam().keycombo;
  
  // Replace Translate
  Hotkey({
    combo: keycombo.replace,
    onPress: function() {
      postWorkers("replace-translate");
    }
  });

  // Insert Translate
  Hotkey({
    combo: keycombo.insert,
    onPress: function() {
      postWorkers("insert-translate");
    }
  });

  // Undo Translate
  Hotkey({
    combo: keycombo.undo,
    onPress: function() {
      postWorkers("undo-translate");
    }
  });
}

exports.main = function(options, callbacks) {
  // セーブデータ設定
  setupSaveData();
  
  // PageMode(ページの書き換え制御)
  setupWorker();

  // パネル
  var textTranslatePanel = setupPanel();

  // 設定パネル
  var settingPanel = setupSettingPanel();

  // コンテキストメニュー
  setupContextMenu(textTranslatePanel, settingPanel);

  // ホットキーの設定
  setupHotkey(textTranslatePanel);

}

