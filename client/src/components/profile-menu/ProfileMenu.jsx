import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Avatar,
} from "@mui/material";
import {
    AccountCircle as AccountCircleIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    AddCard as AddCardIcon,
    Book as BookIcon,
    Support as SupportIcon,
    ExitToApp as ExitToAppIcon,
    List as ListIcon,
    Description as FormIcon,
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import axios from "axios"; // Import Axios for API calls
import { getUserLoggedIn, isAdministrator } from "../../utils/authUtils";

const ProfileMenu = ({ onLogout = () => {} }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [navItems, setNavItems] = useState([]);
    const [userName, setUserName] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [shouldUpdatePhoto, setShouldUpdatePhoto] = useState(false);
    const navigate = useNavigate();
    const fallbackProfilePhoto = "/path/to/default-profile-photo.png"; // Fallback image

    useEffect(() => {
        const username = getUserLoggedIn();
        const adminStatus = isAdministrator();
        setUserName(username);

        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;
                //console.log("User ID:", userId); // Log to confirm userId is correct
                fetchProfilePhoto(userId);
            } catch (error) {
                console.error("Error decoding the token:", error);
            }
        }

        setNavItems(
            adminStatus
                ? [
                      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
                      { text: "Profile", icon: <PersonIcon />, path: "/profile" },
                      { text: "Courses", icon: <BookIcon />, path: "/adm-courses" },
                      { text: "Add Courses", icon: <AddCardIcon />, path: "/adm-add-courses" },
                      { text: "Add Users", icon: <PersonAddIcon />, path: "/signup" },
                      { text: "Student List", icon: <ListIcon />, path: "/student-list" },
                      { text: "Forms", icon: <FormIcon />, path: "/forms" },
                      { text: "Logout", icon: <ExitToAppIcon />, path: "/logout" },
                  ]
                : [
                      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
                      { text: "Profile", icon: <PersonIcon />, path: "/profile" },
                      { text: "My Courses", icon: <BookIcon />, path: "/my-courses" },
                      { text: "Add Courses", icon: <AddCardIcon />, path: "/add-courses" },
                      { text: "Contact Support", icon: <SupportIcon />, path: "/contact-support" },
                      { text: "Logout", icon: <ExitToAppIcon />, path: "/logout" },
                  ]
        );
    }, []);

    const fetchProfilePhoto = async (userId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            //console.log("Profile Photo Response Data:", JSON.stringify(response.data, null, 2)); // Logs the response for inspection
    
            // Access the profile photo URL
            const profilePhoto = response.data.data.user?.profilePhoto;
    
            if (profilePhoto) {
                //console.log("Profile Photo Path:", profilePhoto); // Log the photo path
                setProfilePhoto(profilePhoto);  // Set the profile photo
            } else {
                setProfilePhoto(fallbackProfilePhoto); // Fallback if no photo is found
            }
        } catch (error) {
            console.error("Error fetching profile photo:", error.response || error);
            setProfilePhoto(fallbackProfilePhoto); // Fallback in case of error
        }
    };
    
    
    
    
    

    const handleDrawerOpen = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);

    const handleNavigation = (path) => {
        if (path === "/logout") {
            localStorage.removeItem("token");
            onLogout();
            navigate("/home");
        } else {
            navigate(path);
        }
        handleDrawerClose();
    };

    const list = () => (
        <List>
            {navItems.map((item) => (
                <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItem>
            ))}
        </List>
    );

    useEffect(() => {
        if (profilePhoto === "" && !shouldUpdatePhoto) {
            setShouldUpdatePhoto(true);
        }
    }, [profilePhoto]);

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                onMouseEnter={handleDrawerOpen}
            >
                {profilePhoto ? (
                    <Avatar
                        src={`${process.env.REACT_APP_SERVER_URL}${profilePhoto}`}
                        alt="Profile Photo"
                        sx={{ width: 40, height: 40, margin: "0 auto", marginTop: 1, borderRadius: "50%" }}
                    />
                ) : (
                    <IconButton edge="end" color="inherit" aria-label="profile-menu">
                        <AccountCircleIcon />
                    </IconButton>
                )}
                <Typography variant="body2" color="inherit">
                    {userName}
                </Typography>
            </Box>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                PaperProps={{
                    sx: { width: 300 },
                    onMouseLeave: handleDrawerClose,
                }}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <div onMouseEnter={handleDrawerOpen}>{list()}</div>
            </Drawer>
        </>
    );
};

export default ProfileMenu;
