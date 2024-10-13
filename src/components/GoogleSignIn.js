import React from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import '../style/GoogleSignIn.css';  // Import your custom CSS

const GoogleSignIn = () => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user ID and display name in localStorage
      localStorage.setItem('currentUserId', user.uid);
      localStorage.setItem('currentUser', JSON.stringify({ displayName: user.displayName }));

      // Save user information to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      console.log("User info saved successfully.");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
  
    
  <div className="hero-section"> 
        <div className="how-it-works-content">
        <img src="../../pictures/Login_Page.png" alt="How it works" className="how-it-works-img" />
          <div className="how-it-works-text">
            <h2 className="">How it works</h2>
            <p>1. Sign in with your Google account.</p>
            <p>2. Choose from a variety of quizzes on different topics.</p>
            <p>3. Track your scores and compare them with others on the leaderboard.</p>
            <button className="google-sign-in-btn" onClick={signInWithGoogle}>
              Sign in with Google
            </button>
          </div>
         
        </div>
        </div>
 
  );
};

export default GoogleSignIn;
