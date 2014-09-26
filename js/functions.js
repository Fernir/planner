function strtotime(e,t){function d(e,t,n){var r,i=u[t];if(typeof i!=="undefined"){r=i-o.getDay();if(r===0){r=7*n}else if(r>0&&e==="last"){r-=7}else if(r<0&&e==="next"){r+=7}o.setDate(o.getDate()+r)}}function v(e){var t=e.split(" "),n=t[0],r=t[1].substring(0,3),i=/\d+/.test(n),s=t[2]==="ago",u=(n==="last"?-1:1)*(s?-1:1);if(i){u*=parseInt(n,10)}if(a.hasOwnProperty(r)&&!t[1].match(/^mon(day|\.)?$/i)){return o["set"+a[r]](o["get"+a[r]]()+u)}if(r==="wee"){return o.setDate(o.getDate()+u*7)}if(n==="next"||n==="last"){d(n,r,u)}else if(!i){return false}return true}var n,r,i,s,o,u,a,f,l,c,h,p=false;if(!e){return p}e=e.replace(/^\s+|\s+$/g,"").replace(/\s{2,}/g," ").replace(/[\t\r\n]/g,"").toLowerCase();r=e.match(/^(\d{1,4})([\-\.\/\:])(\d{1,2})([\-\.\/\:])(\d{1,4})(?:\s(\d{1,2}):(\d{2})?:?(\d{2})?)?(?:\s([A-Z]+)?)?$/);if(r&&r[2]===r[4]){if(r[1]>1901){switch(r[2]){case"-":{if(r[3]>12||r[5]>31){return p}return new Date(r[1],parseInt(r[3],10)-1,r[5],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3};case".":{return p};case"/":{if(r[3]>12||r[5]>31){return p}return new Date(r[1],parseInt(r[3],10)-1,r[5],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3}}}else if(r[5]>1901){switch(r[2]){case"-":{if(r[3]>12||r[1]>31){return p}return new Date(r[5],parseInt(r[3],10)-1,r[1],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3};case".":{if(r[3]>12||r[1]>31){return p}return new Date(r[5],parseInt(r[3],10)-1,r[1],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3};case"/":{if(r[1]>12||r[3]>31){return p}return new Date(r[5],parseInt(r[1],10)-1,r[3],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3}}}else{switch(r[2]){case"-":{if(r[3]>12||r[5]>31||r[1]<70&&r[1]>38){return p}s=r[1]>=0&&r[1]<=38?+r[1]+2e3:r[1];return new Date(s,parseInt(r[3],10)-1,r[5],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3};case".":{if(r[5]>=70){if(r[3]>12||r[1]>31){return p}return new Date(r[5],parseInt(r[3],10)-1,r[1],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3}if(r[5]<60&&!r[6]){if(r[1]>23||r[3]>59){return p}i=new Date;return new Date(i.getFullYear(),i.getMonth(),i.getDate(),r[1]||0,r[3]||0,r[5]||0,r[9]||0)/1e3}return p};case"/":{if(r[1]>12||r[3]>31||r[5]<70&&r[5]>38){return p}s=r[5]>=0&&r[5]<=38?+r[5]+2e3:r[5];return new Date(s,parseInt(r[1],10)-1,r[3],r[6]||0,r[7]||0,r[8]||0,r[9]||0)/1e3};case":":{if(r[1]>23||r[3]>59||r[5]>59){return p}i=new Date;return new Date(i.getFullYear(),i.getMonth(),i.getDate(),r[1]||0,r[3]||0,r[5]||0)/1e3}}}}if(e==="now"){return t===null||isNaN(t)?(new Date).getTime()/1e3|0:t|0}if(!isNaN(n=Date.parse(e))){return n/1e3|0}o=t?new Date(t*1e3):new Date;u={sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};a={yea:"FullYear",mon:"Month",day:"Date",hou:"Hours",min:"Minutes",sec:"Seconds"};l="(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec"+"|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?"+"|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)";c="([+-]?\\d+\\s"+l+"|"+"(last|next)\\s"+l+")(\\sago)?";r=e.match(new RegExp(c,"gi"));if(!r){return p}for(h=0,f=r.length;h<f;h++){if(!v(r[h])){return p}}return o.getTime()/1e3}

function date(e,t){var n=this;var r,i;var s=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur","January","February","March","April","May","June","July","August","September","October","November","December"];var o=/\\?(.?)/gi;var u=function(e,t){return i[e]?i[e]():t};var a=function(e,t){e=String(e);while(e.length<t){e="0"+e}return e};i={d:function(){return a(i.j(),2)},D:function(){return i.l().slice(0,3)},j:function(){return r.getDate()},l:function(){return s[i.w()]+"day"},N:function(){return i.w()||7},S:function(){var e=i.j();var t=e%10;if(t<=3&&parseInt(e%100/10,10)==1){t=0}return["st","nd","rd"][t-1]||"th"},w:function(){return r.getDay()},z:function(){var e=new Date(i.Y(),i.n()-1,i.j());var t=new Date(i.Y(),0,1);return Math.round((e-t)/864e5)},W:function(){var e=new Date(i.Y(),i.n()-1,i.j()-i.N()+3);var t=new Date(e.getFullYear(),0,4);return a(1+Math.round((e-t)/864e5/7),2)},F:function(){return s[6+i.n()]},m:function(){return a(i.n(),2)},M:function(){return i.F().slice(0,3)},n:function(){return r.getMonth()+1},t:function(){return(new Date(i.Y(),i.n(),0)).getDate()},L:function(){var e=i.Y();return e%4===0&e%100!==0|e%400===0},o:function(){var e=i.n();var t=i.W();var n=i.Y();return n+(e===12&&t<9?1:e===1&&t>9?-1:0)},Y:function(){return r.getFullYear()},y:function(){return i.Y().toString().slice(-2)},a:function(){return r.getHours()>11?"pm":"am"},A:function(){return i.a().toUpperCase()},B:function(){var e=r.getUTCHours()*3600;var t=r.getUTCMinutes()*60;var n=r.getUTCSeconds();return a(Math.floor((e+t+n+3600)/86.4)%1e3,3)},g:function(){return i.G()%12||12},G:function(){return r.getHours()},h:function(){return a(i.g(),2)},H:function(){return a(i.G(),2)},i:function(){return a(r.getMinutes(),2)},s:function(){return a(r.getSeconds(),2)},u:function(){return a(r.getMilliseconds()*1e3,6)},e:function(){throw"Not supported (see source code of date() for timezone on how to add support)"},I:function(){var e=new Date(i.Y(),0);var t=Date.UTC(i.Y(),0);var n=new Date(i.Y(),6);var r=Date.UTC(i.Y(),6);return e-t!==n-r?1:0},O:function(){var e=r.getTimezoneOffset();var t=Math.abs(e);return(e>0?"-":"+")+a(Math.floor(t/60)*100+t%60,4)},P:function(){var e=i.O();return e.substr(0,3)+":"+e.substr(3,2)},T:function(){return"UTC"},Z:function(){return-r.getTimezoneOffset()*60},c:function(){return"Y-m-d\\TH:i:sP".replace(o,u)},r:function(){return"D, d M Y H:i:s O".replace(o,u)},U:function(){return r/1e3|0}};this.date=function(e,t){n=this;r=t===undefined?new Date:t instanceof Date?new Date(t):new Date(t*1e3);return e.replace(o,u)};return this.date(e,t)}

function time(){return Math.floor((new Date).getTime()/1e3)}

function mktime(){var e=new Date,t=arguments,n=0,r=["Hours","Minutes","Seconds","Month","Date","FullYear"];for(n=0;n<r.length;n++){if(typeof t[n]==="undefined"){t[n]=e["get"+r[n]]();t[n]+=n===3}else{t[n]=parseInt(t[n],10);if(isNaN(t[n])){return false}}}t[5]+=t[5]>=0?t[5]<=69?2e3:t[5]<=100?1900:0:0;e.setFullYear(t[5],t[3]-1,t[4]);e.setHours(t[0],t[1],t[2]);return(e.getTime()/1e3>>0)-(e.getTime()<0)}

function intval(e,t){var n;var r=typeof e;if(r==="boolean"){return+e}else if(r==="string"){n=parseInt(e,t||10);return isNaN(n)||!isFinite(n)?0:n}else if(r==="number"&&isFinite(e)){return e|0}else{return 0}}