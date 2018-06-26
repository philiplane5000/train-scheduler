var config = {
    apiKey: "AIzaSyCcOz4jinogYZJKzryxbfY_8TbRYYo8670",
    authDomain: "train-scheduler-37f5e.firebaseapp.com",
    databaseURL: "https://train-scheduler-37f5e.firebaseio.com",
    projectId: "train-scheduler-37f5e",
    storageBucket: "train-scheduler-37f5e.appspot.com",
    messagingSenderId: "266072816832"
  };

  firebase.initializeApp(config);

          //TEST MOMENT.JS:
          console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));   

  const database = firebase.database();
  const ref = database.ref();

  $('#submit').on('click', function(event){

    event.preventDefault();

    let name = $('#train-name').val().trim();
    let dest = $('#destination').val().trim();
    let first = $('#first-train-time').val().trim();
    let freq = $('#frequency').val().trim();

    console.log(name);
    console.log(dest);
    console.log(first);
    console.log(freq);


    // let momentStart = moment(start, "DD/MM/YYYY").format();

  ref.push({
      trainName: name,
      destination: dest,
      firstTrainTime: first,
      frequency: freq
    })

})