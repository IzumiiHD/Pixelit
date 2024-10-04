import { VERSION } from './version.js';

export function displayVersion() {
  const versionString = VERSION.isBeta 
    ? `Running Pixelit Beta ${VERSION.number}`
    : `Running Pixelit v${VERSION.number}`;

  const versionElement = document.createElement('div');
  versionElement.textContent = versionString;
  versionElement.style.position = 'fixed';
  versionElement.style.bottom = '10px';
  versionElement.style.right = '10px';
  versionElement.style.color = '#f0f0f0';
  versionElement.style.fontFamily = 'Pixelify Sans, sans-serif';
  versionElement.style.fontSize = '0.75vw';
  versionElement.style.color = 'white';
  versionElement.style.textShadow = '0 0 10px orange';
  document.body.appendChild(versionElement);
}