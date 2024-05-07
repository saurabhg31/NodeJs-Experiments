let port = 8080;
import { createServer } from 'http';
import { myDateTime } from './custom_modules/date_module';
import { parse } from 'url';
import { upperCase } from 'upper-case';
import { createConnection } from 'mysql';
let con = createConnection({
  host: "localhost",
  user: "root",
  password: "root"
});
let databaseConnectionStatus = 'Not connected';
con.connect(function (err) {
  if (err) throw err;
  databaseConnectionStatus = 'Connected';
  return true;
});

createServer(async function (req, res) {
  console.log('Request received at ' + myDateTime() + ' : http://localhost:' + port + req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let response = [];
  let payload = parse(req.url, true).query;
  if (payload.month) {
    payload.month = upperCase(payload.month);
  }
  let queryResult = null;
  if (payload.query) {
    await new Promise((resolve, reject) => {
      con.query(payload.query, function (err, result) {
        if (err) {
          reject(err.sqlMessage);
        } else {
          resolve(result);
          queryResult = result;
        }
      });
    }).then(result => {
      queryResult = result
    }).catch(error => {
      queryResult = error;
    });
  }
  response.push({
    'query_result': queryResult,
    'payload': payload,
    'message': 'First attempt at node js, time: ' + myDateTime(),
    'db': databaseConnectionStatus
  });
  res.write(JSON.stringify(response));
  res.end();
  console.log('--------------- Request completed at: ' + myDateTime());
}).listen(port);