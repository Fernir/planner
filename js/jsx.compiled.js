var global = { json : {} }
var weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
var weekdays_sm = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вск']
var months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
var months_sm = ['Янв','Фев','Мар','Апр','Май','Июнь','Июль','Авг','Сен','Окт','Ноя','Дек']

if (Object.prototype.watch == null) {
    Object.defineProperty(Object.prototype, "watch", { enumerable: false, configurable: true, writable: false, value: function (prop, handler) {
            var oldval = this[prop], newval = oldval, getter = function(){ return newval; }, setter = function(val){
                oldval = newval;
                return newval = handler.call(this, prop, oldval, val);
            };
            if (delete this[prop]) {
                Object.defineProperty(this, prop, { get: getter, set: setter, enumerable: true, configurable: true });
            }
        }
    });
}

var csend = function(arg){
    var serialiseObject = function(obj) {
        var pairs = [];
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            if (Object.prototype.toString.call(obj[prop]) == '[object Object]') {
                pairs.push(serialiseObject(obj[prop]));
                continue;
            }
            pairs.push(prop + '=' + obj[prop]);
        }
        return pairs.join('&');
    }

    var xmlhttp = new XMLHttpRequest() || new ActiveXObject('Msxml2.XMLHTTP') || new ActiveXObject('Microsoft.XMLHTTP') || null;
    if(xmlhttp){
        xmlhttp.open( "GET", 'core.php?' + serialiseObject(arg), true );
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if ((xmlhttp.status >= 200 && xmlhttp.status < 300) || xmlhttp.status == 304) {
                    global.json = JSON.parse(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.send(null);
    }
}

var PlannerHeader = React.createClass({displayName: "PlannerHeader",
    send: function(view, arg1, arg2){
        return function() {
            csend(view, arg1, arg2);
        }
    },
    render: function() {
        return (
            React.createElement("div", {className: "header", style: {height:'70px'}}, 
                React.createElement("div", {style: {'float':'right'}}, 
                    React.createElement("span", {className: "button_sand", onClick: this.send({view : 'week', acion:'logout'}, null, true)}, this.props.user, " - выход"), 
                    (this.props.isAdmin && this.props.view != 'userlist') && (
                        React.createElement("a", {className: "button_sand", onClick: this.send({view:'userlist'})}, "пользователи")
                    ), 
                    (this.props.view != 'week') && (
                        React.createElement("a", {className: "button_sand", onClick: this.send({view:'week'})}, "неделя")
                    ), 
                    (this.props.view != 'month') && (
                        React.createElement("a", {className: "button_sand", onClick: this.send({view:'month'})}, "месяц")
                    ), 
                    (this.props.view != 'year') && (
                        React.createElement("a", {className: "button_sand", onClick: this.send({view:'year'})}, "год")
                    )
                ), 
                (this.props.view != 'roomlist' && this.props.view != 'userlist') && (
                React.createElement("div", {style: {marginRight: '50%', verticalAlign: 'middle', whiteSpace: 'nowrap', lineHeight: '25px'}}, 
                    React.createElement("span", {style: {fontSize: '25px', padding: '0px 1em', display:'table-cell', verticalAlign:'middle'}}, "Бронирование переговорной "), 
                    React.createElement("span", {style: {display:'table-cell', verticalAlign:'middle'}}, React.createElement(DrawRoomsMenu, {menu: this.props.menu})), 
                    (this.props.isAdmin) && (
                        React.createElement("span", {style: {display:'table-cell', verticalAlign:'middle'}}, 
                            React.createElement("a", {className: "button_sand", onClick: this.send({view : 'roomlist'})}, "изменить")
                        )
                    )
                )
                )
            )
        );
    }
});

var DrawMonth = React.createClass({displayName: "DrawMonth",
    getDefaultProps: function() {
        return {
            month: Math.floor(date("m", time())),
            year: Math.floor(date("Y", time())),
            showyear : true,
        };
    },
    send: function(ts){
        return function() {
            csend({view : 'week', date: ts });
        };
    },
    render: function() {
        var days_in_this_month = Math.floor(date("t", mktime(0, 0, 0, this.props.month, 1, this.props.year)));
        var days_in_prev_month = Math.floor(date("t", mktime(0, 0, 0, this.props.month-1, 1, this.props.year)));
        var week_day = Math.floor(date("N", mktime(0, 0, 0, this.props.month, 1, this.props.year)));
        
        var counter = 1;
        var first_day = week_day;
        var oct = week_day;
        var rows = [];
        var cols = [];

        if (first_day > 1){
            var start_prev = (days_in_prev_month - first_day + 2);
            cols = [];
            for (var days = 1; days < first_day; days++) {
                var ts = strtotime(start_prev + '-' + (this.props.month-1) + '-' + this.props.year + ' 00:00');
                var colStyle = (days > 5 ? 'back_gray light_gray mmo':'light_gray mmo');
                if (!this.props.showyear) {
                    cols.push(React.createElement("td", {className: colStyle}, start_prev, ", ", weekdays[days-1]));
                }else{
                    cols.push(React.createElement("td", {className: colStyle, onClick: this.send(ts)}, start_prev));
                }
                start_prev++;
            }
        }
        
        var week = 1;
        for (var days = 1; days <= (days_in_this_month); days++) {
            var ts = strtotime(counter + '-' + this.props.month + '-' + this.props.year + ' 00:00');
            
            if (week_day > 5){
                if (week == 1 && !this.props.showyear) {
                    cols.push(React.createElement("td", {className: "back_gray mmo", onClick: this.send(ts)}, weekdays[week_day-1], ", ", counter));
                }else{
                    cols.push(React.createElement("td", {className: "back_gray mmo", onClick: this.send(ts)}, counter));
                }
            } else if (week == 1 && !this.props.showyear) {
                cols.push(React.createElement("td", {className: "mmo", onClick: this.send(ts)}, weekdays[week_day-1], ", ", counter));
            } else {
                cols.push(React.createElement("td", {className: "mmo", onClick: this.send(ts)}, counter));
            }   
            counter++;
            
            if (week_day==7) {
                week++;
            }

            week_day%=7;
            week_day++;

            if (week_day == 1){
                rows.push(React.createElement("tr", null, cols));
                cols = [];
            }
        }

        counter = 1;
        if (cols.length < 7){
            for(i=cols.length; i<7; i++){
                var cName = (i >= 5) ? 'light_gray mmo back_gray':'light_gray mmo';
                var ts = strtotime(counter + '-' + (this.props.month+1) + '-' + this.props.year + ' 00:00');
                cols.push(React.createElement("td", {className: cName, onClick: this.send(ts)}, counter))
                counter++;
            }
        }

        if(rows.length < 5){
            rows.push(React.createElement("tr", null, cols));
        }


        var monthTableClassName = (this.props.showyear ? 'border1px txtcontent':'border1px txtcontent monthtable');

        return (
            React.createElement("div", null, 
                React.createElement("div", null, 
                (this.props.showyear) && (
                    React.createElement("p", {style: {textAlign:'center'}}, React.createElement("b", null, months[this.props.month-1]))
                ) || (
                    React.createElement("h1", {style: {textAlign:'center'}}, months[this.props.month-1], ", ", this.props.year)
                )
                ), 
                React.createElement("table", {className: monthTableClassName, style: { margin: '0 auto', width: this.props.showyear ? 'auto':'90%'}}, 
                    React.createElement("tbody", null, rows)
                )
            )
        );
    }
});

var DrawWeek = React.createClass({displayName: "DrawWeek",
    componentDidMount: function() {
        this
          .getDOMNode()
          .offsetParent
          .addEventListener('keyup', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            if(intKey == 27){
                this.setState({ 
                    showEditor: false,
                });
            }
          }.bind(this));
    },
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            showEditor: false,
        });
    },
    getDefaultProps: function() {
        return {
            day: date("j", time()),
            month: Math.floor(date("m", time())),
            year: Math.floor(date("Y", time())),
            json: {},
        };
    },
    getInitialState: function() {
        return {
            showEditor: false,
            data: {},
            tstart: '',
            tend: '',
            user: '',
        };
    },
    handleClick: function(event){
        var marker = null;
        if(this.props.json.markers && Object.keys(this.props.json.markers).length > 0 && event.target.getAttribute('data-abbr')){
            marker = this.props.json.markers[parseInt(event.target.getAttribute('data-abbr'))];
        };

        var ts = date('H:i', parseInt(event.target.getAttribute('data-abbr')));
        var te = date('H:i', strtotime('+ 30 minutes', parseInt(event.target.getAttribute('data-abbr'))));

        var default_data = { id : event.target.getAttribute('data-abbr'), week : (event.target.index - 1), tstart : ts, tend : te };
        var data = marker ? marker : default_data;

        this.setState({
            data: data,
            tstart: data.tstart,
            tend: data.tend,
            showEditor: true,
        });
    },
    render : function(){
        var week_day = date("N", mktime(0, 0, 0, this.props.month, this.props.day, this.props.year));
        var rows = [];
        var cols = [];

        cols.push(React.createElement("td", {className: "num_offset"}, " "))
        for (i=1; i<=7; i++){
            var daynow = Math.floor(date('j', strtotime('- '+(i-week_day)+' days', strtotime(this.props.day+'-'+this.props.month+'-'+this.props.year))));
            var thColor = ((i==date('N', time())) ? '#00ab22':'');
            cols.push(React.createElement("th", {className: "dates", style: { 'color':thColor}}, weekdays[i-1], " ", daynow));
        }
        rows.push(React.createElement("tr", null, cols));

        cols = [];
        for(j=7; j<=22.5; j+=.5){
            var tm = ((j-Math.floor(j)!=.5) ? j+':00':Math.floor(j)+':30');
            var timestamp = ((j-Math.floor(j)!=.5) ? (j)+':00':'');
            var colClass = ((j==date('N', time())) ? 'num_offset num_offset_today':'num_offset');
            cols = [];
            cols.push(React.createElement("td", {className: colClass}, (timestamp)&&(React.createElement("div", null, timestamp))));

            for (i=1; i<=7; i++){
                var monthnow = Math.floor(date('m', strtotime('- '+(i-week_day)+' days', strtotime(this.props.day+'-'+this.props.month+'-'+this.props.year+' '+tm))))
                var daynow = Math.floor(date('j', strtotime('- '+(i-week_day)+' days', strtotime(this.props.day+'-'+this.props.month+'-'+this.props.year+' '+tm))))
                var field_id = strtotime(this.props.year+'-'+monthnow+'-'+daynow+' '+tm);
                var tclass = ((j==date('H', time())) ? 'green_line':'') + ((i==date('N', time())) ? ' back_green':'') + ((j%1==0)? ' du':' dd');
                var marker = null;
                if(this.props.json.markers && Object.keys(this.props.json.markers).length > 0){
                    marker = this.props.json.markers[field_id];
                };

                cols.push(
                    React.createElement("td", {"data-abbr": field_id, className: tclass, onClick: this.handleClick, style: {padding:0, margin:0}}, 
                        (marker && marker.id) && (
                            React.createElement("span", {className: "marker", "data-tooltip": decodeURIComponent(marker.data), "data-abbr": marker.id, style: {height:marker.height-1, backgroundColor:this.props.json.color}, onClick: this.handleClick}, marker.user)
                        )
                    )
                );
            }
            rows.push(React.createElement("tr", null, cols));
        }

        var years = []
        var cury = parseInt(this.props.json.year) - 10;
        for (var i=1; i<20; i++ ){
            years[i] = cury;
            cury++;
        }

        var curYear = parseInt(this.props.json.year);
        var curMonth = parseInt(this.props.json.month);

        return (
            React.createElement("table", {style: {margin:'0 auto'}}, 
                React.createElement("tbody", null, 
                    React.createElement("tr", null, 
                        React.createElement("td", {colSpan: "2"}, 
                            React.createElement("h2", {style: {textAlign:'center'}}, months[this.props.json.month-1], ", ", this.props.json.year, React.createElement("br", null), React.createElement("br", null))
                        )
                    ), 
                    React.createElement("tr", null, 
                        React.createElement("td", {style: {verticalAlign:'top', paddingRight: '40px', whiteSpace: 'nowrap'}}, 
                            React.createElement("span", {className: "button_sand", onClick: function(){ csend({ view:'week', date: strtotime('-1 month', strtotime(curYear + '-' + curMonth + '-' + 1)) }) }}, "«"), 
                            React.createElement("select", {className: "button_sand", onChange: function(e){ csend({ view:'week', date: strtotime(curYear + '-' + e.target.value + '-' + 1) }) }}, 
                            months.map(function(val, index){
                                return (React.createElement("option", {key: index, value: index+1, selected: months[curMonth-1] === val}, val));
                            })
                            ), 
                            React.createElement("select", {className: "button_sand", onChange: function(e){ csend({ view:'week', date: strtotime(e.target.value + '-' + curMonth + '-' + 1) }) }}, 
                            years.map(function(val, index){
                                return (React.createElement("option", {key: val, value: val, selected: curYear === val}, val));
                            })
                            ), 
                            React.createElement("span", {className: "button_sand", onClick: function(){ csend({ view:'week', date: strtotime('+1 month', strtotime(curYear + '-' + curMonth + '-' + 1)) }) }}, "»"), 
                            React.createElement(DrawMonth, {month: this.props.json.month, year: this.props.json.year, showyear: true}), 
                            React.createElement("br", null), 
                            React.createElement("hr", null), 
                            React.createElement("span", {className: "button_sand", onClick: function(){ csend({ view:'week', date: strtotime('now') }) }}, "Сегодня")
                        ), 
                        React.createElement("td", null, 
                            React.createElement("table", {className: "border1px parent_container", style: {margin: '0 auto'}}, 
                            React.createElement("tbody", null, rows)
                            ), 
                            React.createElement(TimeEdit, {json: this.props.json, data: this.state.data, closed: !this.state.showEditor})
                        )
                    )
                )
            )
        );
    }

});

