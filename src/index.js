import './scss/main.scss';

const PubNub = require('pubnub');

let user = {}

let msgBox = document.querySelector('div[name="msg-box"]');



// user.name = prompt('What\'s your name?', 'Guest');
const pubnub = new PubNub({
  publishKey: 'pub-c-1ad1522a-6871-408a-8298-f47990eca063',
  subscribeKey: 'sub-c-cda81efe-5eb3-11ea-b226-5aef0d0da10f',
  ssl: true,
});
user.uuid = pubnub.getUUID();
let participant = document.querySelector('.users');
let img = document.createElement('img');
img.src = `https://www.robohash.org/${user.uuid}`
participant.appendChild(img);
document.querySelector('users').appendChild(participant);
pubnub.addListener({
  status: function(statusEvent) {
    if (statusEvent.category === "PNConnectedCategory") {
        var newState = {
            name: 'name',
            timestamp: new Date()
        };
        pubnub.setState(
            {
                channels: ["simple-chat"],
                state: newState
            }
        );
    }
  },
  message: (message) => {
    printMessage(message);
  },
  presence: function(presenceEvent) {
    console.log(presenceEvent);
    if(presenceEvent.action === 'join') {
      console.log(`${presenceEvent} is connected.`);
    } else if (presenceEvent.action === 'leave') {
      document.querySelector('.status').innerHTML = 'disconnected';
    }
  }
});
pubnub.subscribe({
  channels: ['simple-chat'],
  withPresence: true,
});
let sendMessage = (message) => {
  pubnub.publish({
    message: {
      sender: user,
      text: message,
    },
    channel: 'simple-chat',
  });
};
pubnub.hereNow(
  {
      channels: ['simple-chat'],
      includeState: true
  },
  function(status, response) {
      console.log(status);
      console.log(response);
  }
);
let unsubscribe = () => {
  pubnub.unsubscribe({
    channels: ['simple-chat'],
});
}


let exitBtn = document.querySelector('.exit');
exitBtn.addEventListener('click', unsubscribe);

let controleHeight = (elmt) => {
  let element = document.querySelector(elmt);
  let initialHeight = element.scrollHeight;
  return () => {
    let scrollHeight = element.scrollHeight;
    let rowsCount = +(element.getAttribute('rows'));
    if((parseInt(scrollHeight)) > (parseInt(initialHeight))) {
      rowsCount += 1;
      element.setAttribute('rows', rowsCount);
      initialHeight = scrollHeight;
    } 
  }
}
let txt = document.querySelector('textarea');
txt.addEventListener('keydown', controleHeight('textarea'));

let msgForm = document.forms.msg;
msgForm.addEventListener('submit', {
  handleEvent(e) {
    e.preventDefault();
    let message = e.target['text'].value;
    sendMessage(message);
  }
});

let printMessage = (message) => {
  let msg = document.createElement('div');
  let avatar = document.createElement('img');
  avatar.className = 'avatar';
  let text = `</br> <div>${message.message.text}</div>`;
  avatar.src = `https://www.robohash.org/${message.publisher}`;
  msg.appendChild(avatar);
  msg.innerHTML += text;
  if(message.publisher === user.uuid) {
    msg.className = 'my-msg';
  }else {
    msg.className = 'new-msg';
  }
  msgBox.appendChild(msg);
};
