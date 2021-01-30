import http from 'http'
import path from 'path'
import fs from 'fs'
import express, { Request, Response } from 'express'
import multer, { ErrorCode } from 'multer'
import ago from 's-ago';
const sprightly = require('sprightly')

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname,"/public")
const uploadDir = path.join(__dirname,"/public/uploads")

const handleError = (err:any, res:Response) => {
    console.log(err)
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const makeHtml = (filename : string) => {
    // filename was generated using Date.now()
    // eg 1209310312.png
    let date = new Date(parseInt(filename.split(".")[0]))
    let dateStr = date.toUTCString()
    return `<li class="card"><img class="drawing inset" width="256" height="256" src="uploads/${filename}"><p class="inset">Anonymous</p><p class="inset">${dateStr}</p></li>`
}

// make the uploads directory if it doesnt exist yet
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
}

// set up html template engine
app.engine('spy', sprightly); // The one line you have to add
app.set('views', path.join(__dirname,"/templates")); // specify the views directory (its ./views by default)
app.set('view engine', 'spy'); // register the template engine

// set up static asset middleware
app.use(express.static(publicDir))

// sign the guestbook
app.get('/', (_, res) => {
    let tags : string[] = []
    fs.readdir(uploadDir,(err, list)=>{
        let htmlString = ""
        if (list && list.length>0) {
            list.reverse()      // make latest entry the first element
            let sublist = list.slice(0,4) // use only the latest 4 entries
            sublist.forEach(file=>{
                htmlString+=makeHtml(file)
            })
        }
        res.render('sign.spy', { recent: htmlString , total: list.length});
    })
});

// view the guestbook
app.get('/entries', (_, res) => {

    let tags : string[] = []
    fs.readdir(uploadDir,(err, list)=>{
        let htmlEntries = ""
        let htmlLatest = ""
        if (list && list.length>0) {
            console.log(list)
            list.reverse()
            list.forEach(file=>{
                htmlEntries+=makeHtml(file)
            })
            const latestEntry = list[0]
            let latest = new Date(parseInt(latestEntry.split(".")[0]))
            htmlLatest = `<p>Last entry submitted ${ago(latest)}</p>`
        }
        res.render('gallery.spy', { images: htmlEntries , total: list.length , latest : htmlLatest});
    })
});

// upload handler
const upload = multer({dest: "./"})
app.post("/submission", upload.single('drawing'),(req:Request,res:Response)=>{

    const tempPath = req.file.path;
    const currDate = Date.now()
    const targetPath = path.join(__dirname, `./public/uploads/${currDate}.png`);

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }})

// start the server
httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
