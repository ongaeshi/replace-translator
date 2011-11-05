// ボタンイベント
$(function() {
  $("#close-button").click(function() {
    var msg = {
      kind: 'close'
    };
    self.postMessage(msg);
  });
});

// Add-on Script からのメッセージ受け取り
self.on('message', function(msg) {
  switch (msg.kind) {
   case "save":
    self.postMessage({
      kind: "save",
      from: $('#from-lang-select').val(),
      to: $('#to-lang-select').val()
    });
    break;
  }
});
