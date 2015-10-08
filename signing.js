var express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    aws = require('aws-sdk'),
    // crypto = require('crypto'),
    logger = require('morgan'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    crypto = require('crypto'),

    urlencodedBodyParser = bodyParser.urlencoded({extended: false}),
    app = express();


// app.set('views', __dirname + '/views');
// app.use(express.static(path.join(__dirname, 'public')));
app.use(logger("dev"));
app.use(methodOverride('_method'));
app.use(urlencodedBodyParser);

var read = fs.readFileSync('signing.json', 'utf8');
var parsed = JSON.parse(read);

app.get('/sign_s3', function(req, res){
  aws.config.update({accessKeyId: parsed.AWS_ACCESS_KEY, secretAccessKey: parsed.AWS_SECRET_KEY});
  var s3 = new aws.S3();
  var s3_params = {
    Bucket: parsed.S3_BUCKET,
    Key: req.query.file_name,
    Expires: 300,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };

  var fileName = 'danny/'+req.query.file_name
  // var expiration = new Date(new Date().getTime() + 1000 * 60 * 5).toISOString();
  //
  //  var policy =
  //  { "expiration": expiration,
  //    "conditions": [
  //      {"bucket": parsed.S3_BUCKET},
  //      {"key": fileName},
  //      {"acl": 'public-read-write'},
  //      ["starts-with", "$Content-Type", ""]
  //     //  ["content-length-range", 0, 524288000]
  // ]};
  //
  // policyBase64 = new Buffer(JSON.stringify(policy), 'utf8').toString('base64');
  // signature = crypto.createHmac('sha1', parsed.AWS_SECRET_KEY).update(policyBase64).digest('base64');
  // var return_data = {
  //   bucket: parsed.S3_BUCKET,
  //   awsKey: parsed.AWS_ACCESS_KEY,
  //   policy: policyBase64,
  //   signature: signature,
  //   url: 'https://' +parsed.S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
  // };
  //
  // res.write(JSON.stringify(return_data));
  // res.end();




  s3.getSignedUrl('putObject', s3_params, function(err, data){
      if(err){
        console.log(err);
      }else{
        var return_data = {
          signed_request: data,
          url: 'https://' +parsed.S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
        };
        res.write(JSON.stringify(return_data));
        res.end();
      }
  });
});



app.listen(3000, function(){
  console.log("server listening on port 3000");
})
