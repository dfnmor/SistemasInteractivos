ALTER TABLE TABLA_EJERCICIO_CUENTO
ADD COLUMN IF NOT EXISTS imagen_sena VARCHAR(500);

UPDATE TABLA_EJERCICIO_CUENTO
SET imagen_sena = CASE palabra_o_sena
    WHEN 'HOLA' THEN '/hola.png'
    WHEN 'LUNA' THEN '/luna.png'
    WHEN 'CONEJO' THEN '/conejo.jpeg'
    WHEN 'MAMÁ' THEN '/mam%C3%A1.jpeg'
    WHEN 'PAPÁ' THEN '/pap%C3%A1.jpeg'
    ELSE imagen_sena
END
WHERE palabra_o_sena IN ('HOLA', 'LUNA', 'CONEJO', 'MAMÁ', 'PAPÁ');
