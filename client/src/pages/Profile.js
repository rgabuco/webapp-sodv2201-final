import React, { useState, useEffect } from "react";
import { Container, Box, TextField, Button, Typography, Card, CardContent, CardActions, Avatar, CircularProgress } from "@mui/material";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import axios from "axios";
import { jwtDecode } from "jwt-decode";  // Updated import
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


function Profile() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); // New state to track loading
  const [error, setError] = useState(null); // New state to track errors
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    program: "",
    profilePhoto: "", 
  });

  const [originalFormData, setOriginalFormData] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false); // For success modal
  const [errorModalOpen, setErrorModalOpen] = useState(false);     // For error modal


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No token found.");
      return;
    }
  
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;  // Extract user ID from token
  
    if (!userId) {
      setError("User ID not found in token.");
      return;
    }
  
    // Fetch user data using the userId
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = response.data.data.user;
        setLoggedInUser(userData);
        setFormData(userData);
      } catch (error) {
        setError("Error fetching user data.");
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
  
    if (!file) return;
  
    // Check file size
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2 MB. Please upload a smaller file.");
      return;
    }
  
    // Show preview of the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profilePhoto: reader.result }); // Store the image as a base64 string
    };
    reader.readAsDataURL(file);
  
    // Prepare the file for upload
    const formDataToSend = new FormData();
    formDataToSend.append('profilePhoto', file); // Append the file to FormData
  
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id; // Extract user ID from token
  
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}/profile-photo`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const jsonData = await response.json(); // Parse JSON response directly
        setFormData({ ...formData, profilePhoto: jsonData.data.profilePhoto }); // Update the form data with the new photo URL
      } else {
        const errorText = await response.text(); // Read error text if response is not OK
        console.error("Error uploading photo:", errorText);
        alert('Error uploading photo. Please try again.');
      }
    } catch (err) {
      console.error("Error during photo upload:", err);
      alert('Error uploading photo. Please try again.');
    }
  };
  
  

// Store the original form data when editing starts
const handleEdit = () => {
  setOriginalFormData({ ...formData }); // Save the original data
  setIsEditing(true);
};

// Track changes to determine if the Save button should be enabled
const hasChanges = () => {
  if (!originalFormData) return false; // No changes if original data is not set
  // Check if any field has changed
  for (const key in originalFormData) {
    if (originalFormData[key] !== formData[key]) {
      return true; // A change is detected
    }
  }
  return false;
};


const handleSave = async () => {
  setLoading(true);
  setError(null);
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.id;

  const formDataToSend = new FormData();

  // Append regular form data
  Object.keys(formData).forEach(key => {
    if (key !== "profilePhoto") {
      formDataToSend.append(key, formData[key]);
    }
  });

  // Append the profile photo if exists
  if (formData.profilePhoto) {
    const photoBlob = dataURLtoBlob(formData.profilePhoto); // Convert the base64 image string to a Blob
    formDataToSend.append("profilePhoto", photoBlob);
  }

  try {
    // Use PATCH for updating user data
    await axios.patch(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`, formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setIsEditing(false); // Exit editing mode
    setOriginalFormData(formData); // Update original data to match saved data
    setSuccessModalOpen(true); // Open success modal
  } catch (error) {
    setError("Error saving user data.");
    setErrorModalOpen(true); // Open error modal
    console.error("Error saving user data:", error);
  } finally {
    setLoading(false);
  }
};

  
  // Helper function to convert base64 string to Blob
  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ua = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ua[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: 'image/jpeg' });  // Adjust type if necessary
  };
  
  
  
  

  return (
    <div>
      <Navbar rightMenu={<ProfileMenu />} />
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Card
            sx={{
              p: 4,
              border: "1px solid rgba(0, 0, 0, 0.12)", // Outline
              boxShadow: 3,
              mb: 4,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ color: "#34405E" }}>
                  Profile
                </Typography>
              </Box>
              {formData.profilePhoto && (
                <Avatar 
                  src={formData.profilePhoto} 
                  alt="Profile Photo" 
                  sx={{ width: 100, height: 100, margin: "0 auto", mb: 2, borderRadius: "50%" }} // Circular display
                />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={!isEditing} 
              />
              <TextField label="Username" name="username" value={formData.username} onChange={handleChange} fullWidth margin="normal" disabled />
              <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth margin="normal" required disabled={!isEditing} sx={{ color: "#34405E" }} />
              <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" required disabled={!isEditing} sx={{ color: "#34405E" }} />
              <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required disabled={!isEditing} sx={{ color: "#34405E" }} />
              <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" required disabled={!isEditing} sx={{ color: "#34405E" }} />
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                fullWidth
                margin="normal"
                disabled
                sx={{ backgroundColor: "grey.100", color: "#34405E" }} // Greyed out
              />
              <TextField
                label="Program"
                name="program"
                value={formData.program}
                fullWidth
                margin="normal"
                disabled
                sx={{ backgroundColor: "grey.100", color: "#34405E" }} // Greyed out
              />
            </CardContent>
            <CardActions>
              {loading ? (
                <CircularProgress />
              ) : (
                <>
{isEditing ? (
  <>
    <Button
      onClick={handleSave}
      variant="contained"
      color="primary"
      disabled={!hasChanges()} // Disable Save button if no changes
    >
      Save
    </Button>
    <Button onClick={() => setIsEditing(false)} variant="outlined">
      Cancel
    </Button>
  </>
) : (
  <Button onClick={handleEdit} variant="contained" color="primary">
    Edit
  </Button>
)}

                </>
              )}
            </CardActions>
          </Card>
          {error && <Typography color="error">{error}</Typography>} {/* Display error message */}
        </Box>
      </Container>

            {/* Success Modal */}
            <Dialog open={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Your profile has been updated successfully!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessModalOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={errorModalOpen} onClose={() => setErrorModalOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>There was an error saving your profile. Please try again later.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorModalOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Profile;
