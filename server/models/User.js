const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-find-or-create');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    _id: { 
        type: String,
        required: true
    },
    email: { 
        type: String
    },
    name: { 
        type: String,
        required: true 
    },
    password: { 
        type: String
    },
    avatar: { 
        type: String, 
        default: `https://res.cloudinary.com/${ process.env.CLOUDINARY_NAME }/image/upload/v1563346601/chatmastery/users/csf01uctelwcfcqarn8y.jpg`
    },
    active: {
        type: Boolean,
        default: false
    },
    socialAuth: {
        type: Boolean,
        deafult: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

UserSchema.pre('save', function(next) {
    if (this.password && this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    next();
});

UserSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);