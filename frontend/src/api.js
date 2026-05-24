import axios from 'axios';

// Creamos una instancia de axios para no repetir la URL en cada archivo
const api = axios.create({
    baseURL: 'http://localhost:5000/api' 
});

export default api;