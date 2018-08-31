function OpenDevSumm() { 
    var open = $("#side3").data("open");
    if (!open) {
      $("#side3").show();
      $("#side3").data("open", 1);
    }
  };

  function closeAll() {
    $("#side").hide();
    $("#side").data("open", 0);
    $("#side2").hide();
    $("#side2").data("open", 0);
    $("#side3").hide();
    $("#side3").data("open", 0);
  }

  function CloseDevSumm() { 
    
    var open = $("#side3").data("open");
    if (open) {
      $("#side3").hide();
      $("#side3").data("open", 0);
    }
  };