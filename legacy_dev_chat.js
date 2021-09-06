function init_anydone_chat(apiKey, apiSecret) {
  // const chatPluginSrc = 'https://chatplugin.anydone.com/';   //  for prod
  // const chatPluginSrc = 'http://35.233.213.62:3000/';     // for dev
  const chatPluginSrc = "http://192.168.56.1:3000"; // ! For local development only, should be changed while pushing
  const apiKeyEl = document.createElement("input");
  apiKeyEl.hidden = true;
  apiKeyEl.id = "anydone-chat-plugin-api-key";
  apiKeyEl.value = apiKey;

  const apiSecEl = document.createElement("input");
  apiSecEl.hidden = true;
  apiSecEl.id = "anydone-chat-plugin-api-secret";
  apiSecEl.value = apiSecret;

  const bodyTag = document.body;
  bodyTag.appendChild(apiKeyEl);
  bodyTag.appendChild(apiSecEl);

  //iframe content
  const iframeTag = document.createElement("iframe");
  iframeTag.id = "anydone-chat-id";
  iframeTag.src = chatPluginSrc;

  iframeTag.onload = () => {
    const onMessageReceivedFromChatPlugin = (event) => {
      if (typeof event.data !== "string") {
        return false;
      }
      const chatPluginData = JSON.parse(event.data);
      const { type, message } = chatPluginData;
      switch (type) {
        case "SDK_INTEGRATION_IS_ENABLED":
          {
            showChatPlugin();
          }
          break;
        case "SDK_INTEGRATION_IS_DISABLED":
          {
            hideChatPlugin();
          }
          break;
        case "API_KEY_DATA": {
          setLocalStorageItem("anydoneApiKeyData", message);
          break;
        }
        case "MAPPING_ID": {
          setLocalStorageItem("mappingId", message);
          document.cookie = "mappingId=" + message;
          break;
        }
        case "ANYDONE_SESSION_DATA": {
          setLocalStorageItem("anydoneSession", message);
          break;
        }
        case "CUSTOMER_DATA": {
          setLocalStorageItem("customerData", message);
          break;
        }
        case "PAGE_LOCATION_REQUEST": {
          const page = {
            pageLocation: window.location.href,
          };
          console.log(window.location.href);
          post("PAGE_LOCATION_RESPONSE", page);
        }
        default:
          break;
      }
      return true;
    };
    window.addEventListener("message", onMessageReceivedFromChatPlugin);
    // Helper function for sending a message to the chatPlugin
    const post = (action, value) => {
      let data = {
        type: action,
      };

      if (value) {
        data.message = value;
      }

      let message = JSON.stringify(data);
      iframeTag.contentWindow.postMessage(message, chatPluginSrc);
    };

    if (getLocalStorageItem("environment") !== null) {
      // ! For Dev environment only, must be commented while pushing to prod
      const env = getLocalStorageItem("environment");
      console.log("setting initial env to production");
      env === "Production"
        ? post("Switch-Environment", "Production")
        : post("Switch-Environment", "Development");
    } else {
      post("Switch-Environment", "Development");
      console.log("setting initial env to development");
    }

    const cookieData = getCookie("mappingId");
    const localData = getLocalStorageItem("mappingId");
    if (cookieData !== localData) {
      const keysToRemove = [
        "customerData",
        "mappingId",
        "anydoneSession",
        "anydoneApiKeyData",
      ];

      for (key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }
    const customerData = getLocalStorageItem("customerData") || false;
    const mappingId = getLocalStorageItem("mappingId") || false;
    const keyData = getLocalStorageItem("anydoneApiKeyData") || false;
    const anydoneSession = getLocalStorageItem("anydoneSession") || false;
    const apiKeyData = {
      apiKey,
      apiSecret,
      hostName: window.location.origin,
      domain: window.location.hostname,
      customerData,
      mappingId,
      keyData,
      anydoneSession,
    };
    post("API_CONFIG", apiKeyData);
  };
  iframeTag.style.visibility = "hidden";
  iframeTag.style.bottom = "70px";
  iframeTag.style.position = "fixed";
  iframeTag.style.zIndex = "9999";
  iframeTag.style.border = "none";
  iframeTag.style.right = "33px";

  if (mobileSize.matches) {
    iframeTag.style.width = "100%";
    console.log("this is mobile sized");
  } else iframeTag.style.width = "350px";

  iframeTag.style.height = "528px";
  iframeTag.style.borderRadius = "10px";
  iframeTag.crossOrigin = "";
  iframeTag.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.25)";

  bodyTag.appendChild(iframeTag);

  //floating icon to toggle chat screen
  const anydoneIcon = document.createElement("img");
  anydoneIcon.id = "anydone-logo-id";
  anydoneIcon.src =
    "https://storage.googleapis.com/anydone_files/d72d9a1a61ba4f0e8bbb92f70616af91.png";
  anydoneIcon.style.visibility = "hidden";
  anydoneIcon.style.width = "50px";
  anydoneIcon.style.height = "50px";
  anydoneIcon.style.borderRadius = "50%";
  anydoneIcon.style.cursor = "pointer";
  anydoneIcon.style.position = "fixed";
  anydoneIcon.style.zIndex = "9999";
  anydoneIcon.style.right = "30px";
  anydoneIcon.style.bottom = "30px";

  const anydoneCloseIcon = document.createElement("img");
  anydoneCloseIcon.id = "anydone-close-id";
  anydoneCloseIcon.src =
    "https://storage.googleapis.com/anydone_files/17cf71ff8a614609a2631540717b05d8.png";
  anydoneCloseIcon.style.visibility = "hidden";
  anydoneCloseIcon.style.width = "50px";
  anydoneCloseIcon.style.height = "50px";
  anydoneCloseIcon.style.borderRadius = "50%";
  anydoneCloseIcon.style.cursor = "pointer";
  anydoneCloseIcon.style.position = "fixed";
  anydoneCloseIcon.style.zIndex = "9999";
  anydoneCloseIcon.style.right = "30px";
  anydoneCloseIcon.style.bottom = "30px";

  anydoneIcon.addEventListener("click", () => {
    anydoneIcon.style.visibility = "hidden";
    anydoneCloseIcon.style.visibility = "visible";
    anydoneCloseIcon.style.animation = "rotation 2s linear";
    iframeTag.style.visibility = "visible";
    iframeTag.style.bottom = "85px";
    iframeTag.style.transition = "bottom 0.3s linear";
    iframeTag.style.zIndex = "9999";
  });
  anydoneCloseIcon.addEventListener("click", () => {
    anydoneIcon.style.visibility = "visible";
    anydoneCloseIcon.style.visibility = "hidden";
    iframeTag.style.visibility = "hidden";
    iframeTag.style.zIndex = "-1";
    iframeTag.style.bottom = "30px";
  });

  bodyTag.appendChild(anydoneIcon);
  bodyTag.appendChild(anydoneCloseIcon);

  const hideChatPlugin = () => {
    iframeTag.style.visibility = "hidden";
    anydoneIcon.style.visibility = "hidden";
    anydoneCloseIcon.style.visibility = "hidden";
  };

  const showChatPlugin = () => {
    anydoneIcon.style.visibility = "visible";
  }

  // let modalWrapperStyles = {
  //   display: "none" /* Hidden by default */,
  //   position: "fixed" /* Stay in place */,
  //   "z-index": 1 /* Sit on top */,
  //   "padding-top": "100px" /* Location of the box */,
  //   left: 0,
  //   top: 0,
  //   width: "100%" /* Full width */,
  //   height: "100%" /* Full height */,
  //   overflow: "auto" /* Enable scroll if needed */,
  //   "background-color": "rgb(0,0,0)" /* Fallback color */,
  //   "background-color": "rgba(0,0,0,0.4)" /* Black w/ opacity */,
  // };

  // const callModal = document.createElement("div");
  // Object.assign(callModal.style, modalWrapperStyles);
  // bodyTag.appendChild(callModal);

  // let modalContentStyles = {
  //   "background-color": "#fefefe",
  //   margin: "auto",
  //   padding: "20px",
  //   border: "1px solid #888",
  //   width: "80%",
  // };

  // const modalContent = document.createElement("div");
  // Object.assign(modalContent.style, modalContentStyles);
  // modalContent.innerHTML = "<h1>This is the call Modal</h1>";
  // callModal.appendChild(modalContent);

  // const openModalButton = document.querySelector(".modalButton");
  // openModalButton.onClick = () => {
  //   callModal.style.display = "block";
  //   console.log("button clicked");
  // };
  // openModalButton.addEventListener("click", () => {
  //   callModal.style.display = "block";
  // });

  // callModal.addEventListener("click", (event) => {
  //     console.log(event.target)
  //   if (event.target === callModal) {
  //     callModal.style.display = "none";
  //   }
  // });
}

const setLocalStorageItem = (key, data) => {
  return localStorage.setItem(key, JSON.stringify(data));
};

const getLocalStorageItem = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

const clearLocalStorage = () => {
  window.localStorage.clear();
};

const getCookie = (name) => {
  let matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

var mobileSize = window.matchMedia("(max-width: 480px)");
