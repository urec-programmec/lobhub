$( document ).ready(function() {
    
    document.onkeydown = check;

    // console.log(tasks);

    socket.on('connect', function() {
        socket.emit('start', {'key': key});        
    });

    socket.on('message', function(data) {
        // console.log('data')
        // console.log(data)
        // console.log(users)
        // console.log('---')

        if (data.data){
            console.log(data);
            tasks = data.data;
            init_resources();
            return;
        }

        if (Object.keys(users).length - 1 > Object.keys(data).length){
            names = []
            for (let i in data)
                names.push(data[i].name)

            for (let i in users){
                if (names.indexOf(users[i].name) == -1 && users[i].name != 'hero2'){
                    // console.log('delete');
                    $("#" + users[i].name).remove();
                    $("#" + users[i].name + "-x").remove();
                    $("#" + users[i].name + "-t1").remove();
                    $("#" + users[i].name + "-t2").remove();
                    $('#' + users[i].name + '-profile-color').remove();
                    delete users[i];
                    // console.log(users)
                }
            }
        }
        else if (Object.keys(users).length - 1 < Object.keys(data).length){
            // console.log('add');
            let yet = true;
            for (let i in data){
                if (Object.keys(users).indexOf(data[i].name) == -1 && yet){
                    yet = false;
                    // console.log('new');
                    // console.log(data[i].name);
                    $("#loading").removeClass("loading-end");
                    $("#loading").removeClass("loading-end-end");
                    $(".delete").remove();
                    $('#loading-text').text("new player coming");                                     
                    map[hero.y][hero.x] = hero.room;
                    users = {};
                    let name = data[i].name;
                    me.X = data.find(u => u.name === me.name).X;
                    me.Y = data.find(u => u.name === me.name).Y;

                    let cnt = 0;
                    let tt1 = setInterval(() => {
                        // console.log('first ' + data[i].name);
                        if (cnt == hero.x){                    
                            cnt = 0;
                            // init_access = true;
                            clearInterval(tt1);
                            delete tt1;
                            let tt2 = setInterval(() => {
                                if (cnt > hero.y){
                                    clearInterval(tt2);
                                    delete tt2;
                                    return;
                                }
                                if (cnt == hero.y){         
                                    // console.log(Y);
                                    clearInterval(tt2);
                                    delete tt2;
                                    for (let ii in data)
                                        users = Object.assign({
                                            [data[ii].name]: {
                                                name: data[ii].name,
                                                X: data[ii].X,
                                                Y: data[ii].Y,
                                                color: data[ii].color
                                            }
                                        }, users);        
                                        // return;     
                                    $('#profile-container').append(`<div><span id="` + data[i].name + `-profile-color" class="h3" style="color:` + data[i].color + `;">&nbsp;` + data[i].name + `&nbsp;</span></div>`)                                    
                                    return full_init();                                                 
                                }                          
                                else {                                
                                    cnt ++;                             
                                    move_up('#hero', 1, true, true);                                
                                }
                            },0)
                        }  
                        else {                       
                            cnt ++;                    
                            move_left('#hero', 1, true, true);                                                                           
                        }            
                    },0);               
                } 
            }
        }
        else {
            for (let i in data){
                if (data[i].name != me.name){
                    if (data[i].X > users[data[i].name].X)
                        move_right('#' + data[i].name, data[i].X - users[data[i].name].X, true, true, true)
                    else if (data[i].X < users[data[i].name].X)
                        move_left('#' + data[i].name, users[data[i].name].X - data[i].X , true, true, true)
                    else if (data[i].Y > users[data[i].name].Y)
                        move_down('#' + data[i].name,  data[i].Y - users[data[i].name].Y, true, true, true)
                    else if (data[i].Y < users[data[i].name].Y)
                        move_up('#' + data[i].name, users[data[i].name].Y - data[i].Y, true, true, true)
                }
                else {
                    me.X = data[i].X;
                    me.Y = data[i].Y;
                }
                users[data[i].name].X = data[i].X;
                users[data[i].name].Y = data[i].Y;   
                $('#' + data[i].name + '-profile-color').css('color', data[i].color);            
                $('#' + data[i].name + '-t1').css('color', data[i].color);            
            }
        }
    });

    //#region INITIAL

    var hero = {
        x: 0,
        y: 0,
        room: -1
    }    
    var load_task = null;
    var can_write = false;
    var init_access = true;

    for (let i in tasks){
        $('body').append(template_task(tasks[i]));
    }

    init_resources();

    full_init();

    //#endregion

    function full_init(){
        
        hero = {
            x: 0,
            y: 0,
            room: -1
        }    
        
        can_write = false;
        init_access = true;

        hero.room = map[hero.y][hero.x];
        map[hero.y][hero.x] = 'x';
        
        move_left('#hero', 5, true, true);
        move_up('#hero', 5, true, true);

        for (let i in users){
            if (users[i].name != me.name && users[i].name != 'hero2'){
                $('#heros').append(template(users[i]));
                move_left('#' + users[i].name, 5, true, true)
                move_up('#' + users[i].name, 5, true, true)        
            }
        }       
        // return;
        users['hero2'] = {
            name:'hero2',
            X: 108,
            Y: 48,
            color: '#ef8b76'
        }
    
        move_left('#hero2', 5, true, true);
        move_up('#hero2', 5, true, true);
    
        // console.log('go go go')
        // console.log(hero)
        // console.log(users)
        // console.log(me)
        // console.log('go go go')

        init(Object.keys(users)[0]);
    }

    
    function init(selector, notyet=false){
        // if(selector != 'hirovo')
        //     return;

        let next = Object.keys(users).indexOf(selector) != Object.keys(users).length - 1 ? Object.keys(users)[Object.keys(users).indexOf(selector) + 1] : null;
        let counter = 0;
        let back = false;
        let X = 0;
        let Y = 0;

        if (selector == me.name){
            selector = '#hero';
            X = me.X;
            Y = me.Y;
        }
        else if (notyet) {
            selector = '#' + selector;
            X = 107;
            Y = 47;
            back = true;
        }
        else {
            X = users[selector].X;
            Y = users[selector].Y;
            selector = '#' + selector;
        }

        if (selector == '#hero' && !notyet){
            if (next != null)
                return init(next)
            else 
                return init('hero2', true)
        }
            
        // console.log(selector)

        let t1 = setInterval(() => {
            if (counter == X){
                // console.log(X);
                counter = 0;
                clearInterval(t1);
                let t2 = setInterval(() => {
                    if (counter == Y){         
                        // console.log(Y);
                        clearInterval(t2);
                        // console.log(next);
                        if (next != null || notyet){                            
                            if (notyet){
                                if (selector == '#hero'){
                                    // console.log('ok');
                                    can_write = true;     
                                    $("#loading").addClass("loading-end-end");
                                    setTimeout(() => {
                                        $("#loading").addClass("loading-end");
                                    }, 1000);
                                    return;    
                                }
                                else{
                                    init_access = false;     
                                    return init(me.name, true)                                    
                                }
                            }                                      
                            if (selector != '#hero')
                                init(next);
                        }
                        else if (next == null){
                            // console.log('last');
                            init('hero2', true)
                        }
                    }                          
                    else {
                        // console.log('2 ' + counter)
                        counter ++;
                        if (back)
                            move_up(selector, 1, true, selector != '#hero');
                        else {
                            // console.log('down');
                            move_down(selector, 1, true, selector != '#hero');
                        }
                    }
                },0)
            }  
            else {
                // console.log('1 ' + counter)
                counter ++;
                if (back)
                    move_left(selector, 1, true, selector != '#hero');                                    
                else {
                    // console.log('right');
                    move_right(selector, 1, true, selector != '#hero');                
                }
            }            
        },0);
    }

    function check(e){
        // console.log(map);

        if (e.keyCode == '37'){
            move_left('#hero', 1);
            // console.log('X Y');
            // console.log(hero.x + " " + hero.y);
            // console.log(' ');
        }

        if (e.keyCode == '38'){
            move_up('#hero', 1);
            // console.log('X Y');
            // console.log(hero.x + " " + hero.y);
            // console.log(' ');
        }

        if (e.keyCode == '39'){
            move_right('#hero', 1);
            // console.log('X Y');
            // console.log(hero.x + " " + hero.y);
            // console.log(' ');
        }

        if (e.keyCode == '40'){
            move_down('#hero', 1);
            // console.log('X Y');
            // console.log(hero.x + " " + hero.y);
            // console.log(' ');
        }
    }

    function move_left(selector, count, ignored_rules=false, up_off_map=false, notme=false){
        // console.log(selector);
        // console.log(init_access);
        if (hero.x > 0 && map[hero.y][hero.x - 1] != -1 || ignored_rules  || notme){
            for (let i = 0; i < count; i++){
                if (((hero.x > 0 && map[hero.y][hero.x - 1] != -1 || ignored_rules) && ($(selector).position().left > -130 || parseInt($(selector).css('backgroundPosition').split(" ")[0]) < 130))  || notme){
                    if ($(selector).position().left > -130  || notme){
                        $(selector).css({"left": "calc(" + $(selector).position().left + "px - 32px)"});
                        $(selector + '-x').css({"left": "calc(" + $(selector + '-x').position().left + "px - 32px)"});
                        $(selector + '-t1').css({"left": "calc(" + $(selector + '-t1').position().left + "px - 32px)"});
                        $(selector + '-t2').css({"left": "calc(" + $(selector + '-t2').position().left + "px - 32px)"});
                    }
                    else if ((selector == '#hero' || init_access) && !notme){
                        for (let ii in users){
                            n = init_access ?  selector : '#' + me.name;
                            if ('#' + users[ii].name != n){
                                who = users[ii].name == me.name ? '#hero' : "#" + users[ii].name;
                                // console.log($(who))
                                $(who).css({"left": "calc(" + $(who).position().left + "px + 32px)"});                
                                $(who + "-x").css({"left": "calc(" + $(who + "-x").position().left + "px + 32px)"});                
                                $(who + "-t1").css({"left": "calc(" + $(who + "-t1").position().left + "px + 32px)"});                
                                $(who + "-t2").css({"left": "calc(" + $(who + "-t2").position().left + "px + 32px)"});           
                            }
                        }
                    }
                    $(selector).css({"background-position-x": "calc(" + $(selector).css('backgroundPosition').split(" ")[0] + " + 32px)"});
                    
                    if(!up_off_map){
                        map[hero.y][hero.x] = hero.room;
                        hero.x--;
                        hero.room = map[hero.y][hero.x];
                        map[hero.y][hero.x] = 'x';
                        find();
                        savestate();
                    }
                }
            }
            $(selector + '-x').addClass('left');
            $(selector + '-x').removeClass('right');
            $(selector + '-x').removeClass('up');
            $(selector + '-x').removeClass('down');
        }
    }
    
    function move_right(selector, count, ignored_rules=false, up_off_map=false, notme=false){
        

        if (hero.x < 107 && map[hero.y][hero.x + 1] != -1 || ignored_rules  || notme){
            for (let i = 0; i < count; i++){
                if (((hero.x < 108 && map[hero.y][hero.x + 1] != -1 || ignored_rules) && -1 * parseInt($(selector).css('backgroundPosition').split(" ")[0]) + 200 <= 3456)  || notme){
                    if ($(document).width() - $(selector).position().left - 200 >= 32  || notme){
                        $(selector).css({"left": "calc(" + $(selector).position().left + "px + 32px)"});                
                        $(selector + "-x").css({"left": "calc(" + $(selector + "-x").position().left + "px + 32px)"});                
                        $(selector + "-t1").css({"left": "calc(" + $(selector + "-t1").position().left + "px + 32px)"});                
                        $(selector + "-t2").css({"left": "calc(" + $(selector + "-t2").position().left + "px + 32px)"});                
                    }
                    else if ((selector == '#hero' || init_access) && !notme){
                        for (let ii in users){
                            n = init_access ?  selector : '#' + me.name;
                            if ('#' + users[ii].name != n){
                                who = users[ii].name == me.name ? '#hero' : "#" + users[ii].name;
                                $(who).css({"left": "calc(" + $(who).position().left + "px - 32px)"});
                                $(who + '-x').css({"left": "calc(" + $(who + '-x').position().left + "px - 32px)"});
                                $(who + '-t1').css({"left": "calc(" + $(who + '-t1').position().left + "px - 32px)"});
                                $(who + '-t2').css({"left": "calc(" + $(who + '-t2').position().left + "px - 32px)"});   
                            }
                        }
                    }
                    $(selector).css({"background-position-x": "calc(" + $(selector).css('backgroundPosition').split(" ")[0] + " - 32px)"});
                   
                    if(!up_off_map){                    
                        map[hero.y][hero.x] = hero.room;
                        hero.x++;
                        hero.room = map[hero.y][hero.x];
                        map[hero.y][hero.x] = 'x';
                        find();
                        savestate();
                    }
                }
            }

            $(selector + '-x').addClass('right');
            $(selector + '-x').removeClass('left');
            $(selector + '-x').removeClass('up');
            $(selector + '-x').removeClass('down');
        }
    }
    
    function move_up(selector, count, ignored_rules=false, up_off_map=false, notme=false){
        

        if (hero.y > 0 && map[hero.y - 1][hero.x] != -1 || ignored_rules || notme){
            for (let i = 0; i < count; i++){
                if (((hero.y > 0 && map[hero.y - 1][hero.x] != -1 || ignored_rules) && ($(selector).position().top > -150 || parseInt($(selector).css('backgroundPosition').split(" ")[1]) < 150)  || notme)){
                    if ($(selector).position().top > -150  || notme){
                        $(selector).css({"top": "calc(" + $(selector).position().top + "px - 32px)" });
                        $(selector + '-x').css({"top": "calc(" + $(selector + '-x').position().top + "px - 32px)"});
                        $(selector + '-t1').css({"top": "calc(" + $(selector + '-t1').position().top + "px - 32px)"});
                        $(selector + '-t2').css({"top": "calc(" + $(selector + '-t2').position().top + "px - 32px)"});
                    }
                    else if ((selector == '#hero' || init_access) && !notme){
                        for (let ii in users){
                            n = init_access ?  selector : '#' + me.name;
                            if ('#' + users[ii].name != n){
                                who = users[ii].name == me.name ? '#hero' : "#" + users[ii].name;
                                $(who).css({"top": "calc(" + $(who).position().top + "px + 32px)"});
                                $(who + '-x').css({"top": "calc(" + $(who + '-x').position().top + "px + 32px)"});
                                $(who + '-t1').css({"top": "calc(" + $(who + '-t1').position().top + "px + 32px)"});
                                $(who + '-t2').css({"top": "calc(" + $(who + '-t2').position().top + "px + 32px)"});
                            }
                        }
                    }
                    $(selector).css({"background-position-y": "calc(" + $(selector).css('backgroundPosition').split(" ")[1] + " + 32px)"});
                    
                    if(!up_off_map){                
                        map[hero.y][hero.x] = hero.room;
                        hero.y--;
                        hero.room = map[hero.y][hero.x];
                        map[hero.y][hero.x] = 'x';
                        find();
                        savestate();
                    }
                }
            }
            $(selector + '-x').addClass('up');
            $(selector + '-x').removeClass('right');
            $(selector + '-x').removeClass('left');
            $(selector + '-x').removeClass('down');
        }
    }
    
    function move_down(selector,count, ignored_rules=false, up_off_map=false, notme=false){

        if (hero.y < 47 && map[hero.y + 1][hero.x] != -1 || ignored_rules || notme){
            for (let i = 0; i < count; i++){
                if (((hero.y < 48 && map[hero.y + 1][hero.x] != -1 || ignored_rules) && -1 * parseInt($(selector).css('backgroundPosition').split(" ")[1]) + 200 <= 1536) || notme){           
                    if ($(document).height() - $(selector).position().top - 200 >= 32 || notme){
                        $(selector).css({"top": "calc(" + $(selector).position().top + "px + 32px)"});
                        $(selector + '-x').css({"top": "calc(" + $(selector + '-x').position().top + "px + 32px)"});
                        $(selector + '-t1').css({"top": "calc(" + $(selector + '-t1').position().top + "px + 32px)"});
                        $(selector + '-t2').css({"top": "calc(" + $(selector + '-t2').position().top + "px + 32px)"});
                    }
                    else if ((selector == '#hero' || init_access) && !notme){
                        for (let ii in users){
                            n = init_access ?  selector : '#' + me.name;
                            if ('#' + users[ii].name != n){
                                who = users[ii].name == me.name ? '#hero' : "#" + users[ii].name;
                                $(who).css({"top": "calc(" + $(who).position().top + "px - 32px)"});
                                $(who + '-x').css({"top": "calc(" + $(who + '-x').position().top + "px - 32px)"});
                                $(who + '-t1').css({"top": "calc(" + $(who + '-t1').position().top + "px - 32px)"});
                                $(who + '-t2').css({"top": "calc(" + $(who + '-t2').position().top + "px - 32px)"});
                            }
                        }
                    }
                    $(selector).css({"background-position-y": "calc(" + $(selector).css('backgroundPosition').split(" ")[1] + " - 32px)"});
                    
                    if(!up_off_map){                
                        map[hero.y][hero.x] = hero.room;
                        hero.y++;
                        hero.room = map[hero.y][hero.x];
                        map[hero.y][hero.x] = 'x';
                        find();                
                        savestate();
                    }
                }
            }
            $(selector + '-x').addClass('down');
            $(selector + '-x').removeClass('right');
            $(selector + '-x').removeClass('up');
            $(selector + '-x').removeClass('left');
        }
    }

    function savestate() {
        if (!can_write)
            return;
            
        socket.emit('go', {'key': key, 'X':hero.x, 'Y': hero.y});       
    }

    function template(user){
        text_color = (hex_rgb(user.color).r * 0.299 + hex_rgb(user.color).g * 0.587 + hex_rgb(user.color).b * 0.114) > 150 ?'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        
        return  `
            <div id="` + user.name + `" class="delete map text-light" style="background-image: url('/static/source/maps/map` + key + `.jpg')">
                <div class="text h2" style="color: ` + user.color + `;"><span style="background: ` + text_color + `;">&nbsp;` + user.name + `&nbsp;</span></div>           
            </div>
            <div id="` + user.name + `-t1" class="delete map text-x h2" style="color: ` + user.color + `;"><span style="background: ` + text_color + `;">&nbsp;` + user.name + `&nbsp;</span></div>
            <div id="` + user.name + `-t2" class="delete map text-x h4"></div>
            <div id="` + user.name + "-x" + `" class="delete map text-light left" style="z-index: 2"></div>`
    }

    function template_task(task){
        text_color = (hex_rgb(me.color).r * 0.299 + hex_rgb(me.color).g * 0.587 + hex_rgb(me.color).b * 0.114) > 150 ?'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)'
        
        return `
        <div id="task` + task[0] + `" class="task" style="background: rgba(` + hex_rgb(me.color).r + `, ` + hex_rgb(me.color).g + `, ` + hex_rgb(me.color).b + `, 0.5) !important;">
            <hr>
            <h2 style="color: ` + text_color + `">#get ` + task[4] + `</h2>
            <img style="width:fit-content; height:fit-content; border-radius: 15px;" src="/static/source/lobbie-tasks/task` + task[0] + `.jpg"></img>
            <hr>
            <h2 style="color: ` + text_color + `">#answer</h2>
            <input type="text" id="task-i-` + task[0] + `" class="text-send form-control" style="width: 50% !important; padding-left:20px; padding-right:20px; margin-left:20px; margin-right:20px;">
            <hr>
            <button id="task-b-` + task[0] + `" class="h send xfone menu btn" style="width: 50% !important; padding-left:20px; padding-right:20px; margin-left:20px; margin-right:20px;">get ` + task[4] + `</button>
            <hr>
        </div>
        `
    }

    function hex_rgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
        });
      
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }
    
    function find(){
        if (!can_write)
            return;
        // console.log(tasks);
        // console.log(hero.room == -10 ? tasks.find(t => (t[1] == hero.x && t[2] == hero.y)) : '');
        // console.log(hero.x);
        // console.log(hero.y);
        if (hero.room == -10 && can_write && tasks.find(t => (t[1] == hero.x && t[2] == hero.y)) 
            && tasks.find(t => (t[1] == hero.x && t[2] == hero.y))[3] != 'OK') {
            for (let i in tasks){
                if (tasks[i][1] == hero.x && tasks[i][2] == hero.y){
                    // $('#task' + tasks[i][0]).addClass('zz-100');
                    socket.emit('task', {'key': key, 'task': tasks[i][0], 'resolver': me.name, 'status': 'IN PROGRESS'});        
                    $('#task' + tasks[i][0]).addClass('task-z-open');
                    clearTimeout(load_task);
                    load_task = setTimeout(() => {
                        $('#task' + tasks[i][0]).addClass('task-t-open');                        
                        $('#task' + tasks[i][0]).addClass('task-open');
                    }, 1);
                }
            }
        }
        else if (hero.room != -10){
            $('.task').removeClass('task-open');
            clearTimeout(load_task);
            load_task = setTimeout(() => {
                $('.task').removeClass('task-z-open');
                $('.task').removeClass('task-t-open');
            }, 1000);
        }                    
    }

    function init_resources(){
        if (tasks.filter(t => t[3] == 'OK' && t[4] == 'sand'))
            $('#sand').text(tasks.filter(t => t[3] == 'OK' && t[4] == 'sand').length);
        else 
            $('#sand').text(0);

        if (tasks.filter(t => t[3] == 'OK' && t[4] == 'wick'))
            $('#wick').text(tasks.filter(t => t[3] == 'OK' && t[4] == 'wick').length);
        else 
            $('#sand').text(0);

        if (tasks.filter(t => t[3] == 'OK' && t[4] == 'powred'))
            $('#powred').text(tasks.filter(t => t[3] == 'OK' && t[4] == 'powred').length);
        else 
            $('#powred').text(0);
    }

    $('#profile-open').on("click", () => {
        if (! $('#profile').hasClass('profile-open')){
            $('#profile').addClass('profile-open');
        }
        else{
            $('#profile').removeClass('profile-open');
        }
    }); 

    $('.send').on("click", (e) => {
        // console.log(e.srcElement.id.substr(7));
        // console.log($('#task-i-' + e.originalEvent.srcElement.id.substr(7)));
        let id =  e.originalEvent.srcElement.id.substr(7);
        let val = $('#task-i-' + id).val() === undefined ? '' : $('#task-i-' + id).val()
        // console.log(val);
        // console.log(tasks.find(t => t[0] == id)[3]);
        $('#task-i-' + id).removeClass('correct');
        $('#task-i-' + id).removeClass('incorrect');
        $('#task-b-' + id).removeClass('correct');
        $('#task-b-' + id).removeClass('incorrect');
        if (val === tasks.find(t => t[0] == id)[3].toString()){
            $('#task-i-' + id).addClass('correct');
            $('#task-b-' + id).addClass('correct');
            // console.log(tasks.find(t => t[0] == id));
            tasks.find(t => t[0] == id)[3] = 'OK';
            init_resources();           
            socket.emit('task', {'key': key, 'task': id, 'resolver': me.name, 'status': 'OK'});        
        }
        else {
            $('#task-i-' + id).addClass('incorrect');
            $('#task-b-' + id).addClass('incorrect');
        }
    }); 
});

