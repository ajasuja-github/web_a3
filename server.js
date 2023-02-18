/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Aditya Jasuja___________________ Student ID: _172043218_____________ Date: ___17 feb 2023_____________
*
*  Online (Cyclic) Link: 
*
********************************************************************************/ 
var express = require("express");
var app = express();
const path = require("path");
const multer = require("multer");

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const dataService = require("./data-service");
const { MulterError } = require("multer");

function onHttpStart() {
console.log("Express http server listening on: " + HTTP_PORT);
}


app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/views/home.html"));
});
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/students/add", function(req, res) {
    res.sendFile(path.join(__dirname, "views", "addStudent.html"));
});
  
app.get("/images/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
});



app.get('/students', (req, res) => {
    const status = req.query.status;
    const program = req.query.program;
    const credential = req.query.credential;
  
    if (status) {
      dataService.getStudentsByStatus(status)
        .then((students) => {
          res.send(students);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send("Error retrieving students");
        });
    } else if (program) {
      dataService.getStudentsByProgramCode(program)
        .then((students) => {
          res.send(students);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send("Error retrieving students");
        });
    } else if (credential) {
      dataService.getStudentsByExpectedCredential(credential)
        .then((students) => {
          res.send(students);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send("Error retrieving students");
        });
    } else {
      dataService.getAllStudents()
        .then((students) => {
          res.send(students);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send("Error retrieving students");
        });
    }
  });
  

app.get("/intlstudents", function(req, res){
    dataService.getIntlStudent()
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        res.send(err);
    });
});

app.get("/programs", function(req, res){
    dataService.getPrograms().then((data) =>{
        res.send(data);
    }).catch((err) =>{
        res.send(err);
    });
});

app.get("/images", function(req, res){
    dataService.getImages().then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});

app.get('/student/:id', (req, res) => {
    const id = req.params.id;
    dataService.getStudentById(id).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
        console.log(err);
    });
  });
  

cloudinary.config({
  cloud_name: 'dcyov99ps',
  api_key: '812931179295139',
  api_secret: 'e7mvXgZHbIUpiHZ23tgUBHcKmyM',
  secure: true
});
const upload = multer(); 
app.post("/images/add", upload.single("imageFile"), function (req, res) {
    if (req.file) {
       let streamUpload = (req) =>
        {
          return new Promise((resolve, reject) => 
          {
             let stream = cloudinary.uploader.upload_stream
             (
                (error, result) => 
                {
                   if (result) {
                      resolve(result);
                   } else {
                      reject(error);
                   }
                }
             );
             streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
       };
 
       async function upload(req) 
       {
          let result = await streamUpload(req);
          console.log(result);
          return result;
       }
 
       upload(req).then((uploaded) => 
       {
          processForm(uploaded.url);
       });
    } 
    else 
    {
       processForm("");
    }
 
    function processForm(imageUrl) 
    {
       dataService.addImage(imageUrl).then((data) =>
       {
            console.log("Image added successfully: ", data);
            res.redirect("/images");
       }).catch((err) =>
       {
            console.log("Error adding image: ", err);
            res.status(500).send("Error adding image: " + err);
       });
    }
 });

 app.use(express.urlencoded({ extended: true }));

 app.post("/students/add", function(req, res) {
    dataService.addStudent(req.body)
      .then(() => {
        console.log("Student added");
        res.redirect('/students');
      })
      .catch((err) => {
        res.status(500).send("Unable to add student");
      });
  });

 app.use((req, res) =>
 {
    res.status(404).send("<h2>404</h2><p>Page Not Found</p>");
});

dataService.initialize().then(() =>
{
    app.listen(HTTP_PORT, onHttpStart ); 
}).catch((err) =>
{
    res.send('Error', err);
})