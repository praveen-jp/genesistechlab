// // =============================================
// // Genesis Tech Lab - Firebase Configuration
// // =============================================
// // IMPORTANT: Replace these with your actual Firebase project credentials
// // Get them from: https://console.firebase.google.com

// const firebaseConfig = {
//   apiKey: "AIzaSyCe0UwiolLeoyN5QoHQPNQoizpQ4-rNPB8",
//   authDomain: "genesis-tech-lab.firebaseapp.com",
//   projectId: "genesis-tech-lab",
//   storageBucket: "genesis-tech-lab.firebasestorage.app",
//   messagingSenderId: "694731628921",
//   appId: "1:694731628921:web:9103273582c4b074f88fa8",
//   measurementId: "G-CC25T80N53"
// };

// export { firebaseConfig };


  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCe0UwiolLeoyN5QoHQPNQoizpQ4-rNPB8",
    authDomain: "genesis-tech-lab.firebaseapp.com",
    projectId: "genesis-tech-lab",
    storageBucket: "genesis-tech-lab.firebasestorage.app",
    messagingSenderId: "694731628921",
    appId: "1:694731628921:web:9103273582c4b074f88fa8",
    measurementId: "G-CC25T80N53"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

