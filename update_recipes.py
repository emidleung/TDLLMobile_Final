import re

with open('src/recipesData.ts', 'r') as f:
    content = f.read()

images = [
    '/recipes/grocery_fish_1781616978511.png',
    '/recipes/grocery_tomato_egg_1781617004510.png',
    '/recipes/grocery_bok_choy_1781617118693.png',
    '/recipes/grocery_sweet_sour_pork_1781617182136.png',
    '/recipes/grocery_garlic_chicken_1781617259928.png',
    '/recipes/grocery_beef_chow_fun_1781617330783.png',
    '/recipes/grocery_mapo_tofu_1781617379465.png',
    '/recipes/grocery_pork_ribs_1781617447875.png',
    '/recipes/grocery_char_siu_1781617481370.png',
    '/recipes/grocery_shrimp_fried_rice_1781617523661.png'
]

ingredients = [
    ('1 Fresh Sea Bass or Grouper (cleaned), 30g Ginger (julienned), 3 stalks Scallion (julienned), 2 tbsp Light Soy Sauce, 1 tbsp Shaoxing Wine, 2 tbsp Cooking Oil, Coriander for garnish.', '1 Ikan Kerapu atau Sea Bass segar, 30g Jahe, 3 batang Daun Bawang, 2 sdm Kecap Asin Ringan, 1 sdm Anggur Shaoxing, 2 sdm Minyak Goreng, Ketumbar untuk hiasan.', '1 Sariwang Sea Bass o Grouper, 30g Luya, 3 tangkay ng Scallion, 2 kutsarang Light Soy Sauce, 1 kutsarang Shaoxing Wine, 2 kutsarang Cooking Oil, Coriander para sa garnish.'),
    ('4 Medium Tomatoes, 4 Large Eggs, 2 stalks Scallion, 1 tbsp Sugar, 1/2 tsp Salt, 2 tbsp Ketchup, 3 tbsp Cooking Oil.', '4 Tomat Sedang, 4 Telur Besar, 2 batang Daun Bawang, 1 sdm Gula, 1/2 sdt Garam, 2 sdm Saus Tomat, 3 sdm Minyak Goreng.', '4 Katamtamang Kamatis, 4 Malalaking Itlog, 2 tangkay ng Scallion, 1 kutsarang Asukal, 1/2 kutsaritang Asin, 2 kutsarang Ketchup, 3 kutsarang Cooking Oil.'),
    ('300g Fresh Baby Bok Choy, 4 cloves Garlic minced, 1/2 tsp Salt.', '300g Baby Bok Choy segar, 4 siung Bawang Putih cincang, 1/2 sdt Garam.', '300g Sariwang Baby Bok Choy, 4 cloves Bawang na tinadtad, 1/2 kutsaritang Asin.'),
    ('300g Pork Shoulder/Tenderloin (cubed), 1 Bell Pepper (diced), 1/2 Onion (diced), 1/2 cup Pineapple chunks, 3 tbsp Ketchup, 2 tbsp White Vinegar, 2 tbsp Sugar, 1 tbsp Soy Sauce, Cornstarch for coating, Cooking Oil.', '300g Daging Babi (potong dadu), 1 Paprika (potong dadu), 1/2 Bawang Bombai (potong dadu), 1/2 cangkir Nanas, 3 sdm Saus Tomat, 2 sdm Cuka Putih, 2 sdm Gula, 1 sdm Kecap Asin, Tepung Maizena, Minyak Goreng.', '300g Pork Shoulder (cubed), 1 Bell Pepper (diced), 1/2 Onion (diced), 1/2 cup Pineapple chunks, 3 kutsarang Ketchup, 2 kutsarang White Vinegar, 2 kutsarang Asukal, 1 kutsarang Soy Sauce, Cornstarch, Cooking Oil.'),
    ('400g Chicken Thighs (boneless, cut), 5 cloves Garlic (finely minced), 1 tbsp Light Soy Sauce, 1 tsp Oyster Sauce, 1 tsp Sugar, 1 tbsp Cornstarch, 1 tsp Sesame Oil, 1 stalk Scallion.', '400g Paha Ayam, 5 siung Bawang Putih, 1 sdm Kecap Asin Ringan, 1 sdt Saus Tiram, 1 sdt Gula, 1 sdm Tepung Maizena, 1 sdt Minyak Wijen, 1 batang Daun Bawang.', '400g Chicken Thighs, 5 cloves Bawang, 1 kutsarang Light Soy Sauce, 1 kutsarang Oyster Sauce, 1 kutsarang Asukal, 1 kutsarang Cornstarch, 1 kutsarang Sesame Oil, 1 tangkay ng Scallion.'),
    ('250g Flank Steak (sliced thin), 400g Fresh Flat Rice Noodles, 100g Bean Sprouts, 3 stalks Scallion, 1/2 Onion (sliced), 2 tbsp Light Soy Sauce, 1 tbsp Dark Soy Sauce, 1 tbsp Oyster Sauce, 1 tsp Sugar, Cooking Oil.', '250g Daging Sapi Flank (iris tipis), 400g Kwetiau Segar, 100g Tauge, 3 batang Daun Bawang, 1/2 Bawang Bombai, 2 sdm Kecap Asin Ringan, 1 sdm Kecap Hitam, 1 sdm Saus Tiram, 1 sdt Gula, Minyak Goreng.', '250g Flank Steak (sliced thin), 400g Fresh Flat Rice Noodles, 100g Bean Sprouts, 3 tangkay ng Scallion, 1/2 Onion, 2 kutsarang Light Soy Sauce, 1 kutsarang Dark Soy Sauce, 1 kutsarang Oyster Sauce, 1 kutsarang Asukal, Cooking Oil.'),
    ('1 block Soft/Silken Tofu, 100g Ground Pork/Beef, 2 tbsp Doubanjiang, 1 tbsp Fermented Black Beans, 2 cloves Garlic, 1 tsp Ginger, 1 tsp Sichuan Peppercorn Powder, 1/2 cup Chicken Broth, Cornstarch slurry, 2 stalks Scallion, Cooking Oil.', '1 kotak Tahu Sutra, 100g Daging Cincang, 2 sdm Doubanjiang, 1 sdm Kedelai Hitam Fermentasi, 2 siung Bawang Putih, 1 sdt Jahe, 1 sdt Bubuk Merica Sichuan, 1/2 cangkir Kaldu Ayam, Larutan Maizena, 2 batang Daun Bawang, Minyak Goreng.', '1 block Soft/Silken Tofu, 100g Ground Pork, 2 kutsarang Doubanjiang, 1 kutsarang Fermented Black Beans, 2 cloves Bawang, 1 kutsaritang Luya, 1 kutsaritang Sichuan Peppercorn Powder, 1/2 cup Chicken Broth, Cornstarch slurry, 2 tangkay ng Scallion, Cooking Oil.'),
    ('400g Pork Ribs (cut), 2 tbsp Fermented Black Beans, 3 cloves Garlic, 1/2 tsp Ginger, 1 tbsp Light Soy Sauce, 1 tsp Sugar, 1 tbsp Cornstarch, 1 tbsp Shaoxing Wine, 1/2 red chili, Cooking Oil.', '400g Iga Babi, 2 sdm Kedelai Hitam Fermentasi, 3 siung Bawang Putih, 1/2 sdt Jahe, 1 sdm Kecap Asin Ringan, 1 sdt Gula, 1 sdm Tepung Maizena, 1 sdm Anggur Shaoxing, 1/2 Cabai Merah, Minyak Goreng.', '400g Pork Ribs, 2 kutsarang Fermented Black Beans, 3 cloves Bawang, 1/2 kutsaritang Luya, 1 kutsarang Light Soy Sauce, 1 kutsarang Asukal, 1 kutsarang Cornstarch, 1 kutsarang Shaoxing Wine, 1/2 red chili, Cooking Oil.'),
    ('500g Pork Shoulder/Belly, 3 tbsp Char Siu Sauce, 1 tbsp Light Soy Sauce, 1 tbsp Honey/Maltose, 1 tbsp Shaoxing Wine, 1 tsp Five-Spice Powder, 1 clove Garlic.', '500g Daging Babi (Paha/Perut), 3 sdm Saus Char Siu, 1 sdm Kecap Asin Ringan, 1 sdm Madu/Maltosa, 1 sdm Anggur Shaoxing, 1 sdt Bubuk Ngohiong, 1 siung Bawang Putih.', '500g Pork Shoulder/Belly, 3 kutsarang Char Siu Sauce, 1 kutsarang Light Soy Sauce, 1 kutsarang Honey/Maltose, 1 kutsarang Shaoxing Wine, 1 kutsaritang Five-Spice Powder, 1 clove Bawang.'),
    ('3 cups Day-old Cooked Rice, 200g Fresh Shrimp, 2 Large Eggs, 1/2 cup Mixed Vegetables, 2 stalks Scallion, 1 tbsp Light Soy Sauce, 1 tsp Salt, 1/2 tsp White Pepper, Cooking Oil.', '3 cangkir Nasi Sisa Kemarin, 200g Udang Segar, 2 Telur Besar, 1/2 cangkir Sayuran Campur, 2 batang Daun Bawang, 1 sdm Kecap Asin Ringan, 1 sdt Garam, 1/2 sdt Merica Putih, Minyak Goreng.', '3 cups Day-old Cooked Rice, 200g Fresh Shrimp, 2 Malalaking Itlog, 1/2 cup Mixed Vegetables, 2 tangkay ng Scallion, 1 kutsarang Light Soy Sauce, 1 kutsaritang Asin, 1/2 kutsaritang White Pepper, Cooking Oil.')
]

parts = content.split('preCookSteps: [')
new_content = parts[0]

for i in range(1, len(parts)):
    idx = i - 1
    en_desc = "Verify the pantry and gather all ingredients: " + ingredients[idx][0]
    id_desc = "Periksa dapur dan kumpulkan semua bahan: " + ingredients[idx][1]
    tg_desc = "Suriin ang pantry at tipunin ang lahat ng sangkap: " + ingredients[idx][2]
    
    new_step = f"""
      {{
        id: 0,
        text: {{
          en: '{en_desc}',
          id: '{id_desc}',
          tg: '{tg_desc}'
        }},
        image: '{images[idx]}'
      }},"""
    
    new_content += 'preCookSteps: [' + new_step + parts[i]

with open('src/recipesData.ts', 'w') as f:
    f.write(new_content)

print("Done")
