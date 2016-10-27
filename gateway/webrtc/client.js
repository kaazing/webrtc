//******
//UI selectors block
//******
var loginPage = document.querySelector('#loginPage');
var usernameInput = document.querySelector('#usernameInput');
var passwordInput = document.querySelector('#passwordInput');
var loginBtn = document.querySelector('#loginBtn');
var errMessage = document.querySelector('#errMessage');

var callPage = document.querySelector('#callPage');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn');

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var overlay = document.querySelector('#overlay');

var yourConn;
var stream;
var ownQueue;

callPage.style.display = "none";
var name; //our username
var connectedUser=null; // the remote username
var consumer; // This is the consumer for our own JMS queue

//connecting to our signaling server
var conn;
var session;
var jmsServerURL = 'wss://kaazing.example.com:443/jms';
var answerReceived = false;

var peercon;
if (window.mozRTCPeerConnection) {
    peercon = mozRTCPeerConnection;
} else if (window.webkitRTCPeerConnection) {
    peercon = webkitRTCPeerConnection;
} else if (window.msRTCPeerConnection) {
    peercon = msRTCPeerConnection;
}

$(document).ready(function() {
    // All user to hit ENTER password field to login.
    $('#passwordInput').keypress(function(event){
      if(event.which == 13){
        loginBtn.click();
      }
    });

    // Allow user to hit ENTER in username field to make a call.
    $('#callToUsernameInput').keypress(function(event){
      if(event.which == 13){
        console.log('Calling...');
        callBtn.click();
      }
    });
    overlay.style.visibility='hidden';
    connectToSignallingJMS();
});

function showInCall() {
    callBtn.style.display='none';
    callToUsernameInput.style.display='none';
    hangUpBtn.style.display='inline';
    overlay.style.visibility='visible';
    overlay.innerText='Connected to '+connectedUser;
}

function showOffCall() {
    callBtn.style.display='inline';
    callToUsernameInput.style.display='inline';
    hangUpBtn.style.display='none';
    overlay.style.visibility='hidden';
}

function reconstructSDP (sdp) {
    var result = [];

    var lines = sdp.split("\n");
    for (let x of lines) {
        if (x.indexOf("candidate") > 0 && x.indexOf("typ host") > 0) {
            console.log("ELIMINATING ", x);
            continue;
        }
        result.push(x);
    }
    let resString = result.join("\n")
    console.log("reconstructed SDP"+ resString);
    return resString;
}

function connectToSignallingJMS() {
    console.log("CONNECT: " + jmsServerURL);

    var jmsConnectionFactory = new JmsConnectionFactory(jmsServerURL);
    // setup challenge handler
    // setupSSO(jmsConnectionFactory.getWebSocketFactory());
    try {
        var connectionFuture =
            //jmsConnectionFactory.createConnection(username.value, password.value, function () {
            jmsConnectionFactory.createConnection('', '', function() {
                if (!connectionFuture.exception) {
                    try {
                        conn = connectionFuture.getValue();
                        conn.setExceptionListener(handleException);

                        console.log("CONNECTED");

                        session = conn.createSession(false, Session.AUTO_ACKNOWLEDGE);
                        transactedSession = conn.createSession(true, Session.AUTO_ACKNOWLEDGE);

                        conn.start(function() {});
                    } catch (e) {
                        handleException(e);
                    }
                } else {
                    handleException(connectionFuture.exception);
                }
            });
    } catch (e) {
        handleException(e);
    }
}


function handleException(e) {
    console.log("<span class='error'>EXCEPTION: " + e + "</span>");
}

//when we got a message from a signaling server
function handleMessage(message) {
    console.log("Entering handleMessage: ", message);
    var data = {};
    data.type = message.getText();
    var props = message.getPropertyNames();
    while (props.hasMoreElements()) {
        var propName = props.nextElement();
        var propValue = message.getStringProperty(propName);

        data[propName] = JSON.parse(propValue);
    }
    console.log("RECEIVED data", data);

    switch (data.type) {
        case "login":
            handleLogin(data.success);
            break;
            //when somebody wants to call us
        case "offer":
            handleOffer(data.offer, data.sender);
            break;
        case "answer":
            handleAnswer(data.answer);
            break;
            //when a remote peer sends an ice candidate to us
        case "candidate":
            handleCandidate(data.candidate);
            break;
        case "leave":
            handleLeave();
            break;
        default:
            break;
    }
    console.log("Exiting handleMessage");
};


