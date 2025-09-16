/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";
import { Types } from "mongoose";

export interface IInvoiceData {
    transactionId: string;
    bookingDate: Date;
    userName: string;
    riderId: Types.ObjectId;
    driverId: Types.ObjectId;
    riderCount: number;
    totalAmount: number;
}

export const generatePdf = async (invoiceData: IInvoiceData): Promise<Buffer<ArrayBufferLike>> => {
    try {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const buffer: Uint8Array[] = [];

            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (err) => reject(err));

            // Title
            doc.fontSize(20).fillColor("#333").text("Invoice", { align: "center", underline: true });
            doc.moveDown(1.5);

            // Transaction Info
            doc.fontSize(14).fillColor("black");
            doc.text(`Transaction ID : ${invoiceData.transactionId}`);
            doc.text(`Booking Date : ${new Date(invoiceData.bookingDate).toLocaleString()}`);
            doc.text(`Customer : ${invoiceData.userName}`);

            doc.moveDown(1);

            // Divider
            doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
            doc.moveDown(1);

            // Ride Details
            doc.fontSize(14).text(`riderId: ${invoiceData.riderId}`);
            doc.text(`driverId: ${invoiceData.driverId}`);
            doc.text(`riders: ${invoiceData.riderCount}`);
            doc.text(`Total Amount: ৳${invoiceData.totalAmount.toFixed(2)}`);

            doc.moveDown(2);

            // Footer
            doc
                .font("Helvetica-Oblique") // ✅ built-in italic font
                .fontSize(12)
                .fillColor("#555")
                .text("Thank you for booking with us!", {
                    align: "center",
                });
            doc.end();
        });
    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `Pdf creation error ${error.message}`);
    }
};