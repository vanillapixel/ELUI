let globalStyle = false;
let selectedEl = {};

let mouseStartX = 0;
let mouseStartY = 0;

let [currentX, currentY] = "00";

const body = document.querySelector("body");

const resizeObserver = new ResizeObserver(enablingResizing);

let newObjects = [];
let newElementCounter = 0;

let scriptActive = false;
let newElementCreationActive = false;
let elementSelectionActive = false;

let newestCreatedElement;

//TODO: injected ELAI CSS style
// const ELAICssStyle

const ELAI = document.createElement("ELAI");
ELAI.innerHTML = `<div class="ELAI-ui-button" id="text-modifier">M
                      <div class="ELAI-ui-button">S</div>
                      <div class="ELAI-ui-button">C</div>
                    </div>
                    <div class="ELAI-ui-button" id="rotation-modifier">R</div>
                    <div class="ELAI-ui-button" id="translation-modifier">T</div>
                    <textarea
                      id="resize-text-modifier">
                    </textarea>`;

function createNewUiButton(id, content, eventListnersArray, parent) {
  const button = document.createElement("div");
  button.classList.add("sidebar-button", "ELAI-ui-button");
  button.textContent = content;
  button.id = id;
  eventListnersArray.forEach((eventListenerEntry) => {
    const trigger = Object.keys(eventListenerEntry);
    const callback = eventListenerEntry[trigger];
    button.addEventListener(trigger, callback);
  });
  parent.appendChild(button);
  return button;
}

const ELAI_SIDEBAR = document.createElement("div");
ELAI_SIDEBAR.classList.add("elai-sidebar");

const sidebarUiButtons = [
  createNewUiButton(
    "select-new-element-button",
    "^",
    [{ click: toggleElementSelection }],
    ELAI_SIDEBAR
  ),
  createNewUiButton(
    "create-new-element-button",
    "+",
    [{ click: toggleNewElementCreation }],
    ELAI_SIDEBAR
  ),
];

const topLeftCornerResizer = createNewUiButton(
  "topLeftCornerResizer",
  "♥",
  [{ mousedown: enableUpdateSize }, { mouseup: disableUpdateSize }],
  ELAI
);

function disableUpdateSize() {}

sidebarUiButtons.forEach((sidebarUiButton) =>
  ELAI_SIDEBAR.appendChild(sidebarUiButton)
);

function createNewElement(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.classList.contains("sidebar-button")) {
    return;
  }
  newestCreatedElement = document.createElement("div");
  body.appendChild(newestCreatedElement);
  newestCreatedElement.classList.add("newObject");
  newestCreatedElement.id = `newObject-${newElementCounter}`;
  newObjects.push({
    name: newestCreatedElement.id,
    width: 0,
    height: 0,
    mouseStartY: e.clientY,
    mouseStartX: e.clientX,
    left: e.clientX,
    top: e.clientY,
  });
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  newestCreatedElement.style.left = mouseStartX + "px";
  newestCreatedElement.style.top = mouseStartY + "px";
  enableUpdateSize();
  newElementCounter++;
}

function enableUpdateSize() {
  document.addEventListener("mousemove", updateSize);
}

function updateSize(e) {
  e.preventDefault();
  e.stopPropagation();
  const newestCreatedElement =
    selectedEl.el || newObjects[newObjects.length - 1];
  let {
    left,
    top,
    width,
    height,
  } = newestCreatedElement.getBoundingClientRect();
  console.log(newestCreatedElement);
  console.log(newestCreatedElement.getBoundingClientRect().left, left);
  newestCreatedElement.width = Math.abs(e.clientX - mouseStartX);
  width = Math.abs(e.clientX - mouseStartX);
  if (mouseStartX > e.clientX) {
    left -= mouseStartX - e.clientX;
    newestCreatedElement.style.left = left + "px";
  } else {
    newestCreatedElement.style.left = left + "px";
  }
  height = Math.abs(e.clientY - mouseStartY);
  if (mouseStartY > e.clientY) {
    top -= mouseStartY - e.clientY;
    newestCreatedElement.style.top = top + "px";
  } else {
    newestCreatedElement.style.top = top + "px";
  }
  newestCreatedElement.style.height = height + "px";
  newestCreatedElement.style.width = width + "px";
}

function stopUpdateSize(e) {
  e.preventDefault();
  e.stopPropagation();
  toggleNewElementCreation();
  selectElement(e);
  console.log(newestCreatedElement);
  newestCreatedElement = null;
}

