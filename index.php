<?php 
header("Content-type: text/html; charset=UTF-8"); 

require_once("config.php"); ?>
<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<link rel="stylesheet" href="style/jquery_ui.css?<?php print strtotime("now");?>" type="text/css" />
<link rel="stylesheet" href="style/style.css?<?php print strtotime("now");?>" type="text/css" />
<script type="text/javascript" src="js/jquery.js?<?php print strtotime("now");?>"></script>
<script type="text/javascript" src="js/jquery_ui.js?<?php print strtotime("now");?>"></script>
<script type="text/javascript" src="js/doT.min.js?<?php print strtotime("now");?>"></script>
<script type="text/javascript" src="js/functions.js?<?php print strtotime("now");?>"></script>
<script type="text/javascript" src="js/script.js?<?php print strtotime("now");?>"></script>
<title></title>
</head>
<body>
<div id="prompt_window"></div>
<div id="data"></div>
<div id="table_container"></div>
<div id="container"></div>

<div id="msgboxform" style="display:none;">
  <table style="width:100%;" class="txtcontent">
    <tr>
      <td colspan="3" style="height:60%; padding:0;  margin:0">
        <textarea id="msgboxval" style="width:100%; height:150px; resize:none; padding:0; margin:0; font:1em arial;"></textarea>
      </td>
    </tr>
    <tr>
      <td colspan="2" align="center" width="300" valign="bottom">
        <div id="slider-range"></div>
      </td>
      <td align="right" nowrap="nowrap" valign="bottom">
        <input type="hidden" value="" id="uservalue" />
        <input type="hidden" value="" id="idvalue" />
        <input id="checkmonths" type="checkbox"/><label for="checkmonths">повторяющиеся события</label>
        <input name="months" id="months" style="width:2em"><label for="months">&nbsp;месяцев</label>
      </td>
    </tr>
    <tr>
      <td colspan="3" align="center">
	  	  <span id="skull"></span>
		</td>
    </tr>
  </table>
</div>

<script type="text/plain" id="tmpl_msgboxskull">
  {{? it.conflict }}
  <div>
  конфликт: {{=it.conflict.user}}, {{=it.conflict.start}}-{{=it.conflict.end}}
	{{? it.isadmin }}
	<br><br><a class='button_sand red' onclick="dodialog('<p>Вы действительно хотите удалить запись?</p>','csend({view : \'week\', storage:1, id:{{=it.conflict.id}}, tstart:\'{{=it.conflict.start}}\', tend:\'{{=it.conflict.end}}\'})')">удалить конфликтующую запись</a>
    {{?}}  
  </div>
  {{?}}
</script>

<script type="text/plain" id="tmpl_datatemplate">

