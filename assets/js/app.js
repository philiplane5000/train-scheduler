let config = {
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
    let dest = $('#dest').val().trim();
    let first = $('#first-train-time').val().trim();
    let frequency = $('#frequency').val().trim();

    console.log(name);
    console.log(dest);
    console.log(first);
    console.log(frequency);

    let newTrain = {
        trainName: name,
        destination: dest,
        firstTrainTime: first,
        frequency: freq
    };

//     console.log(newTrain);

  ref.push(newTrain);

    $("#train-name").val("");
    $("#dest").val("");
    $("#first-train-time").val("");
    $("#frequency").val("");

})

ref.on('child_added', function (snapshot) {
    //SIMPLIFY:
    let value = snapshot.val();

    //RETRIEVE VALUES FROM DATABASE:
    let train = value.trainName;
    let destination = value.destination;
    let frequency = value.frequency;
    let firstTrainTime = value.firstTrainTime;

    // let firstTrainSecs = moment()

    let now = moment().format('HH:mm');
    console.log(now);

    $('#train-schedule').append(`
        <tr>
            <td id="train">${train}</td>
            <td id="destination">${destination}</td>
            <td id="frequency">${frequency}</td>
            <td id="next-arrival"> - </td>
            <td id="minutes-away"> - </td>
        </tr>
    `)
    
})