import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import ProfileMenu from "../components/profile-menu/ProfileMenu";
import { Container, Typography, IconButton, Box } from "@mui/material";
import FilterSearchReset from "../components/filter-search-reset/FilterSearchReset";
import StudentTable from "../components/student-table/StudentTable";
import ColumnPopover from "../components/column-popover/ColumnPopover";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import FirstPage from "@mui/icons-material/FirstPage";
import axios from "axios";

function StudentList() {
    const [isAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [, setAnchorElFilter] = useState(null);
    const [, setAnchorElSearch] = useState(null);
    const [anchorElColumns, setAnchorElColumns] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [clickedIcons, setClickedIcons] = useState({ filter: false, search: false, columns: false });
    const [columnVisibility, setColumnVisibility] = useState({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
        program: true,
    });
    const [filterValues, setFilterValues] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        program: "",
    });
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 9; // Number of items per page

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/v1/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Filter out users with isAdmin: true
                const validUsers = response.data.data.users.filter(user => !user.isAdmin);

                setUsers(validUsers); // Update the state with the filtered users
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search and filter criteria
    const filteredUsers = users.filter(student => {
        return (
            (student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
            Object.entries(filterValues).every(([key, value]) => value === "" || student[key]?.toLowerCase().includes(value.toLowerCase()))
        );
    });

    // Calculate the total pages based on filtered data
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Paginate filtered users
    const paginatedUsers = filteredUsers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    // Ensure pagination does not go out of bounds
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1); // If the current page exceeds total pages, reset to the last page
        }
    }, [filteredUsers, currentPage, totalPages]);

    const handleDelete = async _id => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/v1/users/${_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // If the user is successfully deleted from the database, update local state
            const updatedUsers = users.filter(user => user._id !== _id);
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleIconClick = iconName => {
        setClickedIcons(prevState => ({ ...prevState, [iconName]: !prevState[iconName] }));
    };

    const handleOpenFilter = event => setAnchorElFilter(event.currentTarget);
    const handleOpenSearch = event => setAnchorElSearch(event.currentTarget);
    const handleOpenColumns = event => setAnchorElColumns(event.currentTarget);

    const handleClosePopover = () => {
        setAnchorElFilter(null);
        setAnchorElSearch(null);
        setAnchorElColumns(null);
        setClickedIcons({ filter: false, search: false, columns: false });
    };

    const handleSearchChange = event => setSearchQuery(event.target.value);

    const handleFilterChange = e => {
        const { name, value } = e.target;
        setFilterValues(prevState => ({ ...prevState, [name]: value }));
    };

    const handleColumnVisibilityToggle = column => {
        setColumnVisibility(prevState => ({ ...prevState, [column]: !prevState[column] }));
    };

    const handleSelectAllColumns = event => {
        const isChecked = event.target.checked;
        const newVisibility = Object.fromEntries(Object.keys(columnVisibility).map(column => [column, isChecked]));
        setColumnVisibility(newVisibility);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setColumnVisibility({
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            department: true,
            program: true,
        });
        setFilterValues({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            department: "",
            program: "",
        });
        handleClosePopover();
        setCurrentPage(0); // Reset to the first page
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleFirstPage = () => {
        setCurrentPage(0);
    };

    return (
        <div>
            <Navbar rightMenu={<ProfileMenu />} />
            <Container maxWidth="lg" sx={{ mt: 4, color: "#34405E" }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: "center" }}>
                    Student Information List
                </Typography>

                {!isAdmin && (
                    <>
                        <FilterSearchReset
                            clickedIcons={clickedIcons}
                            handleIconClick={handleIconClick}
                            handleOpenFilter={handleOpenFilter}
                            handleOpenSearch={handleOpenSearch}
                            handleOpenColumns={handleOpenColumns}
                            handleResetFilters={handleResetFilters}
                            searchQuery={searchQuery}
                            handleSearchChange={handleSearchChange}
                            filterValues={filterValues}
                            handleFilterChange={handleFilterChange}
                        />

                        <StudentTable
                            filteredUsers={paginatedUsers}
                            columnVisibility={columnVisibility}
                            handleDelete={handleDelete} // Pass handleDelete here
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                            <IconButton onClick={handleFirstPage} disabled={currentPage === 0}>
                                <FirstPage />
                            </IconButton>
                            <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
                                <KeyboardArrowLeft />
                            </IconButton>
                            <IconButton onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                                <KeyboardArrowRight />
                            </IconButton>
                        </Box>
                    </>
                )}
            </Container>

            <ColumnPopover
                anchorElColumns={anchorElColumns}
                handleClosePopover={handleClosePopover}
                columnVisibility={columnVisibility}
                handleSelectAllColumns={handleSelectAllColumns}
                handleColumnVisibilityToggle={handleColumnVisibilityToggle}
            />
        </div>
    );
}

export default StudentList;
