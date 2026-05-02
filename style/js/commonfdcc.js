pidorShown = 0;

function showPidor()
{
    /*var date = Date.now();
    if(date >= 1590984300000) // 1590987600000
    {
        if(pidorShown == 0) 
        {
            $('.modal_black').fadeIn();
            $('.modal_pidor').fadeIn();
             pidorShown = 1;
         }
     }*/
}



if($('.hu-background').length){

  $(document).scroll(function() {
    var y = $(this).scrollTop();
    if (y > 500) {
      showPidor();
      $('.hu-background').fadeIn();
    } else {
      $('.hu-background').fadeOut('fast');
    }
  });

  $(document).scroll(function() {
    var y = $(this).scrollTop();
    if (y > 1500) {
      $('.hu-background_2').fadeIn();
      $('.hu-background_2_under').fadeIn();
    } else {
      $('.hu-background_2').fadeOut('fast');
      $('.hu-background_2_under').fadeOut('fast');
    }
  });

}

$('#show_videomodal').click(function(){
    $('.modal_black').fadeIn();
    $('.modal_video').fadeIn();
    $('.modal_close').fadeIn();
    $('#heroVideoModal').get(0).play();

});

function modalClose(){
    $('.modal_black').fadeOut();
    $('.modal_video').fadeOut();
    $('.modal_close').fadeOut();
    $('.modal_pidor').fadeOut();
    $('.modalWin').fadeOut();
    $('#heroVideoModal').get(0).pause();
}

$('.modal_close').click(function(){
    modalClose();

});

$('.modal_black').click(function(){
    modalClose();
});

$('#close_modals').click(function(){
    /*alert('Уебак ты че папутал, нука донать');
    alert('Плати тебе сказали пидорас');
    $('div').addClass('spinDiv');
    setTimeout(function(){
        alert('Надо было платить, ебан');
    },3000);*/
    modalClose();
});


$('.mobile_menu_show').click(function(){
    $('.mobile_menu').fadeToggle();
    $('header').toggleClass('overflowHidden');
});



/*if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  if($('.hero_video').length){
    $('.hero_video video source').attr('src', 'http://35.246.15.118/video_mobile.mp4');
    $(".hero_video video")[0].load()
  }
}*/

// correcting weight

function correctWidth(){
  //correct header text width
  var spanWidth = $('.pt_in span').width();
  console.log(spanWidth);
  $('.pt_in').css('width', spanWidth+10);

  // corrent line width
  if($('.text span').length){
    var spanWidth = $('.text span').width();
    $('.line').css('width', spanWidth)
  }

}

function addHeaderBorder(){
  if($('.pt_in').length){
    $('header').addClass('header-border');
  }

}
 


$(document).ready(function(){
  
  addHeaderBorder();
  correctWidth();
  setTimeout(function(){
    correctWidth();
  }, 1000);
});


