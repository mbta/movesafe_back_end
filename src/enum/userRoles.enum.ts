export enum LineTypes {
  green_line = "Green Line",
  blue_line = "Blue Line",
  orange_line = "Orange Line",
  red_line = "Red Line",
  all_lines = "All Lines",
}

export enum JobTypes {
  yardmaster = "Yardmaster",
  yard_motor_person = "Yard MotorPerson",
  management = "Management",
  admin = "Admin",
}

export enum UserRoles {
  admin_all_lines = `/${JobTypes.admin} ${LineTypes.all_lines}`,
  manager_all_lines = `/${JobTypes.management} ${LineTypes.all_lines}`,
  manager_green_line = `/${JobTypes.management} ${LineTypes.green_line}`,
  manager_blue_line = `/${JobTypes.management} ${LineTypes.blue_line}`,
  manager_orange_line = `/${JobTypes.management} ${LineTypes.orange_line}`,
  manager_red_line = `/${JobTypes.management} ${LineTypes.red_line}`,
  yardmaster_green_line = `/${JobTypes.yardmaster} ${LineTypes.green_line}`,
  yardmaster_blue_line = `/${JobTypes.yardmaster} ${LineTypes.blue_line}`,
  yardmaster_orange_line = `/${JobTypes.yardmaster} ${LineTypes.orange_line}`,
  yardmaster_red_line = `/${JobTypes.yardmaster} ${LineTypes.red_line}`,
  yard_motor_person_green_line = `/${JobTypes.yard_motor_person} ${LineTypes.green_line}`,
  yard_motor_person_blue_line = `/${JobTypes.yard_motor_person} ${LineTypes.blue_line}`,
  yard_motor_person_orange_line = `/${JobTypes.yard_motor_person} ${LineTypes.orange_line}`,
  yard_motor_person_red_line = `/${JobTypes.yard_motor_person} ${LineTypes.red_line}`,
}

export const ManagerRoles = [
  UserRoles.admin_all_lines,
  UserRoles.manager_all_lines,
  UserRoles.manager_blue_line,
  UserRoles.manager_green_line,
  UserRoles.manager_orange_line,
  UserRoles.manager_red_line,
];

export const YardMasterRoles = [
  UserRoles.admin_all_lines,
  UserRoles.yardmaster_blue_line,
  UserRoles.yardmaster_green_line,
  UserRoles.yardmaster_orange_line,
  UserRoles.yardmaster_red_line,
];

export const YardMotorPersonRoles = [
  UserRoles.admin_all_lines,
  UserRoles.yard_motor_person_green_line,
  UserRoles.yard_motor_person_blue_line,
  UserRoles.yard_motor_person_orange_line,
  UserRoles.yard_motor_person_red_line,
];

export const AllRoles: string[] = Object.values(UserRoles);
