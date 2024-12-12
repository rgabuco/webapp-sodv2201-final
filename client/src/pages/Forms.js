import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TableHead,
} from "@mui/material";
import {
    MarkEmailUnread as MarkEmailUnreadIcon,
    MarkEmailRead as MarkEmailReadIcon,
    AccountCircle as AccountCircleIcon,
    CalendarToday as CalendarTodayIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import FilterBar from "../components/filter-bar/FilterBar";
import axios from "axios";
import { isAdministrator } from "../utils/authUtils";

function Forms() {
    const [messages, setMessages] = useState([]);
    const [openMessage, setOpenMessage] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isReadFilter, setIsReadFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState("");
    const [, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (!isAdministrator()) {
                    setErrorMessage("Unauthorized access. Admin only.");
                    return;
                }

                const token = localStorage.getItem("token");
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/forms`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setMessages(response.data.data.forms || []);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setErrorMessage("Failed to fetch messages. Please try again later.");
            }
        };

        fetchMessages();
    }, []);

    const handleDelete = async id => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/v1/forms/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== id));
        } catch (error) {
            console.error("Error deleting message:", error);
            setErrorMessage("Failed to delete message. Please try again.");
        }
    };

    const handleOpenMessage = async message => {
        setSelectedMessage(message);
        setOpenMessage(true);

        if (!message.isRead) {
            try {
                const token = localStorage.getItem("token");
                await axios.patch(
                    `${process.env.REACT_APP_SERVER_URL}/api/v1/forms/${message._id}`,
                    { isRead: true },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setMessages(prevMessages => prevMessages.map(msg => (msg._id === message._id ? { ...msg, isRead: true } : msg)));
            } catch (error) {
                console.error("Error marking message as read:", error);
                setErrorMessage("Failed to mark message as read. Please try again.");
            }
        }
    };

    const handleCloseMessage = () => {
        setOpenMessage(false);
        setSelectedMessage(null);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setIsReadFilter(null);
        setDateFilter("");
    };

    const filteredMessages = messages.filter(msg => {
        const query = searchQuery.toLowerCase();
        const isReadMatch = isReadFilter === null ? true : msg.isRead === isReadFilter;
        const dateMatch = dateFilter ? new Date(msg.date).toLocaleDateString().includes(dateFilter) : true;

        console.log("dateMatch", dateMatch);
        console.log("dateFilter", dateFilter);
        console.log("new Date(msg.date).toLocaleDateString()", new Date(msg.date).toLocaleDateString());

        return (
            (msg.username.toLowerCase().includes(query) ||
                msg.email.toLowerCase().includes(query) ||
                msg.message.toLowerCase().includes(query) ||
                new Date(msg.date).toLocaleString().includes(query)) &&
            isReadMatch &&
            dateMatch
        );
    });

    return (
        <div>
            <Navbar rightMenu={<ProfileMenu />} />
            <Box sx={{ maxWidth: 1100, margin: "0 auto", padding: "20px", mt: 2 }}>
                <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "#2B3C5E" }}>
                    Message List
                </Typography>

                <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isReadFilter={isReadFilter}
                    setIsReadFilter={setIsReadFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    handleResetFilters={handleResetFilters}
                />

                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        "@media (max-width: 600px)": {
                            width: "100%",
                            overflowX: "auto",
                        },
                    }}
                >
                    <Table
                        sx={{
                            minWidth: 650,
                            "@media (max-width: 600px)": {
                                "& th": {
                                    display: "none",
                                },
                            },
                        }}
                    >
                        <TableHead
                            sx={{
                                
                                color: "#2B3C5E",
                                display: { xs: "none", sm: "table-header-group" },backgroundColor: "#ffffff"
                            }}
                        >
                            <TableRow>
                                <TableCell sx={{ color: "#2B3C5E", fontWeight: "bold" }}>Username</TableCell>
                                <TableCell sx={{ color: "#2B3C5E", fontWeight: "bold" }}>Email</TableCell>
                                <TableCell sx={{ color: "#2B3C5E", fontWeight: "bold" }}>Message</TableCell>
                                <TableCell sx={{ color: "#2B3C5E", fontWeight: "bold" }}>Date</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMessages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No messages found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMessages.map(message => (
                                    <TableRow
                                        key={message._id}
                                        sx={{
                                            "&:hover": { backgroundColor: "#f9f9f9" },
                                            "@media (max-width: 600px)": {
                                                display: "block",
                                                marginBottom: "10px",
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <AccountCircleIcon sx={{ mr: 1 }} /> {message.username}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{message.email}</TableCell>
                                        <TableCell>
                                            <IconButton color="default" onClick={() => handleOpenMessage(message)} aria-label="view-message">
                                                {message.isRead ? <MarkEmailReadIcon /> : <MarkEmailUnreadIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <CalendarTodayIcon sx={{ mr: 1 }} /> {new Date(message.date).toLocaleString()}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="default" onClick={() => handleDelete(message._id)} aria-label="delete">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openMessage} onClose={handleCloseMessage} fullWidth maxWidth="sm">
                    <DialogTitle>Message Content</DialogTitle>
                    <DialogContent>
                        <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                            {selectedMessage && (
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {selectedMessage.message}
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseMessage} variant="contained" sx={{ backgroundColor: "#2B3C5E", color: "#fff" }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
}

export default Forms;