function toggleNewElementCreation() {
  !newElementCreationActive
    ? enableNewElementCreation()
    : disableNewObjectCreation();
  newElementCreationActive = !newElementCreationActive;
}

function enableNewElementCreation() {
  //TODO: newly created element is SELECTED_EL.el
  body.addEventListener("mousedown", createNewElement);
  body.addEventListener("mouseup", stopUpdateSize);
  body.addEventListener("mouseleave", stopUpdateSize);
  showNotificationBar("success", "Create new object mode enabled");
  newestCreatedElement = null;
}
function disableNewObjectCreation() {
  body.removeEventListener("mousedown", createNewElement);
  document.removeEventListener("mousemove", updateSize);
  body.removeEventListener("mouseup", stopUpdateSize);
  body.removeEventListener("mouseleave", stopUpdateSize);
  showNotificationBar("error", "Create new object mode disabled");
}

// key combination to activate the script;
// ctrl + shift + a (windows)

//TODO: Backup properties function is useless?

//TODO: Create sidebar for actions:
// rotate, change background, resize, move (done), font-size

document.addEventListener("keyup", toggleScriptActivation);

function toggleScriptActivation(e) {
  // ctrl + shift + a
  const ACTIVATION_SHORTCUT = e.ctrlKey && e.shiftKey && e.which === 65;
  if (ACTIVATION_SHORTCUT) {
    scriptActive = !scriptActive;
    if (scriptActive) {
      // setGlobalStyle();
      showNotificationBar("success", "ELAI Activated");
      toggleElementSelection();
      body.appendChild(ELAI_SIDEBAR);
    } else {
      showNotificationBar("error", "ELAI Dectivated");
      disableElementSelection(e);
    }
  }
}

function toggleElementSelection() {
  if (!elementSelectionActive) {
    showNotificationBar("success", "Element Selection enabled");
    document.addEventListener("dblclick", selectElement);
  } else {
    showNotificationBar("error", "Element Selection Disabled");
    document.removeEventListener("click", selectElement);
  }
  elementSelectionActive = !elementSelectionActive;
}

function selectElement(e) {
  if (
    e.target.classList.contains("ELAI-ui-button") ||
    e.target === body ||
    e.target === selectedEl.el
  ) {
    return;
  }
  toggleElementSelection();
  console.log(newestCreatedElement);
  selectedEl.el = newestCreatedElement || e.target;
  newestCreatedElement
    ? selectedEl.el.appendChild(document.createElement("text"))
    : null;
  selectedEl.specs = getComputedStyle(selectedEl.el);
  const { specs } = selectedEl;
  selectedEl.el.style.minWidth = "30px";
  selectedEl.el.style.minHeight = "30px";
  selectedEl.el.style.whiteSpace = "pre-wrap";
  console.log(specs.width);
  injectELAI();

  const textModifier = document.querySelector("#resize-text-modifier");

  const translationModifier = document.querySelector("#translation-modifier");
  textModifier.value = selectedEl.el.childNodes[0].textContent;
  textModifier.style.font = specs.font;
  textModifier.style.paddingLeft = specs.paddingLeft;
  textModifier.style.paddingRight = specs.paddingRight;
  textModifier.style.paddingTop = specs.paddingTop;
  textModifier.style.paddingBottom = specs.paddingBottom;

  textModifier.addEventListener("input", changeText);
  enablingResizing(selectedEl);
  resizeObserver.observe(textModifier);
  translationModifier.addEventListener("mousedown", enableRepositioning);
}

function injectELAI() {
  selectedEl.el.appendChild(ELAI);
}

// function changeCSSProperties(array_of_elements, cssPropertiesObject) {
//   array_of_elements.forEach(el => {
//     Object.keys(cssPropertiesObject).forEach(key => {
//       el[key] =!
//     })
//   })
// }

function changeText(e) {
  selectedEl.el.childNodes[0].textContent = e.target.value;
}

//TODO: Change activation listener

function startRepositioning(e) {
  e.preventDefault();
  e.stopPropagation();
  let translationX = Math.round(Number(currentX) + e.clientX - mouseStartX);
  let translationY = Math.round(Number(currentY) + e.clientY - mouseStartY);
  selectedEl.el.style.transform = `translate(${translationX}px, ${translationY}px)`;
}

function stopRepositioning(e) {
  e.preventDefault();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  body.removeEventListener("mousemove", startRepositioning);
  body.removeEventListener("mouseup", stopRepositioning);
}

// TODO: element rotation

