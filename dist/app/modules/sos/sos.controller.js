"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endSOS = exports.updateSOS = exports.createSOS = void 0;
const sos_model_1 = require("./sos.model");
const sendEmail_1 = require("../../utils/sendEmail");
const mapLink = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
// ---------------- Create SOS ----------------
const createSOS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contacts = [], initialLocation, live = false, durationMinutes = 0, } = req.body;
        if (!initialLocation) {
            res.status(400).json({ ok: false, message: "Initial location is required" });
            return;
        }
        const event = yield sos_model_1.SosEvent.create({
            contacts,
            initialLocation: Object.assign(Object.assign({}, initialLocation), { ts: new Date() }),
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
                    yield (0, sendEmail_1.sendEmail)({
                        to: c.email,
                        subject: "🚨 SOS Alert",
                        templateName: "sosEmail",
                        templateData: {
                            location: gmap,
                        },
                    });
                }
                catch (mailErr) {
                    console.log(`❌ Failed to send SOS email to ${c.email}`, mailErr.message);
                }
            }
        }
        res.json({ ok: true, eventId: event._id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
});
exports.createSOS = createSOS;
// ---------------- Update live location ----------------
const updateSOS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { lat, lng, ts } = req.body;
        const event = yield sos_model_1.SosEvent.findById(id);
        if (!event) {
            res.status(404).json({ ok: false, message: "Event not found" });
            return;
        }
        event.updates.push({
            lat,
            lng,
            ts: ts ? new Date(ts) : new Date(),
        });
        yield event.save();
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
});
exports.updateSOS = updateSOS;
// ---------------- End SOS ----------------
const endSOS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const event = yield sos_model_1.SosEvent.findById(id);
        if (!event) {
            res.status(404).json({ ok: false, message: "Event not found" });
            return;
        }
        event.live = false;
        event.status = "resolved";
        yield event.save();
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Server error" });
    }
});
exports.endSOS = endSOS;
