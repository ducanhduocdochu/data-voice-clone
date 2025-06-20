const fs = require("fs");
const path = require("path");
const axios = require("axios");

const API_URL = "https://api.ausynclab.org/api/v1/speech/text-to-speech";
// POST
const API_URL_GET_DETAIL = "https://api.ausynclab.org/api/v1/speech";
// GET DETAIL /{audio_id}

const API_KEY =
  "kFArJDqXQxJy8NyeDOlp1VyvGyLrB4pi4PiaLKSA60We6nUrnuUKkx5lwjKbR-NOiceLV8PCAQnxNDzEkxiuRA";

const project = "ngo-nho-co-nguoi-dang-doi";

// Sleep helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Read all matching files
const getMatchingFiles = (number1, number2) => {
  let n = number2 - number1 + 1;
  listFile = [];
  for (let i = 0; i < n; i++) {
    const filePath = `./${project}/split/output_${number1 + i}.txt`;
    listFile.push(filePath);
    if (!fs.existsSync(filePath)) {
      console.log(`❗ File ${filePath} does not exist.`);
      return [];
    }
  }

  return listFile
    .filter((file) => fs.existsSync(file))
    .sort((a, b) => {
      const numA = parseInt(path.basename(a).match(/\d+/)[0]);
      const numB = parseInt(path.basename(b).match(/\d+/)[0]);
      return numA - numB;
    });
};

const readFileData = (file) => {
  const content = fs.readFileSync(file, "utf8");
  return content.trim();
};

const main = async () => {
  // Inputs
  const number1 = 104;
  const number2 = 106;

  // Get list filenames
  const files = getMatchingFiles(number1, number2);

  if (files.length === 0) {
    console.log("❗ No matching files found.");
    return;
  }

  for (const [index, file] of files.entries()) {
    const content = readFileData(file);

    console.log(`Process ${project}-${number1 + index} ........`);

    let isDone = false;

    // Call the API to create a new audio
    const res = await axios.post(
      API_URL,
      {
        audio_name: `${project}-${number1 + index}`,
        text: content,
        voice_id: 290597,
        speed: 1.0,
        model_name: "myna-2",
        language: "vi",
      },
      {
        headers: {
          accept: "application/json",
          "X-API-Key": API_KEY,
        },
      }
    );

    const audio_id = res.data.result.audio_id;

    await delay(5000);

    while (!isDone) {
      const res = await axios.get(`${API_URL_GET_DETAIL}/${audio_id}`, {
        headers: {
          accept: "application/json",
          "X-API-Key": API_KEY,
        },
      });
      if (res.data.result.state === "SUCCEED") {
        isDone = true;
      }
      await delay(5000);
      console.log(`Audio ${project}-${number1 + index} is processing...`);
    }
  }
};

main();
