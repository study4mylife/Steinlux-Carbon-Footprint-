// Firebase Functions v6.0.1 版本
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

// 初始化 Firebase Admin
initializeApp();

const dailyCoefficients = {
    fuel: {
      unchecked:  {
      "92無鉛": 0.104369392,
      "95無鉛": 0.099058433,
      "98無鉛": 0.092764523,
      "柴油": 0.113203265
      },
      checked: 2.92
    },
    elecfuel: {
      unchecked: 0.606,
      checked: 0.022
    },
    carType: {
      "小型房車": 0.185396825,
      "中型房車": 0.204195804,
      "大型房車": 0.169767442,
      "小型休旅車": 0.154497354,
      "中型休旅車": 0.133333333,
      "大型休旅車": 0.183647799
    },
    motorcycle: 0.073,
    elecmotorcycle: {
      unchecked: 0.606,
      checked: 0.022
    },
    bus: {
      "燃油公車": 0.078,
      "電動公車": 0.034,
    },
    mrt: 0.07822,
    train: 0.054,
};

const homeCoefficients = {
  electricity: {
    unchecked: 0.606,
    checked: 0.360714286
  },
  water: {
    unchecked: 0.156,
    checked: 0.02122449
  },
  gas: {
    unchecked: 2.63,
    checked: 0.253371869
  },
  garbage: 0.108
};

const travelCoefficients = {
    fuel: {
      unchecked:  {
      "92無鉛": 0.104369392,
      "95無鉛": 0.099058433,
      "98無鉛": 0.092764523,
      "柴油": 0.113203265
      },
      checked: 2.92
    },
    elecfuel: {
      unchecked: 0.606,
      checked: 0.022
    },
    carType: {
      "小型房車": 0.185396825,
      "中型房車": 0.204195804,
      "大型房車": 0.169767442,
      "小型休旅車": 0.154497354,
      "中型休旅車": 0.133333333,
      "大型休旅車": 0.183647799
    },
    cruise: {
      sail: 350,
      stay: 100
    },
    flight: {
      unchecked: 0,
      checked: 0
    },
    mrt: 0.07822,
    train: 0.054,
};

const foodCoefficients = {
  dailyFood: {
    dumplings: 0.1637,
    beefNoodle: 0.393,
    porkBento: 0.269,
    chickenBento: 0.2994,
    beefBowl: 3.13,
    curryPorkRice: 0.45,
    hamburger: 0.956,
    Hotpot: 0.641156863
  },
  dessert: {
    chickenBeefBubbleMilkTea: 0.7588,
    InstantNoodle: 0.4,
    beer: 0.0587,
    frenchfries: 0.956,
    teaEgg: 0.24,
    soyMilk: 0.38,
    blackCoffee: 0.304,
    milk: 1.1025,
  },
  "omnivore": {
    rice: 0.39216,
    vegetable: 0.025,
    beef: 6,
    lamb: 2.4,
    pork: 0.66667,
    chicken: 0.987,
    egg: 0.105,
    shrimp: 1.3435,
    fish: 0.6815,
    noodle: 0.15
  },
  "vegetarian": {
    "seafood": {
      rice: 0.39216,
      vegetable: 0.075,
      tofu: 0.158,
      milk: 1.1025,
      noodle: 0.15,
      ham: 0.144,
      egg: 0.105,
      shrimp: 1.3435,
      fish: 0.6815,
      mushroom: 0.04843,
    },
    "eggmilk": {
      rice: 0.39216,
      vegetable: 0.075,
      tofu: 0.158,
      milk: 1.1025,
      noodle: 0.15,
      ham: 0.144,
      egg: 0.105,
      mushroom: 0.04843,
    },
    "vegan": {
      rice: 0.39216,
      vegetable: 0.075,
      tofu: 0.158,
      noodle: 0.15,
      ham: 0.144,
      mushroom: 0.04843,
    }
  }
}

const fashionCoefficients = {
  fastFashion: 0.011099071,
  luxuryFashion: 0.001722614
};

