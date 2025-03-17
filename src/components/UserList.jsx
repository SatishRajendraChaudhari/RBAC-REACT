// src/components/UserList.jsx
import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const UserList = ({ users, onDelete, onEdit, role }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {role === "SUPER_ADMIN" && (
                  <>
                    <Button onClick={() => onEdit(user)}>Edit</Button>
                    <Button onClick={() => onDelete(user.id)}>Delete</Button>
                  </>
                )}
                {role === "ADMIN" && <Button onClick={() => onDelete(user.id)}>Delete</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;