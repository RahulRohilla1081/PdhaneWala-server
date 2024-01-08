// var createError = require("http-errors");
var express = require("express");
var path = require("path");
var app = express();
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "abcd1234key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.set('view engine', 'html');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

var testingTestingRouter = require("./main_api/testing/testing");

var studentGetRouter = require("./main_api/student/student_get");
var studentUpdateRouter = require("./main_api/student/student_update");
var studentGetByCustomerIdRouter = require("./main_api/student/student_get_by_customer_id");
var studentCourseBatchCreateRouter = require("./main_api/student/student_course_batch_create");
var studentByBatchGetRouter = require("./main_api/student/student_by_batch_get");
var studentDataByStudentIdGetRouter = require("./main_api/student/student_data_by_studentId_get");
var studentFeeUpdateGetRouter = require("./main_api/student/student_fee_update");
var studentCourseCompletedUpdateRouter = require("./main_api/student/student_course_completed_update");
var tambulaGeneratorRouter = require("./main_api/tambula_generator");
// var studentEmailSendRouter = require("./main_api/student/student_email_send");
// var singleImageUploadRouter = require("./main_api/student/single_image_upload");
// // var studentIDgetRouter = require("./main_api/student/student_ID_get");

var teacherCreateRouter = require("./main_api/teacher/teacher_create");
var teacherUpdateRouter = require("./main_api/teacher/teacher_update");
var teacherGetByCustomerIdRouter = require("./main_api/teacher/teacher_get_by_customer_id");
var weekdayBatchDataByTeacherIdGetRouter = require("./main_api/teacher/weekday_batch_data_by_teacher_id_get");

var courseGetByCustomerIDRouter = require("./main_api/course/course_get_by_customerID");
var courseCreateRouter = require("./main_api/course/course_create");
var courseUpdateRouter = require("./main_api/course/course_update");

// var customerCreateRouter = require("./main_api/customer/customer_create");
var customerGetRouter = require("./main_api/customer/customer_get");
var customerInstituteDetailsSaveRouter = require("./main_api/customer/customer_institute_details_save");
var customerInstituteInfoUpdateRouter = require("./main_api/customer/customer_institute_info_update");
var customerDefaultCertificateUpdateRouter = require("./main_api/certificate_template/customer_default_certificate_update");
// var loginCustomerIdGetRouter = require("./main_api/customer/login_customer_id_get");

var batchGetByCustomerIDRouter = require("./main_api/batch/batch_get_by_customerID");
var batchCreateRouter = require("./main_api/batch/batch_create");
var batchUpdateRouter = require("./main_api/batch/batch_update");
var weekdayBatchDataGetRouter = require("./main_api/batch/weekday_batch_data_get");
var batchDataByBatchNoGetRouter = require("./main_api/batch/batch_data_by_batch_no_get");

var signupUserFormRouter = require("./main_api/login/signupUser_form");
var signupUserGmailRouter = require("./main_api/login/signupUser_gmail");
var customerEmailVerifiedUpdateRouter =
  require("./main_api/login/customer_email_verified_update").router;
var sessionGetRouter = require("./main_api/login/session_get");
var loginVerifyIdPasswordRouter = require("./main_api/login/login_validate_session_create");
var studentTeacherLoginValidateTokenRouter = require("./main_api/login/student_teacher_login_validate_token");
var studentTeacherResetPasswordRouter = require("./main_api/login/student_teacher_reset_password");
var logoutSessionDeleteRouter = require("./main_api/login/logout_session_delete");
var profilePasswordUpdateRouter = require("./main_api/login/profile_password_update");
var forgotPasswordMailSendRouter = require("./main_api/login/forgot_password_mail_send");
var activeSessionsGetByUserIDRouter = require("./main_api/login/active_sessions_get_by_userID");

var attendanceCreateUpdateRouter = require("./main_api/attendance/attendance_create_update");
var attendanceByStudentIdGetRouter = require("./main_api/attendance/attendance_by_student_id_get");
var attendanceByCustomerFilteredGetRouter = require("./main_api/attendance/attendance_by_customer_filtered_get");
var attendanceExportMailRouter = require("./main_api/attendance/attendance_export_mail");
var attendanceFilterDataGetRouter = require("./main_api/attendance/attendance_filter/attendance_filter_data_get");
var attendanceApproveRejectRouter = require("./main_api/attendance/attendance_approval/attendance_approve_reject");

