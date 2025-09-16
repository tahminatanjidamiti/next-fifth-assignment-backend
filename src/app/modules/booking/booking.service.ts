/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IRideBooking } from "./booking.interface";
import { RideBooking } from "./booking.model";
import { getTransactionId } from "../../utils/getTransactionId";
import { Ride } from "../ride/ride.model";
import { FilterQuery } from "mongoose";


const createRideBooking = async (payload: Partial<IRideBooking>) => {
  const transactionId = getTransactionId();

  const session = await RideBooking.startSession();
  session.startTransaction();

  try {
    const riderId = payload.rider;
    const rider = await User.findById(riderId);
    if (!rider?.phone || !rider.address) {
      throw new AppError(httpStatus.BAD_REQUEST, "Please update your profile to book a ride.");
    }

    const ride = await Ride.findById(payload.ride).select("fare");
    if (!ride?.fare) {
      throw new AppError(httpStatus.BAD_REQUEST, "Ride fare not found!");
    }

    const amount = Number(ride.fare) * Number(payload.riderCount!);

    const booking = await RideBooking.create([{
      rider : riderId,
      status: BOOKING_STATUS.PENDING,
      ...payload
    }], { session });

    const payment = await Payment.create([{
      booking: booking[0]._id,
      status: PAYMENT_STATUS.UNPAID,
      transactionId,
      amount,
    }], { session });

    const updatedBooking = await RideBooking.findByIdAndUpdate(
      booking[0]._id,
      { payment: payment[0]._id },
      { new: true, runValidators: true, session }
    )
      .populate("rider", "name email phone address")
      .populate("ride", "title fare")
      .populate("payment");

    const sslPayload: ISSLCommerz = {
      name: (updatedBooking?.rider as any).name,
      email: (updatedBooking?.rider as any).email,
      phoneNumber: (updatedBooking?.rider as any).phone,
      address: (updatedBooking?.rider as any).address,
      amount,
      transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();

    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getUserBookings = async (filter: FilterQuery<IRideBooking>) => {
  const bookings = await RideBooking.find(filter)
    .populate("ride", "riderId driverId fare pickupLocation dropoffLocation") 
    .populate("driver", "name email") 
    .populate("rider", "name email")
    .populate("payment")
    .sort({ createdAt: -1 });

  return bookings;
};

const getBookingById = async (bookingId: string) => {
  const booking = await RideBooking.findById(bookingId)
    .populate("ride", "riderId driverId fare")
    .populate("payment")
    .populate("rider", "name email phone address")
    .populate("driver", "name email phone address");

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};

const updateBookingStatus = async (
  bookingId: string,
  newStatus: BOOKING_STATUS
) => {

  const updatedBooking = await RideBooking.findByIdAndUpdate(
    bookingId,
    { status: newStatus },
    { new: true, runValidators: true }
  );

  if (!updatedBooking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return updatedBooking;
};

const getAllBookings = async () => {
  const bookings = await RideBooking.find()
    .populate("ride", "riderId driverId fare")
    .populate("rider", "name email")
    .populate("payment")
    .sort({ createdAt: -1 });

  return bookings;
};
export const BookingService = {
    createRideBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};