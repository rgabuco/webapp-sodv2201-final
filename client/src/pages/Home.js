import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
//import HamburgerMenu from "../components/hamburger-menu/HamburgerMenu";
import LoginButton from "../components/login-button/LoginButton";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import { Grid, CardMedia } from "@mui/material";
import { Box, Typography } from "@mui/material";
import DateTime from "../components/date-time/DateTime";
import student5 from "../resources/img/home/student5.jpg";
import student2 from "../resources/img/home/student2.jpg";
import student3 from "../resources/img/home/student3.jpeg";
import student1 from "../resources/img/home/student1.jpg";
import student4 from "../resources/img/home/student4.jpg";
import student6 from "../resources/img/home/student6.jpg";
import { checkUserLoggedIn } from "../utils/authUtils";

const imageList = [student1, student2, student3, student4, student5, student6];

function Home() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Check if the user is logged in based on the token
        const username = checkUserLoggedIn();
        setUserLoggedIn(username);
    }, []);

    useEffect(() => {
        const fadeOut = () => {
            setOpacity(0);
            setTimeout(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % imageList.length);
                setOpacity(1);
            }, 500);
        };

        const timer = setInterval(fadeOut, 5000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        setUserLoggedIn(false);
    };

    return (
        <div>
            <Navbar rightMenu={userLoggedIn ? <ProfileMenu onLogout={handleLogout} /> : <LoginButton />} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: 0, color: "#34405E", margin: "0 0 20px 0" }}>
                <DateTime />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 2, color: "#34405E" }}>
                    <Typography variant="h3">Welcome to Bow Space</Typography>
                </Box>
                <Grid container justifyContent="center" alignItems="center">
                    <CardMedia
                        component="img"
                        image={imageList[currentImageIndex]}
                        alt={`Slideshow image ${currentImageIndex + 1}`}
                        style={{
                            width: "80vw", // Adjusts based on 80% of viewport width
                            height: "50vh", // Adjusts based on 50% of viewport height
                            objectFit: "cover",
                            margin: "0 auto",
                            opacity: opacity,
                            transition: "opacity 0.5s ease-in-out",
                        }}
                    />
                </Grid>
            </Box>
        </div>
    );
}

export default Home;
