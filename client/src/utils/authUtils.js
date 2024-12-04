// utils/authUtils.js
import jwtDecode from "jwt-decode";

export const checkUserLoggedIn = () => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp > currentTime) {
                return decodedToken.username;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    } else {
        return null;
    }
};

export const getUserLoggedIn = () => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.username;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    } else {
        return null;
    }
};

export const isAdministrator = () => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.isAdmin;
        } catch (error) {
            console.error("Error decoding token:", error);
            return false;
        }
    } else {
        return false;
    }
};
