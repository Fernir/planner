var inter = null
var editmode = false
var weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
var months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
var gdata = null

var j$ = function(d){return eval('('+d+')')}

$.fn.tmpl = function(tmplId, data, callback) {
	var t = this
	if(!$('#tmpl_' + tmplId).length){
	  	$.ajax({
  			url: tmplId + '.tmpl',
			cache: false,
	  	}).done(function(response){
			$('<script type="text/x-dot-template" id="tmpl_' + tmplId + '"></script>').html(response).appendTo($('body'))
			
		    var tmpl = doT.template($('#tmpl_' + tmplId).html())
		    if (!$.isArray(data)) data = [data]
			
		    return t.each(function() {
		        var html = ''
		        for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
		            html += tmpl(data[itemIdx])
		        }
		        $(t).html(html)
				if(callback) callback()
		    })
					
	  	})
	} else {
	    var tmpl = doT.template($('#tmpl_' + tmplId).html())
	    if (!$.isArray(data)) data = [data]
		
	    return this.each(function() {
	        var html = ''
	        for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
	            html += tmpl(data[itemIdx])
	        }
	        $(this).html(html)
			if(callback) callback()
	    })
	}
}


String.prototype.format = function() {
    var formatted = this
    for(var arg in arguments) formatted = formatted.replace("{" + arg + "}", arguments[arg])
    return formatted
}

var updateColors = function(){
  	$('#customCSS').remove()
	$('head').append('<style id="customCSS">.marker { background-color:' + gdata.color + '; }<\/style>')
}

var dblclick = function(obj, id, name){
	$(obj)
	.removeAttr('readonly')
	.focus()
	.change(function(){
		$(this).attr('readonly', 'readonly')
		csend({ view : 'roomlist', mode : 'editroom', roomid : id, roomname : $(this).val() })
	})
}

var changerows = function(callback){
	var tstart = $('#amount_tstart').text()
	var tend = $('#amount_tend').text()
	
	if($('#checkmonths').is(':checked')){
		csend({ view : 'week', action : 'checkfield', id : $('#idvalue').val(), user : $('#uservalue').val(), addmonths : $('#months').val(), tstart : tstart, tend : tend }, callback)
	} else {
		csend({ view : 'week', action : 'checkfield', id : $('#idvalue').val(), user : $('#uservalue').val(), tstart : tstart, tend : tend }, callback)
	}
}

var dodialog = function(text, func, title){
	title = title | 'Внимание!';
	$('#prompt_window').html(text).dialog({
		modal : true, title : title, resizable: false, width : 500,
		buttons: {
			Ok : function(){
				$(this).dialog('close')
				new Function(func)()
				return
			},
			Cancel : function(){
				$(this).dialog('close')
				return
			}
		}
	})	
}

