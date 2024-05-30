export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="user_pages"');
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Authentication required')
    return;
  }
  console.log(authHeader)
  
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === 'admin' && password === 'password') {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="user_pages"');
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Authentication required')
  }
}
