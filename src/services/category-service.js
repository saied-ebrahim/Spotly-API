import Category from "../models/category-model.js";
import AppError from "../utils/AppError.js";

export const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
};

export const getAllCategories = async () => {
  const categories = await Category.find();
  return categories;
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByIdAndUpdate(categoryId, updateData, {new: true, runValidators: true});
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

export const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};
