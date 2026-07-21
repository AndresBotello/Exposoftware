import React, { useState } from 'react';
import { getAuthHeaders } from '../../Services/AuthService';
import { API_ENDPOINTS } from '../../utils/constants';
import axios from 'axios';

export default function EventReportDebug() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPIs = async () => {
    setLoading(true);
    const headers = getAuthHeaders();
    const testResults = {};

    console.clear();
    console.log('🧪 INICIANDO PRUEBAS DE API...\n');

    // Test 1: Auth headers
    console.log('1️⃣ Headers de autenticación:');
    console.log(headers);
    testResults.headers = headers ? '✅ OK' : '❌ NO ENCONTRADOS';

    // Test 2: Eventos
    try {
      console.log('\n2️⃣ Fetching ADMIN_EVENTOS...');
      console.log('URL:', API_ENDPOINTS.ADMIN_EVENTOS);
      const eventosRes = await axios.get(API_ENDPOINTS.ADMIN_EVENTOS, {
        headers,
        withCredentials: true
      });
      console.log('✅ RESPUESTA:', eventosRes.data);
      testResults.eventos = {
        status: '✅ OK',
        count: Array.isArray(eventosRes.data)
          ? eventosRes.data.length
          : eventosRes.data?.data?.length || 0,
        data: eventosRes.data
      };
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      console.error('Detalles:', error.response?.data || error);
      testResults.eventos = {
        status: '❌ ERROR',
        message: error.message,
        details: error.response?.data
      };
    }

    // Test 3: Asistencias (si hay eventos)
    if (testResults.eventos?.data?.length > 0) {
      const eventoId = testResults.eventos.data[0]?.id_evento || testResults.eventos.data[0]?.id;
      try {
        console.log('\n3️⃣ Fetching ASISTENCIAS_EVENTO...');
        console.log('URL:', API_ENDPOINTS.ASISTENCIAS_EVENTO(eventoId));
        const asistenciasRes = await axios.get(
          API_ENDPOINTS.ASISTENCIAS_EVENTO(eventoId),
          { headers, withCredentials: true }
        );
        console.log('✅ RESPUESTA:', asistenciasRes.data);
        testResults.asistencias = {
          status: '✅ OK',
          count: Array.isArray(asistenciasRes.data)
            ? asistenciasRes.data.length
            : asistenciasRes.data?.data?.length || 0,
          data: asistenciasRes.data
        };
      } catch (error) {
        console.error('❌ ERROR:', error.message);
        testResults.asistencias = {
          status: '❌ ERROR',
          message: error.message
        };
      }

      // Test 4: Proyectos
      try {
        console.log('\n4️⃣ Fetching PROYECTOS_BY_EVENTO...');
        console.log('URL:', API_ENDPOINTS.PROYECTOS_BY_EVENTO(eventoId));
        const projectsRes = await axios.get(
          API_ENDPOINTS.PROYECTOS_BY_EVENTO(eventoId),
          { headers, withCredentials: true }
        );
        console.log('✅ RESPUESTA:', projectsRes.data);
        testResults.proyectos = {
          status: '✅ OK',
          count: Array.isArray(projectsRes.data)
            ? projectsRes.data.length
            : projectsRes.data?.data?.length || 0,
          data: projectsRes.data
        };
      } catch (error) {
        console.error('❌ ERROR:', error.message);
        testResults.proyectos = {
          status: '❌ ERROR',
          message: error.message
        };
      }
    }

    // Test 5: Materias
    try {
      console.log('\n5️⃣ Fetching ADMIN_MATERIAS...');
      console.log('URL:', API_ENDPOINTS.ADMIN_MATERIAS);
      const materiasRes = await axios.get(API_ENDPOINTS.ADMIN_MATERIAS, {
        headers,
        withCredentials: true
      });
      console.log('✅ RESPUESTA:', materiasRes.data);
      testResults.materias = {
        status: '✅ OK',
        count: Array.isArray(materiasRes.data)
          ? materiasRes.data.length
          : materiasRes.data?.data?.length || 0,
        data: materiasRes.data
      };
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      testResults.materias = {
        status: '❌ ERROR',
        message: error.message
      };
    }

    console.log('\n✅ PRUEBAS COMPLETADAS');
    setResults(testResults);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2>🧪 Prueba de APIs</h2>
      <p>Haz clic para probar todas las APIs y ver las respuestas en la consola (F12)</p>

      <button
        onClick={testAPIs}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#22a34a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Probando...' : '▶️ Probar APIs'}
      </button>

      {Object.keys(results).length > 0 && (
        <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
          <h3>Resultados:</h3>
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
