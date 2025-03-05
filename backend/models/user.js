import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    
    // Phone Authentication Fields
    phoneNumber: {
        type: String,
        sparse: true,  // Allows null/undefined while still maintaining uniqueness
        validate: {
            validator: function(v) {
                // Required only if auth method is phone
                if (this.authMethod === 'phone') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Phone number is required for phone authentication'
        }
    },
    password: {
        type: String,
        validate: {
            validator: function(v) {
                // Required only if auth method is phone
                if (this.authMethod === 'phone') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Password is required for phone authentication'
        }
    },
    verificationCode: String,
    verificationCodeExpiry: Date,

    // Google Authentication Fields
    email: {
        type: String,
        sparse: true,  // Allows null/undefined while still maintaining uniqueness
        validate: {
            validator: function(v) {
                // Required only if auth method is google
                if (this.authMethod === 'google') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Email is required for Google authentication'
        }
    },
    googleId: {
        type: String,
        sparse: true,  // Allows null/undefined while still maintaining uniqueness
        validate: {
            validator: function(v) {
                // Required only if auth method is google
                if (this.authMethod === 'google') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Google ID is required for Google authentication'
        }
    },
    profileImage: String,

    // Common Fields
    isVerified: {
        type: Boolean,
        default: false
    },
    birthday: {
        type: Date,
        required: false
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', null],
        required: false
    },
    
    // Password Reset Fields
    resetPasswordToken: String,
    resetPasswordExpiredAt: Date,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// Pre-save middleware
userSchema.pre('save', function(next) {
    // Validate that either phone or google auth fields are present, but not both
    if (this.authMethod === 'phone' && (this.googleId || this.email)) {
        next(new Error('Phone authentication cannot have Google credentials'));
    }
    if (this.authMethod === 'google' && this.phoneNumber) {
        next(new Error('Google authentication cannot have phone credentials'));
    }
    next();
});

// Instance method to check if user can switch auth method
userSchema.methods.canSwitchAuthMethod = async function(newMethod) {
    if (this.authMethod === newMethod) {
        return { can: false, reason: 'Already using this authentication method' };
    }
    
    // Check if credentials for new method already exist for another user
    const query = newMethod === 'google' 
        ? { email: this.email }
        : { phoneNumber: this.phoneNumber };
    
    const existingUser = await mongoose.model('User').findOne(query);
    if (existingUser) {
        return { 
            can: false, 
            reason: `A user already exists with this ${newMethod === 'google' ? 'email' : 'phone number'}`
        };
    }
    
    return { can: true };
};

// Static method to create user with phone auth
userSchema.statics.createWithPhone = async function(userData) {
    return await this.create({
        ...userData,
        authMethod: 'phone',
        email: undefined,
        googleId: undefined
    });
};

// Static method to create user with Google auth
userSchema.statics.createWithGoogle = async function(userData) {
    return await this.create({
        ...userData,
        authMethod: 'google',
        phoneNumber: undefined,
        password: undefined
    });
};

export const User = mongoose.model("User", userSchema);