// let rotation = Math.round((e.clientX - mouseStartX) / 0.7);
// selectedEl.el.style.transform = `rotate(${rotation}deg)`;

function enableRepositioning(e) {
  e.preventDefault();
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
  // regex filters the numbers from the transform string
  const currentTranslation = selectedEl.el.style.transform || "0 0";
  //
  [currentX, currentY] = currentTranslation
    .split(" ")
    .map((x) => x.replace(/[^-.0-9]/g, ""));
  body.addEventListener("mousemove", startRepositioning);
  body.addEventListener("mouseup", stopRepositioning);
}

function enablingResizing() {
  const resizer = document.querySelector("#resize-text-modifier");
  const paddingLR =
    Number(selectedEl.specs.paddingLeft.slice(0, -2)) +
    Number(selectedEl.specs.paddingRight.slice(0, -2));
  const paddingTB =
    Number(selectedEl.specs.paddingTop.slice(0, -2)) +
    Number(selectedEl.specs.paddingBottom.slice(0, -2));
  let width = resizer.style.width.slice(0, -2) - paddingLR;

  let height = resizer.style.height.slice(0, -2) - paddingTB;

  selectedEl.el.style.width = width + "px";
  selectedEl.el.style.height = height + "px";
}

function showNotificationBar(type, message) {
  const body = document.querySelector("body");
  const background = {
    success: "#51bb51",
    warning: "#f19f0b",
    error: "#ff3a3a",
  };
  const newMessage = document.createElement("div");
  newMessage.textContent = message;
  let style = {
    minWidth: "50%",
    textAlign: "center",
    background: background[type],
    padding: "20px 40px",
    boxSizing: "content-box",
    fontSize: "20px",
    color: "white",
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    opacity: 0,
    transition: "1s",
    zIndex: 99999999999999,
  };
  Object.assign(newMessage.style, style);
  body.appendChild(newMessage);
  setTimeout(() => {
    newMessage.style.opacity = 1;
    newMessage.style.top = "20px";
  }, 50);
  setTimeout(() => {
    newMessage.style.opacity = style.opacity;
    newMessage.style.top = style.top;
  }, 2500);
  setTimeout(() => {
    body.removeChild(newMessage);
  }, 3500);
}

let SELECTED_EL = { el: null, x: 0, y: 0 };
let highlightedElement = { el: null, props: {} };
let originalElShadow;
let originalElTransition;
let positionString;

function backupItemCssProperties(props, dest) {
  props.forEach(
    (prop) => (dest[prop] = getComputedStyle(el).getPropertyValue(prop))
  );
}

function setItemCssProperties(el, props) {
  let propKeys = Object.keys(props);
  propKeys.forEach((prop) => {
    el.style[prop] = props[prop];
  });
}

function restoreItemCssProperties(el, props) {
  let propKeys = Object.keys(props);
  propKeys.forEach((prop) => (el.style[prop] = props[prop]));
}

function toggleHighlightElement(
  e,
  propertiesToChange = { boxShadow: "0px 0px 0px 3px red", cursor: "pointer" }
) {
  e.preventDefault();
  e.stopPropagation();

  /* if mouse ENTERS the element area - ADD highlight to element */
  if (e.type === "mouseover") {
    setItemCssProperties(el, propertiesToChange);
  }
  /* if mouse LEAVES the element area - REMOVE highlight to element */
  if (e.type === "mouseleave") {
    restoreItemCssProperties(el, highlightedElement.props);
  }
}

function setGlobalStyle() {
  const css = "* {overflow: visible !important; cursor: pointer !important};";
  head = document.head || document.getElementsByTagName("head")[0];
  if (!document.querySelector("#ELAIStyle")) {
    style = document.createElement("style");
    style.id = "ELAIStyle";
    head.appendChild(style);
    style.type = "text/css";
  }
  style.textContent = css;
}

function disableElementSelection(e) {
  e.preventDefault();
  // const ELAICssStyle = document.querySelector("#ELAIStyle");
  // ELAICssStyle.innerHTML = "";
  const resizer = document.querySelector("#resize-text-modifier");
  resizeObserver.unobserve(resizer);
  selectedEl.el.removeChild(ELAI);
  body.removeChild(ELAI_SIDEBAR);
  document.removeEventListener("click", selectElement);
  selectedEl.el.removeEventListener("mousedown", enableRepositioning);
  document.removeEventListener("contextmenu", disableElementSelection);
  document.removeEventListener("mouseenter", toggleHighlightElement);
  document.removeEventListener("mouseleave", toggleHighlightElement);
  selectedEl.el = null;
}
