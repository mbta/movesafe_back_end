ALTER TABLE mbtadb.Users
ADD username varchar(100);

ALTER TABLE mbtadb.Inspection_Form_Questions
ADD inspection_form_category_id CHAR(36) NOT NULL;

UPDATE mbtadb.Inspection_Form_Questions
SET inspection_form_category_id = (
    SELECT id FROM mbtadb.Inspection_Form_Categories LIMIT 1
);

ALTER TABLE mbtadb.Inspection_Form_Questions
ADD CONSTRAINT fk_inspection_form_category
FOREIGN KEY (inspection_form_category_id)
REFERENCES mbtadb.Inspection_Form_Categories(id);