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

var PlannerHeader = React.createClass({
    send: function(view, arg1, arg2){
        return function() {
            csend(view, arg1, arg2);
        }
    },
    render: function() {
        return (
            <div className="header" style={{height:'70px'}}>
                <div style={{'float':'right'}}>
                    <span className="button_sand" onClick={this.send({view : 'week', acion:'logout'}, null, true)}>{this.props.user} - выход</span>
                    {(this.props.isAdmin && this.props.view != 'userlist') && (
                        <a className="button_sand" onClick={this.send({view:'userlist'})}>пользователи</a>
                    )}
                    {(this.props.view != 'week') && (
                        <a className="button_sand" onClick={this.send({view:'week'})}>неделя</a> 
                    )}
                    {(this.props.view != 'month') && (
                        <a className="button_sand" onClick={this.send({view:'month'})}>месяц</a> 
                    )}
                    {(this.props.view != 'year') && (
                        <a className="button_sand" onClick={this.send({view:'year'})}>год</a>
                    )}
                </div>
                {(this.props.view != 'roomlist' && this.props.view != 'userlist') && (
                <div style={{marginRight: '50%', whiteSpace: 'nowrap', lineHeight: '25px'}}>
                    <span style={{fontSize: '25px', paddingRight: '1em', display:'table-cell'}}>Бронирование&nbsp;переговорной&nbsp;</span>
                    <span style={{display:'table-cell', verticalAlign:'middle'}}><DrawRoomsMenu menu={this.props.menu} /></span>
                    {(this.props.isAdmin) && (
                        <span style={{display:'table-cell', verticalAlign:'middle'}}>
                            <a className="button_sand" onClick={this.send({view : 'roomlist'})}>изменить</a>
                        </span>
                    )}
                </div>
                )}
            </div>
		);
    }
});

var DrawMonth = React.createClass({
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
                    cols.push(<td className={colStyle}>{start_prev}, {weekdays[days-1]}</td>);
                }else{
                    cols.push(<td className={colStyle} onClick={this.send(ts)}>{start_prev}</td>);
                }
                start_prev++;
            }
        }
        
        var week = 1;
        for (var days = 1; days <= (days_in_this_month); days++) {
            var ts = strtotime(counter + '-' + this.props.month + '-' + this.props.year + ' 00:00');
            
            if (week_day > 5){
                if (week == 1 && !this.props.showyear) {
                    cols.push(<td className="back_gray mmo" onClick={this.send(ts)}>{weekdays[week_day-1]}, {counter}</td>);
                }else{
                    cols.push(<td className="back_gray mmo" onClick={this.send(ts)}>{counter}</td>);
                }
            } else if (week == 1 && !this.props.showyear) {
                cols.push(<td className="mmo" onClick={this.send(ts)}>{weekdays[week_day-1]}, {counter}</td>);
            } else {
                cols.push(<td className="mmo" onClick={this.send(ts)}>{counter}</td>);
            }   
            counter++;
            
            if (week_day==7) {
                week++;
            }

            week_day%=7;
            week_day++;

            if (week_day == 1){
                rows.push(<tr>{cols}</tr>);
                cols = [];
            }
        }

        counter = 1;
        if (cols.length < 7){
            for(i=cols.length; i<7; i++){
                var cName = (i >= 5) ? 'light_gray mmo back_gray':'light_gray mmo';
                var ts = strtotime(counter + '-' + (this.props.month+1) + '-' + this.props.year + ' 00:00');
                cols.push(<td className={cName} onClick={this.send(ts)}>{counter}</td>)
                counter++;
            }
        }

        if(rows.length < 5){
            rows.push(<tr>{cols}</tr>);
        }


        var monthTableClassName = (this.props.showyear ? 'border1px txtcontent':'border1px txtcontent monthtable');

        return (
            <div>
                <div>
                {(this.props.showyear) && (
                    <p style={{textAlign:'center'}}><b>{months[this.props.month-1]}</b></p>
                ) || (
                    <h1 style={{textAlign:'center'}}>{months[this.props.month-1]}, {this.props.year}</h1>
                )}
                </div>
                <table className={monthTableClassName} style={{ margin: '0 auto', width: this.props.showyear ? 'auto':'90%'}}>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
    }
});

