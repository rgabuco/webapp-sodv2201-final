import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Grid, List, ListItem, Button, Chip, IconButton, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from "@mui/material";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import PersonIcon from "@mui/icons-material/Person";
import { Gauge } from "@mui/x-charts";
import axios from "axios";
import { getUserIdFromToken } from "../utils/authUtils"; // Import the getUserLoggedIn function

function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [status, setStatus] = useState("Not Enrolled");
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [, setCourseSchedule] = useState({});
    const [value, setValue] = useState(dayjs());
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventDate, setEventDate] = useState(dayjs());
    const [eventName, setEventName] = useState("");
    const [studentsData, setStudentsData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const isBrowser = typeof window !== "undefined"; // Check for browser context

        if (isBrowser) {
            const checkStorageAccess = () => {
                try {
                    // Try setting and getting a test value from localStorage to ensure it's available
                    const testKey = "testKey";
                    localStorage.setItem(testKey, "testValue");
                    localStorage.removeItem(testKey); // Clean up
                    return true; // Storage is accessible
                } catch (error) {
                    console.error("Error accessing localStorage:", error);
                    return false; // Storage is not accessible
                }
            };

            // Check if storage is accessible before proceeding
            if (checkStorageAccess()) {
                const fetchUser = async () => {
                    try {
                        // Safely attempt to get the token from localStorage
                        let token;
                        try {
                            token = localStorage.getItem("token");
                        } catch (err) {
                            console.error("Error accessing localStorage:", err);
                            setErrorMessage("Storage access error. Please check your browser settings.");
                            return;
                        }

                        console.log("Token from localStorage:", token);

                        if (!token) {
                            console.error("No token found. Please log in.");
                            setErrorMessage("No token found. Please log in.");
                            return;
                        }

                        // Assuming you have a function to extract userId from the token
                        const userId = getUserIdFromToken(token); // Make sure you pass the token here if needed.

                        // Fetch the user details
                        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${userId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        const currentUser = response.data.data.user;

                        if (currentUser) {
                            setLoggedInUser(currentUser);

                            if (currentUser.isAdmin === true) {
                                setStatus("Admin");

                                // Fetch students if the current user is an admin
                                const studentsResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });

                                const storedUsers = studentsResponse.data.data.users;
                                const students = storedUsers.filter((user) => !user.isAdmin);

                                const studentEnrollmentData = students.map((student) => ({
                                    name: student.firstName + " " + student.lastName,
                                    id: student._id,
                                    program: student.program,
                                    department: student.department,
                                    coursesCount: student.courses.length,
                                }));

                                setStudentsData(studentEnrollmentData);
                            } else {
                                // For non-admin users
                                currentUser.courses = currentUser.courses || [];
                                if (currentUser.courses.length > 0) {
                                    setStatus("Enrolled");
                                    generateCourseSchedule(currentUser.courses);
                                } else {
                                    setStatus("Not Enrolled");
                                }
                            }
                        }

                        // Fetch events from the database
                        const eventsResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/events`);
                        console.log("Events from the server:", eventsResponse.data);
                        if (!eventsResponse.data.data?.events) {
                            console.log("No events found.");
                            setUpcomingEvents([]);
                        } else {
                            setUpcomingEvents(eventsResponse.data.data.events);
                        }
                    } catch (error) {
                        console.error("Error fetching user or events:", error);
                        setErrorMessage("Failed to load data. Please try again later.");
                    }
                };

                // Fetch user details and events when the component mounts
                fetchUser();
            } else {
                setErrorMessage("LocalStorage is not accessible. Please check your browser settings or try in a non-incognito window.");
            }
        } else {
            setErrorMessage("This environment does not support LocalStorage.");
        }
    }, []); // The empty dependency array ensures it only runs once on mount

    const generateCourseSchedule = (courses) => {
        const schedule = {};
        courses.forEach((course) => {
            const courseStartDate = new Date(course.startDate);
            const courseEndDate = new Date(course.endDate);
            for (let d = courseStartDate; d <= courseEndDate; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split("T")[0];
                if (!schedule[dateString]) {
                    schedule[dateString] = [];
                }
                schedule[dateString].push(course.name);
            }
        });
        setCourseSchedule(schedule);
    };

    const handleDateChange = (date) => {
        setValue(dayjs(date));
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEventDate(dayjs(event.date));
        setEventName(event.event);
    };

    const handleSaveEvent = async () => {
        if (editingEvent) {
            try {
                const response = await axios.patch(`${process.env.REACT_APP_SERVER_URL}/api/v1/events/${editingEvent._id}`, { name: eventName, datetime: eventDate.toISOString() });
                setUpcomingEvents((prevEvents) => prevEvents.map((event) => (event._id === editingEvent._id ? response.data.event : event)));
            } catch (error) {
                console.error("Error editing event:", error);
            }
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/v1/events/${eventId}`);
            setUpcomingEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    // Function to handle adding the event
    const handleAddEvent = async () => {
        try {
            const token = localStorage.getItem("token"); // Get the token from localStorage

            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            // Format eventDate using dayjs
            const formattedEventDate = eventDate.format("YYYY-MM-DDTHH:mm:ssZ");

            // Send a POST request to add the event
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/v1/events`, // The server API endpoint
                {
                    name: eventName, // Event name
                    date: formattedEventDate, // Use the formatted date
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );

            console.log("Event added successfully:", response.data);
            setUpcomingEvents((prevEvents) => [...prevEvents, response.data.event]); // Update state
        } catch (error) {
            console.error("Error adding event:", error.response?.data?.message || error.message);
        }
    };

    const getEventsForDate = (date) => {
        const dateString = date.format("YYYY-MM-DD");
        return upcomingEvents.filter((event) => event.date === dateString);
    };

    const selectedEvents = getEventsForDate(value);

    const getStatusColor = (status) => {
        switch (status) {
            case "Enrolled":
                return "green";
            case "Not Enrolled":
                return "red";
            case "Admin":
                return "blue";
            default:
                return "black";
        }
    };

    const enrolledCount = studentsData.filter((student) => student.coursesCount > 0).length;
    const totalStudentsCount = studentsData.length; // Total number of students
    const totalEventsRegistered = upcomingEvents.length; // Count of registered events

    return (
        <div>
            <Navbar rightMenu={<ProfileMenu />} />

            <Container maxWidth="lg" sx={{ mt: 5, color: "#34405E" }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: "center" }}>
                    Dashboard
                </Typography>
                {/* Centered Calendar and Upcoming Events Section */}
                <Grid container spacing={2} justifyContent="center" sx={{ mb: 0.5 }}>
                    {/* Calendar Section */}
                    <Grid item xs={12} sm={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 0.5,
                                maxWidth: 650,
                                width: "100%",
                                height: "400px", // Set a fixed height for the entire section
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between", // Distribute space between the title, calendar, and events list
                                alignItems: "center",
                            }}
                        >
                            {/* Title */}
                            <Typography variant="h6" sx={{ mb: 1, fontSize: "0.8rem", textAlign: "center" }}>
                                Course Schedule
                            </Typography>

                            {/* Calendar Section */}
                            <Box
                                sx={{
                                    width: "100%",
                                    flexGrow: 1, // Allow the calendar to grow and fill available space
                                    display: "flex",
                                    justifyContent: "center", // Center horizontally
                                    alignItems: "center", // Center vertically
                                }}
                            >
                                <Calendar onChange={handleDateChange} value={value.toDate()} sx={{ width: "100%", height: "auto" }} />
                            </Box>

                            {/* Events List */}
                            <Typography variant="subtitle1" sx={{ mt: 1, fontSize: "0.75rem", textAlign: "center" }}>
                                Events on {value.format("YYYY D, MMMM")}:
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                {selectedEvents.length > 0 ? (
                                    <List dense>
                                        {selectedEvents.map((event, index) => (
                                            <ListItem key={index} sx={{ padding: 0 }}>
                                                <Typography variant="body2" sx={{ fontSize: "1rem", textAlign: "center" }}>
                                                    {event.event} at {event.time}
                                                </Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" sx={{ fontSize: "0.7rem", textAlign: "center" }}>
                                        No events
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Upcoming Events Section */}
                    <Grid item xs={12} sm={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 0.5,
                                maxWidth: 650,
                                width: "100%",
                                height: "400px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1, fontSize: "0.8rem", textAlign: "center" }}>
                                Upcoming Events
                            </Typography>

                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <Grid item key={event._id}>
                                        <Chip
                                            label={`${event.date}: ${event.name}`}
                                            variant="outlined"
                                            color="primary"
                                            sx={{ fontSize: "0.7rem", borderRadius: "16px" }}
                                            deleteIcon={
                                                loggedInUser?.isAdmin ? (
                                                    <IconButton size="small" onClick={() => handleDeleteEvent(event._id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                ) : null
                                            }
                                            onDelete={loggedInUser?.isAdmin ? () => handleDeleteEvent(event._id) : () => {}}
                                            onClick={() => loggedInUser?.isAdmin && handleEditEvent(event)}
                                        />
                                    </Grid>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ fontSize: "1rem", textAlign: "center" }}>
                                    No upcoming events.
                                </Typography>
                            )}

                            {loggedInUser?.isAdmin && (
                                <>
                                    <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                                        Add/Edit Event
                                    </Typography>
                                    <DateTimePicker label="Event Date" value={eventDate} onChange={setEventDate} textField={<TextField fullWidth />} />

                                    <TextField label="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} sx={{ mt: 2, width: "100%" }} />
                                    <Button variant="contained" onClick={editingEvent ? handleSaveEvent : handleAddEvent} sx={{ mt: 1 }}>
                                        {editingEvent ? "Save Event" : "Add Event"}
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/*User Details Section*/}
                <Grid item xs={12}>
                    <Paper sx={{ padding: 3, mt: 2 }}>
                        <Typography variant="h6">
                            <PersonIcon sx={{ marginRight: 1 }} />
                            User Details
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {/* Show only Name and Account Type for Admins */}
                            {loggedInUser?.isAdmin ? (
                                <>
                                    <Typography variant="body1">
                                        Name: {loggedInUser?.firstName} {loggedInUser?.lastName}
                                    </Typography>
                                    <Typography variant="body1">Account Type: Admin</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        Name: {loggedInUser?.firstName} {loggedInUser?.lastName}
                                    </Typography>
                                    <Typography variant="body1">Student ID: {loggedInUser?.id}</Typography>
                                    <Typography variant="body1">Program: {loggedInUser?.program}</Typography>
                                    <Typography variant="body1">Department: {loggedInUser?.department}</Typography>
                                    <Typography variant="body1">Account Type: Student</Typography>
                                    <Typography variant="body1">
                                        Enrollment Status: <span style={{ color: getStatusColor(status) }}>{status}</span>
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {status === "Enrolled" && !loggedInUser?.isAdmin && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6">Courses Enrolled:</Typography>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Code</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Days</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loggedInUser.courses.map((course) => (
                                                <TableRow key={course.code}>
                                                    <TableCell>{course.code}</TableCell>
                                                    <TableCell>{course.name}</TableCell>
                                                    <TableCell>{course.days}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {loggedInUser?.isAdmin && studentsData.length > 0 && (
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, height: "200px" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%" }}>
                                    <Typography variant="body1">Enrolled Students</Typography>
                                    <Gauge
                                        value={enrolledCount}
                                        minvalue={0}
                                        maxvalue={studentsData.length}
                                        label={`Enrolled: ${enrolledCount}`}
                                        color="#4CAF50" // Green color for enrolled students
                                        sx={{ height: "100%" }} // Ensure Gauge takes full height
                                    />
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%" }}>
                                    <Typography variant="body1">Total Students</Typography>
                                    <Gauge
                                        value={totalStudentsCount}
                                        minvalue={0}
                                        maxvalue={studentsData.length}
                                        label={`Total Students: ${totalStudentsCount}`}
                                        color="warning" // Warning color for total students
                                        sx={{ height: "100%" }} // Ensure Gauge takes full height
                                    />
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%" }}>
                                    <Typography variant="body1">Total Events Registered</Typography>
                                    <Gauge
                                        value={totalEventsRegistered}
                                        minvalue={0}
                                        maxvalue={totalEventsRegistered} // Ensure maxvalue is set appropriately
                                        label={`Total Events Registered: ${totalEventsRegistered}`}
                                        color="info" // Info color for total courses
                                        sx={{ height: "100%" }} // Ensure Gauge takes full height
                                    />
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Container>
        </div>
    );
}

export default Dashboard;
