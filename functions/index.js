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
    bus: {

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

if (pageName === "home") {
  // 1. 家庭成員數（用來平攤）
  const members = parseFloat(pageData.homeMember) || 1; // 避免除以 0

  // 2. 用電
  if (pageData.homeElectricityValue !== undefined && pageData.homeElectricityValue > 0) {
    const elecCoefficient = pageData.homeElectricityToggle
      ? homeCoefficients.electricity.checked
      : homeCoefficients.electricity.unchecked;
    const elecTotal = parseFloat(pageData.homeElectricityValue) * elecCoefficient * members;
    console.log(`用電: ${pageData.homeElectricityValue} * ${elecCoefficient} * ${members} = ${elecTotal}`);
    total += elecTotal;
  }

  // 3. 用水
  if (pageData.homeWaterValue !== undefined && pageData.homeWaterValue > 0) {
    const waterCoefficient = pageData.homeWaterToggle
      ? homeCoefficients.water.checked
      : homeCoefficients.water.unchecked;
    const waterTotal = parseFloat(pageData.homeWaterValue) * waterCoefficient * members;
    console.log(`用水: ${pageData.homeWaterValue} * ${waterCoefficient} ÷ ${members} = ${waterTotal}`);
    total += waterTotal;
  }

  // 4. 瓦斯
  if (pageData.homeGasValue !== undefined && pageData.homeGasValue > 0) {
    const gasCoefficient = pageData.homeGasToggle
      ? homeCoefficients.gas.checked
      : homeCoefficients.gas.unchecked;
    const gasTotal = parseFloat(pageData.homeGasValue) * gasCoefficient * members;
    console.log(`瓦斯: ${pageData.homeGasValue} * ${gasCoefficient} * ${members} = ${gasTotal}`);
    total += gasTotal;
  }

  // 5. 垃圾
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


// Firebase Functions v6 (v2 API) 版本
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

    // 使用 Firebase Admin SDK v12 的新語法
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