var userProfileUpdateRouter = require("./main_api/user/user_profile_update");

var rozerpay = require("./main_api/rozerpay/rozerpay");
var rozerpay_success = require("./main_api/rozerpay/rozerpay_success");
var testingRouter = require("./main_api/testing.js");
var testingDataRouter = require("./main_api/testing/texting_data.js");
var dbBackupRouter = require("./main_api/testing/db_backup.js");

var certificateTemplateCreateRouter = require("./main_api/certificate_template/certificate_template_create");
var certificateTemplateUpdateRouter = require("./main_api/certificate_template/certificate_template_update");
var certificateTemplatebyCustomerIDGetRouter = require("./main_api/certificate_template/certificate_template_by_customerID_get");

var notificationsCreateRouter = require("./main_api/notifications/notifications_create");
var notificationsUpdateRouter = require("./main_api/notifications/notifications_update");
var notificationsGetRouter = require("./main_api/notifications/notifications_get");
var notificationByUserIdGetRouter =
  require("./main_api/notifications/notification_by_user_id_get.js").router;
var notificationsSeenUpdateRouter = require("./main_api/notifications/notifications_seen_update");
var notificationsDeactivateRouter = require("./main_api/notifications/notifications_deactivate");

var chatSaveRouter = require("./main_api/chat/chat_save.js").router;
var chatGetRouter = require("./main_api/chat/chat_get.js").router;

app.use("/main_api/testing/testing", testingTestingRouter);
app.use("/main_api/testing/testing_data", testingDataRouter);
app.use("/main_api/tambula_generator", tambulaGeneratorRouter);

http: app.use("/main_api/student/student_get", studentGetRouter);
app.use("/main_api/student/student_update", studentUpdateRouter);
// app.use("/main_api/student/student_email_send", studentEmailSendRouter);
// app.use("/main_api/student/single_image_upload", singleImageUploadRouter);
app.use(
  "/main_api/student/student_get_by_customer_id",
  studentGetByCustomerIdRouter
);
app.use(
  "/main_api/student/student_course_batch_create",
  studentCourseBatchCreateRouter
);
app.use("/main_api/student/student_by_batch_get", studentByBatchGetRouter);
app.use(
  "/main_api/student/student_data_by_studentId_get",
  studentDataByStudentIdGetRouter
);
app.use("/main_api/student/student_fee_update", studentFeeUpdateGetRouter);
app.use(
  "/main_api/student/student_course_completed_update",
  studentCourseCompletedUpdateRouter
);
// // app.use("/main_api/student/student_ID_get", studentIDgetRouter);

app.use("/main_api/teacher/teacher_create", teacherCreateRouter);
app.use("/main_api/teacher/teacher_update", teacherUpdateRouter);
app.use(
  "/main_api/teacher/teacher_get_by_customer_id",
  teacherGetByCustomerIdRouter
);
app.use(
  "/main_api/teacher/weekday_batch_data_by_teacher_id_get",
  weekdayBatchDataByTeacherIdGetRouter
);

app.use(
  "/main_api/course/course_get_by_customerID",
  courseGetByCustomerIDRouter
);
app.use("/main_api/course/course_create", courseCreateRouter);
app.use("/main_api/course/course_update", courseUpdateRouter);

// app.use("/main_api/customer/customer_create", customerCreateRouter);
app.use(
  "/main_api/customer/customer_institute_details_save",
  customerInstituteDetailsSaveRouter
);
app.use("/main_api/customer/customer_get", customerGetRouter);
app.use(
  "/main_api/certificate_template/customer_default_certificate_update",
  customerDefaultCertificateUpdateRouter
);
app.use(
  "/main_api/customer/customer_institute_info_update",
  customerInstituteInfoUpdateRouter
);
// app.use("/main_api/customer/login_customer_id_get", loginCustomerIdGetRouter);

