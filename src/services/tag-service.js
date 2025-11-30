import Tag from "../models/tag-model.js";
import AppError from "../utils/AppError.js";

/**
 * Create new tag
 * @param {Object} tagData - Tag data
 * @returns {Promise<Object>} Created tag
 */
export const createTag = async (tagData) => {
  const tag = await Tag.create(tagData);
  return tag;
};

/**
 * Get all tags
 * @returns {Promise<Array>} Array of tags
 */
export const getAllTags = async () => {
  const tags = await Tag.find();
  return tags;
};

/**
 * Get single tag by ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} Tag data
 */
export const getTagById = async (tagId) => {
  const tag = await Tag.findById(tagId);

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  return tag;
};

/**
 * Update tag by ID
 * @param {string} tagId - Tag ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated tag
 */
export const updateTag = async (tagId, updateData) => {
  const tag = await Tag.findByIdAndUpdate(tagId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  return tag;
};

/**
 * Delete tag by ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} Deleted tag
 */
export const deleteTag = async (tagId) => {
  const tag = await Tag.findByIdAndDelete(tagId);

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  return tag;
};