var DrawWeek = React.createClass({
    componentDidMount: function() {
        window.addEventListener('keyup', function (e) {
            var intKey = (window.Event) ? e.which : e.keyCode;
            if(intKey == 27){
                this.setState({ 
                    showEditor: false,
                    showTooltip: false,
                });
            }
        }.bind(this));
    },
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            showEditor: false,
            showTooltip: false,
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
            showTooltip: false,
            data: {},
            tstart: '',
            tend: '',
            user: '',
            cellwidth: parseInt(window.getComputedStyle(document.getElementById('content'), null).getPropertyValue('width')) / 10,
        };
    },
    handleClick: function(e){
        var e = e || event;
        var target = e.target || e.srcElement;
        var curTarget = e.currentTarget;
        var timestamp = parseInt(target.getAttribute('data-abbr'));
        e.preventDefault();

        if(timestamp && (target != curTarget)){
            var marker = null;
            if(this.props.json.markers && Object.keys(this.props.json.markers).length > 0 && timestamp){
                marker = this.props.json.markers[timestamp];
            };

            var t_start = date('H:i', timestamp);
            var t_end = date('H:i', strtotime('+ 30 minutes', timestamp));

            var data = marker ? marker : { id : timestamp, tstart : t_start, tend : t_end };

            this.setState({
                data: data,
                tstart: data.tstart,
                tend: data.tend,
                showEditor: true,
            });
        }
        e.preventDefault();
        e.stopPropagation();
    },
    onTooltip: function(e){
        var e = e || event;
        var target = e.target || e.srcElement;
        var timestamp = parseInt(target.getAttribute('data-abbr'));

        if(timestamp){
            var marker = null;
            if(this.props.json.markers && Object.keys(this.props.json.markers).length > 0 && timestamp){
                marker = this.props.json.markers[timestamp];
            };

            if(marker){
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                this.setState({
                    data: marker,
                    showEditor: false,
                    showTooltip: true,
                    pos: { x: e.clientX + scrollLeft, y: e.clientY + scrollTop },
                });

            }
        }
        e.stopPropagation();
        e.preventDefault();
    },
    offTooltip: function(e){
        var e = e || event;
        var target = e.target || e.srcElement;
        var timestamp = parseInt(target.getAttribute('data-abbr'));

        if(timestamp){
            var marker = null;
            if(this.props.json.markers && Object.keys(this.props.json.markers).length > 0 && timestamp){
                marker = this.props.json.markers[timestamp];
            };

            if(marker){
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                this.setState({
                    data: marker,
                    showTooltip: false,
                    pos: { x: e.clientX + scrollLeft, y: e.clientY + scrollTop },
                });
            }
        }
        e.stopPropagation();
        e.preventDefault();
    },
    render : function(){
        var week_day = date("N", mktime(0, 0, 0, this.props.month, this.props.day, this.props.year));
        var rows = [];
        var cols = [];

        cols.push(<td className="num_offset">&nbsp;</td>)
        for (i=1; i<=7; i++){
            var daynow = Math.floor(date('j', strtotime((i-week_day)+' days', strtotime(this.props.day+'-'+this.props.month+'-'+this.props.year))));
            var thColor = ((i==date('N', time())) ? '#00ab22':'');
            cols.push(<th className='dates' style={{ 'color':thColor }}>{weekdays[i-1]} {daynow}</th>);
        }
        rows.push(<tr>{cols}</tr>);

        cols = [];
        for(j=7; j<=22.5; j+=.5){
            var tm = ((j-Math.floor(j)!=.5) ? j+':00':Math.floor(j)+':30');
            var timestamp = ((j-Math.floor(j)!=.5) ? (j)+':00':'');
            var colClass = ((j==date('N', time())) ? 'num_offset num_offset_today':'num_offset');
            cols = [];
            cols.push(<td className={colClass}>{(timestamp)&&(<div>{timestamp}</div>)}</td>);

            for (i=1; i<=7; i++){
                var monthnow = Math.floor(date('m', strtotime(((i>week_day) ? '+':'-') + Math.abs(week_day-i) + ' days', strtotime(this.props.day+'-'+this.props.month+'-'+this.props.year+' '+tm))))
                var daynow = Math.floor(date('j', strtotime(((i>week_day) ? '+':'-') + Math.abs(week_day-i) + ' days', strtotime(this.props.day+'-'+this.props.month+'-'+this.props.year+' '+tm))))
                
                var field_id = strtotime(this.props.year+'-'+monthnow+'-'+daynow+' '+tm);
                var tclass = ((j==date('H', time())) ? 'green_line':'') + ((i==date('N', time())) ? ' back_green':'') + ((j%1==0)? ' du':' dd');
                var marker = null;
                if(this.props.json.markers && Object.keys(this.props.json.markers).length > 0){
                    marker = this.props.json.markers[field_id];
                };

                cols.push(
                    <td data-abbr={field_id} className={tclass} style={{padding:0, margin:0}}>
                        {(marker && marker.id) && (
                            <span className="marker" data-abbr={marker.id} style={{height:marker.height-1, backgroundColor:this.props.json.color }} onMouseEnter={this.onTooltip} onMouseLeave={this.offTooltip}>{marker.user}</span>
                        )}
                    </td>
                );
            }
            rows.push(<tr>{cols}</tr>);
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
            <div>
                <table style={{margin:'0 auto'}} onClick={this.handleClick}>
                    <tbody>
                        <tr>
                            <td colSpan="2">
                                <h2 style={{textAlign:'center'}}>{months[this.props.json.month-1]}, {this.props.json.year}<br /><br /></h2>                            
                            </td>
                        </tr>
                        <tr>
                            <td style={{verticalAlign:'top', paddingRight: '40px', whiteSpace: 'nowrap'}}>
                                <span className="button_sand" onClick={function(){ csend({ view:'week', date: strtotime('-1 month', strtotime(curYear + '-' + curMonth + '-' + 1)) }) }}>&laquo;</span>
                                <select className="button_sand" onChange={function(e){ csend({ view:'week', date: strtotime(curYear + '-' + e.target.value + '-' + 1) }) }}>
                                {months.map(function(val, index){
                                    return (<option key={index} value={index+1} selected={months[curMonth-1] === val}>{val}</option>);
                                })}
                                </select>
                                <select className="button_sand" onChange={function(e){ csend({ view:'week', date: strtotime(e.target.value + '-' + curMonth + '-' + 1) }) }}>
                                {years.map(function(val, index){
                                    return (<option key={index} value={val} selected={curYear === val}>{val}</option>);
                                })}
                                </select>
                                <span className="button_sand" onClick={function(){ csend({ view:'week', date: strtotime('+1 month', strtotime(curYear + '-' + curMonth + '-' + 1)) }) }}>&raquo;</span>
                                <DrawMonth month={this.props.json.month} year={this.props.json.year} showyear={true} />
                                <br />
                                <hr />
                                <span className="button_sand" onClick={function(){ csend({ view:'week', date: strtotime('now') }) }}>Сегодня</span>
                            </td>
                            <td>
                                <table className="border1px parent_container" style={{margin: '0 auto'}}>
                                <tbody>{rows}</tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <TimeEdit json={this.props.json} data={this.state.data} closed={!this.state.showEditor} />
                <ToolTip text={this.state.data.data} closed={!this.state.showTooltip} pos={this.state.pos} />
            </div>
        );
    }

});

