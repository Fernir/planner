<?php

header("Content-type: text/javascript; charset=UTF-8"); 

require_once("config.php");

$months = array('Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь');
$weekdays = array('Понедельник', 'Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье');


$action = strip_tags($_REQUEST[action]);

if ($action == 'logout'){
  unset($_SESSION[user]);
}

$user = $_SESSION[user];
$addmonths = strip_tags($_REQUEST[addmonths]);
$mode = strip_tags($_REQUEST[mode]);
$userid = strip_tags($_REQUEST[userid]);
$username = strip_tags($_REQUEST[username]);
$accessval = strip_tags($_REQUEST[accessval]);

$roomid = strip_tags($_REQUEST[roomid]);
$roomname = strip_tags($_REQUEST[roomname]);
$roomcolor = strip_tags($_REQUEST[roomcolor]);

if (intval($_SESSION[room])==0) $_SESSION[room] = '1';
$room = intval(strip_tags($_REQUEST[room]));
$maxroom = mysql_result(mysql_query("select max(id) from headers"), 0);
if (intval($room) != 0 && intval($room) <= $maxroom) $_SESSION[room] = intval($room);

$roomlist = getRoomList();
$arr = array();
foreach($roomlist as &$value) 
	$arr[] = $value[id];
if (!in_array($_SESSION[room], $arr)){
	foreach($roomlist as &$value) {
		$_SESSION[room] = $value[id]; 
		break;
	}
}

$id = strip_tags($_REQUEST[id]);
$storage = strip_tags($_REQUEST[storage]);
$tstart = strip_tags($_REQUEST[tstart]);
$tend = strip_tags($_REQUEST[tend]);
$data = strip_tags($_REQUEST[data]);
$json = array();

if ($_SESSION[year]=='') $_SESSION[year] = intval(date("Y", time()));
if ($_SESSION[month]=='') $_SESSION[month] = intval(date("m", time()));
if ($_SESSION[day]=='') $_SESSION[day] = intval(date("j", time()));

if ($_SESSION[page]=='') {
	$_SESSION[page] = "week";
}

if(isset($_REQUEST['view'])){
  $_SESSION[page] = $_REQUEST['view'];
}


$datediff = strip_tags($_REQUEST['date']);
$timeshtamp = strtotime("$_SESSION[day]-$_SESSION[month]-$_SESSION[year]");
$bgcolor = mysql_fetch_array(mysql_query("select color from headers where id='$_SESSION[room]'"));


function getRoomList(){
	$arr = array();
	$res = mysql_query("select * from headers");
	while($ret = mysql_fetch_array($res, MYSQL_ASSOC)){
		$count = mysql_num_rows(mysql_query("select user from users where room=$ret[id]"));
		$isInGroup = (mysql_num_rows(mysql_query("select user from users where room=$ret[id] and user='$_SESSION[user]'")) > 0);
		if (($count > 0 && $isInGroup) || $count == 0)
			$arr[] = $ret;
	}
	mysql_free_result($res);
	return $arr;
}

function getData($id){
	$res = mysql_query("select id, user, data, tstart, tend, room, mailed from storage where id='$id' and room='$_SESSION[room]'");
	$ret = mysql_fetch_array($res, MYSQL_ASSOC);
	mysql_free_result($res);
	return $ret;
}

function isFieldLockedTime($id, $tstart, $tend, $targetid){
	$res = mysql_query("select id, tstart, tend, user from storage where room='".$_SESSION[room]."' and id != '$id'") or die (mysql_error());
	while($ret=mysql_fetch_array($res, MYSQL_ASSOC)){ 
		if ( date("d-m-Y", $ret[id]) == date("d-m-Y", $targetid) ){
			$ts = strtotime($tstart); 
			$te = strtotime($tend);
			$tsr = strtotime($ret[tstart]); 
			$ter = strtotime($ret[tend]);
			if (($ts >= $tsr && $ts < $ter) || ($te > $tsr && $te <= $ter) || ($ts <= $tsr && $te > $ter)){
				mysql_free_result($res);
				return 1;
			}
		}
	}
	mysql_free_result($res);
	return 0;
}


