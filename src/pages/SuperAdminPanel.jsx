import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../firebase"; // Import Firestore
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ROLES } from "../constants";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import InfoIcon from "@mui/icons-material/Info";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Animation variants for Framer Motion
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.5, duration: 0.5 } },
};

const SuperAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: ROLES.USER });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadingUser, setUploadingUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  // Fetch all users from Firestore
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(usersData);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add a new user
  const handleAddUser = async () => {
    // Check if any field is empty
    if (!newUser.name || !newUser.email || !newUser.password) {
      setSnackbarMessage("Please fill in all fields!");
      setSnackbarOpen(true);
      return;
    }

    // Check if the user already exists
    const isUserExists = users.some(
      (user) =>
        user.name === newUser.name &&
        user.email === newUser.email &&
        user.password === newUser.password
    );

    if (isUserExists) {
      setSnackbarMessage("User already exists!");
      setSnackbarOpen(true);
      return;
    }

    // Add the new user to Firestore
    const userRef = doc(db, "users", Date.now().toString());
    await setDoc(userRef, newUser);
    setNewUser({ name: "", email: "", password: "", role: ROLES.USER });
    fetchUsers();
    setSnackbarMessage("User added successfully!");
    setSnackbarOpen(true);
  };

  // Edit a user
  const handleEditUser = async () => {
    if (editUser.role === ROLES.SUPER_ADMIN || editUser.role === ROLES.ADMIN) {
      setSnackbarMessage("Cannot edit Super Admin or Admin.");
      setSnackbarOpen(true);
      return;
    }

    const userRef = doc(db, "users", editUser.id);
    await updateDoc(userRef, editUser);
    setEditUser(null);
    fetchUsers();
    setSnackbarMessage("User updated successfully!");
    setSnackbarOpen(true);
  };

  // Delete a user
  const handleDeleteUser = async () => {
    if (userToDelete.role === ROLES.SUPER_ADMIN || userToDelete.role === ROLES.ADMIN) {
      setSnackbarMessage("Cannot delete Super Admin or Admin.");
      setSnackbarOpen(true);
      return;
    }

    await deleteDoc(doc(db, "users", userToDelete.id));
    fetchUsers();
    setSnackbarMessage("User deleted successfully!");
    setSnackbarOpen(true);
    setDeleteDialogOpen(false);
  };

  // Bulk delete users
  const handleBulkDelete = async () => {
    for (const userId of selectedUsers) {
      const user = users.find((u) => u.id === userId);
      if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
        await deleteDoc(doc(db, "users", userId));
      }
    }
    fetchUsers();
    setSelectedUsers([]);
    setSnackbarMessage("Selected users deleted successfully!");
    setSnackbarOpen(true);
    setBulkDeleteDialogOpen(false);
  };

  // Export individual user data to Excel
  const handleExportUserData = (user) => {
    const worksheet = XLSX.utils.json_to_sheet([user]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${user.name}_data.xlsx`);
  };

  // Handle file upload to localStorage
  const handleFileUpload = (user) => {
    if (!fileToUpload) {
      setSnackbarMessage("No file selected!");
      setSnackbarOpen(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: fileToUpload.name,
        type: fileToUpload.type, // Ensure the type is included
        data: event.target.result, // Base64 string
      };

      // Get existing files from localStorage
      const existingFiles = JSON.parse(localStorage.getItem(`userFiles_${user.id}`)) || [];
      const updatedFiles = [...existingFiles, fileData];

      // Save files to localStorage
      localStorage.setItem(`userFiles_${user.id}`, JSON.stringify(updatedFiles));

      setSnackbarMessage("File uploaded successfully!");
      setSnackbarOpen(true);
      setFileToUpload(null);
      setUploadingUser(null);
      setExpandedUser(user.id); // Open the collapsible section for the current user
      fetchUsers(); // Refresh the user list
    };
    reader.readAsDataURL(fileToUpload); // Convert file to base64
  };

  // Handle file deletion from localStorage
  const handleFileDelete = (user, fileName) => {
    const existingFiles = JSON.parse(localStorage.getItem(`userFiles_${user.id}`)) || [];
    const updatedFiles = existingFiles.filter((file) => file.name !== fileName);

    // Save updated files to localStorage
    localStorage.setItem(`userFiles_${user.id}`, JSON.stringify(updatedFiles));

    setSnackbarMessage("File deleted successfully!");
    setSnackbarOpen(true);
    fetchUsers(); // Refresh the user list
  };

  // Get files for a user from localStorage
  const getUserFiles = (userId) => {
    return JSON.parse(localStorage.getItem(`userFiles_${userId}`)) || [];
  };

  // Handle file click to open the file in a new tab or download it
  const handleFileClick = (file) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.target = "_blank";
    link.download = file.name;
    link.click();
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const name = user.name || "";
    const email = user.email || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      {/* Title */}
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50", marginTop: 40, textAlign: "center" }}>
        Super Admin Panel
      </Typography>

      {/* Add User Form */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card style={{ marginBottom: "20px", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50" }}>
              Add New User
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  onClick={handleAddUser}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: "16px", backgroundColor: "#3498db", color: "#fff" }}
                >
                  Add User
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card style={{ marginBottom: "20px", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50" }}>
              Bulk Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  variant="contained"
                  color="secondary"
                  disabled={selectedUsers.length === 0}
                  style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                >
                  Delete Selected
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* User List */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <Typography variant="h6" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50", marginBottom: "20px" }}>
          User List
        </Typography>
        <TextField
          label="Search Users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          margin="normal"
          style={{ marginBottom: "20px" }}
        />
        <TableContainer component={Paper} style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <Table>
            <TableBody>
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow style={{ backgroundColor: user.role === ROLES.SUPER_ADMIN ? "#f0f8ff" : user.role === ROLES.ADMIN ? "#f5f5f5" : "#fff" }}>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) =>
                              setSelectedUsers(
                                e.target.checked
                                  ? [...selectedUsers, user.id]
                                  : selectedUsers.filter((id) => id !== user.id)
                              )
                            }
                            disabled={user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN}
                          />
                        }
                        label=""
                      />
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>{user.name}</TableCell>
                    <TableCell style={{ color: "#34495e" }}>{user.email}</TableCell>
                    <TableCell style={{ color: "#34495e" }}>{user.role}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => setEditUser(user)}
                        disabled={user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN}
                        style={{ color: "#2ecc71" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN}
                        style={{ color: "#e74c3c" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleExportUserData(user)}
                        style={{ color: "#3498db" }}
                      >
                        <FileDownloadIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setUploadingUser(user)}
                        style={{ color: "#9b59b6" }}
                      >
                        <UploadIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setExpandedUser(user.id === expandedUser ? null : user.id)}
                        style={{ color: "#f1c40f" }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} style={{ padding: 0 }}>
                      <Collapse in={expandedUser === user.id}>
                        <div style={{ padding: "16px" }}>
                          <Typography variant="h6" gutterBottom>
                            Uploaded Files
                          </Typography>
                          {getUserFiles(user.id).map((file, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginRight: "8px", cursor: "pointer" }}
                                onClick={() => handleFileClick(file)}
                              >
                                {file.name}
                              </Typography>
                              <IconButton
                                onClick={() => handleFileDelete(user, file.name)}
                                style={{ color: "#e74c3c" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Edit User Dialog */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editUser?.name || ""}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={editUser?.email || ""}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select
            value={editUser?.role || ROLES.USER}
            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            fullWidth
            margin="normal"
          >
            <MenuItem value={ROLES.USER}>User</MenuItem>
            <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleEditUser} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)}>
        <DialogTitle>Delete Selected Users</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the selected users?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={Boolean(uploadingUser)} onClose={() => setUploadingUser(null)}>
        <DialogTitle>Upload File for {uploadingUser?.name}</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={(e) => setFileToUpload(e.target.files[0])}
            style={{ marginBottom: "16px" }}
          />
          <Button
            onClick={() => handleFileUpload(uploadingUser)}
            variant="contained"
            color="primary"
          >
            Upload
          </Button>
        </DialogContent>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
};

export default SuperAdminPanel;