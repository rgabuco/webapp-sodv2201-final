import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();
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

    const handleDaysChange = e => {
        const { name, checked } = e.target;
        setTempDays(prevDays => {
            const newDays = checked ? [...prevDays, name] : prevDays.filter(day => day !== name);
            return newDays;
        });
    };

    const handleMenuOpen = event => {
        setTempDays(watch("days").split(", ").filter(Boolean)); // Split the days string into an array
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleApplyDays = () => {
        setValue("days", tempDays.join(", ")); // Join the array into a comma-separated string
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
        setValue("time", formattedTime);
        handleTimeMenuClose();
    };

    const onSubmit = async data => {
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

            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/v1/courses?programCode=${selectedProgram.code}`, data, config);

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
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="code"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Course code is required",
                                            minLength: { value: 3, message: "Course code must be at least 3 characters long" },
                                            maxLength: { value: 11, message: "Course code must be less than 11 characters long" },
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Course Code"
                                                fullWidth
                                                error={!!errors.code}
                                                helperText={errors.code ? errors.code.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Course name is required",
                                            minLength: { value: 3, message: "Course name must be at least 3 characters long" },
                                            maxLength: { value: 100, message: "Course name must be less than 100 characters long" },
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Course Name"
                                                fullWidth
                                                error={!!errors.name}
                                                helperText={errors.name ? errors.name.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 100%" }}>
                                    <Controller
                                        name="description"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Course description is required",
                                            minLength: { value: 10, message: "Course description must be at least 10 characters long" },
                                            maxLength: { value: 1000, message: "Course description must be less than 1000 characters long" },
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Description"
                                                fullWidth
                                                error={!!errors.description}
                                                helperText={errors.description ? errors.description.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="term"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Term is required" }}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.term}>
                                                <InputLabel>Term</InputLabel>
                                                <Select {...field} label="Term">
                                                    <MenuItem value="Winter">Winter</MenuItem>
                                                    <MenuItem value="Spring">Spring</MenuItem>
                                                    <MenuItem value="Summer">Summer</MenuItem>
                                                    <MenuItem value="Fall">Fall</MenuItem>
                                                </Select>
                                                {errors.term && <Typography color="error">{errors.term.message}</Typography>}
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="campus"
                                        control={control}
                                        defaultValue="Calgary"
                                        rules={{ required: "Campus is required" }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Campus"
                                                fullWidth
                                                error={!!errors.campus}
                                                helperText={errors.campus ? errors.campus.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="startDate"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Start date is required" }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Start Date"
                                                type="date"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                error={!!errors.startDate}
                                                helperText={errors.startDate ? errors.startDate.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="endDate"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "End date is required" }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="End Date"
                                                type="date"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                error={!!errors.endDate}
                                                helperText={errors.endDate ? errors.endDate.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="time"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Time is required" }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Time"
                                                fullWidth
                                                onClick={handleTimeMenuOpen}
                                                InputProps={{ readOnly: true }}
                                                error={!!errors.time}
                                                helperText={errors.time ? errors.time.message : ""}
                                            />
                                        )}
                                    />
                                    <Menu anchorEl={timeAnchorEl} open={Boolean(timeAnchorEl)} onClose={handleTimeMenuClose}>
                                        <Box sx={{ p: 2 }}>
                                            <FormControl fullWidth margin="normal">
                                                <TextField
                                                    select
                                                    label="Start Time"
                                                    value={startTime}
                                                    onChange={e => setStartTime(e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
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
                                                    InputLabelProps={{ shrink: true }}
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
                                    <Controller
                                        name="days"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Days are required" }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Days"
                                                fullWidth
                                                onClick={handleMenuOpen}
                                                InputProps={{ readOnly: true }}
                                                error={!!errors.days}
                                                helperText={errors.days ? errors.days.message : ""}
                                            />
                                        )}
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
                                    <Controller
                                        name="deliveryMode"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Delivery mode is required" }}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.deliveryMode}>
                                                <InputLabel>Delivery Mode</InputLabel>
                                                <Select {...field} label="Delivery Mode">
                                                    <MenuItem value="Face to Face">Face to Face</MenuItem>
                                                    <MenuItem value="Online Synchronous">Online Synchronous</MenuItem>
                                                    <MenuItem value="Online Asynchronous">Online Asynchronous</MenuItem>
                                                </Select>
                                                {errors.deliveryMode && <Typography color="error">{errors.deliveryMode.message}</Typography>}
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="credits"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Course credits are required",
                                            min: { value: 1, message: "Credits must be at least 1" },
                                            max: { value: 10, message: "Credits must be less than or equal to 10" },
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Credits"
                                                fullWidth
                                                error={!!errors.credits}
                                                helperText={errors.credits ? errors.credits.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="seatsAvailable"
                                        control={control}
                                        defaultValue="40"
                                        rules={{ required: "Seats available are required" }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Seats Available"
                                                fullWidth
                                                error={!!errors.seatsAvailable}
                                                helperText={errors.seatsAvailable ? errors.seatsAvailable.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 45%" }}>
                                    <Controller
                                        name="classSize"
                                        control={control}
                                        defaultValue="40"
                                        rules={{
                                            required: "Class size is required",
                                            min: { value: 10, message: "Class size must be at least 10" },
                                            max: { value: 50, message: "Class size must be less than or equal to 50" },
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Class Size"
                                                fullWidth
                                                error={!!errors.classSize}
                                                helperText={errors.classSize ? errors.classSize.message : ""}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box sx={{ flex: "1 1 100%" }}>
                                    <Controller
                                        name="prerequisites"
                                        control={control}
                                        defaultValue=""
                                        rules={{ maxLength: { value: 100, message: "Prerequisites must be less than 100 characters long" } }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Prerequisites"
                                                fullWidth
                                                error={!!errors.prerequisites}
                                                helperText={errors.prerequisites ? errors.prerequisites.message : ""}
                                            />
                                        )}
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
