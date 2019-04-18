function Chat () {
    this.update = updateChat;
    this.send = sendChat;
    this.getState = getStateOfChat;
}
//gets the state of the chat
function getStateOfChat() {
	if(!instanse){
		instanse = true;
		$.ajax({
			type: "POST",
			url: "process.php",
			data: {'function': 'getState', 'file': file},
			dataType: "json",	
			success: function(data) {state = data.state;instanse = false;}
		});
	}	
}

//Updates the chat
function updateChat() {
	if(!instanse){
		instanse = true;
		$.ajax({
			type: "POST",
			url: "process.php",
			data: {'function': 'update','state': state,'file': file},
			dataType: "json",
			success: function(data) {
				if(data.text){
					for (var i = 0; i < data.text.length; i++) {
						$('#chat-area').append($("

						"+ data.text[i] +"

						"));
					}	
				}
				document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight;
				instanse = false;
				state = data.state;
			}
		});
	}
	else {
		setTimeout(updateChat, 1500);
	}
}

//send the message
function sendChat(message, nickname) { 
	updateChat();
	$.ajax({
		type: "POST",
		url: "process.php",
		data: {'function': 'send','message': message,'nickname': nickname,'file': file},
		dataType: "json",
		success: function(data){
			updateChat();
		}
	});
}
<?php

    $function = $_POST['function'];
    
    $log = array();
    
    switch($function) {
    
       case('getState'):
           if (file_exists('chat.txt')) {
               $lines = file('chat.txt');
           }
           $log['state'] = count($lines); 
           break;  
      
       case('update'):
          $state = $_POST['state'];
          if (file_exists('chat.txt')) {
             $lines = file('chat.txt');
          }
          $count =  count($lines);
          if ($state == $count){
             $log['state'] = $state;
             $log['text'] = false;
          } else {
             $text= array();
             $log['state'] = $state + count($lines) - $state;
             foreach ($lines as $line_num => $line) {
                 if ($line_num >= $state){
                       $text[] =  $line = str_replace("\n", "", $line);
                 }
             }
             $log['text'] = $text; 
          }
            
          break;
       
       case('send'):
       	 $nickname = htmlentities(strip_tags($_POST['nickname']));
	     $reg_exUrl = "/(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/";
	     $message = htmlentities(strip_tags($_POST['message']));
	     if (($message) != "\n") {
	       if (preg_match($reg_exUrl, $message, $url)) {
	          $message = preg_replace($reg_exUrl, '<a href="'.$url[0].'" target="_blank">'.$url[0].'</a>', $message);
	       } 
	          fwrite(fopen('chat.txt', 'a'), "<span>". $nickname . "</span>" . $message = str_replace("\n", " ", $message) . "\n"); 
	     }
         break;
    }
    echo json_encode($log);
?>