var alreadyShown = false
var inptr = function(e, object){
	if (alreadyShown) return
	alreadyShown = true
	var target = e.target || e.srcElement

	if (!(e.button == 1 || e.button == 0)) return
	if (target.className.indexOf('resizable-handle') > 0) return

	var data = gdata.markers ? gdata.markers[$(object).attr('abbr')] ? gdata.markers[$(object).attr('abbr')] : [] : []
	data.tend = data.tend || ''
	data.tstart = data.tstart || (6.5 + $(object).parent().index()/2) + ''
	data.user = data.user || gdata.user
	data.week = data.week || ($(object).index() - 1)
	data.id = data.id || object.attr('abbr')
	data.ts = data.ts || ''
	
	var tstp = data.tstart.replace(':30','.5').replace(':00','').replace(':0','')
	var tetp = data.tend.replace(':30','.5').replace(':00','').replace(':0','')

	$('#slider-range').slider({
		range: true,
		min: 7,
		max: 22.5,
		step: .5,
		values : [tstp, tetp || parseInt(tstp) + 1],
		slide: function( event, ui ) {
			var ts = (ui.values[0]%1 > 0) ? ui.values[0].toString().replace('.5', ':30') : ui.values[0] + ':00'
			var te = (ui.values[1]%1 > 0) ? ui.values[1].toString().replace('.5', ':30') : ui.values[1] + ':00'
			if(!$('#amount_tstart').length){
            	$('.ui-slider-handle:first').html('<div id="amount_tstart" class="ui-widget tooltip">' + ts + '</div>')
          		$('.ui-slider-handle:last').html('<div id="amount_tend" class="ui-widget tooltip">' + te + '</div>')
  			}else{
          		$('#amount_tstart').text(ts)
          		$('#amount_tend').text(te)
			}
			changerows()
		},
	})

	var tstxt = $('#slider-range').slider('values', 0)
	var tetxt = $('#slider-range').slider('values', 1)
	tstxt = (tstxt%1 > 0) ? tstxt.toString().replace('.5', ':30') : tstxt + ':00'
	tetxt = (tetxt%1 > 0) ? tetxt.toString().replace('.5', ':30') : tetxt + ':00'
	
	if(!$('#amount_tstart').length){
	    $('.ui-slider-handle:first').html('<div id="amount_tstart" class="ui-widget tooltip">' + tstxt + '</div>').hover(function(){
			$(this).parent().find('.ui-slider-handle:last').css('z-index', '999')
			$(this).css('z-index', '1000')
	  	})
	    $('.ui-slider-handle:last').html('<div id="amount_tend" class="ui-widget tooltip">' + tetxt + '</div>').hover(function(){
			$(this).parent().find('.ui-slider-handle:first').css('z-index', '999')
			$(this).css('z-index', '1000')
	  	})
	}	
	
	$('#checkmonths').attr('checked', false)
	$('#skull').empty()
	$('#months').attr('value','1')
	$('#idvalue').attr('value', data.id)
	$('#uservalue').attr('value', data.user)
	$('#msgboxval').attr('value', decodeURIComponent(data.data || data.user))

	$('#msgboxform').dialog({
		resizable: false, width:600, title : weekdays[data.week] + ', ' + data.user + (data.ts ? ', ' + data.ts : ''), modal: true,
		open : function(e, ui){
			/*
			inter = setInterval(function(){
				changerows()
			}, 500)
			*/
		},
		buttons: {
			"Сохранить": function() {
				var athis = this
				changerows(function(){
					if (gdata.conflict){
						$('#prompt_window').html('<p>Вы пытаетесь добавить событие, время которого пересекается с другими событиями!</p>').dialog({
							modal : true, title : 'Внимание!', resizable: false, width:500,
							buttons: {
								Ok : function(){
									alreadyShown = false
									$(this).dialog("close")
									return
								}
							}
						})
					} else {
						var tstart = $(athis).find('#amount_tstart').text()
						var tend = $(athis).find('#amount_tend').text()
						var addmonths = ($(athis).find('#checkmonths').is(':checked') ? $(athis).find('#months').val():0)
						var msgboxval = $(athis).find('#msgboxval').val()
					
						$(athis).dialog("close")
						csend({ view : 'week', storage : 1, id : data.id, data : msgboxval, tstart : tstart, tend : tend, addmonths : addmonths })
					}
				})
			},
			"Отмена": function() {
				$(this).dialog("close")
			}
		}
	}).on('dialogclose', function(e) {
		clearInterval(inter)
		alreadyShown = false
	})

}

var csend = function(arg, callback, needreload){
	$.ajax({
		dataType: 'json',
		type : 'post',
		url: 'core.php',
		data: arg,
		success: function(response){
			if (needreload) location.assign('/')
			gdata = response
			if(arg.action && arg.action == 'checkfield'){
				$('#skull').tmpl('skull', gdata)
			} else {
	  			$('#container').tmpl('maintemplate', gdata, function(){
					updateJs()
					menu(gdata.menu)
					InitContext()
				})
			}
			if(callback && typeof(callback) == 'function'){
				callback()
			}
		},
		error : function(){
			$('#container, #data').empty()
		}
	})
}


