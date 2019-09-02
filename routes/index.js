var express = require('express');
var router = express.Router();
var multer  = require('multer')
const {PythonShell} = require('python-shell')

var fileName;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    fileName = file.fieldname + '-' + Date.now()
    cb(null, fileName)
  }
})
 
var upload = multer({ storage: storage })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', image: fileName });
});

router.post('/recognize', upload.single('face_image'), function (req, res, next) {
    const file = req.file;
    const body = req.body;

    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python3',["/Users/personal/Desktop/oapp-server/OApp-master/Source/node-test.py"]);

    pythonProcess.stdout.on('data', (data) => {
      // Do something with the data returned from python script
      var results = data.toString().split('\n');
      console.log(results);
      res.send(results);
    });

    // res.redirect('/');
})

module.exports = router;
