const express = require("express");
const connectDB= require("./db");
const bodyParser= require("body-parser");
const path = require("path")
const dotenv = require("dotenv")
const cors = require("cors")
const authRoutes = require("./routes/api/auth.js")
const postRoutes = require("./routes/api/posts")
const profileRoutes = require("./routes/api/profile")
const userRoutes = require("./routes/api/user");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();

connectDB();

app.use(bodyParser.json({extended: true}));
app.use(cors())


app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile",profileRoutes);

// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static('client/build'));
  
//     app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
//   }


app.listen(5000,() => {
    console.log(`server started on port 5000`);
});