app.use("/main_api/batch/batch_get_by_customerID", batchGetByCustomerIDRouter);
app.use("/main_api/batch/batch_create", batchCreateRouter);
app.use("/main_api/batch/batch_update", batchUpdateRouter);
app.use("/main_api/batch/weekday_batch_data_get", weekdayBatchDataGetRouter);
app.use(
  "/main_api/batch/batch_data_by_batch_no_get",
  batchDataByBatchNoGetRouter
);

app.use("/main_api/login/signupUser_form", signupUserFormRouter);
app.use("/main_api/login/signupUser_gmail", signupUserGmailRouter);
app.use(
  "/main_api/login/customer_email_verified_update",
  customerEmailVerifiedUpdateRouter
);

app.use("/main_api/login/session_get", sessionGetRouter);
app.use(
  "/main_api/login/login_validate_session_create",
  loginVerifyIdPasswordRouter
);

app.use(
  "/main_api/login/student_teacher_login_validate_token",
  studentTeacherLoginValidateTokenRouter
);
app.use(
  "/main_api/login/student_teacher_reset_password",
  studentTeacherResetPasswordRouter
);
app.use("/main_api/login/profile_password_update", profilePasswordUpdateRouter);
app.use("/main_api/login/logout_session_delete", logoutSessionDeleteRouter);
app.use(
  "/main_api/login/forgot_password_mail_send",
  forgotPasswordMailSendRouter
);
app.use(
  "/main_api/login/active_sessions_get_by_userID",
  activeSessionsGetByUserIDRouter
);

app.use(
  "/main_api/certificate_template/certificate_template_create",
  certificateTemplateCreateRouter
);
app.use(
  "/main_api/certificate_template/certificate_template_update",
  certificateTemplateUpdateRouter
);
app.use(
  "/main_api/certificate_template/certificate_template_by_customerID_get",
  certificateTemplatebyCustomerIDGetRouter
);

app.use(
  "/main_api/attendance/attendance_create_update",
  attendanceCreateUpdateRouter
);
app.use(
  "/main_api/attendance/attendance_by_student_id_get",
  attendanceByStudentIdGetRouter
);
app.use(
  "/main_api/attendance/attendance_by_customer_filtered_get",
  attendanceByCustomerFilteredGetRouter
);
app.use(
  "/main_api/attendance/attendance_export_mail",
  attendanceExportMailRouter
);
app.use(
  "/main_api/attendance/attendance_filter/attendance_filter_data_get",
  attendanceFilterDataGetRouter
);
app.use(
  "/main_api/attendance/attendance_approval/attendance_approve_reject",
  attendanceApproveRejectRouter
);
app.use("/main_api/testing/db_backup", dbBackupRouter);

app.use(
  "/main_api/notifications/notifications_create",
  notificationsCreateRouter
);
app.use(
  "/main_api/notifications/notifications_update",
  notificationsUpdateRouter
);
app.use(
  "/main_api/notifications/notifications_seen_update",
  notificationsSeenUpdateRouter
);
app.use("/main_api/notifications/notifications_get", notificationsGetRouter);
app.use(
  "/main_api/notifications/notification_by_user_id_get",
  notificationByUserIdGetRouter
);
app.use(
  "/main_api/notifications/notifications_deactivate",
  notificationsDeactivateRouter
);

app.use("/main_api/chat/chat_save", chatSaveRouter);
app.use("/main_api/chat/chat_get", chatGetRouter);

app.use("/main_api/user/user_profile_update", userProfileUpdateRouter);

app.use("/payment", rozerpay);
app.use("/payment/success", rozerpay_success);

app.use("/main_api/testing", testingRouter);

app.use(express.static(__dirname + "/assets/student_id_uploads"));
app.use(express.static(__dirname + "/assets/student_profile_uploads"));
app.use(express.static(__dirname + "/assets/teacher_id_uploads"));
app.use(express.static(__dirname + "/assets/teacher_profile_uploads"));
app.use(express.static(__dirname + "/assets/email_assets"));
app.use(express.static(__dirname + "/assets/certificate_template"));
app.use(express.static(__dirname + "/assets/customer_institute"));

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err,
  });
});

module.exports = app;
