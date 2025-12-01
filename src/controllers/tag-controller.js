// controllers/tag-controller.js
import expressAsyncHandler from "express-async-handler";
import * as tagService from "../services/tag-service.js";

/**
 * @desc   Create new tag
 * @route  POST /api/v1/tags
 * @access Protected
 */
export const createTag = expressAsyncHandler(async (req, res, next) => {
  const tag = await tagService.createTag(req.body);
  res.status(201).json({ status: "success", data: { tag } });
});

/**
 * @desc   Get all tags
 * @route  GET /api/v1/tags
 * @access Public
 */
export const getAllTags = expressAsyncHandler(async (req, res, next) => {
  const tags = await tagService.getAllTags();
  res.status(200).json({ status: "success", results: tags.length, data: { tags } });
});

/**
 * @desc   Get tag by ID
 * @route  GET /api/v1/tags/:id
 * @access Public
 */
export const getTagById = expressAsyncHandler(async (req, res, next) => {
  const tag = await tagService.getTagById(req.params.id);
  res.status(200).json({ status: "success", data: { tag } });
});

/**
 * @desc   Update tag
 * @route  PATCH /api/v1/tags/:id
 * @access Protected
 */
export const updateTag = expressAsyncHandler(async (req, res, next) => {
  const tag = await tagService.updateTag(req.params.id, req.body);
  res.status(200).json({ status: "success", data: { tag } });
});

/**
 * @desc   Delete tag
 * @route  DELETE /api/v1/tags/:id
 * @access Protected
 */
export const deleteTag = expressAsyncHandler(async (req, res, next) => {
  await tagService.deleteTag(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
