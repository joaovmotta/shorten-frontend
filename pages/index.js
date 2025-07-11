import { useState } from 'react';

import { useEffect, useRef } from 'react';
export default function Home() {
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);  const [customUrl, setCustomUrl] = useState('');
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  useEffect(() => {
    // Carrega o script do reCAPTCHA apenas uma vez
    if (!document.querySelector('script[src="https://www.google.com/recaptcha/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    window.onRecaptchaSuccess = (token) => {
      setRecaptchaToken(token);
    };
    window.recaptchaWidgetId = null;
    window.onloadCallback = () => {
      if (
        window.grecaptcha &&
        document.getElementById('g-recaptcha') &&
        window.recaptchaWidgetId === null
      ) {
        window.recaptchaWidgetId = window.grecaptcha.render('g-recaptcha', {
          sitekey: '6LelyUsrAAAAABNrTl6VII8CT8JXWOIfQ14j9pVV',
          callback: window.onRecaptchaSuccess
        });
      }
    };
    return () => {
      window.onRecaptchaSuccess = undefined;
      window.onloadCallback = undefined;
      window.recaptchaWidgetId = null;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError('Please, confirm the reCAPTCHA.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    try {
      const body = { url: inputUrl };
      if (customUrl) body.custom = customUrl;
      const res = await fetch('https://shorten-url-production-3f16.up.railway.app/api/v1/shorten', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'recaptcha-token': recaptchaToken
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        let errorMsg = 'Erro ao encurtar a URL';
        try {
          const errorData = await res.json();
          if (res.status === 400 && errorData.code === 400001) {
            errorMsg = 'This url is not available.';
          }
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (window.grecaptcha) window.grecaptcha.reset();
      setRecaptchaToken('');
    }
  };

  const handleCopy = async () => {
    if (result?.shortUrl) {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient">
      <div className="card">
        <h1 className="logo">Lnk<span>.io</span></h1>
        <form onSubmit={handleSubmit} className="form-modern" style={{ flexDirection: 'column', gap: 0, width: '100%' }}>
  <div style={{ display: 'flex', flexDirection: 'row', gap: 10, width: '100%', marginBottom: 10 }}>
    <input
      type="text"
      placeholder="Paste your URL here..."
      value={inputUrl}
      onChange={e => setInputUrl(e.target.value)}
      required
      className="input-modern"
      style={{ flex: 1, marginBottom: 0 }}
    />
  </div>
  <div style={{ display: 'flex', flexDirection: 'row', gap: 10, width: '100%', marginBottom: 14 }}>
    <input
      type="text"
      placeholder="Custom url (optional)"
      value={customUrl}
      onChange={e => setCustomUrl(e.target.value)}
      className="input-modern"
      style={{ flex: 1, marginBottom: 0 }}
    />
  </div>

  <div style={{ marginBottom: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
    <div
      id="g-recaptcha"
      className="g-recaptcha"
      data-sitekey="6LelyUsrAAAAABNrTl6VII8CT8JXWOIfQ14j9pVV"
      data-callback="onRecaptchaSuccess"
    ></div>
  </div>
  <button type="submit" disabled={loading} className="btn-modern" style={{ width: '100%', marginBottom: 0, whiteSpace: 'nowrap', paddingTop: 14, paddingBottom: 14 }}>{loading ? 'Sending...' : 'Shorten'}</button>
</form>
        {error && <p className="error-modern">{error}</p>}
        {result && (
  <div className="form-modern" style={{ marginBottom: 0, marginTop: 18 }}>
    <input
      type="text"
      className="input-modern"
      value={result.shortUrl}
      readOnly
      tabIndex={-1}
      style={{ marginBottom: 0, flex: 1 }}
    />
    <div style={{ display: 'flex', gap: '6px' }}>
      <button onClick={handleCopy} className="btn-modern" title="Copiar" style={{ padding: '0 7px', minWidth: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {copied ? (
          <span style={{fontSize: '0.90em'}}>Copiado!</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="7" y="7" width="12" height="12" rx="2" fill="none" stroke="#fff" strokeWidth="2"/>
            <rect x="3" y="3" width="12" height="12" rx="2" fill="none" stroke="#fff" strokeWidth="2"/>
          </svg>
        )}
      </button>
      <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="btn-modern" title="Abrir em nova aba" style={{ padding: '0 7px', minWidth: 32, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 14L21 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="7" width="14" height="14" rx="2" stroke="#fff" strokeWidth="2"/>
        </svg>
      </a>
    </div>
  </div>
)}
      </div>
      <style jsx>{`
        .bg-gradient {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          padding: 36px 28px 28px 28px;
          max-width: 420px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .logo {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #2d3a4a;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        .logo span {
          color: #6366f1;
        }
        .form-modern {
          width: 100%;
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }
        .input-modern {
          flex: 1;
          padding: 12px 14px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border 0.2s;
          outline: none;
        }
        .input-modern:focus {
.recaptcha-wrapper {
  width: 100%;
  min-width: 0;
  display: flex;
}
.recaptcha-wrapper .g-recaptcha {
  width: 100% !important;
  min-width: 0;
}
.recaptcha-wrapper iframe {
  width: 100% !important;
  min-width: 0;
  max-width: 100% !important;
  display: block;
}
@media (max-width: 340px) {
  .recaptcha-wrapper .g-recaptcha {
    transform: scale(0.85);
    transform-origin: 0 0;
  }
}

          border-color: #6366f1;
        }
        .btn-modern {
          background: linear-gradient(90deg, #6366f1 60%, #60a5fa 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0 22px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
        }
        .btn-modern:active {
          background: linear-gradient(90deg, #6366f1 80%, #60a5fa 100%);
        }
        .error-modern {
          color: #ef4444;
          background: #fef2f2;
          border-radius: 6px;
          padding: 8px 12px;
          margin: 0 0 10px 0;
          width: 100%;
          text-align: center;
        }
        .result-modern {
          width: 100%;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 18px 14px 10px 14px;
          margin-top: 10px;
          box-shadow: 0 1px 4px rgba(99,102,241,0.06);
        }
        .result-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .result-label {
          min-width: 90px;
          font-weight: 600;
          color: #6366f1;
          font-size: 1rem;
        }
        .result-value {
          flex: 1;
          color: #22223b;
          font-size: 1rem;
          word-break: break-all;
        }
        .short-url {
          font-weight: 700;
          color: #2563eb;
        }
        .copy-btn-modern {
          margin-left: 10px;
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 4px 14px;
          font-size: 0.98em;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .copy-btn-modern:active {
          background: #4338ca;
        }
        @media (max-width: 600px) {
          .card {
            padding: 18px 4vw 18px 4vw;
            max-width: 98vw;
          }
          .form-modern {
            flex-direction: column;
            gap: 10px;
          }
          .btn-modern {
.result-tinyurl-style {
  width: 100%;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 18px 14px 18px 14px;
  margin-top: 10px;
  box-shadow: 0 1px 4px rgba(99,102,241,0.06);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.short-url-input {
  margin-bottom: 0;
  text-align: left;
  font-weight: 700;
  color: #2563eb;
  background: #fff;
  cursor: pointer;
  width: 100%;
}
.actions-tiny {
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  align-items: center;
  margin-top: 16px;
}
.icon-btn {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:active {
  background: #4338ca;
}

            width: 100%;
            padding: 10px 0;
          }
        }
      `}</style>
    </div>
  );
}
