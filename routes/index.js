var express = require('express');
var router = express.Router();
var multer = require('multer')
var admin = require("firebase-admin");
const uuid = require('uuid/v1');
const { PythonShell } = require('python-shell');

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

var upload = multer({ storage: storage });
var db = admin.database();

router.get('/', function (req, res) {
  res.render('index', { title: 'Express', image: fileName });
});

router.post('/recognize', upload.single('face_image'), function (req, res) {
  const file = req.file;
  const body = req.body;

  let pillId = body.pill_number;
  let userId = body.user_id;

  // Sameple script: python3 demo.py --test_data_path=M5_1.mp4 --expected="M5" --name="xiyuan"

  let options = {
    scriptPath: '/Users/personal/Desktop/oapp-server/oapp-python/python',
    args: ['--test_data_path', '/Users/personal/Desktop/oapp-server/oapp-python/Images/M5_1.mp4', '--expected', pillId, '--name', userId]
  };

  var ref = db.ref(userId);
  let shell = new PythonShell('demo.py', options);
  var sessionId = uuid();

  var timestamp = Date.now();
  ref.child(sessionId + '/' + timestamp).set({
    message: "Starting ::: Loading",
    timestamp: timestamp
  });

  shell.on('message', function (message) {
    console.log(message);

    var timestamp = Date.now();
    ref.child(sessionId + '/' + timestamp).set({
      message: message,
      timestamp: timestamp
    });
  });

  shell.end(function (err, code, signal) {
    if (err) {
      console.log(err);
      var timestamp = Date.now();
      ref.child(sessionId + '/' + timestamp).set({
        message: err,
        timestamp: timestamp
      });
    };
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');

    var timestamp = Date.now();
    ref.child(sessionId + '/' + timestamp).set({
      message: 'Finished ::: The exit code was: ' + code,
      timestamp: timestamp
    });
  });

  res.redirect(`/results/${userId}/${sessionId}`);
});

router.get('/results/:userId/:sessionId', function (req, res) {
  const userId = req.params.userId;
  const sessionId = req.params.sessionId;
  res.render('result', { user: userId, session: sessionId });
});

module.exports = router;
