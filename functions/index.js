// Firebase Functions v6.0.1 版本
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

// 初始化 Firebase Admin
initializeApp();

const dailyCoefficients = {
    fuel: {
      unchecked: 2.92,
      checked: {
      "92無鉛": 0.104369392,
      "95無鉛": 0.099058433,
      "98無鉛": 0.092764523,
      "柴油": 0.113203265
      }
    },
    elecfuel: {
      unchecked: 0.022,
      checked: 0.606
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
    bus: {
      "燃油公車": 0.078,
      "電動公車": 0.034,
    },
    mrt: 0.07822,
    train: 0.054,
    hsr: 5.76
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
      unchecked: 2.92,
      checked: {
      "92無鉛": 0.104369392,
      "95無鉛": 0.099058433,
      "98無鉛": 0.092764523,
      "柴油": 0.113203265
      }
    },
    elecfuel: {
      unchecked: 0.022,
      checked: 0.606
    },
    carType: {
      "小型房車": 0.185396825,
      "中型房車": 0.204195804,
      "大型房車": 0.169767442,
      "小型休旅車": 0.154497354,
      "中型休旅車": 0.133333333,
      "大型休旅車": 0.183647799
    },
    mrt: 0.07822,
    train: 0.054,
    hsr: 5.76
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
  console.log(`開始計算 ${pageName} 頁面，資料:`, Object.keys(pageData));

// 日常交通頁面計算
if (pageName === "traffic-daily") {
  // ====== 汽車 ======
  if (!pageData.dailyCarFuelTypeToggle && !pageData.dailyCarMethodToggle) {
    // 油車 - 油量模式
    let coefficient;
    if (!pageData.oilUnitToggle) {
      coefficient = dailyCoefficients.fuel.unchecked; // 2.92
    } else {
      coefficient = dailyCoefficients.fuel.checked[pageData.dailyCarFuelTypeValue] ?? 0;
    }
    const oilTotal = parseFloat(pageData.dailyCarOilValue) * coefficient;
    console.log(`汽車(油量模式): ${pageData.dailyCarOilValue} * ${coefficient} = ${oilTotal}`);
    total += oilTotal;

  } else if (!pageData.dailyCarFuelTypeToggle && pageData.dailyCarMethodToggle) {
    // 油車 - 距離模式
    const coefficient = dailyCoefficients.carType[pageData.dailyCarTypeValue] ?? 0;
    const distTotal = parseFloat(pageData.dailyOilcarDistanceValue) * coefficient;
    console.log(`汽車(距離模式): ${pageData.dailyOilcarDistanceValue} * ${coefficient} = ${distTotal}`);
    total += distTotal;

  } else if (pageData.dailyCarFuelTypeToggle && !pageData.dailyCarMethodToggle) {
    // 電車 - 距離模式
    const coefficient = dailyCoefficients.elecfuel.unchecked;
    const distTotal = parseFloat(pageData.dailyEVDistanceValue) * coefficient;
    console.log(`電車(距離模式): ${pageData.dailyEVDistanceValue} * ${coefficient} = ${distTotal}`);
    total += distTotal;

  } else if (pageData.dailyCarFuelTypeToggle && pageData.dailyCarMethodToggle) {
    // 電車 - 充電量模式
    const coefficient = dailyCoefficients.elecfuel.unchecked;
    const chargeTotal = parseFloat(pageData.dailyEVChargeValue) * coefficient;
    console.log(`電車(充電量模式): ${pageData.dailyEVChargeValue} * ${coefficient} = ${chargeTotal}`);
    total += chargeTotal;
  }

  // ====== 機車 ======
  if (!pageData.dailyMotorcycleFuelTypeToggle && !pageData.dailyMotorcycleMethodToggle) {
    // 油機 - 油量模式
    let coefficient;
    if (!pageData.oilUnitToggle) {
      coefficient = dailyCoefficients.fuel.unchecked; // 2.92
    } else {
      coefficient = dailyCoefficients.fuel.checked[pageData.dailyMotorcycleFuelTypeValue] ?? 0;
    }
    const oilTotal = parseFloat(pageData.dailyMotorcycleOilValue) * coefficient;
    console.log(`機車(油量模式): ${pageData.dailyMotorcycleOilValue} * ${coefficient} = ${oilTotal}`);
    total += oilTotal;

  } else if (!pageData.dailyMotorcycleFuelTypeToggle && pageData.dailyMotorcycleMethodToggle) {
    // 油機 - 距離模式
    const coefficient = dailyCoefficients.motorcycle;
    const distTotal = parseFloat(pageData.dailyOilmotorcycleDistanceValue) * coefficient;
    console.log(`機車(距離模式): ${pageData.dailyOilmotorcycleDistanceValue} * ${coefficient} = ${distTotal}`);
    total += distTotal;

  } else if (pageData.dailyMotorcycleFuelTypeToggle && !pageData.dailyMotorcycleMethodToggle) {
    // 電機 - 距離模式
    const coefficient = dailyCoefficients.elecfuel.unchecked;
    const distTotal = parseFloat(pageData.dailyElectricmotorcycleDistanceValue) * coefficient;
    console.log(`電機(距離模式): ${pageData.dailyElectricmotorcycleDistanceValue} * ${coefficient} = ${distTotal}`);
    total += distTotal;

  } else if (pageData.dailyMotorcycleFuelTypeToggle && pageData.dailyMotorcycleMethodToggle) {
    // 電機 - 充電量模式
    const coefficient = dailyCoefficients.elecfuel.unchecked;
    const chargeTotal = parseFloat(pageData.dailyElectricmotorcycleChargeValue) * coefficient;
    console.log(`電機(充電量模式): ${pageData.dailyElectricmotorcycleChargeValue} * ${coefficient} = ${chargeTotal}`);
    total += chargeTotal;
  }

  // ====== 公車 ======
  if (pageData.dailyBusDistanceValue > 0) {
    const busType = pageData.dailyBusFuelTypeValue ?? "燃油公車";
    const busCoefficient = dailyCoefficients.bus[busType] ?? 0;
    const busTotal = parseFloat(pageData.dailyBusDistanceValue) * busCoefficient;
    console.log(`公車(${busType}): ${pageData.dailyBusDistanceValue} * ${busCoefficient} = ${busTotal}`);
    total += busTotal;
  }

  // ====== MRT ======
  if (pageData.dailyMRTDistanceTotal > 0) {
    const mrtCoefficient = dailyCoefficients.mrt;
    const mrtTotal = parseFloat(pageData.dailyMRTDistanceTotal) * mrtCoefficient;
    console.log(`MRT: ${pageData.dailyMRTDistanceTotal} * ${mrtCoefficient} = ${mrtTotal}`);
    total += mrtTotal;
  }

  // ====== 火車 ======
  if (pageData.dailyTrainDistanceTotal > 0) {
    const trainCoefficient = dailyCoefficients.train;
    const trainTotal = parseFloat(pageData.dailyTrainDistanceTotal) * trainCoefficient;
    console.log(`火車: ${pageData.dailyTrainDistanceTotal} * ${trainCoefficient} = ${trainTotal}`);
    total += trainTotal;
  }

  // ====== 高鐵 ======
  if (pageData.dailyHSRDistanceTotal > 0) {
    const hsrCoefficient = dailyCoefficients.hsr;
    const hsrTotal = parseFloat(pageData.dailyHSRDistanceTotal) * hsrCoefficient;
    console.log(`高鐵: ${pageData.dailyHSRDistanceTotal} * ${hsrCoefficient} = ${hsrTotal}`);
    total += hsrTotal;
  }

}

// 居家頁面計算
if (pageName === "home") {
  const members = parseFloat(pageData.homeMember);
  // 用電
  if (pageData.homeElectricityValue !== undefined && pageData.homeElectricityValue > 0) {
    const elecCoefficient = pageData.homeElectricityToggle
      ? homeCoefficients.electricity.checked
      : homeCoefficients.electricity.unchecked;
    const elecTotal = parseFloat(pageData.homeElectricityValue) * elecCoefficient * members;
    console.log(`用電: ${pageData.homeElectricityValue} * ${elecCoefficient} * ${members} = ${elecTotal}`);
    total += elecTotal;
  }

  // 用水
  if (pageData.homeWaterValue !== undefined && pageData.homeWaterValue > 0) {
    const waterCoefficient = pageData.homeWaterToggle
      ? homeCoefficients.water.checked
      : homeCoefficients.water.unchecked;
    const waterTotal = parseFloat(pageData.homeWaterValue) * waterCoefficient * members;
    console.log(`用水: ${pageData.homeWaterValue} * ${waterCoefficient} ÷ ${members} = ${waterTotal}`);
    total += waterTotal;
  }

  // 瓦斯
  if (pageData.homeGasValue !== undefined && pageData.homeGasValue > 0) {
    const gasCoefficient = pageData.homeGasToggle
      ? homeCoefficients.gas.checked
      : homeCoefficients.gas.unchecked;
    const gasTotal = parseFloat(pageData.homeGasValue) * gasCoefficient * members;
    console.log(`瓦斯: ${pageData.homeGasValue} * ${gasCoefficient} * ${members} = ${gasTotal}`);
    total += gasTotal;
  }

  // 垃圾
  if (
    pageData.homeTrashBagCapacity !== undefined &&
    pageData.homeTrashFrequency !== undefined &&
    pageData.homeTrashBagCapacity > 0 &&
    pageData.homeTrashFrequency > 0
  ) {
    const trashTotal = (parseFloat(pageData.homeTrashBagCapacity) *
                        parseFloat(pageData.homeTrashFrequency) *
                        homeCoefficients.garbage) * members;
    console.log(`垃圾: ${pageData.homeTrashBagCapacity} * ${pageData.homeTrashFrequency} * ${homeCoefficients.garbage} * ${members} = ${trashTotal}`);
    total += trashTotal;
  }
}

if (pageName === "traffic-travel") {
  // ====== 汽車 ======
  if (!pageData.travelCarFuelTypeToggle && !pageData.travelCarMethodToggle) {
    // 油車 - 油量模式
    let coefficient;
    if (!pageData.oilUnitToggle) {
      coefficient = travelCoefficients.fuel.unchecked; // 2.92
    } else {
      coefficient = travelCoefficients.fuel.checked[pageData.travelCarFuelTypeValue] ?? 0;
    }
    const oilTotal = parseFloat(pageData.travelCarOilValue) * coefficient;
    console.log(`汽車(油量模式): ${pageData.travelCarOilValue} * ${coefficient} = ${oilTotal}`);
    total += oilTotal;

  } else if (!pageData.travelCarFuelTypeToggle && pageData.travelCarMethodToggle) {
    // 油車 - 距離模式
    const coefficient = travelCoefficients.carType[pageData.travelCarTypeValue] ?? 0;
    const distTotal = parseFloat(pageData.travelOilcarDistanceValue) * coefficient;
    console.log(`汽車(距離模式): ${pageData.travelOilcarDistanceValue} * ${coefficient} = ${distTotal}`);
    total += distTotal;

  } else if (pageData.travelCarFuelTypeToggle && !pageData.travelCarMethodToggle) {
    // 電車 - 距離模式
    const coefficient = travelCoefficients.elecfuel.unchecked;
    const distTotal = parseFloat(pageData.travelEVDistanceValue) * coefficient;
    console.log(`電車(距離模式): ${pageData.travelEVDistanceValue} * ${coefficient} = ${distTotal}`);
    total += distTotal;

  } else if (pageData.travelCarFuelTypeToggle && pageData.travelCarMethodToggle) {
    // 電車 - 充電量模式
    const coefficient = travelCoefficients.elecfuel.unchecked;
    const chargeTotal = parseFloat(pageData.travelEVChargeValue) * coefficient;
    console.log(`電車(充電量模式): ${pageData.travelEVChargeValue} * ${coefficient} = ${chargeTotal}`);
    total += chargeTotal;
  }

  // ====== MRT ======
  if (pageData.travelMRTDistanceTotal > 0) {
    const mrtCoefficient = travelCoefficients.mrt;
    const mrtTotal = parseFloat(pageData.travelMRTDistanceTotal) * mrtCoefficient;
    console.log(`MRT: ${pageData.travelMRTDistanceTotal} * ${mrtCoefficient} = ${mrtTotal}`);
    total += mrtTotal;
  }

  // ====== 火車 ======
  if (pageData.travelTrainDistanceTotal > 0) {
    const trainCoefficient = travelCoefficients.train;
    const trainTotal = parseFloat(pageData.travelTrainDistanceTotal) * trainCoefficient;
    console.log(`火車: ${pageData.travelTrainDistanceTotal} * ${trainCoefficient} = ${trainTotal}`);
    total += trainTotal;
  }

  // ====== 高鐵 ======
  if (pageData.travelHSRDistanceTotal > 0) {
    const hsrCoefficient = travelCoefficients.hsr;
    const hsrTotal = parseFloat(pageData.travelHSRDistanceTotal) * hsrCoefficient;
    console.log(`高鐵: ${pageData.travelHSRDistanceTotal} * ${hsrCoefficient} = ${hsrTotal}`);
    total += hsrTotal;
  }

}

if (pageName === "food") {
  let foodTotal = 0;

  if (pageData.selectedDiet === "omnivore") {
    // ===== 葷食 =====
    const dailyFood = foodCoefficients.dailyFood;
    const dessert = foodCoefficients.dessert;
    const omnivore = foodCoefficients.omnivore;

    // 日常飲食
    foodTotal += (parseFloat(pageData.foodDumplingsValue) || 0) * (dailyFood.dumplings || 0);
    foodTotal += (parseFloat(pageData.foodBeefNoodleValue) || 0) * (dailyFood.beefNoodle || 0);
    foodTotal += (parseFloat(pageData.foodPorkBentoValue) || 0) * (dailyFood.porkBento || 0);
    foodTotal += (parseFloat(pageData.foodChickenBentoValue) || 0) * (dailyFood.chickenBento || 0);
    foodTotal += (parseFloat(pageData.foodBeefBowlValue) || 0) * (dailyFood.beefBowl || 0);
    foodTotal += (parseFloat(pageData.foodCurryPorkRiceValue) || 0) * (dailyFood.curryPorkRice || 0);
    foodTotal += (parseFloat(pageData.foodHamburgerValue) || 0) * (dailyFood.hamburger || 0);
    foodTotal += (parseFloat(pageData.foodHotpotValue) || 0) * (dailyFood.Hotpot || 0);

    // 葷食頁面
    foodTotal += (parseFloat(pageData.foodModalRiceValue) || 0) * (omnivore.rice || 0);
    foodTotal += (parseFloat(pageData.foodModalVegetableValue) || 0) * (omnivore.vegetable || 0);
    foodTotal += (parseFloat(pageData.foodModalBeefValue) || 0) * (omnivore.beef || 0);
    foodTotal += (parseFloat(pageData.foodModalLambValue) || 0) * (omnivore.lamb || 0);
    foodTotal += (parseFloat(pageData.foodModalPorkValue) || 0) * (omnivore.pork || 0);
    foodTotal += (parseFloat(pageData.foodModalChickenValue) || 0) * (omnivore.chicken || 0);
    foodTotal += (parseFloat(pageData.foodModalEggValue) || 0) * (omnivore.egg || 0);
    foodTotal += (parseFloat(pageData.foodModalShrimpValue) || 0) * (omnivore.shrimp || 0);
    foodTotal += (parseFloat(pageData.foodModalFishValue) || 0) * (omnivore.fish || 0);
    foodTotal += (parseFloat(pageData.foodModalNoodleValue) || 0) * (omnivore.noodle || 0);

    // 點心
    foodTotal += (parseFloat(pageData.foodSnackChickenBeefBubbleMilkTeaValue) || 0) * (dessert.chickenBeefBubbleMilkTea || 0);
    foodTotal += (parseFloat(pageData.foodSnackInstantNoodleValue) || 0) * (dessert.InstantNoodle || 0);
    foodTotal += (parseFloat(pageData.foodSnackBeerValue) || 0) * (dessert.beer || 0);
    foodTotal += (parseFloat(pageData.foodSnackFrenchfriesValue) || 0) * (dessert.frenchfries || 0);
    foodTotal += (parseFloat(pageData.foodSnackTeaEggValue) || 0) * (dessert.teaEgg || 0);
    foodTotal += (parseFloat(pageData.foodSnackSoyMilkValue) || 0) * (dessert.soyMilk || 0);
    foodTotal += (parseFloat(pageData.foodSnackBlackCoffeeValue) || 0) * (dessert.blackCoffee || 0);
    foodTotal += (parseFloat(pageData.foodSnackMilkValue) || 0) * (dessert.milk || 0);

    // 剩食
    foodTotal += (parseFloat(pageData.foodWasteSliderValue) || 0);

  } else if (pageData.selectedDiet === "vegetarian") {
    // ===== 素食 =====
    const dessert = foodCoefficients.dessert;

    // 海鮮素
    if (pageData.selectedSubDiet === "seafood") {
      const seafood = foodCoefficients.vegetarian.seafood;
      foodTotal += (parseFloat(pageData.foodSeafoodRiceValue) || 0) * (seafood.rice || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodVegetableValue) || 0) * (seafood.vegetable || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodTofuValue) || 0) * (seafood.tofu || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodMilkValue) || 0) * (seafood.milk || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodNoodleValue) || 0) * (seafood.noodle || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodHamValue) || 0) * (seafood.ham || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodEggValue) || 0) * (seafood.egg || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodShrimpValue) || 0) * (seafood.shrimp || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodFishValue) || 0) * (seafood.fish || 0);
      foodTotal += (parseFloat(pageData.foodSeafoodMushroomValue) || 0) * (seafood.mushroom || 0);
    }

    // 蛋奶素
    if (pageData.selectedSubDiet === "eggmilk") {
      const eggmilk = foodCoefficients.vegetarian.eggmilk;
      foodTotal += (parseFloat(pageData.foodEggmilkRiceValue) || 0) * (eggmilk.rice || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkVegetableValue) || 0) * (eggmilk.vegetable || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkTofuValue) || 0) * (eggmilk.tofu || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkMilkValue) || 0) * (eggmilk.milk || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkNoodleValue) || 0) * (eggmilk.noodle || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkHamValue) || 0) * (eggmilk.ham || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkEggValue) || 0) * (eggmilk.egg || 0);
      foodTotal += (parseFloat(pageData.foodEggmilkMushroomValue) || 0) * (eggmilk.mushroom || 0);
    }

    // 全素
    if (pageData.selectedSubDiet === "vegan") {
      const vegan = foodCoefficients.vegetarian.vegan;
      foodTotal += (parseFloat(pageData.foodVeganRiceValue) || 0) * (vegan.rice || 0);
      foodTotal += (parseFloat(pageData.foodVeganVegetableValue) || 0) * (vegan.vegetable || 0);
      foodTotal += (parseFloat(pageData.foodVeganTofuValue) || 0) * (vegan.tofu || 0);
      foodTotal += (parseFloat(pageData.foodVeganNoodleValue) || 0) * (vegan.noodle || 0);
      foodTotal += (parseFloat(pageData.foodVeganHamValue) || 0) * (vegan.ham || 0);
      foodTotal += (parseFloat(pageData.foodVeganMushroomValue) || 0) * (vegan.mushroom || 0);
    }

    // 點心
    foodTotal += (parseFloat(pageData.foodSnackChickenBeefBubbleMilkTeaValue) || 0) * (dessert.chickenBeefBubbleMilkTea || 0);
    foodTotal += (parseFloat(pageData.foodSnackInstantNoodleValue) || 0) * (dessert.InstantNoodle || 0);
    foodTotal += (parseFloat(pageData.foodSnackBeerValue) || 0) * (dessert.beer || 0);
    foodTotal += (parseFloat(pageData.foodSnackFrenchfriesValue) || 0) * (dessert.frenchfries || 0);
    foodTotal += (parseFloat(pageData.foodSnackTeaEggValue) || 0) * (dessert.teaEgg || 0);
    foodTotal += (parseFloat(pageData.foodSnackSoyMilkValue) || 0) * (dessert.soyMilk || 0);
    foodTotal += (parseFloat(pageData.foodSnackBlackCoffeeValue) || 0) * (dessert.blackCoffee || 0);
    foodTotal += (parseFloat(pageData.foodSnackMilkValue) || 0) * (dessert.milk || 0);

    // 剩食
    foodTotal += (parseFloat(pageData.foodWasteSliderValue) || 0);
  }

  console.log(`食物總和: ${foodTotal}`);
  total += foodTotal;
}