var DrawYear = React.createClass({displayName: "DrawYear",
    render: function() {
        var counter = 1;
        var rows = [];
        for (i=1; i<=3; i++){
            var cols = [];
            for (j=1; j<=4; j++){
                cols.push(React.createElement("td", {style: {verticalAlign: 'top'}}, React.createElement(DrawMonth, {month: counter, year: this.props.year, showyear: true})));
                counter++;
            }
            rows.push(React.createElement("tr", null, cols));
        }

        return (
            React.createElement("div", {style: {textAlign: 'center'}}, 
                React.createElement("h1", null, this.props.year), 
                React.createElement("table", {cellPadding: 10, style: {margin: '0 auto'}}, React.createElement("tbody", null, rows))
            )
        );
    }
});

var DrawRoomsMenu = React.createClass({displayName: "DrawRoomsMenu",
    render : function(){

        var captionText = '';
        var captionColor = '';
        for(v in this.props.menu){
            if(this.props.menu[v].selected){
                captionText = this.props.menu[v].text;
                captionColor = this.props.menu[v].color;
                break;
            }
        }

        return (
            React.createElement("div", {style: { display: 'inline-block', cursor: 'pointer'}}, 
                React.createElement("div", {className: "button_sand", style: { cursor: 'pointer', display:'inline-block', backgroundColor: captionColor, color: '#000'}, onClick: function(){ document.getElementById('menuholder_container').style.display = 'block' }}, 
                captionText
                ), 
                React.createElement("div", {id: "menuholder_container", style: { cursor:'pointer', position:'absolute', zIndex:'999', display:'none'}}, 
                    this.props.menu.map(function(m, index){
                        return (
                            React.createElement("div", {className: "menu button_sand", key: index, "data-abbr": m.id, style: { backgroundColor: m.color, cursor : 'pointer', display : 'block', borderTop: 'none'}, onClick: function(){ document.getElementById('menuholder_container').style.display = 'none'; csend({ room : m.id }) }}, 
                                m.text
                            )
                        );
                    })
                )
            )
        );
    }
});

