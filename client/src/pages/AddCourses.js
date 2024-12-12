import React, { useState, useEffect } from "react";
import { Container, Grid, Card, CardContent, Typography, Box, Button, Modal } from "@mui/material";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import TermSelect from "../components/term-select/TermSelect";
import SearchBox from "../components/search-box/SearchBox";
import axios from "axios";
import dayjs from "dayjs";
import { getUserIdFromToken, getUserLoggedIn } from "../utils/authUtils";

function AddCourses() {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTerm, setFilterTerm] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [programsData, setProgramsData] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userProgram, setUserProgram] = useState("");
    const [courses, setCourses] = useState([]);

    const loggedInUsername = getUserLoggedIn();
    console.log("Logged in username:", loggedInUsername);

    useEffect(() => {
        const fetchProgramsData = async () => {
            try {
                console.log("Fetching programs data");
                const programsResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/programs`);
                console.log("Fetched programs data 0:", programsResponse.data.data);
                setProgramsData(programsResponse.data.data);
            } catch (error) {
                console.error("Error fetching programs data:", error);
            }
        };

        const fetchUserData = async () => {
            try {
                const userId = getUserIdFromToken();
                console.log("Fetching user data for user ID:", userId);
                const userResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`);
                const user = userResponse.data.data.user;
                console.log("Fetched user data:", user);
                setLoggedInUser(user);
                setUserProgram(user.program);
                setSelectedCourses(user.courses.map((course) => course.code));
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchProgramsData();
        fetchUserData();
    }, []);

    useEffect(() => {
        console.log("User program:", userProgram);
        console.log("Programs data:", programsData);
        if (userProgram && programsData.length > 0) {
            const program = programsData.find((p) => p.name === userProgram);
            console.log("Found program:", program);
            if (program) {
                setCourses(program.courses);
                console.log("Set courses for program:", program.courses);
            }
        }
    }, [userProgram, programsData]);

    const handleAddCourse = async (course) => {
        console.log("Attempting to add course:", course);

        // Check if the user already has 5 courses
        if (selectedCourses.length >= 5) {
            console.log("Maximum courses exceeded");
            setOpenModal(true);
            return;
        }

        // Check if the course is already added
        if (selectedCourses.includes(course.code)) {
            console.log("Course already added:", course.name);
            return;
        }

        try {
            // Fetch the user data to perform validations
            const userId = getUserIdFromToken();
            const userResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`);
            const user = userResponse.data.data.user;

            // Check if the user exists
            if (!user) {
                console.error("User not found");
                return;
            }

            // Check if the course already exists in the user's courses
            if (user.courses.some((c) => c.code === course.code)) {
                console.error("Course already exists in the user's courses");
                return;
            }

            // Check if the user can have more courses
            if (user.courses.length >= 5) {
                console.error("User can have a maximum of 5 courses");
                setOpenModal(true);
                return;
            }

            // Fetch the program data to find the course
            const programResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/programs`);
            const programs = programResponse.data.data;
            const program = programs.find((p) => p.courses.some((c) => c.code === course.code));

            // Check if the program exists
            if (!program) {
                console.error("Course not found in any program");
                return;
            }

            // Find the course in the program
            const programCourse = program.courses.find((c) => c.code === course.code);
            if (!programCourse) {
                console.error("Course not found in the program");
                return;
            }

            // Add the course to the user's courses
            const updatedCourses = [...selectedCourses, course.code];
            setSelectedCourses(updatedCourses);
            console.log("Updated selected courses:", updatedCourses);

            await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${loggedInUser._id}/courses?courseCode=${course.code}`);

            // Update the seatsAvailable for the course in the program
            const updatedCourseData = { seatsAvailable: programCourse.seatsAvailable - 1 };
            console.log("Updated course data:", updatedCourseData);
            const token = localStorage.getItem("token");
            console.log("PATCH URL:", `${process.env.REACT_APP_SERVER_URL}/api/v1/courses/${programCourse._id}?programCode=${program.code}`);
            const patchResponse = await axios.patch(`${process.env.REACT_APP_SERVER_URL}/api/v1/courses/${programCourse._id}?programCode=${program.code}`, updatedCourseData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (patchResponse.status === 200) {
                // Update the local state to reflect the change in seatsAvailable
                const updatedProgramsData = programsData.map((p) => {
                    if (p._id === program._id) {
                        return {
                            ...p,
                            courses: p.courses.map((c) => {
                                if (c._id === programCourse._id) {
                                    return { ...c, seatsAvailable: updatedCourseData.seatsAvailable };
                                }
                                return c;
                            }),
                        };
                    }
                    return p;
                });

                setProgramsData(updatedProgramsData);
                console.log("Updated programs data:", updatedProgramsData);
            }

            console.log(`Course added: ${course.name}`);
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    const getFilteredCourses = () => {
        console.log("Filtering courses with search term:", searchTerm, "and filter term:", filterTerm);
        return courses.filter(
            (course) =>
                (course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.code.toLowerCase().includes(searchTerm.toLowerCase())) && (filterTerm ? course.term === filterTerm : true)
        );
    };

    const filteredCourses = getFilteredCourses();
    console.log("Filtered courses:", filteredCourses);

    return (
        <Container sx={{ padding: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar rightMenu={<ProfileMenu />} />
            <Typography variant="h4" gutterBottom sx={{ textAlign: "center", marginTop: "20px", color: "#34405E" }}>
                {loggedInUsername ? `${userProgram} Courses` : "Add Courses"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <TermSelect term={filterTerm} setTerm={setFilterTerm} />
                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </Box>
            <Box sx={{ flexGrow: 1, mt: 2, overflowY: "auto" }}>
                <Grid container spacing={3}>
                    {Array.isArray(filteredCourses) && filteredCourses.length > 0 ? (
                        filteredCourses.map((course, index) => {
                            const isCourseAdded = selectedCourses.includes(course.code);
                            return (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Card
                                        sx={{
                                            backgroundColor: "#ffffff", 
                                            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
                                            transition: "transform 0.3s ease",
                                            "&:hover": { transform: "translateY(-10px)", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" },
                                            border: isCourseAdded ? "2px solid 0px 4px 20px rgba(0, 0, 0, 0.1)" : "none",
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                                                <Typography variant="h5" sx={{ textAlign: "center", color: "#34405E" }}>
                                                    {course.name} ({course.code})
                                                </Typography>
                                            </Box>
                                            <Grid container>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Credits:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">{course.credits}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Prerequisites:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">{course.prerequisites}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Term:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">{course.term}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Dates:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">
                                                        {dayjs(course.startDate).format("YYYY-MM-DD")} - {dayjs(course.endDate).format("YYYY-MM-DD")}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Time:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">
                                                        {course.time} on {course.days}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Campus:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">{course.campus}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                        Delivery Mode:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">{course.deliveryMode}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body1"sx={{ fontWeight: 500 }}>
                                                       Seats Available:
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography variant="body1">
                                                        {course.seatsAvailable} / {course.classSize}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mr: 1 }}>
                                                <Button variant="contained" color={isCourseAdded ? "secondary" : "primary"} onClick={() => handleAddCourse(course)} disabled={isCourseAdded}>
                                                    {isCourseAdded ? "Enrolled" : "Add Course"}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="body1" sx={{ textAlign: "center", marginTop: 2 }}>
                                No courses available for your program.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
                    <Typography variant="h6" component="h2">
                        Maximum Courses Exceeded
                    </Typography>
                    <Typography sx={{ mt: 2 }}>You have exceeded the maximum of 5 courses to be enrolled.</Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button onClick={() => setOpenModal(false)} variant="contained" color="primary">
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
}

export default AddCourses;