function isFieldLocked($id){
	$res = mysql_query("select tstart, tend, id from storage where room='".$_SESSION[room]."'");
	while($ret=mysql_fetch_array($res, MYSQL_ASSOC)){ 
		if (date("d/m/Y", $ret[id]) == date("d/m/Y", $id)){
			$time = date("G:i", $id);
			if (strtotime($time) >= strtotime($ret[tstart]) && strtotime($time) < strtotime($ret[tend])){
				mysql_free_result($res);
				return $ret[id];
			}
		}
	}
	mysql_free_result($res);
	return 0;
}

if ($mode && $isAdmin){
	if ($mode=='setaccess' && $accessval!='' && $userid){
		mysql_query("update members set access='$accessval' where id='$userid'") or die (mysql_error());
	}elseif ($mode=='adduser' && $username){
		mysql_query("insert ignore members set name='$username', access=0") or die (mysql_error());
	}elseif ($mode=='deleteuser' && $userid){
		mysql_query("delete from members where id='$userid' and access!='1'") or die (mysql_error());
	}elseif ($mode=='editroom' && $roomid && $roomname){
		mysql_query("update headers set name='$roomname' where id='$roomid'") or die (mysql_error());
	}elseif ($mode=='addroom' && $roomname){
		mysql_query("insert ignore headers  set name='$roomname'") or die (mysql_error());
	}elseif ($mode=='deleteroom' && $roomid){
		mysql_query("delete from storage where room='".$roomid."'") or die (mysql_error());
		mysql_query("delete from headers where id='$roomid'") or die (mysql_error());
	}elseif ($mode=='roomcolor' && $roomid && $roomcolor){
		mysql_query("update headers set color='$roomcolor' where id='$roomid'") or die (mysql_error());
	}elseif ($mode=='addroomuser' && $roomid && $username){
		mysql_query("insert ignore users set room='$roomid', user='$username'") or die (mysql_error());
	}elseif ($mode=='deleteroomuser' && $roomid && $username){
		mysql_query("delete from users where room='$roomid' and user='$username'") or die (mysql_error());
	}
	
	
}

$diff = strtotime("now +1 day") - strtotime("now");
if ($storage){
	if ($id && $data && $tstart && $tend){
		$d = getData($id);
		if ((($data!=$d[data] || $tend!=$d[tend] || $tstart!=$d[tstart]) && ($tend!=$tstart)) && (strtotime($tstart) < strtotime($tend))){
			
			$ret = mysql_fetch_array(mysql_query("select id, user, data, tstart, tend, room from storage where id='$id' && room='$_SESSION[room]'"), MYSQL_ASSOC);
			
			if ($ret[user] == $_SESSION[user] || $isAdmin){
				if ($addmonths){
					$msday = $id;
					$weekday = intval(date("N", $id));
					while($msday < strtotime("+$addmonths months", $id)){
						$idweekday = intval(date("N", $msday));
						if ($idweekday == $weekday && !isFieldLocked($msday)){
							mysql_query("delete from storage where id='$msday' && room='$_SESSION[room]'") or die (mysql_error());
							mysql_query("insert into storage (id, user, data, tstart, tend, room) values('$msday', '$user', '".strip_tags($data)."', '$tstart', '$tend', '$_SESSION[room]')") or die (mysql_error());
							}
						$msday += $diff;
					}
				} else {
					$newid = strtotime(date("d-m-Y", $id)." ".$tstart);
					if (!isFieldLockedTime($id, $tstart, $tend, $newid)){
						mysql_query("delete from storage where id='$id' && room='$_SESSION[room]'") or die (mysql_error());
						mysql_query("insert into storage (id, user, data, tstart, tend, room) values('$newid', '$user', '".strip_tags($data)."', '$tstart', '$tend', '$_SESSION[room]')") or die (mysql_error());
					}
				}
			} elseif ($ret[user] == ''){
				if ($addmonths){
					$msday = $id;
					$weekday = intval(date("N", $id));
					while($msday < strtotime("+$addmonths months", $id)){
						$idweekday = intval(date("N", $msday));
						if ($idweekday == $weekday && !isFieldLocked($msday)){
							mysql_query("insert into storage (id, user, data, tstart, tend, room) values('$msday', '$user', '".strip_tags($data)."', '$tstart', '$tend', '$_SESSION[room]')") or die (mysql_error());
							}
						$msday += $diff;
					}
				} else {
					mysql_query("insert into storage (id, user, data, tstart, tend, room) values('$id', '$user', '".strip_tags($data)."', '$tstart', '$tend', '$_SESSION[room]')") or die (mysql_error());
				}
			}
		}
	} else {
		if ($id && $data==""){
			$ret = mysql_fetch_array(mysql_query("select user from storage where id='$id' && room='$_SESSION[room]'"), MYSQL_ASSOC);
			if ($ret[user] == $_SESSION[user] || $isAdmin){
				if ($addmonths){
					$msday = $id;
					$weekday = intval(date("N", $id));
					while($msday < strtotime("+$addmonths months", $id)){
						$idweekday = intval(date("N", $msday));
						if ($idweekday == $weekday){
							mysql_query("delete from storage where id='$msday' && room='$_SESSION[room]'") or die (mysql_error());
							}
						$msday += $diff;
					}
				} else {
					mysql_query("delete from storage where id='$id' && room='$_SESSION[room]'") or die (mysql_error());
				}
			}
		}
	}
}

