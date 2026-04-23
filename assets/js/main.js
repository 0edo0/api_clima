/**
 * Función  para buscar el clima
 */
async function buscarClima() {
    const ciudadInput = document.getElementById('ciudad');
    const ciudad = ciudadInput.value.trim();
    const loader = document.getElementById('loader');
    const resultado = document.getElementById('resultado');

    if (!ciudad) {
        alert("Por favor, escribe el nombre de una ciudad.");
        return;
    }

    loader.style.display = 'block';
    resultado.style.display = 'none';

    try {
        // 1. PASO DE GEOLOCALIZACIÓN (Antes lo hacía el PHP)
        // Convertimos el nombre de la ciudad a coordenadas (latitud y longitud)
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudad)}&limit=1`;
        
        const geoResponse = await fetch(geoUrl, {
            headers: {
                'User-Agent': 'MiAppViajero/1.0' // Requisito de Nominatim
            }
        });
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error("No se encontró la ciudad");
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const nombreLimpio = geoData[0].display_name.split(',')[0];

        // 2. PASO DE CLIMA
        // Con las coordenadas, consultamos a Open-Meteo
        const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        const climaResponse = await fetch(climaUrl);
        const climaData = await climaResponse.json();

        // 3. MOSTRAR RESULTADOS
        procesarDatos(climaData.current_weather, nombreLimpio);

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema: " + error.message);
    } finally {
        loader.style.display = 'none';
    }
}

/**
 * Función encargada de actualizar el HTML y mostrar las animaciones
 */
function procesarDatos(clima, nombre) {
    const resultado = document.getElementById('resultado');
    const temp = Math.round(clima.temperature);
    const code = clima.weathercode;

    document.getElementById('nombreCiudad').innerText = nombre;
    document.getElementById('temp').innerText = temp;
    
    let icono = "🌡️";
    let estadoTexto = "Clima Variable";
    let consejo = "";

    // Mapeo de códigos WMO (Open-Meteo)
    if (code === 0) {
        icono = "☀️";
        estadoTexto = "Cielo Despejado";
        consejo = "☀️ Mucho calor. Ropa ligera y bloqueador.";
    } else if (code >= 1 && code <= 3) {
        icono = "⛅";
        estadoTexto = "Parcialmente Nublado";
        consejo = "👕 Clima agradable. Una polera está bien.";
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        icono = "🌧️";
        estadoTexto = "Lluvia";
        consejo = "☔ ¡Lleva paraguas e impermeable!";
    } else if (code >= 95) {
        icono = "⛈️";
        estadoTexto = "Tormenta";
        consejo = "⚡ Tormentas eléctricas. Ten precaución.";
    } else if (temp < 13) {
        icono = "❄️";
        estadoTexto = "Frío";
        consejo = "🧥 Hace frío. Empaca abrigo pesado.";
    }

    if (temp < 13 && !consejo.includes("☔")) {
        consejo = "🧥 Hace frío. Empaca un buen abrigo.";
    }

    document.getElementById('descClima').innerHTML = `
        <div class="weather-icon">${icono}</div>
        <span>${estadoTexto}</span>
    `;

    document.getElementById('recomendacion').innerText = consejo;
    
    resultado.style.display = 'block';
    resultado.classList.add('animate-in');
}
