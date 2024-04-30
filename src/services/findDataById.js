import mongoose from "mongoose";
import createError from "http-errors";

const findDataById = async (id, schemaData, options = {}, next) => {
  try {
    const data = await schemaData.findById(id, options);

    if (!data) {
      throw createError(404, "Could not find data");
    }

    return data;
  } catch (error) {
    if (error instanceof mongoose.Error) {
      next(createError(400, "Data could not founded with this id"));
    }
    throw error;
  }
};

export default findDataById;
