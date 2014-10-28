$(document).ready(function(){
  
  var retrievedScore = localStorage.getItem('playerScore');
  
  var scoreParsed = JSON.parse(retrievedScore);
  var scoreInteger = parseInt(scoreParsed)

  $('#playerscore').html(scoreParsed);

  // var ref = new Firebase('https://amber-elk-game.firebaseio.com');
  // var usersRef = ref.child("users");

  var secondRef = new Firebase('https://amber-elk-game.firebaseio.com');
  var scores = secondRef.child("scores");


  var saveScore = function(user){
    scores.push({
      username: user,
      score: scoreInteger
    })

    // var keysArray = Object.keys(scores);
    // for (key in scores){
    //   // if new score is higher than current element...
    //   if (scoreInteger > scores[key].score){
    //     for (var i = keysArray.length; i > key; i--){
    //       scores[i] = scores[i - 1];
    //     }
    //     scores[key] = {username: user, score: scoreInteger}
    //   }
    // }
  }; 
  
  // var saveScore = function(lastPlayer){
  //   usersRef.child(lastPlayer).set({
  //     playerName: lastPlayer,
  //     highScore: scoreParsed
  //   })
  // };




  var storageArrayScores = [];
  var storageArrayNames = [];
  var i;

  //save
  $('#name-score').keypress(function(e){
    var savedName = $('#name-score').val();
    if (e.keyCode == 13){
      console.log("enter submitted!!!", savedName, scoreParsed);
      // function that grabs name.val and scoreParsed and saves to firebase
      saveScore(savedName);
    $('#name-score').hide();
    $('#name-final').html(savedName);
    firebaseRetrieve();
    }
  });



  // retrieve
  var firebaseRetrieve = function(){
    new Firebase('https://amber-elk-game.firebaseio.com/scores/').once('value', function(snap){
      var allScores = snap.val();

      console.log("this is all users", allScores);
      
      var scoreArray = [];

      for (i in allScores){
        scoreArray.push(allScores[i]);
      }

      scoreArray.sort(function(a, b){
        if (b.score > a.score){
          return 1;
        }
        if (b.score < a.score){
          return -1;
        }
        return 0;
      })

      $('#high-scores').html('');
      for(var x = 0; x < 5; x++){
        var scorehtml = '<div class="center aligned two column row"><span class="userScore column">' + scoreArray[x].score + '</span><span class="userName column">' + scoreArray[x].username + '</span></div>';
        $('#high-scores').append(scorehtml);
      }
      //$('#finalScore').html("High Score: " + lastUser.playerName + ' ' + lastUser.highScore);
      // for (i in allUsers){
      //   storageArrayScores.push(allUsers[i].highScore);          
      //   storageArrayNames.push(allUsers[i].playerName);
      // }
      // console.log("here are the names and scoress: ", storageArrayScores);
    });
  }
  firebaseRetrieve();






});

