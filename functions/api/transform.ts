// csvから取得するデータの型
interface ClassData {
  code: string;
  name: string;
  credits: number;
  year: number;
}

// 画面出力時に利用するときの授業の情報を保持する型
interface Course {
  name: string;
  credit: number | null;
  code: string;
  flag?: boolean;
}

// 画面出力時に、区分ごとの統計情報を保持する型
interface CategoryStat {
  totalCredits: number;
  courseCount: number;
  courses: Course[];
  creditFlag: boolean;
}

// 二つ以上の科目コードを引数に取る用
const startsWithAny = (
  code: string,
  prefixes: readonly string[]
) => prefixes.some(p => code.startsWith(p));


export function classify(code: string, faculty: string, grade: number): string {
  // 学部
  // 総合理工学部
  if (faculty == "engineering") {
    // 2024年以前
    if (grade <= 2024) {
      if (code.startsWith("TA")) {
        return "基盤科目(総理)";
      }
      else if (code.startsWith("TB")) {
        return "専門必修/専門選択/専門自由科目(総理)";
      }
      else if (code.startsWith("TW")) {
        return "自然科学系学部共通科目";
      }
    }
    // 2025年以降
    if (grade >= 2025) {
      if (code.startsWith("TC")) {
        return "理工共通基礎科目";
      }
      else if (code.startsWith("TE")) {
        return "理工社会実装教育科目";
      }
      else if (startsWithAny(code, ["TF", "TG", "TH", "TJ"])) {
        return "専門人材教育科目";
      }
    }
  }
  // 材料エネルギー学部
  if (faculty == "material") {
    if (code.startsWith("VA")) {
      return "基盤科目(材エネ)";
    }
    else if (code.startsWith("VB")) {
      return "専門必修/専門選択科目(材エネ)";
    }
  }

  // // 生物資源科学部
  // else if (code.startsWith("WA")){
  //   return "基盤科目(生資)";
  // }
  // else if (code.startsWith("WT")){
  //   return "自然科学系学部共通科目(生資)";
  // }
  // // 法文学部
  // else if (code.startsWith("L")){
  //   return "専門科目(法文)";
  // }
  // // 人間科学部
  // else if (code.startsWith("R")){
  //   return "専門科目(人科)";
  // }
  // // 教育学部
  // else if (startsWithAny(code,["M51", "M52"])){
  //   return "専門共通科目(教育)";
  // }
  // else if (code.startsWith("NN")){
  //   return "教育体験活動";
  // }
  // else if (code.startsWith("M")){
  //   return "専門科目(教育)";
  // }
  // else if (startsWithAny(code,["MC", "NS", "ND", "HS", "ME"])){
  //   return "大学院";
  // }

  // 共通
  if (startsWithAny(code, ["A1", "A2", "A3", "A5", "A6", "UAA"])) {
    return "英語";
  }
  else if (startsWithAny(code, ["A0", "UAB", "UAC", "UAD", "UAE"])) {
    return "第二外国語";
  }
  // 2024年度以降
  else if (grade >= 2024 && code.startsWith("UJC")) {
    return "SDGs入門";
  }
  else if (startsWithAny(code, ["B", "QBE", "QBG"])) {
    if (grade < 2024 || faculty !== "material") {
      return "健康・スポーツ/文化・芸術等";
    }
    else if (code.startsWith("QBE")) {
      return "人文社会科学分野";
    }
    else if (code.startsWith("QBG")) {
      return "学際分野";
    }
  }
  else if (startsWithAny(code, ["C", "SC"])) {
    return "情報科学"
  }
  else if (startsWithAny(code, ["D0A", "D9A", "SD"])) {
    return "数理・データサイエンス"
  }
  else if (startsWithAny(code, ["E0", "SE", "SJE", "UE", "UJE", "PE", "QE"])) {
    return "人文社会科学分野";
  }
  else if (startsWithAny(code, ["F0", "SF", "SJF", "UF", "UJF", "PF", "PJF", "QF"])) {
    return "自然科学分野";
  }
  else if (startsWithAny(code, ["G0", "SG", "SH", "UG", "UH", "UJG", "PG", "PH", "PJG", "QG", "QH", "QJ"])) {
    return "学際分野";
  }
  // 2023年度以前のみ
  else if (grade <= 2023 && code.startsWith("H0A")) {
    return "社会人力養成科目";
  }
  //
  else if (code.startsWith("Z")) {
    return "全学開放";
  }
  else if (code.startsWith("X")) {
    return "教職・学芸員";
  }
  return "分類漏れ";
}

