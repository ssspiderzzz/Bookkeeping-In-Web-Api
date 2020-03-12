let corsOptions = {
  origin: true,
  credentials: true,
  allowedHeaders: [
    'X-PINGOTHER',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'cookie',
    'Set-Cookie'
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

module.exports = corsOptions
