create database mbtadb;

CREATE TABLE mbtadb.Lines(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name varchar(100) NOT NULL,
    is_light_rail BOOLEAN default false,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id)
);

CREATE TABLE mbtadb.Yards(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    line_id CHAR(36) NOT NULL,
    name varchar(100) NOT NULL,
    is_main_yard BOOLEAN default false,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (line_id) REFERENCES mbtadb.Lines(id)
);

CREATE TABLE mbtadb.Cars(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    line_id CHAR(36) NOT NULL,
    series_number varchar(100) NOT NULL,
    is_active  BOOLEAN default true,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (line_id) REFERENCES mbtadb.Lines(id)
);

CREATE TABLE mbtadb.Users(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name varchar(100) NOT NULL,
    badge_number varchar(100) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    key_cloak_id CHAR(36),
    line varchar(50) DEFAULT NULL,
    role varchar(50) DEFAULT NULL,
    username varchar(100) DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE mbtadb.Move_Reasons(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name varchar(100) NOT NULL,
    is_available_satellite_yards BOOLEAN,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE mbtadb.Inspection_Forms(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name varchar(100) NOT NULL,
    has_comments  BOOLEAN default false,
    is_light_rail BOOLEAN default false,
    has_guardside_signature  BOOLEAN default false,
    has_foreperson_signature  BOOLEAN default false,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    short_name varchar(100),
    description varchar(200),
    PRIMARY KEY (id)
);

CREATE TABLE mbtadb.Inspection_Form_Sections(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    inspection_form_id CHAR(36) NOT NULL,
    name varchar(100) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (inspection_form_id) REFERENCES mbtadb.Inspection_Forms(id)
);

CREATE TABLE mbtadb.Inspection_Form_Questions(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    inspection_form_section_id CHAR(36) NOT NULL,
    description varchar(250) NOT NULL,
    question_type int NOT NULL,
    has_comments  BOOLEAN default false,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (inspection_form_section_id) REFERENCES mbtadb.Inspection_Form_Sections(id)
);

CREATE TABLE mbtadb.Move_Reason_Inspection_Form_Associations(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_reason_id CHAR(36) NOT NULL,
    inspection_form_id CHAR(36) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (move_reason_id) REFERENCES mbtadb.Move_Reasons(id),
    FOREIGN KEY (inspection_form_id) REFERENCES mbtadb.Inspection_Forms(id)
);

CREATE TABLE mbtadb.Moves(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    yard_id CHAR(36) NOT NULL,
    move_reason_id CHAR(36) NOT NULL,
    move_done_by_user_id CHAR(36),
    inspections_done_by_user_id CHAR(36),
    guardside_inspection_done_by_user_id CHAR(36),
    yardmaster_user_id CHAR(36),
    due_date TIMESTAMP NOT NULL,
    status varchar(100) NOT NULL,
    priority_order int NOT NULL,
    move_from varchar(100) NOT NULL,
    move_to varchar(100) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    inspections_selected_by_user_id CHAR(36),
    PRIMARY KEY (id),
    FOREIGN KEY (yard_id) REFERENCES mbtadb.Yards(id),
    FOREIGN KEY (move_reason_id) REFERENCES mbtadb.Move_Reasons(id),
    FOREIGN KEY (move_done_by_user_id) REFERENCES mbtadb.Users(id),
    FOREIGN KEY (inspections_done_by_user_id) REFERENCES mbtadb.Users(id),
    FOREIGN KEY (guardside_inspection_done_by_user_id) REFERENCES mbtadb.Users(id),
    FOREIGN KEY (yardmaster_user_id) REFERENCES mbtadb.Users(id),
    FOREIGN KEY (inspections_selected_by_user_id) REFERENCES mbtadb.Users(id)
);

CREATE TABLE mbtadb.Move_Cars(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_id CHAR(36) NOT NULL,
    first_car_id CHAR(36) NOT NULL,
    second_car_id CHAR(36),
    pair_order int NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (move_id) REFERENCES mbtadb.Moves(id),
    FOREIGN KEY (first_car_id) REFERENCES mbtadb.Cars(id),
    FOREIGN KEY (second_car_id) REFERENCES mbtadb.Cars(id)
);

CREATE TABLE mbtadb.Signatures(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    uri varchar(200) NOT NULL,
    signature_type varchar(100) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (move_id) REFERENCES mbtadb.Moves(id),
    FOREIGN KEY (user_id) REFERENCES mbtadb.Users(id)
);

CREATE TABLE mbtadb.Inspections(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_id CHAR(36) NOT NULL,
    inspection_form_id CHAR(36) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (move_id) REFERENCES mbtadb.Moves(id),
    FOREIGN KEY (inspection_form_id) REFERENCES mbtadb.Inspection_Forms(id),
);

CREATE TABLE mbtadb.Inspection_Answers(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    inspection_id CHAR(36) NOT NULL,
    inspection_form_question_id CHAR(36) NOT NULL,
    car_id CHAR(36), 
    has_minor_defect BOOLEAN default false, 
    has_major_defect BOOLEAN default false,
    is_guardside BOOLEAN default false,
    comments varchar(250),
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (inspection_id) REFERENCES mbtadb.Inspections(id),
    FOREIGN KEY (inspection_form_question_id) REFERENCES mbtadb.Inspection_Form_Questions(id),
    FOREIGN KEY (car_id) REFERENCES mbtadb.Cars(id)
);

CREATE TABLE mbtadb.Audit_Logs(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    action varchar(200) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (move_id) REFERENCES mbtadb.Moves(id),
    FOREIGN KEY (user_id) REFERENCES mbtadb.Users(id)
);

CREATE TABLE mbtadb.Tags(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_reason_id CHAR(36) NOT NULL,
    name varchar(200) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    PRIMARY KEY (id),
    FOREIGN KEY (move_reason_id) REFERENCES mbtadb.Move_Reasons(id)
);

CREATE TABLE mbtadb.Move_Tag_Associations(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    move_id CHAR(36) NOT NULL,
    tag_id CHAR(36) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (move_id) REFERENCES mbtadb.Moves(id),
    FOREIGN KEY (tag_id) REFERENCES mbtadb.Tags(id)
);

CREATE TABLE mbtadb.Inspection_Form_Categories(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name varchar(100) NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);