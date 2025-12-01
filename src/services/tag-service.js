import tagModel from "../models/tag-model.js";
import AppError from "../utils/AppError.js";

export const createTag = async (tagData) => {
  const tag = await tagModel.create(tagData);
  return tag;
};

export const getAllTags = async () => {
  const tags = await tagModel.find();
  return tags;
};

export const getTagById = async (tagId) => {
  const tag = await tagModel.findById(tagId);

  if (!tag) throw new AppError("Tag not found", 404);

  return tag;
};

export const updateTag = async (tagId, updateData) => {
  const tag = await tagModel.findByIdAndUpdate(tagId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!tag) throw new AppError("Tag not found", 404);

  return tag;
};

export const deleteTag = async (tagId) => {
  const tag = await tagModel.findByIdAndDelete(tagId);

  if (!tag) throw new AppError("Tag not found", 404);

  return tag;
};
