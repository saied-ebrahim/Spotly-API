import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: [true, "Event ID is required"] },
  organizerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
  revenue: { type: Number, default: 0 },
  netIncomeAdmin: { type: Number, default: 0 },
  netIncomeOrganizer: { type: Number, default: 0 },
  ticketsSold: { type: Number, default: 0 },
  ticketsAvailable: { type: Number, default: 0 },
  waitingListCount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

const AnalyticsModel = mongoose.model("Analytics", AnalyticsSchema);

export default AnalyticsModel;
