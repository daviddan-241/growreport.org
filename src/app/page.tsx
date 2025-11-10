'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('ref')) {
      fetch('/api/affiliate?' + params.toString());
    }
  }, []);

  const scan = async () => {
    if (!email.includes('@')) return;
    setLoading(true);

    const report = {
      page: url || 'your page',
      bestTime: '8 PM weekdays',
      topHashtag: '#GrowEasy',
      tip: 'Post carousels on Thursday → 340% more likes'
    };

    const html = `
      <div style="font-family:Arial;padding:40px;background:#f9f9f9;max-width:600px;margin:auto">
        <h1 style="text-align:center;color:#333">Free Growth Report</h1>
        <p><b>Page:</b> ${report.page}</p>
        <hr>
        <h2 style="color:#6d28d9">Post at ${report.bestTime}</h2>
        <h2 style="color:#6d28d9">Use ${report.topHashtag}</h2>
        <h2 style="color:#6d28d9">${report.tip}</h2>
        <p style="margin-top:20px"><b>Want daily reports + AI captions?</b><br>
           Get PRO → <a href="https://growreport.vercel.app/pro">growreport.vercel.app/pro</a></p>
        <p style="font-size:10px;color:#999;margin-top:30px">
          Shared by ${email.split('@')[0]} – earn $3 when friends upgrade
        </p>
      </div>`;

    const div = document.createElement('div');
    div.innerHTML = html;
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    document.body.appendChild(div);

    const canvas = await html2canvas(div, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, width, height);
    const blob = pdf.output('blob');

    const form = new FormData();
    form.append('from', 'GrowReport <hello@growreport.io>');
    form.append('to', email);
    form.append('subject', 'Your FREE Growth Report');
    form.append('html', '<p>Here’s your free growth report! See attached PDF.</p>');
    form.append('attachment', blob, 'growth-report.pdf');

    try {
      await axios.post('https://api.resend.com/emails', form, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_RESEND_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Report sent to ' + email);
    } catch (err) {
      console.error(err);
      alert('Error sending email. Check console.');
    }

    document.body.removeChild(div);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2">GrowReport.io</h1>
        <p className="text-center text-gray-600 mb-8">FREE forever – no card</p>

        <input
          placeholder="facebook.com/YourPage"
          className="w-full p-4 border rounded-lg mb-4 text-gray-700"
          onChange={e => setUrl(e.target.value)}
          value={url}
        />
        <input
          placeholder="you@gmail.com"
          className="w-full p-4 border rounded-lg mb-6 text-gray-700"
          onChange={e => setEmail(e.target.value)}
          value={email}
          type="email"
        />

        <button
          onClick={scan}
          disabled={loading || !email.includes('@')}
          className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? 'Sending…' : 'Send My FREE Report'}
        </button>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-sm">
          <p className="font-bold">Earn $3 per friend</p>
          <p className="text-gray-600">Copy & share:</p>
          <div className="mt-3 flex gap-2">
            <input
              value={`https://growreport.vercel.app/?ref=${email.split('@')[0] || 'you'}`}
              readOnly
              className="flex-1 p-2 bg-white border rounded text-xs font-mono"
            />
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `Free growth tool – get your report in 30 s: https://growreport.vercel.app/?ref=${email.split('@')[0] || 'you'}`
                )
              }
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Copy
            </button>
          </div>
        </div>

        <p className="text-xs text-center mt-4 text-gray-500">
          Zero spam • Built in 5 min • 100% free
        </p>
      </div>
    </div>
  );
            }
