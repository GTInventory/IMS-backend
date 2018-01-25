IMS-backend
====

Backend services for the GT Inventory Management System.

### Using the API

The API is available at https://ims-backend.mybluemix.net/

### Contributing

To install the dependencies, run 

```
npm install -g typescript
npm install
```

Now you should be able to run ```tsc -w``` to regenerate the JS files in ```build/```. The ```.ts``` files are transpiled to JavaScript in ```build/``. 

Use ```npm start``` to start running ```build/index.js```. 

Note: the backend expects a PostgreSQL database connection URL to be present in the ```DATABASE_URL``` environment variable in order to establish a connection.