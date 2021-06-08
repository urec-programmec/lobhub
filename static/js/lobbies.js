var selected_class = 'selected-easy';
var tasks = [];


setTimeout(() => $('body').addClass('blur'), 200);

$('#profile-open').on("click", () => {
    if (! $('#profile').hasClass('profile-open')){
        $('#profile').addClass('profile-open');
    }
    else{
        $('#profile').removeClass('profile-open');
    }
}); 

$('.task').on("click", (e) => {
    if (!$('#' + e.target.id).hasClass('selected') && parseInt(max_cnt[index]) > tasks.length){
        tasks.push(e.target.id);
        $('#' + e.target.id).addClass('selected');
    }
    else if ($('#' + e.target.id).hasClass('selected')){
        tasks.splice(tasks.indexOf(e.target.id), 1);
        $('#' + e.target.id).removeClass('selected');
    }
    select();
}); 

$('#type').on("change", (e) => {
    // console.log(e.srcElement.selectedIndex);   
    if (e.srcElement.selectedIndex == 0)
        selected_class = 'selected-easy';
    else if (e.srcElement.selectedIndex == 1)
        selected_class = 'selected-normal';
    else
        selected_class = 'selected-hard';  
    
    index = e.srcElement.selectedIndex;
    if (tasks.length > max_cnt[index]){
        for (let i = max_cnt[index]; i < tasks.length; i++)
            $('#' + tasks[i]).removeClass('selected');

        tasks.splice(max_cnt[index]);
    }   
    
    select();    
}); 

function select(){
    if (tasks.length === max_cnt[index]){
        $('#submit').removeClass('disabled');
        $('#submit').prop('disabled', false);
    }   
    else{        
        $('#submit').addClass('disabled');
        $('#submit').prop('disabled', true);
    } 
    $('#tasks').val(tasks)
    $('.task').removeClass('selected-easy');
    $('.task').removeClass('selected-normal');
    $('.task').removeClass('selected-hard');
    let text = parseInt(max_cnt[index]) == tasks.length ? 'tasks (selected all)' : 'tasks (select ' + (parseInt(max_cnt[index]) - tasks.length).toString() + '):'
    $('#tasks-counter').text(text);
    $('.selected').addClass(selected_class);
}
