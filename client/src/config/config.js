const config = {
  development: {
    backendUrl: "http://localhost:8080/api/v1/dalle",
  },
  production: {
    backendUrl: import.meta.env.VITE_BACKEND_URL + "api/v1/dalle",
  },
};

export default config;
