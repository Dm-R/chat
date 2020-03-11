import './scss/main.scss';

const PubNub = require('pubnub');

const user = {};

const msgBox = document.querySelector('div[name="msg-box"]');
const getTime = () => {
  const now = new Date();
  let hours = now.getHours();
  let mins = now.getMinutes();
  hours = hours < 10 ? `0${hours}` : hours;
  mins = mins < 10 ? `0${mins}` : mins;
  const time = `${hours}:${mins}`;
  return time;
};

const printMessage = (() => {
  let lastPublisher = '';
  return (message) => {
    const time = getTime();
    const text = `</br> <div>${message.message.text} <sub>${time}</sub></div>`;
    const msg = document.createElement('div');
    if (message.publisher !== lastPublisher) {
      const avatar = document.createElement('img');
      avatar.className = 'avatar';
      avatar.src = `https://www.robohash.org/${message.publisher}`;
      msg.appendChild(avatar);
    } else {
      msg.classList.add('added-msg');
    }
    msg.innerHTML += text;
    if (message.publisher === user.uuid) {
      msg.className = `my-msg ${msg.className}`;
    } else {
      msg.className = `new-msg ${msg.className}`;
    }
    lastPublisher = message.publisher;
    msgBox.appendChild(msg);
    msg.scrollIntoView();
  };
})();
const pubnub = new PubNub({
  publishKey: 'pub-c-1ad1522a-6871-408a-8298-f47990eca063',
  subscribeKey: 'sub-c-cda81efe-5eb3-11ea-b226-5aef0d0da10f',
  ssl: true,
});
user.uuid = pubnub.getUUID();
pubnub.addListener({
  status(statusEvent) {
    if (statusEvent.category === 'PNConnectedCategory') {
      const newState = {
        name: 'name',
        timestamp: new Date(),
      };
      pubnub.setState(
        {
          channels: ['simple-chat'],
          state: newState,
        },
      );
    }
  },
  message: (message) => {
    printMessage(message);
  },
  presence(presenceEvent) {
    const participant = document.querySelector('.users');
    if (presenceEvent.action === 'join') {
      const block = document.createElement('div');
      block.className = `${presenceEvent.uuid}`;
      const img = document.createElement('img');
      img.src = `https://www.robohash.org/${presenceEvent.uuid}`;
      block.appendChild(img);
      block.className = 'participant';
      participant.appendChild(block);
      if (presenceEvent.uuid === user.uuid) {
        participant.innerHTML += '<p>You</p> </br> <div class="divider"></div><p>joined after You</p>';
      }
    } else if (presenceEvent.action === 'leave') {
      const elmtToRemove = document.querySelector(`.${presenceEvent.uuid}`);
      if (elmtToRemove !== null) {
        elmtToRemove.parentNode.removeChild(elmtToRemove);
      }
    }
  },
});
pubnub.subscribe({
  channels: ['simple-chat'],
  withPresence: true,
});
const sendMessage = (message) => {
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
    includeState: true,
  },
);
const unsubscribe = () => {
  pubnub.unsubscribe({
    channels: ['simple-chat'],
  });
};


const exitBtn = document.querySelector('.exit');
exitBtn.addEventListener('click', unsubscribe);

// let controleHeight = (elmt) => {

//   let element = document.querySelector(elmt);

//   let initialHeight = element.scrollHeight;
//   return () => {
//     let scrollHeight = element.scrollHeight;
//     let rowsCount = +(element.getAttribute('rows'));
//     if((parseInt(scrollHeight)) > (parseInt(initialHeight))) {
//       rowsCount += 1;
//       element.setAttribute('rows', rowsCount);
//       initialHeight = scrollHeight;
//     }
//   }
// }
const txt = document.querySelector('textarea');
// txt.addEventListener('keydown', controleHeight('textarea'));
txt.addEventListener('keypress', {
  handleEvent(e) {
    if (e.keyCode === 13) {
      const textarea = document.querySelector('textarea');
      const message = textarea.value;
      sendMessage(message);
      textarea.value = '';
    }
  },
});

const msgForm = document.forms.msg;
msgForm.addEventListener('submit', {
  handleEvent(e) {
    e.preventDefault();
    const { text } = e.target;
    const message = text.value;
    sendMessage(message);
    text.value = '';
    text.setAttribute('rows', 2);
  },
});
