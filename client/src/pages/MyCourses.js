import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import { Container, Typography, Box, Grid, Card, CardContent, Button, ListItemText } from "@mui/material";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          setErrorMessage("No token found.");
          return;
        }

        const decodedToken = jwtDecode(token);  
        const userId = decodedToken.id; 

        console.log("Decoded User ID:", userId);

        // get courses using token and userId
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const courses = response.data.data.courses || [];
        setMyCourses(courses);

        // Compute total credits
        const total = courses.reduce((sum, course) => sum + course.credits, 0);
        setTotalCredits(total);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setErrorMessage("Failed to fetch courses. Please try again later.");
      }
    };

    fetchCourses();
  }, []);

  const handleRemoveCourse = async (courseCode) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No token found.");
        return;
      }
  
      const decodedToken = jwtDecode(token);  
      const userId = decodedToken.id; 
  
      console.log("Course Code:", courseCode);
  
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}/courses?courseCode=${courseCode}`,  
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
  
      // Check if the response is successful
      if (response.status === 200) {
        // Refresh the course list
        setMyCourses((prevCourses) => prevCourses.filter((course) => course.code !== courseCode));
        // Recompute total credits
        setTotalCredits((prevTotal) =>
          prevTotal - myCourses.find((course) => course.code === courseCode)?.credits || 0
        );
      }
  
    } catch (error) {
      console.error("Error removing course:", error);
      setErrorMessage("Failed to remove course. Please try again.");
    }
  };
  
  
  
  return (
    <Container>
      <Navbar rightMenu={<ProfileMenu />} />
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", marginTop: "20px", color: "#34405E" }}>
        My Courses
      </Typography>
      <Typography variant="h6" sx={{ textAlign: "center", marginBottom: "20px", color: "#34405E" }}>
        Total Credits: {totalCredits} {/* Display total credits */}
      </Typography>
      {myCourses.length > 0 ? (
        <Box>
          <Grid container spacing={3}>
            {myCourses.map((course, index) => (
              <Grid item xs={12} sm={6} key={index}>
                {" "}
                {/* Use xs=12 and sm=6 for 2x2 layout */}
                <Card
                  variant="outlined"
                  sx={{
                    marginBottom: "16px",
                    backgroundColor: "#f5f5f5",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ textAlign: "center", color: "#34405E" }}>
                      {`${course.name} (${course.code})`}
                    </Typography>
                    <ListItemText
                      primary={
                        <>
                          <Grid container>
                            <Grid item xs={4}>
                              <Typography variant="body1">
                                <strong>Credits:</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">{course.credits}</Typography>
                            </Grid>

                            <Grid item xs={4}>
                              <Typography variant="body1">
                                <strong>Term:</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">{course.term}</Typography>
                            </Grid>

                            <Grid item xs={4}>
                              <Typography variant="body1">
                                <strong>Dates:</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">
                                {course.startDate} - {course.endDate}
                              </Typography>
                            </Grid>

                            <Grid item xs={4}>
                              <Typography variant="body1">
                                <strong>Time:</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">
                                {course.time} on {course.days}
                              </Typography>
                            </Grid>

                            <Grid item xs={4}>
                              <Typography variant="body1">
                                <strong>Campus:</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">{course.campus}</Typography>
                            </Grid>

                            <Grid item xs={4}>
                              <Typography variant="body1">
                                <strong>Delivery Mode:</strong>
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body1">{course.deliveryMode}</Typography>
                            </Grid>
                          </Grid>
                        </>
                      }
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mr: 1 }}>
                      <Button variant="contained" color="primary" onClick={() => handleRemoveCourse(course.code)}>
                        Remove
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center", marginTop: 2 }}>
          No courses added yet.
        </Typography>
      )}
    </Container>
  );
}

export default MyCourses;
