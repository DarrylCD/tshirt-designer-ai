import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import config from '../config/config';
import state from '../store';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { 
    AIPicker, 
    ColorPicker, 
    CustomButton, 
    FilePicker, 
    TextPicker,
    Tab } from '../components';
import jsPDF from 'jspdf';

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');
  const [activeDownload, setActiveDownload] = useState("");

  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  })

  const [text, setText] = useState('');
  const [font, setFont] = useState('Arial');
  const [color, setColor] = useState('#000000');
  const [generatingTxt, setGeneratingTxt] = useState(false);

  // show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />
      case "filepicker":
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case "aipicker":
        return <AIPicker 
          prompt={prompt}
          setPrompt={setPrompt}
          generatingImg={generatingImg}
          handleSubmit={handleSubmit}
        />
      case "textpicker":
        return <TextPicker 
          text={text}
          setText={setText}
          font={font}
          setFont={setFont}
          color={color}
          setColor={setColor}
          generatingTxt={generatingTxt}
          handleSubmit={handleSubmit}
        />
      default:
        return null;
    }
  }

  const handleDownloadPNGClick = () => {
    setActiveDownload("png");
    handleDownloadPNG();
  };
  const handleDownloadSVGClick = () => {
    setActiveDownload("svg");
    handleDownloadSVG();
  };
  const handleDownloadPDFClick = () => {
    setActiveDownload("pdf");
    handleDownloadPDF();
  };

  const handleSubmit = async (type) => {
    // if the type is text, we handle it differently
    if (type === 'textpicker') {
      console.log('TextPicker submit:', text, font, color);
      if (!text) return alert("Please enter some text");
      setGeneratingTxt(true);
      try {
        state.textDecal = {
          text,
          font,
          color,
        };
      } catch (error) {
        alert(error);
      } finally {
        setGeneratingTxt(false);
        setActiveEditorTab("");
      }
      return;
    }  
    if (type === 'logo' || type === 'full') {
    if(!prompt) return alert("Please enter a prompt");
    try {
      setGeneratingImg(true);

      const response = await fetch('http://localhost:8080/api/v1/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
        })
      })

      const data = await response.json();

      handleDecals(type, `data:image/png;base64,${data.photo}`)
    } catch (error) {
      alert(error)
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if(!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
          state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
          state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    // after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setActiveEditorTab("");
      })
  }

  const handleDownloadPNG = () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    alert('No canvas found!');
    return;
  }
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'tshirt-design.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
  // Use the same SVG as your SVG download
  const svgWidth = 512;
  const svgHeight = 512;

  // Compose SVG as in handleDownloadSVG
  const tshirtShape = `
    <rect x="56" y="56" width="400" height="400" rx="80" fill="${snap.color}" stroke="#222" stroke-width="4"/>
  `;
  let logoImage = '';
  if (snap.logoDecal) {
    const logoDataUrl = snap.logoDecal.replace(/\s/g, '');
    logoImage = `
      <image 
        x="206" y="120" 
        width="100" height="100"
        href="${logoDataUrl}"
        xlink:href="${logoDataUrl}"
        style="image-rendering:optimizeQuality"
      />
    `;
  }
  let textSVG = '';
  if (state.textDecal && state.textDecal.text) {
    const { text, font, color } = state.textDecal;
    const fontSize = 48;
    const lineHeight = 60;
    const maxWidth = 440;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 512;
    tempCanvas.height = 512;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `bold ${fontSize}px ${font}`;
    const lines = wrapTextToLines(text, tempCtx, maxWidth);
    let yStart;
    if (state.isLogoTexture && snap.logoDecal) {
      yStart = 240 + 30;
    } else {
      yStart = 320 - ((lines.length - 1) * lineHeight) / 2;
    }
    lines.forEach((line, i) => {
      textSVG += `<text x="256" y="${yStart + i * lineHeight}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" fill="${color}" dominant-baseline="middle">${line}</text>`;
    });
  }
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}" height="${svgHeight}">
      ${tshirtShape}
      ${logoImage}
      ${textSVG}
    </svg>
  `.trim();

  // Convert SVG to PNG for embedding in PDF
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  const img = new window.Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth;
    canvas.height = svgHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pngData = canvas.toDataURL('image/png');

    // Create PDF and add PNG
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [svgWidth, svgHeight]
    });
    pdf.addImage(pngData, 'PNG', 0, 0, svgWidth, svgHeight);
    pdf.save('tshirt-design.pdf');
    URL.revokeObjectURL(url);
  };
  img.src = url;
  };

  function wrapTextToLines(text, ctx, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  const handleDownloadSVG = () => {
  // Only export if there's something to export
  if (!state.textDecal && !snap.logoDecal) {
    alert('No design to export!');
    return;
  }

  const svgWidth = 512;
  const svgHeight = 512;

  // 1. T-shirt shape (simple rounded rectangle as a placeholder)
  const tshirtShape = `
    <rect x="56" y="56" width="400" height="400" rx="80" fill="${snap.color}" stroke="#222" stroke-width="4"/>
  `;

  // 2. Logo image (if present)
  let logoImage = '';
  if (snap.logoDecal) {
    const logoDataUrl = snap.logoDecal.replace(/\s/g, '');
    logoImage = `
      <image 
        x="206" y="120" 
        width="100" height="100"
        href="${logoDataUrl}"
        xlink:href="${logoDataUrl}"
        style="image-rendering:optimizeQuality"
      />
    `;
  }

  // 3. Text decal (if present)
  let textSVG = '';
  if (state.textDecal && state.textDecal.text) {
    const { text, font, color } = state.textDecal;
    // const lines = text.split('\n');
    const fontSize = 48;
    const lineHeight = 60;
    const maxWidth = 440;

    // Create a temporary canvas context for measuring text width
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 512;
    tempCanvas.height = 512;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `bold ${fontSize}px ${font}`;

    // Use the same word wrap as the T-shirt preview
    const lines = wrapTextToLines(text, tempCtx, maxWidth);

    let yStart;
    if (state.isLogoTexture && snap.logoDecal) {
    yStart = 240 + 30; // below logo
    } else {
      yStart = 320 - ((lines.length - 1) * lineHeight) / 2;
    }

    lines.forEach((line, i) => {
      textSVG += `<text x="256" y="${yStart + i * lineHeight}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" fill="${color}" dominant-baseline="middle">${line}</text>`;
    });
  }

  // 4. Compose SVG
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}" height="${svgHeight}">
    ${tshirtShape}
    ${logoImage}
    ${textSVG}
  </svg>
  `.trim();

  // 5. Download SVG
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tshirt-design.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation('left')}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab 
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton 
              type="filled"
              title="Go Back"
              handleClick={() => state.intro = true}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className='filtertabs-container'
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}
          </motion.div>
          <motion.div
            className="absolute bottom-5 right-5 z-20"
          >
            <CustomButton
              type={activeDownload === "png" ? "filled" : "outline"}
              title="Download PNG"
              handleClick={handleDownloadPNGClick}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
            <CustomButton
              type={activeDownload === "svg" ? "filled" : "outline"}
              title="Download SVG"
              handleClick={handleDownloadSVGClick}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm ml-2"
            />
            <CustomButton
              type={activeDownload === "pdf" ? "filled" : "outline"}
              title="Download PDF"
              handleClick={handleDownloadPDFClick}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm ml-2"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer