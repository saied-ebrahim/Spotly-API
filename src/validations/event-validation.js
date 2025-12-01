// validations/event-validation.js
import Joi from "joi";
import eventModel from "../models/event-model.js";
// Full validation for creating an event (based on Event model)
export const createEventValidation = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .custom(async (value) => {
      const x = await eventModel.findOne({ title: value });
      if (x) {
        throw new Error("Title already exists, choose another one");
      } else {
        return value;
      }
    })
    .messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "any.required": "Title is required",
    }),
  description: Joi.string().required().trim().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  date: Joi.date().iso().required().messages({
    "date.base": "Invalid date",
    "date.format": "Invalid date format",
    "any.required": "Date is required",
  }),
  time: Joi.string().required().trim().messages({
    "string.base": "Time must be a string",
    "string.empty": "Time is required",
    "any.required": "Time is required",
  }),

  location: Joi.object({
    country: Joi.string().required().trim().messages({
      "string.base": "Location country must be a string",
      "string.empty": "Location country is required",
      "any.required": "Location country is required",
    }),
    city: Joi.string().required().trim().messages({
      "string.base": "Location city must be a string",
      "string.empty": "Location city is required",
      "any.required": "Location city is required",
    }),
    address: Joi.string().required().trim().messages({
      "string.base": "Location address must be a string",
      "string.empty": "Location address is required",
      "any.required": "Location address is required",
    }),
    latitude: Joi.number().required().messages({
      "number.base": "Location latitude must be a number",
      "any.required": "Location latitude is required",
    }),
    longitude: Joi.number().required().messages({
      "number.base": "Location longitude must be a number",
      "any.required": "Location longitude is required",
    }),

    // Location
    location: Joi.object({
      country: Joi.string()
        .required()
        .trim()
        .messages({
          "string.base": "Location country must be a string",
          "string.empty": "Location country is required",
          "any.required": "Location country is required",
        }),
      city: Joi.string()
        .required()
        .trim()
        .messages({
          "string.base": "Location city must be a string",
          "string.empty": "Location city is required",
          "any.required": "Location city is required",
        }),
      address: Joi.string()
        .required()
        .trim()
        .messages({
          "string.base": "Location address must be a string",
          "string.empty": "Location address is required",
          "any.required": "Location address is required",
        }),
      latitude: Joi.number()
        .optional()
        .messages({
          "number.base": "Location latitude must be a number",
          "any.required": "Location latitude is required",
        }),
      longitude: Joi.number()
        .optional()
        .messages({
          "number.base": "Location longitude must be a number",
          "any.required": "Location longitude is required",
        }),
    })
      .required()
      .messages({
        "object.base": "Location is required",
        "any.required": "Location is required",
      }),

    media: Joi.array()
      .items(
        Joi.object({
          mediaType: Joi.string().required().valid("image", "video").messages({
            "string.base": "Media type must be a string",
            "string.empty": "Media type is required",
            "any.required": "Media type is required",
            "any.only": "Media type must be either 'image' or 'video'",
          }),
          mediaUrl: Joi.string().required().trim().messages({
            "string.base": "Media URL must be a string",
            "string.empty": "Media URL is required",
            "any.required": "Media URL is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Media must be an array",
        "array.min": "At least one media item is required",
        "any.required": "At least one media item is required",
      }),

    analytics: Joi.object({
      ticketsAvailable: Joi.number().integer().min(0).optional().messages({
        "number.base": "ticketsAvailable must be a number",
        "number.integer": "ticketsAvailable must be an integer",
        "number.min": "ticketsAvailable must be a non-negative integer",
      }),
      ticketsSold: Joi.number().integer().min(0).optional().messages({
        "number.base": "ticketsSold must be a number",
        "number.integer": "ticketsSold must be an integer",
        "number.min": "ticketsSold must be a non-negative integer",
      }),
      totalRevenue: Joi.number().min(0).optional().messages({
        "number.base": "totalRevenue must be a number",
        "number.min": "totalRevenue must be a non-negative number",
      }),
      waitingListCount: Joi.number().integer().min(0).optional().messages({
        "number.base": "waitingListCount must be a number",
        "number.integer": "waitingListCount must be an integer",
        "number.min": "waitingListCount must be a non-negative integer",
      }),
      likes: Joi.number().integer().min(0).optional().messages({
        "number.base": "likes must be a number",
        "number.integer": "likes must be an integer",
        "number.min": "likes must be a non-negative integer",
      }),
      dislikes: Joi.number().integer().min(0).optional().messages({
        "number.base": "dislikes must be a number",
        "number.integer": "dislikes must be an integer",
        "number.min": "dislikes must be a non-negative integer",
      }),
    }).optional(),

    tags: Joi.array()
      .items(
        Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .messages({
            "string.base": "Tag id must be a string",
            "string.empty": "Tag id is required",
            "any.required": "Tag id is required",
            "string.pattern.base": "Tag id must be a valid Mongo ID",
          })
      )
      .min(1)
      .messages({
        "array.base": "Tags must be an array",
        "array.min": "At least one tag is required",
        "any.required": "At least one tag is required",
      }),

    category: Joi.array()
      .items(
        Joi.string()
          .required()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .messages({
            "string.base": "Category id must be a string",
            "string.empty": "Category id is required",
            "any.required": "Category id is required",
            "string.pattern.base": "Category id must be a valid Mongo ID",
          })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Category must be an array",
        "array.min": "At least one category is required",
        "any.required": "At least one category is required",
      }),

    organizer: Joi.string()
      .optional()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.base": "Organizer must be a string",
        "string.pattern.base": "Organizer must be a valid Mongo ID",
        "any.required": "Organizer ID is required",
      }),
  })
});

