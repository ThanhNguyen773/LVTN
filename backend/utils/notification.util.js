import {
  pushNotificationToUser,
  pushNotificationToAllUsers,
  pushNotificationToAdminsAndStaffs,
} from "../controllers/notification.controller.js";

export const notifyUser = pushNotificationToUser;
export const notifyAllUsers = pushNotificationToAllUsers;
export const notifyAdminsAndStaffs = pushNotificationToAdminsAndStaffs;