var TimeEdit = React.createClass({displayName: "TimeEdit",
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            closed: nextProps.closed,
            data: nextProps.data,
            text: nextProps.data.text || this.props.json.user || '',
        });

        if(nextProps.data.data){
            this.setState({ text: decodeURIComponent(nextProps.data.data) || '' });
        }

        if(nextProps.data.tstart){
            this.setState({ start_time_value : parseFloat(nextProps.data.tstart.replace(':00','').replace(':30','.5')) || 7 });
        }

        if(nextProps.data.tend){
           this.setState({ end_time_value : parseFloat(nextProps.data.tend.replace(':00','').replace(':30','.5')) || 7 });
        }
    },
    getInitialState: function() {
        return { 
            closed: true,
            month_checked: '',
            start_time_value : 7,
            end_time_value : 7,
            months_value : 0,
            text: this.props.json.user,
        };
    },
    handleChecked: function(event){
        this.setState({ 
            month_checked: event.target.checked ? 'checked':'',
        });
    },
    handleMonthsChange: function(event){
        this.setState({ 
            months_value: event.target.value,
        });
    },
    handleText: function(event){
        this.setState({
            text: event.target.value,
        });
    },
    deleteConflict: function(){
        csend({ view : 'week', storage:1, id: this.state.conflict.id, tstart: this.state.conflict.start, tend: this.state.conflict.end });
    },
    handleStartTimeChange: function(event){
        this.setState({ 
            start_time_value: event.target.value,
            end_time_value: Math.max(parseFloat(this.state.start_time_value)+.5, this.state.end_time_value),
        });
    },
    handleEndTimeChange: function(event){
        this.setState({ 
            end_time_value: Math.max(parseFloat(this.state.start_time_value)+.5, event.target.value),
        });
    },
    handleSave: function(event){
        var ts = parseFloat(this.state.start_time_value);
        var te = parseFloat(this.state.end_time_value);

        var tstxt = (ts%1 > 0) ? ts.toString().replace('.5', ':30') : ts.toString() + ':00';
        var tetxt = (te%1 > 0) ? te.toString().replace('.5', ':30') : te.toString() + ':00';

        csend({ view : 'week', storage : 1, id : this.state.data.id, data : this.state.text, tstart : tstxt, tend : tetxt, addmonths : this.state.months_value });
        this.setState({ closed: true });
    },
    handleClose: function(event){
        this.setState({ closed: true });
    },
    render: function() {
        var ts = parseFloat(this.state.start_time_value);
        var te = parseFloat(this.state.end_time_value);
        
        var tstxt = (ts%1 > 0) ? ts.toString().replace('.5', ':30') : ts.toString() + ':00';
        var tetxt = (te%1 > 0) ? te.toString().replace('.5', ':30') : te.toString() + ':00';

        return (
            React.createElement("div", null, 
                (this.state.conflict) && (
                React.createElement("div", {style: {position:'absolute', top:0, left:0, bottom:0, right:0, backgroundColor : 'rgba(0,0,0,.5)', alignItems:'center', display:'flex', minHeight:'100%'}}, 
                    React.createElement("div", {id: "msgboxform", style: { backgroundColor: '#eee', boxShadow:'0 0 6px rgba(0,0,0,.5)', margin: 'auto auto'}}, 
                        React.createElement("div", {id: "msgboxform_header", className: "header", style: {'padding':'0'}}, 
                            React.createElement("div", {style: {float: 'left', fontWeight: 'bold', padding: '5px 10px'}}, "Конфликт"), 
                            React.createElement("div", {onClick: this.handleClose, className: "button_sand", style: { float: 'right'}}, "×"), 
                            React.createElement("div", {style: { clear: 'both'}})
                        ), 
                        React.createElement("div", {style: {padding: '0px 20px'}}, 
                            React.createElement("h2", null, "На это время уже есть запись"), 
                            React.createElement("p", null, "Пользователь ", React.createElement("b", null, this.state.conflict.user)), 
                            React.createElement("p", null, "Создано ", React.createElement("b", null, this.state.conflict.date), " на ", React.createElement("b", null, this.state.conflict.start, "-", this.state.conflict.end)), 
                            (this.props.json.ia) && (
                                React.createElement("p", null, 
                                    React.createElement("a", {className: "button_sand", onClick: this.deleteConflict}, "удалить конфликтующую запись")
                                )
                            )
                        )
                    )
                )
                ), 

                (!this.state.closed && !this.state.conflict) && (
                    React.createElement("div", {style: {position:'absolute', top:0, left:0, bottom:0, right:0, backgroundColor : 'rgba(0,0,0,.5)', alignItems:'center', display:'flex', minHeight:'100%'}}, 
                        React.createElement("div", {id: "msgboxform", style: { backgroundColor: '#eee', boxShadow:'0 0 6px rgba(0,0,0,.5)', margin: '0px auto', width: '800px'}}, 
                            React.createElement("div", {id: "msgboxform_header", className: "header", style: {'padding':'0'}}, 
                                React.createElement("div", {style: {float: 'left', fontWeight: 'bold', padding: '5px 10px'}}, "Добавление события"), 
                                React.createElement("div", {onClick: this.handleClose, className: "button_sand", style: { float: 'right'}}, "×"), 
                                React.createElement("div", {style: { clear: 'both'}})
                            ), 
                            React.createElement("div", {style: {padding: '10px'}}, 
                                React.createElement("table", {style: {width: '100%'}, className: "txtcontent"}, 
                                    React.createElement("tbody", null, 
                                        React.createElement("tr", null, 
                                            React.createElement("td", {colSpan: "2"}, 
                                                React.createElement("label", {htmlFor: "msgboxval"}, "Заметка"), 
                                                React.createElement("textarea", {id: "msgboxval", style: {width: '100%', height: '100px', resize: 'none', padding: '0', margin: '0', font: '1em arial'}, onChange: this.handleText, value: this.state.text})
                                            )
                                        ), 
                                        React.createElement("tr", null, 
                                            React.createElement("td", {style: {width: '300px'}}, 
                                                React.createElement("table", null, 
                                                    React.createElement("tbody", null, 
                                                        React.createElement("tr", null, 
                                                            React.createElement("td", null, React.createElement("label", {htmlFor: "start_range_time"}, "Начало ")), 
                                                            React.createElement("td", null, React.createElement("input", {style: { border: 'none', outline: 'none'}, type: "range", id: "start_range_time", min: "7", max: 22, step: ".5", value: this.state.start_time_value, onChange: this.handleStartTimeChange}), " ", tstxt)
                                                        ), 
                                                        React.createElement("tr", null, 
                                                            React.createElement("td", null, React.createElement("label", {htmlFor: "end_range_time"}, "Конец ")), 
                                                            React.createElement("td", null, React.createElement("input", {style: { border: 'none', outline: 'none'}, type: "range", id: "end_range_time", min: "7", max: 22.5, step: ".5", value: this.state.end_time_value, onChange: this.handleEndTimeChange}), " ", tetxt)
                                                        )
                                                    )
                                                )
                                            ), 
                                            React.createElement("td", null, 
                                                React.createElement("input", {type: "hidden", id: "uservalue"}), 
                                                React.createElement("input", {type: "hidden", id: "idvalue"}), 
                                                React.createElement("input", {type: "checkbox", id: "checkmonths", onChange: this.handleChecked, checked: this.state.month_checked}), 
                                                React.createElement("label", {htmlFor: "checkmonths"}, " повторяющиеся события"), 
                                                (this.state.month_checked == 'checked') && (
                                                    React.createElement("label", {htmlFor: "months"}, "  ", React.createElement("input", {name: "months", id: "months", min: "0", max: "12", value: this.state.months_value, onChange: this.handleMonthsChange, type: "range"}), " ", this.state.months_value, " месяцев")
                                                )
                                            )
                                        ), 
                                        React.createElement("tr", null, 
                                            React.createElement("td", {colSpan: "2", style: {textAlign: 'center'}}, React.createElement("span", {id: "skull"}))
                                        )
                                    )
                                ), 
                                React.createElement("div", {style: {float:'right'}}, 
                                    React.createElement("button", {className: "button_sand", onClick: this.handleClose}, "Отмена"), " ", React.createElement("button", {className: "button_sand", onClick: this.handleSave}, "Сохранить")
                                ), 
                                React.createElement("div", {style: {clear:'both'}})
                            )
                        )
                    )
                )
            )
        );
    }
});

