import React, { useState, useEffect } from "react";
import {Typography,Table,TableBody,TableCell,TableContainer,TableRow,Paper,Button,} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ROLES } from "../constants"; // Import ROLES
import { saveAs } from "file-saver"; // For saving files
import * as XLSX from "xlsx"; // For creating Excel files
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Icon for the export button

// Animation variants for Framer Motion
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.5, duration: 0.5 } },
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

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

  // Export user data to Excel
  const handleExportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "users.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Title */}
      <br/>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50", marginTop: 40, textAlign:"center" }}>
        Admin Panel
      </Typography>

      {/* Export Button */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Button
          onClick={handleExportData}
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          style={{ marginBottom: "20px", backgroundColor: "#2ecc71", color: "#fff" }}
        >
          Export Data
        </Button>
      </motion.div>

      {/* User List */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <Typography variant="h6" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50", marginBottom: "20px" }}>
          User List
        </Typography>
        <TableContainer component={Paper} style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <Table>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} style={{ backgroundColor: user.role === ROLES.SUPER_ADMIN ? "#f0f8ff" : user.role === ROLES.ADMIN ? "#f5f5f5" : "#fff" }}>
                  <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>{user.name}</TableCell>
                  <TableCell style={{ color: "#34495e" }}>{user.email}</TableCell>
                  <TableCell style={{ color: "#34495e" }}>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </div>
  );
};

export default AdminPanel;