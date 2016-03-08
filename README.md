Visualizing Github with d3 treemap + threejs
===========
Davidson Zheng

This project tries to show a 2d and 3d visualization of commits of contributors in the top n projects(or repositories)
in the top n languages that have projects with star counts over 5000.

## Dataset:
- a lightweight sample dataset created manually
- a medium dataset with 10 projects in JavaScript and Ruby
- a large dataset with 6 projects each of top 10 languages, one being CSS 

## Usage:
- Open .html files with web browser, preferrably Chrome
- run data_extractor.py to generate a json file with github data (need to apply your own Github token before running)