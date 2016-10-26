//******
//UI selectors block
//******
var loginPage = document.querySelector('#loginPage');
var usernameInput = document.querySelector('#usernameInput');
var passwordInput = document.querySelector('#passwordInput');
var loginBtn = document.querySelector('#loginBtn');
var errMessage = document.querySelector('#errMessage');
var mediaErrMessage = document.querySelector('#mediaErrorMessage');

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
/*
conn.onopen = function () {
   console.log("Connected to the signaling server");
};
  */
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

/*conn.onerror = function (err) {
   console.log("Got error", err);
};*/

//alias for sending JSON encoded messages
/*function send(message) {
   //attach the other peer username to our messages
   if (connectedUser) {
      message.name = connectedUser;
   }

   conn.send(JSON.stringify(message));
};*/

function send(message) {

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

    mediaErrMessage.style.display = "none";
    errMessage.style.display = "none";

    name = usernameInput.value;

    if (name.length <= 0) {
        return;
    }

    $('#displayUsername').text(name);

    ownQueue = session.createTopic("/topic/" + name);
    console.log("Created queue : " + ownQueue);
    if (ownQueue !== '') {
        startChat(function() {
            consumer = session.createConsumer(ownQueue);
            console.log("SUBSCRIBED to " + ownQueue);
            consumer.setMessageListener(function(message) {
                handleMessage(message);
            });
        });
    }
    console.log("Exiting loginBtn.click");
});

function showVideoPage(response) {

    loginPage.style.display = "none";

    //errMessage.style.display = "none";
    callPage.style.display = "block";
    
    callBtn.style.display='inline';
    callToUsernameInput.style.display='inline';
    hangUpBtn.style.display='none';
    overlay.style.visibility='hidden';

    $('#callToUsernameInput').focus();
}

function handleVideo(response, myStream) {
    console.log("Entering handleVideo", myStream);

    showVideoPage();

    stream = myStream;


    //displaying local video stream on the page
    if (window.URL) {
        localVideo.src = window.URL.createObjectURL(stream);
    } else {
        localVideo.src = stream;
    }

    var configuration = {
        "iceTransportPolicy": "relay",
        "iceServers": [ response ]
    };

    yourConn = new peercon(configuration);

    // setup stream listening
    //when a remote user adds stream to the peer connection, we display it
    yourConn.ontrack = function(e) {
        console.log("Entering ontrack", e);
        
        callBtn.style.display='none';
        callToUsernameInput.style.display='none';
        hangUpBtn.style.display='inline';
        overlay.style.visibility='visible';
        overlay.innerText='Connected to '+connectedUser;

        if (true == answerReceived) { 
	   if ( e.track.kind==="video") {
		console.log("Adding video stream");
       		remoteVideo.srcObject = e.streams[0];
	   }
	   console.log("Exiting ontrack"); 
	   return; 
	}

        if (connectedUser !== undefined && connectedUser.length > 0 )  { 
	   if ( e.track.kind==="video") {
                remoteVideo.srcObject = e.streams[0];
                yourConn.createOffer().then(function(offer) {
                        console.log("Creating offer : ", offer);
                        send({
                            type: "offer",
                            offer: offer
                        });

                        yourConn.setLocalDescription(offer);
                        

                    }).catch(function(error) {
                        console.log("Error when creating an offer", error);
                    });
       } 
	} 
        console.log("Exiting ontrack");
    };

    yourConn.addStream(stream);
    //stream.getTracks().forEach(track => yourConn.addTrack(track, stream));
    // Setup ice handling
    yourConn.onicecandidate = function(event) {
        console.log("Entering onicecandidate", event);
        if (event.candidate) {
            // comment in if you want to force relay, this demo currently requires
            if (event.candidate.candidate.indexOf("relay") > 0) {
                send({
                    type: "candidate",
                    candidate: new RTCIceCandidate(event.candidate)
                });
            }
        }
        console.log("Exiting onicecandidate");
    };
    console.log("Exiting handleVideo");
}