if ($_SESSION[page] == 'week'){
	if ($datediff=="+1"){
		$_SESSION[year] = intval(date("Y", strtotime("+1 week", $timeshtamp)));
		$_SESSION[month] = intval(date("m", strtotime("+1 week", $timeshtamp)));
		$_SESSION[day] = intval(date("j", strtotime("+1 week", $timeshtamp)));
	}elseif($datediff=='-1'){
		$_SESSION[year] = intval(date("Y", strtotime("-1 week", $timeshtamp)));
		$_SESSION[month] = intval(date("m", strtotime("-1 week", $timeshtamp)));
		$_SESSION[day] = intval(date("j", strtotime("-1 week", $timeshtamp)));
	}elseif($datediff=='0'){
		$_SESSION[year] = intval(date("Y", time()));
		$_SESSION[month] = intval(date("m", time()));
		$_SESSION[day] = intval(date("j", time()));
	}elseif($datediff!=''){
		$_SESSION[year] = intval(date("Y", $datediff));
		$_SESSION[month] = intval(date("m", $datediff));
		$_SESSION[day] = intval(date("j", $datediff));
	}
}elseif($_SESSION[page] == 'year'){
	if ($datediff=="+1"){
		$_SESSION[year] = intval(date("Y", strtotime("+1 year", $timeshtamp)));
		$_SESSION[month] = intval(date("m", strtotime("+1 year", $timeshtamp)));
		$_SESSION[day] = intval(date("j", strtotime("+1 year", $timeshtamp)));
	}elseif($datediff=='-1'){
		$_SESSION[year] = intval(date("Y", strtotime("-1 year", $timeshtamp)));
		$_SESSION[month] = intval(date("m", strtotime("-1 year", $timeshtamp)));
		$_SESSION[day] = intval(date("j", strtotime("-1 year", $timeshtamp)));
	}elseif($datediff=='0'){
		$_SESSION[year] = intval(date("Y", time()));
		$_SESSION[month] = intval(date("m", time()));
		$_SESSION[day] = intval(date("j", time()));
	}elseif($datediff!=''){
		$_SESSION[year] = intval(date("Y", $datediff));
		$_SESSION[month] = intval(date("m", $datediff));
		$_SESSION[day] = intval(date("j", $datediff));
	}
}elseif($_SESSION[page] == 'month'){
	if ($datediff=="+1"){
		$_SESSION[year] = intval(date("Y", strtotime("+1 month", $timeshtamp)));
		$_SESSION[month] = intval(date("m", strtotime("+1 month", $timeshtamp)));
		$_SESSION[day] = intval(date("j", strtotime("+1 month", $timeshtamp)));
	}elseif($datediff=='-1'){
		$_SESSION[year] = intval(date("Y", strtotime("-1 month", $timeshtamp)));
		$_SESSION[month] = intval(date("m", strtotime("-1 month", $timeshtamp)));
		$_SESSION[day] = intval(date("j", strtotime("-1 month", $timeshtamp)));
	}elseif($datediff=='0'){
		$_SESSION[year] = intval(date("Y", time()));
		$_SESSION[month] = intval(date("m", time()));
		$_SESSION[day] = intval(date("j", time()));
	}elseif($datediff!=''){
		$_SESSION[year] = intval(date("Y", $datediff));
		$_SESSION[month] = intval(date("m", $datediff));
		$_SESSION[day] = intval(date("j", $datediff));
	}
}elseif($_SESSION[page] == 'userlist'){
}


