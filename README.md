# Node.js-REST-API-TOB-

# Link to deployed application on Heroku
	https://tob-rest-api.herokuapp.com/
	https://tob-rest-api.herokuapp.com/user/:id (eg. /user/1)

# Install dependencies
	npm install
	yarn install

# Run
	node server.js

# Run in development
	nodemon server.js

# To Docker-ize this API
	docker-compose -f "docker-compose.yml" up -d --build
	
	or
	
	docker build -t {username}/{imageName} .
	docker run -p 80:80 {username}/{imageName}
	
