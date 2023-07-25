import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decodedToken = jwt_decode(token);

        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("accessToken");
          navigate("/users/sign_in");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      navigate("/users/sign_in");
    }
  }, [navigate]);

  return null;
};

export default Verify;