const entertainmentCoefficients = {
  KTV: {
    unchecked: 46.584,
    checked: 3.882
  },
  cinema: {
    unchecked: 23.39419819,
    checked: 1.949516516
  },
  entertainmentGym: {
    unchecked: 37.40454338,
    checked: 9.351135845
  },
  hotel: {
    unchecked: 252,
    checked: 21
  },
  internet: 0.123,
  streaming: {
    unchecked: 1.681606858,
    checked: 0.239571388	
  },
  religion: {
    unchecked: 9,
    checked: 0.75
  },
};

// 單頁計算邏輯
function calculatePageTotal(pageName, pageData) {
  let total = 0;
  let breakdown = {};
  console.log(`開始計算 ${pageName} 頁面，資料:`, Object.keys(pageData));

// 日常交通頁面計算
if (pageName === "traffic-daily") {
  let name, inputValue, coefficient, emission, unit;
  
  // ====== 汽車 ======
  if (!pageData.dailyCarFuelTypeToggle && !pageData.dailyCarMethodToggle) {
    // 油車 - 油量模式
    name = "汽車(油車)";
    inputValue = parseFloat(pageData.dailyCarOilValue);
    unit = pageData.oilUnitToggle ? "L" : "元";
    coefficient = pageData.oilUnitToggle
      ? (dailyCoefficients.fuel.unchecked[pageData.dailyCarFuelTypeValue] ?? 0)
      : dailyCoefficients.fuel.checked;
    emission = inputValue * coefficient;

  } else if (!pageData.dailyCarFuelTypeToggle && pageData.dailyCarMethodToggle) {
    // 油車 - 距離模式
    name = "汽車(油車)";
    inputValue = parseFloat(pageData.dailyOilcarDistanceValue);
    unit = "km";
    coefficient = dailyCoefficients.carType[pageData.dailyCarTypeValue] ?? 0;
    emission = inputValue * coefficient;

  } else if (pageData.dailyCarFuelTypeToggle && pageData.dailyCarMethodToggle) {
    // 電車 - 距離模式
    name = "汽車(電車)";
    inputValue = parseFloat(pageData.dailyEVDistanceValue);
    unit = "km";
    coefficient = dailyCoefficients.elecfuel.checked;
    emission = inputValue * coefficient;

  } else if (pageData.dailyCarFuelTypeToggle && !pageData.dailyCarMethodToggle) {
    // 電車 - 充電量模式
    name = "汽車(電車)";
    inputValue = parseFloat(pageData.dailyEVChargeValue);
    unit = "kWh";
    coefficient = dailyCoefficients.elecfuel.unchecked;
    emission = inputValue * coefficient;
  }

  if (emission && emission > 0) {
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== 機車 ======
  if (!pageData.dailyMotorcycleFuelTypeToggle && !pageData.dailyMotorcycleMethodToggle) {
    // 油機 - 油量模式
    name = "機車(油車)";
    inputValue = parseFloat(pageData.dailyMotorcycleOilValue);
    unit = pageData.oilUnitToggle ? "L" : "元";
    coefficient = pageData.oilUnitToggle
      ? (dailyCoefficients.fuel.unchecked[pageData.dailyMotorcycleFuelTypeValue] ?? 0)
      : dailyCoefficients.fuel.checked;
    emission = inputValue * coefficient;

  } else if (!pageData.dailyMotorcycleFuelTypeToggle && pageData.dailyMotorcycleMethodToggle) {
    // 油機 - 距離模式
    name = "機車(油車)";
    inputValue = parseFloat(pageData.dailyOilmotorcycleDistanceValue);
    unit = "km";
    coefficient = dailyCoefficients.motorcycle;
    emission = inputValue * coefficient;

  } else if (pageData.dailyMotorcycleFuelTypeToggle && !pageData.dailyMotorcycleMethodToggle) {
    // 電機 - 充電量模式
    name = "機車(電車)";
    inputValue = parseFloat(pageData.dailyElectricmotorcycleChargeValue);
    unit = "kWh";
    coefficient = dailyCoefficients.elecmotorcycle.unchecked;
    emission = inputValue * coefficient;

  } else if (pageData.dailyMotorcycleFuelTypeToggle && pageData.dailyMotorcycleMethodToggle) {
    // 電機 - 距離模式
    name = "機車(電車)";
    inputValue = parseFloat(pageData.dailyElectricmotorcycleDistanceValue);
    unit = "km";
    coefficient = dailyCoefficients.elecmotorcycle.checked;
    emission = inputValue * coefficient;
  }

  if (emission && emission > 0) {
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== 公車 ======
  if (pageData.dailyBusDistanceValue > 0) {
    name = "公車";
    inputValue = parseFloat(pageData.dailyBusDistanceValue);
    unit = "km";
    const busType = pageData.dailyBusFuelTypeValue ?? "燃油公車";
    coefficient = dailyCoefficients.bus[busType] ?? 0;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[`${name}(${busType})`] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== MRT ======
  if (pageData.dailyMRTDistanceTotal > 0) {
    name = "MRT";
    inputValue = parseFloat(pageData.dailyMRTDistanceTotal);
    unit = "km";
    coefficient = dailyCoefficients.mrt;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== 火車 ======
  if (pageData.dailyTrainDistanceTotal > 0) {
    name = "火車";
    inputValue = parseFloat(pageData.dailyTrainDistanceTotal);
    unit = "km";
    coefficient = dailyCoefficients.train;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== 高鐵 ======
  if (pageData.dailyHSRDistanceTotal > 0) {
    name = "高鐵";
    inputValue = parseFloat(pageData.dailyHSRDistanceTotal);
    unit = "km";
    coefficient = 1; // 直接使用距離值
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }
}

// 居家頁面計算
if (pageName === "home") {
  const members = parseFloat(pageData.homeMember);
  let name, inputValue, coefficient, emission, unit;

  // 用電
  if (pageData.homeElectricityValue !== undefined && pageData.homeElectricityValue > 0) {
    name = "電力";
    inputValue = parseFloat(pageData.homeElectricityValue);
    unit = "kWh";
    coefficient = pageData.homeElectricityToggle
      ? homeCoefficients.electricity.checked
      : homeCoefficients.electricity.unchecked;
    emission = inputValue * coefficient * members;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient: coefficient * members,
      emission,
      unit,
      members
    };
  }

  // 用水
  if (pageData.homeWaterValue !== undefined && pageData.homeWaterValue > 0) {
    name = "水";
    inputValue = parseFloat(pageData.homeWaterValue);
    unit = "度";
    coefficient = pageData.homeWaterToggle
      ? homeCoefficients.water.checked
      : homeCoefficients.water.unchecked;
    emission = inputValue * coefficient * members;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient: coefficient * members,
      emission,
      unit,
      members
    };
  }

  // 天然氣
  if (pageData.homeGasValue !== undefined && pageData.homeGasValue > 0) {
    name = "天然氣";
    inputValue = parseFloat(pageData.homeGasValue);
    unit = "度";
    coefficient = pageData.homeGasToggle
      ? homeCoefficients.gas.checked
      : homeCoefficients.gas.unchecked;
    emission = inputValue * coefficient * members;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient: coefficient * members,
      emission,
      unit,
      members
    };
  }

  // 垃圾
  if (
    pageData.homeTrashBagCapacity !== undefined &&
    pageData.homeTrashFrequency !== undefined &&
    pageData.homeTrashBagCapacity > 0 &&
    pageData.homeTrashFrequency > 0
  ) {
    name = "垃圾";
    inputValue = parseFloat(pageData.homeTrashBagCapacity) * parseFloat(pageData.homeTrashFrequency);
    unit = "公升/月";
    coefficient = homeCoefficients.garbage * members;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      members
    };
  }
}

// 旅遊交通頁面計算
if (pageName === "traffic-travel") {
  let name, inputValue, coefficient, emission, unit;

  // ====== 汽車 ======
  if (!pageData.travelCarFuelTypeToggle && !pageData.travelCarMethodToggle) {
    // 油車 - 油量模式
    name = "汽車(油車)";
    inputValue = parseFloat(pageData.travelCarOilValue);
    unit = pageData.oilUnitToggle ? "L" : "元";
    coefficient = pageData.oilUnitToggle
      ? (travelCoefficients.fuel.unchecked[pageData.travelCarFuelTypeValue] ?? 0)
      : travelCoefficients.fuel.checked;
    emission = inputValue * coefficient;

  } else if (!pageData.travelCarFuelTypeToggle && pageData.travelCarMethodToggle) {
    // 油車 - 距離模式
    name = "汽車(油車)";
    inputValue = parseFloat(pageData.travelOilcarDistanceValue);
    unit = "km";
    coefficient = travelCoefficients.carType[pageData.travelCarTypeValue] ?? 0;
    emission = inputValue * coefficient;

  } else if (pageData.travelCarFuelTypeToggle && pageData.travelCarMethodToggle) {
    // 電車 - 距離模式
    name = "汽車(電車)";
    inputValue = parseFloat(pageData.travelEVDistanceValue);
    unit = "km";
    coefficient = travelCoefficients.elecfuel.checked;
    emission = inputValue * coefficient;

  } else if (pageData.travelCarFuelTypeToggle && !pageData.travelCarMethodToggle) {
    // 電車 - 充電量模式
    name = "汽車(電車)";
    inputValue = parseFloat(pageData.travelEVChargeValue);
    unit = "kWh";
    coefficient = travelCoefficients.elecfuel.unchecked;
    emission = inputValue * coefficient;
  }

  if (emission && emission > 0) {
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== MRT ======
  if (pageData.travelMRTDistanceTotal > 0) {
    name = "MRT";
    inputValue = parseFloat(pageData.travelMRTDistanceTotal);
    unit = "km";
    coefficient = travelCoefficients.mrt;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== 火車 ======
  if (pageData.travelTrainDistanceTotal > 0) {
    name = "火車";
    inputValue = parseFloat(pageData.travelTrainDistanceTotal);
    unit = "km";
    coefficient = travelCoefficients.train;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // ====== 高鐵 ======
  if (pageData.travelHSRDistanceTotal > 0) {
    name = "高鐵";
    inputValue = parseFloat(pageData.travelHSRDistanceTotal);
    unit = "km";
    coefficient = 1;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }
}

// 食物頁面計算
if (pageName === "food") {
  let name, inputValue, coefficient, emission, unit;

  if (pageData.selectedDiet === "omnivore") {
    // ===== 葷食 =====
    const dailyFood = foodCoefficients.dailyFood;
    const dessert = foodCoefficients.dessert;
    const omnivore = foodCoefficients.omnivore;

    // 日常飲食
    const dailyFoodItems = [
      { key: 'foodDumplingsValue', name: '水餃', coeff: dailyFood.dumplings, unit: '顆' },
      { key: 'foodBeefNoodleValue', name: '牛肉麵', coeff: dailyFood.beefNoodle, unit: '碗' },
      { key: 'foodPorkBentoValue', name: '豬肉便當', coeff: dailyFood.porkBento, unit: '個' },
      { key: 'foodChickenBentoValue', name: '雞肉便當', coeff: dailyFood.chickenBento, unit: '個' },
      { key: 'foodBeefBowlValue', name: '牛肉飯', coeff: dailyFood.beefBowl, unit: '碗' },
      { key: 'foodCurryPorkRiceValue', name: '咖哩豬肉飯', coeff: dailyFood.curryPorkRice, unit: '碗' },
      { key: 'foodHamburgerValue', name: '漢堡', coeff: dailyFood.hamburger, unit: '個' },
      { key: 'foodHotpotValue', name: '火鍋', coeff: dailyFood.Hotpot, unit: '次' }
    ];

    dailyFoodItems.forEach(item => {
      if (pageData[item.key] && pageData[item.key] > 0) {
        inputValue = parseFloat(pageData[item.key]);
        emission = inputValue * item.coeff;
        total += emission;
        breakdown[item.name] = {
          input: inputValue,
          coefficient: item.coeff,
          emission,
          unit: item.unit
        };
      }
    });

    // 葷食項目
    const omniItems = [
      { key: 'foodModalRiceValue', name: '米飯', coeff: omnivore.rice, unit: '碗' },
      { key: 'foodModalVegetableValue', name: '蔬菜', coeff: omnivore.vegetable, unit: '份' },
      { key: 'foodModalBeefValue', name: '牛肉', coeff: omnivore.beef, unit: '份' },
      { key: 'foodModalLambValue', name: '羊肉', coeff: omnivore.lamb, unit: '份' },
      { key: 'foodModalPorkValue', name: '豬肉', coeff: omnivore.pork, unit: '份' },
      { key: 'foodModalChickenValue', name: '雞肉', coeff: omnivore.chicken, unit: '份' },
      { key: 'foodModalEggValue', name: '雞蛋', coeff: omnivore.egg, unit: '顆' },
      { key: 'foodModalShrimpValue', name: '蝦子', coeff: omnivore.shrimp, unit: '份' },
      { key: 'foodModalFishValue', name: '魚類', coeff: omnivore.fish, unit: '份' },
      { key: 'foodModalNoodleValue', name: '麵條', coeff: omnivore.noodle, unit: '份' }
    ];

    omniItems.forEach(item => {
      if (pageData[item.key] && pageData[item.key] > 0) {
        inputValue = parseFloat(pageData[item.key]);
        emission = inputValue * item.coeff;
        total += emission;
        breakdown[item.name] = {
          input: inputValue,
          coefficient: item.coeff,
          emission,
          unit: item.unit
        };
      }
    });

    // 點心
    const snackItems = [
      { key: 'foodSnackChickenBeefBubbleMilkTeaValue', name: '珍珠奶茶', coeff: dessert.chickenBeefBubbleMilkTea, unit: '杯' },
      { key: 'foodSnackInstantNoodleValue', name: '泡麵', coeff: dessert.InstantNoodle, unit: '包' },
      { key: 'foodSnackBeerValue', name: '啤酒', coeff: dessert.beer, unit: '罐' },
      { key: 'foodSnackFrenchfriesValue', name: '薯條', coeff: dessert.frenchfries, unit: '份' },
      { key: 'foodSnackTeaEggValue', name: '茶葉蛋', coeff: dessert.teaEgg, unit: '顆' },
      { key: 'foodSnackSoyMilkValue', name: '豆漿', coeff: dessert.soyMilk, unit: '杯' },
      { key: 'foodSnackBlackCoffeeValue', name: '黑咖啡', coeff: dessert.blackCoffee, unit: '杯' },
      { key: 'foodSnackMilkValue', name: '牛奶', coeff: dessert.milk, unit: '杯' }
    ];

    snackItems.forEach(item => {
      if (pageData[item.key] && pageData[item.key] > 0) {
        inputValue = parseFloat(pageData[item.key]);
        emission = inputValue * item.coeff;
        total += emission;
        breakdown[item.name] = {
          input: inputValue,
          coefficient: item.coeff,
          emission,
          unit: item.unit
        };
      }
    });

    // 剩食
    if (pageData.foodWasteSliderValue && pageData.foodWasteSliderValue > 0) {
      inputValue = parseFloat(pageData.foodWasteSliderValue);
      emission = inputValue;
      total += emission;
      breakdown['剩食'] = {
        input: inputValue,
        coefficient: 1,
        emission,
        unit: 'kg CO₂e'
      };
    }

  } else if (pageData.selectedDiet === "vegetarian") {
    // ===== 素食 =====
    const dessert = foodCoefficients.dessert;
    let vegType;

    if (pageData.selectedSubDiet === "seafood") {
      vegType = foodCoefficients.vegetarian.seafood;
      const seafoodItems = [
        { key: 'foodSeafoodRiceValue', name: '米飯', coeff: vegType.rice, unit: '碗' },
        { key: 'foodSeafoodVegetableValue', name: '蔬菜', coeff: vegType.vegetable, unit: '份' },
        { key: 'foodSeafoodTofuValue', name: '豆腐', coeff: vegType.tofu, unit: '塊' },
        { key: 'foodSeafoodMilkValue', name: '牛奶', coeff: vegType.milk, unit: '杯' },
        { key: 'foodSeafoodNoodleValue', name: '麵條', coeff: vegType.noodle, unit: '份' },
        { key: 'foodSeafoodHamValue', name: '素火腿', coeff: vegType.ham, unit: '片' },
        { key: 'foodSeafoodEggValue', name: '雞蛋', coeff: vegType.egg, unit: '顆' },
        { key: 'foodSeafoodShrimpValue', name: '蝦子', coeff: vegType.shrimp, unit: '份' },
        { key: 'foodSeafoodFishValue', name: '魚類', coeff: vegType.fish, unit: '份' },
        { key: 'foodSeafoodMushroomValue', name: '菇類', coeff: vegType.mushroom, unit: '份' }
      ];

      seafoodItems.forEach(item => {
        if (pageData[item.key] && pageData[item.key] > 0) {
          inputValue = parseFloat(pageData[item.key]);
          emission = inputValue * item.coeff;
          total += emission;
          breakdown[item.name] = {
            input: inputValue,
            coefficient: item.coeff,
            emission,
            unit: item.unit
          };
        }
      });

    } else if (pageData.selectedSubDiet === "eggmilk") {
      vegType = foodCoefficients.vegetarian.eggmilk;
      const eggmilkItems = [
        { key: 'foodEggmilkRiceValue', name: '米飯', coeff: vegType.rice, unit: '碗' },
        { key: 'foodEggmilkVegetableValue', name: '蔬菜', coeff: vegType.vegetable, unit: '份' },
        { key: 'foodEggmilkTofuValue', name: '豆腐', coeff: vegType.tofu, unit: '塊' },
        { key: 'foodEggmilkMilkValue', name: '牛奶', coeff: vegType.milk, unit: '杯' },
        { key: 'foodEggmilkNoodleValue', name: '麵條', coeff: vegType.noodle, unit: '份' },
        { key: 'foodEggmilkHamValue', name: '素火腿', coeff: vegType.ham, unit: '片' },
        { key: 'foodEggmilkEggValue', name: '雞蛋', coeff: vegType.egg, unit: '顆' },
        { key: 'foodEggmilkMushroomValue', name: '菇類', coeff: vegType.mushroom, unit: '份' }
      ];

      eggmilkItems.forEach(item => {
        if (pageData[item.key] && pageData[item.key] > 0) {
          inputValue = parseFloat(pageData[item.key]);
          emission = inputValue * item.coeff;
          total += emission;
          breakdown[item.name] = {
            input: inputValue,
            coefficient: item.coeff,
            emission,
            unit: item.unit
          };
        }
      });

    } else if (pageData.selectedSubDiet === "vegan") {
      vegType = foodCoefficients.vegetarian.vegan;
      const veganItems = [
        { key: 'foodVeganRiceValue', name: '米飯', coeff: vegType.rice, unit: '碗' },
        { key: 'foodVeganVegetableValue', name: '蔬菜', coeff: vegType.vegetable, unit: '份' },
        { key: 'foodVeganTofuValue', name: '豆腐', coeff: vegType.tofu, unit: '塊' },
        { key: 'foodVeganNoodleValue', name: '麵條', coeff: vegType.noodle, unit: '份' },
        { key: 'foodVeganHamValue', name: '素火腿', coeff: vegType.ham, unit: '片' },
        { key: 'foodVeganMushroomValue', name: '菇類', coeff: vegType.mushroom, unit: '份' }
      ];

      veganItems.forEach(item => {
        if (pageData[item.key] && pageData[item.key] > 0) {
          inputValue = parseFloat(pageData[item.key]);
          emission = inputValue * item.coeff;
          total += emission;
          breakdown[item.name] = {
            input: inputValue,
            coefficient: item.coeff,
            emission,
            unit: item.unit
          };
        }
      });
    }

    // 點心 (素食共用)
    const snackItems = [
      { key: 'foodSnackChickenBeefBubbleMilkTeaValue', name: '珍珠奶茶', coeff: dessert.chickenBeefBubbleMilkTea, unit: '杯' },
      { key: 'foodSnackInstantNoodleValue', name: '泡麵', coeff: dessert.InstantNoodle, unit: '包' },
      { key: 'foodSnackBeerValue', name: '啤酒', coeff: dessert.beer, unit: '罐' },
      { key: 'foodSnackFrenchfriesValue', name: '薯條', coeff: dessert.frenchfries, unit: '份' },
      { key: 'foodSnackTeaEggValue', name: '茶葉蛋', coeff: dessert.teaEgg, unit: '顆' },
      { key: 'foodSnackSoyMilkValue', name: '豆漿', coeff: dessert.soyMilk, unit: '杯' },
      { key: 'foodSnackBlackCoffeeValue', name: '黑咖啡', coeff: dessert.blackCoffee, unit: '杯' },
      { key: 'foodSnackMilkValue', name: '牛奶', coeff: dessert.milk, unit: '杯' }
    ];

    snackItems.forEach(item => {
      if (pageData[item.key] && pageData[item.key] > 0) {
        inputValue = parseFloat(pageData[item.key]);
        emission = inputValue * item.coeff;
        total += emission;
        breakdown[item.name] = {
          input: inputValue,
          coefficient: item.coeff,
          emission,
          unit: item.unit
        };
      }
    });

    // 剩食
    if (pageData.foodWasteSliderValue && pageData.foodWasteSliderValue > 0) {
      inputValue = parseFloat(pageData.foodWasteSliderValue);
      emission = inputValue;
      total += emission;
      breakdown['剩食'] = {
        input: inputValue,
        coefficient: 1,
        emission,
        unit: 'kg CO₂e'
      };
    }
  }
}

// 時尚頁面計算
if (pageName === "fashion") {
  let name, inputValue, coefficient, emission, unit;

  // 快時尚
  if (pageData.fastFashion !== undefined && pageData.fastFashion > 0) {
    name = "快時尚";
    inputValue = parseFloat(pageData.fastFashion);
    unit = "元";
    coefficient = fashionCoefficients.fastFashion;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // 奢侈時尚
  if (pageData.luxuryFashion !== undefined && pageData.luxuryFashion > 0) {
    name = "奢侈時尚";
    inputValue = parseFloat(pageData.luxuryFashion);
    unit = "元";
    coefficient = fashionCoefficients.luxuryFashion;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }
}

// 娛樂頁面計算
if (pageName === "entertainment") {
  let name, inputValue, coefficient, emission, unit;

  // KTV 計算
  if (pageData.entertainmentKTV !== undefined && pageData.entertainmentKTV > 0) {
    name = "KTV";
    inputValue = parseFloat(pageData.entertainmentKTV);
    unit = "小時";
    coefficient = pageData.entertainmentKTVToggle
      ? entertainmentCoefficients.KTV.checked
      : entertainmentCoefficients.KTV.unchecked;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      renewable: pageData.entertainmentKTVToggle
    };
  }

  // 電影 計算
  if (pageData.entertainmentCinemaValue !== undefined && pageData.entertainmentCinemaValue > 0) {
    name = "電影";
    inputValue = parseFloat(pageData.entertainmentCinemaValue);
    unit = "場";
    coefficient = pageData.entertainmentCinemaToggle
      ? entertainmentCoefficients.cinema.checked
      : entertainmentCoefficients.cinema.unchecked;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      renewable: pageData.entertainmentCinemaToggle
    };
  }

  // 健身房 計算
  if (pageData.entertainmentGymValue !== undefined && pageData.entertainmentGymValue > 0) {
    name = "健身房";
    inputValue = parseFloat(pageData.entertainmentGymValue);
    unit = "小時";
    coefficient = pageData.entertainmentGymToggle
      ? entertainmentCoefficients.entertainmentGym.checked
      : entertainmentCoefficients.entertainmentGym.unchecked;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      renewable: pageData.entertainmentGymToggle
    };
  }

  // 旅遊住宿 計算
  if (pageData.entertainmentHotelValue !== undefined && pageData.entertainmentHotelValue > 0) {
    name = "旅遊住宿";
    inputValue = parseFloat(pageData.entertainmentHotelValue);
    unit = "晚";
    coefficient = pageData.entertainmentHotelToggle
      ? entertainmentCoefficients.hotel.checked
      : entertainmentCoefficients.hotel.unchecked;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      renewable: pageData.entertainmentHotelToggle
    };
  }

  // 網路 計算
  if (pageData.entertainmentInternetValue !== undefined && pageData.entertainmentInternetValue > 0) {
    name = "網路";
    inputValue = parseFloat(pageData.entertainmentInternetValue);
    unit = "GB";
    coefficient = entertainmentCoefficients.internet;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit
    };
  }

  // 影音串流 計算
  if (pageData.entertainmentStreamingValue !== undefined && pageData.entertainmentStreamingValue > 0) {
    name = "影音串流";
    inputValue = parseFloat(pageData.entertainmentStreamingValue);
    unit = "小時";
    coefficient = pageData.entertainmentStreamingToggle
      ? entertainmentCoefficients.streaming.checked
      : entertainmentCoefficients.streaming.unchecked;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      renewable: pageData.entertainmentStreamingToggle
    };
  }

  // 宗教信仰 計算
  if (pageData.entertainmentReligionValue !== undefined && pageData.entertainmentReligionValue > 0) {
    name = "宗教信仰";
    inputValue = parseFloat(pageData.entertainmentReligionValue);
    unit = "小時";
    coefficient = pageData.entertainmentReligionToggle
      ? entertainmentCoefficients.religion.checked
      : entertainmentCoefficients.religion.unchecked;
    emission = inputValue * coefficient;
    
    total += emission;
    breakdown[name] = {
      input: inputValue,
      coefficient,
      emission,
      unit,
      renewable: pageData.entertainmentReligionToggle
    };
  }
}

  console.log(`${pageName} 總計算結果:`, total);
  console.log(`${pageName} 詳細分解:`, breakdown);
  return { total, breakdown };
}

