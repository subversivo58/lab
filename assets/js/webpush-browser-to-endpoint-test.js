// request WebPushLib form `window` object
const webpush =  window.WebPushLib;
/* generate VAPID keys
 * const vapidKeys = webpush.generateVAPIDKeys();
 * console.log(JSON.stringify(vapidKeys, null, 4));
 */

// from `webpush.generateVAPIDKeys()`
const ServerKeys = {
    pubkey:  "BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI",
    privkey: "qON0RY7otTgJ1vhCQSiCbeBN6q82Aak6cQBcnCktmCA"
}

/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function updateSubscriptionOnServer(subscription) {
    // note: after subscriptio, this demo reload launch new notification
    if ( subscription ) {
        // set VAPID details
        webpush.setVapidDetails(
           'mailto:yourmail@example.com',
           'BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI',
           'qON0RY7otTgJ1vhCQSiCbeBN6q82Aak6cQBcnCktmCA'
        );
        // get substantial info from subscription data - {Object}
        const rawSubscription = JSON.parse(JSON.stringify(subscription))
        
        let payload = JSON.stringify({
            title: 'Subversivo58 Bot',
            body: 'Thank you for enabling Push Notifications',
            icon: './assets/img/wp-success.png' // bot icon
        })
        // define options [in seconds]
        let options = {
            TTL: 60 // 1 minute
        }
        // send notification
        webpush.sendNotification(rawSubscription, payload, options).then(response => {
            console.log("Web Push Notification is sended 🚀 !")
        }).catch(e => {
            console.error(e)
        })
   }
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }).then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  }).catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  }).catch(function(error) {
    console.log('Error unsubscribing', error);
  }).then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

function initializeUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('webpush-sw.js').then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initializeUI();
  }).catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}
