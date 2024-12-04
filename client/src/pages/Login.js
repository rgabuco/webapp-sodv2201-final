import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, TextField, Button, Typography, Link, Card } from "@mui/material";
import Navbar from "../components/navbar/Navbar";
import LoginButton from "../components/login-button/LoginButton";
import axios from "axios";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/login`, { username, password });
            const { token, data } = response.data;

            // Handle successful login logic here
            // console.log("userLoggedIn ", { username });
            // console.log("isAdministrator:", { isAdmin: data.user.isAdmin });

            // Set localStorage variables
            // localStorage.setItem("userLoggedIn", username);
            // localStorage.setItem("isAdministrator", data.user.isAdmin);
            localStorage.setItem("token", token);
            console.log("LocalStorage token set successfully");

            // Navigate to the Dashboard page
            navigate("/dashboard");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setUsernameError("Invalid username or password.");
                setPasswordError("Invalid username or password.");
            } else {
                console.error("Error logging in", error);
            }
        }
    };

    const handleSubmit = event => {
        event.preventDefault();
        handleLogin();
    };

    return (
        <div>
            <Navbar rightMenu={<LoginButton />} />
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
                        <Typography component="h1" variant="h4" align="center">
                            Login
                        </Typography>
                        <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                error={!!usernameError}
                                helperText={usernameError}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                error={!!passwordError}
                                helperText={passwordError}
                            />
                            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
                                Login
                            </Button>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Link href="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Box>
                        </Box>
                    </Card>
                </Box>
            </Container>
        </div>
    );
}

export default Login;
