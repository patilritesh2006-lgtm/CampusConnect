import React from "react";
import { Navigate } from "react-router-dom";


function ProtectedRoute({ children, role }) {


  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );


  // No login
  if(!token){

    return <Navigate to="/login" />;

  }


  // Role checking

  if(role && user.role !== role){

    return <Navigate to="/" />;

  }


  return children;

}


export default ProtectedRoute;