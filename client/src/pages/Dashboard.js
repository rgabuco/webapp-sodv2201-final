import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    IconButton,
    Modal,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import DeleteIcon from "@mui/icons-material/Delete";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import PersonIcon from "@mui/icons-material/Person";
import { Gauge } from "@mui/x-charts";
import axios from "axios";
import { getUserIdFromToken } from "../utils/authUtils"; // Import the getUserLoggedIn function
import { jwtDecode } from "jwt-decode";

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
    const [openModal, setOpenModal] = useState(false); // To control modal visibility
    const [selectedEvent, setSelectedEvent] = useState(null); // To store the event details
    const [, setErrorMessage] = useState("");

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

                        //console.log("Token from localStorage:", token);

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
                                const students = storedUsers.filter(user => !user.isAdmin);

                                const studentEnrollmentData = students.map(student => ({
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
                        //console.log("Events from the server:", eventsResponse.data);
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

    const generateCourseSchedule = courses => {
        const schedule = {};
        courses.forEach(course => {
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

    const handleDateChange = date => {
        setValue(dayjs(date));
    };

    const handleEditEvent = event => {
        console.log("Editing event:", event); // Log the event to verify
        setEditingEvent(event);
        setEventDate(dayjs(event.eventDate));
        setEventName(event.eventName);
    };

    const handleSaveEvent = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const updatedEvent = {
                eventName: eventName,
                eventDate: eventDate.toISOString(), // Make sure to format the date correctly
                username: loggedInUser.username, // Assuming this is available in your state
            };

            // Debugging: Log the URL and headers
            const url = `${process.env.REACT_APP_SERVER_URL}/api/v1/events/${editingEvent._id}`;
            console.log("PATCH Request URL:", url);
            console.log("Editing event ID:", editingEvent._id);

            // Send the PATCH request with Authorization header
            const response = await axios.patch(url, updatedEvent, { headers });

            if (response.status === 200) {
                console.log("Event updated successfully:", response.data);

                // Update the state with the updated event
                setUpcomingEvents(prevEvents => {
                    const updatedEvents = prevEvents.map(event => (event._id === editingEvent._id ? response.data.data : event));
                    return updatedEvents;
                });

                // Optionally reset the form
                setEditingEvent(null);
                setEventName("");
                setEventDate(null);
            } else {
                console.error("Unexpected response when updating event:", response);
            }
        } catch (error) {
            console.error("Error updating event:", error.response?.data?.message || error.message);
            alert("There was an issue updating the event. Please try again.");
        }
    };

    const handleDeleteEvent = async eventId => {
        try {
            const token = localStorage.getItem("token"); // Ensure token is retrieved from localStorage

            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            // Send the DELETE request with Authorization header
            const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/v1/events/${eventId}`, { headers });

            if (response.status === 200) {
                console.log("Event deleted successfully");

                // Update the state to remove the deleted event
                setUpcomingEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
            } else {
                console.error("Unexpected response when deleting event:", response);
            }
        } catch (error) {
            console.error("Error deleting event:", error.response?.data?.message || error.message);
            alert("There was an issue deleting the event. Please try again.");
        }
    };

        // The function you need to define
        const handleEventClick = (event) => {
          setSelectedEvent(event); // Set the selected event
          setOpenModal(true); // Open the modal
      };

    const handleAddEvent = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            const user = jwtDecode(token);
            const username = user.username;

            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/v1/events`,
                {
                    eventName: eventName,
                    eventDate: eventDate.toISOString(),
                    username: username,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("API Response:", response.data);

            // Extract the event from the API response
            const newEvent = response.data.data; // Corrected to access `data` property
            if (!newEvent) {
                console.error("Undefined event:", newEvent);
                return;
            }

            // Update the state with the new event
            setUpcomingEvents(prevEvents => {
                const updatedEvents = [...prevEvents, newEvent];
                console.log("Updated upcoming events:", updatedEvents);
                return updatedEvents;
            });

            // Optionally reset form fields
            setEventName("");
            setEventDate(null);
        } catch (error) {
            console.error("Error adding event:", error.response?.data?.message || error.message);
        }
    };

    const getEventsForDate = date => {
        const dateString = date.format("YYYY-MM-DD");
        return upcomingEvents
            .filter(event => event && event.eventDate) // Filter out undefined or malformed events
            .filter(event => {
                const eventDate = dayjs(event.eventDate).format("YYYY-MM-DD"); // Format the event date
                return eventDate === dateString;
            });
    };

    const selectedEvents = getEventsForDate(value);

    const getStatusColor = status => {
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

    const enrolledCount = studentsData.filter(student => student.coursesCount > 0).length;
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
                    <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <Paper elevation={3} sx={{ display: "flex", flexDirection: "row", padding: 2, width: "100%" }}>
                            {/* Calendar */}
                            <Box sx={{ width: "50%" }}>
                                <Typography variant="h6" sx={{ mb: 1, fontSize: "1rem", textAlign: "center" }}>
                                    Calendar
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <Calendar onChange={handleDateChange} value={value.toDate()} sx={{ width: "100%" }} />
                                </Box>
                            </Box>

                            {/* Events List */}
                            <Box sx={{ width: "50%" }}>
                                <Typography variant="h6" sx={{ mb: 1, fontSize: "1rem", textAlign: "center" }}>
                                    Events on {dayjs(value).format("MMM DD, YYYY")}
                                </Typography>
                                <Box
                                    sx={{
                                        padding: 1,
                                        textAlign: "center",
                                        overflowY: "auto", // This allows scrolling when content overflows
                                        maxHeight: "300px", // Set a maxHeight to control when the scrollbar appears
                                    }}
                                >
                                    {selectedEvents.length > 0 ? (
                                        selectedEvents
                                            .sort((a, b) => {
                                                const dateA = dayjs(a.eventDate);
                                                const dateB = dayjs(b.eventDate);
                                                if (dateA.isBefore(dateB)) return -1; // a comes before b
                                                if (dateA.isAfter(dateB)) return 1; // b comes before a
                                                return 0; // if dates are equal, maintain original order
                                            })
                                            .map((event, index) => (
                                                <div key={index}>
                                                    {event.eventName} at {dayjs(event.eventDate).format("HH:mm")}
                                                </div>
                                            ))
                                    ) : (
                                        <Typography variant="body2" sx={{ fontSize: "0.7rem", textAlign: "center" }}>
                                            No events
                                        </Typography>
                                    )}
                                </Box>
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
            height: "450px", // Allow the paper to expand vertically if needed
            display: "flex",
            flexDirection: "column",
        }}
    >
        <Typography variant="h6" sx={{ mb: 1, fontSize: "0.8rem", textAlign: "center" }}>
            Upcoming Events
        </Typography>

        {/* Scrollable container for events */}
        <Box
            sx={{
                flexGrow: 1,
                overflowY: "auto", // Enable vertical scrolling
                maxHeight: loggedInUser?.isAdmin ? "250px" : "calc(100% - 70px)", // If Admin, limit height, else take available space
                width: "100%", // Ensure Box takes full width
            }}
        >
            {upcomingEvents.length > 0 ? (
                <Grid container spacing={1} sx={{ flexWrap: "wrap", overflow: "hidden" }}>
                    {upcomingEvents.map(event => {
                        if (!event) {
                            console.error("Undefined event:", event); // Log undefined events
                            return null; // Skip undefined events
                        }
                        // Format the event date using dayjs
                        const formattedDate = dayjs(event.eventDate).format("MM-DD-YYYY [at] HH:mm");

                        // Calculate speed for scrolling animation dynamically
                        const calculateSpeed = textLength => Math.max(textLength / 5, 10);

                        return (
                            <Grid item xs={12} sm={6} md={4} key={event._id}>
                                <Chip
                                    label={
                                        <Box>
                                            {/* Scrolling text for the event name */}
                                            <Box
                                                sx={{
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    width: "100%",
                                                    height: "1.2rem",
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        display: "inline-block",
                                                        position: "absolute",
                                                        whiteSpace: "nowrap",
                                                        animation: `scroll ${calculateSpeed(event.eventName.length)}s linear infinite`,
                                                    }}
                                                >
                                                    {event.eventName}
                                                </Typography>
                                                <style>
                                                    {`
                                                    @keyframes scroll {
                                                        0% {
                                                            transform: translateX(100%);
                                                        }
                                                        100% {
                                                            transform: translateX(-100%);
                                                        }
                                                    }
                                                    `}
                                                </style>
                                            </Box>
                                            {/* Static formatted date */}
                                            <Typography
                                                variant="body2"
                                                sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                                            >
                                                {formattedDate}
                                            </Typography>
                                        </Box>
                                    }
                                    variant="outlined"
                                    color="primary"
                                    sx={{
                                        fontSize: "0.5rem",
                                        borderRadius: "16px",
                                        maxWidth: "400px", // Control the width of the chip
                                        width: "100%", // Ensure chip uses full width of its container
                                        marginBottom: "8px", // Add space between rows of chips
                                        marginRight: "8px", // Add space between chips horizontally
                                    }}
                                    onClick={() => {
                                        if (!loggedInUser?.isAdmin) {
                                            handleEventClick(event); // Non-admin users trigger the modal
                                        } else {
                                            handleEditEvent(event); // Admin users trigger the edit action
                                        }
                                    }}
                                    deleteIcon={
                                        loggedInUser?.isAdmin ? (
                                            <IconButton size="small" onClick={() => handleDeleteEvent(event._id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        ) : null // Hide delete icon for non-admin users
                                    }
                                    onDelete={loggedInUser?.isAdmin ? () => handleDeleteEvent(event._id) : undefined} // Disable delete action for non-admin
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Typography variant="body2" sx={{ fontSize: "1rem", textAlign: "center" }}>
                    No upcoming events.
                </Typography>
            )}
        </Box>

        {/* Add/Edit Event Form for Admin */}
        {loggedInUser?.isAdmin && (
            <>
                <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                    {editingEvent ? "Edit Event" : "Add Event"}
                </Typography>

                <DateTimePicker
                    label="Event Date"
                    value={eventDate}
                    onChange={setEventDate}
                    textField={<TextField fullWidth />}
                />
                <TextField
                    label="Event Name"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    sx={{ mt: 2, width: "100%" }}
                />
                <Button variant="contained" onClick={editingEvent ? handleSaveEvent : handleAddEvent} sx={{ mt: 1 }}>
                    {editingEvent ? "Save Event" : "Add Event"}
                </Button>
            </>
        )}
    </Paper>
</Grid>

{/* Modal for event details */}
<Dialog open={openModal} onClose={() => setOpenModal(false)}>
    <DialogTitle>{selectedEvent?.eventName}</DialogTitle>
    <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedEvent?.eventDescription} {/* Display event description */}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Date: {dayjs(selectedEvent?.eventDate).format("MM-DD-YYYY [at] HH:mm")}
        </Typography>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenModal(false)}>Close</Button>
    </DialogActions>
</Dialog>

                </Grid>

                {/* User Details Section */}
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
                                    <Typography variant="body1">Student ID: {loggedInUser?.studentID}</Typography>
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
                                            {loggedInUser.courses.map(course => (
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
