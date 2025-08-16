var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
var cors = require('cors'); // ✅ Import CORS

require('dotenv').config();

const clearMonthlyAttendanceJob = require('./cron/clearMonthlyAttendance');
clearMonthlyAttendanceJob.start();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRoutes = require('./routes/adminRoutes');
var facultyRoutes = require('./routes/facultyRoutes');
var inquiryRoutes = require('./routes/inquiryRoutes');
var studentRoutes = require('./routes/studentRoutes');
var attendanceRoutes = require('./routes/attendanceRoutes');
var examRoutes = require('./routes/examRoutes');

var app = express();

/* 
✅ CORS configuration with multiple origins from .env
In your .env file, set:
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
*/
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json({ limit: "50mb" })); // For JSON payloads
app.use(express.urlencoded({ limit: "50mb", extended: true })); // For form data

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/inquiry', inquiryRoutes);
app.use('/student', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/exams', examRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
