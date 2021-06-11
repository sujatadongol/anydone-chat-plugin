const botList = document.querySelector(".bot-list");
const botName = document.querySelector(".bot-name");
const apiKey = document.querySelector(".api-key");
const apiSecret = document.querySelector(".api-secret");
const environment = document.querySelector(".environment");
const headerSwitch = document.querySelector(".header-switch");
const onlineStatus = document.querySelector(".online-status-text");
const onlineStatusImage = document.querySelector(".online-status-image");
const chatBotPluginSrc = "http://192.168.56.1:3000";

headerSwitch.addEventListener("change", () => {
  toggleHeaderSwitch();
});

const createStoredBotList = () => {
  const storedBotList = JSON.parse(localStorage.getItem("botInfo-List"));

  storedBotList.forEach((bot) => {
    console.log("adding Stored bot");
    const botNameValue = bot.botName;
    const apiKeyValue = bot.apiKey;
    const apiSecretValue = bot.apiSecret;
    const environment = bot.environment;

    const currentBotInfo = getLocalStorageItem("currentBot");
    const isActive = currentBotInfo.apiKey === apiKeyValue;

    const botItem = createBot(
      botNameValue,
      apiKeyValue,
      apiSecretValue,
      environment,
      isActive
    );

    botList.append(botItem);
  });
};

const createBot = (
  botNameValue,
  apiKeyValue,
  apiSecretValue,
  environment,
  isActive
) => {
  const botItem = document.createElement("div"); //  Bot Item
  botItem.classList.add("bot-item");

  isActive && botItem.classList.add("active");

  const deleteButton = document.createElement("button"); //  Delete Button
  deleteButton.classList.add("delete-button");
  deleteButton.innerText = "x";
  deleteButton.addEventListener("click", () => {
    deleteBotItem(apiKeyValue, botItem);
    console.log("delete initiated");
  });
  botItem.append(deleteButton);

  if (isActive) {
    botItem.innerHTML += `
  <div class="bot-item-text">
    <p class="bot-name">Bot: ${botNameValue}</p>
    <ul>
      <li><p>ApiKey = ${apiKeyValue}</p></li>
      <li><p>ApiSecret = ${apiSecretValue}</p></li>
      <li><p>Environment = ${environment}</p></li>
      <li>
        <span>Status = </span><span class="active-status">Active</span>
      </li>
    </ul>
</div>`;
  } else {
    botItem.innerHTML += `
    <div class="bot-item-text">
      <p class="bot-name">Bot: ${botNameValue}</p>
      <ul>
        <li><p>ApiKey = ${apiKeyValue}</p></li>
        <li><p>ApiSecret = ${apiSecretValue}</p></li>
        <li><p>Environment = ${environment}</p></li>
        <li>
          <span>Status = </span><span class="inactive-status">Inactive</span>
        </li>
      </ul>
  </div>`;
  }

  const initiateButton = document.createElement("button"); //  Initate Button
  initiateButton.classList.add("initiate-button");
  initiateButton.innerText = "Initiate";
  initiateButton.addEventListener("click", () => {
    initiateChatBot(botNameValue, apiKeyValue, apiSecretValue);
  });
  botItem.append(initiateButton);

  return botItem;
};

const addBot = () => {
  console.log("addbot called");
  const botNameValue = botName.value;
  const apiKeyValue = apiKey.value;
  const apiSecretValue = apiSecret.value;
  const environmentValue = environment.value;
  if (
    botNameValue &&
    apiKeyValue &&
    apiSecretValue &&
    environmentValue === ""
  ) {
    console.log("empty input fields");
    alert("input fields cannot be empty");
  } else {
    createNewBotItem();
  }
};

const createNewBotItem = () => {
  console.log("createbotItem called");
  const botNameValue = botName.value;
  const apiKeyValue = apiKey.value;
  const apiSecretValue = apiSecret.value;
  const environmentValue = environment.value;

  saveInfoToLocalStorage(
    botNameValue,
    apiKeyValue,
    apiSecretValue,
    environmentValue
  );

  const botItem = createBot(
    botNameValue,
    apiKeyValue,
    apiSecretValue,
    environmentValue,
    false
  );

  botList.append(botItem);
  console.log(botList);

  apiKey.value = "";
  botName.value = "";
  apiSecret.value = "";
  environment.value = "";
};

