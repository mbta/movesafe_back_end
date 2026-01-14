-- Tabela Lines
CREATE INDEX idx_lines_name ON mbtadb.Lines(name);

-- Tabela Yards
CREATE INDEX idx_yards_line_id ON mbtadb.Yards(line_id);
CREATE INDEX idx_yards_name ON mbtadb.Yards(name);
CREATE INDEX idx_yards_is_main_yard ON mbtadb.Yards(is_main_yard);

-- Tabela Cars
CREATE INDEX idx_cars_line_id ON mbtadb.Cars(line_id);
CREATE INDEX idx_cars_series_number ON mbtadb.Cars(series_number);
CREATE INDEX idx_cars_is_active ON mbtadb.Cars(is_active);

-- Tabela Users
CREATE INDEX idx_users_badge_number ON mbtadb.Users(badge_number);
CREATE INDEX idx_users_name ON mbtadb.Users(name);

-- Tabela Move_Reasons
CREATE INDEX idx_move_reasons_name ON mbtadb.Move_Reasons(name);
CREATE INDEX idx_move_reasons_is_available_satellite_yards ON mbtadb.Move_Reasons(is_available_satellite_yards);

-- Tabela Inspection_Forms
CREATE INDEX idx_inspection_forms_name ON mbtadb.Inspection_Forms(name);
CREATE INDEX idx_inspection_forms_is_light_rail ON mbtadb.Inspection_Forms(is_light_rail);
CREATE INDEX idx_inspection_forms_has_comments ON mbtadb.Inspection_Forms(has_comments);

-- Tabela Inspection_Form_Sections
CREATE INDEX idx_inspection_form_sections_form_id ON mbtadb.Inspection_Form_Sections(inspection_form_id);

-- Tabela Inspection_Form_Questions
CREATE INDEX idx_inspection_form_questions_section_id ON mbtadb.Inspection_Form_Questions(inspection_form_section_id);
CREATE INDEX idx_inspection_form_questions_question_type ON mbtadb.Inspection_Form_Questions(question_type);
CREATE INDEX idx_inspection_form_questions_has_comments ON mbtadb.Inspection_Form_Questions(has_comments);

-- Tabela Move_Reason_Inspection_Form_Associations
CREATE INDEX idx_move_reason_association_move_reason_id ON mbtadb.Move_Reason_Inspection_Form_Associations(move_reason_id);
CREATE INDEX idx_move_reason_association_inspection_form_id ON mbtadb.Move_Reason_Inspection_Form_Associations(inspection_form_id);

-- Tabela Moves
CREATE INDEX idx_moves_yard_id ON mbtadb.Moves(yard_id);
CREATE INDEX idx_moves_move_reason_id ON mbtadb.Moves(move_reason_id);
CREATE INDEX idx_moves_move_done_by_user_id ON mbtadb.Moves(move_done_by_user_id);
CREATE INDEX idx_moves_inspections_done_by_user_id ON mbtadb.Moves(inspections_done_by_user_id);
CREATE INDEX idx_moves_guardside_inspection_done_by_user_id ON mbtadb.Moves(guardside_inspection_done_by_user_id);
CREATE INDEX idx_moves_yardmaster_user_id ON mbtadb.Moves(yardmaster_user_id);
CREATE INDEX idx_moves_due_date ON mbtadb.Moves(due_date);
CREATE INDEX idx_moves_status ON mbtadb.Moves(status);
CREATE INDEX idx_moves_priority_order ON mbtadb.Moves(priority_order);

-- Tabela Move_Cars
CREATE INDEX idx_move_cars_move_id ON mbtadb.Move_Cars(move_id);
CREATE INDEX idx_move_cars_first_car_id ON mbtadb.Move_Cars(first_car_id);
CREATE INDEX idx_move_cars_second_car_id ON mbtadb.Move_Cars(second_car_id);

-- Tabela Signatures
CREATE INDEX idx_signatures_move_id ON mbtadb.Signatures(move_id);
CREATE INDEX idx_signatures_user_id ON mbtadb.Signatures(user_id);

-- Tabela Inspections
CREATE INDEX idx_inspections_move_id ON mbtadb.Inspections(move_id);
CREATE INDEX idx_inspections_user_id ON mbtadb.Inspections(user_id);
CREATE INDEX idx_inspections_inspection_form_id ON mbtadb.Inspections(inspection_form_id);

-- Tabela Inspection_Answers
CREATE INDEX idx_inspection_answers_inspection_id ON mbtadb.Inspection_Answers(inspection_id);
CREATE INDEX idx_inspection_answers_inspection_form_question_id ON mbtadb.Inspection_Answers(inspection_form_question_id);
CREATE INDEX idx_inspection_answers_car_id ON mbtadb.Inspection_Answers(car_id);
CREATE INDEX idx_inspection_answers_has_minor_defect ON mbtadb.Inspection_Answers(has_minor_defect);
CREATE INDEX idx_inspection_answers_has_major_defect ON mbtadb.Inspection_Answers(has_major_defect);
CREATE INDEX idx_inspection_answers_is_guardside ON mbtadb.Inspection_Answers(is_guardside);

-- Tabela Audit_Logs
CREATE INDEX idx_audit_logs_move_id ON mbtadb.Audit_Logs(move_id);
CREATE INDEX idx_audit_logs_user_id ON mbtadb.Audit_Logs(user_id);
CREATE INDEX idx_audit_logs_action ON mbtadb.Audit_Logs(action);