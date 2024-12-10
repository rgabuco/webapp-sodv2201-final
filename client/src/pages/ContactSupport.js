import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Modal, Container, Card } from "@mui/material";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import axios from "axios";
import { checkUserLoggedIn, getUserLoggedIn } from "../utils/authUtils";
import { jwtDecode } from "jwt-decode";


function ContactSupport() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    message: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 



useEffect(() => {
  const fetchUserData = async () => {
    try {
      
      const isLoggedIn = checkUserLoggedIn();
      if (!isLoggedIn) {
        console.error("User is not logged in. Redirecting to login.");
        window.location.href = "/login"; 
        return;
      }

      
      const username = getUserLoggedIn(); 
      if (!username) {
        console.error("Username not found in authUtils.");
        return;
      }

      const token = localStorage.getItem("token"); 
      if (!token) {
        console.error("No token found. Redirecting to login.");
        window.location.href = "/login"; 
        return;
      }

      const decodedToken = jwtDecode(token); 
      const userId = decodedToken.id; 

      if (!userId) {
        console.error("User ID not found in token.");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      const user = response.data.data.user;

      setFormData((prev) => ({
        ...prev,
        username: user.username,
        email: user.email,
      }));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  fetchUserData();
}, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
  if (formData.message.length < 10) {
    setErrorMessage("Message must be greater than 10 characters.");
    setOpenModal(true);
    return; 
  }
  
    try {
      
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/v1/forms`, {
        username: formData.username,
        email: formData.email,
        message: formData.message,
      });
  
      console.log("Message Sent:", response.data);
  
      setFormData((prev) => ({ ...prev, message: "" }));
  
      
      setOpenModal(true);
      setErrorMessage(""); 
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Failed to send message. Please try again.");
    }
  };
  

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div>
      <Navbar rightMenu={<ProfileMenu />} />
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card
            sx={{
              p: 4,
              border: "1px solid rgba(0, 0, 0, 0.12)", // Outline
              boxShadow: 3, // Shadow
            }}
          >
            <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "#2B3C5E" }}>
              Contact Support
            </Typography>
            <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
              <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} margin="normal" required disabled placeholder={formData.username} />
              <TextField fullWidth label="User Email" name="email" value={formData.email} onChange={handleChange} margin="normal" required disabled placeholder={formData.email} />
              <TextField fullWidth label="Message" name="message" value={formData.message} onChange={handleChange} margin="normal" multiline rows={4} required />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: "100%" }}>
                Submit
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>

      <Modal open={openModal} onClose={handleCloseModal}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: 300, sm: 400, md: 500 }, 
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      p: 4,
    }}
  >
    <Typography variant="h6" component="h2">
      {errorMessage ? "Error" : "Message Sent"}
    </Typography>
    <Typography sx={{ mt: 2 }}>
      {errorMessage
        ? errorMessage
        : "Your message has been sent. Support will respond within 48 hours."}
    </Typography>
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
      <Button onClick={handleCloseModal} variant="contained" color="primary">
        Close
      </Button>
    </Box>
  </Box>
</Modal>

    </div>
  );
}

export default ContactSupport;
