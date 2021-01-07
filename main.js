let scriptActive = false;
let globalStyle = false;
let selectedEl;

let mouseStartX = 0;
let mouseStartY = 0;

let [currentX, currentY] = "00";

const body = document.querySelector("body");

const resizeObserver = new ResizeObserver(enablingResizing);

let newObjects = [];
let newObjectCounter = 0;
let newObjCreation = 'disabled';

//TODO: injected ELAI CSS style
// const ELAICssStyle

const ELAI = document.createElement("ELAI");
ELAI.innerHTML = `<div class="icon" id="text-modifier">M
                      <div class="icon">S</div>
                      <div class="icon">C</div>
                    </div>
                    <div class="icon" id="rotation-modifier">R</div>
                    <div class="icon" id="translation-modifier">T</div>
                    <textarea
                      id="resize-text-modifier">
                    </textarea>`;

// const ELAI_SIDEBAR = document.createElement('ELAI-sidebar')
// ELAI_SIDEBAR.innerHTML = `    <div id="sidebar-wrapper">
// <div class="sidebar-button" id="new-el-selector" alt="Select new element">■</div>
// <div class="sidebar-button">+</div>
// <div class="sidebar-button"></div>
// </div>`

function createNewButton(id, content, trigger, callback) {
  const button = document.createElement('div')
  button.classList.add('sidebar-button')
  button.textContent = content;
  button.id = id
  button.addEventListener(trigger, callback)
  return button
}

const ELAI_SIDEBAR = document.createElement('div')
ELAI_SIDEBAR.classList.add('elai-sidebar')

const createNewObjectButton = createNewButton('new-el-selector', '+', 'click', toggleNewObjCreation);
ELAI_SIDEBAR.appendChild(createNewObjectButton)

function createObject(e) {
  e.preventDefault();
  e.stopPropagation();
  let newObject = document.createElement("div");
  body.appendChild(newObject);
  newObject.classList.add("newObject");
  newObject.id = `newObject-${newObjectCounter}`;
  
  newObjects.push({
    name: newObject.id,
    initialPosY: e.clientY,
    initialPosX: e.clientX,
    left: e.clientX,
    top: e.clientY,
    width: 0,
    height: 0,
  });
  newObject.style.left = e.clientX + "px";
  newObject.style.top = e.clientY + "px";
  document.addEventListener("mousemove", updateSize);
}

function updateSize(e) {
  e.preventDefault();
  e.stopPropagation();
  let newObject = document.querySelectorAll(".newObject")[newObjectCounter];
  let { left, top, width, height, initialPosX, initialPosY } = newObjects[
    newObjectCounter
  ];
  width = Math.abs(e.clientX - initialPosX);
  if (initialPosX > e.clientX) {
    left -= (initialPosX - e.clientX);
    newObject.style.left = left +'px';
  }else {
    newObject.style.left = left + "px";
  }
  height = Math.abs(e.clientY - initialPosY);
  if (initialPosY > e.clientY) {
    top -= (initialPosY - e.clientY);
    newObject.style.top = top + "px";
  } else {
    newObject.style.top = top + "px";
  }
  newObject.style.height = height + "px";
  newObject.style.width = width + "px";
}

function stopChangingCoords() {
  newObjectCounter++;
  document.removeEventListener("mousemove", updateSize);
}

function toggleNewObjCreation() {
  newObjCreation === 'disabled' ? enableNewObjCreation() : disableNewObjectCreation()
}

function enableNewObjCreation() {
  newObjCreation = 'enabled';
  body.addEventListener("mousedown", createObject);
  body.addEventListener("mouseup", stopChangingCoords);
  // document.addEventListener("mouseout", stopChangingCoords);
}
function disableNewObjectCreation() {
  newObjCreation = 'disabled'
  body.removeEventListener("mousedown", createObject);
  body.removeEventListener("mouseup", stopChangingCoords);
  // document.removeEventListener("mouseout", stopChangingCoords);
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
      document.addEventListener("click", enableElementSelection);
      body.appendChild(ELAI_SIDEBAR)

    } else {
      showNotificationBar("error", "ELAI Dectivated");
      disableElementSelection(e);
    }
  }
}

class Element {
  constructor(el) {
    this.el = el;
    this.specs = getComputedStyle(this.el);
    this.top = this.specs.top;
    this.left = this.specs.left;
    this.width = this.specs.width;
    this.height = this.specs.height;
  }
}

function enableElementSelection(e) {
  document.removeEventListener("click", enableElementSelection);
  selectedEl = new Element(e.target);
  selectedEl.el.style.minWidth = "30px";
  selectedEl.el.style.whiteSpace = "pre-wrap";
  injectELAI();
  setTimeout(() => {
    ELAI.style.display = "block";
  }, 200);

  const textModifier = document.querySelector("#resize-text-modifier");

  const translationModifier = document.querySelector("#translation-modifier");
  textModifier.value = selectedEl.el.childNodes[0].textContent;
  textModifier.style.font = getComputedStyle(selectedEl.el).font;
  textModifier.style.paddingLeft = selectedEl.specs.paddingLeft;
  textModifier.style.paddingRight = selectedEl.specs.paddingRight;
  textModifier.style.paddingTop = selectedEl.specs.paddingTop;
  textModifier.style.paddingBottom = selectedEl.specs.paddingBottom;

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
  if (e.type === "mouseout") {
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
  document.removeEventListener("click", enableElementSelection);
  selectedEl.el.removeEventListener("mousedown", enableRepositioning);
  document.removeEventListener("contextmenu", disableElementSelection);
  document.removeEventListener("mouseenter", toggleHighlightElement);
  document.removeEventListener("mouseleave", toggleHighlightElement);
}
