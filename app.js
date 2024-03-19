const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const courseRouter = require('./routes/courseRoutes');
const lessonRouter = require('./routes/lessonRoutes');
const testRouter = require('./routes/testRoutes');
const userCourseRouter = require('./routes/User_CourseRoutes');
const MeetingRouter= require('./routes/MeetingRoutes');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));


// Allow all cross-origin requests
app.use(cors());

// Add headers before the routes are defined
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
  
    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,OPTIONS,POST,PUT,DELETE"
    );
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
  
    // Pass to next layer of middleware
    next();
  });   
app.use('/AngelCode/users', userRouter);
app.use('/AngelCode/Courses',courseRouter);
app.use('/AngelCode/Lessons',lessonRouter);
app.use('/AngelCode/Tests',testRouter);
app.use('/AngelCode',userCourseRouter);
app.use('/AngelCode/Meetings',MeetingRouter);
app.use(globalErrorHandler);
module.exports = app;