export const logger = (req, res, next) => {
   if (req.method === 'POST' || req.method === 'GET') {
     console.log(JSON.stringify({
       method: req.method,
       url: req.url,
       path: req.path,
       params: req.params,
       query: req.query,
       body: req.body
     }, null, 2));
   }
   next();
 };