const initiateChatBot = (botName, apiKey, apiSecret) => {
  console.log("chat bot initialized");

  const currentBotInfo = getLocalStorageItem("currentBot");
  if (currentBotInfo.apiKey === apiKey) {
    //  if the initiated chatbot is the same as the currentBot saved in localStorage then do not remove localstorage data
    removeCurrentIframe();
    init_anydone_chat(apiKey, apiSecret);
    window.location.reload();
  } else {
    removeCurrentIframe();
    const keysToRemove = [
      "customerData",
      "mappingId",
      "anydoneSession",
      "anydoneApiKeyData",
    ];

    for (key of keysToRemove) {
      localStorage.removeItem(key);
    }
    const botInfo = {
      botName: botName,
      apiKey: apiKey,
      apiSecret: apiSecret,
    };
    localStorage.setItem("currentBot", JSON.stringify(botInfo));
    init_anydone_chat(apiKey, apiSecret);
    window.location.reload();
  }
};

const deleteBotItem = (apiKey, botItem) => {
  console.log("delete bot action initiated");
  const savedBotInfoList = JSON.parse(localStorage.getItem("botInfo-List"));
  console.log(savedBotInfoList);
  const filteredBotInfoList = savedBotInfoList.filter(
    (info) => info.apiKey !== apiKey
  );
  localStorage.setItem("botInfo-List", JSON.stringify(filteredBotInfoList));
  botItem.remove();
};

const saveInfoToLocalStorage = (botName, apiKey, apiSecret, environment) => {
  if (localStorage.getItem("botInfo-List") !== null) {
    const savedBotInfoList = JSON.parse(localStorage.getItem("botInfo-List"));
    const newBotCred = {
      botName: botName,
      apiKey: apiKey,
      apiSecret: apiSecret,
      environment: environment,
    };
    savedBotInfoList.push(newBotCred);
    localStorage.setItem("botInfo-List", JSON.stringify(savedBotInfoList));
  } else {
    const botInfoList = [];
    const botCred = {
      botName: botName,
      apiKey: apiKey,
      apiSecret: apiSecret,
      environment: environment,
    };
    botInfoList.push(botCred);
    localStorage.setItem("botInfo-List", JSON.stringify(botInfoList));
  }
};

const removeCurrentIframe = () => {
  console.log("removing previous iframe");
  const currentIframe = document.getElementById("anydone-chat-id");
  currentIframe.remove();
};

const toggleHeaderSwitch = () => {
  if (headerSwitch.checked) {
    console.log("header switch checked");
    post("Switch-Environment", "Production");
    setLocalStorageItem("environment", "Production");
  } else {
    console.log("header switch unchecked");
    post("Switch-Environment", "Development");
    setLocalStorageItem("environment", "Development");
  }
};

const post = (action, value) => {
  let data = {
    type: action,
  };

  if (value) {
    data.message = value;
  }
  let message = JSON.stringify(data);
  const currentIframe = document.getElementById("anydone-chat-id");
  currentIframe.contentWindow.postMessage(message, chatBotPluginSrc);
};

const checkOnlineStatus = async () => {
  try {
    const online = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    return online.status >= 200 && online.status < 300;
  } catch (error) {
    return false;
  }
};

setInterval(async () => {
  const result = await checkOnlineStatus();
  setOnlineStatus(result);
  // console.log(result);
}, 15000);

const setOnlineStatus = (online) => {
  if (online) {
    onlineStatus.innerText = "Online";
    onlineStatusImage.setAttribute("src", "./assets/online.svg");
  } else {
    onlineStatus.innerText = "Offline";
    onlineStatusImage.setAttribute("src", "./assets/offline.svg");
  }
};
