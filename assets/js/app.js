let config = {
    apiKey: "AIzaSyCcOz4jinogYZJKzryxbfY_8TbRYYo8670",
    authDomain: "train-scheduler-37f5e.firebaseapp.com",
    databaseURL: "https://train-scheduler-37f5e.firebaseio.com",
    projectId: "train-scheduler-37f5e",
    storageBucket: "train-scheduler-37f5e.appspot.com",
    messagingSenderId: "266072816832"
};

firebase.initializeApp(config);

// FIREBASE AUTH CONFIG COPIED OVER:

// FirebaseUI config.
let uiConfig = {
    signInSuccessUrl: 'https://philiptd5000.github.io/train-scheduler/',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: 'https://www.google.com/'
};

// Initialize the FirebaseUI Widget using Firebase.
let ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

// END FIREBASE CONFIG//

let provider = new firebase.auth.GoogleAuthProvider();

//FIREBASE SIGN-IN INITIALIZER:
// firebase.auth().signInWithPopup(provider).then(function(result) {
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     let token = result.credential.accessToken;
//     // The signed-in user info.
//     let user = result.user;
//     // ...
// }).catch(function(error) {
//     // Handle Errors here.
//     let errorCode = error.code;
//     let errorMessage = error.message;
//     // The email of the user's account used.
//     let email = error.email;
//     // The firebase.auth.AuthCredential type that was used.
//     let credential = error.credential;
//     // ...
// });

// if (ui.isPendingRedirect()) {
//     ui.start('#firebaseui-auth-container', uiConfig);
// }
//END FIREBASE SIGN-IN WITH POP UP + IF PENDING SNIPPET//

//HERE TO TRACK AUTH STATE ACROSS ALL PAGES:
initApp = function () {
    firebase.auth().onAuthStateChanged(function (user) {


        if (user) {
            // User is signed in.
            let displayName = user.displayName;
            let email = user.email;
            let emailVerified = user.emailVerified;
            let photoURL = user.photoURL;
            let uid = user.uid;
            let phoneNumber = user.phoneNumber;
            let providerData = user.providerData;
            let accountDetailsStr;
            user.getIdToken().then(function (accessToken) {
                let $signOutBtn = $('<button class="btn btn-danger">Sign Out</button>').on('click', signOut);
                $('#sign-in-status').text('Signed in');
                $('#sign-in').html($signOutBtn);
                accountDetailsStr = JSON.stringify({
                    displayName: displayName,
                    email: email,
                    emailVerified: emailVerified,
                    phoneNumber: phoneNumber,
                    photoURL: photoURL,
                    uid: uid,
                    accessToken: accessToken,
                    providerData: providerData
                }/*, null, '  '*/);
            });
        } else {
            // User is signed out.
            $('#sign-in-status').text('Signed out');
            $('#sign-in').text('Sign-in');
            $('#account-details').text('null');
        }
    }, function (error) {
        console.log(error);
    });
};

window.addEventListener('load', function () {
    initApp()
    $('.firebaseui-auth-container').toggleClass('hide');
});
//END TRACK AUTH STATE//

//   FIREBASE SIGN-OUT:
function signOut() {
    firebase.auth().signOut().then(function () {
        console.log('SIGN-OUT SUCCESS');
    }).catch(function (error) {
        console.log(error);
    });

    $('.firebaseui-auth-container').toggleClass('hide');
}
//   END FIREBASE SIGN-OUT//

$('.firebaseui-auth-container').on('click', function() {
    $(this).toggleClass('hide');
})

// END FIREBASE AUTH SETUP //

//TIME SCHEDULER DATABASE AND APP SETUP:

const database = firebase.database();
const ref = database.ref();

let nextTrain = 0;
let pageTimeout;
let pageUpdateInt;
let uniqueID;

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

    ref.push(newTrain)

    $("#train-name").val("");
    $("#dest").val("");
    $("#first-train-time").val("");
    $("#freq").val("");

})

