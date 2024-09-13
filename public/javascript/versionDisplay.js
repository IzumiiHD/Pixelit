import { VERSION } from './version.js';

export function displayVersion() {
  const versionString = VERSION.isBeta 
    ? `Beta ${VERSION.number}`
    : `v${VERSION.number}`;

  const versionElement = document.createElement('div');
  versionElement.textContent = versionString;
  versionElement.style.position = 'fixed';
  versionElement.style.bottom = '10px';
  versionElement.style.right = '10px';
  versionElement.style.color = '#f0f0f0';
  versionElement.style.fontFamily = 'Pixelify Sans, sans-serif';
  versionElement.style.fontSize = '16px';
  versionElement.style.padding = '8px 12px';
  versionElement.style.borderRadius = '8px';
  versionElement.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.3)';
  document.body.appendChild(versionElement);
}