function InitContext() { 
	var current = null
	$('#menu').mouseleave(function(){$(this).hide()})

	$('.marker').on('contextmenu', function(e) {
		current = null
		e.preventDefault()
		if(!$(e.target).attr('abbr') || !$(e.target).hasClass('marker')) {
			return
		}
		current = e.target
		$('#menu').menu()
		$('#menu').css({top : e.pageY - 16, left : e.pageX - 16 })
		$('#menu').stop(true, true).fadeIn('fast')
	})

	$('#editrecord').on('click', function(e){
		var e = e
		$('#menu').hide(0, function(){
			if(current) {
				inptr(e, $(current))
			}
  		})
	})

	$('#deleterecord').on('click', function(e){
		$('#menu').hide(0, function(){
			if(current){
				var id = $(current).attr('abbr')
				var data = gdata.markers[id]
				data.tend = data.tend || ''
				$('#prompt_window').html('<p>Вы действительно хотите удалить запись?</p>').dialog({
					modal : true, title : 'Внимание!', resizable: false, width : 500,
					buttons: {
						Ok : function(){
							csend({view : 'week', storage : 1, id : id, tstart : data.tstart, tend : data.tend })
							$(this).dialog("close")
							return
						},
						Cancel : function(){
							$(this).dialog("close")
							return
						}
					}
				})
			}
		})
	})
}

var menu = function(data){
	obj = $('#selectroom')
	if(!obj.get(0)) return
	var menuholder, menuholder_container, menuholder_caption
	menuholder = $('#menuholder').get(0)
	if(!menuholder){
		menuholder = $('<div>')
		.css({ display : 'inline-block', cursor : 'pointer'})
		.appendTo(obj)
		
		menuholder_container = $('<div>')
		.css({ cursor : 'pointer', position : 'absolute', 'z-index' : 999 })
		.hide()
		.on('mouseleave', function(){ $(this).hide('fast') })
		.appendTo(menuholder)
		
		menuholder_caption = $('<div>')
		.addClass('button_sand')
		.css({ cursor: 'pointer', display : 'block'})
		.on('click', function(){ menuholder_container.toggle('fast') })
		.appendTo(menuholder)
	}

	for(v in data){
		$('<div>')
		.addClass('menu button_sand')
		.attr('abbr', data[v].id)
		.css({ backgroundColor : data[v].color, borderTop : 'none', width : '100%', cursor : 'pointer', display : 'block' })
		.html(data[v].text)
		.on('click', function(){ csend({ room : $(this).attr('abbr') }) })
		.appendTo(menuholder_container)
		
		if(data[v].selected)
			menuholder_caption.html(data[v].text).css({background : data[v].color, color : '#000'})
	}
	menuholder_container.css({ top :  menuholder.offset().top + menuholder.height() })
}