ref.on('child_added', function (snapshot) {
    // console.log(Object.entries(snapshot));
    //SIMPLIFY:
    let value = snapshot.val();
    // let valueKeys = Object.keys(value);
    // console.log(value);
    // console.log(valueKeys);

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

    // console.log(train + " = TRAIN NAME");
    // console.log(firstTrainTime + " = DEPARTURE TIME")
    // console.log(firstTrainMinutesPastMidnight + " = MINUTES PAST MIDNIGHT OF FIRST TRAIN");

    //CONVERT TIME NOW into MINUTES/1440 (2)
    let now = moment().format('HH:mm');
    let timeNowHour = moment(now, "HH:mm").format('HH');
    let timeNowHoursToMinutes = timeNowHour * 60;
    let timeNowMinutes = moment(now, "HH:mm").format('mm');
    let timeNowMinutesPastMidnight = parseInt(timeNowHoursToMinutes) + parseInt(timeNowMinutes);

    // console.log(now + " = TIME NOW");
    // console.log(timeNowMinutesPastMidnight + " = TIME NOW MINUTES PAST MIDNIGHT");

    // console.log(returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequency) + " = NEXT TRAIN MINUTES");
    let minutesAway = returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequency);

    let nextArrival = returnNextArrival(minutesAway);

    uniqueID = "temp-blank";

    renderLiveSchedule(train, destination, frequency, nextArrival, minutesAway, uniqueID);

});

triggerTimers();

function triggerTimers() {
    pageTimeout = setTimeout(startInterval, 10);
    valueListenPageUpdate();
}

function startInterval() {
    pageUpdateInt = setInterval(valueListenPageUpdate, 10000);
}

function valueListenPageUpdate() {
    ref.on('value', function (snapshot) {

        $('#train-schedule').empty();

        let valueObj = snapshot.val();
        let allTrains = Object.values(valueObj);
        let valueKeys = Object.keys(valueObj);

        //TRYING TO PARSE DATA RECEIVED AND ASSIGN THE UPDATED TRAINS THEIR UNIQUE IDS...
        console.log("ALL TRAINS:");
        console.log(allTrains);
        console.log("OBJECT KEYS:");
        console.log(valueKeys);


        //BELOW IS COPIED OVER FROM .ON('CHILD-ADDED')... POSSIBLY WILL NEED TO WRITE A SINGLE FUNCTION TO REPLICATE:
        for (let i = 0; i < allTrains.length; i++) {

            //RETRIEVE UPDATED VALUES FROM DATABASE:
            let trainUpdated = allTrains[i].trainName;
            let destinationUpdated = allTrains[i].destination;
            let frequencyUpdated = allTrains[i].frequency;
            let firstTrainTimeUpdated = allTrains[i].firstTrainTime;
            let trainUniqueID = valueKeys[i];

            //RETRIEVE ID FOR UPDATE BUTTON(?)

            console.log(trainUpdated);
            console.log(destinationUpdated);
            console.log(frequencyUpdated);
            console.log(firstTrainTimeUpdated);
            console.log(trainUniqueID);

            //CONVERT FIRST-TRAIN-TIME into MINUTES/1440 (1)
            let firstTrainTimeMinutes = moment(firstTrainTimeUpdated, "HH:mm").format('mm');
            let firstTrainTimeHour = moment(firstTrainTimeUpdated, "HH:mm").format('HH');
            let convertHoursToMinutes = firstTrainTimeHour * 60;
            let firstTrainMinutesPastMidnight = parseInt(convertHoursToMinutes) + parseInt(firstTrainTimeMinutes);

            // console.log(trainUpdated + " = TRAIN NAME");
            // console.log(firstTrainTimeUpdated + " = DEPARTURE TIME")
            // console.log(firstTrainMinutesPastMidnight + " = MINUTES PAST MIDNIGHT OF FIRST TRAIN");

            //CONVERT TIME NOW into MINUTES/1440 (2)
            let now = moment().format('HH:mm');
            let timeNowHour = moment(now, "HH:mm").format('HH');
            let timeNowHoursToMinutes = timeNowHour * 60;
            let timeNowMinutes = moment(now, "HH:mm").format('mm');
            let timeNowMinutesPastMidnight = parseInt(timeNowHoursToMinutes) + parseInt(timeNowMinutes);

            // console.log(now + " = TIME NOW");

            let minutesAway = returnMinutesAway(firstTrainMinutesPastMidnight, timeNowMinutesPastMidnight, frequencyUpdated);
            let nextArrival = returnNextArrival(minutesAway);

            renderLiveSchedule(trainUpdated, destinationUpdated, frequencyUpdated, nextArrival, minutesAway, trainUniqueID);

        }
    });
}

