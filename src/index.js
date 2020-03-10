import './scss/main.scss';

const PubNub = require('pubnub');

let user = {};

let msgBox = document.querySelector('div[name="msg-box"]');

// user.name = prompt('What\'s your name?', 'Guest');
const pubnub = new PubNub({
  publishKey: 'pub-c-1ad1522a-6871-408a-8298-f47990eca063',
  subscribeKey: 'sub-c-cda81efe-5eb3-11ea-b226-5aef0d0da10f',
  ssl: true,
});
user.uuid = pubnub.getUUID();

// document.querySelector('users').appendChild(participant);
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
    let participant = document.querySelector('.users');
    console.log(participant);
    if(presenceEvent.action === 'join') {
        
        let block = document.createElement('div');
        block.className = `${presenceEvent.uuid}`;
        let img = document.createElement('img');
        img.src = `https://www.robohash.org/${presenceEvent.uuid}`;
        block.appendChild(img);
        block.style.cssText = 'border-radius: 50%; width: 5em; margin-top: 1em; background-color: #808080;';
        
        participant.appendChild(block);
        if(presenceEvent.uuid === user.uuid) {
          participant.innerHTML += '<p>You</p> </br> <div class="divider"></div><p>joined after You</p>';
        }else {

        }
    } else if (presenceEvent.action === 'leave') {
      let elmtToRemove = document.querySelector(`.${presenceEvent.uuid}`);
      if(elmtToRemove !== null) {
        elmtToRemove.parentNode.removeChild(elmtToRemove);
      }
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
txt.addEventListener('keypress', {
  handleEvent(e) {
    if(e.keyCode === 13) {
      console.log('enter');
      let textarea = document.querySelector('textarea');
      let message = textarea.value;
      sendMessage(message);
      textarea.value = '';
    }
  }
});

let msgForm = document.forms.msg;
msgForm.addEventListener('submit', {
  handleEvent(e) {
    e.preventDefault();
    let text = e.target['text'];
    let message = text.value;
    sendMessage(message);
    text.value = '';
  }
});

let printMessage = (() => {
  let lastPublisher = '';
  return (message) => {
    let time = getTime();
    let text = `</br> <div>${message.message.text} <sub>${time}</sub></div>`;
    let msg = document.createElement('div');
    if(message.publisher !== lastPublisher) {
    let avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = `https://www.robohash.org/${message.publisher}`;
    msg.appendChild(avatar);
    }else {
      msg.classList.add('added-msg');
    }
    msg.innerHTML += text;
    if(message.publisher === user.uuid) {
      msg.className = 'my-msg ' + msg.className;
    }else {
      msg.className = 'new-msg ' + msg.className;
    }
    lastPublisher = message.publisher;
    msgBox.appendChild(msg);
  }
})();
let getTime = () => {
  let now = new Date();
  let hours = now.getHours();
  let mins = now.getMinutes()
  hours = hours < 10? `0${hours}`: hours;
  mins = mins < 10 ? `0${mins}`: mins;  
  let time = `${hours}:${mins}`;
  console.log(time);
  return time;
}
