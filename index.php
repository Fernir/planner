<?php 
header("Content-type: text/html; charset=UTF-8"); 
require_once("config.php"); 
?>

<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5" />
<link rel="stylesheet" href="style/jquery_ui.css" type="text/css" />
<link rel="stylesheet" href="style/style.css" type="text/css" />

<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery_ui.js"></script>
<script type="text/javascript" src="js/dot.js"></script>
<script type="text/javascript" src="js/functions.js"></script>
<script type="text/javascript" src="js/script.js"></script>

<title>Бронирование переговорной</title>
</head>
<body>
<noscript><h1 align="center" style="margin-top:20%; font-size:200%">Бронирование переговорных:<br>
приложение работает только при поддержке JavaScript</h1></noscript>
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

<ul id="menu" style="display:none; position:absolute">
  <li id="editrecord">Изменить</li>
  <li id="deleterecord">Удалить</li>
</ul>

</body>
</html>