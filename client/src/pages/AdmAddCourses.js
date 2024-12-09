import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import {
    Container,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Card,
    CardContent,
    CardActions,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Menu,
} from "@mui/material";
import axios from "axios";

function AdmAddCourses() {
    const [courseData, setCourseData] = useState({
        code: "",
        name: "",
        description: "",
        credits: "",
        prerequisites: "",
        term: "",
        startDate: "",
        endDate: "",
        time: "",
        days: "",
        campus: "Calgary",
        deliveryMode: "",
        seatsAvailable: "40",
        classSize: "40",
    });

    const [program, setProgram] = useState(""); // Initialize with an empty string
    const [programs, setPrograms] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [timeAnchorEl, setTimeAnchorEl] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [tempDays, setTempDays] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/programs`);
                setPrograms(response.data.data);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        fetchPrograms();
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setCourseData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDaysChange = e => {
        const { name, checked } = e.target;
        setTempDays(prevDays => {
            const newDays = checked ? [...prevDays, name] : prevDays.filter(day => day !== name);
            return newDays;
        });
    };

    const handleMenuOpen = event => {
        setTempDays(courseData.days.split(", ").filter(Boolean)); // Split the days string into an array
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleApplyDays = () => {
        setCourseData(prevData => ({
            ...prevData,
            days: tempDays.join(", "), // Join the array into a comma-separated string
        }));
        handleMenuClose();
    };

    const handleTimeMenuOpen = event => {
        setTimeAnchorEl(event.currentTarget);
    };

    const handleTimeMenuClose = () => {
        setTimeAnchorEl(null);
    };

    const handleApplyTime = () => {
        const formattedTime = `${startTime} - ${endTime}`;
        setCourseData(prevData => ({
            ...prevData,
            time: formattedTime,
        }));
        handleTimeMenuClose();
    };

    const isValidDate = dateString => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;

        const date = new Date(dateString);
        const timestamp = date.getTime();

        if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;

        return dateString === date.toISOString().split("T")[0];
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Validate dates
        if (!isValidDate(courseData.startDate) || !isValidDate(courseData.endDate)) {
            setError("Please enter valid dates in the format YYYY-MM-DD for Start Date and End Date.");
            return;
        }

        const startDate = new Date(courseData.startDate);
        const endDate = new Date(courseData.endDate);

        if (endDate <= startDate) {
            setError("End Date must be after Start Date.");
            return;
        }

        // Validate number fields
        if (isNaN(courseData.credits) || isNaN(courseData.seatsAvailable) || isNaN(courseData.classSize)) {
            setError("Credits, Seats Available, and Class Size must be valid numbers.");
            return;
        }

        try {
            const token = localStorage.getItem("token"); // Retrieve the token from local storage
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            };

            // Fetch the program code based on the selected program name
            const selectedProgram = programs.find(p => p.name === program);
            if (!selectedProgram) {
                setError("Selected program not found.");
                return;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/v1/courses?programCode=${selectedProgram.code}`,
                courseData,
                config
            );

            if (response.status === 201) {
                setOpenModal(true);
                setError("");
            }
        } catch (error) {
            console.error("Error adding course:", error);
            setError("An error occurred while adding the course. Please try again.");
        }
    };

    return (
        <div>
            <Navbar rightMenu={<ProfileMenu />} />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4, color: "#34405E" }}>
                    Add New Course
                </Typography>
                <Card
                    sx={{
                        p: 4,
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        boxShadow: 3,
                        mb: 4,
                    }}
                >
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField label="Course Code" name="code" value={courseData.code} onChange={handleChange} fullWidth required />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField label="Course Name" name="name" value={courseData.name} onChange={handleChange} fullWidth required />
                                </Box>
                                <Box sx={{ flex: "1 1 100%" }}>
                                    <TextField
                                        label="Description"
                                        name="description"
                                        value={courseData.description}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <FormControl fullWidth required variant="outlined">
                                        <InputLabel>Term</InputLabel>
                                        <Select name="term" value={courseData.term} onChange={handleChange} label="Term">
                                            <MenuItem value="Winter">Winter</MenuItem>
                                            <MenuItem value="Spring">Spring</MenuItem>
                                            <MenuItem value="Summer">Summer</MenuItem>
                                            <MenuItem value="Fall">Fall</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField label="Campus" name="campus" value={courseData.campus} onChange={handleChange} fullWidth required />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        name="startDate"
                                        value={courseData.startDate}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: {
                                                backgroundColor: "white",
                                                paddingRight: "4px",
                                                paddingLeft: "4px",
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        name="endDate"
                                        value={courseData.endDate}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{
                                            shrink: true,
                                            sx: {
                                                backgroundColor: "white",
                                                paddingRight: "4px",
                                                paddingLeft: "4px",
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        label="Time"
                                        name="time"
                                        value={courseData.time}
                                        onClick={handleTimeMenuOpen}
                                        fullWidth
                                        required
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                    <Menu anchorEl={timeAnchorEl} open={Boolean(timeAnchorEl)} onClose={handleTimeMenuClose}>
                                        <Box sx={{ p: 2 }}>
                                            <FormControl fullWidth margin="normal">
                                                <TextField
                                                    select
                                                    label="Start Time"
                                                    value={startTime}
                                                    onChange={e => setStartTime(e.target.value)}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                >
                                                    {[
                                                        "8:00 AM",
                                                        "8:30 AM",
                                                        "9:00 AM",
                                                        "9:30 AM",
                                                        "10:00 AM",
                                                        "10:30 AM",
                                                        "11:00 AM",
                                                        "11:30 AM",
                                                        "12:00 PM",
                                                        "12:30 PM",
                                                        "1:00 PM",
                                                        "1:30 PM",
                                                        "2:00 PM",
                                                        "2:30 PM",
                                                        "3:00 PM",
                                                        "3:30 PM",
                                                        "4:00 PM",
                                                        "4:30 PM",
                                                        "5:00 PM",
                                                    ].map(time => (
                                                        <MenuItem key={time} value={time}>
                                                            {time}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormControl>
                                            <FormControl fullWidth margin="normal">
                                                <TextField
                                                    select
                                                    label="End Time"
                                                    value={endTime}
                                                    onChange={e => setEndTime(e.target.value)}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                >
                                                    {[
                                                        "8:00 AM",
                                                        "8:30 AM",
                                                        "9:00 AM",
                                                        "9:30 AM",
                                                        "10:00 AM",
                                                        "10:30 AM",
                                                        "11:00 AM",
                                                        "11:30 AM",
                                                        "12:00 PM",
                                                        "12:30 PM",
                                                        "1:00 PM",
                                                        "1:30 PM",
                                                        "2:00 PM",
                                                        "2:30 PM",
                                                        "3:00 PM",
                                                        "3:30 PM",
                                                        "4:00 PM",
                                                        "4:30 PM",
                                                        "5:00 PM",
                                                    ].map(time => (
                                                        <MenuItem key={time} value={time}>
                                                            {time}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormControl>
                                            <Button onClick={handleApplyTime} variant="contained" color="primary" sx={{ mt: 2 }}>
                                                Apply
                                            </Button>
                                        </Box>
                                    </Menu>
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        label="Days"
                                        name="days"
                                        value={courseData.days}
                                        onClick={handleMenuOpen}
                                        fullWidth
                                        required
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                        <FormControl component="fieldset" sx={{ p: 2 }}>
                                            <FormLabel component="legend">Select Days</FormLabel>
                                            <FormGroup>
                                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                                                    <FormControlLabel
                                                        key={day}
                                                        control={<Checkbox checked={tempDays.includes(day)} onChange={handleDaysChange} name={day} />}
                                                        label={day}
                                                    />
                                                ))}
                                            </FormGroup>
                                            <Button onClick={handleApplyDays} variant="contained" color="primary" sx={{ mt: 2 }}>
                                                Apply
                                            </Button>
                                        </FormControl>
                                    </Menu>
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <FormControl fullWidth required variant="outlined">
                                        <InputLabel>Delivery Mode</InputLabel>
                                        <Select name="deliveryMode" value={courseData.deliveryMode} onChange={handleChange} label="Delivery Mode">
                                            <MenuItem value="Face to Face">Face to Face</MenuItem>
                                            <MenuItem value="Online Synchronous">Online Synchronous</MenuItem>
                                            <MenuItem value="Online Asynchronous">Online Asynchronous</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        type="number"
                                        label="Credits"
                                        name="credits"
                                        value={courseData.credits}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        type="number"
                                        label="Seats Available"
                                        name="seatsAvailable"
                                        value={courseData.seatsAvailable}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <TextField
                                        type="number"
                                        label="Class Size"
                                        name="classSize"
                                        value={courseData.classSize}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 100%" }}>
                                    <TextField
                                        label="Prerequisites"
                                        name="prerequisites"
                                        value={courseData.prerequisites}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 100%" }}>
                                    <FormControl fullWidth required variant="outlined">
                                        <InputLabel>Program</InputLabel>
                                        <Select name="program" value={program} onChange={e => setProgram(e.target.value)} label="Program">
                                            {programs.map(p => (
                                                <MenuItem key={p._id} value={p.name}>
                                                    {p.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                {error && (
                                    <Box sx={{ flex: "1 1 100%" }}>
                                        <Typography color="error">{error}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ flex: "1 1 100%", mt: 2 }}>
                                    <CardActions>
                                        <Button type="submit" variant="contained" color="primary" fullWidth>
                                            Add Course
                                        </Button>
                                    </CardActions>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
                <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                    <DialogTitle>Course Added</DialogTitle>
                    <DialogContent>
                        <Typography>The new course has been successfully added.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenModal(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}

export default AdmAddCourses;
