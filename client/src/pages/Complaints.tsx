import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Warning, CheckCircle, MagnifyingGlass } from "@phosphor-icons/react";
import { api } from "../lib/api";

const computePoW = async (seed: string, difficulty: number): Promise<string> => {
  let nonce = 0;
  const targetPrefix = '0'.repeat(difficulty);
  const encoder = new TextEncoder();
  while (true) {
    const input = seed + nonce.toString();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (hashHex.startsWith(targetPrefix)) {
      return nonce.toString();
    }
    // Yield to the main thread occasionally to prevent freezing the UI
    if (nonce % 500 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
    nonce++;
  }
};

export function Complaints() {
  const [activeTab, setActiveTab] = useState<'submit' | 'lookup'>('submit');
  
  // Submit State
  const [category, setCategory] = useState("GRADING");
  const [content, setContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [trackingCode, setTrackingCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Lookup State
  const [lookupCode, setLookupCode] = useState("");
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 10) {
      setErrorMsg("Please provide more detail (at least 10 characters).");
      return;
    }

    setSubmitStatus('submitting');
    setErrorMsg("");

    try {
      // 1. Fetch challenge
      const { data: challengeData } = await api.get('/complaints/challenge');
      
      // 2. Compute Proof of Work
      const nonce = await computePoW(challengeData.seed, challengeData.difficulty);
      
      // 3. Submit
      const { data: submitData } = await api.post('/complaints/submit', {
        seed: challengeData.seed,
        nonce,
        category,
        content
      });
      
      setTrackingCode(submitData.trackingCode);
      setSubmitStatus('success');
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMsg(err?.response?.data?.error || "Failed to submit complaint. Please try again.");
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode) return;

    setLookupStatus('loading');

    try {
      const { data } = await api.get(`/complaints/status/${lookupCode}`);
      setLookupResult(data);
      setLookupStatus('found');
    } catch (err: any) {
      setLookupStatus('not_found');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Public Nav Header */}
      <header className="nav-bar" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Shield weight="duotone" size={24} color="var(--accent-house)" />
          <span>OFFCLASS</span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/hall-of-fame" className="nav-link">Hall of Fame</Link>
          <Link to="/login" className="nav-link">Login</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1>Speak Up</h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            Report issues, appeal grades, or flag platform bugs completely anonymously.
          </p>
        </div>

        <noscript>
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem', 
            backgroundColor: 'color-mix(in srgb, #e11d48 10%, transparent)', 
            border: '1px solid #e11d48', 
            borderRadius: 'var(--radius-md)',
            color: '#e11d48'
          }}>
            <strong>JavaScript is required for the anti-spam check.</strong> 
            <p style={{ margin: '0.5rem 0 0 0' }}>
              We use a browser-based proof-of-work challenge instead of tracking CAPTCHAs to guarantee anonymity. 
              If you cannot enable JavaScript, please email us directly at <a href="mailto:speakup@offclass.local" style={{ color: 'inherit', textDecoration: 'underline' }}>speakup@offclass.local</a>.
            </p>
          </div>
        </noscript>

        <div className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <button 
              onClick={() => setActiveTab('submit')}
              style={{
                flex: 1, padding: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === 'submit' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'submit' ? 600 : 400,
                borderBottom: activeTab === 'submit' ? '2px solid var(--text-primary)' : '2px solid transparent'
              }}
            >
              Submit Complaint
            </button>
            <button 
              onClick={() => setActiveTab('lookup')}
              style={{
                flex: 1, padding: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === 'lookup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'lookup' ? 600 : 400,
                borderBottom: activeTab === 'lookup' ? '2px solid var(--text-primary)' : '2px solid transparent'
              }}
            >
              Check Status
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {activeTab === 'submit' && (
              <>
                {submitStatus === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <CheckCircle size={64} weight="fill" color="var(--accent-house)" />
                    <div>
                      <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Submission Received</h2>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Your complaint has been securely filed.</p>
                    </div>
                    
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'color-mix(in srgb, #e11d48 10%, transparent)', 
                      border: '1px solid #e11d48',
                      borderRadius: 'var(--radius-md)',
                      width: '100%',
                      maxWidth: '400px'
                    }}>
                      <div style={{ color: '#e11d48', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Warning weight="fill" /> Save this tracking code now
                      </div>
                      <div className="mono" style={{ fontSize: '2rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {trackingCode}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '1rem 0 0 0' }}>
                        You cannot recover this code once you close this page. You need it to check for replies or resolution status.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => { setSubmitStatus('idle'); setContent(''); }}
                      style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                    >
                      File Another Report
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: 'color-mix(in srgb, var(--bg-surface) 50%, transparent)', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong>Privacy Guarantee:</strong> This form does not track your session, IP address, or identity. We use an in-browser anti-spam check instead of CAPTCHA.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label htmlFor="category" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>What is this regarding?</label>
                      <select 
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ 
                          padding: '0.75rem', 
                          background: 'var(--bg-base)', 
                          border: '1px solid var(--border-strong)', 
                          color: 'var(--text-primary)', 
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="GRADING">Grading dispute / Unfair marking</option>
                        <option value="HARASSMENT">Harassment / Bullying / Code of Conduct violation</option>
                        <option value="PLATFORM_BUG">OffClass platform bug or missing points</option>
                        <option value="OTHER">Other concern</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label htmlFor="content" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Details</label>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Provide enough context for us to investigate. Do not include your name if you wish to remain anonymous.
                      </p>
                      <textarea 
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        placeholder="Explain the situation..."
                        style={{ 
                          padding: '0.75rem', 
                          background: 'var(--bg-base)', 
                          border: '1px solid var(--border-strong)', 
                          color: 'var(--text-primary)', 
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '1rem',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {errorMsg && (
                      <div style={{ color: '#e11d48', fontSize: '0.875rem', padding: '0.5rem', backgroundColor: 'color-mix(in srgb, #e11d48 10%, transparent)', borderRadius: 'var(--radius-sm)' }}>
                        {errorMsg}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={submitStatus === 'submitting'}
                      style={{ 
                        padding: '1rem', 
                        background: 'var(--text-primary)', 
                        border: 'none', 
                        color: 'var(--bg-base)', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: submitStatus === 'submitting' ? 'wait' : 'pointer',
                        fontWeight: 700,
                        fontSize: '1rem',
                        marginTop: '1rem',
                        opacity: submitStatus === 'submitting' ? 0.7 : 1
                      }}
                    >
                      {submitStatus === 'submitting' ? 'Computing Proof of Work & Submitting...' : 'Submit Anonymously'}
                    </button>
                  </form>
                )}
              </>
            )}

            {activeTab === 'lookup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character tracking code"
                    className="mono"
                    style={{ 
                      flex: 1,
                      padding: '0.75rem 1rem', 
                      background: 'var(--bg-base)', 
                      border: '1px solid var(--border-strong)', 
                      color: 'var(--text-primary)', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1rem'
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={lookupStatus === 'loading' || !lookupCode}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.5rem', 
                      background: 'var(--text-primary)', 
                      border: 'none', 
                      color: 'var(--bg-base)', 
                      borderRadius: 'var(--radius-sm)', 
                      cursor: (lookupStatus === 'loading' || !lookupCode) ? 'not-allowed' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <MagnifyingGlass weight="bold" /> Check
                  </button>
                </form>

                {lookupStatus === 'not_found' && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No complaint found with that tracking code. Ensure you typed it correctly.
                  </div>
                )}

                {lookupStatus === 'found' && lookupResult && (
                  <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'var(--bg-base)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Filed On</div>
                        <div className="mono" style={{ color: 'var(--text-primary)' }}>{lookupResult.reportedDay}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ color: 'var(--accent-house)', fontWeight: 600 }}>{lookupResult.status.replace('_', ' ')}</div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Response from Faculty:</div>
                      <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                        {lookupResult.adminNotes || "No notes added yet."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
