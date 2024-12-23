import React from "react";
import { Avatar, Typography, Stack } from "@mui/material";

const TeamMember = ({ name, image, initials, role, onMouseEnter, onMouseLeave, hovered }) => (
    <Stack spacing={1} alignItems="center">
        <Avatar
            sx={{
                width: 60,
                height: 60,
                backgroundColor: "#34405E",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: 3,
                },
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            src={hovered ? image : null}
            alt={hovered ? name : `${initials} - ${name}`}
        >
            {!hovered && (
                <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
                    {initials}
                </Typography>
            )}
        </Avatar>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2">{role || "Role: Developer"}</Typography>
    </Stack>
);

export default TeamMember;
