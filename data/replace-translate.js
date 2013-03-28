//
// @brief Replace Translate
// @author ongaeshi
// @date   2011/10/04

// 翻訳するノード一覧
var gSelectNodes;

self.port.on("replace-translate", function() {
  var selection = window.getSelection();

  if (selection && isActiveWindow()) {
    var nodes = findSelectionNode(selection),
        texts = nodes2texts(nodes);

    if (texts.length > 0) {
      // @todo 連続翻訳があると上手く動かない気がする
      // @todo 一時変数に保存するのでは無く、コンテナに貯蓄してidを渡すのが良さそう
      // @todo rangeを一気に解析してコンテナに保持、検索先でいい感じにする
      gSelectNodes = nodes;

      // from:"" にして、自動判定にするかは悩む所だが短い単語を訳しやすくするためページ内言語設定を優先する。
      // その代わり、日本語のページ内にある英語等を訳すことは出来ない。
      self.port.emit("translate", {msg:"replace-translate-end", texts:texts, from:document.documentElement.lang });
    }
  }
});

self.port.on("replace-translate-end", function (translatedArray) {
  // テキスト入れ替え
  for (var i = 0; i < gSelectNodes.length; i++) {
    // 翻訳アニメーションの実行
    replaceAnimation(gSelectNodes[i].node, gSelectNodes[i].replaceText(translatedArray[i].TranslatedText));
  }

  // 選択範囲をクリア
  deselectWindow();

  // 翻訳ノードを解除
  gSelectNodes = null;
});

