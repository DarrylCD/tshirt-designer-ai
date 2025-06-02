import { proxy }    from 'valtio';

const state = proxy({
  intro: true,

  color: '#EFBD48',
  isLogoTexture: true,
  isFullTexture: false,

  logoDecal: './threejs.png',
  fullDecal: './shirt.png',

  // shirt
  logoShirt: './shirt-logo.png',
  stylishShirt: './stylish-shirt.png',

  // ai
  aiPrompt: '',
  generatingImg: false,
  postProcessing: false,
});

export default state;