// TODO could be implemented as a Promise
function startChat(registerMessageListenerCallback) {
    console.log("Entering startChat");
    username = usernameInput.value;
    password = passwordInput.value;
    
    //getting local video stream
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    .then(function(myStream) {
        negotiateChatSession(myStream, registerMessageListenerCallback);
    })
    .catch(function(e) {
      mediaErrMessage.style.display = "block";
    });
    
    console.log("Exiting startChat");
}

function negotiateChatSession(myStream, registerMessageListenerCallback) {
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

            //**********************
            //Message listener can be safely registered
            //**********************
            registerMessageListenerCallback();

            //**********************
            //Starting a peer connection
            //**********************
            handleVideo(response, myStream);
            console.log("Exiting authorization success response handler");
        },
        error: function() {
            errMessage.style.display = "block";
        }
    });
}

//initiating a call
callBtn.addEventListener("click", function() {
    console.log("Entering callBtn.click");

    var callToUsername = callToUsernameInput.value;

    
    if (callToUsername.length > 0) {

        connectedUser = callToUsername;

        callBtn.style.display='none';
        callToUsernameInput.style.display='none';
        hangUpBtn.style.display='inline';
        overlay.style.visibility='visible';
        overlay.innerText='Connected to '+connectedUser;


        // create an offer
        yourConn.createOffer().then(function(offer) {
            console.log("Creating offer : ", offer);
            send({
                type: "offer",
                offer: offer
            });

            yourConn.setLocalDescription(offer);
        }).catch(function(error) {
            console.log("Error when creating an offer", error);
        });

    }
    console.log("Exiting callBtn.click");
});

//when somebody sends us an offer
function handleOffer(offer, sender) {
    console.log("Entering handleOffer", offer, sender);
 
    if ( connectedUser == null ) {
        bootbox.confirm({
        message: "You are receiving a call from "+connectedUser, 
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
            remoteVideo.srcObject = null;
                    
                    if (answer == true)  {
                        internalCreateAnswer(offer,sender);
                    } else {
                        callBtn.style.display='inline';
                        callToUsernameInput.style.display='inline';
                        overlay.style.visibility='hidden';
                        hangUpBtn.style.display='none';
                        
                        leave();
                    }
        }
        });
    } else {
        internalCreateAnswer(offer,sender);
    }
    console.log("Exiting handleOffer");
};

function internalCreateAnswer(offer, sender ) {

    yourConn.setRemoteDescription(new RTCSessionDescription(offer)).catch(function (e) { console.log("Remote error", e) ;});

    //create an answer to an offer
    yourConn.createAnswer().then(function(answer) {
        console.log("Entering createAnswer signalling", answer);
        
        callBtn.style.display='none';
        callToUsernameInput.style.display='none';
        hangUpBtn.style.display='inline';
        overlay.style.visibility='visible';
        overlay.innerText='Connected to '+connectedUser;
        yourConn.setLocalDescription(answer);

        send({
            type: "answer",
            answer: answer
        });
        console.log("Exiting createAnswer signalling");

    }).catch(function(error) {
        console.log("Error when creating an answer", error);
    });
}
var answerReceived = false;
//when we got an answer from a remote user
function handleAnswer(answer) {
    console.log("Entering handleAnswwer");
    yourConn.setRemoteDescription(new RTCSessionDescription(answer)).catch(function (e) { console.log("Remote error", e); });
    answerReceived = true;
    console.log("Exiting handleAnswer");
};

//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
    console.log("Entering handleCandidate", candidate);
    yourConn.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>{
	      console.log("Error: Failure during addIceCandidate()", e);
    });;
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
    callBtn.style.display='inline';
    callToUsernameInput.style.display='inline';
    hangUpBtn.style.display='none';
    overlay.style.visibility='hidden';
    answerReceived = false;
    bootbox.hideAll()

    yourConn.close();
    yourConn.onicecandidate = null;
    yourConn.ontrack = null;
    startChat();
    console.log("Exiting handleLeave");
};
