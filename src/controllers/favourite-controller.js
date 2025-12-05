import expressAsyncHandler from "express-async-handler";
import * as favouriteService from "../services/favourite-service.js";

// @desc Add to your favourite
// @route /api/v1/favourite
export const addFavourite = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  const { eventID } = req.body;
  await favouriteService.addFavourite(userID, eventID);
  res.status(201).json({ status: "success", message: "Favourite added" });
});

// @desc Get all from favourite
// @route /api/v1/favourite
export const getFavourites = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  const favourite = await favouriteService.getFavourites(userID);
  res.status(200).json({ status: "success", favourite });
});

// @desc Delete by ID
// @route /api/v1/favourite/:id
export const removeFavourite = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  const { id } = req.params;
  console.log(id);
  await favouriteService.removeFavourite(userID, id);
  res.status(204).send();
});

// @desc Delete all
// @route /api/v1/favourite
export const removeAllFavourites = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  await favouriteService.removeAllFavourite(userID);
  res.status(204).send();
});
