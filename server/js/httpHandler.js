const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const queue = require('./messageQueue');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if (req.method === 'GET') {
    if (req.url === '/background.jpg') {
      fs.readFile(module.exports.backgroundImageFile, (error, buffer) => {
        if (error) {
          res.writeHead(404, headers);
        } else {
          // console.log('no error')
          res.writeHead(200, headers);
          res.write(buffer);
        }
        res.end();
        next();
      });
    }
    if (req.url === '/swim') {
      let direction = queue.dequeue();
      if (direction) {
        res.writeHead(200, headers);
        res.write(direction);
      } else {
        const directions = ['up', 'down', 'left', 'right'];
        const randomNum = Math.floor(Math.random() * 4);
        const randomDirection = directions[randomNum];
        res.writeHead(200, headers);
        res.write(randomDirection);
      }
      res.end();
      next();
    }
  }

  if (req.method === 'POST') {
    if (req.url === '/') {
      res.writeHead(201, headers);
      var image = Buffer.alloc(0);
      req.on('data', (chunk) => {
        image = Buffer.concat([image, Buffer.from(chunk)]);
      })
      req.on('end', () => {
        let multi = multipart.getFile(image);
        fs.writeFile(module.exports.backgroundImageFile, multi.data, (err) => {
          if (err) {
            console.log(err);
          }
        })
      })
      res.end();
      next();
    }
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    next();
  }
  // next(); // invoke next() at the end of a request to help with testing!
};