var DrawYear = React.createClass({
    render: function() {
        var counter = 1;
        var rows = [];
        for (i=1; i<=3; i++){
            var cols = [];
            for (j=1; j<=4; j++){
                cols.push(<td style={{verticalAlign: 'top'}}><DrawMonth month={counter} year={this.props.year} showyear={true} /></td>);
                counter++;
            }
            rows.push(<tr>{cols}</tr>);
        }

        return (
            <div style={{textAlign: 'center'}}>
                <h1>{this.props.year}</h1>
                <table cellPadding={10}  style={{margin: '0 auto'}}><tbody>{rows}</tbody></table>
            </div>
        );
    }
});

var DrawRoomsMenu = React.createClass({
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
            <div style={{ display: 'inline-block', cursor: 'pointer'}}>
                <div className="button_sand" style={{ cursor: 'pointer', display:'inline-block', backgroundColor: captionColor, color: '#000'}} onClick={function(){ document.getElementById('menuholder_container').style.display = 'block' }}>
                {captionText}
                </div>
                <div id="menuholder_container" style={{ cursor:'pointer', position:'absolute', zIndex:'999', display:'none'}}>
                    {this.props.menu.map(function(m, index){
                        return (
                            <div className="menu button_sand" key={index} data-abbr={m.id} style={{ backgroundColor: m.color, cursor : 'pointer', display : 'block', borderTop: 'none' }} onClick={function(){ document.getElementById('menuholder_container').style.display = 'none'; csend({ room : m.id }) }}>
                                {m.text}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
});

var DraggableElement = React.createClass({
    getInitialState: function() {
        return { 
            dragging: false,
            pos: {x: 0, y: 0},
            pickpos: {x: 0, y: 0},
        };
    },
    componentDidMount: function() {
        this.setState({
            pos: { x: document.documentElement.clientWidth / 3, y: document.documentElement.clientHeight / 4 }
        });

        document.getElementById(this.props.activepoint).addEventListener('mousedown', function(e){
            var e = e || event;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            this.setState({
                dragging: true,
                pickpos: { 
                    x: e.clientX + scrollLeft - (this.getDOMNode().getBoundingClientRect()).left, 
                    y: e.clientY + scrollTop - (this.getDOMNode().getBoundingClientRect()).top 
                },
            });
        }.bind(this))

        document.addEventListener('mouseup', function(e){
            this.setState({
                dragging: false,
            });
        }.bind(this))

        document.addEventListener('mousemove', function(e){
            var e = e || event;
            if (this.state.dragging){
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                var maxWidth = document.documentElement.clientWidth - this.getDOMNode().clientWidth;
                var maxHeight = document.documentElement.clientHeight - this.getDOMNode().clientHeight;

                var x = Math.min(Math.max(e.clientX + scrollLeft - this.state.pickpos.x, 0), maxWidth);
                var y = Math.min(Math.max(e.clientY + scrollTop - this.state.pickpos.y, 0), maxHeight);

                this.setState({
                    pos: { x: x, y: y},
                });
            }
        }.bind(this))
    },
    render: function() {
        return (
            <div style={{position:'absolute', top: this.state.pos.y, left: this.state.pos.x }}>
                {this.props.children}
            </div>
        );
    }
});

var ToolTip = React.createClass({
    componentWillReceiveProps: function(nextProps){
        this.setState({ 
            closed: nextProps.closed,
            pos: nextProps.pos || {x: 0, y: 0},
            text: nextProps.text,
        });
    },
    getInitialState: function() {
        return { 
            closed: true,
            pos: {x: 0, y: 0},
            text: '',
        };
    },
    render: function() {
        return (
            <div className="tooltip" style={{position:'absolute', top: this.state.pos.y - 45, left: this.state.pos.x + 10, opacity:(this.state.closed ?'0':'1') }}>
                {this.state.text}
            </div>
        );
    }
});

var TimeEdit = React.createClass({
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
    handleDelete: function(event){
        var ts = parseFloat(this.state.start_time_value);
        var te = parseFloat(this.state.end_time_value);

        var tstxt = (ts%1 > 0) ? ts.toString().replace('.5', ':30') : ts.toString() + ':00';
        var tetxt = (te%1 > 0) ? te.toString().replace('.5', ':30') : te.toString() + ':00';
        csend({ view : 'week', storage : 1, id : this.state.data.id, data : '', tstart : tstxt, tend : tetxt, addmonths : 0 });
        this.setState({ closed: true });
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
            <div className="transition_all" style={{position:'absolute', top:0, left:0, bottom:0, right:0, backgroundColor : 'rgba(0,0,0,.5)', alignItems:'center', visibility: (this.state.closed ? 'hidden':'visible'), opacity: (this.state.closed ? '0':'1'), minHeight:'100%' }}>
                <DraggableElement activepoint="msgboxform_header">
                    <div id="msgboxform" style={{ backgroundColor: '#eee', boxShadow:'0 0 16px rgba(0,0,0,.5)', margin: '0px auto', width: '800px' }}>
                        <div id="msgboxform_header" className="header" style={{'padding':'0'}}>
                            <div style={{float: 'left', fontWeight: 'bold', padding: '5px 10px'}}>Добавление события</div>
                            <div onClick={this.handleClose} className="button_sand" style={{ float: 'right' }}>&times;</div>
                            <div style={{ clear: 'both'}}></div>
                        </div>
                        <div style={{padding: '10px'}}>
                            <table style={{width: '100%'}} className="txtcontent">
                                <tbody>
                                    <tr>
                                        <td colSpan="2">
                                            <label htmlFor="msgboxval">Заметка</label>
                                            <textarea id="msgboxval" style={{width: '100%', height: '100px', resize: 'none', padding: '0', margin: '0', font: '1em arial'}} onChange={this.handleText} value={this.state.text}></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{width: '300px'}}>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td><label htmlFor="start_range_time">Начало&nbsp;</label></td>
                                                        <td><input style={{ border: 'none', outline: 'none' }} type="range" id="start_range_time" min="7" max={22} step =".5" value={this.state.start_time_value} onChange={this.handleStartTimeChange} />&nbsp;{tstxt}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><label htmlFor="end_range_time">Конец&nbsp;</label></td>
                                                        <td><input style={{ border: 'none', outline: 'none' }} type="range" id="end_range_time" min="7" max={22.5} step =".5" value={this.state.end_time_value} onChange={this.handleEndTimeChange} />&nbsp;{tetxt}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td>
                                            <input type="hidden" id="uservalue" />
                                            <input type="hidden" id="idvalue" />
                                            <input type="checkbox" id="checkmonths" onChange={this.handleChecked} checked={this.state.month_checked} />
                                            <label htmlFor="checkmonths">&nbsp;повторяющиеся события</label>
                                            {(this.state.month_checked == 'checked') && (
                                                <label htmlFor="months">&nbsp;&nbsp;<input name="months" id="months" min="0" max="12" value={this.state.months_value}  onChange={this.handleMonthsChange} type="range" />&nbsp;{this.state.months_value}&nbsp;месяцев</label>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{textAlign: 'center'}}><span id="skull"></span></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={{float:'right'}}>
                                <button className="button_sand" onClick={this.handleDelete}>Удалить</button> <button className="button_sand" onClick={this.handleClose}>Отмена</button> <button className="button_sand" onClick={this.handleSave} autoFocus >Сохранить</button>
                            </div>
                            <div style={{clear:'both'}}></div>
                        </div>
                    </div>
                </DraggableElement>
            </div>
        );
    }
});

var DrawUsers = React.createClass({
    componentWillReceiveProps: function(nextProps){
        document.getElementById('username').focus();
    },
    componentDidMount: function() {
        document.getElementById('username').focus();
    },
    render: function(){

        return (
            <div>
                <h1 style={{textAlign:'center'}}>Список пользователей</h1>
                <br />
                <table className="border1px nobordered txtcontent" style={{margin:'0 auto;'}}>
                    <thead>
                        {this.props.json.users.map(function(value){
                            return (
                            <tr>
                                <td>{value.name}</td>
                                <td nowrap>
                                    <select className="button_sand" id="msel{value.id}" defaultValue={value.access} onChange={function(e){csend({view:'userlist', mode:'setaccess', userid: value.id, accessval: e.target.value}) }} style={{width:'100%'}}>
                                        <option value='0'></option>
                                        <option value='1'>Администратор</option>
                                    </select>
                                </td>
                                <td style={{width:'1px'}}>
                                    <a className='button_sand small' onClick={function(){ csend({view:'userlist', mode:'deleteuser', userid:value.id}) }}>&times;</a>
                                </td>
                            </tr>
                            );
                        })}
                        <tr>
                            <td colSpan='3' style={{border:'none', textAlign:'center'}}>
                                <a className='button_sand' style={{float:'right', width:'30%'}} onClick={function(){csend({view:'userlist', mode:'adduser', username: document.getElementById('username').value}); document.getElementById('username').value = ''; document.getElementById('username').focus() }}>Добавить</a>
                                <div style={{marginRight:'31%'}}><input className="button_sand" id='username' type='text' style={{width:'100%', height:'29px'}} /></div>
                            </td>
                        </tr>
                    </thead>
                </table>
            </div>
        );
    }
});

var DrawRoomList = React.createClass({
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
            <div>
                <h2 style={{textAlign:'center'}}>Список переговорных</h2>
                <table className="border1px txtcontent" style={{ margin:'20px auto 0px auto', width:'800px'}}>
                    <tbody>
                        {this.props.json.menu.map(function(value, i){
                            return (
                                <tr key={i} style={{backgroundColor:value.color}}>
                                    <td>
                                        <table className="nobordered" style={{width:'100%', borderCollapsed: 'collapsed', borderSpacing: '0px'}}>
                                            <tbody>
                                                <tr>
                                                    <td style={{width:'40px', borderRight:'none'}}>
                                                        <a className="button_sand small" onClick={ this.slideClick.bind(this, value) }>&mdash;</a>
                                                    </td>
                                                    <td style={{borderLeft:'none'}}>
                                                        <input type="text" id={'trans'+i} data-id={value.id} className="trans" defaultValue={value.text} readOnly onKeyUp={this.onChange} onBlur={this.onChange} />
                                                    </td>
                                                    <td style={{width:'40px'}}>
                                                        <a className="button_sand small" onClick={ function(e){ document.querySelector('#trans' + i).removeAttribute('readonly'); document.querySelector('#trans' + i).style.fontWeight = 'bold'; document.querySelector('#trans' + i).focus() } }>&hellip;</a>
                                                    </td>
                                                    <td style={{width:'40px' }}>
                                                        <div className="colorpicker" id={'color'+value.id} style={{backgroundColor:value.color, height:'20px', width:'20px'}} onClick={function(){ this.setState({ showPicker: true, id: value.id }) }.bind(this)}></div>
                                                    </td>
                                                    <td style={{width:'40px'}}>
                                                        <a className="button_sand small" onClick={ function(){ csend({view:'roomlist', mode:'deleteroom', roomid:value.id}) } }>&times;</a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div id={ 'slider' + value.id } style={{ display: 'none'}}>
                                            {(value.users) && (
                                            <div style={{clear:'both', padding: '3px'}}>
                                                {value.users.map(function(val){
                                                    return (
                                                        <div className="small_user">{val.user}<a onClick={ function(){ csend({view:'roomlist', mode: 'deleteroomuser', roomid : value.id, username : val.user }) } } style={{cursor:'pointer'}}>&times;</a></div>
                                                    );
                                                })}
                                            </div>
                                            )}
                                            <div style={{clear:'both', padding: '10px'}}>
                                                <input autofocus id={'username' + value.id} className="button_sand" type="text" style={{width:'80%', height:'28px'}} />&nbsp;<a className="button_sand" onClick={ function(){ csend({view:'roomlist', mode: 'addroomuser', roomid : value.id, username : document.getElementById('username'+value.id).value }) }}>Добавить</a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }, this)}
                        <tr>
                            <td style={{backgroundColor:'#efefef', padding:'1em', border:'none', textAlign:'center'}}>
                                <input id="roomname" type="text" className="button_sand" style={{width:'80%', height:'28px' }} />&nbsp;<a className="button_sand" onClick={ function(e){ e.target.value = ''; csend({view:'roomlist', mode: 'addroom', roomname : document.getElementById('roomname').value }) }}>Добавить</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <ColorPicker id={this.state.id} closed={!this.state.showPicker} />
            </div>
        );
    }
});


var ColorPicker = React.createClass({
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
            <div className="picker" style={{ display: (this.state.closed ? 'none':'inline-block'), left: this.state.x, top: this.state.y }} onMouseOut={this.onMouseout} onClick={this.onClick}></div>
        );
    }
});

var MainApp = React.createClass({
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
            //console.log(JSON.stringify(newval))
            this.setState({
                newval: newval
            })      
        }.bind(this));
    },
    render: function() {

        if (!this.state.newval) return;

        return (
            <div id="content" style={{minWidth:'1000px'}}>
                <PlannerHeader view={this.state.newval.view} isAdmin={this.state.newval.ia} user={this.state.newval.user} menu={this.state.newval.menu} />
                {(this.state.newval.view=='year') && (
                    <DrawYear year={this.state.newval.year} />
                )}
                {(this.state.newval.view=='month') && (
                    <DrawMonth month={this.state.newval.month} year={this.state.newval.year} showyear={false} />
                )}
                {(this.state.newval.view=='week') && (
                    <DrawWeek day={this.state.newval.day} month={this.state.newval.month} year={this.state.newval.year} json={this.state.newval} />
                )}     
                {(this.state.newval.view=='userlist') && (
                    <DrawUsers json={this.state.newval} />
                )}     
                {(this.state.newval.view=='roomlist') && (
                    <DrawRoomList json={this.state.newval} />
                )}
            </div>
        );
    },
})


csend({});
React.render( <MainApp />,  document.getElementById('content') );