var updateJs = function(){
	$.datepicker.regional['ru'] = { closeText: 'Закрыть', prevText: '&laquo;&nbsp;Пред', nextText: 'След&nbsp;&raquo;', currentText: 'Сегодня',
	monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь', 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
	monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн', 'Июл','Авг','Сен','Окт','Ноя','Дек'],
	dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
	dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
	dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
	weekHeader: 'Не', dateFormat: 'yy/mm/dd', firstDay: 1, isRTL: false, showMonthAfterYear: false, yearSuffix: ''}
	$.datepicker.setDefaults($.datepicker.regional['ru'])
	
	$('#months').spinner()
	$('#checkmonths').button()
	
	$('#months, #checkmonths').change(function(){
		$('#months').spinner('disable')
		$('#slider-range').slider('disable')
		changerows(function(){
	  		$('#months').spinner('enable')
	  		$('#slider-range').slider('enable')
		})
		$('#months').spinner('option','disabled', $('#checkmonths').button('option', 'disabled'))
	})
	
	$('#months').spinner('option','disabled', $('#checkmonths').attr('checked') ? false : true)
	
	for(v in gdata.markers){
		var obj = gdata.markers[v]
		$('td [abbr='+obj.id + ']').empty()
		$('<div>')
		.addClass('marker')
		.attr({title: decodeURIComponent(obj.data) + (obj.ts ? '\n\n' + obj.ts.replace(' ','\n') : ''), 'abbr' : obj.id})
		.css({ height : obj.height,})
		.text(obj.user)
		.appendTo($('td [abbr='+obj.id + ']'))
	}
	
	$(document).keyup(function(e){ if (e.keyCode==27) $('#msgbox, #prompt').hide() })
	
	$('.marker, .parent_container td').mouseup(function(e){
		if(!editmode && e.button != 2 && !$(this).is("td:first-child")){
			inptr(e, $(this))
		}
	})
	
	$('.mmo').on('click', function(){
		csend({view : 'week', date: $(this).attr('abbr')})
	})
	
	$('#menuholder').empty()
	
	$('html, document').tooltip({
		show : 100,
		hide : 100,
		position: {
			my: "center bottom-10",
			at: "center top",
		}
	})
	
	$('.colorpicker').colorPicker(function(color, ui){
		csend({view : 'roomlist', mode : 'roomcolor', roomid : $(ui).attr('id').replace('color',''), roomcolor : color })
	})
	
	updateColors()
	
	$('#calen').datepicker({ 
		changeMonth: true,
		changeYear: true,
		showButtonPanel : true,
		defaultDate : gdata.year + '/' + sprintf('%.2d', gdata.month) + '/' + sprintf('%.2d', gdata.day),
		onSelect: function(date){ csend({view : 'week', date: (new Date(date)).getTime()/1000}) },
		onChangeMonthYear: function(year, month){ 
			csend({view : 'week', date: (new Date(year, month-1, (new Date()).getDate())).getTime()/1000}) 
		}
	})
	
	$('.ui-datepicker-trigger').addClass('button_sand').removeClass('ui-datepicker-trigger')
	$('.ui-datepicker').removeClass('ui-widget-content')
}

var drawWeek = function(day, month, year) {
	if (!day) day = date("j", time())
	if (!month) month = date("m", time())
	if (!year) year = date("Y", time())
	
	var week_day = date("N", mktime(0, 0, 0, month, day, year))
	var div = $("<div />")
	var table = $("<table class='border1px parent_container' align='center' />")
	var trf = $('<tr/>')
	trf.appendTo(table)

	for(j=7; j<=22.5; j+=.5){
		tm = ((j-intval(j)!=.5) ? j+":00":intval(j)+":30")
		timestamp = ((j-intval(j)!=.5) ? j+":00":"")
	  	var tr = $("<tr>")
		tr.appendTo(table)
	  	var td = $("<td class='num_offset" + ((j==date("N", time())) ? " num_offset_today":"") + "'>")
		td.appendTo(tr)
		if(timestamp){
			$("<div>"+timestamp+"</div>").appendTo(td)
		}
		for (i=1; i<=7; i++){
			monthnow = intval(date("m", strtotime("- "+(i-week_day)+" days", strtotime(day+"-"+month+"-"+year+" "+tm))))
			daynow = intval(date("j", strtotime("- "+(i-week_day)+" days", strtotime(day+"-"+month+"-"+year+" "+tm))))
			field_id = strtotime(daynow+"-"+monthnow+"-"+year+" "+tm)
			tclass = ((j==date("H", time())) ? "green_line":"") + ((i==date("N", time())) ? " back_green":"") + ((j%1==0)? " du":" dd");
			
	  		var td = $("<td abbr='" + field_id + "'" + (tclass ? " class='" + tclass + "'":"") + "></td>")
			td.appendTo(tr)
		}
	}
	trf.append('<td class="num_offset">&nbsp;</td>')
	for (i=1; i<=7; i++){
		daynow = intval(date("j", strtotime("- "+(i-week_day)+" days", strtotime(day+"-"+month+"-"+year))))
	  	var th = $("<th class='dates' " + ((i==date("N", time())) ? " style='color:#00ab22;'":"") + ">" + weekdays[i-1] + " " + daynow + "</th>")
		trf.append(th)
	}
	table.appendTo(div)
	return div.html()
}

