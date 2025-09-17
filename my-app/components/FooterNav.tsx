import React from "react";
import { NavLink } from "react-router-dom";

const FooterNav: React.FC = () => {
  return (
    <footer className="footer-nav">
      <NavLink 
        to="/main" 
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Main
      </NavLink>
      <NavLink 
        to="/orders" 
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Orders
      </NavLink>
      <NavLink 
        to="/earnings" 
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Earnings
      </NavLink>
      <NavLink 
        to="/profile" 
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Profile
    </NavLink>
    </footer>
  );
};

export default FooterNav;
