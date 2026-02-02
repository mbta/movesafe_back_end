import { JobTypes, LineTypes } from "../enum/userRoles.enum.js";

export const EVERBRIDGE_TO_DB_LINE_MAP: Record<number, LineTypes> = {
  101: LineTypes.all_lines,
  102: LineTypes.all_lines,
  112: LineTypes.orange_line,
  113: LineTypes.red_line,
  114: LineTypes.blue_line,
  132: LineTypes.green_line,
};

export const EVERBRIDGE_TO_DB_JOB_MAP: Record<string, JobTypes> = {
  "099000": JobTypes.yardmaster,
  "000200": JobTypes.yard_motor_person,
  "000210": JobTypes.yard_motor_person,
  "000300": JobTypes.yard_motor_person,
  "000600": JobTypes.yard_motor_person,
  "000800": JobTypes.yard_motor_person,
  "000900": JobTypes.yard_motor_person,
  "001200": JobTypes.yard_motor_person,
  "075200": JobTypes.yard_motor_person,
  "078200": JobTypes.yard_motor_person,
  "083500": JobTypes.management,
  "221100": JobTypes.management,
  "222100": JobTypes.management,
  "281900": JobTypes.management,
  "282000": JobTypes.management,
  "509800": JobTypes.management,
  "775600": JobTypes.management,
  MBT004: JobTypes.management,
  MBT005: JobTypes.management,
  MBT016: JobTypes.management,
  MBT038: JobTypes.management,
  MBT150: JobTypes.yard_motor_person,
  MBT151: JobTypes.yard_motor_person,
  MBT152: JobTypes.yard_motor_person,
  MBT161: JobTypes.management,
  MBT162: JobTypes.management,
  MBT166: JobTypes.management,
  MBT192: JobTypes.management,
  MBT198: JobTypes.management,
  MoveSafeAdmin: JobTypes.admin,
};

export const EVERBRIDGE_ATTR_NAMES: Record<string, string> = {
  JOB_CODE: "Job Code",
  AREA: "Area",
};

export const EVERBRIDGE_ATTRIBUTES: Record<string, string>[] = [
  {
    name: EVERBRIDGE_ATTR_NAMES.JOB_CODE,
    orgAttrId: "333293757136926",
  },
  {
    name: EVERBRIDGE_ATTR_NAMES.AREA,
    orgAttrId: "333293757136935",
  },
];

export interface EverbridgeContactAttribute {
  values: string[];
  name: string;
  orgAttrId: number;
}

export interface EverbridgeContact {
  firstName?: string;
  lastName?: string;
  ssoUserId?: string;
  externalId?: string;
  contactAttributes?: EverbridgeContactAttribute[];
}

export interface EverbridgePage {
  data: EverbridgeContact[];
}

export interface EverbridgeContactResponse {
  page: EverbridgePage;
}
