import { Types } from "mongoose";

export default function isObjectIdValid(id: string): boolean {
  return Types.ObjectId.isValid(id);
}
