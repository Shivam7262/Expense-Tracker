import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Transaction title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    validate: {
      validator: function(value) {
        return value !== 0;
      },
      message: 'Amount cannot be zero'
    }
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  isSplit: {
    type: Boolean,
    default: false
  },
  splitDetails: {
    participants: [{
      name: String,
      amount: Number,
      paid: {
        type: Boolean,
        default: false
      }
    }],
    totalAmount: Number
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  paymentMethod: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment method cannot be more than 50 characters']
  },
  receipt: {
    type: String, // URL to receipt image
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return this.amount.toFixed(2);
});

// Virtual for transaction status
transactionSchema.virtual('status').get(function() {
  if (this.isSplit) {
    const paidParticipants = this.splitDetails.participants.filter(p => p.paid).length;
    const totalParticipants = this.splitDetails.participants.length;
    return `${paidParticipants}/${totalParticipants} paid`;
  }
  return 'completed';
});

// Pre-save middleware to set type based on amount
transactionSchema.pre('save', function(next) {
  if (this.amount > 0 && this.type !== 'income') {
    this.type = 'income';
  } else if (this.amount < 0 && this.type !== 'expense') {
    this.type = 'expense';
  }
  next();
});

// Static method to get user's transaction summary
transactionSchema.statics.getUserSummary = async function(userId, startDate, endDate) {
  const matchStage = {
    user: userId
  };
  
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $gt: ['$amount', 0] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0]
          }
        },
        transactionCount: { $sum: 1 }
      }
    }
  ]);
  
  return summary[0] || { totalIncome: 0, totalExpense: 0, transactionCount: 0 };
};

// Static method to get transactions by category
transactionSchema.statics.getByCategory = async function(userId, startDate, endDate) {
  const matchStage = {
    user: userId
  };
  
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction; 