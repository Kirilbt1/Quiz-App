import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import '../style/Navbar.css';  // Create a corresponding CSS file for styles

const NavBar = () => {
  const user = JSON.parse(localStorage.getItem('currentUser')) || {};
  const { displayName, photoURL } = user;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const signOut = () => {
    auth.signOut()
      .then(() => {
        console.log("User signed out");
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserId');
      })
      .catch(error => {
        console.error("Error signing out:", error);
      });
    setMenuOpen(false); // Close the menu after signing out
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
        <Link to={'/'} className='nav_list'><h1>Quiz App</h1></Link>
          
        </div>
        <ul className="navbar-links">
          <li><Link to="/" className='allLinks'>Home</Link></li>
          <li ><Link to="/create-quiz" >Create Quiz</Link></li>
          <li><Link to="/rankings" className='allLinks'>Rankings</Link></li>
          {displayName ? (
            <li className="navbar-user">
              <div className="user-info" onClick={handleMenuToggle}>
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="user-avatar" />
                ) : (
                  <div className="user-avatar">{displayName.charAt(0)}</div>
                )}
                <span className="user-name">{displayName}</span>
              </div>
              {menuOpen && (
                <ul className="dropdown-menu">
                  <li onClick={signOut}>Logout</li>
                </ul>
              )}
            </li>
          ) : (
            <li><Link to="/login">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
