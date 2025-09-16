import User from "../models/user.model.js";
import CustomError from "http-errors";
import { APIResponse } from "../utils/response.js";

const userController = {
  getCurrentUser: async (req, res) => {
    const { id } = req.user;

    const user = await User.findById(id).select("-password __v");

    if (!user) {
      throw CustomError(404, "User not found");
    }

    return res
      .status(200)
      .json(new APIResponse("User fetched successfully", { user }));
  },
};

export default userController;