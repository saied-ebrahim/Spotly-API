import jwt from "jsonwebtoken";

export default function generateToken(user) {
  return {
    accessToken: jwt.sign({ id: user._id, email: user.email, name: `${user.firstName} ${user.lastName}` }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" }),
    refreshToken: jwt.sign({ id: user._id, email: user.email, name: `${user.firstName} ${user.lastName}` }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || "7d" }),
  };
}
