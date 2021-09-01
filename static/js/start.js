$('#0_letter').focus();



for(let i = 0; i < count_letters; i++){
    var inputs = $("#" + i + "_letter").keyup(function(e){ 
        

        e.preventDefault();
        let val = $("#" + i + "_letter").attr("value");
        let number = $("#" + i + "_letter").attr("id").split('_')[0];
        if (i == count_letters - 1 && val.length == 1){
            let value = '';
            for(let i = 0; i < count_letters; i++){
                value += $("#" + i + "_letter").attr("value");
            }
            
            if (value !== password){
                $('#start-incorrect').css('z-index', 1000);
                $('#start-incorrect').css('opacity', 1);
                setTimeout(() => {
                    $('#start-incorrect').css('opacity', 0);
                    setTimeout(() => {$('#start-incorrect').css('z-index', -1000)}, 2000);
                }, 2000);
            } else {
                $('#start-correct').css('z-index', 1000);
                $('#start-correct').css('opacity', 1);
                setTimeout(() => {
                    window.location.href = '/startgame';
                }, 2000);
            }
        }
        else if (val.length == 1){
            $("#" + (parseInt(number) + 1) + "_letter").get(0).focus();
        }
        else if (val.length == 0 && i != 0){
            $("#" + (parseInt(number) - 1) + "_letter").get(0).focus();
        }
    });

} 