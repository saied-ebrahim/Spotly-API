import Category from "../models/category-model.js";
import AppError from "../utils/AppError.js";

/**
 * Create new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
};

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
export const getAllCategories = async () => {
  const categories = await Category.find().populate("events");
  return categories;
};

/**
 * Get single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Category data
 */
export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).populate("events");

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

/**
 * Update category by ID
 * @param {string} categoryId - Category ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByIdAndUpdate(categoryId, updateData, {
    new: true,
    runValidators: true,
  }).populate("events");

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

/**
 * Delete category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Deleted category
 */
export const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};
