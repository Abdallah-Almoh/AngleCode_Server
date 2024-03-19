const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures= require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const Ad = require('../models/AdModel');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img'); 
      },
      filename: (req,file,cb)=>{
        const ext = file.mimetype.split('/')[1];
        cb(null,`${uuidv4()}-User-Ad-${req.user.id}-${Date.now()}.${ext}`);
      }
    
    });
    
      const multerFilter = (req,file,cb)=>{
        if(file.mimetype.startsWith('image')){
          cb(null,true);
        }else{
          cb(new appError('Not an image ! please uploade image',40),false);
        }
      };
      const Upload = multer({
        storage: multerStorage,
        fileFilter: multerFilter
      });
      exports.UploadPhoto = Upload.array('images',10);

      exports.AddAd = catchAsync(async(req,res,next)=>{
          const images = req.files.map(file => file.filename);

          const  ad =  new Ad({
              user:req.user._id,
              images: images ? images : null,
              details:req.body.details
          });
          await ad.save();
          res.status(200).json({
              status:'Success',
              data:ad
          });
        });
        exports.updateAd = catchAsync(async(req,res,next)=>{
            const AdId = req.params.id;
            const ad = await Ad.findById(AdId);
            if(!ad ){
                return next(new appError('ad not found',404));
            }
            const userId =  ad.user;
            console.log(userId, req.user._id);
            if((req.user.role!=='superAdmin'&& userId.toSting() !== req.user._id.toSting()) || ad.accepted === true ){
                return next(new appError('You are not authorized to perform this action', 403));
            }
            const images = req.files.map(file => file.filename);
                const AdUpdatedData = {
                    images: images ? images : ad.images,
                    details: req.body.details || ad.details,
                };
                const updatedAd = await Ad.findByIdAndUpdate(AdId,AdUpdatedData, {
                    new:true ,
                    runValidators:true
                });
                res.status(200).json({
                    status:'Success',
                    data:updatedAd
                });
        });
        exports.getUnAcceptedAd = catchAsync(async(req,res,next)=>{
            if(req.user.role!=='superAdmin'){
                return next(new appError('You are not authorized to perform this action', 403));
            }
            const ads = await Ad.find({accepted:false}).populate('user','first_name last_name avatar email phone_number');
           res.status(201).json({
               status:'Success',
               data:ads
           }) ;
        });
        exports.AcceptAd = catchAsync(async(req,res,next)=>{
            if(req.user.role!=='superAdmin'){
                return next(new appError('You are not authorized to perform this action', 403));
            }
            const adID = req.params.id;
            const ad = await Ad.findByIdAndUpdate(adID,{accepted:true},{new:true});
            res.status(200).json({
                status:'Success',
                data:ad
            });
        });
        exports.getAcceptedAds = catchAsync(async(req,res,next)=>{
            if(req.user.role!=='superAdmin'){
                return next(new appError('You are not authorized to perform this action', 403));
            }
            const ads = await Ad.find({accepted:true}).populate('user','first_name last_name avatar email phone_number');
            res.status(201).json({
                status:'Success',
                data:ads
            }) ;
        });
        exports.getAds = catchAsync(async(req,res,next)=>{
            if(req.user.role!=='superAdmin'){
                return next(new appError('You are not authorized to perform this action', 403));
            }
            const ads = await Ad.find({accepted:true}).select('images');
            res.status(201).json({
                status:'Success',
                data:ads
            }) ;
        });
        exports.deleteAd = catchAsync(async(req,res,next)=>{
            const adId = req.params.id;
            const ad = await Ad.findById(adId);
            const userId =ad.user;
            if(req.user.role!=='superAdmin'&& userId.toSting() !==req.user._id.toSting()){
                return next(new appError('You are not authorized to perform this action', 403));
            }
           await Ad.findByIdAndDelete(adId);
           res.status(200).json({
            status:'Success',
            data:null
           }) ;
        });
        