import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

function SuccessfulSignUp({ open, onClose, accountType, username, userLoggedIn, navigate }) {
    const handleCloseModal = () => {
        onClose();
        if (!userLoggedIn) {
            navigate("/login"); // Navigate to Login page if user is not logged in
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseModal}>
            <DialogTitle>Sign Up Successful</DialogTitle>
            <DialogContent>
                <Typography>
                    {accountType} account with username {username} successfully created.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SuccessfulSignUp;
