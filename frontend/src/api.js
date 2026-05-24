import axios from 'axios';

console.log("La URL que está usando Axios es:", import.meta.env.VITE_API_URL);

// Creamos una instancia de axios para no repetir la URL en cada archivo
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export default api;