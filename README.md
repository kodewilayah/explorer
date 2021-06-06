# kodewilayah
Curated reference for Indonesian region codes

This project consists of:
1. Raw/semi-raw data (PDFs, pre-sanitised CSVs) with sanitiser scripts
2. Scripts for scraping public data sources (i.e. BPS)
3. Sanitised data, checked in to source
4. A public website for browsing the sanitised data, hosted at [https://kodewilayah.id]

Technical goals:
1. Static files only, there should be no server-side component
2. Each data source should be independent, with "bridges" to connect data sources
   (kind of like linked data)
