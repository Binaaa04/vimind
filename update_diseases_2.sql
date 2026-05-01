BEGIN;

-- 1. Update diseases to match frontend mapping
UPDATE disease SET disease_name = 'Anxiety', description = 'Anxiety (Kecemasan)' WHERE disease_id = 1;
UPDATE disease SET disease_name = 'PTSD', description = 'Post-Traumatic Stress Disorder' WHERE disease_id = 2;
UPDATE disease SET disease_name = 'Depresi', description = 'Depresi (Depression)' WHERE disease_id = 3;
UPDATE disease SET disease_name = 'Bipolar', description = 'Bipolar Disorder' WHERE disease_id = 5;
UPDATE disease SET disease_name = 'Fobia Sosial', description = 'Fobia Sosial (Social Anxiety Disorder)' WHERE disease_id = 7;

-- 2. Clear old cf_rules for these diseases
DELETE FROM cf_rules WHERE disease_id IN (1, 2, 3, 5, 7);

-- 3. Insert new symptoms and map them in cf_rules
WITH new_symptoms AS (
    INSERT INTO symptoms (symptoms_code, symptoms_name, description) VALUES
    ('G-ANX1', 'Rasa cemas yang berlebihan', 'Sering merasa cemas atau khawatir berlebihan tentang berbagai hal'),
    ('G-ANX2', 'Gelisah atau tegang', 'Merasa tegang, gelisah, atau berada di ujung tanduk'),
    ('G-ANX3', 'Sulit berkonsentrasi', 'Pikiran sering kosong atau kesulitan untuk fokus pada suatu hal'),
    ('G-ANX4', 'Otot terasa tegang', 'Sering mengalami ketegangan otot di pundak, leher, atau bagian tubuh lain'),
    ('G-ANX5', 'Gangguan tidur', 'Kesulitan untuk tidur atau tidur tidak nyenyak karena banyak pikiran'),
    
    ('G-PTSD1', 'Mengingat kembali peristiwa traumatis', 'Sering teringat atau mengalami kilas balik peristiwa traumatis yang tidak menyenangkan'),
    ('G-PTSD2', 'Mimpi buruk terkait trauma', 'Mengalami mimpi buruk yang berhubungan dengan pengalaman masa lalu'),
    ('G-PTSD3', 'Menghindari pemicu trauma', 'Berusaha keras menghindari tempat, orang, atau aktivitas yang mengingatkan pada trauma'),
    ('G-PTSD4', 'Sangat waspada', 'Merasa selalu waspada atau mudah terkejut oleh hal-hal kecil'),
    ('G-PTSD5', 'Mati rasa secara emosional', 'Merasa hampa, sulit merasakan emosi positif, atau terasing dari orang lain'),
    
    ('G-DEP1', 'Perasaan sedih yang mendalam', 'Merasa sangat sedih, kosong, atau putus asa hampir sepanjang hari'),
    ('G-DEP2', 'Kehilangan minat', 'Kehilangan ketertarikan pada aktivitas yang biasanya dinikmati'),
    ('G-DEP3', 'Perubahan nafsu makan', 'Penurunan atau peningkatan nafsu makan dan berat badan yang signifikan'),
    ('G-DEP4', 'Kelelahan ekstrem', 'Merasa sangat lelah dan kekurangan energi untuk melakukan tugas sehari-hari'),
    ('G-DEP5', 'Merasa tidak berharga', 'Sering merasa bersalah, tidak berharga, atau menyalahkan diri sendiri'),
    
    ('G-BIP1', 'Perubahan suasana hati yang drastis', 'Mengalami perubahan suasana hati yang sangat cepat dari sangat bahagia ke sangat sedih'),
    ('G-BIP2', 'Energi yang meledak-ledak', 'Memiliki energi berlebih, bicara lebih cepat dari biasanya, dan banyak ide yang berkelebat'),
    ('G-BIP3', 'Kebutuhan tidur berkurang', 'Merasa cukup istirahat meskipun hanya tidur beberapa jam saja'),
    ('G-BIP4', 'Keputusan impulsif dan berisiko', 'Sering mengambil keputusan berisiko tinggi tanpa memikirkan konsekuensinya'),
    ('G-BIP5', 'Periode depresi berat', 'Mengalami fase sedih yang sangat dalam setelah fase energi berlebih'),
    
    ('G-FOB1', 'Takut dihakimi orang lain', 'Ketakutan yang luar biasa akan diamati atau dinilai negatif oleh orang lain'),
    ('G-FOB2', 'Menghindari interaksi sosial', 'Sengaja menghindari pertemuan sosial atau berbicara dengan orang yang tidak dikenal'),
    ('G-FOB3', 'Cemas sebelum acara sosial', 'Mengalami kecemasan yang parah berhari-hari sebelum menghadiri acara sosial'),
    ('G-FOB4', 'Gejala fisik saat bersosialisasi', 'Jantung berdebar, berkeringat, atau gemetar saat harus berinteraksi dengan orang lain'),
    ('G-FOB5', 'Kesulitan menatap mata', 'Sangat sulit untuk menatap mata orang lain saat berbicara')
    RETURNING symptoms_id, symptoms_code
)
INSERT INTO cf_rules (disease_id, symptoms_id, expert_cf_value)
SELECT 
    CASE 
        WHEN symptoms_code LIKE 'G-ANX%' THEN 1
        WHEN symptoms_code LIKE 'G-PTSD%' THEN 2
        WHEN symptoms_code LIKE 'G-DEP%' THEN 3
        WHEN symptoms_code LIKE 'G-BIP%' THEN 5
        WHEN symptoms_code LIKE 'G-FOB%' THEN 7
    END,
    symptoms_id,
    0.8
FROM new_symptoms;

COMMIT;