export const updateEventValidation = Joi.object({
  title: Joi.string().optional().trim().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title cannot be empty",
  }),
  description: Joi.string().optional().trim().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description cannot be empty",
  }),
  date: Joi.date().iso().optional().messages({
    "date.base": "Invalid date",
    "date.format": "Invalid date format",
  }),
  time: Joi.string().optional().trim().messages({
    "string.base": "Time must be a string",
    "string.empty": "Time cannot be empty",
  }),

  location: Joi.object({
    country: Joi.string().optional().trim().messages({
      "string.base": "Location country must be a string",
      "string.empty": "Location country cannot be empty",
    }),
    city: Joi.string().optional().trim().messages({
      "string.base": "Location city must be a string",
      "string.empty": "Location city cannot be empty",
    }),
    address: Joi.string().optional().trim().messages({
      "string.base": "Location address must be a string",
      "string.empty": "Location address cannot be empty",
    }),
    latitude: Joi.number().optional().messages({
      "number.base": "Location latitude must be a number",
    }),
    longitude: Joi.number().optional().messages({
      "number.base": "Location longitude must be a number",
    }),
  }).optional(),

  media: Joi.array()
    .items(
      Joi.object({
        mediaType: Joi.string().required().valid("image", "video").messages({
          "string.base": "Media type must be a string",
          "string.empty": "Media type is required",
          "any.required": "Media type is required",
          "any.only": "Media type must be either 'image' or 'video'",
        }),
        mediaUrl: Joi.string().required().trim().messages({
          "string.base": "Media URL must be a string",
          "string.empty": "Media URL is required",
          "any.required": "Media URL is required",
        }),
      })
    )
    .optional()
    .messages({
      "array.base": "Media must be an array",
    }),

  analytics: Joi.object({
    ticketsAvailable: Joi.number().integer().min(0).optional().messages({
      "number.base": "ticketsAvailable must be a number",
      "number.integer": "ticketsAvailable must be an integer",
      "number.min": "ticketsAvailable must be a non-negative integer",
    }),
    ticketsSold: Joi.number().integer().min(0).optional().messages({
      "number.base": "ticketsSold must be a number",
      "number.integer": "ticketsSold must be an integer",
      "number.min": "ticketsSold must be a non-negative integer",
    }),
    totalRevenue: Joi.number().min(0).optional().messages({
      "number.base": "totalRevenue must be a number",
      "number.min": "totalRevenue must be a non-negative number",
    }),
    waitingListCount: Joi.number().integer().min(0).optional().messages({
      "number.base": "waitingListCount must be a number",
      "number.integer": "waitingListCount must be an integer",
      "number.min": "waitingListCount must be a non-negative integer",
    }),
    likes: Joi.number().integer().min(0).optional().messages({
      "number.base": "likes must be a number",
      "number.integer": "likes must be an integer",
      "number.min": "likes must be a non-negative integer",
    }),
    dislikes: Joi.number().integer().min(0).optional().messages({
      "number.base": "dislikes must be a number",
      "number.integer": "dislikes must be an integer",
      "number.min": "dislikes must be a non-negative integer",
    }),
  }).optional(),

  tags: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.base": "Tag id must be a string",
          "string.pattern.base": "Tag id must be a valid Mongo ID",
        })
    )
    .optional()
    .messages({
      "array.base": "Tags must be an array",
    }),

  category: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.base": "Category id must be a string",
          "string.pattern.base": "Category id must be a valid Mongo ID",
        })
    )
    .optional()
    .messages({
      "array.base": "Category must be an array",
    }),

  organizer: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.base": "Organizer must be a string",
      "string.pattern.base": "Organizer must be a valid Mongo ID",
    }),
});

