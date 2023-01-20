import mongoose from 'mongoose';

// Interface that describes the properties required to create a new Payment
interface PaymentAttrs {
  stripeId: string;
  orderId: string;
}

// An interface that describes the properties that a Payment model has.  The build
// method helps with type checking
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

// An interface that describes the properties that a user document has. Monog may add additional properties
// that are not required at creation (e.g. createdDates).  Doc is one single record
interface PaymentDoc extends mongoose.Document {
  stripeId: string;
  orderId: string;
}

const PaymentSchema = new mongoose.Schema(
  {
    stripeId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  {
    // Cleanup how the JSON is mapped, to remove Mongo specific fields and use "id" as a common property of the Payment
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Use statics on model to include new method on mongoose model to support TS
PaymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  PaymentSchema
);

export { Payment };
