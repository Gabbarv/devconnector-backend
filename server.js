const express = require("express");
const connectDB= require("./db");
const bodyParser= require("body-parser");
const path = require("path")
const dotenv = require("dotenv")
const cors = require("cors")

dotenv.config();

const app = express();

connectDB();

app.use(bodyParser.json({extended: true}));
app.use(cors())


app.use("/api/users", require("./routes/api/user"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

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