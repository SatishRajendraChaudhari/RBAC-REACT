import React, { useState, useEffect } from "react";
import {Typography,Card,CardContent,Grid,Table,TableBody,TableCell,TableContainer,TableRow,Paper,} from "@mui/material";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti"; // Import ReactConfetti

// Animation variants for Framer Motion
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.5, duration: 0.5 } },
};

const Dashboard = () => {
  const [showConfetti, setShowConfetti] = useState(true); // State to control confetti visibility

  // Remove confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000); // 5000ms = 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {/* Confetti Animation */}
      {showConfetti && <ReactConfetti />}

      <br/>
      
      {/* Welcome Message */}
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50", marginTop: "30px" , textAlign:"center"}}>
        Welcome
      </Typography>

      {/* Paragraph */}
      <Typography variant="body1" paragraph style={{ color: "#34495e", marginBottom: "40px" }}>
        This is your personalized dashboard. Here, you can manage your profile, view important information, and stay updated with the latest news and updates. Below, you'll find some key details and statistics to help you stay on top of your tasks.
      </Typography>

      {/* Cards Section */}
      <Grid container spacing={3} style={{ marginBottom: "40px" }}>
        {[
          {
            title: "Lion",
            description: "The lion is a large cat of the genus Panthera, native to Africa and India. It is the second-largest living cat after the tiger.",
            color: "#e67e22",
          },
          {
            title: "Elephant",
            description: "Elephants are the largest existing land animals. They are known for their long trunks, large ears, and tusks.",
            color: "#3498db",
          },
          {
            title: "Giraffe",
            description: "The giraffe is an African even-toed ungulate mammal and the tallest living terrestrial animal.",
            color: "#2ecc71",
          },
          {
            title: "Zebra",
            description: "Zebras are African equines with distinctive black-and-white striped coats. They are social animals that live in herds.",
            color: "#9b59b6",
          },
        ].map((animal, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                style={{
                  backgroundColor: animal.color,
                  color: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom style={{ fontWeight: "bold" }}>
                    {animal.title}
                  </Typography>
                  <Typography variant="body2">{animal.description}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Table Section */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <Typography variant="h6" gutterBottom style={{ fontWeight: "bold", color: "#2c3e50", marginBottom: "20px" }}>
          Animal Information
        </Typography>
        <TableContainer
          component={Paper}
          style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
        >
          <Table>
            <TableBody>
              {[
                { name: "Lion", description: "Native to Africa and India, the lion is the second-largest living cat after the tiger." },
                { name: "Elephant", description: "The largest existing land animal, known for its long trunk, large ears, and tusks." },
                { name: "Giraffe", description: "The tallest living terrestrial animal, native to Africa." },
                { name: "Zebra", description: "African equines with distinctive black-and-white striped coats." },
              ].map((animal, index) => (
                <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                  <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>{animal.name}</TableCell>
                  <TableCell style={{ color: "#34495e" }}>{animal.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </div>
  );
};

export default Dashboard;