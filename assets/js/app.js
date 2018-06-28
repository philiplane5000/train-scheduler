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

let nextTrain = 0;
let pageTimeout;
let pageUpdateInt;

$('#submit').on('click', function (event) {

    event.preventDefault();

    let name = $('#train-name').val().trim();
    let dest = $('#dest').val().trim();
    let first = moment($('#first-train-time').val(), "HH:mm").format("HH:mm");
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
    let firstTrainTimeMinutes = moment(firstTrainTime, "HH:mm").format('mm');
    let firstTrainTimeHour = moment(firstTrainTime, "HH:mm").format('HH');
    let convertHoursToMinutes = firstTrainTimeHour * 60;
    let firstTrainMinutesPastMidnight = parseInt(convertHoursToMinutes) + parseInt(firstTrainTimeMinutes);

    console.log(train + " = TRAIN NAME");
    console.log(firstTrainTime + " = DEPARTURE TIME")
    console.log(firstTrainMinutesPastMidnight + " = MINUTES PAST MIDNIGHT OF FIRST TRAIN");

    //CONVERT TIME NOW into MINUTES/1440 (2)
    let now = moment().format('HH:mm');
    let timeNowHour = moment(now, "HH:mm").format('HH');
    let timeNowHoursToMinutes = timeNowHour * 60;
    let timeNowMinutes = moment(now, "HH:mm").format('mm');
    let timeNowMinutesPastMidnight = parseInt(timeNowHoursToMinutes) + parseInt(timeNowMinutes);

    console.log(now + " = TIME NOW");
    console.log(timeNowMinutesPastMidnight + " = TIME NOW MINUTES PAST MIDNIGHT");

    console.log(returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequency) + " = NEXT TRAIN MINUTES");
    let minutesAway = returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequency);

    let nextArrival = returnNextArrival(minutesAway);

    if(minutesAway <= 15 && !(minutesAway >= 15) ) {
        $('#train-schedule').append(`
        <tr>
            <td id="train" class="text-center thirty">${train}</td>
            <td id="destination" class="text-center thirty">${destination}</td>
            <td id="frequency" class="text-center thirty">${frequency}</td>
            <td id="next-arrival" class="text-center thirty"> ${nextArrival} </td>
            <td id="minutes-away" class="text-center thirty"> ${minutesAway} </td>
        </tr>
    `)
    } else if (minutesAway > 15 && minutesAway <= 60) {
        $('#train-schedule').append(`
                <tr>
                    <td id="train" class="text-center sixty">${train}</td>
                    <td id="destination" class="text-center sixty">${destination}</td>
                    <td id="frequency" class="text-center sixty">${frequency}</td>
                    <td id="next-arrival" class="text-center sixty"> ${nextArrival} </td>
                    <td id="minutes-away" class="text-center sixty"> ${minutesAway} </td>
                </tr>
            `)
    } else {
        $('#train-schedule').append(`
        <tr>
            <td id="train" class="text-center sixty-plus">${train}</td>
            <td id="destination" class="text-center sixty-plus">${destination}</td>
            <td id="frequency" class="text-center sixty-plus">${frequency}</td>
            <td id="next-arrival" class="text-center sixty-plus"> ${nextArrival} </td>
            <td id="minutes-away" class="text-center sixty-plus"> ${minutesAway} </td>
        </tr>
    `)
    }


});

triggerTimers();

function triggerTimers() {
    pageTimeout = setTimeout(startInterval, 1000);
}

function startInterval() {
    pageUpdateInt = setInterval(valueListenPageUpdate, 10000);
}