var DrawUsers = React.createClass({displayName: "DrawUsers",
    componentWillReceiveProps: function(nextProps){
        document.getElementById('username').focus();
    },
    componentDidMount: function() {
        document.getElementById('username').focus();
    },
    render: function(){

        return (
            React.createElement("div", null, 
                React.createElement("h1", {style: {textAlign:'center'}}, "Список пользователей"), 
                React.createElement("br", null), 
                React.createElement("table", {className: "border1px nobordered txtcontent", style: {margin:'0 auto;'}}, 
                    React.createElement("thead", null, 
                        this.props.json.users.map(function(value){
                            return (
                            React.createElement("tr", null, 
                                React.createElement("td", null, value.name), 
                                React.createElement("td", {nowrap: true}, 
                                    React.createElement("select", {className: "button_sand", id: "msel{value.id}", defaultValue: value.access, onChange: function(e){csend({view:'userlist', mode:'setaccess', userid: value.id, accessval: e.target.value}) }, style: {width:'100%'}}, 
                                        React.createElement("option", {value: "0"}), 
                                        React.createElement("option", {value: "1"}, "Администратор")
                                    )
                                ), 
                                React.createElement("td", {style: {width:'1px'}}, 
                                    React.createElement("a", {className: "button_sand small", onClick: function(){ csend({view:'userlist', mode:'deleteuser', userid:value.id}) }}, "×")
                                )
                            )
                            );
                        }), 
                        React.createElement("tr", null, 
                            React.createElement("td", {colSpan: "3", style: {border:'none', textAlign:'center'}}, 
                                React.createElement("a", {className: "button_sand", style: {float:'right', width:'30%'}, onClick: function(){csend({view:'userlist', mode:'adduser', username: document.getElementById('username').value}); document.getElementById('username').value = ''; document.getElementById('username').focus() }}, "Добавить"), 
                                React.createElement("div", {style: {marginRight:'31%'}}, React.createElement("input", {className: "button_sand", id: "username", type: "text", style: {width:'100%', height:'29px'}}))
                            )
                        )
                    )
                )
            )
        );
    }
});

