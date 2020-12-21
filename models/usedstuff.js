var mongoose = require("mongoose");

var usedstuffSchema = new mongoose.Schema({
   name: String,
   // image is stored in Cloudinary storage, so we just need url and filename
   image: { url: String, filename: String }, 
   description: String,
   cost: Number,
   location: String,
   category: String,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   offers: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Offer"
      }
   ],
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
}, {
  usePushEach: true
} // new mongoDB doesn't support $pushall, so it needs push each
);

module.exports = mongoose.model("Usedstuff", usedstuffSchema);
