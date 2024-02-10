# url-shortener

This is a api for a url-shortener app application

### routes

- GET / - check if the api is running
- POST /register - register a user
- POST /login - login a user
- GET /user - get all user details
- PUT /user/:id - update user details
- POST /url - create a short url
- GET /viewurl - view all short url created by user
- PUT /updateurl/:id - update short url or original url
- DELETE /deleteurl/:id - delete short url
- GET /:shorturl - redirecting short url