var DrawRoomList = React.createClass({displayName: "DrawRoomList",
    getInitialState: function() {
        return { 
            showPicker: false,
            id: 0,
        };
    },
    slideClick: function(value){
        var slider = document.getElementById('slider'+value.id);

        if(slider){
            slider.style.display = (slider.style.display == 'block') ? 'none':'block';
        }
    },
    onChange: function(e){
        if (e.type === 'keyup'){
            var intKey = (window.Event) ? e.which : e.keyCode;
            if(intKey == 13){
                e.target.style.fontWeight = 'normal';
                e.target.setAttribute('readonly', '');
                csend({ view : 'roomlist', mode : 'editroom', roomid : e.target.getAttribute('data-id'), roomname : e.target.value });
            }
        } else {
            e.target.style.fontWeight = 'normal';
            e.target.setAttribute('readonly', '');
            csend({ view : 'roomlist', mode : 'editroom', roomid : e.target.getAttribute('data-id'), roomname : e.target.value });
        }
    },
    render: function(){
        return (
            React.createElement("div", null, 
                React.createElement("h2", {style: {textAlign:'center'}}, "Список переговорных"), 
                React.createElement("table", {className: "border1px txtcontent", style: { margin:'20px auto 0px auto', width:'800px'}}, 
                    React.createElement("tbody", null, 
                        this.props.json.menu.map(function(value, i){
                            return (
                                React.createElement("tr", {key: i, style: {backgroundColor:value.color}}, 
                                    React.createElement("td", null, 
                                        React.createElement("table", {className: "nobordered", style: {width:'100%', borderCollapsed: 'collapsed', borderSpacing: '0px'}}, 
                                            React.createElement("tbody", null, 
                                                React.createElement("tr", null, 
                                                    React.createElement("td", {style: {width:'40px', borderRight:'none'}}, 
                                                        React.createElement("a", {className: "button_sand small", onClick:  this.slideClick.bind(this, value) }, "—")
                                                    ), 
                                                    React.createElement("td", {style: {borderLeft:'none'}}, 
                                                        React.createElement("input", {type: "text", id: 'trans'+i, "data-id": value.id, className: "trans", defaultValue: value.text, readOnly: true, onKeyUp: this.onChange, onBlur: this.onChange})
                                                    ), 
                                                    React.createElement("td", {style: {width:'40px'}}, 
                                                        React.createElement("a", {className: "button_sand small", onClick:  function(e){ document.querySelector('#trans' + i).removeAttribute('readonly'); document.querySelector('#trans' + i).style.fontWeight = 'bold'; document.querySelector('#trans' + i).focus() }}, "…")
                                                    ), 
                                                    React.createElement("td", {style: {width:'40px'}}, 
                                                        React.createElement("div", {className: "colorpicker", id: 'color'+value.id, style: {backgroundColor:value.color, height:'20px', width:'20px'}, onClick: function(){ this.setState({ showPicker: true, id: value.id }) }.bind(this)})
                                                    ), 
                                                    React.createElement("td", {style: {width:'40px'}}, 
                                                        React.createElement("a", {className: "button_sand small", onClick:  function(){ csend({view:'roomlist', mode:'deleteroom', roomid:value.id}) }}, "×")
                                                    )
                                                )
                                            )
                                        ), 
                                        React.createElement("div", {id:  'slider' + value.id, style: { display: 'none'}}, 
                                            (value.users) && (
                                            React.createElement("div", {style: {clear:'both', padding: '3px'}}, 
                                                value.users.map(function(val){
                                                    return (
                                                        React.createElement("div", {className: "small_user"}, val.user, React.createElement("a", {onClick:  function(){ csend({view:'roomlist', mode: 'deleteroomuser', roomid : value.id, username : val.user }) }, style: {cursor:'pointer'}}, "×"))
                                                    );
                                                })
                                            )
                                            ), 
                                            React.createElement("div", {style: {clear:'both', padding: '10px'}}, 
                                                React.createElement("input", {autofocus: true, id: 'username' + value.id, className: "button_sand", type: "text", style: {width:'80%', height:'28px'}}), " ", React.createElement("a", {className: "button_sand", onClick:  function(){ csend({view:'roomlist', mode: 'addroomuser', roomid : value.id, username : document.getElementById('username'+value.id).value }) }}, "Добавить")
                                            )
                                        )
                                    )
                                )
                            );
                        }, this), 
                        React.createElement("tr", null, 
                            React.createElement("td", {style: {backgroundColor:'#efefef', padding:'1em', border:'none', textAlign:'center'}}, 
                                React.createElement("input", {id: "roomname", type: "text", className: "button_sand", style: {width:'80%', height:'28px'}}), " ", React.createElement("a", {className: "button_sand", onClick:  function(e){ e.target.value = ''; csend({view:'roomlist', mode: 'addroom', roomname : document.getElementById('roomname').value }) }}, "Добавить")
                            )
                        )
                    )
                ), 
                React.createElement(ColorPicker, {id: this.state.id, closed: !this.state.showPicker})
            )
        );
    }
});


