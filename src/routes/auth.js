const express=require('express');
const { signup, signin } = require('../controller/auth');
const { check }=require('express-validator');
const { validateSignUpRequest, isRequestValidated, validateSignInRequest } = require('../validators/auth');

const router=express.Router();

router.post('/signup',validateSignUpRequest,isRequestValidated,signup);
router.post('/signin',validateSignInRequest,isRequestValidated,signin);

// router.post('/profile',requireSignin,(req,res)=>{
//     res.status(200).json({user:'profile'});
// })

module.exports=router;