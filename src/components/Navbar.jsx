import React from "react";
import { AppBar, Toolbar, Typography, Button, styled } from "@mui/material";

// Custom styled components for enhanced styling
const StyledAppBar = styled(AppBar)(() => ({
  position: "fixed", // Fix the navbar to the top
  top: 0,
  left: 0,
  right: 0,
  boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
  background: "#000035", // Solid background color
  zIndex: 1200, // Ensure the navbar is above other content
}));

const LogoText = styled(Typography)(() => ({
  flexGrow: 1,
  fontFamily: "'Poppins', sans-serif", // Use a custom font (Poppins)
  fontWeight: 600,
  fontSize: "1.5rem",
  letterSpacing: "1px",
  color: "#fff",
}));

const LogoutButton = styled(Button)(() => ({
  color: "#fff",
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
  fontSize: "1rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)", 
  },
}));

const Navbar = ({ onLogout }) => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <LogoText variant="h6">RBAC System</LogoText>
        <LogoutButton color="inherit" onClick={onLogout}>
          Logout
        </LogoutButton>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;