exports.calculateCarbonPage = onCall(async (request) => {
  try {
    console.log("calculateCarbonPage 函數被呼叫");
    console.log("request.data:", request.data);
    console.log("request.data 型別:", typeof request.data);
    
    // 檢查是否有接收到資料
    if (!request.data) {
      console.error("沒有接收到任何資料");
      throw new HttpsError("invalid-argument", "沒有接收到資料");
    }
    
    const { userId, pageName } = request.data;
    
    console.log("解構後的參數:", { 
      userId: userId, 
      userIdType: typeof userId,
      pageName: pageName, 
      pageNameType: typeof pageName 
    });
    
    if (!userId || !pageName) {
      console.error("參數驗證失敗:", { 
        userIdExists: !!userId, 
        pageNameExists: !!pageName,
        actualUserId: userId,
        actualPageName: pageName
      });
      throw new HttpsError("invalid-argument", `缺少必要參數 - userId: ${userId}, pageName: ${pageName}`);
    }

    const db = getDatabase();
    const dbPath = `responses/${userId}/${pageName}`;
    console.log("資料庫查詢路徑:", dbPath);
    
    const snap = await db.ref(dbPath).once("value");
    const pageData = snap.val();
    
    console.log("查詢到的資料:", pageData ? "有資料" : "無資料");
    if (pageData) {
      console.log("資料欄位:", Object.keys(pageData));
    }

    if (!pageData) {
      console.log("未找到資料，回傳 0");
      return { pageName, total: 0, breakdown: {}, message: "沒有資料" };
    }

    const result = calculatePageTotal(pageName, pageData);
    console.log("最終計算結果:", result);

    return { 
      pageName, 
      total: result.total, 
      breakdown: result.breakdown,
      message: "計算成功" 
    };
    
  } catch (error) {
    console.error("函數執行錯誤:", error.message);
    console.error("錯誤堆疊:", error.stack);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError("internal", `計算失敗: ${error.message}`);
  }
})