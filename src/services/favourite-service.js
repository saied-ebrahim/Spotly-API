import AppError from "../utils/AppError.js";
import eventModel from "../models/event-model.js";
import favouriteModel from "../models/favourite-model.js";

export const addFavourite = async (userID, eventID) => {
  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event is not found", 404);

  const check = await favouriteModel.findOne({ userID, eventID });
  if (check) throw new AppError("Event is already in favourites", 409);

  const newFavourite = await favouriteModel.create({ userID, eventID });
  if (!newFavourite) throw AppError("Failed to add favourite", 500);
};

export const getFavourites = async (userID, isAdmin = false) => {
  // Admin can see all favourites, regular users see only their own
  const query = isAdmin ? {} : { userID };
  const favourite = await favouriteModel.find(query).populate("userID", "firstName lastName email").populate("eventID");
  if (!favourite) throw new AppError("Failed to get favourites", 500);
  return favourite;
};

export const removeFavourite = async (userID, eventID) => {
  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event is not found", 404);

  const checkFav = await favouriteModel.findOne({ userID, eventID });
  if (!checkFav) throw new AppError("Event is not in Your Favourite", 409);

  const deleteFav = await favouriteModel.findByIdAndDelete({ _id: checkFav._id });
  if (deleteFav) return new AppError("Event is not deleted", 500);
};

export const removeAllFavourite = async (userID) => {
  const deleteFav = await favouriteModel.deleteMany({ userID });
  if (!deleteFav) throw new AppError("Falied to delete your favourite", 500);
};
