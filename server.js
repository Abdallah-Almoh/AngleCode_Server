const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException',err =>{
    console.log(err.name,err.message);
    console.log('UNCAOUGHT  EXCEPTION💥 Shutting down ...'); 
      process.exit(1);   
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB= process.env.DATABASE.replace(
  '<PASSWORD>',process.env.DATABASE_PASSWORD
);
mongoose.
connect(DB, {
  useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('DB connection Successful!'));


const port = process.env.PORT || 3333;
const server =  app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection',err=>{
  console.log(err.name,err.message);
  console.log('UNHANDLED REJECTED 💥 Shutting down ...');   
  server.close( ()=>{
    process.exit(1);
  });
  });
  
  