export const onRequestPost: PagesFunction<{ MY_DATA: KVNamespace }> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return new Response("Error: ファイルが見て取れません", { status: 400 });
    const facultyVal = formData.get("faculty") as string;
    const gradeVal = formData.get("grade") as number;

    const categoryMap = new Map<string, CategoryStat>();

    // KVデータの取得
    const years = ["2023", "2024", "2025"];
    const dataArrays = await Promise.all(
      years.map(year => env.MY_DATA.get<ClassData[]>(year, { type: "json" }))
    );

    const courseMap = new Map<string, string>();
    dataArrays.forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(item => {
          if (item && item.code) courseMap.set(item.code, String(item.unit || "0.0"));
        });
      }
    });

    // CSV読み込み
    const arrayBuffer = await file.arrayBuffer();

    // Shift-JISとしてテキストに変換
    const decoder = new TextDecoder('shift-jis');
    const csvText = decoder.decode(arrayBuffer);

    if (!csvText) return new Response("Error: ファイルが空です", { status: 400 });

    const lines = csvText.split(/\r?\n/);

    // 行数チェック
    if (lines.length < 5) {
      return new Response(`Error: 行数が足りません (${lines.length}行)`, { status: 400 });
    }

    const studentInfo = lines.slice(0, 4);
    const header = `${lines[4]},単位数`;
    const dataLines = lines.slice(5);

    const newLines = dataLines.map((line) => {

      const baseLine = line.split('\t')[0];

      let cleanedLine = baseLine.trim().replaceAll('"', "");

      const columns = cleanedLine.split(',');

      if (columns[7] !== "合") {
        return null;
      }

      const targetCode = columns[3]?.trim() || "";
      const targetClassName = columns[4].trim() || "";

      const unit = courseMap.get(targetCode);

      const category = classify(targetCode, facultyVal, gradeVal);

      const stat = categoryMap.get(category) || { totalCredits: 0, courseCount: 0, courses: [], creditFlag: false };

      if (unit !== undefined) {
        stat.totalCredits += parseFloat(unit);
        stat.courses.push({ name: targetClassName, credit: parseFloat(unit), code: targetCode });
      }
      else {
        stat.creditFlag = true;
        stat.courses.push({ name: targetClassName, credit: 0.0, code: targetCode, flag: true });
      }
      stat.courseCount += 1;

      categoryMap.set(category, stat);

      return `${line},${unit || "0.0"}`;
    }).filter(line => line !== null);

    const outputCsv = [...studentInfo, header, ...newLines].join('\n');

    // 文字化け対策として、ExcelにUTF-8であることを伝える
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const csvBlob = new TextEncoder().encode(outputCsv);

    // BOMとCSVのデータを合体させた新しい配列を作成
    const combinedContent = new Uint8Array(bom.length + csvBlob.length);
    combinedContent.set(bom);
    combinedContent.set(csvBlob, bom.length);

    const resultObject = Object.fromEntries(categoryMap);

    return new Response(JSON.stringify(resultObject), {
      headers: {
        "Content-Type": "application/json; charset=ut-8"
      }
    });

  } catch (err: any) {
    // 500エラーの内容を具体的にブラウザへ返す
    return new Response(`Server Crash Error: ${err.name} - ${err.message}\nStack: ${err.stack}`, { status: 500 });
  }
};