const express=require('express');
const { signup, signin,signout } = require('../../controller/admin/auth');
const { validateSignUpRequest,validateSignInRequest,isRequestValidated } = require('../../validators/auth');
const {requireSignin} = require('../../middleware');
const router=express.Router();


router.post('/admin/signin',validateSignInRequest,isRequestValidated,signin);
router.post('/admin/signup',validateSignUpRequest,isRequestValidated,signup);
router.post('/admin/signout',signout);

// router.post('/profile',requireSignin,(req,res)=>{
//     res.status(200).json({user:'profile'});
// })

module.exports=router;