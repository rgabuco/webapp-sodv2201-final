import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    Card,
    CardContent,
    CardActions,
    FormLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import programsArray from "../utils/data/Programs";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import LoginButton from "../components/login-button/LoginButton";
import { checkUserLoggedIn, isAdministrator } from "../utils/authUtils";
import SuccessfulSignUp from "../components/modal-successful-signup/SuccessfulSignUp";
import { useNavigate } from "react-router-dom"; // Assuming you are using react-router-dom

function Signup() {
    const [, setServerError] = useState({});
    const [, setSuccessMessage] = useState("");
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [newUserDetails, setNewUserDetails] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const username = checkUserLoggedIn();
        setUserLoggedIn(username);
        const admin = isAdministrator();
        setIsAdmin(admin);
    }, []);

    const { handleSubmit, control, reset } = useForm({
        defaultValues: {
            username: "",
            password: "",
            email: "",
            firstName: "",
            lastName: "",
            countryCode: "+1",
            phone: "",
            department: "Software Development",
            program: programsArray[0]?.name || "",
            isAdmin: "false",
        },
    });

    const onSubmit = async formData => {
        const formattedData = {
            username: formData.username,
            password: formData.password,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: `${formData.countryCode} ${formData.phone}`,
            department: formData.department,
            program: formData.program,
            isAdmin: formData.isAdmin === "true",
            courses: [],
        };

        console.log("formattedData", JSON.stringify(formattedData, null, 2));

        try {
            setServerError({});
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/v1/users`, formattedData);
            console.log("response", response.data);
            setSuccessMessage("User registered successfully!");
            setNewUserDetails({
                accountType: formData.isAdmin === "true" ? "Admin" : "Student",
                username: formData.username,
                accountID: response.data._id, // Adjust based on actual response
            });
            setOpenModal(true);
            reset();
        } catch (error) {
            console.error("Error response:", error.response);
            if (error.response && error.response.data.errors) {
                setServerError(
                    error.response.data.errors.reduce((acc, err) => {
                        acc[err.field] = err.message;
                        return acc;
                    }, {})
                );
            } else {
                setServerError({ global: "An unexpected error occurred." });
            }
        }
    };

    return (
        <div>
            <Navbar rightMenu={userLoggedIn ? <ProfileMenu /> : <LoginButton />} />
            <Container maxWidth="sm">
                <Box sx={{ mt: 4 }}>
                    <Card
                        sx={{
                            p: 4,
                            border: "1px solid rgba(0, 0, 0, 0.12)",
                            boxShadow: 3,
                            mb: 4,
                        }}
                    >
                        <CardContent>
                            <Typography variant="h4" align="center" gutterBottom>
                                Sign Up
                            </Typography>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Username */}
                                <Controller
                                    name="username"
                                    control={control}
                                    rules={{
                                        required: "Please provide a username",
                                        minLength: { value: 4, message: "Username must be at least 4 characters long" },
                                        maxLength: { value: 50, message: "Username must be at most 50 characters long" },
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Username"
                                            fullWidth
                                            margin="normal"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                {/* Password */}
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: "Please provide a password",
                                        minLength: { value: 8, message: "Password must be at least 8 characters long" },
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Password"
                                            type="password"
                                            fullWidth
                                            margin="normal"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                {/* Email */}
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Please provide your email",
                                        validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Please provide a valid email",
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Email"
                                            type="email"
                                            fullWidth
                                            margin="normal"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                {/* First Name */}
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{ required: "Please provide your first name" }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="First Name"
                                            fullWidth
                                            margin="normal"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                {/* Last Name */}
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{ required: "Please provide your last name" }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Last Name"
                                            fullWidth
                                            margin="normal"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                {/* Country Code and Phone */}
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Controller
                                        name="countryCode"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>Country Code</InputLabel>
                                                <Select {...field} label="Country Code">
                                                    <MenuItem value="+1">+1 (USA/Canada)</MenuItem>
                                                    <MenuItem value="+44">+44 (UK)</MenuItem>
                                                    <MenuItem value="+61">+61 (Australia)</MenuItem>
                                                    <MenuItem value="+91">+91 (India)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{
                                            required: "Please provide your phone number",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Phone number must contain only numbers",
                                            },
                                        }}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Phone Number"
                                                fullWidth
                                                margin="normal"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Box>

                                {/* Program */}
                                <Controller
                                    name="program"
                                    control={control}
                                    rules={{ required: "Please provide your program" }}
                                    render={({ field, fieldState }) => (
                                        <FormControl fullWidth margin="normal" error={!!fieldState.error}>
                                            <InputLabel>Program</InputLabel>
                                            <Select {...field} label="Program">
                                                {programsArray.map(program => (
                                                    <MenuItem key={program.name} value={program.name}>
                                                        {program.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {fieldState.error && (
                                                <Typography variant="caption" color="error">
                                                    {fieldState.error.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />

                                {/* User Access */}
                                {isAdmin && (
                                    <Controller
                                        name="isAdmin"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl component="fieldset" margin="normal">
                                                <FormLabel>User Access</FormLabel>
                                                <RadioGroup row {...field}>
                                                    <FormControlLabel value="false" control={<Radio />} label="Student" />
                                                    <FormControlLabel value="true" control={<Radio />} label="Admin" />
                                                </RadioGroup>
                                            </FormControl>
                                        )}
                                    />
                                )}

                                {/* Submit Button */}
                                <CardActions>
                                    <Button type="submit" variant="contained" color="primary" fullWidth>
                                        Sign Up
                                    </Button>
                                </CardActions>
                            </form>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
            <SuccessfulSignUp
                open={openModal}
                onClose={() => setOpenModal(false)}
                accountType={newUserDetails.accountType}
                username={newUserDetails.username}
                userLoggedIn={userLoggedIn}
                navigate={navigate}
            />
        </div>
    );
}

export default Signup;
