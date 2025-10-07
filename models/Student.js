const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String }, // ✅ Added surname
    fathername: { type: String }, // ✅ Added father’s name
    fatherphone: { type: String }, // ✅ Added father’s phone
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    dob: { type: Date },
    aadharno: { type: String }, // ✅ Added Aadhar number
    photo: { type: String }, // ✅ Student photo (URL or filename)
    Signature: { type: String }, // ✅ Student signature (URL or filename)

    grNumber: { type: String, unique: true }, // ✅ GR Number (must be unique)

    course: { type: String },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', unique: true },

    admissionDate: { type: Date, default: Date.now },
    joindate: { type: Date }, // ✅ Added joining date

    rafrence: { type: String }, // ✅ Added reference (recommendation source)

    totalFees: { type: Number, default: 0 }, // ✅ Total fees
    paidFees: { type: Number, default: 0 },  // ✅ Paid fees
    pendingFees: { type: Number, default: 0 }, // ✅ Pending fees
    feesHistory: [  // ✅ Installment records
        {
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            remark: { type: String } // optional note (like "1st installment")
        }
    ],

    status: {
        type: String,
        enum: ['Active', 'Completed', 'Dropped'],
        default: 'Active'
    },

    absentCount: {
        type: Number,
        default: 0
    },

    slotTime: {
        type: String, // Example: "8:00AM to 10:00AM"
        required: true
    },
    Note: {
        type: String,
        required: false
    },
    Asianpc: {
        type: Number,
        required: true
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }

}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
