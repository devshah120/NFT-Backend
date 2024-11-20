// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import jwt from "jsonwebtoken"

const Schema = mongoose.Schema;

const userSchema = new Schema({
  
  Name:{
    type: String,
    required: true,
  },
  Email:{
    type: String,
    required: true,
  },
  MetaHash:{
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  MainImage_URL: {
    type: String,
    required: true,
  },
  BgImage_URL: {
    type: String,
    required: true,
  },
  RefreshToken: {
    type: String,
  }
  
},{
    collection: 'User',
    timestamps: true,
});


// userSchema.methods.generateRefreshToken = function(){
//   jwt.sign({
//     _id: this._id,
//     metaHash: this._metaHash,
//   },
//   process.env.REFRESH_TOKEN_SECRET,
//   {
//     expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//   }
// )
// }
export const UserSchemas = mongoose.model('User', userSchema);

