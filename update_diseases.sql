BEGIN;

-- 1. Update diseases to match frontend mapping
UPDATE disease SET disease_name = 'OCD', description = 'Obsessive-Compulsive Disorder' WHERE disease_id = 4;
UPDATE disease SET disease_name = 'Skizofrenia', description = 'Skizofrenia' WHERE disease_id = 6;
UPDATE disease SET disease_name = 'Gangguan Panik', description = 'Gangguan Panik' WHERE disease_id = 8;
UPDATE disease SET disease_name = 'ADHD', description = 'Attention Deficit Hyperactivity Disorder' WHERE disease_id = 9;

-- 2. Clear old cf_rules for these diseases
DELETE FROM cf_rules WHERE disease_id IN (4, 6, 8, 9);

-- 3. Insert new symptoms and map them in cf_rules
WITH new_symptoms AS (
    INSERT INTO symptoms (symptoms_code, symptoms_name, description) VALUES
    ('G-OCD1', 'Pikiran obsesif yang berulang', 'Memiliki pikiran, dorongan, atau gambaran mental yang berulang dan tidak diinginkan'),
    ('G-OCD2', 'Perilaku kompulsif yang berulang', 'Merasa terdorong untuk melakukan suatu tindakan secara berulang-ulang'),
    ('G-OCD3', 'Ketakutan akan kotoran atau kuman', 'Rasa takut yang berlebihan terhadap kontaminasi kotoran, kuman, atau penyakit'),
    ('G-OCD4', 'Kebutuhan akan keteraturan berlebih', 'Memiliki kebutuhan yang kuat agar segala sesuatunya simetris atau dalam urutan yang tepat'),
    ('G-OCD5', 'Kecemasan jika rutinitas terganggu', 'Mengalami kecemasan yang parah ketika rutinitas atau tatanan terganggu'),
    
    ('G-SKZ1', 'Halusinasi', 'Mendengar suara atau melihat sesuatu yang sebenarnya tidak ada'),
    ('G-SKZ2', 'Delusi', 'Memiliki keyakinan kuat yang tidak masuk akal atau tidak sesuai dengan kenyataan'),
    ('G-SKZ3', 'Pikiran kacau dan sulit fokus', 'Berbicara dengan cara yang membingungkan atau sering melompat antar topik'),
    ('G-SKZ4', 'Kurangnya ekspresi emosi', 'Wajah datar, kurang kontak mata, atau tidak merespons secara emosional'),
    ('G-SKZ5', 'Menarik diri secara sosial', 'Kehilangan minat pada aktivitas sehari-hari dan menjauh dari interaksi sosial'),
    
    ('G-PNK1', 'Serangan panik tiba-tiba', 'Mengalami serangan ketakutan yang hebat dan tiba-tiba tanpa alasan yang jelas'),
    ('G-PNK2', 'Jantung berdebar cepat', 'Merasa detak jantung sangat cepat, berdebar-debar, atau tidak beraturan'),
    ('G-PNK3', 'Sesak napas atau tercekik', 'Kesulitan bernapas, merasa sesak di dada, atau seperti tercekik'),
    ('G-PNK4', 'Berkeringat berlebih dan gemetar', 'Berkeringat dingin, gemetar, atau menggigil meskipun tidak sedang kedinginan atau berolahraga'),
    ('G-PNK5', 'Takut kehilangan kendali', 'Merasa seperti akan pingsan, gila, kehilangan kendali, atau bahkan mati'),
    
    ('G-AHD1', 'Sulit memusatkan perhatian', 'Sering kesulitan mempertahankan fokus pada tugas atau aktivitas bermain'),
    ('G-AHD2', 'Mudah teralihkan', 'Sangat mudah terganggu oleh rangsangan dari luar yang tidak relevan'),
    ('G-AHD3', 'Gelisah dan sulit duduk tenang', 'Sering menggerak-gerakkan tangan/kaki atau tidak bisa duduk diam di tempat'),
    ('G-AHD4', 'Bertindak impulsif', 'Sering bertindak tanpa berpikir, menyela pembicaraan, atau tidak sabar menunggu giliran'),
    ('G-AHD5', 'Sering lupa barang', 'Sering kehilangan barang-barang yang diperlukan untuk tugas atau aktivitas sehari-hari')
    RETURNING symptoms_id, symptoms_code
)
INSERT INTO cf_rules (disease_id, symptoms_id, expert_cf_value)
SELECT 
    CASE 
        WHEN symptoms_code LIKE 'G-OCD%' THEN 4
        WHEN symptoms_code LIKE 'G-SKZ%' THEN 6
        WHEN symptoms_code LIKE 'G-PNK%' THEN 8
        WHEN symptoms_code LIKE 'G-AHD%' THEN 9
    END,
    symptoms_id,
    0.8
FROM new_symptoms;

COMMIT;
