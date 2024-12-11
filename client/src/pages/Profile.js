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


  // Add the convertToBase64 function at the top
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
  const [selectedFile, setSelectedFile] = useState(null); // Step 1: Define selectedFile state
  const [profilePhoto, setProfilePhoto] = useState(null);  // <-- Add this state
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
  
        // Optionally, save profile photo in localStorage (if needed)
        if (userData.profilePhoto) {
          localStorage.setItem('profilePhoto', userData.profilePhoto);
        }
  
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
  

  const handleFileChange = async (event) => {
    if (!isEditing) return;
  
    const file = event.target.files[0];
    if (!file) return;
  
    // Set the selected file in state
    setSelectedFile(file);
  
    // Create FormData to send the file to the server
    const formData = new FormData();
    formData.append("profilePhoto", file);
  
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/users/${loggedInUser._id}/profile-photo`, 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      // Update the formData with the new profile photo URL from the response
      if (response.data && response.data.data && response.data.data.profilePhoto) {
        setFormData((prevState) => ({
          ...prevState,
          profilePhoto: response.data.data.profilePhoto, // New image URL from backend
        }));
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      setError("Error uploading profile photo.");
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
  const updateData = {};

  // Append updated fields to the updateData object
  Object.keys(formData).forEach((key) => {
    if (formData[key] !== originalFormData[key]) {
      updateData[key] = formData[key];
    }
  });

  // Check if any fields were updated
  if (Object.keys(updateData).length > 0) {
    try {
      // Send PATCH request to update profile fields
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_URL}/api/v1/users/${loggedInUser._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Profile fields updated:', response.data);
    } catch (error) {
      console.error('Error saving profile fields:', error);
    }
  }

  // If a profile photo was selected, upload it
  if (selectedFile) {
    const formData = new FormData();
    formData.append('profilePhoto', selectedFile);

    try {
      // Send POST request to update the profile photo
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/v1/users/${loggedInUser._id}/profile-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Profile photo uploaded:', response.data);
      // Optionally, update the formData with the new photo URL if needed
      setFormData((prevState) => ({
        ...prevState,
        profilePhoto: response.data.data.profilePhoto, // New photo URL
      }));
    } catch (error) {
      console.error('Error saving profile photo:', error);
    }
  }

  // After saving the profile and photo, exit editing mode
  setIsEditing(false); // Disable editing
  setOriginalFormData({ ...formData }); // Save the current form data as original
};




// Helper function to convert base64 string to Blob
const dataURLtoBlob = (dataURL) => {
  // Ensure dataURL starts with a valid data:image format
  if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(dataURL)) {
    console.error('Invalid data URL format:', dataURL);
    throw new Error('Invalid data URL format');
  }

  const byteString = atob(dataURL.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ua = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ua[i] = byteString.charCodeAt(i);
  }

  // Check the format of the image being passed and set the appropriate MIME type
  let mimeType = 'image/jpeg';  // Default type
  if (dataURL.startsWith('data:image/png')) {
    mimeType = 'image/png';
  } else if (dataURL.startsWith('data:image/gif')) {
    mimeType = 'image/gif';
  }

  return new Blob([ab], { type: mimeType });
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
                  src={`http://localhost:5000${formData.profilePhoto}`} //Full URL for the image
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
