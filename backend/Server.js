import mongoose from "mongoose";

// رابط الاتصال بقاعدة البيانات MongoDB
const mongoURI="mongodb+srv://TMS_Admin:TMS_Admin_2025@database.u7t0edf.mongodb.net/myDatabase?retryWrites=true&w=majority";
// الاتصال بقاعدة البيانات MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("تم الاتصال بقاعدة البيانات MongoDB بنجاح");
  })
  .catch((err) => {
    console.error("فشل الاتصال بقاعدة البيانات MongoDB:", err.message);
  });

// التحقق من حالة الاتصال
const db = mongoose.connection;

// التحقق من حالة الاتصال
db.on("error", (err) => {
  console.error("حدث خطأ في الاتصال:", err);
});

// حالة الاتصال الناجحة
db.once("open", () => {
  console.log("تم الاتصال بقاعدة البيانات بنجاح!");
});

// التحقق من حالة الاتصال بشكل ديناميكي
setInterval(() => {
  console.log(`حالة الاتصال الحالية: ${mongoose.connection.readyState}`);
}, 5000); // يتم التحقق كل 5 ثواني
