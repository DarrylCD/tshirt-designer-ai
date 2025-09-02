# 👕 T-Shirt Designer

Create unique T-shirt designs in just a few clicks! This web app lets you fully customize your T-shirts with:

- 🎨 Custom colors
- 🖼️ Logo uploads
- ✏️ Text overlays
- 🤖 AI-generated designs (via OpenAI)
- 📥 Downloadable print-ready files

Whether you're prototyping apparel, mocking merch for a brand, or just exploring your creativity, **this designer tool is built for makers**.

---

## 🚀 Live Demo

🌐 **Frontend (Netlify):** [T-shirt Designer Demo](https://tshirtdesignerbydcd.netlify.app/)  
⚙️ **Backend :** Hosted on Render  
- Local development: http://localhost:8080  
- Production URL is set in the `.env` file as `VITE_BACKEND_URL`

---

## 🚀 Features

- ✅ Real-time 3D shirt rendering using **three.js**
- 🎨 Interactive UI with color, text, and logo customization
- 🤖 Generate designs with **OpenAI DALL·E**
- 💾 Download designs as images for print or digital use
- ⚡ Smooth, animated experience with **Framer Motion**
- 🧠 Global state management via **Valtio**

---

## 📸 Preview

| Home | Customizer | AI Prompt |
|:--:|:--:|:--:|
| ![Home](https://cdn.imgchest.com/files/46acqb8zlq7.png) | ![Customizer](https://cdn.imgchest.com/files/yxkczgv2bn7.png) | ![AI](https://cdn.imgchest.com/files/7kzcab9nvx7.png) |


---

## 🛠️ Tech Stack

**Frontend:**
- [React.js](https://reactjs.org/)
- [Vite.js](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Three.js](https://threejs.org/)
- [Valtio](https://valtio.pmnd.rs/)
- [Framer Motion](https://www.framer.com/motion/)

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [OpenAI API](https://openai.com/api)

---

## 🧑‍💻 Getting Started

```bash
# Clone the repo
git clone https://github.com/DarrylCD/threejs_tshirt_ai.git

# Install dependencies
cd tshirt-designer
npm install

# Start the development server
npm run dev