function send(message) {
    /*if (yourConn.iceGatheringState == "complete") {
        return
    }*/
    var dest = session.createTopic("/topic/" + connectedUser);;
    var producer = session.createProducer(dest);

    var textMsg = session.createTextMessage(message.type);
    message.sender = name;
    if (connectedUser) {
        message.receiver = connectedUser;
    }
    for (var key in message) {
        if (message.hasOwnProperty(key)) {
            console.log(key + " -> " + message[key]);
            if (key === "type") {
                continue
            } else {
                var property;
                if (message[key].toJSON !== undefined) {
                    property = message[key].toJSON();
                } else {
                    property = message[key];
                }
                textMsg.setStringProperty(key, JSON.stringify(property));
                console.log("Setting " + key + " to value " + message[key]);
            }
        }
    }

    try {
        var future = producer.send(textMsg, function() {
            if (future.exception) {
                handleException(future.exception);
            }
        });
    } catch (e) {
        handleException(e);
    }

    console.log("SEND TextMessage: \n\tDestination: " + dest + "\n\tMessage:" + JSON.stringify(message));
    producer.close();

}



// Login when the user clicks the button
loginBtn.addEventListener("click", function(event) {
    console.log("Entering loginBtn.click ", event);
    name = usernameInput.value;

    if (name.length <= 0) {
        return;
    }

    $('#displayUsername').text(name);

    ownQueue = session.createTopic("/topic/" + name);
    console.log("Created queue : " + ownQueue);
    if (ownQueue !== '') {
        startChat();
    }

    consumer = session.createConsumer(ownQueue);
    console.log("SUBSCRIBED to " + ownQueue);
    consumer.setMessageListener(function(message) {
        handleMessage(message);
    });
    console.log("Exiting loginBtn.click");
});

function handleVideo(myStream) {
    console.log("Entering handleVideo", myStream);
    stream = myStream;
    localVideo.srcObject = stream;

    var configuration = {
        "iceTransportPolicy": "relay",
        iceTransports: 'all',
        "iceServers": handleVideo.iceConfig
    };

    yourConn = new peercon(configuration);

    // setup stream listening
    //when a remote user adds stream to the peer connection, we display it
    yourConn.ontrack = function(e) {
        console.log("Entering ontrack", e);
        showInCall();
        if ( e.track.kind==="video") {
            console.log("Adding video stream");
                remoteVideo.srcObject = e.streams[0];
        }
        console.log("Exiting ontrack");
    };

    yourConn.addStream(stream);

    // Setup ice handling
    yourConn.onicecandidate = function(event) {
        console.log("Entering onicecandidate", event);
        
        if (event.candidate) {
            if (event.candidate.candidate.indexOf("host") < 0) {
                send({
                    type: "candidate",
                    candidate: new RTCIceCandidate(event.candidate)
                });
            }
        }
        
        console.log("Exiting onicecandidate");
    };
    
    yourConn.oniceconnectionstatechange = function(event) {
            console.log("Ice Connection State Change with event: ", event);
            console.log("Ice Connection State is now: ", yourConn.iceConnectionState);
            console.log("Ice Gathering State is now: ", yourConn.iceGatheringState);
    }
    
    /*yourConn.onnegotiationneeded = function () {
        console.log("Entering yourConn.onnegotiationneeded");
        createAndSendOffer();
        console.log("Exiting yourConn.onnegotiationneeded");
    }*/
    
    console.log("Exiting handleVideo");
}