<table style="height:100%; width:100%;">
  	<tr>
    	<td class="header">
	    	<div style="float:left;">
		    {{? it.view != 'roomlist' && it.view != 'userlist' }} 
				<span style="font:1.7em arial; color:#ffffff; line-height:20px; vertical-align:middle;">Бронирование&nbsp;переговорной&nbsp;</span>
		      	<span id="selectroom" style="text-align:center;"></span>{{? it.isadmin }}<a class="button_sand" onclick="csend({view:'roomlist'})">изменить</a>{{?}}      
			{{?}}
			</div>  
      		<div style="float:right"><span class='button_sand' onclick="csend({view : 'week', action:'logout'}, null, true)">{{=it.user}} - выход</span>
			{{? it.isadmin && it.view != 'userlist' }}
				<a class="button_sand" onclick="csend({view:'userlist'})">пользователи</a>
			{{?}}
        	<a class="button_sand" onclick="csend({view:'week'})">неделя</a> <a class="button_sand" onclick="csend({view:'month'})">месяц</a> <a class="button_sand" onclick="csend({view:'year'})">год</a>
       		</div>
		</td>
	</tr>
	<tr>
    	<td align="center">
			{{=it.view}}
			{{? it.view == 'week' }}
				<br>
				<br>
				<table width='100%'>
					<tr>
						<td valign='top'>
							<br>
							<div align='center'>
								<div id='month1'></div>
							</div>
						</td>
						<td id="table_container">
						{{=drawWeek(it.day, it.month, it.year)}}
						</td>
					</tr>
				</table>
			{{?}}
			{{? it.view == 'month' }}
				{{=drawMonth(it.month, it.year) }}
			{{?}}
			
			{{? it.view == 'year' }}
				{{=drawYear(it.year) }}
			{{?}}
			
			{{? it.view == 'userlist' && it.isadmin }}
	  			<h1 align="center">Список пользователей</h1>
	  			<br>
	  			<table class="border1px txtcontent" style="text-align:center; width:360px;">
	  				<tr>
	  					<td class="thround" onclick="csend({view:'userlist', sortby:'name'})" style="cursor:pointer">Пользователь</td>
	  					<td class="thround" colspan="2" onclick="csend({view:'userlist', sortby:'access'})" style="cursor:pointer">Доступ</td>
	  				</tr>
	  				{{~it.users :value:index}}
	  				<tr>
	  					<td>{{=value.name}}</td>
	  					<td style="width:1px;" nowrap>
	  						<select id="msel{{=value.id}}" onchange="csend({view:'userlist', mode:'setaccess', userid:{{=value.id}}, accessval: this[this.selectedIndex].value})">
	  							<option value='0'></option>
	  							<option value='1' {{? value.access==1}}selected=true{{?}}>Администратор</option>
	  						</select>
	  						{{? it.isadmin}}
	  						&nbsp;<a class='button_sand small' onclick="dodialog('<p>Вы действительно хотите удалить пользователя <b>{{=value.name}}</b>?</p>','csend({view:\'userlist\', mode:\'deleteuser\', userid:{{=value.id}}})')" />&times;</a>
	  						{{?}}
	  					</td>
	  				</tr>
	  				{{~}}			
	  				{{? it.isadmin }}
	  				<tr>
	  					<td colspan='3' style='border:none;' align='center'>
	  						<input id='username' type='text' style='margin:3px; width:70%;'/><a class='button_sand' onclick="csend({view:\'userlist\', mode:'adduser', username: $('#username').val()})">Добавить</a>
	  					</td>
	  				</tr>
	  				{{?}}
	  			</table>
			{{?}}
			
			{{? it.view == 'roomlist' && it.isadmin }}
			<br><br><br><br>
			<table class='border1px txtcontent' style='text-align:center; width:800px;'>
				<tr>
					<td colspan='4' class='thround'>Список переговорных</td>
				</tr>
				{{~it.menu :value:index}}
				<tr>
					<td style='background:#efefef; width:1px; border-right:none;'>
						<a class='button_sand small slide_small' onclick="$('#slider{{=value.id}}').toggle(); $(this).toggleClass('closed')"></a>
					</td>
					<td style='background:#efefef; border-left:none;'>
						<input type='text' class='trans' value='{{=value.text}}' readonly ondblclick="dblclick(this, {{=value.id}}, '{{=value.text}}')" />
					</td>
					<td style='background:#efefef; width:1px;'>
						<div class='colorpicker' id='color{{=value.id}}' style='background:{{=value.color}}; height:20px; width:20px;'></div>
					</td>
					<td style='background:#efefef;width:1px;'>
						<a class='button_sand small' onclick="dodialog('<p>Вы действительно хотите удалить переговорную <b>{{=value.text}}</b> и все ее записи?</p>', 'csend({view:\'roomlist\', mode:\'deleteroom\', roomid:{{=value.id}}})')" />&times;</a>
					</td>
				</tr>
				<tr>
					<td colspan='4' id='slider{{=value.id}}'{{? !value.users }} style='display:none'{{?}}>
						<div>
						{{~value.users :val:ind}}
						<div class='small_user'>{{=val.user}}<a onclick="csend({view:'roomlist', mode: 'deleteroomuser', roomid : {{=value.id}}, username : '{{=val.user}}' })" style="cursor:pointer">&times;</a></div>
						{{~}}
						</div>
						<div style='clear:both;'><input id='username{{=value.id}}' type='text' style='width:80%;' />&nbsp;<a class='button_sand' onclick="csend({view:'roomlist', mode: 'addroomuser', roomid : {{=value.id}}, username : $('#username{{=value.id}}').val() })">Добавить</a></div>
					</td>
				</tr>
			{{~}}
			{{? it.isadmin}}
				<tr>
					<td colspan='4' style='background:#efefef; padding:1em; border:none; text-align:center; '>
						<input id='roomname' type='text' style='width:80%;' />&nbsp;<a class='button_sand' onclick="csend({view:'roomlist', mode: 'addroom', roomname : $('#roomname').val() })">Добавить</a>
					</td>
				</tr>
			{{?}}
		</table>
		{{?}}			
    	</td>
  	</tr>
</table>

</script>

<ul id="menu" style="display:none; position:absolute">
  <li id="editrecord">Изменить</li>
  <li id="deleterecord">Удалить</li>
</ul>

</body>
</html>