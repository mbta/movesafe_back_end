export enum UserRoles {
    manager_all_lines = '/Management All Lines',
    manager_green_line = '/Management Green Line',
    manager_blue_line = '/Management Blue Line',
    manager_orange_line = '/Management Orange Line',
    manager_red_line = '/Management Red Line',
    yardmaster_green_line = '/Yardmaster Green Line',
    yardmaster_blue_line = '/Yardmaster Blue Line',
    yardmaster_orange_line = '/Yardmaster Orange Line',
    yardmaster_red_line = '/Yardmaster Red Line',
    yard_motor_person_green_line = '/Yard MotorPerson Green Line',
    yard_motor_person_blue_line = '/Yard MotorPerson Blue Line',
    yard_motor_person_orange_line = '/Yard MotorPerson Orange Line',
    yard_motor_person_red_line = '/Yard MotorPerson Red Line',
}

export const ManagerRoles = [
    UserRoles.manager_all_lines,
    UserRoles.manager_blue_line,
    UserRoles.manager_green_line,
    UserRoles.manager_orange_line,
    UserRoles.manager_red_line
];

export const YardMasterRoles = [
    UserRoles.yardmaster_blue_line,
    UserRoles.yardmaster_green_line,
    UserRoles.yardmaster_orange_line,
    UserRoles.yardmaster_red_line
];

export const YardMotorPersonRoles = [
    UserRoles.yard_motor_person_green_line,
    UserRoles.yard_motor_person_blue_line,
    UserRoles.yard_motor_person_orange_line,
    UserRoles.yard_motor_person_red_line
];