function checkField(){
	global $json;
	$id = strip_tags($_REQUEST[id]);
	$user = strip_tags($_REQUEST[user]);
	$addmonths = strip_tags($_REQUEST[addmonths]);
	$tstart = strip_tags($_REQUEST[tstart]);
	$tend = strip_tags($_REQUEST[tend]);
		
	function isLocked($tm){
		global $tstart, $tend, $id, $addmonths, $isAdmin, $json;
		$curdate = date("d-m-Y", $tm);
		$res = mysql_query("select id, tstart, tend, user from storage where room='$_SESSION[room]' and id != '$id'") or die (mysql_error());
		while($ret=mysql_fetch_array($res, MYSQL_ASSOC)){ 
		  	if (date("d-m-Y", $ret[id]) == $curdate){
				$t1 = strtotime($tstart); 
				$t1e = strtotime($tend);
				$t2 = strtotime($ret[tstart]); 
				$t2e = strtotime($ret[tend]);
				
				$start = array('start' => $t1, 'end' => $t1e);
				$end = array('start' => $t2, 'end' => $t2e);
		
				if (($t1 >= $t2 && $t1 < $t2e) || ($t1e > $t2 && $t1e <= $t2e) || ($t1 <= $t2 && $t1e > $t2e)){
				  	$json['conflict'] = array(
				  		id => $ret[id],
				  		user => $ret[user],
				  		start => $tstart,
				  		end => $tend,
				  	);
					
					/*
					if($isAdmin){
						$outp .= "<br><a class='button_sand red' onclick=\"dodialog('<p>Вы действительно хотите удалить запись?</p>','csend({storage:1, id:$ret[id], tstart:\'$tstart\', tend:\'$tend\'})')\">удалить конфликтующую запись</a>
						<script>$('div [abbr=\"$ret[id]\"]').effect('highlight', {}, 700);</script>";
					}
					*/
					mysql_free_result($res);
					return;
				}
			}
		}
		mysql_free_result($res);
		return "";
	}
	
	if ($id && $addmonths){
		$diff = strtotime("now +1 day") - strtotime("now");
		$count = strtotime("+$addmonths months", $id);
		$msday = $id;
		$weekday = intval(date("N", $id));
		while($msday < strtotime("+$addmonths months", $id)){
			$idweekday = intval(date("N", $msday));
			if ($idweekday == $weekday){
		  		if (isLocked($msday)){
		  			return;
		  		}
			}
			$msday += $diff;
	  	}
	} elseif ($id) {
		isLocked($id);
	}		
}

