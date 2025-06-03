import React from 'react'
import CustomButton from './CustomButton'

const fonts = [
  'Arial', 'Courier New', 'Georgia', 'Impact', 'Simpsons', 'Times New Roman', 'Tangerine', 'Verdana',
];
const TextPicker = ({
  text,
  setText,
  font,
  setFont,
  color,
  setColor,
  generatingTxt,
  handleSubmit,
}) => {
  return (
    <div className="aipicker-container">
      <textarea
        className="w-full h-16 p-2 border border-gray-300 rounded"
        placeholder="Enter your text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="text-sm w-12">Font:</label>
        <select
          className="p-1 border border-gray-300 rounded w-full max-w-[140px]"
          value={font}
          onChange={e => setFont(e.target.value)}
        >
          {fonts.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm w-12">Color:</label>
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-8 h-8 p-0 border-none bg-transparent"
        />
      </div>
      <div className="flex gap-3">
        <CustomButton
          type="filled"
          title={generatingTxt ? "Rendering..." : "Submit"}
          handleClick={() => handleSubmit('textpicker')}
          customStyles="text-xs"
          disabled={generatingTxt}
        />
      </div>
    </div>
  );
};

export default TextPicker;