var ColorPicker = React.createClass({displayName: "ColorPicker",
    componentWillReceiveProps: function(nextProps){
        var offset, obj = document.querySelector('#color' + nextProps.id);
        if (obj){
            offset = obj.getBoundingClientRect();
        }
        this.setState({
            oldcolor: nextProps.oldcolor,
            closed: nextProps.closed,
            id: nextProps.id,
            x: (offset ? offset.left : 0) + 15 ,
            y: (offset ? offset.top : 0) + 15,
        });
    },
    getInitialState: function() {
        return { 
            oldcolor: '#fff',
            closed: true,
            id: 0,
            x: 0,
            y: 0,
        };
    },
    decToHex: function(color){
        var hex_char = "0123456789ABCDEF"; 
        color = parseInt(color); 
        return String(hex_char.charAt(Math.floor(color/16))) + String(hex_char.charAt(color - (Math.floor(color/16) * 16))); 
    },
    getOffsetSum: function(elem) {
        var top=0, left=0
        while(elem) {
            top = top + parseFloat(elem.offsetTop)
            left = left + parseFloat(elem.offsetLeft)
            elem = elem.offsetParent        
        }
        return {top: Math.round(top), left: Math.round(left)}
    },
    colorxy: function (x, y, hex) {
        var color = [255, 255, 255];
        if (x < 32) { color[1] = x * 8; color[2] = 0; } else if (x < 64) { color[0] = 256 - (x - 32 ) * 8; color[2] = 0; } else if (x < 96) { color[0] = 0; color[2] = (x - 64) * 8; } else if (x < 128) { color[0] = 0; color[1] = 256 - (x - 96) * 8; } else if (x < 160) { color[0] = (x - 128) * 8; color[1] = 0; } else { color[1] = 0; color[2] = 256 - (x - 160) * 8; }
        for (var n = 0; n < 3; n++) {
            if (y < 64) color[n] += (256 - color[n]) * (64 - y)/64;
            else if (y <= 128) color[n] -= color[n] * (y - 64)/64;
            else if (y > 128) color[n] = 256 - ( x/192 * 256 );
                color[n] = Math.round(Math.min(color[n], 255));
            if (hex == 'true') color[n] = this.decToHex(color[n]);
        }
        if (hex == 'true') return "#" + color.join('');
            return "rgb(" + color.join(', ') + ')';
    },
    onMouseout: function(e){
        this.setState({ closed: true });
    },
    onMousemove: function(e){
        var rightedge = this.getOffsetSum(e.target).left, bottomedge = this.getOffsetSum(e.target).top;
        document.querySelector('#color' + this.state.id).style.backgroundColor = this.colorxy(e.pageX-rightedge, e.pageY-bottomedge, 'true');
    },
    onClick: function(e){
        var rightedge = this.getOffsetSum(e.target).left, bottomedge = this.getOffsetSum(e.target).top;
        csend({ mode: 'roomcolor', roomid : this.props.id, roomcolor: this.colorxy(e.pageX-rightedge, e.pageY-bottomedge) });
    },
    render: function(){
        return (
            React.createElement("div", {className: "picker", style: { display: (this.state.closed ? 'none':'inline-block'), left: this.state.x, top: this.state.y}, onMouseOut: this.onMouseout, onClick: this.onClick})
        );
    }
});

