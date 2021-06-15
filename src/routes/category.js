const express=require('express');
const { addCategory, fetchCategory, updateCategories, deleteCategories } = require('../controller/category');
const { requireSignin, adminMiddleware } = require('../middleware');
const multer=require('multer');
const router=express.Router();
const path=require('path');
const shortid = require('shortid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(path.dirname(__dirname),'uploads'))
    },
    filename: function (req, file, cb) {
      cb(null, shortid.generate() + '-' + file.originalname)
    }
})

const upload=multer({storage})

router.post('/category/create',requireSignin,adminMiddleware,upload.single('categoryImage'),addCategory);
router.get('/category/fetchcategory',fetchCategory);
router.post('/category/update',upload.array('categoryImage'),updateCategories);
router.post('/category/delete',deleteCategories);

module.exports=router;