function WeekJSON($day=null, $month=null, $year=null) {
	global $months, $weekdays, $user, $json;
	if (!$day) $day = intval(date("j", time())); 
	if (!$month) $month = intval(date("m", time())); 
	if (!$year) $year = intval(date("Y", time()));
	$week_day = intval(date("N", mktime(0, 0, 0, $month, $day, $year)));
	
	$bigarray = array();
	
	$fromtime = strtotime("-".($week_day-1)." days", strtotime("$day-$month-$year"));
	$totime = strtotime("-".($week_day-8)." days", strtotime("$day-$month-$year"));
	$bigres = mysql_query("select * from storage where (cast(id as unsigned) > $fromtime && cast(id as unsigned) < $totime) && room='$_SESSION[room]'");
	while($ret=mysql_fetch_array($bigres, MYSQL_ASSOC))
		$bigarray[$ret[id]] = $ret;
	mysql_free_result($bigres);
	
	function isFieldLockedSmall($bigarray, $bigres, $id){
		if ($bigarray[$id]){
			//$time = date("G:i", $id);
			//if (strtotime($time) >= strtotime($bigarray[$id][tstart]) && strtotime($time) < strtotime($bigarray[$id][tend])){
				return $bigarray[$id];
			//}
		}
	}
	
	$divs = array();
	for($j=7; $j<=22; $j+=.5){
		$tm = (($j-intval($j)!=.5) ? "$j:00":intval($j).":30");
		$timestamp = (($j-intval($j)!=.5) ? "$j:00":"");
		for ($i=1; $i<=7; $i++){
			$monthnow = date("m", strtotime("-".($week_day-$i)." day", strtotime("$day-$month-$year $tm")));
			$daynow = intval(date("j", strtotime("-".($week_day-$i)." day", strtotime("$day-$month-$year $tm"))));
			$field_id = strtotime("$daynow-$monthnow-$year $tm");
			if ($divs[$field_id]) continue;
			$lock = isFieldLockedSmall($bigarray, $bigres, $field_id);
			if ($lock[id] > 0 && !$divs[$lock[id]]){
				$divs[$lock[id]] = 1;
				$timeheight = (((strtotime($lock[tend]) - strtotime($lock[tstart]))/60/60)*2)*(20+1);
	  			$json['markers'][$field_id] = array(
	  				id => $field_id,
	  				tstart => ($lock[tstart] ? $lock[tstart]:$tm),
	  				tend => $lock[tend],
	  				user => ($lock[user] ? $lock[user]:$user),
	  				data => rawurlencode($lock[data] ? $lock[data]:$lock[user]),
	  				height => $timeheight,
	  				week => ($i - 1),
					ts => $lock[ts] != "0000-00-00 00:00:00" ? $lock[ts] : '',
	    		);
			}
		}
	}
}

$json['view'] = $_SESSION[page]; 
$json['user'] = $_SESSION[user]; 
$json['ia'] = $isAdmin; 
$json['day'] = $_SESSION[day]; 
$json['month'] = $_SESSION[month]; 
$json['year'] = $_SESSION[year]; 
$json['room'] = $_SESSION[room]; 

// -- rooms
$result = mysql_query("select * from headers order by name");
while($value = mysql_fetch_array($result, MYSQL_ASSOC)){
	// -- current color
	if ($value[id] == $json['room'])
		$json['color'] = $value[color]; 

	// -- users in rooms
	$usersm = null;
	$q = mysql_query("select * from users where room = $value[id]");
	while($r = mysql_fetch_array($q, MYSQL_ASSOC)){
		$usersm[] = array(
			user => $r[user],
		);
	}
	mysql_free_result($q);
		
	// -- menu using this
	$json['menu'][] = array(
		id => $value[id],
		text => $value[name],
		selected => ($value[id] == $json['room']),
		color => $value[color],
		users => $usersm
	);
}
mysql_free_result($result);

if ($_SESSION[page] == 'userlist') {
	// -- users
	$result=mysql_query("select id, name, access from members");
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$json['users'][] = array(
			id => $row[id],
			name => $row[name],
			access => $row[access],
		);
	}
	mysql_free_result($result);
}

if ($action && $action == 'checkfield')	checkField();
if ($_SESSION[page] == 'week') {
	WeekJSON($_SESSION[day], $_SESSION[month], $_SESSION[year]);
}

print json_encode($json);


mysql_close($con); 

?>