// 時尚頁面計算
if (pageName === "fashion") {
  // 快時尚
  if (pageData.fastFashion !== undefined && pageData.fastFashion > 0) {
    const fastFashionTotal = parseFloat(pageData.fastFashion) * fashionCoefficients.fastFashion;
    console.log(`快時尚: ${pageData.fastFashion} * ${fashionCoefficients.fastFashion} = ${fastFashionTotal}`);
    total += fastFashionTotal;
  }

  // 奢侈時尚
  if (pageData.luxuryFashion !== undefined && pageData.luxuryFashion > 0) {
    const luxuryFashionTotal = parseFloat(pageData.luxuryFashion) * fashionCoefficients.luxuryFashion;
    console.log(`奢侈時尚: ${pageData.luxuryFashion} * ${fashionCoefficients.luxuryFashion} = ${luxuryFashionTotal}`);
    total += luxuryFashionTotal;
  }
}

// 娛樂頁面計算
if (pageName === "entertainment") {
  // KTV 計算
  if (pageData.entertainmentKTV !== undefined && pageData.entertainmentKTV > 0) {
    const ktvCoefficient = pageData.entertainmentKTVToggle
      ? entertainmentCoefficients.KTV.checked
      : entertainmentCoefficients.KTV.unchecked;
    const ktvTotal = parseFloat(pageData.entertainmentKTV) * ktvCoefficient;
    console.log(`KTV: ${pageData.entertainmentKTV} * ${ktvCoefficient} = ${ktvTotal}`);
    total += ktvTotal;
  }

  // 電影 計算
  if (pageData.entertainmentCinemaValue !== undefined && pageData.entertainmentCinemaValue > 0) {
    const cinemaCoefficient = pageData.entertainmentCinemaToggle
      ? entertainmentCoefficients.cinema.checked
      : entertainmentCoefficients.cinema.unchecked;
    const cinemaTotal = parseFloat(pageData.entertainmentCinemaValue) * cinemaCoefficient;
    console.log(`電影: ${pageData.entertainmentCinemaValue} * ${cinemaCoefficient} = ${cinemaTotal}`);
    total += cinemaTotal;
  }

  // 健身房 計算
  if (pageData.entertainmentGymValue !== undefined && pageData.entertainmentGymValue > 0) {
    const gymCoefficient = pageData.entertainmentGymToggle
      ? entertainmentCoefficients.entertainmentGym.checked
      : entertainmentCoefficients.entertainmentGym.unchecked;
    const gymTotal = parseFloat(pageData.entertainmentGymValue) * gymCoefficient;
    console.log(`健身房: ${pageData.entertainmentGymValue} * ${gymCoefficient} = ${gymTotal}`);
    total += gymTotal;
  }

  // 旅遊住宿 計算
  if (pageData.entertainmentHotelValue !== undefined && pageData.entertainmentHotelValue > 0) {
    const hotelCoefficient = pageData.entertainmentHotelToggle
      ? entertainmentCoefficients.hotel.checked
      : entertainmentCoefficients.hotel.unchecked;
    const hotelTotal = parseFloat(pageData.entertainmentHotelValue) * hotelCoefficient;
    console.log(`旅遊住宿: ${pageData.entertainmentHotelValue} * ${hotelCoefficient} = ${hotelTotal}`);
    total += hotelTotal;
  }

  // 網路 計算
  if (pageData.entertainmentInternetValue !== undefined && pageData.entertainmentInternetValue > 0) {
    const internetTotal = parseFloat(pageData.entertainmentInternetValue) * entertainmentCoefficients.internet;
    console.log(`網路: ${pageData.entertainmentInternetValue} * ${entertainmentCoefficients.internet} = ${internetTotal}`);
    total += internetTotal;
  }

  // 影音串流 計算
  if (pageData.entertainmentStreamingValue !== undefined && pageData.entertainmentStreamingValue > 0) {
    const streamingCoefficient = pageData.entertainmentStreamingToggle
      ? entertainmentCoefficients.streaming.checked
      : entertainmentCoefficients.streaming.unchecked;
    const streamingTotal = parseFloat(pageData.entertainmentStreamingValue) * streamingCoefficient;
    console.log(`影音串流: ${pageData.entertainmentStreamingValue} * ${streamingCoefficient} = ${streamingTotal}`);
    total += streamingTotal;
  }

  // 宗教信仰 計算
  if (pageData.entertainmentReligionValue !== undefined && pageData.entertainmentReligionValue > 0) {
    const religionCoefficient = pageData.entertainmentReligionToggle
      ? entertainmentCoefficients.religion.checked
      : entertainmentCoefficients.religion.unchecked;
    const religionTotal = parseFloat(pageData.entertainmentReligionValue) * religionCoefficient;
    console.log(`宗教信仰: ${pageData.entertainmentReligionValue} * ${religionCoefficient} = ${religionTotal}`);
    total += religionTotal;
  }
}

  console.log(`${pageName} 總計算結果:`, total);
  return total;
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
      return { pageName, total: 0, message: "沒有資料" };
    }

    const total = calculatePageTotal(pageName, pageData);
    console.log("最終計算結果:", total);

    return { pageName, total, message: "計算成功" };
    
  } catch (error) {
    console.error("函數執行錯誤:", error.message);
    console.error("錯誤堆疊:", error.stack);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError("internal", `計算失敗: ${error.message}`);
  }
});