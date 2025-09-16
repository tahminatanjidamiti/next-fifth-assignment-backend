/* eslint-disable no-console */
import { Request, Response } from "express";
import { ISosEvent, SosEvent } from "./sos.model";
import { sendEmail } from "../../utils/sendEmail";

const mapLink = (lat: number, lng: number): string =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

// ---------------- Create SOS ----------------
export const createSOS = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            contacts = [],
            initialLocation,
            live = false,
            durationMinutes = 0,
        }: {
            contacts: { email?: string }[];
            initialLocation?: { lat: number; lng: number };
            live?: boolean;
            durationMinutes?: number;
        } = req.body;

        if (!initialLocation) {
            res.status(400).json({ ok: false, message: "Initial location is required" });
            return;
        }

        const event: ISosEvent = await SosEvent.create({
            contacts,
            initialLocation: { ...initialLocation, ts: new Date() },
            live,
            liveExpiresAt: live
                ? new Date(Date.now() + durationMinutes * 60 * 1000)
                : null,
        });

        // Prepare map link
        const gmap = mapLink(initialLocation.lat, initialLocation.lng);

        // Send alert emails
        for (const c of contacts) {
            if (c.email) {
                try {
                    await sendEmail({
                        to: c.email,
                        subject: "🚨 SOS Alert",
                        templateName: "sosEmail",
                        templateData: {
                            location: gmap,
                        },
                    });
                } catch (mailErr) {
                    console.log(`❌ Failed to send SOS email to ${c.email}`, (mailErr as Error).message);
                }
            }
        }

        res.json({ ok: true, eventId: event._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
};

// ---------------- Update live location ----------------
export const updateSOS = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { lat, lng, ts }: { lat: number; lng: number; ts?: string } = req.body;

        const event = await SosEvent.findById(id);
        if (!event) {
            res.status(404).json({ ok: false, message: "Event not found" });
            return;
        }

        event.updates.push({
            lat,
            lng,
            ts: ts ? new Date(ts) : new Date(),
        });
        await event.save();

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
};

// ---------------- End SOS ----------------
export const endSOS = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const event = await SosEvent.findById(id);
        if (!event) {
            res.status(404).json({ ok: false, message: "Event not found" });
            return;
        }

        event.live = false;
        event.status = "resolved";
        await event.save();

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
};