# Simple Price List Importer
This is the most basic Price List Importer. This will only update the "Price" value for records.

## Instructions
1. Run ```npm install``` in the directory to fetch packages
2. Update ```.env``` with your BigCommerce API Token credentials
3. Drag your CSV file into this directory, and then update the ```CSVFILE``` variable in ```app.js```
4. In the terminal, run ```node app.js```
5. Browse to ```http://localhost:8080/importrecords``` in your browser to start the import.