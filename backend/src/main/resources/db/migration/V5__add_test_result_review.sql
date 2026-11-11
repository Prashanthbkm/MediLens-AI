ALTER TABLE test_results
    ADD COLUMN original_test_name VARCHAR(255),
    ADD COLUMN original_numeric_value NUMERIC(12, 4),
    ADD COLUMN original_text_value TEXT,
    ADD COLUMN original_unit VARCHAR(50),
    ADD COLUMN original_reference_range VARCHAR(100),
    ADD COLUMN original_result_flag VARCHAR(20),
    ADD COLUMN manually_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN reviewed_at TIMESTAMP;

UPDATE test_results
SET
    original_test_name = test_name,
    original_numeric_value = numeric_value,
    original_text_value = text_value,
    original_unit = unit,
    original_reference_range = reference_range,
    original_result_flag = result_flag
WHERE original_test_name IS NULL;