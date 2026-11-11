import React, { useEffect, useState } from 'react';
import { Network, Wifi, Globe, Server, ShieldCheck, Terminal, Copy, Check, Plus, Mail } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function AdminSettings() {
  const { success, error } = useToast();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPasscode, setNewPasscode] = useState<string | null>(null);
  const [savingStaff, setSavingStaff] = useState(false);

  const loadStaff = async () => {
    try {
      const response = await api.admin.staff() as { staff: any[] };
      setStaff(response.staff);
    } catch (err: any) {
      error(err.message || 'Unable to load staff accounts');
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const addStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingStaff(true);
    try {
      const response = await api.admin.createStaff({ name, email }) as { staff: any; passcode: string };
      setStaff((current) => [...current, response.staff]);
      setNewPasscode(response.passcode);
      setName('');
      setEmail('');
      success('Staff account created. Save the passcode now; it is shown only once.');
    } catch (err: any) {
      error(err.message || 'Unable to create staff account');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    success(`Copied ${label} command!`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-beige">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
          Infrastructure & Connectivity
        </span>
        <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Network & Sharing Center</h1>
        <p className="text-xs text-charcoal/60 mt-1 font-sans">
          Configure multi-device access across local Wi-Fi and public internet tunneling for remote demonstrations.
        </p>
      </div>

      <section className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage/20 text-forest flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-forest">Staff access</h2>
            <p className="text-xs text-charcoal/60">Permanent admin accounts with unique generated passcodes.</p>
          </div>
        </div>

        <form onSubmit={addStaff} className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3">
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Team or person name" className="px-3 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none" />
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="new-team@bloomora.com" className="px-3 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none" />
          <button disabled={savingStaff} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold disabled:opacity-50">
            <Plus className="w-4 h-4" /> {savingStaff ? 'Creating…' : 'Add staff'}
          </button>
        </form>

        {newPasscode && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
            <p className="font-bold">Copy this new passcode now</p>
            <code className="block mt-2 p-3 rounded-xl bg-white border border-amber-200 font-mono select-all">{newPasscode}</code>
            <button type="button" onClick={() => handleCopy(newPasscode, 'staff passcode')} className="mt-2 text-forest font-semibold hover:underline">Copy passcode</button>
          </div>
        )}

        <div className="divide-y divide-beige border border-beige rounded-2xl">
          {staff.map((account) => (
            <div key={account.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
              <span className="font-semibold text-forest">{account.name}</span>
              <span className="text-charcoal/60">{account.email}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Network Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-beige shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sage tracking-wider">Frontend Host</span>
          <p className="font-mono text-sm font-bold text-forest">0.0.0.0:5173</p>
          <p className="text-[11px] text-charcoal/50">Vite React Dev Server</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-beige shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sage tracking-wider">Backend API Host</span>
          <p className="font-mono text-sm font-bold text-forest">0.0.0.0:5001</p>
          <p className="text-[11px] text-charcoal/50">Express + Prisma PostgreSQL</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-beige shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sage tracking-wider">Database Mode</span>
          <p className="font-mono text-sm font-bold text-forest">Supabase PostgreSQL</p>
          <p className="text-[11px] text-charcoal/50">Hosted relational database</p>
        </div>
      </div>

      {/* A. SAME WI-FI / LOCAL NETWORK ACCESS */}
      <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage/20 text-forest flex items-center justify-center">
            <Wifi className="w-5 h-5 text-forest" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-forest">
              A. Same Wi-Fi / Local Network (LAN) Access
            </h3>
            <p className="text-xs text-charcoal/60">
              Open BLOOMORA on phones, tablets, or other laptops connected to the same Wi-Fi network.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-sans text-charcoal/80 leading-relaxed">
          <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-2">
            <p className="font-bold text-forest flex items-center justify-between">
              <span>Step 1: Discover your Laptop’s Local IPv4 Address</span>
              <button
                onClick={() => handleCopy('ipconfig getifaddr en0', 'LAN IP command')}
                className="text-[11px] text-forest font-semibold flex items-center gap-1 hover:underline"
              >
                {copiedText === 'LAN IP command' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Command
              </button>
            </p>
            <p className="text-charcoal/60">Run this in your macOS Terminal:</p>
            <div className="bg-charcoal text-ivory p-3 rounded-xl font-mono text-xs flex justify-between items-center">
              <span>ipconfig getifaddr en0</span>
            </div>
            <p className="text-[11px] text-charcoal/50">
              Example output: <code>192.168.1.15</code> (your IP address will vary).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-2">
            <p className="font-bold text-forest">Step 2: Connect from any Phone or Tablet</p>
            <p className="text-charcoal/60">
              Open the Safari or Chrome browser on your phone (connected to the same Wi-Fi) and type:
            </p>
            <div className="bg-forest text-ivory p-3 rounded-xl font-mono text-xs font-bold">
              http://&lt;YOUR-LAPTOP-IP&gt;:5173
            </div>
            <p className="text-[11px] text-charcoal/50">
              Example: <code>http://192.168.1.15:5173</code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <p className="font-bold">macOS Firewall Requirement</p>
            <p className="text-[11px]">
              If other devices cannot connect, go to <strong>System Settings → Network → Firewall</strong> and ensure incoming connections to Node / Vite are allowed, or temporarily permit local subnet traffic.
            </p>
          </div>
        </div>
      </div>

      {/* B. PUBLIC INTERNET ACCESS GUIDE */}
      <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/20 text-terracotta flex items-center justify-center">
            <Globe className="w-5 h-5 text-terracotta" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-forest">
              B. Public Internet Access (Cloudflare Tunnel)
            </h3>
            <p className="text-xs text-charcoal/60">
              Share a secure HTTPS link with anyone anywhere in the world while running the servers on your laptop.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-sans text-charcoal/80 leading-relaxed">
          <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-2">
            <p className="font-bold text-forest flex items-center justify-between">
              <span>Step 1: Install Cloudflare Tunnel (cloudflared)</span>
              <button
                onClick={() => handleCopy('brew install cloudflared', 'Brew Cloudflare command')}
                className="text-[11px] text-forest font-semibold flex items-center gap-1 hover:underline"
              >
                {copiedText === 'Brew Cloudflare command' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Command
              </button>
            </p>
            <div className="bg-charcoal text-ivory p-3 rounded-xl font-mono text-xs">
              brew install cloudflared
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-2">
            <p className="font-bold text-forest flex items-center justify-between">
              <span>Step 2: Start a Free Quick Tunnel to Vite Port 5173</span>
              <button
                onClick={() => handleCopy('cloudflared tunnel --url http://localhost:5173', 'Start Tunnel command')}
                className="text-[11px] text-forest font-semibold flex items-center gap-1 hover:underline"
              >
                {copiedText === 'Start Tunnel command' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Command
              </button>
            </p>
            <div className="bg-charcoal text-ivory p-3 rounded-xl font-mono text-xs">
              cloudflared tunnel --url http://localhost:5173
            </div>
            <p className="text-[11px] text-charcoal/60">
              Cloudflare will output a public HTTPS link, such as:{' '}
              <code className="text-forest font-semibold">https://bloomora-demo-xxxx.trycloudflare.com</code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sage/10 border border-sage/30 space-y-2 text-xs">
            <p className="font-bold text-forest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest" /> Security & Privacy Guarantees
            </p>
            <ul className="list-disc pl-5 space-y-1 text-charcoal/70 text-[11px]">
              <li>Only the frontend reverse proxy port is tunneled; the Supabase database is never exposed directly.</li>
              <li>End-to-end SSL/TLS encryption automatically provided by Cloudflare.</li>
              <li>No router port forwarding or public static IP required.</li>
              <li>Keep your laptop lid open and both terminal servers running while sharing.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
