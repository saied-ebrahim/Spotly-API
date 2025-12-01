// controllers/category-controller.js
import expressAsyncHandler from "express-async-handler";
import * as categoryService from "../services/category-service.js";

/**
 * @desc   Create new category
 * @route  POST /api/v1/categories
 * @access Protected
 */
export const createCategory = expressAsyncHandler(async (req, res, next) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ status: "success", data: { category } });
});

/**
 * @desc   Get all categories
 * @route  GET /api/v1/categories
 * @access Public
 */
export const getAllCategories = expressAsyncHandler(async (req, res, next) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({ status: "success", results: categories.length, data: { categories } });
});

/**
 * @desc   Get category by ID
 * @route  GET /api/v1/categories/:id
 * @access Public
 */
export const getCategoryById = expressAsyncHandler(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({ status: "success", data: { category } });
});

/**
 * @desc   Update category
 * @route  PATCH /api/v1/categories/:id
 * @access Protected
 */
export const updateCategory = expressAsyncHandler(async (req, res, next) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({ status: "success", data: { category } });
});

/**
 * @desc   Delete category
 * @route  DELETE /api/v1/categories/:id
 * @access Protected
 */
export const deleteCategory = expressAsyncHandler(async (req, res, next) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