function startChat() {
    console.log("Entering startChat");
    username = usernameInput.value;
    password = passwordInput.value;

    $.ajax({
        type: "GET",
        url: "https://kaazing.example.com:443/turn.rest?service=turn",
        dataType: 'json',
        async: true,
        headers: {
            "Authorization": "Basic " + btoa(username + ":" + password)
        },
        success: function(response) {
            console.log("Entering authorization success response handler", response);
            handleVideo.iceConfig = [ response ];

            loginPage.style.display = "none";

            //errMessage.style.display = "none";
            callPage.style.display = "block";
            
            
            showOffCall();
            $('#callToUsernameInput').focus();

            //**********************
            //Starting a peer connection
            //**********************

            //getting local video stream
            navigator.mediaDevices.getUserMedia({
              audio: true,
              video: true
            })
            .then(handleVideo)
            .catch(function(e) {
              alert('getUserMedia() error: ' + e.name);
            });
            console.log("Exiting authorization success response handler");
        },
        error: function() {
            errMessage.style.display = "block";
        }
    });
    console.log("Exiting startChat");

};

//initiating a call
callBtn.addEventListener("click", function() {
    console.log("Entering callBtn.click");

    var callToUsername = callToUsernameInput.value;

    
    if (callToUsername.length > 0) {
        connectedUser = callToUsername;
        showInCall();
        createAndSendOffer();
    }
    console.log("Exiting callBtn.click");
});

function createAndSendOffer() {
    console.log("Entering createAndSendOffer");
    // create an offer
    yourConn.createOffer().then(function(offer) {
        console.log("Created offer: ", offer);
        yourConn.setLocalDescription(new RTCSessionDescription(offer))
        .then (function (){
            send({
                type: "offer",
                offer: offer
            });
        })
        .catch(function(error) {
            console.log("Error when setting local description", error);
        });
    })    
    .catch(function(error) {
        console.log("Error when creating an offer", error);
    });
    console.log("Exiting createAndSendOffer");
}

//when somebody sends us an offer
function handleOffer(offer, sender) {
    console.log("Entering handleOffer", offer, sender);
    yourConn.setRemoteDescription(new RTCSessionDescription(offer))
    .catch(function (e) {
        console.log("Error when setting remote description", e);
    });

    if ( connectedUser == null ) {
        bootbox.confirm({
        message: "You are receiving a call from "+sender, 
        buttons: {
            confirm: {
                label: 'Answer',
                className: 'btn-success'
            },
            cancel: {
                label: 'Hang Up',
                className: 'btn-danger'
            }
        },
        callback: function(answer) {
            console.log("User answered the call");
            connectedUser = sender;
                    
                    if (answer == true)  {
                        createAndSendAnswer(offer,sender);
                    } else {
                        showOffCall();
                        leave();
                    }
        }
        });
    } else {
       createAndSendAnswer(offer,sender);
    }
    console.log("Exiting handleOffer");
};


function createAndSendAnswer(offer, sender ) {

    //create an answer to an offer
    yourConn.createAnswer()
    .then(function(answer) {
        console.log("Entering createAnswer signalling", answer);
        showInCall();
        yourConn.setLocalDescription(new RTCSessionDescription(answer))
        .then(function () {
            var sdp = reconstructSDP (answer.sdp);
            answer.sdp = sdp;
            send({
                type: "answer",
                answer: answer
            });
        })
        .catch(function(error) {
            console.log("Error when setting local description", error);
        });
        console.log("Exiting createAnswer signalling");
    })

    .catch(function(error) {
        console.log("Error when creating an answer", error);
    });

}

//when we got an answer from a remote user
function handleAnswer(answer) {
    console.log("Entering handleAnswwer");
    yourConn.setRemoteDescription(answer)
    .catch(function (e) { 
        console.log("Error when setting remote description", e); 
    });

    answerReceived = true;
    console.log("Exiting handleAnswer");
};


//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
    console.log("Entering handleCandidate", candidate);
    if (candidate.candidate.indexOf("host") < 0) {
        yourConn.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(function (e) {
            console.log("Error when adding candidate", e , candidate);
        });
    }
    console.log("Exiting handleCandidate");
};

//hang up
hangUpBtn.addEventListener("click", leave);

function leave() {
    send({
        type: "leave"
    });
    handleLeave();
}

function handleLeave() {
    console.log("Entering handleLeave");
    connectedUser = null;
    remoteVideo.srcObject = null;
    showOffCall();
    answerReceived = false;
    bootbox.hideAll()

    yourConn.close();
    yourConn.onicecandidate = null;
    yourConn.ontrack = null;
    startChat();
    console.log("Exiting handleLeave");
};