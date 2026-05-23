const http = require('http');
http.get('http://localhost:5173/src/App.jsx', (res) => {
    let raw = ''; res.on('data', c => raw += c);
    res.on('end', () => console.log('App.jsx size: ' + raw.length));
});
