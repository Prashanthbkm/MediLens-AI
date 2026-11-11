
ALTER TABLE medical_reports
ADD COLUMN IF NOT EXISTS text_extraction_status
    VARCHAR(30) NOT NULL DEFAULT 'PENDING';

ALTER TABLE medical_reports
ADD COLUMN IF NOT EXISTS ocr_status
    VARCHAR(30) NOT NULL DEFAULT 'PENDING';

ALTER TABLE medical_reports
ADD COLUMN IF NOT EXISTS structured_extraction_status
    VARCHAR(30) NOT NULL DEFAULT 'PENDING';

ALTER TABLE medical_reports
ADD COLUMN IF NOT EXISTS processing_error
    TEXT;
