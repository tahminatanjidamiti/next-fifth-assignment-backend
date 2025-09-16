/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { RideBooking } from "../booking/booking.model";
import { IRide } from "../ride/ride.interface";
import { Ride } from "../ride/ride.model";
import { Driver } from "../driver/driver.model";

const initPayment = async (bookingId: string) => {

    const payment = await Payment.findOne({ booking: bookingId })

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found. You have not booked this ride")
    }

    const booking = await RideBooking.findById(payment.booking)

    const userAddress = (booking?.rider as any).address
    const userEmail = (booking?.rider as any).email
    const userPhoneNumber = (booking?.rider as any).phone
    const userName = (booking?.rider as any).name

    const sslPayload: ISSLCommerz = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload)

    return {
        paymentUrl: sslPayment.GatewayPageURL
    }

};
const successPayment = async (query: Record<string, string>) => {

    const session = await RideBooking.startSession();
    session.startTransaction()

    try {
        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID,
        }, { new: true, runValidators: true, session: session })

        if (!updatedPayment) {
            throw new AppError(401, "Payment not found")
        }

        const updatedBooking = await RideBooking
            .findByIdAndUpdate(
                updatedPayment?.booking,
                { status: BOOKING_STATUS.COMPLETE },
                { new: true, runValidators: true, session }
            )
            .populate("ride", "riderId driverId")
            .populate("rider", "name email")

        if (!updatedBooking) {
            throw new AppError(401, "Booking not found")
        }
        const ride = await Ride.findByIdAndUpdate(
            updatedBooking.ride?._id,
            { status: "COMPLETED" }, // or use RideStatus.COMPLETED if you have enum
            { session }
        );

        // ✅ Update driver stats dynamically
        if (ride?.driverId && ride?.fare && updatedBooking?.riderCount) {
            await Driver.findByIdAndUpdate(
                ride.driverId,
                {
                    $inc: {
                        "driverProfile.earnings": ride.fare * updatedBooking.riderCount,
                    },
                },
                { new: true, session }
            );
        }



        const invoiceData: IInvoiceData = {
            bookingDate: updatedBooking.createdAt as Date,
            riderCount: updatedBooking.riderCount,
            riderId: (updatedBooking.ride as unknown as IRide).riderId,
            driverId: (updatedBooking.ride as unknown as IRide).driverId,
            totalAmount: updatedPayment.amount,
            transactionId: updatedPayment.transactionId,
            userName: (updatedBooking.rider as unknown as IUser).name
        }

        const pdfBuffer = await generatePdf(invoiceData)

        const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        if (!cloudinaryResult) {
            throw new AppError(401, "Error uploading pdf")
        }

        await Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { runValidators: true, session })

        await sendEmail({
            to: (updatedBooking.rider as unknown as IUser).email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        })

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: true, message: "Payment Completed Successfully" }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        throw error
    }
};
const failPayment = async (query: Record<string, string>) => {

    const session = await RideBooking.startSession();
    session.startTransaction()

    try {


        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.FAILED,
        }, { new: true, runValidators: true, session: session })

        await RideBooking
            .findByIdAndUpdate(
                updatedPayment?.booking,
                { status: BOOKING_STATUS.FAILED },
                { runValidators: true, session }
            )

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: false, message: "Payment Failed" }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        throw error
    }
};
const cancelPayment = async (query: Record<string, string>) => {

    const session = await RideBooking.startSession();
    session.startTransaction()

    try {
        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.CANCELLED,
        }, { runValidators: true, session: session })

        await RideBooking
            .findByIdAndUpdate(
                updatedPayment?.booking,
                { status: BOOKING_STATUS.CANCEL },
                { runValidators: true, session }
            )

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: false, message: "Payment Cancelled" }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        throw error
    }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
    const payment = await Payment.findById(paymentId)
        .select("invoiceUrl")

    if (!payment) {
        throw new AppError(401, "Payment not found")
    }

    if (!payment.invoiceUrl) {
        throw new AppError(401, "No invoice found")
    }

    return payment.invoiceUrl
};


export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl
};