$('body').on('click', '.update-link', function () {

    uniqueID = $(this).attr('data-id');

    let $name = $(this).attr('data-attribute');
    $('#train-name').val($name);

    let $updateBtn = $('#update-btn');
    $updateBtn.toggleClass('hide');

    $('#dest').attr('placeholder', 'e.g. Boston')
    $('#first-train-time').attr('placeholder', 'e.g. 18:50')
    $('#freq').attr('placeholder', 'e.g. 35')

    //deactivate submit button(?)

})

$('#update-btn').on('click', function (event) {

    event.preventDefault();

    console.log("UNIQUE ID FOR QUERY:");
    console.log(uniqueID);

    $(this).toggleClass('hide');


    //CAN INCLUDE SOME LOGIC HERE THAT WILL CHECK IF VALUES ARE EMPTY AND PULL ORIGINAL VALUES IF THEY ARE:
    let $name = $('#train-name').val().trim();
    let $dest = $('#dest').val().trim();
    let $first = moment($('#first-train-time').val(), "HH:mm").format("HH:mm");
    let $freq = $('#freq').val().trim();

    database.ref(`/${uniqueID}`).update({
        trainName: $name,
        destination: $dest,
        firstTrainTime: $first,
        frequency: $freq
    }, function (error) {
        if (error) {
            console.log("The write failed...");
        } else {
            console.log("Data saved successfully!");
        }
    });

    //HERE WE NEED TO PUSH THE UPDATED TRAIN, USING THE UNIQUE ID THAT HAS BEEN SET GLOBALLY(?)

    $("#train-name").val("").attr('placeholder', '');
    $("#dest").val("").attr('placeholder', '');
    $("#first-train-time").val("").attr('placeholder', '');
    $("#freq").val("").attr('placeholder', '');

    valueListenPageUpdate()




})


/* COPIED FROM FIREBASE DOCS UPDATE INSTRUCTIONS:
  // Get a key for a new Post.
  let newPostKey = firebase.database().ref().child('posts').push().key;
*/

function renderLiveSchedule(name, dest, freq, nxtArrival, minsToArrival, uniqueID) {

    // let $updateNameLink = $('<p>').attr('data-attribute', `${name}`).html('UPDATE');
    let $updateNameLink = $(`<a href="#" data-attribute="${name}" data-id="${uniqueID}" class="update-link">UPDATE</p>`);

    // console.log($updateNameLink);


    if (minsToArrival <= 15 && !(minsToArrival >= 15)) {
        $('#train-schedule').append(`
            <tr>
                <td id="train" class="text-center thirty">${name}</td>
                <td id="destination" class="text-center thirty">${dest}</td>
                <td id="frequency" class="text-center thirty">${freq}</td>
                <td id="next-arrival" class="text-center thirty"> ${nxtArrival} </td>
                <td id="minutes-away" class="text-center thirty"> ${minsToArrival} </td>
                <td id="update" class="text-center">${$updateNameLink[0].outerHTML}</td>
            </tr>
        `);

    } else if (minsToArrival > 15 && minsToArrival <= 60) {
        $('#train-schedule').append(`
            <tr>
                <td id="train" class="text-center sixty">${name}</td>
                <td id="destination" class="text-center sixty">${dest}</td>
                <td id="frequency" class="text-center sixty">${freq}</td>
                <td id="next-arrival" class="text-center sixty"> ${nxtArrival} </td>
                <td id="minutes-away" class="text-center sixty"> ${minsToArrival} </td> 
                <td id="update" class="text-center">${$updateNameLink[0].outerHTML}</td>               
            </tr>
        `);

    } else {
        $('#train-schedule').append(`
            <tr>
                <td id="train" class="text-center sixty-plus">${name}</td>
                <td id="destination" class="text-center sixty-plus">${dest}</td>
                <td id="frequency" class="text-center sixty-plus">${freq}</td>
                <td id="next-arrival" class="text-center sixty-plus"> ${nxtArrival} </td>
                <td id="minutes-away" class="text-center sixty-plus"> ${minsToArrival} </td>
                <td id="update" class="text-center">${$updateNameLink[0].outerHTML}</td>
            </tr>
        `)
    }

}

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

/* FIRST ATTEMPT TO TRICK .ON('CHILD-ADDED') INTO UPDATING PAGE:
    function falseAdd() {
        let emptyTrain = {
            trainName: "-",
            destination: "-",
            firstTrainTime: "-",
            frequency: "-"
        };
        // console.log(emptyTrain);
        ref.push(emptyTrain, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log("FALSE ADD SUCCESS");
            }
        });
        ref.remove(emptyTrain);
    }
*/ //END
