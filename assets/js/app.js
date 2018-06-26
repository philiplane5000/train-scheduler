let config = {
    apiKey: "AIzaSyCcOz4jinogYZJKzryxbfY_8TbRYYo8670",
    authDomain: "train-scheduler-37f5e.firebaseapp.com",
    databaseURL: "https://train-scheduler-37f5e.firebaseio.com",
    projectId: "train-scheduler-37f5e",
    storageBucket: "train-scheduler-37f5e.appspot.com",
    messagingSenderId: "266072816832"
};

firebase.initializeApp(config);

const database = firebase.database();
const ref = database.ref();

$('#submit').on('click', function (event) {

    event.preventDefault();

    let name = $('#train-name').val().trim();
    let dest = $('#dest').val().trim();
    let first = moment($('#first-train-time').val(), "HH:mm").format("h:mm:ss a");
    let freq = $('#freq').val().trim();

    let newTrain = {
        trainName: name,
        destination: dest,
        firstTrainTime: first,
        frequency: freq
    };

    console.log(newTrain);

    ref.push(newTrain);

    $("#train-name").val("");
    $("#dest").val("");
    $("#first-train-time").val("");
    $("#freq").val("");

})

ref.on('child_added', function (snapshot) {
    //SIMPLIFY:
    let value = snapshot.val();

    //RETRIEVE VALUES FROM DATABASE:
    let train = value.trainName;
    let destination = value.destination;
    let frequency = value.frequency;
    let firstTrainTime = value.firstTrainTime;

    //CONVERT FIRST-TRAIN-TIME into MINUTES/1440 (1)
    let firstTrainTimeMinutes = moment(firstTrainTime, "h:mm:ss a").format('mm');
    let firstTrainTimeHour = moment(firstTrainTime, "h:mm:ss a").format('h');
    let convertHoursToMinutes = firstTrainTimeHour * 60;
    let minutePastMidnight = parseInt(convertHoursToMinutes) + parseInt(firstTrainTimeMinutes);
    
    console.log(firstTrainTimeHour + " = Hours Past Midnight");
    console.log(firstTrainTimeMinutes + " = Minutes");
    console.log(minutePastMidnight + " = MINUTES PAST MIDNIGHT OF FIRST TRAIN");

    //RUN TIME NOW AGAINST A FOR LOOP INTERVAL OF TRAIN FREQUENCY UP TO 1440
    //IF LESS THAN [I] RUN CALCULATIONS:

    let now = moment().format('HH:mm');
    console.log(now + " = TIME NOW");

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