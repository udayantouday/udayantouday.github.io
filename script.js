function close() {
  $("#side").hide();
  $("#side").data("open", 0);
  $("#side2").hide();
  $("#side2").data("open", 0);
  $("#side3").hide();
  $("#side3").data("open", 0);
}

function closeMenu(htmlID) {
  $(htmlID).hide();
  $(htmlID).data("open", 0);
}

function openMenu(htmlID) {
  $(htmlID).show();
  $(htmlID).data("open", 1);
}

$("#search").click(function() {
  var open = $("#side").data("open");
  close();
  if (!open) {
    $("#side").show();
    $("#side").data("open", 1);

  } else {
    $("#side").hide();
    $("#side").data("open", 0);
  }
});

$("#hist").click(function() {
  var open = $("#side2").data("open");
  closeMenu("#side");
  closeMenu("#side2");
  if (!open) {
    $("#side2").show();
    $("#side2").data("open", 1);

  } else {
    $("#side2").hide();
    $("#side2").data("open", 0);
  }
});

$("#summ").click(function() {
  var open = $("#side3").data("open");
  //close();
  if (!open) {
    $("#side3").show();
    $("#side3").data("open", 1);

  } else {
    $("#side3").hide();
    $("#side3").data("open", 0);
  }
});
