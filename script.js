
  alret("script is working");
  console.log("working");

$(function() {
  alret("fn in script is working");

  $(".menu").draggable();

  function close() {
    $("#sideSearch").hide();
    $("#sideSearch").data("open", 0);

  }

  $("#search").click(function () {
             var open = $("#sideSearch").data("open");
             close();
             if (!open) {
                 $("#sideSearch").show();
                 $("#sideSearch").data("open", 1);

             } else {
                 $("#sideSearch").hide();
                 $("#sideSearch").data("open", 0);
             }
         });



});
















$(document).ready(function() {
  $('.drawer').drawer({
  class: {
    nav: 'drawer-nav',
    toggle: 'drawer-toggle',
    overlay: 'drawer-overlay',
    open: 'drawer-open',
    close: 'drawer-close',
    dropdown: 'drawer-dropdown'
  },
  iscroll: {
    // Configuring the iScroll
    // https://github.com/cubiq/iscroll#configuring-the-iscroll
    mouseWheel: true,
    preventDefault: false
  },
  showOverlay: true
});
});




/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