var drawMonth = function(month, year, showyear) {
	if (!month) month = intval(date("m", time()))
	if (!year) year = intval(date("Y", time()))
		
	days_in_this_month = intval(date("t", mktime(0, 0, 0, month, 1, year)))
	days_in_prev_month = intval(date("t", mktime(0, 0, 0, month-1, 1, year)))
	week_day = intval(date("N", mktime(0, 0, 0, month, 1, year)))

	var div = $("<div />")
	
	if (showyear){
	  $('<p align="center"><b>' + months[month-1] + '</b></p>').appendTo(div)
	}else{
	  $('<h1 style="padding-left:1em; text-align:left;">' + months[month-1] + ', ' + year + '</h1>').appendTo(div)
	}
	
	var table = $('<table class="border1px txtcontent' + (showyear ? '':' monthtable') + '" align="center">').appendTo(div)
	var counter = 1
	var first = week_day
	var oct = week_day
	var wd = 0

	if (!showyear){
		if (first > 1){
			start_prev = (days_in_prev_month - first + 2)
			var tr = $('<tr>').appendTo(table)
			for(days = 1; days < first; days++) {
				ts = strtotime(start_prev + '-' + (month-1) + '-' + year + ' 00:00')
				var td = $('<td width="14%" class="' + (days > 5 ? 'back_gray ':'') + 'mmo" abbr="' + ts + '">' + weekdays[days-1] + ', ' + start_prev + '</td>').appendTo(tr)
				start_prev++
				wd++
			}
		}
	}
	
	week = 1
	for(days = first; days <= (days_in_this_month + oct - 1); days++) {
		ts = strtotime(counter + '-' + month + '-' + year + ' 00:00')
		if (week_day == 1)
			var tr = $('<tr>').appendTo(table)
		if (days == first){
			if (week_day > 5){
				if (week == 1 && !showyear) {
					var td = $('<td class="back_gray mmo" abbr="' + ts + '">' + weekdays[week_day-1] + ', ' + counter + '</td>').appendTo(tr)
				}else{
					var td = $('<td class="back_gray mmo" abbr="' + ts + '">' + counter + '</td>').appendTo(tr)
				}
			} else if (week == 1 && !showyear) {
				var td = $('<td class="mmo" abbr="' + ts + '">' + weekdays[week_day-1] + ', ' + counter + '</td>').appendTo(tr)
			} else {
				var td = $('<td class="mmo" abbr="' + ts + '">' + counter + '</td>').appendTo(tr)
			}	
			counter++
			first++
		}else{
			$('<td>').appendTo(tr)
		}
		if (week_day==7) {
			week++;
		}
		week_day%=7
		week_day++
 	}
	
	if (week_day <= 7 && week_day > 1){
		wd = week_day
		for(days = 1; days <= (7 - week_day + 1); days++) {
			ts = strtotime(days + '-' + (month + 1) + '-' + year + ' 00:00')
			if (wd > 5){
				var td = $('<td class="mmo back_gray">' + days + '</td>').appendTo(tr)
			} else {
				var td = $('<td class="mmo">' + days + '</td>').appendTo(tr)
			}
			wd++;
		}
	}
	return div.html()
}

var drawYear = function(year){
	var div = $("<div />")
	$('<h1 style="padding-left:1em;">' + year + '</h1>').appendTo(div)
	var table = $('<table cellpadding="10">').appendTo(div)
	var counter = 1
	
	for (i=1; i<=3; i++){
		var tr = $('<tr>').appendTo(table)
		for (j=1; j<=4; j++){
			var td = $('<td valign="top">' + drawMonth(counter, year, true) + '</td>').appendTo(tr)
			counter++
		}
	}
	return div.html()
}


$(function(){ 
   if (!gdata) csend({}) 
})