import { Recipe } from './types';

export const RECIPES: Recipe[] = [
  {
    recipeID: 'cantonese-steamed-fish',
    category: 'HK Home Style',
    prepTime: 15,
    cookTime: 15,
    tags: ['Low Sugar', 'Easy Prep', 'Healthy', 'Seafood'],
    image: '/recipes/stage7_final_garnish.png',
    title: {
      en: 'Cantonese Steamed Fish',
      id: 'Ikan Kukus Khas Kanton',
      tg: 'Cantonese Steamed Fish'
    },
    description: {
      en: 'Fresh fish steamed with ginger, scallions, and light soy sauce. A classic Hong Kong dish.',
      id: 'Ikan segar dikukus dengan jahe, daun bawang, dan kecap asin encer. Hidangan klasik Hong Kong.',
      tg: 'Sariwang isda na pinasingawan kasama ang luya, scallions, at light soy sauce. Isang klasikong ulam sa Hong Kong.'
    },
    materialList: [
      '1 Fresh Sea Bass or Grouper (cleaned)', 
      '30g Ginger (julienned)', 
      '3 stalks Scallion (julienned)', 
      '2 tbsp Light Soy Sauce', 
      '1 tbsp Shaoxing Wine', 
      '2 tbsp Cooking Oil', 
      'Coriander for garnish'
    ],
    toolList: ['Steaming plate', 'Wok with lid', 'Steaming rack', 'Chef knife', 'Cutting board'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Thoroughly wash the fresh sea bass under cold running water. Pat the skin and cavity completely dry with paper towels.',
          id: 'Cuci bersih ikan sea bass segar di bawah air mengalir. Keringkan kulit dan bagian dalam perut ikan dengan tisu dapur.',
          tg: 'Hugasan nang mabuti ang sariwang sea bass sa ilalim ng malamig na tubig. Patuyuin nang maigi ang balat at loob nito gamit ang paper towel.'
        },
        image: '/recipes/stage2_cleaning_fish.png'
      },
      {
        id: 2,
        text: {
          en: 'Julienne the ginger into thin matchsticks and cut the scallions into 2-inch lengths. Keep white and green parts separate.',
          id: 'Iris jahe menjadi batang korek api tipis dan potong daun bawang menjadi ukuran 2 inci. Pisahkan bagian putih dan hijau.',
          tg: 'Hiwain ang luya na parang manipis na posporo at gupitin ang mga scallion sa 2-inch na haba. Paghiwalayin ang puti at berdeng bahagi.'
        },
        image: '/recipes/stage3_aromatics_prep.png'
      },
      {
        id: 3,
        text: {
          en: 'Place the fish on a heat-proof oval plate. Arrange half the ginger and scallion whites underneath and inside the fish.',
          id: 'Letakkan ikan di atas piring oval tahan panas. Susun setengah jahe dan bagian putih daun bawang di bawah dan di dalam ikan.',
          tg: 'Ilagay ang isda sa isang heat-proof na oval plate. Ayusin ang kalahati ng luya at puting bahagi ng scallion sa ilalim at loob ng isda.'
        },
        image: '/recipes/stage4_plating_fish.png'
      },
      {
        id: 4,
        text: {
          en: 'Setup your steamer by placing a rack in a wok with boiling water. Ensure the water level is below the rack.',
          id: 'Siapkan kukusan dengan meletakkan rak di dalam wajan berisi air mendidih. Pastikan permukaan air di bawah rak.',
          tg: 'Ihanda ang steamer sa pamamagitan ng paglalagay ng rack sa isang wok na may kumukulong tubig. Siguraduhing ang tubig ay nasa ilalim ng rack.'
        },
        image: '/recipes/stage5_steamer_setup.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Steam the fish on high heat for 10-12 minutes. The flesh should be opaque and flake easily when tested with a chopstick.',
          id: 'Kukus ikan dengan api besar selama 10-12 menit. Daging ikan harus berwarna putih pekat dan mudah terlepas saat dicoba dengan sumpit.',
          tg: 'I-steam ang isda sa malakas na apoy nang 10-12 minuto. Ang laman ay dapat na opaque at madaling mabakbak kapag sinubukan gamit ang chopstick.'
        },
        image: '/recipes/stage6_steaming_process.png'
      },
      {
        id: 2,
        text: {
          en: 'Carefully remove the plate. Discard the steaming liquid. Top with fresh scallions, sizzle with hot oil, and finish with seasoned soy sauce.',
          id: 'Angkat piring dengan hati-hati. Buang air hasil kukusan. Taburi dengan daun bawang segar, siram dengan minyak panas, dan beri kecap asin bumbu.',
          tg: 'Maingat na alisin ang plato. Itapon ang tubig mula sa pag-steam. Lagyan ng sariwang scallions, buhusan ng mainit na mantika, at tapusin gamit ang timpladong toyo.'
        },
        image: '/recipes/stage7_final_garnish.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Elevate the fish with ginger and scallion stalks underneath to allow even steam circulation.",
          id: "Ganjal ikan dengan batang daun bawang dan jahe agar uap panas bersirkulasi merata.",
          tg: "I-angat ang isda gamit ang luya at tangkay ng sibuyas sa ilalim para sa pantay na daloy ng singaw."
        },
        image: "/recipes/stage4_plating_fish.png"
      },
      {
        id: 2,
        text: {
          en: "Discard the cloudy liquid after steaming to remove 'fishy' impurities before adding sauce.",
          id: "Buang cairan keruh setelah dikukus untuk menghilangkan bau amis sebelum menuangkan saus.",
          tg: "Itapon ang malabong sabaw pagkatapos i-steam para maalis ang lansa bago ilagay ang sarsa."
        },
        image: "/recipes/stage6_steaming_process.png"
      },
      {
        id: 3,
        text: {
          en: "Sizzle aromatics by pouring piping hot oil over them before adding the soy sauce mixture.",
          id: "Siram bumbu aromatik dengan minyak yang sangat panas sebelum menuangkan campuran kecap asin.",
          tg: "Buhusan ng napakainit na mantika ang mga pampalasa bago ilagay ang timplang toyo."
        },
        image: "/recipes/stage7_final_garnish.png"
      }
    ]
  },
  {
    recipeID: 'tomato-egg-stir-fry',
    category: 'Simple Meals',
    prepTime: 10,
    cookTime: 10,
    tags: ['Kid Friendly', 'Quick & Easy', 'Vegetarian'],
    image: '/recipes/tomato_egg_main_v4.jpg',
    title: {
      en: 'Tomato & Egg Stir-fry',
      id: 'Tumis Telur & Tomat',
      tg: 'Tomato at Egg Stir-fry'
    },
    description: {
      en: 'A homestyle comfort food featuring scrambled eggs and soft, juicy tomatoes in a sweet and savory sauce.',
      id: 'Makanan rumahan yang terdiri dari telur orak-arik dan tomat segar yang lembut dalam saus manis gurih.',
      tg: 'Isang comfort food na nagtatampok ng scrambled eggs at malambot na kamatis sa isang matamis at malinamnam na sarsa.'
    },
    materialList: [
      '4 Medium Tomatoes (cut into wedges)', 
      '4 Large Eggs', 
      '2 stalks Scallion (chopped)', 
      '1 tbsp Sugar', 
      '1/2 tsp Salt', 
      '2 tbsp Ketchup', 
      '3 tbsp Cooking Oil'
    ],
    toolList: ['Pan', 'Spatula', 'Mixing bowl', 'Chopsticks'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Wash the tomatoes and cut them into small wedges.',
          id: 'Cuci tomat dan potong menjadi irisan kecil.',
          tg: 'Hugasan ang mga kamatis at hiwain sa maliliit na wedges.'
        },
        image: '/recipes/tomato_egg_prep_tomatoes_v2.png'
      },
      {
        id: 2,
        text: {
          en: 'Crack the eggs into a bowl and beat well with a pinch of salt.',
          id: 'Pecahkan telur ke dalam mangkuk dan kocok rata dengan sedikit garam.',
          tg: 'Basagin ang mga itlog sa isang mangkok at batihin nang mabuti kasama ang kaunting asin.'
        },
        image: '/recipes/tomato_egg_prep_eggs_v2.png'
      },
      {
        id: 3,
        text: {
          en: 'Finely chop the scallions to be used as a fresh garnish.',
          id: 'Iris tipis daun bawang untuk digunakan sebagai hiasan segar.',
          tg: 'Pinong tadtarin ang mga scallions para gamiting sariwang garnish.'
        },
        image: '/recipes/tomato_egg_prep_scallions.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Heat 2 tbsp oil in a pan. Pour in the eggs and scramble until just set. Remove and set aside.',
          id: 'Panaskan 2 sdm minyak di wajan. Masukkan telur dan buat orak-arik hingga setengah matang. Angkat dan sisihkan.',
          tg: 'Mag-init ng 2 kutsarang mantika sa isang pan. Ibuhos ang mga itlog at lutuin hanggang sa mag-set. Alisin at itabi.'
        },
        image: '/recipes/tomato_egg_cook_1_v4.jpg'
      },
      {
        id: 2,
        text: {
          en: 'Add remaining 1 tbsp oil to the pan. Stir-fry the tomatoes until they soften and release their juices.',
          id: 'Tambahkan sisa 1 sdm minyak ke wajan. Tumis tomat hingga melunak dan mengeluarkan airnya.',
          tg: 'Magdagdag ng natitirang 1 kutsarang mantika sa pan. Igisa ang mga kamatis hanggang sa lumambot at lumabas ang katas nito.'
        },
        image: '/recipes/tomato_egg_cook_2_v4.jpg'
      },
      {
        id: 3,
        text: {
          en: 'Return the eggs to the pan, add sugar, salt, and ketchup. Mix well and garnish with chopped scallions before serving.',
          id: 'Masukkan kembali telur ke wajan, tambahkan gula, garam, dan saus tomat. Aduk rata and hiasi dengan daun bawang cincang sebelum disajikan.',
          tg: 'Ibalik ang mga itlog sa pan, magdagdag ng asukal, asin, at ketchup. Haluin nang mabuti at palamutian ng tinadtad na scallions bago ihain.'
        },
        image: '/recipes/tomato_egg_cook_3_v4.jpg'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Soft-scramble eggs first and remove when 80% cooked to keep them fluffy and tender.",
          id: "Masak telur orak-arik sampai 80% matang lalu sisihkan agar teksturnya tetap lembut dan empuk.",
          tg: "I-scramble ang itlog hanggang 80% luto lang at hanguin para manatiling malambot at malinamnam."
        },
        image: "/recipes/tomato_egg_main_v4.jpg"
      },
      {
        id: 2,
        text: {
          en: "Use very ripe tomatoes and add a teaspoon of ketchup to enhance color and umami depth.",
          id: "Gunakan tomat yang sangat matang dan tambahkan sesendok saus tomat untuk warna dan rasa umami.",
          tg: "Gumamit ng hinog na kamatis at lagyan ng isang kutsarang ketchup para sa ganda ng kulay at linamnam."
        },
        image: "/recipes/tomato_egg_main_v4.jpg"
      },
      {
        id: 3,
        text: {
          en: "Balance the acidity of the tomatoes with a pinch of sugar for an authentic sweet-savory profile.",
          id: "Seimbangkan asam tomat dengan sejumput gula untuk profil rasa manis-gurih yang otentik.",
          tg: "Balansehin ang asim ng kamatis gamit ang kaunting asukal para sa tamang timpla ng tamis at alat."
        },
        image: "/recipes/tomato_egg_main_v4.jpg"
      }
    ]
  },
  {
    recipeID: 'garlic-bok-choy',
    category: 'HK Home Style',
    prepTime: 5,
    cookTime: 5,
    tags: ['Vegan', 'Easy Prep', 'Healthy'],
    image: '/recipes/garlic_bok_choy.png',
    title: {
      en: 'Garlic Bok Choy',
      id: 'Bok Choy Tumis Bawang',
      tg: 'Garlic Bok Choy'
    },
    description: {
      en: 'Simple, crisp, and vibrant baby bok choy stir-fried with plenty of minced garlic.',
      id: 'Bok choy bayi yang sederhana, renyah, dan cerah ditumis dengan banyak bawang putih cincang.',
      tg: 'Simple, malutong, at makulay na baby bok choy na ginisa sa maraming tinadtad na bawang.'
    },
    materialList: [
      '400g Baby Bok Choy',
      '4 cloves Garlic (minced)',
      '1 tbsp Oil',
      '1/2 tsp Salt',
      '1/2 tsp Sugar',
      '1/4 cup Chicken Broth (or water)'
    ],
    toolList: ['Wok', 'Spatula', 'Cutting board', 'Chef knife'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Wash the bok choy thoroughly. If they are large, cut them in half lengthwise.',
          id: 'Cuci bok choy hingga bersih. Jika ukurannya besar, potong dua memanjang.',
          tg: 'Hugasan nang mabuti ang bok choy. Kung malalaki, hiwain sa gitna nang pahaba.'
        },
        image: '/recipes/garlic_bok_choy_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Mince the garlic finely.',
          id: 'Cincang halus bawang putih.',
          tg: 'Tadtarin nang pino ang bawang.'
        },
        image: '/recipes/garlic_bok_choy_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Heat the oil in a wok over medium heat. Add the minced garlic and sauté until fragrant but not browned.',
          id: 'Panaskan minyak di wajan dengan api sedang. Tambahkan bawang putih cincang dan tumis hingga harum tetapi tidak kecoklatan.',
          tg: 'Mag-init ng mantika sa wok sa katamtamang apoy. Idagdag ang tinadtad na bawang at igisa hanggang bumango pero hindi dapat maging brown.'
        },
        image: '/recipes/garlic_bok_choy_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Turn up the heat to high. Add the bok choy and stir-fry for 1 minute.',
          id: 'Besarkan api. Masukkan bok choy dan tumis selama 1 menit.',
          tg: 'Lakasan ang apoy. Idagdag ang bok choy at igisa nang 1 minuto.'
        },
        image: '/recipes/garlic_bok_choy_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Pour in the broth, add salt and sugar. Cover with a lid and steam for 1-2 minutes until tender-crisp. Serve immediately.',
          id: 'Tuangkan kaldu, tambahkan garam dan gula. Tutup wajan dan biarkan mengukus selama 1-2 menit hingga layu namun tetap renyah. Sajikan segera.',
          tg: 'Ibuhos ang sabaw, magdagdag ng asin at asukal. Takpan at i-steam nang 1-2 minuto hanggang sa maging tender-crisp. Ihain agad.'
        },
        image: '/recipes/garlic_bok_choy_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Dry the leaves thoroughly after washing; excess water will steam the greens instead of searing.",
          id: "Keringkan sayur sepenuhnya setelah dicuci; sisa air akan membuat sayur layu karena mengukus.",
          tg: "Patuyuin nang mabuti ang mga dahon; ang sobrang tubig ay magpapatuyo at magpapalambot sa gulay."
        },
        image: "/recipes/garlic_bok_choy.png"
      },
      {
        id: 2,
        text: {
          en: "Sauté minced garlic for only 30 seconds until fragrant to avoid bitterness before adding greens.",
          id: "Tumis bawang putih cincang selama 30 detik saja sampai harum agar tidak pahit sebelum memasukkan sayur.",
          tg: "Igisa ang bawang nang 30 segundo lang hanggang humalimuyak para hindi pumait bago ilagay ang gulay."
        },
        image: "/recipes/garlic_bok_choy.png"
      },
      {
        id: 3,
        text: {
          en: "Add salt only at the very end to prevent the vegetables from releasing too much water.",
          id: "Tambahkan garam hanya di bagian akhir untuk mencegah sayuran mengeluarkan terlalu banyak air.",
          tg: "Maglagay ng asin sa huling bahagi na ng pagluluto para hindi magtubig nang husto ang gulay."
        },
        image: "/recipes/garlic_bok_choy.png"
      }
    ]
  },
  {
    recipeID: 'sweet-and-sour-pork',
    category: 'Classic HK',
    prepTime: 20,
    cookTime: 15,
    tags: ['Meat', 'Deep Fried', 'Flavorful'],
    image: '/recipes/sweet_sour_pork.png',
    title: {
      en: 'Sweet & Sour Pork',
      id: 'Babi Asam Manis',
      tg: 'Sweet and Sour Pork'
    },
    description: {
      en: 'Crispy fried pork chunks tossed in a vibrant, sticky sweet and sour sauce with bell peppers and pineapple.',
      id: 'Potongan daging babi goreng renyah yang dicampur dengan saus asam manis lengket, paprika, dan nanas.',
      tg: 'Malutong na pritong karne ng baboy na inihalo sa matamis at maasim na sarsa na may kasamang bell peppers at pinya.'
    },
    materialList: [
      '300g Pork Shoulder/Butt (cubed)',
      '1 Green Bell Pepper (cubed)',
      '1 Red Bell Pepper (cubed)',
      '1/2 cup Fresh Pineapple (cubed)',
      '1 Egg',
      'Cornstarch for coating',
      'Sweet and Sour Sauce (ketchup, vinegar, sugar)'
    ],
    toolList: ['Deep fryer or large pot', 'Wok', 'Tongs', 'Mixing bowls'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Marinate the pork cubes with salt, soy sauce, and egg. Toss to coat evenly.',
          id: 'Marinasi potongan daging babi dengan garam, kecap asin, dan telur. Aduk hingga rata.',
          tg: 'I-marinate ang mga cube ng baboy sa asin, soy sauce, at itlog. Haluin nang mabuti.'
        },
        image: '/recipes/sweet_sour_pork_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Cut the bell peppers and pineapple into bite-sized chunks.',
          id: 'Potong paprika dan nanas seukuran gigitan.',
          tg: 'Hiwain ang mga bell pepper at pinya sa bite-sized na piraso.'
        },
        image: '/recipes/sweet_sour_pork_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Coat the pork heavily in cornstarch. Deep fry in hot oil until golden and crispy (about 5-6 mins). Drain well.',
          id: 'Baluri daging babi dengan tepung maizena. Goreng dalam minyak panas hingga kuning keemasan dan renyah (sekitar 5-6 menit). Tiriskan.',
          tg: 'Balutin ang baboy sa cornstarch. I-deep fry sa mainit na mantika hanggang maging golden at malutong (mga 5-6 minuto). Patuyuin nang mabuti.'
        },
        image: '/recipes/sweet_sour_pork_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'In a clean wok, briefly stir-fry the peppers and pineapple. Remove.',
          id: 'Di wajan bersih, tumis sebentar paprika dan nanas. Angkat.',
          tg: 'Sa isang malinis na wok, igisa sandali ang mga paminta at pinya. Alisin.'
        },
        image: '/recipes/sweet_sour_pork_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Pour the sweet and sour sauce into the wok, heat until bubbling and thickened. Toss in pork, veg, and fruit to coat. Serve immediately.',
          id: 'Tuang saus asam manis ke wajan, panaskan hingga mendidih dan mengental. Masukkan babi, sayuran, dan buah lalu aduk rata. Sajikan segera.',
          tg: 'Ibuhos ang sweet and sour sauce sa wok, initin hanggang kumulo at lumapot. Ihalo ang baboy, gulay, at prutas upang mabalutan. Ihain agad.'
        },
        image: '/recipes/sweet_sour_pork_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Use the double-fry method: fry once to cook, and a second time at higher heat for ultimate crispness.",
          id: "Gunakan metode goreng dua kali: sekali untuk mematangkan, kedua dengan api besar agar sangat renyah.",
          tg: "Gamitin ang double-fry method: unang prito para maluto, at pangalawa sa malakas na apoy para sa lutong."
        },
        image: "/recipes/sweet_sour_pork.png"
      },
      {
        id: 2,
        text: {
          en: "Coating meat with cornstarch or potato starch creates a lighter, crispier crust than flour.",
          id: "Balut daging dengan tepung maizena atau pati kentang untuk lapisan yang lebih ringan dan renyah dibanding terigu.",
          tg: "Balutin ang karne sa cornstarch o potato starch para sa mas magaan at mas renyong balat kaysa sa harina."
        },
        image: "/recipes/sweet_sour_pork.png"
      },
      {
        id: 3,
        text: {
          en: "Toss the pork in the sauce for only 10-15 seconds to keep the coating from turning soggy.",
          id: "Aduk daging dalam saus hanya selama 10-15 detik agar lapisan renyahnya tidak menjadi lembek.",
          tg: "Ihalo ang karne sa sarsa nang 10-15 segundo lang para hindi lumambot ang pagkakaprito nito."
        },
        image: "/recipes/sweet_sour_pork.png"
      }
    ]
  },
  {
    recipeID: 'steamed-garlic-chicken',
    category: 'HK Home Style',
    prepTime: 15,
    cookTime: 20,
    tags: ['High Protein', 'Healthy', 'Comfort Food'],
    image: '/recipes/garlic_soy_chicken.png',
    title: {
      en: 'Steamed Garlic Soy Chicken',
      id: 'Ayam Kukus Bawang Putih & Kecap Asin',
      tg: 'Steamed Garlic Soy Chicken'
    },
    description: {
      en: 'Succulent chicken pieces steamed over shiitake mushrooms and topped with an aromatic garlic soy sauce.',
      id: 'Potongan ayam lezat yang dikukus di atas jamur shiitake dan disiram dengan saus bawang putih kecap asin yang harum.',
      tg: 'Masarap na piraso ng manok na pinasingawan sa ibabaw ng shiitake mushrooms at nilagyan ng mabangong garlic soy sauce.'
    },
    materialList: [
      '500g Chicken Thigh (boneless, cut into bite pieces)',
      '4 Dried Shiitake Mushrooms (soaked & sliced)',
      '3 cloves Garlic (minced)',
      '1 tbsp Soy Sauce',
      '1 tsp Oyster Sauce',
      '1/2 tsp Sugar',
      '1 tsp Cornstarch'
    ],
    toolList: ['Steamer', 'Mixing bowl', 'Heat-proof plate'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Soak shiitake mushrooms in warm water until soft, then slice thinly.',
          id: 'Rendam jamur shiitake dalam air hangat hingga lunak, lalu iris tipis.',
          tg: 'Ibabad ang shiitake mushrooms sa maligamgam na tubig hanggang lumambot, pagkatapos ay hiwain nang maninipis.'
        },
        image: '/recipes/garlic_chicken_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Marinate chicken pieces with soy sauce, oyster sauce, sugar, garlic, and cornstarch for 15 mins.',
          id: 'Marinasi potongan ayam dengan kecap asin, saus tiram, gula, bawang putih, dan tepung maizena selama 15 menit.',
          tg: 'I-marinate ang mga piraso ng manok sa soy sauce, oyster sauce, asukal, bawang, at cornstarch ng 15 minuto.'
        },
        image: '/recipes/garlic_chicken_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Spread the sliced mushrooms evenly on the bottom of a heat-proof plate.',
          id: 'Sebarkan irisan jamur secara merata di dasar piring tahan panas.',
          tg: 'Ikalat nang pantay ang hiniwang kabute sa ilalim ng isang heat-proof na plato.'
        },
        image: '/recipes/garlic_chicken_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Place the marinated chicken evenly on top of the mushrooms. Do not stack them too thickly.',
          id: 'Letakkan ayam yang sudah dimarinasi secara merata di atas jamur. Jangan ditumpuk terlalu tebal.',
          tg: 'Ilagay ang na-marinate na manok sa ibabaw ng mga kabute nang pantay. Huwag pagpatung-patungin nang makapal.'
        },
        image: '/recipes/garlic_chicken_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Steam over boiling water for 15-18 minutes until the chicken is fully cooked.',
          id: 'Kukus di atas air mendidih selama 15-18 menit hingga ayam matang sepenuhnya.',
          tg: 'I-steam sa ibabaw ng kumukulong tubig nang 15-18 minuto hanggang maluto nang tuluyan ang manok.'
        },
        image: '/recipes/garlic_chicken_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Velvet the chicken with a teaspoon of cornstarch in the marinade to lock in juices and silkiness.",
          id: "Gunakan teknik 'velveting' dengan maizena dalam bumbu rendaman agar ayam tetap juicy dan lembut.",
          tg: "Haluan ng cornstarch ang marinade para manatiling malambot at hindi matuyo ang karne ng manok."
        },
        image: "/recipes/garlic_soy_chicken.png"
      },
      {
        id: 2,
        text: {
          en: "Always use chicken thighs (bone-in preferred) as breast meat easily becomes dry and chalky when steamed.",
          id: "Gunakan paha ayam karena dada ayam mudah menjadi kering dan keras saat dikukus.",
          tg: "Palaging gumamit ng hita ng manok dahil ang pitso ay madaling tumigas at matuyo kapag na-steam."
        },
        image: "/recipes/garlic_soy_chicken.png"
      },
      {
        id: 3,
        text: {
          en: "Massage the marinade into the meat by hand for 2-3 minutes to ensure deep flavor penetration.",
          id: "Remas-remas bumbu ke daging selama 2-3 menit agar bumbu meresap sempurna ke dalam serat ayam.",
          tg: "I-masahe ang marinade sa karne nang 2-3 minuto para mas lumalim ang kapit ng lasa."
        },
        image: "/recipes/garlic_soy_chicken.png"
      }
    ]
  },
  {
    recipeID: 'beef-chow-fun',
    category: 'Noodles',
    prepTime: 15,
    cookTime: 10,
    tags: ['Stir Fry', 'Wok Hei', 'Savory'],
    image: '/recipes/beef_chow_fun.png',
    title: {
      en: 'Beef Chow Fun (Stir-fried Beef Noodles)',
      id: 'Kwetiau Sapi (Beef Chow Fun)',
      tg: 'Beef Chow Fun'
    },
    description: {
      en: 'Dry stir-fried flat rice noodles with tender beef slices, bean sprouts, and scallions. Famous for its "wok hei".',
      id: 'Kwetiau beras tumis kering dengan irisan sapi empuk, tauge, dan daun bawang. Terkenal dengan "wok hei" nya.',
      tg: 'Dry stir-fried flat rice noodles na may malambot na piraso ng baka, toge, at scallions. Kilala dahil sa "wok hei".'
    },
    materialList: [
      '400g Fresh Flat Rice Noodles (Hor Fun)',
      '200g Flank Steak (sliced thin against grain)',
      '1 cup Bean Sprouts',
      '3 stalks Scallion (cut into 2-inch pieces)',
      '1 tbsp Dark Soy Sauce',
      '2 tbsp Light Soy Sauce',
      '1/2 tsp Sugar'
    ],
    toolList: ['Wok', 'Spatula', 'Chopsticks'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Separate the fresh rice noodles gently so they do not clump.',
          id: 'Pisahkan helaian kwetiau segar secara perlahan agar tidak menggumpal.',
          tg: 'Paghiwalayin nang maingat ang sariwang rice noodles para hindi magdikit-dikit.'
        },
        image: '/recipes/beef_chow_fun_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Marinate beef slices with a pinch of baking soda, soy sauce, and oil for 10 minutes.',
          id: 'Marinasi irisan daging sapi dengan sedikit soda kue, kecap asin, dan minyak selama 10 menit.',
          tg: 'I-marinate ang mga hiwa ng baka sa kaunting baking soda, soy sauce, at mantika ng 10 minuto.'
        },
        image: '/recipes/beef_chow_fun_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Sear beef in a very hot wok with oil until 80% cooked. Remove and set aside.',
          id: 'Tumis daging sapi di wajan yang sangat panas dengan minyak hingga 80% matang. Angkat dan sisihkan.',
          tg: 'I-sear ang baka sa napakainit na wok na may mantika hanggang 80% na luto. Alisin at itabi.'
        },
        image: '/recipes/beef_chow_fun_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Add a bit more oil. Toss in the rice noodles and stir-fry aggressively. Add dark and light soy sauces.',
          id: 'Tambahkan sedikit minyak lagi. Masukkan kwetiau dan tumis dengan cepat. Tambahkan kecap hitam dan kecap asin.',
          tg: 'Magdagdag pa ng kaunting mantika. Ihulog ang rice noodles at igisa nang mabuti. Idagdag ang dark at light soy sauce.'
        },
        image: '/recipes/beef_chow_fun_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Return beef to wok, add bean sprouts and scallions. Toss for 1 minute until fragrant. Serve hot.',
          id: 'Masukkan kembali daging sapi ke wajan, tambahkan tauge dan daun bawang. Aduk selama 1 menit hingga harum. Sajikan panas.',
          tg: 'Ibalik ang baka sa wok, magdagdag ng toge at scallions. Haluin ng 1 minuto hanggang bumango. Ihain nang mainit.'
        },
        image: '/recipes/beef_chow_fun_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Loosen fresh rice noodles manually before cooking to prevent clumping and breakage in the wok.",
          id: "Urai kwetiau segar dengan tangan sebelum dimasak agar tidak menggumpal atau hancur di wajan.",
          tg: "Paghiwa-hiwalayin ang noodles gamit ang kamay bago lutuin para hindi ito magdikit-dikit o maputol."
        },
        image: "/recipes/beef_chow_fun.png"
      },
      {
        id: 2,
        text: {
          en: "Pour soy sauce around the glowing rim of the wok to caramelize it for the signature smoky aroma.",
          id: "Tuang kecap asin di pinggiran wajan panas agar terkaramelisasi dan menghasilkan aroma asap (Wok Hei).",
          tg: "Ipaikot ang toyo sa gilid ng mainit na kawali para mag-caramelize at magkaroon ng amoy-usok."
        },
        image: "/recipes/beef_chow_fun.png"
      },
      {
        id: 3,
        text: {
          en: "Tenderize beef with a pinch of baking soda and sear in small batches to maintain high heat.",
          id: "Empukkan sapi dengan sedikit baking soda dan tumis dalam porsi kecil agar suhu wajan tetap panas.",
          tg: "Palambutin ang baka gamit ang baking soda at lutuin nang paunti-unti para manatiling mainit ang kawali."
        },
        image: "/recipes/beef_chow_fun.png"
      }
    ]
  },
  {
    recipeID: 'mapo-tofu',
    category: 'Spicy',
    prepTime: 10,
    cookTime: 15,
    tags: ['Pork', 'Spicy', 'Comfort Food'],
    image: '/recipes/mapo_tofu.png',
    title: {
      en: 'Mapo Tofu (HK Style)',
      id: 'Tahu Mapo (Gaya HK)',
      tg: 'Mapo Tofu (HK Style)'
    },
    description: {
      en: 'Silken tofu set in a slightly spicy, numbing, and savory meat sauce. Perfect over rice.',
      id: 'Tahu sutra dalam saus daging gurih yang sedikit pedas dan beraroma. Sempurna dimakan dengan nasi.',
      tg: 'Silken tofu na nakababad sa bahagyang maanghang at malinamnam na sarsa ng karne. Perpekto kasama ang kanin.'
    },
    materialList: [
      '1 box Silken Tofu (cut into cubes)',
      '100g Ground Pork',
      '2 tbsp Doubanjiang (Chili Bean Paste)',
      '2 cloves Garlic (minced)',
      '1 stalk Scallion (chopped)',
      '1/2 cup Chicken Broth',
      'Cornstarch slurry (1 tsp cornstarch + 2 tbsp water)'
    ],
    toolList: ['Wok', 'Spatula', 'Small pot for blanching'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Gently blanch the tofu cubes in hot salted water for 2 mins to firm them up. Drain carefully.',
          id: 'Rebus perlahan potongan tahu di air panas bergaram selama 2 menit agar sedikit mengeras. Tiriskan dengan hati-hati.',
          tg: 'Ilubog nang bahagya ang mga cube ng tofu sa mainit na tubig na may asin ng 2 minuto para tumibay. Patuyuin nang maingat.'
        },
        image: '/recipes/mapo_tofu_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Mince garlic and chop scallions. Mix the cornstarch slurry.',
          id: 'Cincang bawang putih dan iris daun bawang. Campurkan larutan tepung maizena.',
          tg: 'Tadtarin ang bawang at hiwain ang scallions. Ihalo ang cornstarch slurry.'
        },
        image: '/recipes/mapo_tofu_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Fry ground pork in a wok with oil until browned. Push to one side.',
          id: 'Goreng daging babi giling di wajan dengan minyak hingga kecoklatan. Sisihkan ke satu sisi.',
          tg: 'Iprito ang giniling na baboy sa wok na may mantika hanggang maging brown. Itabi sa isang gilid.'
        },
        image: '/recipes/mapo_tofu_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Add chili bean paste and minced garlic to the oil. Sauté until the oil turns red.',
          id: 'Tambahkan pasta kacang cabai dan bawang putih cincang ke minyak. Tumis hingga minyak berubah warna menjadi merah.',
          tg: 'Idagdag ang chili bean paste at tinadtad na bawang sa mantika. Igisa hanggang maging pula ang mantika.'
        },
        image: '/recipes/mapo_tofu_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Pour in broth and bring to boil. Gently slide in the tofu. Simmer for 3 mins. Stir in cornstarch slurry to thicken, garnish with scallions.',
          id: 'Tuangkan kaldu dan didihkan. Masukkan tahu dengan hati-hati. Rebus perlahan selama 3 menit. Aduk larutan maizena untuk mengentalkan, hiasi dengan daun bawang.',
          tg: 'Ibuhos ang sabaw at pakuluin. Dahan-dahang ilagay ang tofu. Pakuluin nang 3 minuto. Ihalo ang cornstarch slurry upang lumapot, palamutian ng scallions.'
        },
        image: '/recipes/mapo_tofu_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Blanch tofu cubes in salted boiling water for 1 minute to firm them up before stir-frying.",
          id: "Rebus sebentar tahu dalam air garam mendidih selama 1 menit agar tahu tidak mudah hancur saat ditumis.",
          tg: "I-blanch ang tofu sa kumukulong tubig na may asin nang 1 minuto para hindi ito madaling madurog."
        },
        image: "/recipes/mapo_tofu.png"
      },
      {
        id: 2,
        text: {
          en: "Fry the bean paste (Doubanjiang) in oil until the oil turns bright red to release full flavor.",
          id: "Tumis pasta kedelai (Doubanjiang) dalam minyak sampai minyak berwarna merah terang untuk rasa maksimal.",
          tg: "Igisa ang Doubanjiang sa mantika hanggang pumula ito nang husto para lumabas ang buong lasa."
        },
        image: "/recipes/mapo_tofu.png"
      },
      {
        id: 3,
        text: {
          en: "Use a gentle 'nudging' motion with the spatula rather than stirring to keep tofu cubes intact.",
          id: "Gunakan gerakan mendorong pelan dengan spatula bukannya mengaduk agar tahu tidak hancur.",
          tg: "Dahan-dahang itulak ang spatula sa halip na haluin nang malakas para hindi madurog ang tofu."
        },
        image: "/recipes/mapo_tofu.png"
      }
    ]
  },
  {
    recipeID: 'steamed-pork-ribs',
    category: 'Dim Sum',
    prepTime: 20,
    cookTime: 15,
    tags: ['Meat', 'Dim Sum Style', 'Flavorful'],
    image: '/recipes/black_bean_ribs.png',
    title: {
      en: 'Steamed Pork Ribs with Black Bean Sauce',
      id: 'Iga Babi Kukus Saus Kedelai Hitam',
      tg: 'Steamed Pork Ribs with Black Bean Sauce'
    },
    description: {
      en: 'Classic dim sum dish. Bite-sized spare ribs steamed to tenderness with savory fermented black beans.',
      id: 'Hidangan dim sum klasik. Potongan iga babi dikukus hingga empuk dengan kedelai hitam fermentasi yang gurih.',
      tg: 'Klasikong dim sum. Maliliit na spare ribs na pinasingawan hanggang lumambot kasama ang fermented black beans.'
    },
    materialList: [
      '300g Spare Ribs (chopped into bite size)',
      '1 tbsp Fermented Black Beans (rinsed & mashed)',
      '2 cloves Garlic (minced)',
      '1/2 red chili (sliced)',
      '1 tbsp Soy Sauce',
      '1 tsp Sugar',
      '1 tbsp Cornstarch'
    ],
    toolList: ['Steamer', 'Mixing bowl', 'Heat-proof plate'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Wash ribs in cold water for 10 mins to remove blood, pat very dry. This ensures white, clean meat.',
          id: 'Cuci iga dalam air dingin selama 10 menit untuk menghilangkan darah, tepuk hingga sangat kering. Ini memastikan daging berwarna putih dan bersih.',
          tg: 'Hugasan ang ribs sa malamig na tubig ng 10 minuto para maalis ang dugo, patuyuin nang mabuti. Sisiguraduhin nito na maputi at malinis ang karne.'
        },
        image: '/recipes/black_bean_ribs_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Mash the fermented black beans and garlic together.',
          id: 'Tumbuk kedelai hitam fermentasi dan bawang putih bersamaan.',
          tg: 'Dikdikin nang magkasama ang fermented black beans at bawang.'
        },
        image: '/recipes/black_bean_ribs_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Marinate ribs with black bean garlic paste, soy sauce, sugar, and cornstarch. Let sit for 15 mins.',
          id: 'Marinasi iga dengan pasta bawang putih kedelai hitam, kecap asin, gula, dan tepung maizena. Diamkan selama 15 menit.',
          tg: 'I-marinate ang ribs sa black bean garlic paste, soy sauce, asukal, at cornstarch. Hayaang nakababad ng 15 minuto.'
        },
        image: '/recipes/black_bean_ribs_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Spread ribs in a single layer on a plate. Top with red chili slices.',
          id: 'Susun iga dalam satu lapisan di atas piring. Taburi dengan irisan cabai merah.',
          tg: 'Ikalat ang ribs sa isang layer sa plato. Lagyan ng hiwa ng red chili sa ibabaw.'
        },
        image: '/recipes/black_bean_ribs_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Steam on high heat for 12-15 minutes until tender and cooked through.',
          id: 'Kukus dengan api besar selama 12-15 menit hingga empuk dan matang merata.',
          tg: 'I-steam sa malakas na apoy nang 12-15 minuto hanggang lumambot at maluto nang tuluyan.'
        },
        image: '/recipes/black_bean_ribs_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Rinse ribs thoroughly and rub with starch to remove blood and impurities for a clean taste.",
          id: "Bilas iga sampai bersih dan gosok dengan pati untuk membuang sisa darah agar rasa tidak amis.",
          tg: "Hugasan nang mabuti ang ribs at kuskusan ng starch para maalis ang dumi at lansa ng dugo."
        },
        image: "/recipes/black_bean_ribs.png"
      },
      {
        id: 2,
        text: {
          en: "Sauté the fermented black beans and garlic before marinating to significantly deepen the umami.",
          id: "Tumis tausi dan bawang putih sebelum dicampur ke bumbu rendaman untuk rasa umami yang lebih dalam.",
          tg: "Igisa muna ang tausi at bawang bago i-marinate para mas lalong lumabas ang sarap at linamnam."
        },
        image: "/recipes/black_bean_ribs.png"
      },
      {
        id: 3,
        text: {
          en: "Steam on a bed of taro or pumpkin; the vegetables will absorb the savory pork juices.",
          id: "Kukus di atas potongan talas atau labu parang; sayuran akan menyerap sari daging yang gurih.",
          tg: "I-steam sa ibabaw ng gabi o kalabasa; sisipsipin ng gulay ang malinamnam na katas ng karne."
        },
        image: "/recipes/black_bean_ribs.png"
      }
    ]
  },
  {
    recipeID: 'char-siu',
    category: 'Roasted',
    prepTime: 120,
    cookTime: 40,
    tags: ['Meat', 'Sweet', 'Oven'],
    image: '/recipes/char_siu.png',
    title: {
      en: 'Char Siu (Chinese BBQ Pork)',
      id: 'Char Siu (Babi Panggang Cina)',
      tg: 'Char Siu (Chinese BBQ Pork)'
    },
    description: {
      en: 'Iconic sticky, sweet, and savory roasted pork. Tender on the inside with a caramelized exterior.',
      id: 'Babi panggang yang lengket, manis, dan gurih. Lembut di dalam dengan karamelisasi di bagian luar.',
      tg: 'Sikat na malagkit, matamis, at malinamnam na inihaw na baboy. Malambot sa loob at may caramelized na labas.'
    },
    materialList: [
      '500g Pork Shoulder/Butt (cut into long thick strips)',
      '2 tbsp Hoisin Sauce',
      '2 tbsp Soy Sauce',
      '2 tbsp Honey',
      '1 tbsp Chinese Rose Wine (or Shaoxing)',
      '1/2 tsp Five Spice Powder',
      'Honey or Maltose for glazing'
    ],
    toolList: ['Oven', 'Roasting rack', 'Pastry brush', 'Mixing bowl'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Mix hoisin, soy sauce, honey, wine, and five spice powder to create the marinade.',
          id: 'Campurkan saus hoisin, kecap asin, madu, arak, dan bubuk ngohiong untuk membuat bumbu marinasi.',
          tg: 'Ipaghalo ang hoisin, soy sauce, pulot, alak, at five spice powder upang gawing marinade.'
        },
        image: '/recipes/char_siu_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Coat the pork strips thoroughly in the marinade. Cover and refrigerate for at least 4 hours, overnight is best.',
          id: 'Baluri irisan daging babi hingga rata dengan bumbu marinasi. Tutup dan simpan di kulkas minimal 4 jam, semalaman lebih baik.',
          tg: 'Balutin nang mabuti ang mga hiwa ng baboy sa marinade. Takpan at ilagay sa ref ng hindi bababa sa 4 na oras, pinakamainam kung overnight.'
        },
        image: '/recipes/char_siu_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Preheat oven to 200°C (400°F). Place pork on a wire rack with a foil-lined baking tray underneath.',
          id: 'Panaskan oven hingga 200°C (400°F). Letakkan babi di atas rak kawat dengan nampan berlapis aluminium foil di bawahnya.',
          tg: 'Painitin ang oven sa 200°C (400°F). Ilagay ang baboy sa isang wire rack na may foil-lined baking tray sa ilalim.'
        },
        image: '/recipes/char_siu_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Roast for 20 minutes. Remove and brush liberally with honey on all sides.',
          id: 'Panggang selama 20 menit. Keluarkan dan olesi dengan madu di semua sisi.',
          tg: 'I-roast ng 20 minuto. Alisin at pahiran nang makapal ng pulot sa lahat ng gilid.'
        },
        image: '/recipes/char_siu_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Turn heat up to 220°C and roast for another 10-15 mins until the edges are nicely charred. Rest before slicing.',
          id: 'Naikkan suhu oven ke 220°C dan panggang lagi selama 10-15 menit hingga bagian tepi agak gosong. Diamkan sebelum diiris.',
          tg: 'Lakasan ang init sa 220°C at i-roast pa ng 10-15 minuto hanggang masunog nang kaunti ang mga gilid. Ipaubaya bago hiwain.'
        },
        image: '/recipes/char_siu_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Use pork shoulder or neck; these cuts have the ideal fat marbling to stay juicy during roasting.",
          id: "Gunakan bagian bahu atau leher babi; bagian ini memiliki lemak yang pas agar tetap juicy saat dipanggang.",
          tg: "Gumamit ng pork shoulder o leeg; ang mga parteng ito ay may tamang taba para manatiling malambot."
        },
        image: '/recipes/char_siu.png'
      },
      {
        id: 2,
        text: {
          en: "Baste the meat every 15 minutes with a honey or maltose glaze to build a thick, lacquered crust.",
          id: "Olesi daging setiap 15 menit dengan madu atau maltosa untuk membentuk lapisan karamel yang tebal.",
          tg: "Pahiran ang karne kada 15 minuto ng honey o maltose glaze para magkaroon ng makapal at makintab na balat."
        },
        image: '/recipes/char_siu.png'
      },
      {
        id: 3,
        text: {
          en: "Finish under the broiler for 2-3 minutes to achieve the signature charred 'burnt ends'.",
          id: "Gunakan api atas (broil) selama 2-3 menit di akhir untuk mendapatkan efek pinggiran yang sedikit gosong.",
          tg: "I-broil nang 2-3 minuto sa huli para makuha ang sikat na sunog-sunog na gilid ng karne."
        },
        image: '/recipes/char_siu.png'
      }
    ]
  },
  {
    recipeID: 'shrimp-fried-rice',
    category: 'Rice',
    prepTime: 10,
    cookTime: 10,
    tags: ['Quick', 'Seafood', 'Staple'],
    image: '/recipes/shrimp_fried_rice.png',
    title: {
      en: 'Shrimp and Egg Fried Rice',
      id: 'Nasi Goreng Udang dan Telur',
      tg: 'Shrimp and Egg Fried Rice'
    },
    description: {
      en: 'A quick and satisfying staple of overnight rice stir-fried with juicy shrimp, eggs, and green onions.',
      id: 'Makanan pokok yang cepat dan memuaskan dari nasi sisa semalam yang ditumis dengan udang berair, telur, dan daun bawang.',
      tg: 'Mabilis at nakakabusog na staple ng kaning lamig na ginisa kasama ang makatas na hipon, itlog, at green onions.'
    },
    materialList: [
      '2 cups Overnight Cooked Rice',
      '150g Shelled Shrimp',
      '2 Eggs (beaten)',
      '1/4 cup Frozen Peas',
      '2 stalks Scallion (chopped)',
      '1 tbsp Soy Sauce',
      '1/2 tsp White Pepper',
      'Oil for stir-frying'
    ],
    toolList: ['Wok', 'Spatula', 'Small bowl'],
    preCookSteps: [
      {
        id: 1,
        text: {
          en: 'Break up the overnight rice with wet hands so there are no large clumps.',
          id: 'Hancurkan nasi sisa semalam dengan tangan basah agar tidak ada gumpalan besar.',
          tg: 'Durugin ang kaning lamig gamit ang basang kamay para walang malalaking buo-buo.'
        },
        image: '/recipes/shrimp_fried_rice_prep_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Pat the shrimp dry and season lightly with salt.',
          id: 'Keringkan udang dan bumbui tipis dengan garam.',
          tg: 'Patuyuin ang hipon at timplahan nang bahagya ng asin.'
        },
        image: '/recipes/shrimp_fried_rice_prep_2.png'
      }
    ],
    cookSteps: [
      {
        id: 1,
        text: {
          en: 'Stir-fry shrimp in a hot wok with oil until pink. Remove and set aside.',
          id: 'Tumis udang di wajan panas dengan minyak hingga berwarna merah muda. Angkat dan sisihkan.',
          tg: 'Igisa ang hipon sa mainit na wok na may mantika hanggang maging pink. Alisin at itabi.'
        },
        image: '/recipes/shrimp_fried_rice_cook_1.png'
      },
      {
        id: 2,
        text: {
          en: 'Pour beaten eggs into the wok, scramble lightly. Add the rice and stir vigorously to break up grains.',
          id: 'Tuangkan kocokan telur ke wajan, orak-arik sebentar. Masukkan nasi dan aduk kuat-kuat untuk mengurai butirannya.',
          tg: 'Ibuhos ang binating itlog sa wok, lutuin nang bahagya. Idagdag ang kanin at haluin nang mabuti upang madurog ang mga butil.'
        },
        image: '/recipes/shrimp_fried_rice_cook_2.png'
      },
      {
        id: 3,
        text: {
          en: 'Add peas, cooked shrimp, soy sauce, and pepper. Toss well. Mix in scallions right before serving.',
          id: 'Masukkan kacang polong, udang matang, kecap asin, dan merica. Aduk rata. Campurkan daun bawang sesaat sebelum disajikan.',
          tg: 'Idagdag ang gisantes, lutong hipon, soy sauce, at paminta. Haluin nang mabuti. Ihalo ang scallions bago ihain.'
        },
        image: '/recipes/shrimp_fried_rice_cook_3.png'
      }
    ],
    keyTakeaways: [
      {
        id: 1,
        text: {
          en: "Use cold, day-old rice; freshly cooked rice has too much moisture and will become mushy.",
          id: "Gunakan nasi dingin sisa kemarin; nasi yang baru matang terlalu lembap dan akan menjadi lembek.",
          tg: "Gumamit ng malamig na bahaw; ang bagong lutong kanin ay masyadong basa at magiging malata."
        },
        image: "/recipes/shrimp_fried_rice.png"
      },
      {
        id: 2,
        text: {
          en: "Pat shrimp completely dry before searing to get a snap and prevent water from leaking into the rice.",
          id: "Lap udang sampai benar-benar kering agar teksturnya garing dan air tidak merembes ke nasi.",
          tg: "Patuyuin nang husto ang hipon para maging makunat ang balat at hindi magtubig sa kanin."
        },
        image: "/recipes/shrimp_fried_rice.png"
      },
      {
        id: 3,
        text: {
          en: "Cook eggs and shrimp separately first, then return them to the pan at the end to keep them tender.",
          id: "Masak telur dan udang secara terpisah dulu, lalu masukkan kembali di akhir agar tidak overcooked.",
          tg: "Lutuin muna nang hiwalay ang itlog at hipon, tsaka ibalik sa huli para hindi sila masyadong maluto."
        },
        image: "/recipes/shrimp_fried_rice.png"
      }
    ]
  }
];