function valueListenPageUpdate() {
    ref.on('value', function (snapshot) {

        console.log(typeof snapshot.val());

        // SIMPLIFY:

        $('#train-schedule').empty();

        let valueObj = snapshot.val();
        let allTrains = Object.values(valueObj);

        console.log(allTrains);

        //BELOW IS COPIED OVER FROM .ON('CHILD-ADDED')... WILL NEED TO TWEAK USING FOR-EACH TO UPDATE PAGE!!!
        for (let i = 0; i < allTrains.length; i++) {

            //RETRIEVE UPDATED VALUES FROM DATABASE:
            let trainUpdated = allTrains[i].trainName;
            let destinationUpdated = allTrains[i].destination;
            let frequencyUpdated = allTrains[i].frequency;
            let firstTrainTimeUpdated = allTrains[i].firstTrainTime;

            console.log(trainUpdated);
            console.log(destinationUpdated);
            console.log(frequencyUpdated);
            console.log(firstTrainTimeUpdated);

            //INSTEAD OF WET CODE I CAN CREATE A FUNCTION AT THIS POINT (I THINK)... AFTER VARIABLES HAVE BEEN ESTABLISHED FROM DATABASE
            // (1) ABOVE FROM THE CHILD-ADDED LISTENER...
            // (2) THIS TIME FROM THE VALUE LISTENER...

            //CONVERT FIRST-TRAIN-TIME into MINUTES/1440 (1)
            let firstTrainTimeMinutes = moment(firstTrainTimeUpdated, "HH:mm").format('mm');
            let firstTrainTimeHour = moment(firstTrainTimeUpdated, "HH:mm").format('HH');
            let convertHoursToMinutes = firstTrainTimeHour * 60;
            let firstTrainMinutesPastMidnight = parseInt(convertHoursToMinutes) + parseInt(firstTrainTimeMinutes);

            console.log(trainUpdated + " = TRAIN NAME");
            console.log(firstTrainTimeUpdated + " = DEPARTURE TIME")
            console.log(firstTrainMinutesPastMidnight + " = MINUTES PAST MIDNIGHT OF FIRST TRAIN");

            //CONVERT TIME NOW into MINUTES/1440 (2)
            let now = moment().format('HH:mm');
            let timeNowHour = moment(now, "HH:mm").format('HH');
            let timeNowHoursToMinutes = timeNowHour * 60;
            let timeNowMinutes = moment(now, "HH:mm").format('mm');
            let timeNowMinutesPastMidnight = parseInt(timeNowHoursToMinutes) + parseInt(timeNowMinutes);

            console.log(now + " = TIME NOW");

            let minutesAway = returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequencyUpdated);
            let nextArrival = returnNextArrival(minutesAway);

            if(minutesAway <= 15 && !(minutesAway >= 15) ) {
                $('#train-schedule').append(`
                <tr>
                    <td id="train" class="text-center thirty">${trainUpdated}</td>
                    <td id="destination" class="text-center thirty">${destinationUpdated}</td>
                    <td id="frequency" class="text-center thirty">${frequencyUpdated}</td>
                    <td id="next-arrival" class="text-center thirty"> ${nextArrival} </td>
                    <td id="minutes-away" class="text-center thirty"> ${minutesAway} </td>
                </tr>
            `)
            } else if (minutesAway > 15 && minutesAway <= 60) {
                $('#train-schedule').append(`
                        <tr>
                            <td id="train" class="text-center sixty">${trainUpdated}</td>
                            <td id="destination" class="text-center sixty">${destinationUpdated}</td>
                            <td id="frequency" class="text-center sixty">${frequencyUpdated}</td>
                            <td id="next-arrival" class="text-center sixty"> ${nextArrival} </td>
                            <td id="minutes-away" class="text-center sixty"> ${minutesAway} </td>
                        </tr>
                    `)
            } else {
                $('#train-schedule').append(`
                <tr>
                    <td id="train" class="text-center sixty-plus">${trainUpdated}</td>
                    <td id="destination" class="text-center sixty-plus">${destinationUpdated}</td>
                    <td id="frequency" class="text-center sixty-plus">${frequencyUpdated}</td>
                    <td id="next-arrival" class="text-center sixty-plus"> ${nextArrival} </td>
                    <td id="minutes-away" class="text-center sixty-plus"> ${minutesAway} </td>
                </tr>
            `)
            }
        }
    });
}

// function falseAdd() {
//     let emptyTrain = {
//         trainName: "-",
//         destination: "-",
//         firstTrainTime: "-",
//         frequency: "-"
//     };
//     // console.log(emptyTrain);
//     ref.push(emptyTrain, function (error) {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log("FALSE ADD SUCCESS");
//         }
//     });
//     ref.remove(emptyTrain);
// }

//FUNCTION WILL RUN TIME NOW IN MINUTES PAST MIDNIGHT AGAINST A FOR LOOP UP TO 1440(MINUTES IN 24 HOURS) WHERE INTERVAL IS EQUAL TO TRAIN FREQUENCY: 
function returnMinutesAway(firstTrainMins, timeNow, interval) {

    let first = parseInt(firstTrainMins);
    let time = parseInt(timeNow);
    let int = parseInt(interval);

    for (let m = first; m < 1440; m += int) {
        if (time < m) {
            let nextTrain = (m - time);
            return nextTrain;
        } else {
            console.log('TRAIN PASSED');
        }
    }

}

//FUNCTION WILL RETURN TIME OF NEXT TRAIN USING MINUTES AWAY + TIME NOW -- CONVERTED TO AM/PM USING MOMENT.JS

function returnNextArrival(minsAway) {
    let now = moment().format("HH:mm");
    let nextArrivalTime = moment(now, "HH:mm").add(minsAway, 'm').format('hh:mm A');
    return nextArrivalTime;
}