import React, { useState, useEffect } from 'react';
import ChatBotEnhanced from '../components/ChatBotEnhanced';
import PatientQuickAccess from '../components/PatientQuickAccess';
import { useAuth } from '../contexts/AuthContext';
import { t, getCurrentLanguage } from '../services/i18nService';
import './Home.css';

// Ilustración de pulmón estilizada (línea, petrol + acento clay) — reemplaza
// el placeholder base64 casi en blanco que nunca llegó a ser una imagen real.
const HERO_ILLUSTRATION =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>" +
  "<circle cx='120' cy='120' r='108' fill='none' stroke='%23f0a677' stroke-width='1.5' opacity='0.45'/>" +
  "<circle cx='120' cy='120' r='78' fill='none' stroke='%23f0a677' stroke-width='1.5' opacity='0.3'/>" +
  "<g fill='none' stroke='%23103c37' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'>" +
  "<path d='M120 62 L120 112'/>" +
  "<path d='M120 112 C 108 123, 93 120, 83 138 C 68 162, 73 190, 95 195 C 116 199, 116 162, 116 142'/>" +
  "<path d='M120 112 C 132 123, 147 120, 157 138 C 172 162, 167 190, 145 195 C 124 199, 124 162, 124 142'/>" +
  "</g>" +
  "<circle cx='120' cy='56' r='7' fill='%23d9683f'/>" +
  "</svg>";

function Home() {
  const { isAuthenticated, user } = useAuth();
  const [, setLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <div className="home-page">
      <div className="home-container">
        <section className="welcome-banner">
          <div className="welcome-banner__rings" aria-hidden="true">
            <span className="welcome-banner__ring welcome-banner__ring--1" />
            <span className="welcome-banner__ring welcome-banner__ring--2" />
            <span className="welcome-banner__ring welcome-banner__ring--3" />
          </div>
          <div className="welcome-info">
            <span className="welcome-eyebrow">Plataforma de salud respiratoria</span>
            <h1>{t('home.welcome')}</h1>
            <p>{t('home.subtitle')}</p>
          </div>
          <div className="hero-media">
            <img
              src={HERO_ILLUSTRATION}
              loading="lazy"
              width="200"
              height="200"
              alt={t('home.welcome')}
            />
          </div>
        </section>

        {isAuthenticated && user?.role === 'patient' && <PatientQuickAccess />}

        <section className="home-chat-panel">
          <span className="home-chat-panel__eyebrow">Conversa con tu asistente</span>
          <ChatBotEnhanced />
        </section>
      </div>
    </div>
  );
}

export default Home;