var MainApp = React.createClass({displayName: "MainApp",
    getInitialState: function() {
        return { 
            newval: {
                user: '',
                menu: [{}],
                ia: false,
                month: 1,
                year: 1,
            },
        };
    },
    componentWillMount: function() {
        global.watch('json', function(sender, oldval, newval){
            //console.log(newval)
            this.setState({
                newval: newval
            })      
        }.bind(this));
    },
    render: function() {

        if (!this.state.newval) return;

        return (
            React.createElement("div", {id: "content", style: {minWidth:'1000px'}}, 
                React.createElement(PlannerHeader, {view: this.state.newval.view, isAdmin: this.state.newval.ia, user: this.state.newval.user, menu: this.state.newval.menu}), 
                (this.state.newval.view=='year') && (
                    React.createElement(DrawYear, {year: this.state.newval.year})
                ), 
                (this.state.newval.view=='month') && (
                    React.createElement(DrawMonth, {month: this.state.newval.month, year: this.state.newval.year, showyear: false})
                ), 
                (this.state.newval.view=='week') && (
                    React.createElement(DrawWeek, {day: this.state.newval.day, month: this.state.newval.month, year: this.state.newval.year, json: this.state.newval})
                ), 
                (this.state.newval.view=='userlist') && (
                    React.createElement(DrawUsers, {json: this.state.newval})
                ), 
                (this.state.newval.view=='roomlist') && (
                    React.createElement(DrawRoomList, {json: this.state.newval})
                )
            )
        );
    },
})


csend({});
React.render( React.createElement(MainApp, null),  document.getElementById('content') );