import React from "react";
import { TextField, Button, Box, Typography, Container, Paper, Grid, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ROLES } from "../constants";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  cfpassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const { name, email, password } = values;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: ROLES.USER,
      });

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
          }}
          component={motion.div}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
            Register
          </Typography>
          <Formik
            initialValues={{ name: "", email: "", password: "", cfpassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form style={{ width: "100%" }}>
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && !!errors.name}
                  helperText={<ErrorMessage name="name" />}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  fullWidth
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={<ErrorMessage name="email" />}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={<ErrorMessage name="password" />}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="cfpassword"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.cfpassword && !!errors.cfpassword}
                  helperText={<ErrorMessage name="cfpassword" />}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: "bold",
                    background: "linear-gradient(45deg, #1976d2, #2196f3)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #1e88e5)",
                    },
                  }}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#1976d2", textDecoration: "none" }}>
              Login here
            </a>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;