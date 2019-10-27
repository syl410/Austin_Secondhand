var mongoose = require("mongoose");

var offerSchema = mongoose.Schema({
    price: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        email: String
    }
},
{
  usePushEach: true
}
);

module.exports = mongoose.model("Offer", offerSchema);