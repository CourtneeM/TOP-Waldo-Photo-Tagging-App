const config = {
  apiKey: "AIzaSyBWtV4LhLp7rjxDgLJ1potsxJewWbJ6GlU",
  authDomain: "waldo-photo-tagging-app.firebaseapp.com",
  projectId: "waldo-photo-tagging-app",
  storageBucket: "waldo-photo-tagging-app.appspot.com",
  messagingSenderId: "310565166483",
  appId: "1:310565166483:web:a586873181962d19ec1c66"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
