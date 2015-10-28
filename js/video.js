$(document).ready(function(){
	var video = $('#myVideo');

	//remove default control when JS loaded
	video[0].removeAttribute("controls");
	$('.control').show().css({'bottom':-45});
	$('.loading').fadeIn(500);
	$('.caption').fadeIn(500);

	video.on('loadedmetadata', function() {
		$('.caption').animate({'top':-45},300);


		$('.current').text(timeFormat(0));
		$('.duration').text(timeFormat(video[0].duration));
		updateVolume(0, 0.7);

		setTimeout(startBuffer, 150);

		$('.videoContainer')
		.append('<div id="init"></div>')
		.hover(function() {
			$('.control').stop().animate({'bottom':0}, 500);
			$('.caption').stop().animate({'top':0}, 500);
		}, function() {
			if(!volumeDrag && !timeDrag){
				$('.control').stop().animate({'bottom':-45}, 500);
				$('.caption').stop().animate({'top':-45}, 500);
			}
		})
		.on('click', function() {
			$('#init').remove();
			$('.btnPlay').addClass('paused');
			$(this).unbind('click');
			video[0].play();
		});
		$('#init').fadeIn(200);
	});

	var startBuffer = function() {
		var currentBuffer = video[0].buffered.end(0);
		var maxduration = video[0].duration;
		var perc = 100 * currentBuffer / maxduration;
		$('.bufferBar').css('width',perc+'%');

		if(currentBuffer < maxduration) {
			setTimeout(startBuffer, 500);
		}
	};

	video.on('timeupdate', function() {
		var currentPos = video[0].currentTime;
		var maxduration = video[0].duration;
		var perc = 100 * currentPos / maxduration;
		$('.timeBar').css('width',perc+'%');
		$('.current').text(timeFormat(currentPos));
	});

	video.on('click', function() { playpause(); } );
	$('.btnPlay').on('click', function() { playpause(); } );
	var playpause = function() {
		if(video[0].paused || video[0].ended) {
			$('.btnPlay').addClass('paused');
			video[0].play();
		}
		else {
			$('.btnPlay').removeClass('paused');
			video[0].pause();
		}
	};

	$('.btnx1').on('click', function() { fastfowrd(this, 1); });
	$('.btnx3').on('click', function() { fastfowrd(this, 3); });
	var fastfowrd = function(obj, spd) {
		$('.text').removeClass('selected');
		$(obj).addClass('selected');
		video[0].playbackRate = spd;
		video[0].play();
	};

	$('.btnStop').on('click', function() {
		$('.btnPlay').removeClass('paused');
		updatebar($('.progress').offset().left);
		video[0].pause();
	});

	$('.btnFS').on('click', function() {
		if($.isFunction(video[0].webkitEnterFullscreen)) {
			video[0].webkitEnterFullscreen();
		}
		else if ($.isFunction(video[0].mozRequestFullScreen)) {
			video[0].mozRequestFullScreen();
		}
		else {
			alert('Your browsers doesn\'t support fullscreen');
		}
	});

	$('.btnLight').click(function() {
		$(this).toggleClass('lighton');

		if(!$(this).hasClass('lighton')) {
			$('body').append('<div class="overlay"></div>');
			$('.overlay').css({
				'position':'absolute',
				'width':100+'%',
				'height':$(document).height(),
				'background':'#000',
				'opacity':0.9,
				'top':0,
				'left':0,
				'z-index':999
			});
			$('.videoContainer').css({
				'z-index':1000
			});
		}

		else {
			$('.overlay').remove();
		}
	});


	$('.sound').click(function() {
		video[0].muted = !video[0].muted;
		$(this).toggleClass('muted');
		if(video[0].muted) {
			$('.volumeBar').css('width',0);
		}
		else{
			$('.volumeBar').css('width', video[0].volume*100+'%');
		}
	});


	video.on('canplay', function() {
		$('.loading').fadeOut(100);
	});

	var completeloaded = false;
	video.on('canplaythrough', function() {
		completeloaded = true;
	});


	video.on('ended', function() {
		$('.btnPlay').removeClass('paused');
		video[0].pause();
	});


	video.on('seeking', function() {
		//if video fully loaded, ignore loading screen
		if(!completeloaded) {
			$('.loading').fadeIn(200);
		}
	});


	video.on('seeked', function() { });


	video.on('waiting', function() {
		$('.loading').fadeIn(200);
	});


	var timeDrag = false;	/* check for drag event */
	$('.progress').on('mousedown', function(e) {
		timeDrag = true;
		updatebar(e.pageX);
	});
	$(document).on('mouseup', function(e) {
		if(timeDrag) {
			timeDrag = false;
			updatebar(e.pageX);
		}
	});
	$(document).on('mousemove', function(e) {
		if(timeDrag) {
			updatebar(e.pageX);
		}
	});
	var updatebar = function(x) {
		var progress = $('.progress');

		var maxduration = video[0].duration;
		var position = x - progress.offset().left;
		var percentage = 100 * position / progress.width();
		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0) {
			percentage = 0;
		}
		$('.timeBar').css('width',percentage+'%');
		video[0].currentTime = maxduration * percentage / 100;
	};


	var volumeDrag = false;
	$('.volume').on('mousedown', function(e) {
		volumeDrag = true;
		video[0].muted = false;
		$('.sound').removeClass('muted');
		updateVolume(e.pageX);
	});
	$(document).on('mouseup', function(e) {
		if(volumeDrag) {
			volumeDrag = false;
			updateVolume(e.pageX);
		}
	});
	$(document).on('mousemove', function(e) {
		if(volumeDrag) {
			updateVolume(e.pageX);
		}
	});
	var updateVolume = function(x, vol) {
		var volume = $('.volume');
		var percentage;

		if(vol) {
			percentage = vol * 100;
		}
		else {
			var position = x - volume.offset().left;
			percentage = 100 * position / volume.width();
		}

		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0) {
			percentage = 0;
		}


		$('.volumeBar').css('width',percentage+'%');
		video[0].volume = percentage / 100;


		if(video[0].volume == 0){
			$('.sound').removeClass('sound2').addClass('muted');
		}
		else if(video[0].volume > 0.5){
			$('.sound').removeClass('muted').addClass('sound2');
		}
		else{
			$('.sound').removeClass('muted').removeClass('sound2');
		}

	};

	//Time format converter - 00:00
	var timeFormat = function(seconds){
		var m = Math.floor(seconds/60)<10 ? "0"+Math.floor(seconds/60) : Math.floor(seconds/60);
		var s = Math.floor(seconds-(m*60))<10 ? "0"+Math.floor(seconds-(m*60)) : Math.floor(seconds-(m*60));
		return m+":"+s;
	};
});