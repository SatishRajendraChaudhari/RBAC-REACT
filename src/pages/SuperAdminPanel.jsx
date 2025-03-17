import React, { useState, useEffect } from "react";
import {Typography,Card,CardContent,Grid,Table,TableBody,TableCell,TableContainer,TableRow,Paper,TextField,Button,Select,MenuItem,Checkbox,FormControlLabel,Snackbar,IconButton,Dialog,DialogTitle,DialogContent,DialogActions,} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { ROLES } from "../constants";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
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
  const handleDeleteUser = async (id, role) => {
    if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) {
      setSnackbarMessage("Cannot delete Super Admin or Admin.");
      setSnackbarOpen(true);
      return;
    }

    await deleteDoc(doc(db, "users", id));
    fetchUsers();
    setSnackbarMessage("User deleted successfully!");
    setSnackbarOpen(true);
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
  };

  // Export user data to Excel
  const handleExportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "users.xlsx");
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const name = user.name || ""; // Fallback to an empty string if name is undefined
    const email = user.email || ""; // Fallback to an empty string if email is undefined
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      {/* Title */}
      <br/>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50",  marginTop: 40, textAlign:"center" }}>
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
                  onClick={handleBulkDelete}
                  variant="contained"
                  color="secondary"
                  disabled={selectedUsers.length === 0}
                  style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                >
                  Delete Selected
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  onClick={handleExportData}
                  variant="contained"
                  color="primary"
                  startIcon={<FileDownloadIcon />}
                  style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                >
                  Export Data
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
                <TableRow key={user.id} style={{ backgroundColor: user.role === ROLES.SUPER_ADMIN ? "#f0f8ff" : user.role === ROLES.ADMIN ? "#f5f5f5" : "#fff" }}>
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
                    <Button
                      onClick={() => setEditUser(user)}
                      disabled={user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN}
                      style={{ marginRight: "10px", backgroundColor: "#2ecc71", color: "#fff" }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user.id, user.role)}
                      disabled={user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN}
                      style={{ backgroundColor: "#e74c3c", color: "#fff" }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
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
