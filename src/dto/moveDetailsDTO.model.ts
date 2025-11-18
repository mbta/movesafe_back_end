export type IMoveDetailsInspectionAnswer =
    IQuestionSingleDefectAnswer |
    IQuestionDoubleDefectAnswer |
    IQuestionYesNoAnswer |
    IQuestionGuardSideAndMotorPersonAnswer

export type IQuestionSingleDefectAnswer = string[];
export type IQuestionDoubleDefectAnswer = { minorDefects: string[], majorDefects: string[] };
export type IQuestionYesNoAnswer = boolean;
export type IQuestionGuardSideAndMotorPersonAnswer = { guardSide: string[], motorPersonSide: string[] }

interface User {
    name: string;
    badge_number: string;
}

//selectedCars is camel case to fit frontend''s format
export interface IMoveDetailsInspectionFormQuestion {
    id: string;
    description: string;
    question_type: number;
    selectedCars?: IMoveDetailsInspectionAnswer;
    comments?: string;
    is_answered?: boolean;
}

export interface IMoveDetailsInspectionFormSection {
    name: string;
    inspection_form_questions: IMoveDetailsInspectionFormQuestion[];
}

interface IMoveDetailsInspectionForm {
    name: string;
    inspection_form_sections: IMoveDetailsInspectionFormSection[];
}

export interface IMoveDetailsInspection {
    id: string;
    inspection_form: IMoveDetailsInspectionForm;
}

interface MoveReason {
    name: string;
}

interface Car {
    series_number: string;
}

interface MoveCar {
    pair_order: number;
    first_car: Car;
    second_car: Car;
}

interface Signature {
    uri: string;
    signature_type: string;
    user: User;
}

interface AuditLog {
    action: string;
    created_at: string;
    user: User;
}

export interface IMoveDetailsDTO {
    due_date: string;
    status: string;
    priority_order: number;
    move_from: string;
    move_to: string;
    created_at: string;
    move_reason: MoveReason;
    move_cars: MoveCar[];
    inspections: IMoveDetailsInspection[];
    signatures: Signature[];
    move_done_by_user: User | null;
    inspections_done_by_user: User;
    guardside_inspection_done_by_user: User | null;
    yardmaster_user: User;
    audit_logs: AuditLog[];
}
